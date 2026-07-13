import { useEffect, useMemo, useState } from 'react';
import { analogies, interestOptions, lessonSteps, onboarding, starterPseudo, starterPython } from './content.js';
import { traceProgram } from './interpreter.js';

const defaultProfile = {
  learningNotes: [], interests: ['space'], learningStyle: 'try', focusLength: '10', motion: 'some',
  feedback: 'trace', track: 'coding', theme: 'ocean', font: 'standard', fontSize: 100,
  plainMode: false, sound: false, darkMode: false, xp: 120, streak: 3,
};

function loadProfile() {
  try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem('versed-profile')) }; } catch { return defaultProfile; }
}

function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [screen, setScreen] = useState(() => localStorage.getItem('versed-welcomed') ? 'home' : 'onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [lessonStep, setLessonStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('versed-profile', JSON.stringify(profile)); }, [profile]);
  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }));

  if (screen === 'onboarding') {
    return <Onboarding profile={profile} updateProfile={updateProfile} step={onboardingStep} setStep={setOnboardingStep} onFinish={() => { localStorage.setItem('versed-welcomed', 'yes'); setScreen('home'); }} />;
  }

  return <div className={`app theme-${profile.theme} font-${profile.font} ${profile.darkMode ? 'dark-mode' : ''}`} style={{ '--font-scale': `${profile.fontSize}%` }}>
    <Header profile={profile} setScreen={setScreen} onSettings={() => setSettingsOpen(true)} onToggleDarkMode={() => updateProfile({ darkMode: !profile.darkMode })} />
    {screen === 'home' && <Dashboard profile={profile} setScreen={setScreen} />}
    {screen === 'lesson' && <Lesson profile={profile} lessonStep={lessonStep} setLessonStep={setLessonStep} setScreen={setScreen} />}
    {screen === 'playground' && <Playground profile={profile} />}
    {screen === 'map' && <LearningMap setScreen={setScreen} />}
    {settingsOpen && <Settings profile={profile} updateProfile={updateProfile} close={() => setSettingsOpen(false)} />}
  </div>;
}

function Header({ profile, setScreen, onSettings, onToggleDarkMode }) {
  return <header className="topbar">
    <button className="brand" onClick={() => setScreen('home')} aria-label="Versed home"><span className="brand-mark">V</span><span>versed</span></button>
    <nav aria-label="Main navigation"><button onClick={() => setScreen('home')}>Today</button><button onClick={() => setScreen('map')}>Learning map</button><button onClick={() => setScreen('playground')}>Playground</button></nav>
    <div className="status"><span className="streak" title="Your current learning streak">{profile.streak} day streak</span><span className="xp">{profile.xp} XP</span><button className="mode-toggle" title="Toggle dark mode" aria-label="Toggle dark mode" aria-pressed={profile.darkMode} onClick={onToggleDarkMode}><span className="mode-indicator" aria-hidden="true" /><span>{profile.darkMode ? 'Dark' : 'Light'}</span></button><button className="icon-button" title="Open My Settings" onClick={onSettings} aria-label="Open My Settings">Settings</button></div>
  </header>;
}

function Onboarding({ profile, updateProfile, step, setStep, onFinish }) {
  const question = onboarding[step];
  const value = profile[question.id];
  const select = (option) => {
    if (question.type === 'multi' || question.type === 'interests') {
      const next = value.includes(option) ? value.filter((item) => item !== option) : [...value, option];
      updateProfile({ [question.id]: next });
    } else updateProfile({ [question.id]: option });
  };
  const canAdvance = question.type === 'multi' || question.type === 'interests' ? value.length > 0 : Boolean(value);
  return <main className="onboarding-shell">
    <section className="onboarding-copy"><button className="brand plain-brand" onClick={() => setStep(0)}><span className="brand-mark">V</span><span>versed</span></button><p className="eyebrow">A learning space made for your brain</p><h1>Learn it your way.</h1><p>We will shape this space around what helps you focus, explore, and keep going.</p><div className="quiet-note"><span>Control stays with you</span><small>Change any answer later in My Settings.</small></div></section>
    <section className="question-card" aria-live="polite"><div className="progress-label"><span>{question.eyebrow}</span><span>{Math.round(((step + 1) / onboarding.length) * 100)}%</span></div><div className="progress-track"><i style={{ width: `${((step + 1) / onboarding.length) * 100}%` }} /></div><h2>{question.title}</h2>{question.subtitle && <p className="subtitle">{question.subtitle}</p>}
      {question.type === 'interests' ? <div className="choice-grid interests">{interestOptions.map(([id, label]) => <Choice key={id} label={label} selected={value.includes(id)} onClick={() => select(id)} />)}</div> : <div className={`choice-grid ${question.type === 'theme' ? 'themes' : ''}`}>{question.options.map(([id, label]) => <Choice key={id} label={label} selected={value === id || Array.isArray(value) && value.includes(id)} onClick={() => select(id)} className={question.type === 'theme' ? `theme-choice ${id}` : ''} />)}</div>}
      <div className="onboarding-actions"><button className="text-button" onClick={() => setStep(Math.max(0, step - 1))} disabled={!step}>Back</button><button className="primary" disabled={!canAdvance} onClick={() => step === onboarding.length - 1 ? onFinish() : setStep(step + 1)}>{step === onboarding.length - 1 ? 'Start exploring' : 'Continue'}</button></div>
    </section>
  </main>;
}

