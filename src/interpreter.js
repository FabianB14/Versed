const identifier = '[a-zA-Z_]\\w*';

function expressionValue(raw, variables) {
  const source = raw.trim().replace(/;$/, '');
  if (/^-?\d+(\.\d+)?$/.test(source)) return Number(source);
  if (/^".*"$/.test(source) || /^'.*'$/.test(source)) return source.slice(1, -1);
  const binary = source.match(new RegExp(`^(${identifier}|-?\\d+)\\s*([+\\-*/])\\s*(${identifier}|-?\\d+)$`));
  if (binary) {
    const left = expressionValue(binary[1], variables);
    const right = expressionValue(binary[3], variables);
    if (binary[2] === '+') return left + right;
    if (binary[2] === '-') return left - right;
    if (binary[2] === '*') return left * right;
    if (right === 0) throw new Error('This step would divide by zero. Try a different value.');
    return left / right;
  }
  if (new RegExp(`^${identifier}$`).test(source)) return variables[source] ?? 0;
  throw new Error('Try a number, a variable name, or a simple calculation using +, -, *, or /.');
}

function comparisonValue(raw, variables) {
  const condition = raw.trim().replace(/:$/, '').replace(/\)\s*\{$/, '').replace(/^\(/, '');
  const match = condition.match(new RegExp(`^(.+?)\\s*(===|==|>=|<=|>|<)\\s*(.+)$`));
  if (!match) throw new Error('This condition needs a comparison such as score > 3.');
  const left = expressionValue(match[1], variables);
  const right = expressionValue(match[3], variables);
  return { result: ({ '===': left === right, '==': left === right, '>': left > right, '<': left < right, '>=': left >= right, '<=': left <= right })[match[2]], text: `${left} ${match[2]} ${right}` };
}

function addStep(steps, line, variables, output, explanation) {
  steps.push({ line, variables: { ...variables }, output: [...output], explanation });
}

function executeSimple(text, line, language, variables, output, steps) {
  const normalized = text.replace(/;$/, '').trim();
  const assignment = language === 'cpp'
    ? normalized.match(new RegExp(`^(?:int|double|float|long|string|bool)\\s+(${identifier})\\s*=\\s*(.+)$`)) || normalized.match(new RegExp(`^(${identifier})\\s*=\\s*(.+)$`))
    : normalized.match(new RegExp(`^(${identifier})\\s*=\\s*(.+)$`));
  const pseudoSet = normalized.match(new RegExp(`^SET\\s+(${identifier})\\s+TO\\s+(.+)$`, 'i'));
  const pseudoAdd = normalized.match(new RegExp(`^ADD\\s+(.+)\\s+TO\\s+(${identifier})$`, 'i'));
  const print = language === 'python' ? normalized.match(/^print\((.+)\)$/) : null;
  const cppPrint = language === 'cpp' ? normalized.match(/^(?:std::)?cout\s*<<\s*(.+?)(?:\s*<<\s*(?:std::)?endl)?$/) : null;
  const display = language === 'pseudo' ? normalized.match(/^DISPLAY\s+(.+)$/i) : null;

  if (assignment) {
    variables[assignment[1]] = expressionValue(assignment[2], variables);
    addStep(steps, line, variables, output, `The program puts ${variables[assignment[1]]} into ${assignment[1]}.`);
  } else if (pseudoSet) {
    variables[pseudoSet[1]] = expressionValue(pseudoSet[2], variables);
    addStep(steps, line, variables, output, `The program sets ${pseudoSet[1]} to ${variables[pseudoSet[1]]}.`);
  } else if (pseudoAdd) {
    variables[pseudoAdd[2]] = (variables[pseudoAdd[2]] ?? 0) + expressionValue(pseudoAdd[1], variables);
    addStep(steps, line, variables, output, `${pseudoAdd[2]} is now ${variables[pseudoAdd[2]]}.`);
  } else if (print || cppPrint || display) {
    const value = expressionValue((print || cppPrint || display)[1], variables);
    output.push(String(value));
    addStep(steps, line, variables, output, `The program shows ${value} in the output.`);
  } else {
    throw new Error(`Line ${line} is not part of this learning tracer yet. Use variables, calculations, output, loops, or simple conditions.`);
  }
}

function pythonBlock(lines, start, indent, variables, output, steps) {
  let index = start;
  while (index < lines.length) {
    const raw = lines[index];
    const text = raw.trim();
    const line = index + 1;
    const currentIndent = raw.match(/^\s*/)[0].length;
    if (!text || text.startsWith('#')) { index += 1; continue; }
    if (currentIndent < indent) break;
    if (currentIndent > indent) { index += 1; continue; }
    const loop = text.match(new RegExp(`^for\\s+(${identifier})\\s+in\\s+range\\((.+)\\):$`));
    const conditional = text.match(/^if\s+(.+):$/);
    if (loop) {
      const count = expressionValue(loop[2], variables);
      const bodyStart = index + 1;
      const bodyIndent = lines[bodyStart]?.match(/^\s*/)[0].length ?? indent + 2;
      let bodyEnd = bodyStart;
      while (bodyEnd < lines.length && (!lines[bodyEnd].trim() || lines[bodyEnd].match(/^\s*/)[0].length > indent)) bodyEnd += 1;
      for (let turn = 0; turn < count; turn += 1) {
        variables[loop[1]] = turn;
        addStep(steps, line, variables, output, `Loop lap ${turn + 1} of ${count}. ${loop[1]} is ${turn}.`);
        pythonBlock(lines.slice(bodyStart, bodyEnd), 0, bodyIndent - indent, variables, output, steps);
      }
      index = bodyEnd;
    } else if (conditional) {
      const check = comparisonValue(conditional[1], variables);
      addStep(steps, line, variables, output, `${check.text} is ${check.result ? 'true' : 'false'}, so the program ${check.result ? 'uses' : 'skips'} this path.`);
      const bodyStart = index + 1;
      const bodyIndent = lines[bodyStart]?.match(/^\s*/)[0].length ?? indent + 2;
      let bodyEnd = bodyStart;
      while (bodyEnd < lines.length && (!lines[bodyEnd].trim() || lines[bodyEnd].match(/^\s*/)[0].length > indent)) bodyEnd += 1;
      if (check.result) pythonBlock(lines.slice(bodyStart, bodyEnd), 0, bodyIndent - indent, variables, output, steps);
      index = bodyEnd;
    } else {
      executeSimple(text, line, 'python', variables, output, steps);
      index += 1;
    }
  }
}

function pseudoBlock(lines, start, variables, output, steps) {
  let index = start;
  while (index < lines.length) {
    const text = lines[index].trim();
    const line = index + 1;
    if (!text || text.startsWith('//')) { index += 1; continue; }
    if (/^END\s+REPEAT$/i.test(text)) return index + 1;
    const loop = text.match(/^REPEAT\s+(.+)\s+TIMES$/i);
    if (loop) {
      const count = expressionValue(loop[1], variables);
      let bodyEnd = index + 1;
      let depth = 1;
      while (bodyEnd < lines.length && depth) { if (/^REPEAT\s+/i.test(lines[bodyEnd].trim())) depth += 1; if (/^END\s+REPEAT$/i.test(lines[bodyEnd].trim())) depth -= 1; bodyEnd += 1; }
      for (let turn = 0; turn < count; turn += 1) {
        addStep(steps, line, variables, output, `Loop lap ${turn + 1} of ${count}.`);
        pseudoBlock(lines.slice(index + 1, bodyEnd - 1), 0, variables, output, steps);
      }
      index = bodyEnd;
    } else { executeSimple(text, line, 'pseudo', variables, output, steps); index += 1; }
  }
  return index;
}

function cppBlock(lines, start, variables, output, steps) {
  let index = start;
  while (index < lines.length) {
    const text = lines[index].trim();
    const line = index + 1;
    if (!text || text.startsWith('//') || text.startsWith('#include') || text.startsWith('using ')) { index += 1; continue; }
    if (text === '}' || text === '};') return index + 1;
    const loop = text.match(new RegExp(`^for\\s*\\(\\s*int\\s+(${identifier})\\s*=\\s*(.+);\\s*\\1\\s*<\\s*(.+);\\s*\\1\\+\\+\\s*\\)\\s*\\{$`));
    const conditional = text.match(/^if\s*\((.+)\)\s*\{$/);
    if (loop) {
      const begin = expressionValue(loop[2], variables);
      const end = expressionValue(loop[3], variables);
      let bodyEnd = index + 1;
      let depth = 1;
      while (bodyEnd < lines.length && depth) { if (lines[bodyEnd].includes('{')) depth += 1; if (lines[bodyEnd].trim() === '}') depth -= 1; bodyEnd += 1; }
      for (let turn = begin; turn < end; turn += 1) {
        variables[loop[1]] = turn;
        addStep(steps, line, variables, output, `Loop lap ${turn - begin + 1} of ${end - begin}. ${loop[1]} is ${turn}.`);
        cppBlock(lines.slice(index + 1, bodyEnd - 1), 0, variables, output, steps);
      }
      index = bodyEnd;
    } else if (conditional) {
      const check = comparisonValue(conditional[1], variables);
      addStep(steps, line, variables, output, `${check.text} is ${check.result ? 'true' : 'false'}, so the program ${check.result ? 'uses' : 'skips'} this path.`);
      let bodyEnd = index + 1;
      while (bodyEnd < lines.length && lines[bodyEnd].trim() !== '}') bodyEnd += 1;
      if (check.result) cppBlock(lines.slice(index + 1, bodyEnd), 0, variables, output, steps);
      index = bodyEnd + 1;
    } else { executeSimple(text, line, 'cpp', variables, output, steps); index += 1; }
  }
  return index;
}

export function traceProgram(code, language) {
  const variables = {};
  const output = [];
  const steps = [];
  const lines = code.split('\n');
  try {
    if (language === 'python') pythonBlock(lines, 0, 0, variables, output, steps);
    else if (language === 'cpp') cppBlock(lines, 0, variables, output, steps);
    else pseudoBlock(lines, 0, variables, output, steps);
    return { steps, error: null };
  } catch (error) {
    return { steps, error: error.message };
  }
}
