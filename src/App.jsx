import { useEffect, useState } from 'react';
import { analogies, interestOptions, lessonSteps, levelOptions, onboarding, starterPrograms } from './content.js';
import { traceProgram } from './interpreter.js';

const defaultProfile = {
  name: '', learningNotes: [], interests: ['space'], learningStyle: 'try', focusLength: '10', motion: 'some',
  feedback: 'trace', track: 'coding', theme: 'ocean', font: 'standard', fontSize: 100, level: 'beginner',
  pathway: 'blended', readingPreference: 'standard', codingExperience: 'never', plainMode: false, sound: false,
  darkMode: false, xp: 120, streak: 3,
};

const defaultSession = {
  lessonStep: 0,
  elapsedSeconds: 0,
  timerRunning: false,
  playgroundComplete: false,
  completed: false,
};

function derivePathway(notes = []) {
  const selected = notes.filter((note) => ['autism', 'adhd', 'dyslexia', 'dyscalculia'].includes(note));
  return notes.includes('none') || notes.includes('private') || notes.includes('multiple') || selected.length !== 1 ? 'blended' : selected[0];
}

function getPathwayLabel(pathway) {
  return { autism: 'Structured', adhd: 'Momentum', dyslexia: 'Readable', dyscalculia: 'Concrete', blended: 'Blended' }[pathway] || 'Blended';
}

function levelFromExperience(experience) {
  return experience === 'some' ? 'intermediate' : experience === 'lots' ? 'advanced' : 'beginner';
}

function loadProfile() {
  try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem('versed-profile')) }; } catch { return defaultProfile; }
}