function Choice({ label, selected, onClick, className = '' }) { return <button className={`choice ${selected ? 'selected' : ''} ${className}`} onClick={onClick}><span>{label}</span>{selected && <b>Selected</b>}</button>; }

function Dashboard({ profile, setScreen }) {
  const interest = profile.interests[0] || 'space';
  const subject = profile.track === 'math' ? 'Math' : 'Coding';
  return <main className="page dashboard"><section className="welcome"><div><p className="eyebrow">Your next small win</p><h1>Ready when you are.</h1><p>Today is a {profile.focusLength}-minute {subject.toLowerCase()} session. You decide the pace.</p><button className="primary" onClick={() => setScreen('lesson')}>Start today&apos;s lesson</button></div><div className="today-meter"><span>Today</span><strong>0 / {profile.focusLength} min</strong><div className="meter"><i /></div><small>One gentle session is plenty.</small></div></section>
    <section className="agenda"><div className="section-heading"><div><p className="eyebrow">A clear path</p><h2>Today&apos;s plan</h2></div><span className="duration">About {profile.focusLength} min</span></div><div className="agenda-steps">{lessonSteps.map((item, index) => <div className={index === 0 ? 'agenda-item active' : 'agenda-item'} key={item}><span>{index + 1}</span><div><strong>{item}</strong><small>{['See instructions become a program', 'Meet variables', 'Run and trace your code', 'Make a score counter'][index]}</small></div></div>)}</div></section>
    <section className="two-column"><div className="lesson-card"><p className="eyebrow">Coding path · Unit 1</p><h2>Programs give clear instructions</h2><p>Make a tiny {interest}-themed score counter, then watch the computer follow it one line at a time.</p><button className="secondary" onClick={() => setScreen('lesson')}>Continue lesson</button></div><div className="progress-card"><p className="eyebrow">Your momentum</p><div className="progress-number"><strong>1</strong><span>lesson ready to explore</span></div><div className="badge-row"><span>First steps</span><span>Curious mind</span></div></div></section>
  </main>;
}

function Lesson({ profile, lessonStep, setLessonStep, setScreen }) {
  const details = [
    { title: 'Warm-up: computers are very literal', body: 'A program is a list of instructions. The computer follows each one in order, exactly as written.', action: 'I get it' },
    { title: 'New idea: variables hold values', body: `Think of a variable as ${getAnalogy(profile, 'variable')}. It has a name, and the program can look inside it later.`, action: 'Try it in the playground' },
    { title: 'Playground: follow the score', body: 'Run the starter program. Use the tracer to see score change from 0 to 1.', action: 'Open playground' },
    { title: 'Challenge: make the score grow', body: 'Change the program so score increases by 5. There is no rush. Trace each change when you are ready.', action: 'Finish for now' },
  ][lessonStep];
  const next = () => { if (lessonStep === 1 || lessonStep === 2) { setScreen('playground'); return; } if (lessonStep === 3) { setScreen('home'); return; } setLessonStep(lessonStep + 1); };
  return <main className="page lesson-page"><LessonNav step={lessonStep} setScreen={setScreen} /><section className="lesson-main"><p className="eyebrow">Unit 1 · {lessonSteps[lessonStep]}</p><h1>{details.title}</h1><p className="lesson-body">{details.body}</p><div className="lesson-visual"><div className="instruction-row"><span>1</span><p>Put <b>0</b> into <b>score</b></p></div><div className="instruction-row active"><span>2</span><p>Add <b>1</b> to <b>score</b></p></div><div className="instruction-row"><span>3</span><p>Show <b>score</b></p></div><div className="value-box"><small>score</small><strong>1</strong></div></div><div className="lesson-actions"><button className="text-button" onClick={() => setLessonStep(Math.max(0, lessonStep - 1))} disabled={!lessonStep}>Previous</button><button className="primary" onClick={next}>{details.action}</button></div></section><ConfusionBox profile={profile} /></main>;
}

