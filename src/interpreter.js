const expressionValue = (raw, variables) => {
  const source = raw.trim();
  if (/^[-]?\d+(\.\d+)?$/.test(source)) return Number(source);
  const plus = source.match(/^([a-zA-Z_]\w*|[-]?\d+)\s*\+\s*([a-zA-Z_]\w*|[-]?\d+)$/);
  if (plus) return expressionValue(plus[1], variables) + expressionValue(plus[2], variables);
  const minus = source.match(/^([a-zA-Z_]\w*|[-]?\d+)\s*-\s*([a-zA-Z_]\w*|[-]?\d+)$/);
  if (minus) return expressionValue(minus[1], variables) - expressionValue(minus[2], variables);
  if (/^[a-zA-Z_]\w*$/.test(source)) return variables[source] ?? 0;
  throw new Error('I could not read that value yet. Try a number, a variable name, or a simple addition.');
};

const addStep = (steps, line, variables, output, explanation) => {
  steps.push({ line, variables: { ...variables }, output: [...output], explanation });
};

export function traceProgram(code, language) {
  const variables = {};
  const output = [];
  const steps = [];
  const lines = code.split('\n');
  try {
    lines.forEach((raw, index) => {
      const line = index + 1;
      const text = raw.trim();
      if (!text || text.startsWith('#') || text.startsWith('//')) return;
      if (language === 'python') {
        const assign = text.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
        const print = text.match(/^print\((.+)\)$/);
        if (assign) {
          variables[assign[1]] = expressionValue(assign[2], variables);
          addStep(steps, line, variables, output, `The program puts ${variables[assign[1]]} into ${assign[1]}.`);
        } else if (print) {
          const value = expressionValue(print[1], variables);
          output.push(String(value));
          addStep(steps, line, variables, output, `The program shows ${value} in the output.`);
        } else throw new Error(`Line ${line} needs a simple assignment or print statement for this first tracer.`);
      } else {
        const set = text.match(/^SET\s+([a-zA-Z_]\w*)\s+TO\s+(.+)$/i);
        const add = text.match(/^ADD\s+(.+)\s+TO\s+([a-zA-Z_]\w*)$/i);
        const display = text.match(/^DISPLAY\s+(.+)$/i);
        if (set) {
          variables[set[1]] = expressionValue(set[2], variables);
          addStep(steps, line, variables, output, `The program sets ${set[1]} to ${variables[set[1]]}.`);
        } else if (add) {
          variables[add[2]] = (variables[add[2]] ?? 0) + expressionValue(add[1], variables);
          addStep(steps, line, variables, output, `The program adds to ${add[2]}, which is now ${variables[add[2]]}.`);
        } else if (display) {
          const value = expressionValue(display[1], variables);
          output.push(String(value));
          addStep(steps, line, variables, output, `The program displays ${value}.`);
        } else throw new Error(`Line ${line} needs SET, ADD, or DISPLAY for this first tracer.`);
      }
    });
    return { steps, error: null };
  } catch (error) {
    return { steps, error: error.message };
  }
}