function loadSession() {
  try { return { ...defaultSession, ...JSON.parse(localStorage.getItem('versed-session')) }; } catch { return defaultSession; }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function hasStartedSession(session) {
  return session.timerRunning || session.elapsedSeconds > 0 || session.lessonStep > 0 || session.playgroundComplete;
}

function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [session, setSession] = useState(loadSession);
  const [screen, setScreen] = useState(() => localStorage.getItem('versed-welcomed') ? 'home' : 'onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('versed-profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('versed-session', JSON.stringify(session)); }, [session]);
  useEffect(() => {
    if (!session.timerRunning) return undefined;
    const timer = setInterval(() => setSession((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 })), 1000);
    return () => clearInterval(timer);
  }, [session.timerRunning]);

  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }));
  const setLessonStep = (lessonStep) => setSession((current) => ({ ...current, lessonStep }));
  const startLesson = () => {
    setSession((current) => current.completed ? { ...defaultSession, timerRunning: true } : { ...current, timerRunning: true });
    setScreen('lesson');
  };
  const toggleTimer = () => setSession((current) => ({ ...current, timerRunning: !current.timerRunning }));
  const openPlayground = () => {
    setSession((current) => ({ ...current, lessonStep: 2 }));
    setScreen('playground');
  };
  const markProgramRun = () => setSession((current) => current.lessonStep === 2 ? { ...current, playgroundComplete: true } : current);
  const continueFromPlayground = () => {
    setSession((current) => ({ ...current, lessonStep: 3 }));
    setScreen('lesson');
  };
  const finishLesson = () => {
    setSession((current) => ({ ...current, completed: true, timerRunning: false, lessonStep: 3 }));
    updateProfile({ xp: profile.xp + 10 });
    setScreen('home');
  };
  const resetProfile = () => {
    localStorage.removeItem('versed-profile');
    localStorage.removeItem('versed-session');
    localStorage.removeItem('versed-welcomed');
    setProfile({ ...defaultProfile });
    setSession({ ...defaultSession });
    setOnboardingStep(0);
    setSettingsOpen(false);
    setScreen('onboarding');
  };

  if (screen === 'onboarding') {
    return <Onboarding profile={profile} updateProfile={updateProfile} step={onboardingStep} setStep={setOnboardingStep} onFinish={() => { localStorage.setItem('versed-welcomed', 'yes'); setScreen('home'); }} />;
  }

  return <div className={`app theme-${profile.theme} font-${profile.font} ${profile.darkMode ? 'dark-mode' : ''}`} style={{ '--font-scale': `${profile.fontSize}%` }}>
    <Header profile={profile} setScreen={setScreen} onSettings={() => setSettingsOpen(true)} onToggleDarkMode={() => updateProfile({ darkMode: !profile.darkMode })} />
    {screen === 'home' && <Dashboard profile={profile} session={session} updateProfile={updateProfile} onStartLesson={startLesson} onToggleTimer={toggleTimer} />}
    {screen === 'lesson' && <Lesson profile={profile} session={session} setLessonStep={setLessonStep} setScreen={setScreen} onOpenPlayground={openPlayground} onFinishLesson={finishLesson} onToggleTimer={toggleTimer} />}
    {screen === 'playground' && <Playground profile={profile} session={session} updateProfile={updateProfile} onProgramRun={markProgramRun} onContinueLesson={continueFromPlayground} onReturnToLesson={() => setScreen('lesson')} onStartLesson={startLesson} />}
    {screen === 'map' && <LearningMap profile={profile} setScreen={setScreen} />}
    {settingsOpen && <Settings profile={profile} updateProfile={updateProfile} close={() => setSettingsOpen(false)} onReset={resetProfile} />}
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
      const selected = value || [];
      const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
      updateProfile({ [question.id]: next, ...(question.id === 'learningNotes' ? { pathway: derivePathway(next) } : {}) });
    } else {
      updateProfile({ [question.id]: option, ...(question.id === 'readingPreference' && ['friendly', 'both'].includes(option) ? { font: 'lexend' } : {}), ...(question.id === 'codingExperience' ? { level: levelFromExperience(option) } : {}) });
    }
  };
  const canAdvance = question.type === 'multi' || question.type === 'interests' ? (value || []).length > 0 : question.type === 'text' ? Boolean(String(value || '').trim()) : Boolean(value);
  return <main className="onboarding-shell">
    <section className="onboarding-copy"><button className="brand plain-brand" onClick={() => setStep(0)}><span className="brand-mark">V</span><span>versed</span></button><p className="eyebrow">A learning space made for your brain</p><h1>Learn it your way.</h1><p>We will shape this space around what helps you focus, explore, and keep going.</p><div className="quiet-note"><span>Control stays with you</span><small>Change any answer later in My Settings.</small></div></section>
    <section className="question-card" aria-live="polite"><div className="progress-label"><span>{question.eyebrow}</span><span>{Math.round(((step + 1) / onboarding.length) * 100)}%</span></div><div className="progress-track"><i style={{ width: `${((step + 1) / onboarding.length) * 100}%` }} /></div><h2>{question.title}</h2>{question.subtitle && <p className="subtitle">{question.subtitle}</p>}
      {question.type === 'text' && <label className="name-field"><span>Name or nickname</span><input value={value || ''} onChange={(event) => updateProfile({ [question.id]: event.target.value })} placeholder={question.placeholder} autoComplete="given-name" autoFocus /></label>}
      {question.type === 'interests' && <div className="choice-grid interests">{interestOptions.map(([id, label]) => <Choice key={id} label={label} selected={(value || []).includes(id)} onClick={() => select(id)} />)}</div>}
      {question.type !== 'text' && question.type !== 'interests' && <div className={`choice-grid ${question.type === 'theme' ? 'themes' : ''}`}>{question.options.map(([id, label]) => <Choice key={id} label={label} selected={value === id || Array.isArray(value) && value.includes(id)} onClick={() => select(id)} className={question.type === 'theme' ? `theme-choice ${id}` : ''} />)}</div>}
      <div className="onboarding-actions"><button className="text-button" onClick={() => setStep(Math.max(0, step - 1))} disabled={!step}>Back</button><button className="primary" disabled={!canAdvance} onClick={() => step === onboarding.length - 1 ? onFinish() : setStep(step + 1)}>{step === onboarding.length - 1 ? 'Start exploring' : 'Continue'}</button></div>
    </section>
  </main>;
}