function LessonNav({ step, setScreen }) { return <aside className="lesson-nav"><button className="back-link" onClick={() => setScreen('home')}>Back to today</button><p className="eyebrow">Today&apos;s plan</p>{lessonSteps.map((item, index) => <div key={item} className={`lesson-nav-item ${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`}><span>{index < step ? 'Done' : index + 1}</span>{item}</div>)}<div className="timer-card"><small>Take your time</small><strong>0:00</strong><p>Your place is saved as you go.</p></div></aside>; }

function Playground({ profile }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(starterPython);
  const [trace, setTrace] = useState(() => traceProgram(starterPython, 'python'));
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);
  const current = step >= 0 ? trace.steps[step] : { variables: {}, output: [], line: 0, explanation: 'Press Run, then Step through to watch the program follow each instruction.' };
  useEffect(() => { if (!auto || step >= trace.steps.length - 1) return undefined; const timer = setTimeout(() => setStep((value) => value + 1), 750); return () => clearTimeout(timer); }, [auto, step, trace.steps.length]);
  const setMode = (next) => { setLanguage(next); const nextCode = next === 'python' ? starterPython : starterPseudo; setCode(nextCode); setTrace(traceProgram(nextCode, next)); setStep(-1); setAuto(false); };
  const run = () => { const result = traceProgram(code, language); setTrace(result); setStep(result.steps.length ? 0 : -1); setAuto(false); };
  const move = (amount) => { setAuto(false); setStep((value) => Math.min(Math.max(-1, value + amount), trace.steps.length - 1)); };
  return <main className="page playground-page"><div className="playground-heading"><div><p className="eyebrow">A friendly place to experiment</p><h1>Code playground</h1></div><div className="language-switch" role="group" aria-label="Choose language"><button className={language === 'python' ? 'active' : ''} onClick={() => setMode('python')}>Python</button><button className={language === 'pseudo' ? 'active' : ''} onClick={() => setMode('pseudo')}>Pseudocode</button></div></div><section className="playground-grid"><div className="editor-panel"><div className="panel-head"><span>Starter program</span><button className="run-button" onClick={run}>Run program</button></div><div className="editor-wrap"><div className="line-numbers">{code.split('\n').map((_, i) => <span className={current.line === i + 1 ? 'current-line' : ''} key={i}>{i + 1}</span>)}</div><textarea aria-label="Code editor" value={code} spellCheck="false" onChange={(event) => { setCode(event.target.value); setAuto(false); setStep(-1); }} /></div>{trace.error && <div className="gentle-error">Let&apos;s trace it together: {trace.error}</div>}<div className="output"><span>Output</span><code>{current.output.length ? current.output.join('\n') : 'Your program output will appear here.'}</code></div></div><Tracer profile={profile} trace={trace} current={current} step={step} onMove={move} auto={auto} setAuto={setAuto} /></section><ConfusionBox profile={profile} context="program" /></main>;
}