function Choice({ label, selected, onClick, className = '' }) { return <button className={`choice ${selected ? 'selected' : ''} ${className}`} onClick={onClick}><span>{label}</span>{selected && <b>Selected</b>}</button>; }

function Dashboard({ profile, session, updateProfile, onStartLesson, onToggleTimer }) {
  const interest = profile.interests[0] || 'space';
  const subject = profile.track === 'math' ? 'Math' : 'Coding';
  const pathway = profile.pathway || derivePathway(profile.learningNotes);
  const greeting = profile.name ? `, ${profile.name}` : '';
  const hasStarted = hasStartedSession(session);
  const goalSeconds = Number(profile.focusLength) * 60;
  const timeProgress = Math.min(100, session.elapsedSeconds / goalSeconds * 100);
  const mainAction = session.completed ? 'Start a new lesson' : hasStarted ? 'Continue today\'s lesson' : 'Start today\'s lesson';
  const timerLabel = session.completed ? 'Session complete' : session.timerRunning ? 'Timer running' : hasStarted ? 'Timer paused' : 'Ready when you are';
  const currentStep = session.completed ? 4 : session.lessonStep;
  return <main className="page dashboard"><section className="welcome"><div><div className="welcome-meta"><p className="eyebrow">Your next small win</p><span className="pathway-badge">{getPathwayLabel(pathway)} pathway</span></div><h1>Ready when you are{greeting}.</h1><p>Today is a {profile.focusLength}-minute {subject.toLowerCase()} session. You decide the pace.</p><button className="primary main-lesson-action" onClick={onStartLesson}>{mainAction}</button></div><div className="today-meter"><span>{timerLabel}</span><strong>{formatDuration(session.elapsedSeconds)} / {formatDuration(goalSeconds)}</strong><div className="meter"><i style={{ width: `${timeProgress}%` }} /></div><small>{session.completed ? 'You completed this lesson.' : hasStarted ? `Step ${currentStep + 1} of 4: ${lessonSteps[currentStep]}` : 'The timer starts when you begin.'}</small>{hasStarted && !session.completed && <button className="timer-control" onClick={onToggleTimer}>{session.timerRunning ? 'Pause timer' : 'Resume timer'}</button>}</div></section>
    <section className="agenda"><div className="section-heading"><div><p className="eyebrow">A clear path</p><h2>Today&apos;s plan</h2></div><span className="duration">{session.completed ? 'Completed' : `Step ${currentStep + 1} of 4`}</span></div><div className="agenda-steps">{lessonSteps.map((item, index) => <div className={`agenda-item ${session.completed || index < session.lessonStep ? 'done' : ''} ${!session.completed && index === session.lessonStep ? 'active' : ''}`} key={item}><span>{session.completed || index < session.lessonStep ? 'Done' : index + 1}</span><div><strong>{item}</strong><small>{['See instructions become a program', 'Meet variables', 'Run and trace your code', 'Make a score counter'][index]}</small></div></div>)}</div></section>
    <section className="level-section"><div className="section-heading"><div><p className="eyebrow">Choose your challenge</p><h2>Learning levels</h2></div><span className="duration">Current: {profile.level}</span></div><div className="level-grid">{levelOptions.map(([id, label, description]) => <button key={id} className={`level-card ${profile.level === id ? 'active' : ''}`} onClick={() => updateProfile({ level: id })}><span>{label}</span><small>{description}</small>{profile.level === id && <b>Selected</b>}</button>)}</div></section>
    <section className="two-column"><div className="lesson-card"><p className="eyebrow">Coding path - Unit 1</p><h2>{session.completed ? 'You completed today\'s lesson.' : 'Programs give clear instructions'}</h2><p>{session.completed ? 'Your progress is saved. Start a new session whenever you are ready.' : `Make a tiny ${interest}-themed score counter, then watch the computer follow it one line at a time.`}</p><button className="primary" onClick={onStartLesson}>{mainAction}</button></div><div className="progress-card"><p className="eyebrow">Your momentum</p><div className="progress-number"><strong>{session.completed ? 4 : currentStep + 1}</strong><span>{session.completed ? 'lesson complete' : 'of 4 lesson steps'}</span></div><div className="badge-row"><span>{session.timerRunning ? 'Timer running' : 'Progress saved'}</span><span>{profile.level} level</span></div></div></section>
  </main>;
}

function Lesson({ profile, session, setLessonStep, setScreen, onOpenPlayground, onFinishLesson, onToggleTimer }) {
  const lessonStep = session.lessonStep;
  const details = [
    { title: 'Warm-up: computers are very literal', body: 'A program is a list of instructions. The computer follows each one in order, exactly as written.', action: 'Continue to variables' },
    { title: 'New idea: variables hold values', body: `Think of a variable as ${getAnalogy(profile, 'variable')}. It has a name, and the program can look inside it later.`, action: 'Open step 3: playground' },
    { title: 'Playground: follow the score', body: 'Run a starter program, then use the tracer. Once it runs, a clear Continue to challenge button appears in the playground.', action: 'Open playground' },
    { title: 'Challenge: make the score grow', body: 'You ran a real program and traced its result. That is the full loop: understand, run, trace, then reflect.', action: 'Finish today\'s lesson' },
  ][lessonStep];
  const next = () => { if (lessonStep === 1 || lessonStep === 2) { onOpenPlayground(); return; } if (lessonStep === 3) { onFinishLesson(); return; } setLessonStep(lessonStep + 1); };
  return <main className="page lesson-page"><LessonNav step={lessonStep} session={session} setScreen={setScreen} onToggleTimer={onToggleTimer} /><section className="lesson-main"><p className="eyebrow">Step {lessonStep + 1} of 4 - {lessonSteps[lessonStep]}</p><h1>{details.title}</h1><p className="lesson-body">{details.body}</p><div className="flow-callout"><strong>Lesson flow</strong><span>Warm-up</span><i /> <span>Variables</span><i /> <span className={lessonStep === 2 ? 'flow-current' : ''}>Playground</span><i /> <span>Challenge</span></div><div className="lesson-visual"><div className="instruction-row"><span>1</span><p>Put <b>0</b> into <b>score</b></p></div><div className="instruction-row active"><span>2</span><p>Add <b>1</b> to <b>score</b></p></div><div className="instruction-row"><span>3</span><p>Show <b>score</b></p></div><div className="value-box"><small>score</small><strong>1</strong></div></div><div className="lesson-actions"><button className="text-button" onClick={() => setLessonStep(Math.max(0, lessonStep - 1))} disabled={!lessonStep}>Previous</button><button className="primary" onClick={next}>{details.action}</button></div></section><ConfusionBox profile={profile} /></main>;
}

function LessonNav({ step, session, setScreen, onToggleTimer }) { return <aside className="lesson-nav"><button className="back-link" onClick={() => setScreen('home')}>Back to today</button><p className="eyebrow">Today&apos;s plan</p>{lessonSteps.map((item, index) => <div key={item} className={`lesson-nav-item ${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`}><span>{index < step ? 'Done' : index + 1}</span>{item}</div>)}<div className="timer-card"><small>{session.timerRunning ? 'Session timer running' : 'Session timer paused'}</small><strong>{formatDuration(session.elapsedSeconds)}</strong><p>Your place is saved as you go.</p><button className="timer-control" onClick={onToggleTimer}>{session.timerRunning ? 'Pause timer' : 'Resume timer'}</button></div></aside>; }