function Tracer({ profile, trace, current, step, onMove, auto, setAuto }) { const variableEntries = Object.entries(current.variables); return <aside className="tracer-panel"><div className="panel-head"><span>Step tracer</span><span className="trace-status">{trace.steps.length ? `${Math.max(step + 1, 0)} of ${trace.steps.length}` : 'Ready'}</span></div><div className="tracer-scene"><div className="tracer-buddy"><span>V</span></div><div className="trace-road" /><p>{step >= 0 ? `Following line ${current.line}` : 'Waiting at the first instruction'}</p></div><div className="trace-controls"><button className="icon-button" title="Step back" aria-label="Step back" onClick={() => onMove(-1)} disabled={step < 0}>Back</button><button className="primary compact" onClick={() => onMove(1)} disabled={step >= trace.steps.length - 1}>Step</button><button className={`icon-button ${auto ? 'pressed' : ''}`} title="Automatically play steps" onClick={() => setAuto(!auto)} disabled={!trace.steps.length}>{auto ? 'Pause' : 'Play'}</button></div><div className="explanation"><p className="eyebrow">Explain this step</p><p>{current.explanation}</p><button className="text-button">Try another explanation</button></div><div className="variables"><p className="eyebrow">Live variables</p>{variableEntries.length ? variableEntries.map(([name, value]) => <div className="variable" key={name}><span>{name}</span><strong>{value}</strong></div>) : <p className="empty-state">Variables will appear here as the program runs.</p>}</div></aside>; }

function ConfusionBox({ profile, context = 'variables' }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState(''); const [answer, setAnswer] = useState('');
  const help = () => { const mode = profile.plainMode ? 'literally' : `using ${profile.interests[0] || 'your chosen'} examples`; setAnswer(`Let’s make it smaller. A variable is ${getAnalogy(profile, 'variable')}. In this ${context}, the name tells the computer where to look, and the value is what it finds there. Want to try changing just one value and tracing it ${mode}?`); };
  return <aside className={`confusion ${open ? 'open' : ''}`}><button className="confusion-toggle" onClick={() => setOpen(!open)}>Something confusing?</button>{open && <div className="confusion-dialog"><p className="eyebrow">Let&apos;s untangle it</p><h2>Tell me what feels fuzzy.</h2><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="For example: I do not get why score changes." /><button className="primary compact" onClick={help} disabled={!message.trim()}>Help me understand</button>{answer && <div className="tutor-answer"><p>{answer}</p><div><button onClick={() => setAnswer('Great. That question helped us find the next small step.')}>That helped</button><button onClick={help}>Still fuzzy</button></div></div>}</div>}</aside>;
}

function Settings({ profile, updateProfile, close }) { return <div className="modal-backdrop" role="presentation"><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-head"><div><p className="eyebrow">Always under your control</p><h2 id="settings-title">My Settings</h2></div><button className="icon-button" onClick={close}>Close</button></div><div className="settings-list"><label><span>Color theme</span><select value={profile.theme} onChange={(event) => updateProfile({ theme: event.target.value })}><option value="ocean">Calm ocean</option><option value="space">Night space</option><option value="pastel">Soft pastel</option><option value="contrast">High contrast</option><option value="arcade">Retro arcade</option></select></label><label className="toggle-row"><span>Dark mode</span><input type="checkbox" checked={profile.darkMode} onChange={(event) => updateProfile({ darkMode: event.target.checked })} /></label><label><span>Reading style</span><select value={profile.font} onChange={(event) => updateProfile({ font: event.target.value })}><option value="standard">Standard</option><option value="lexend">Easy-reading</option></select></label><label><span>Text size</span><input type="range" min="90" max="125" value={profile.fontSize} onChange={(event) => updateProfile({ fontSize: event.target.value })} /></label><label className="toggle-row"><span>Plain, literal explanations</span><input type="checkbox" checked={profile.plainMode} onChange={(event) => updateProfile({ plainMode: event.target.checked })} /></label><label className="toggle-row"><span>Gentle sound feedback</span><input type="checkbox" checked={profile.sound} onChange={(event) => updateProfile({ sound: event.target.checked })} /></label></div></section></div>; }

function LearningMap({ setScreen }) { const units = ['Programs', 'Variables', 'Input / output', 'Conditions', 'Loops', 'Functions', 'Lists', 'Debugging']; return <main className="page map-page"><p className="eyebrow">Coding path</p><h1>Your learning map</h1><p className="map-intro">The whole path is visible. You are right here, and you can explore in your own order.</p><div className="map-road">{units.map((unit, index) => <button onClick={() => index === 0 && setScreen('lesson')} className={`map-node ${index === 0 ? 'current' : ''}`} key={unit}><span>{index + 1}</span><strong>{unit}</strong><small>{index === 0 ? 'Start here' : 'Coming up'}</small></button>)}</div></main>; }

function getAnalogy(profile, concept) { if (profile.plainMode) return analogies.plain[concept]; return (analogies[profile.interests[0]] || analogies.plain)[concept]; }

export default App;