function Playground({ profile, session, updateProfile, onProgramRun, onContinueLesson, onReturnToLesson, onStartLesson }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(starterPrograms[profile.level].python);
  const [trace, setTrace] = useState({ steps: [], error: null });
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const inLessonFlow = session.lessonStep === 2 && !session.completed;
  const sessionInProgress = hasStartedSession(session) && !session.completed;
  const current = step >= 0 ? trace.steps[step] : { variables: {}, output: [], line: 0, explanation: 'Run the program to get the answer, then Step through to watch each instruction.' };
  const starterFor = (nextLanguage, nextLevel) => starterPrograms[nextLevel][nextLanguage];
  const run = () => {
    const result = traceProgram(code, language);
    setTrace(result);
    setRunOutput(result.steps.at(-1)?.output || []);
    setStep(-1);
    setAuto(false);
    if (result.steps.length && !result.error && inLessonFlow) onProgramRun();
    return result;
  };
  useEffect(() => { if (!auto || !trace.steps.length) return undefined; if (step >= trace.steps.length - 1) { setAuto(false); return undefined; } const timer = setTimeout(() => setStep((value) => value + 1), 700); return () => clearTimeout(timer); }, [auto, step, trace.steps.length]);
  const chooseLanguage = (nextLanguage) => { setLanguage(nextLanguage); setCode(starterFor(nextLanguage, profile.level)); setTrace({ steps: [], error: null }); setRunOutput(null); setStep(-1); setAuto(false); };
  const chooseLevel = (nextLevel) => { updateProfile({ level: nextLevel }); setCode(starterFor(language, nextLevel)); setTrace({ steps: [], error: null }); setRunOutput(null); setStep(-1); setAuto(false); };
  const move = (amount) => {
    setAuto(false);
    if (!trace.steps.length) { const result = run(); if (result.steps.length && amount > 0) setStep(0); return; }
    setStep((value) => Math.min(Math.max(-1, value + amount), trace.steps.length - 1));
  };
  const changeCode = (nextCode) => { setCode(nextCode); setTrace({ steps: [], error: null }); setRunOutput(null); setStep(-1); setAuto(false); };
  return <main className="page playground-page"><div className="playground-heading"><div><p className="eyebrow">{inLessonFlow ? 'Lesson step 3 of 4' : 'A real learning sandbox'}</p><h1>Code playground</h1><p className="playground-note">Run gives the finished result. The tracer uses the exact same execution steps.</p></div><div className="language-switch" role="group" aria-label="Choose language"><button className={language === 'python' ? 'active' : ''} onClick={() => chooseLanguage('python')}>Python</button><button className={language === 'pseudo' ? 'active' : ''} onClick={() => chooseLanguage('pseudo')}>Pseudocode</button><button className={language === 'cpp' ? 'active' : ''} onClick={() => chooseLanguage('cpp')}>C++</button></div></div><div className="level-switch" role="group" aria-label="Choose learning level">{levelOptions.map(([id, label]) => <button key={id} className={profile.level === id ? 'active' : ''} onClick={() => chooseLevel(id)}>{label}</button>)}</div><section className="playground-grid"><div className="editor-panel"><div className="panel-head"><span>{profile.level} starter program</span><button className="run-button" onClick={run}>Run program</button></div><div className="editor-wrap"><div className="line-numbers">{code.split('\n').map((_, index) => <span className={current.line === index + 1 ? 'current-line' : ''} key={index}>{index + 1}</span>)}</div><textarea aria-label="Code editor" value={code} spellCheck="false" onChange={(event) => changeCode(event.target.value)} /></div>{trace.error && <div className="gentle-error">Let's trace it together: {trace.error}</div>}<div className="output"><span>{runOutput ? 'Run result' : 'Output'}</span><code>{runOutput ? runOutput.length ? runOutput.join('\n') : 'This program finished without displaying a value.' : 'Run the program to see its result.'}</code></div></div><Tracer trace={trace} current={current} step={step} onMove={move} auto={auto} setAuto={setAuto} /></section><section className={`playground-flow ${inLessonFlow ? 'in-flow' : ''}`}>{inLessonFlow && !session.playgroundComplete && <><p className="eyebrow">Your next move</p><h2>Run your program to unlock the next lesson step.</h2><p>When the run result appears, you can continue to the challenge. The tracer is there to help you understand the result.</p></>}{inLessonFlow && session.playgroundComplete && <><p className="eyebrow">Step 3 complete</p><h2>Your program ran successfully.</h2><p>You can keep experimenting, or continue to the final challenge whenever you are ready.</p><button className="primary" onClick={onContinueLesson}>Continue to challenge</button></>}{!inLessonFlow && sessionInProgress && <><p className="eyebrow">Lesson in progress</p><h2>Your guided session is waiting.</h2><p>Return to the lesson to continue from step {session.lessonStep + 1} of 4.</p><button className="secondary" onClick={onReturnToLesson}>Return to lesson</button></>}{!inLessonFlow && !sessionInProgress && <><p className="eyebrow">Free practice</p><h2>Explore at your own pace.</h2><p>Start a lesson when you want the timer, step-by-step guidance, and a clear finish.</p><button className="secondary" onClick={onStartLesson}>Start today&apos;s lesson</button></>}</section><ConfusionBox profile={profile} context="program" /></main>;
}

function Tracer({ trace, current, step, onMove, auto, setAuto }) {
  const [literal, setLiteral] = useState(false);
  useEffect(() => setLiteral(false), [step]);
  const canStep = !trace.error && (!trace.steps.length || step < trace.steps.length - 1);
  const variableEntries = Object.entries(current.variables);
  const explanation = literal && step >= 0 ? `Line ${current.line} completed. The variables and output panel show the program state immediately after that line.` : current.explanation;
  return <aside className="tracer-panel"><div className="panel-head"><span>Step tracer</span><span className="trace-status">{trace.steps.length ? `${Math.max(step + 1, 0)} of ${trace.steps.length}` : 'Ready'}</span></div><div className="tracer-scene"><div className="tracer-buddy"><span>V</span></div><div className="trace-road" /><p>{step >= 0 ? `Following line ${current.line}` : 'Waiting at the first instruction'}</p></div><div className="trace-controls"><button className="icon-button" title="Step back" aria-label="Step back" onClick={() => onMove(-1)} disabled={step < 0}>Back</button><button className="primary compact" onClick={() => onMove(1)} disabled={!canStep}>Step</button><button className={`icon-button ${auto ? 'pressed' : ''}`} title="Automatically play steps" onClick={() => setAuto(!auto)} disabled={!trace.steps.length}>{auto ? 'Pause' : 'Play'}</button></div><div className="explanation"><p className="eyebrow">Explain this step</p><p>{explanation}</p><button className="text-button" onClick={() => setLiteral((value) => !value)} disabled={step < 0}>{literal ? 'Use guided explanation' : 'Use literal explanation'}</button></div><div className="variables"><p className="eyebrow">Live variables</p>{variableEntries.length ? variableEntries.map(([name, value]) => <div className="variable" key={name}><span>{name}</span><strong>{value}</strong></div>) : <p className="empty-state">Variables appear here as the program runs.</p>}</div></aside>;
}

function ConfusionBox({ profile, context = 'variables' }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState(''); const [answer, setAnswer] = useState('');
  const help = () => { const mode = profile.plainMode ? 'literally' : `using ${profile.interests[0] || 'your chosen'} examples`; setAnswer(`Let's make it smaller. A variable is ${getAnalogy(profile, 'variable')}. In this ${context}, the name tells the computer where to look, and the value is what it finds there. Want to try changing just one value and tracing it ${mode}?`); };
  return <aside className={`confusion ${open ? 'open' : ''}`}><button className="confusion-toggle" onClick={() => setOpen(!open)}>Something confusing?</button>{open && <div className="confusion-dialog"><p className="eyebrow">Let's untangle it</p><h2>Tell me what feels fuzzy.</h2><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="For example: I do not get why score changes." /><button className="primary compact" onClick={help} disabled={!message.trim()}>Help me understand</button>{answer && <div className="tutor-answer"><p>{answer}</p><div><button onClick={() => setAnswer('Great. That question helped us find the next small step.')}>That helped</button><button onClick={help}>Still fuzzy</button></div></div>}</div>}</aside>;
}

function Settings({ profile, updateProfile, close, onReset }) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  return <div className="modal-backdrop" role="presentation"><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-head"><div><p className="eyebrow">Always under your control</p><h2 id="settings-title">My Settings</h2></div><button className="icon-button" onClick={close}>Close</button></div><div className="settings-list"><label><span>Name</span><input className="settings-input" value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} aria-label="Name" /></label><label><span>Learning level</span><select value={profile.level} onChange={(event) => updateProfile({ level: event.target.value })}>{levelOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label><span>Color theme</span><select value={profile.theme} onChange={(event) => updateProfile({ theme: event.target.value })}><option value="ocean">Calm ocean</option><option value="space">Night space</option><option value="pastel">Soft pastel</option><option value="contrast">High contrast</option><option value="arcade">Retro arcade</option></select></label><label><span>Learning pathway</span><select value={profile.pathway || derivePathway(profile.learningNotes)} onChange={(event) => updateProfile({ pathway: event.target.value })}><option value="blended">Blended</option><option value="autism">Structured</option><option value="adhd">Momentum</option><option value="dyslexia">Readable</option><option value="dyscalculia">Concrete</option></select></label><label className="toggle-row"><span>Dark mode</span><input type="checkbox" checked={profile.darkMode} onChange={(event) => updateProfile({ darkMode: event.target.checked })} /></label><label><span>Reading style</span><select value={profile.font} onChange={(event) => updateProfile({ font: event.target.value })}><option value="standard">Standard</option><option value="lexend">Easy-reading</option></select></label><label><span>Text size</span><input type="range" min="90" max="125" value={profile.fontSize} onChange={(event) => updateProfile({ fontSize: event.target.value })} /></label><label className="toggle-row"><span>Plain, literal explanations</span><input type="checkbox" checked={profile.plainMode} onChange={(event) => updateProfile({ plainMode: event.target.checked })} /></label><label className="toggle-row"><span>Gentle sound feedback</span><input type="checkbox" checked={profile.sound} onChange={(event) => updateProfile({ sound: event.target.checked })} /></label><div className="reset-section"><p><b>Start fresh</b><br />Resetting clears your answers and brings you back to the welcome flow.</p>{confirmingReset ? <div className="reset-actions"><button className="danger-button" onClick={onReset}>Reset my answers</button><button className="text-button" onClick={() => setConfirmingReset(false)}>Keep my answers</button></div> : <button className="secondary" onClick={() => setConfirmingReset(true)}>Reset onboarding answers</button>}</div></div></section></div>;
}

function LearningMap({ profile, setScreen }) { const units = ['Programs', 'Variables', 'Input / output', 'Conditions', 'Loops', 'Functions', 'Lists', 'Debugging']; return <main className="page map-page"><p className="eyebrow">Coding path - {profile.level}</p><h1>Your learning map</h1><p className="map-intro">The whole path is visible. You are right here, and you can explore in your own order.</p><div className="map-road">{units.map((unit, index) => <button onClick={() => index === 0 && setScreen('lesson')} className={`map-node ${index === 0 ? 'current' : ''}`} key={unit}><span>{index + 1}</span><strong>{unit}</strong><small>{index === 0 ? 'Start here' : 'Coming up'}</small></button>)}</div></main>; }

function getAnalogy(profile, concept) { if (profile.plainMode) return analogies.plain[concept]; return (analogies[profile.interests[0]] || analogies.plain)[concept]; }

export default App;
