import { useEffect, useState } from 'react';
import { analogies, interestOptions, lessonSteps, levelOptions, onboarding, starterPrograms } from './content.js';
import { traceProgram } from './interpreter.js';

const defaultProfile = {
  name: '', learningNotes: [], interests: ['space'], learningStyle: 'try', focusLength: '10', motion: 'some',
  feedback: 'trace', track: 'coding', theme: 'ocean', font: 'standard', fontSize: 100, level: 'beginner',
  pathway: 'blended', readingPreference: 'standard', codingExperience: 'never', plainMode: false, sound: false,
  darkMode: false, xp: 120, streak: 3, gedState: 'washington', gedTest: 'ged',
  gedStudySettings: { daysPerWeek: 4, confidence: { math: 'some', language: 'some', science: 'some', social: 'some', writing: 'some' } },
};

const defaultSession = {
  lessonIndex: 0,
  lessonStep: 0,
  elapsedSeconds: 0,
  durationMinutes: 10,
  timerRunning: false,
  playgroundComplete: false,
  completed: false,
  completedLessonIndexes: [],
};

const courseLessons = [
  {
    title: 'Programs give clear instructions',
    summary: 'Make a score change, then watch a computer follow each instruction.',
    playgroundPrompt: 'Run the score program, then trace how the value changes line by line.',
    steps: [
      { title: 'Warm-up: computers are very literal', body: 'A program is a list of instructions. The computer follows each one in order, exactly as written.', action: 'Continue to variables' },
      { title: 'New idea: variables hold values', body: 'A variable has a name and a value. The program can store a value there, change it, and use it later.', action: 'Open step 3: playground' },
      { title: 'Playground: follow the score', body: 'Run a starter program, then use the tracer to see how the score changes.', action: 'Open playground' },
      { title: 'Challenge: make the score grow', body: 'Change one value in the starter program and run it again. Notice what changes in the output.', action: 'Finish this lesson' },
    ],
  },
  {
    title: 'Conditions make choices',
    summary: 'Learn how a program can check a value before choosing what to do next.',
    playgroundPrompt: 'Try changing a score value, then trace what the program decides to do.',
    steps: [
      { title: 'Warm-up: programs can make choices', body: 'A condition checks whether something is true or false. That check helps the program decide which instruction comes next.', action: 'Continue to conditions' },
      { title: 'New idea: compare a value', body: 'A comparison asks a small question, such as whether score is greater than 3. The answer guides the next step.', action: 'Open step 3: playground' },
      { title: 'Playground: trace a decision', body: 'Run the starter program and look for the point where the program checks a condition.', action: 'Open playground' },
      { title: 'Challenge: change the decision', body: 'Try a different starting value and predict whether the condition will be true before you run the code.', action: 'Finish this lesson' },
    ],
  },
  {
    title: 'Loops repeat useful work',
    summary: 'Use a loop to repeat a small instruction without writing it again and again.',
    playgroundPrompt: 'Run the loop program, then trace how the score changes on each repeat.',
    steps: [
      { title: 'Warm-up: repetition saves effort', body: 'When a program needs to do the same kind of action several times, a loop gives it a clear repeat instruction.', action: 'Continue to loops' },
      { title: 'New idea: count each repeat', body: 'A loop can use a counter to keep track of how many times it has repeated. Each pass can change a value.', action: 'Open step 3: playground' },
      { title: 'Playground: watch the loop work', body: 'Run the starter loop, then step through it to see the value update each time.', action: 'Open playground' },
      { title: 'Challenge: make one more repeat', body: 'Change the repeat count or the amount added to the score, then predict the final output.', action: 'Finish this lesson' },
    ],
  },
  {
    title: 'Debugging is careful noticing',
    summary: 'Use the output and tracer to check what the program actually did.',
    playgroundPrompt: 'Change one line, run the program, and use the tracer to explain the result.',
    steps: [
      { title: 'Warm-up: errors are clues', body: 'When a program does something unexpected, the result is useful information. Start by noticing what changed.', action: 'Continue to checking results' },
      { title: 'New idea: compare expectation and output', body: 'Make a small prediction before you run code. Then compare it with the output to find the next thing to investigate.', action: 'Open step 3: playground' },
      { title: 'Playground: test one small change', body: 'Change one number in the starter program, run it, then trace the result to see why it changed.', action: 'Open playground' },
      { title: 'Challenge: explain the result', body: 'Use the variable panel and output to explain the program in your own words. You are now debugging on purpose.', action: 'Finish this lesson' },
    ],
  },
];

const gedStates = {
  washington: {
    label: 'Washington',
    credential: 'GED',
    defaultTest: 'ged',
    overview: 'Washington awards its High School Equivalency Certificate through the four-subject GED test.',
    eligibility: ['Age 19 or older: test without additional underage paperwork.', 'Age 16 to 18: the test center must approve required school-status documentation before scheduling.', 'Washington residency is required to receive the state certificate.'],
    testing: ['You may test at an official center or online when eligible.', 'For online testing, pass GED Ready with a Green score for each subject within 60 days, then schedule within that window.', 'A GED class is helpful but not required before testing.'],
    sources: [
      { label: 'Washington GED rules', href: 'https://www.ged.com/policies/washington.html' },
      { label: 'GED Ready practice test', href: 'https://www.ged.com/en/faqs/about-the-ged.html' },
      { label: 'GED online testing rules', href: 'https://www.ged.com/content/websites/ged/en-us/take-the-ged-test-online.html' },
    ],
  },
  louisiana: {
    label: 'Louisiana',
    credential: 'High School Equivalency (HSE)',
    defaultTest: 'ged',
    overview: 'Louisiana accepts both the GED and HiSET as High School Equivalency testing pathways.',
    eligibility: ['Age 19 or older and not enrolled in high school: eligible to test without additional documentation.', 'Age 16 to 18: an approved age waiver or authorized Adult Education or Options pathway is required.', 'Free Adult Education programs can provide classes, assessment, and help choosing the right path.'],
    testing: ['GED: four computer-based subjects: Math, Language Arts, Science, and Social Studies.', 'HiSET: five subjects: Reading, Writing, Math, Science, and Social Studies; computer and paper options may be available.', 'Louisiana also has qualifying college-placement and coursework HSE pathways.'],
    sources: [
      { label: 'Louisiana HSE testing pathways', href: 'https://www.lctcs.edu/workready-u/high-school-equivalency' },
      { label: 'Louisiana HSE FAQ and score rules', href: 'https://www.lctcs.edu/workready-u/hse-approved' },
      { label: 'Louisiana HiSET requirements', href: 'https://hiset.org/louisiana/' },
    ],
  },
};

const gedPlanWeeks = [
  {
    title: 'Set your starting point',
    focus: 'Know the test, your state rules, and the subjects that need the most attention.',
    tasks: ['Read your state testing rules and save the official link.', 'Create or locate your official testing account.', 'Take one official-style practice section or a short diagnostic in each subject.', 'Write down your strongest subject, your hardest subject, and a realistic study time.'],
  },
  {
    title: 'Reading and language arts',
    focus: 'Build the reading, evidence, and writing habits used across the exam.',
    tasks: ['Read two short nonfiction passages and identify each author\'s main claim.', 'Practice finding the sentence that best supports an answer.', 'Review grammar in context: complete sentences, punctuation, and word choice.', 'Write one 45-minute response: claim, evidence, explanation, and a clear ending.'],
  },
  {
    title: 'Core math skills',
    focus: 'Make number sense, fractions, ratios, and percent feel dependable.',
    tasks: ['Practice operations with fractions, decimals, and signed numbers.', 'Solve ratio, rate, percent, and proportion problems from everyday situations.', 'Review exponents, square roots, and order of operations.', 'Complete a timed mixed-skills set, then correct every missed problem.'],
  },
  {
    title: 'Algebra, geometry, and data',
    focus: 'Use equations, shapes, and data displays to reason through multi-step problems.',
    tasks: ['Solve one-step and multi-step linear equations.', 'Practice graphing a line and interpreting slope and intercept.', 'Review area, volume, the Pythagorean theorem, and coordinate geometry.', 'Read tables, charts, mean, median, range, and simple probability.'],
  },
  {
    title: 'Science reasoning',
    focus: 'Use evidence, experiments, and data instead of memorizing every fact.',
    tasks: ['Read a science passage and separate the claim, evidence, and conclusion.', 'Interpret a graph, table, or experiment setup.', 'Review life science, physical science, and Earth and space science vocabulary in context.', 'Practice deciding which result would support or weaken a hypothesis.'],
  },
  {
    title: 'Social studies reasoning',
    focus: 'Read sources closely and connect civics, history, economics, and geography.',
    tasks: ['Review the branches of government and basic constitutional principles.', 'Compare two short historical or civic sources.', 'Interpret a map, timeline, political cartoon, or economic chart.', 'Practice selecting evidence that supports a historical or civic claim.'],
  },
  {
    title: 'Practice and target gaps',
    focus: 'Use practice results to spend time where it pays off most.',
    tasks: ['Take an official practice test in your lowest-confidence subject.', 'Make an error log: concept, why the answer was wrong, and the corrected method.', 'Complete two focused study blocks from the error log.', 'Practice pacing: skip, flag, and return instead of getting stuck.'],
  },
  {
    title: 'Final readiness and scheduling',
    focus: 'Confirm readiness, test logistics, and a calm plan for test day.',
    tasks: ['Take a final official practice test for each subject you plan to schedule.', 'Review your state\'s ID, location, online-testing, and check-in requirements.', 'Choose one subject to take first and schedule only when practice results support it.', 'Plan the day before: sleep, transport or workspace, snacks, and a simple arrival checklist.'],
  },
];

const gedTestDetails = {
  ged: { label: 'GED', subjects: ['Mathematical Reasoning', 'Reasoning Through Language Arts', 'Science', 'Social Studies'], readiness: 'Aim for 145 or higher on each official GED subject test. A GED Ready Green score is required for online scheduling.' },
  hiset: { label: 'HiSET', subjects: ['Mathematics', 'Reading', 'Writing', 'Science', 'Social Studies'], readiness: 'Louisiana requires an overall score of 45, at least 8 on every subtest, and 2 or higher on the Writing essay.' },
};

const gedSubjectLabels = { math: 'Math', language: 'Language arts', writing: 'Writing', science: 'Science', social: 'Social studies' };
const gedSubjectsByTest = { ged: ['math', 'language', 'science', 'social'], hiset: ['math', 'language', 'writing', 'science', 'social'] };
const confidenceOptions = [['need', 'Need practice'], ['some', 'Some practice'], ['ready', 'Feeling ready']];

const gedStudyModules = [
  {
    id: 'math-percent', subject: 'math', title: 'Find a percent of a number', skill: 'Use percent as a rate out of 100.',
    teach: 'To find 25% of a number, turn 25% into 0.25 and multiply. For $80, 0.25 x 80 = 20.',
    example: 'A jacket costs $80 and is 25% off. The discount is $20, so the sale price is $60.',
    question: { prompt: 'A phone case costs $36 and is 25% off. How much is the discount?', choices: ['$6', '$9', '$12', '$27'], answer: '$9', hint: 'One quarter is 25%. Find one quarter of 36.', explanation: '25% is one quarter. 36 divided by 4 is 9, so the discount is $9.' },
  },
  {
    id: 'math-equation', subject: 'math', title: 'Solve a one-variable equation', skill: 'Undo operations in the reverse order.',
    teach: 'For 3x + 5 = 20, subtract 5 first. Then divide both sides by 3.',
    example: '3x + 5 = 20 becomes 3x = 15, so x = 5.',
    question: { prompt: 'Solve: 4x - 7 = 21', choices: ['x = 5', 'x = 7', 'x = 14', 'x = 28'], answer: 'x = 7', hint: 'Add 7 to both sides before dividing by 4.', explanation: 'Adding 7 gives 4x = 28. Dividing both sides by 4 gives x = 7.' },
  },
  {
    id: 'math-data', subject: 'math', title: 'Read the middle of a data set', skill: 'Find the median after putting values in order.',
    teach: 'The median is the middle value when the numbers are ordered. With an even number of values, average the two middle values.',
    example: 'For 2, 4, 6, 8, the two middle values are 4 and 6. Their average is 5.',
    question: { prompt: 'What is the median of 3, 7, 9, 11, 15?', choices: ['7', '8', '9', '11'], answer: '9', hint: 'There are five ordered values. Point to the one in the middle.', explanation: '9 has two values below it and two above it, so it is the median.' },
  },
  {
    id: 'language-claim', subject: 'language', title: 'Find an author\'s claim', skill: 'Separate the main point from supporting details.',
    teach: 'A claim is the point the author wants you to accept. Evidence and examples support that point.',
    example: 'If a passage lists the benefits of a new bus route, the claim may be that the route should be added.',
    question: { prompt: 'A passage says a town should add more library hours because evening hours help working adults use computers and attend job workshops. What is the author\'s claim?', choices: ['Evening library hours should be added.', 'Working adults attend job workshops.', 'Libraries have computers.', 'The town has one library.'], answer: 'Evening library hours should be added.', hint: 'Look for the action the author wants the town to take.', explanation: 'The working-adult and computer details are evidence. The claim is that the town should add evening hours.' },
  },
  {
    id: 'language-evidence', subject: 'language', title: 'Choose strong supporting evidence', skill: 'Match evidence directly to a claim.',
    teach: 'Strong evidence is specific and directly connected to the claim. A fact or result is usually stronger than an unrelated opinion.',
    example: 'For a claim about a tutoring program, improved reading scores are stronger evidence than saying the room is bright.',
    question: { prompt: 'Which detail best supports the claim that a school garden improved science learning?', choices: ['The garden has a blue fence.', 'Students measured plant growth each week and used the data in class.', 'The garden is behind the gym.', 'Teachers like being outside.'], answer: 'Students measured plant growth each week and used the data in class.', hint: 'Pick the detail that connects the garden to science work.', explanation: 'Measuring plant growth and using data are specific science-learning activities.' },
  },
  {
    id: 'language-grammar', subject: 'language', title: 'Fix a sentence boundary', skill: 'Use punctuation to join complete ideas correctly.',
    teach: 'Two complete sentences need a period, a semicolon, or a comma plus a coordinating word such as and or but.',
    example: 'Wrong: The bus was late I called work. Correct: The bus was late, so I called work.',
    question: { prompt: 'Choose the best revision: "The store was closed we returned home."', choices: ['The store was closed, we returned home.', 'The store was closed so we returned home.', 'The store was closed, so we returned home.', 'The store was closed; so, we returned home.'], answer: 'The store was closed, so we returned home.', hint: 'You need a comma and a joining word between two complete ideas.', explanation: 'A comma followed by so correctly joins the two complete ideas.' },
  },
  {
    id: 'writing-support', subject: 'writing', title: 'Build a focused paragraph', skill: 'Choose evidence that directly supports a controlling idea.',
    teach: 'A focused paragraph makes one point, gives evidence, and explains how the evidence proves that point.',
    example: 'Claim: Community colleges should offer evening classes. Evidence: Many students work during the day. Explanation: Evening classes make attendance possible for those workers.',
    question: { prompt: 'Which sentence best supports the claim that a city should repair sidewalks near schools?', choices: ['Many streets have names.', 'Students walk there every morning and broken pavement creates tripping hazards.', 'The city has a parks department.', 'Some sidewalks are painted yellow.'], answer: 'Students walk there every morning and broken pavement creates tripping hazards.', hint: 'Look for a detail about safety and the area near schools.', explanation: 'It directly connects damaged sidewalks to a real safety risk for students.' },
  },
  {
    id: 'writing-revision', subject: 'writing', title: 'Use transitions to show a relationship', skill: 'Choose a transition that matches the idea that follows.',
    teach: 'Transitions show relationships. Use because for a reason, however for contrast, and therefore for a result.',
    example: 'The route is shorter; therefore, the delivery will arrive earlier.',
    question: { prompt: 'Choose the best word: "The test center was full; _____, Maya scheduled for Friday."', choices: ['however', 'therefore', 'for example', 'meanwhile'], answer: 'therefore', hint: 'The Friday appointment is the result of the test center being full.', explanation: 'Therefore shows that scheduling Friday happened because the earlier date was full.' },
  },
  {
    id: 'science-variable', subject: 'science', title: 'Identify an independent variable', skill: 'Notice what a researcher changes on purpose.',
    teach: 'In an experiment, the independent variable is what the researcher changes. The dependent variable is what they measure.',
    example: 'If a researcher changes hours of light and measures plant height, light is the independent variable.',
    question: { prompt: 'A class gives plants 2, 4, or 6 hours of light and measures their height after two weeks. What is the independent variable?', choices: ['Plant height', 'Hours of light', 'The ruler used', 'Two weeks'], answer: 'Hours of light', hint: 'Which thing did the class deliberately change?', explanation: 'The class chose different amounts of light. Plant height was the measured result.' },
  },
  {
    id: 'science-evidence', subject: 'science', title: 'Use data to evaluate a claim', skill: 'Compare a claim with the result of an investigation.',
    teach: 'A conclusion is supported when the results match what it predicts. One result may support a claim without proving it forever.',
    example: 'If plants with more light grow taller in repeated trials, that supports the claim that light affects growth.',
    question: { prompt: 'A test finds that water freezes at the same temperature in three trials. Which conclusion is best supported?', choices: ['Water always freezes instantly.', 'The trials support that water freezes at a consistent temperature.', 'The thermometer was broken.', 'No more trials are needed.'], answer: 'The trials support that water freezes at a consistent temperature.', hint: 'Choose the careful conclusion that matches the repeated result.', explanation: 'Repeated trials support consistency. They do not prove every possible condition or rule out future testing.' },
  },
  {
    id: 'science-model', subject: 'science', title: 'Connect a model to a system', skill: 'Use a simple model to describe a scientific relationship.',
    teach: 'A model simplifies a system so you can see a relationship. Ask what changes and what stays the same.',
    example: 'A diagram of the water cycle shows water moving among the ground, air, and clouds.',
    question: { prompt: 'A diagram shows a battery connected to a bulb. When the switch closes, the bulb lights. What does the diagram best model?', choices: ['A food chain', 'A complete electric circuit', 'The water cycle', 'Cell division'], answer: 'A complete electric circuit', hint: 'Think about what is needed for electricity to flow to a bulb.', explanation: 'Closing the switch completes the path for electric current through the battery and bulb.' },
  },
  {
    id: 'social-civics', subject: 'social', title: 'Match a power to a branch', skill: 'Recognize the jobs of the federal branches.',
    teach: 'Congress makes laws, the president carries out laws, and federal courts interpret laws.',
    example: 'When a court decides whether a law follows the Constitution, it is using judicial power.',
    question: { prompt: 'Which branch of the federal government can declare a law unconstitutional?', choices: ['Congress', 'The executive branch', 'The judicial branch', 'A city council'], answer: 'The judicial branch', hint: 'Think about which branch interprets laws and the Constitution.', explanation: 'Courts make up the judicial branch and can rule that a law conflicts with the Constitution.' },
  },
  {
    id: 'social-source', subject: 'social', title: 'Read a source for its point of view', skill: 'Notice the purpose and perspective behind a source.',
    teach: 'A source can be useful even when it has a point of view. Ask who created it, why, and what evidence it uses.',
    example: 'A campaign flyer may reveal what a candidate wants voters to believe, even though it is not neutral.',
    question: { prompt: 'A business owner writes a letter arguing against a new tax. What is the most likely point of view?', choices: ['The tax will affect the owner\'s business costs.', 'Taxes are never collected.', 'The letter has no purpose.', 'The owner works for the court.'], answer: 'The tax will affect the owner\'s business costs.', hint: 'Consider how the proposed tax could affect the person writing the letter.', explanation: 'The business owner has a clear economic interest in a tax that could raise business costs.' },
  },
  {
    id: 'social-economics', subject: 'social', title: 'See how price affects demand', skill: 'Use a basic supply-and-demand relationship.',
    teach: 'When a price rises, people often buy less of that item. When a price falls, people often buy more, all else equal.',
    example: 'If concert tickets cost less, more people may be able to buy them.',
    question: { prompt: 'A store raises the price of a popular snack. What is the most likely short-term effect on demand?', choices: ['Demand increases because the price is higher.', 'Demand decreases because fewer people may choose to buy it.', 'Demand stays exactly the same in every case.', 'The snack becomes free.'], answer: 'Demand decreases because fewer people may choose to buy it.', hint: 'Think about what a higher price does to a buyer\'s budget.', explanation: 'A higher price usually leads some buyers to purchase less, so demand tends to decrease.' },
  },
];

function getGedStudySettings(profile) {
  const stored = profile.gedStudySettings || {};
  return { daysPerWeek: Number(stored.daysPerWeek) || 4, confidence: { math: 'some', language: 'some', writing: 'some', science: 'some', social: 'some', ...(stored.confidence || {}) } };
}

function getStudyStylePrompt(profile) {
  const prompts = {
    watch: 'Start with the worked example, then notice the one move that changes the answer.',
    read: 'Read the key idea slowly, then use it on one focused question.',
    try: 'Try the question after a quick example. Your answer tells us what comes next.',
    story: 'Start with the small real-life example, then pull out the test skill inside it.',
  };
  return prompts[profile.learningStyle] || prompts.try;
}

function buildGedStudySessions(stateId, testKey, settings) {
  const subjects = gedSubjectsByTest[testKey] || gedSubjectsByTest.ged;
  const priority = [...subjects].sort((left, right) => {
    const score = { need: 0, some: 1, ready: 2 };
    return (score[settings.confidence[left]] ?? 1) - (score[settings.confidence[right]] ?? 1);
  });
  const modulesBySubject = Object.fromEntries(subjects.map((subject) => [subject, gedStudyModules.filter((module) => module.subject === subject)]));
  const cycle = [];
  const rounds = Math.max(...priority.map((subject) => modulesBySubject[subject].length));
  for (let round = 0; round < rounds; round += 1) priority.forEach((subject) => { const module = modulesBySubject[subject][round]; if (module) cycle.push(module); });
  const totalSessions = settings.daysPerWeek * 8;
  return Array.from({ length: totalSessions }, (_, index) => {
    const module = cycle[index % cycle.length];
    return { id: `${stateId}-${testKey}-${index + 1}-${module.id}`, moduleId: module.id, week: Math.floor(index / settings.daysPerWeek) + 1, day: index % settings.daysPerWeek + 1, review: index >= cycle.length };
  });
}

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

function loadGedProgress() {
  try { return JSON.parse(localStorage.getItem('versed-ged-progress')) || {}; } catch { return {}; }
}

function loadGedStudyProgress() {
  try { return { completedSessions: {}, results: {}, ...JSON.parse(localStorage.getItem('versed-ged-study-progress')) }; } catch { return { completedSessions: {}, results: {} }; }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function getFocusMinutes(value) {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
}

function hasStartedSession(session) {
  return session.timerRunning || session.elapsedSeconds > 0 || session.lessonStep > 0 || session.playgroundComplete;
}

function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [session, setSession] = useState(loadSession);
  const [gedProgress, setGedProgress] = useState(loadGedProgress);
  const [gedStudyProgress, setGedStudyProgress] = useState(loadGedStudyProgress);
  const [activeGedSession, setActiveGedSession] = useState(null);
  const [screen, setScreen] = useState(() => localStorage.getItem('versed-welcomed') ? 'home' : 'onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('versed-profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('versed-session', JSON.stringify(session)); }, [session]);
  useEffect(() => { localStorage.setItem('versed-ged-progress', JSON.stringify(gedProgress)); }, [gedProgress]);
  useEffect(() => { localStorage.setItem('versed-ged-study-progress', JSON.stringify(gedStudyProgress)); }, [gedStudyProgress]);
  useEffect(() => {
    if (!session.timerRunning) return undefined;
    const timer = setInterval(() => setSession((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 })), 1000);
    return () => clearInterval(timer);
  }, [session.timerRunning]);

  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }));
  const setLessonStep = (lessonStep) => setSession((current) => ({ ...current, lessonStep }));
  const startLesson = () => {
    setSession((current) => {
      if (!current.completed) return { ...current, timerRunning: true };
      const restartCourse = current.lessonIndex >= courseLessons.length - 1;
      return {
        ...defaultSession,
        lessonIndex: restartCourse ? 0 : current.lessonIndex + 1,
        durationMinutes: current.durationMinutes || getFocusMinutes(profile.focusLength),
        completedLessonIndexes: restartCourse ? [] : current.completedLessonIndexes || [],
        timerRunning: true,
      };
    });
    setScreen('lesson');
  };
  const setSessionDuration = (durationMinutes) => setSession((current) => ({ ...current, durationMinutes }));
  const chooseGedState = (gedState) => updateProfile({ gedState, gedTest: gedState === 'washington' ? 'ged' : profile.gedTest || 'ged' });
  const chooseGedTest = (gedTest) => updateProfile({ gedTest });
  const toggleGedTask = (taskId) => setGedProgress((current) => ({ ...current, [taskId]: !current[taskId] }));
  const updateGedStudySettings = (patch) => updateProfile({ gedStudySettings: { ...getGedStudySettings(profile), ...patch, confidence: { ...getGedStudySettings(profile).confidence, ...(patch.confidence || {}) } } });
  const openGedStudy = (studySession) => { setActiveGedSession(studySession); setScreen('ged-study'); };
  const completeGedStudy = (studySession, module) => {
    setGedStudyProgress((current) => ({ ...current, completedSessions: { ...current.completedSessions, [studySession.id]: true }, results: { ...current.results, [studySession.id]: { moduleId: module.id, subject: module.subject, completedAt: Date.now() } } }));
    setScreen('ged');
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
    setSession((current) => ({ ...current, completed: true, timerRunning: false, lessonStep: 3, completedLessonIndexes: [...new Set([...(current.completedLessonIndexes || []), current.lessonIndex])] }));
    updateProfile({ xp: profile.xp + 10 });
    setScreen('home');
  };
  const selectLesson = (lessonIndex) => {
    setSession((current) => ({ ...defaultSession, lessonIndex, durationMinutes: current.durationMinutes || getFocusMinutes(profile.focusLength), completedLessonIndexes: current.completedLessonIndexes || [] }));
    setScreen('home');
  };
  const resetProfile = () => {
    localStorage.removeItem('versed-profile');
    localStorage.removeItem('versed-session');
    localStorage.removeItem('versed-ged-progress');
    localStorage.removeItem('versed-ged-study-progress');
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
    {screen === 'home' && <Dashboard profile={profile} session={session} updateProfile={updateProfile} onStartLesson={startLesson} onToggleTimer={toggleTimer} onSetSessionDuration={setSessionDuration} onOpenGed={() => setScreen('ged')} />}
    {screen === 'lesson' && <Lesson profile={profile} session={session} setLessonStep={setLessonStep} setScreen={setScreen} onOpenPlayground={openPlayground} onFinishLesson={finishLesson} onToggleTimer={toggleTimer} />}
    {screen === 'playground' && <Playground profile={profile} session={session} updateProfile={updateProfile} onProgramRun={markProgramRun} onContinueLesson={continueFromPlayground} onReturnToLesson={() => setScreen('lesson')} onStartLesson={startLesson} />}
    {screen === 'map' && <LearningMap profile={profile} session={session} onSelectLesson={selectLesson} />}
    {screen === 'ged' && <PersonalizedGedPlan profile={profile} studyProgress={gedStudyProgress} onChooseState={chooseGedState} onChooseTest={chooseGedTest} onUpdateStudySettings={updateGedStudySettings} onOpenStudy={openGedStudy} />}
    {screen === 'ged-study' && activeGedSession && <GedStudy profile={profile} studySession={activeGedSession} onBack={() => setScreen('ged')} onComplete={completeGedStudy} />}
    {settingsOpen && <Settings profile={profile} updateProfile={updateProfile} close={() => setSettingsOpen(false)} onReset={resetProfile} />}
  </div>;
}

function Header({ profile, setScreen, onSettings, onToggleDarkMode }) {
  return <header className="topbar">
    <button className="brand" onClick={() => setScreen('home')} aria-label="Versed home"><span className="brand-mark">V</span><span>versed</span></button>
    <nav aria-label="Main navigation"><button onClick={() => setScreen('home')}>Today</button><button onClick={() => setScreen('ged')}>GED plan</button><button onClick={() => setScreen('map')}>Coding map</button><button onClick={() => setScreen('playground')}>Playground</button></nav>
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

function Dashboard({ profile, session, updateProfile, onStartLesson, onToggleTimer, onSetSessionDuration, onOpenGed }) {
  const subject = profile.track === 'math' ? 'Math' : 'Coding';
  const pathway = profile.pathway || derivePathway(profile.learningNotes);
  const greeting = profile.name ? `, ${profile.name}` : '';
  const unit = courseLessons[session.lessonIndex] || courseLessons[0];
  const nextUnit = courseLessons[session.lessonIndex + 1];
  const hasStarted = hasStartedSession(session);
  const flexibleLength = profile.focusLength === 'choose';
  const durationMinutes = session.durationMinutes || getFocusMinutes(profile.focusLength);
  const goalSeconds = durationMinutes * 60;
  const timeProgress = Math.min(100, session.elapsedSeconds / goalSeconds * 100);
  const mainAction = session.completed ? nextUnit ? 'Start next lesson' : 'Restart the course' : hasStarted ? 'Continue this lesson' : 'Start this lesson';
  const timerLabel = session.completed ? 'Session complete' : session.timerRunning ? 'Timer running' : hasStarted ? 'Timer paused' : 'Ready when you are';
  const currentStep = session.completed ? 4 : session.lessonStep;
  const completionMessage = nextUnit ? `Lesson complete. Next: ${nextUnit.title}.` : 'You completed the full course. Restart it anytime for another pass.';
  return <main className="page dashboard"><section className="welcome"><div><div className="welcome-meta"><p className="eyebrow">Your next small win</p><span className="pathway-badge">{getPathwayLabel(pathway)} pathway</span></div><h1>Ready when you are{greeting}.</h1><p>{flexibleLength ? `This is a flexible ${subject.toLowerCase()} session, set to ${durationMinutes} minutes.` : `Today is a ${durationMinutes}-minute ${subject.toLowerCase()} session. You decide the pace.`}</p>{flexibleLength && (!hasStarted || session.completed) && <div className="duration-picker" role="group" aria-label="Choose session length"><span>Session length</span>{[5, 10, 15, 25].map((minutes) => <button key={minutes} className={durationMinutes === minutes ? 'active' : ''} onClick={() => onSetSessionDuration(minutes)}>{minutes} min</button>)}</div>}<button className="primary main-lesson-action" onClick={onStartLesson}>{mainAction}</button></div><div className="today-meter"><span>{timerLabel}</span><strong>{formatDuration(session.elapsedSeconds)} / {formatDuration(goalSeconds)}</strong><div className="meter"><i style={{ width: `${timeProgress}%` }} /></div><small>{session.completed ? completionMessage : hasStarted ? `Unit ${session.lessonIndex + 1}, step ${currentStep + 1} of 4: ${lessonSteps[currentStep]}` : `Unit ${session.lessonIndex + 1} of ${courseLessons.length}: ${unit.title}`}</small>{hasStarted && !session.completed && <button className="timer-control" onClick={onToggleTimer}>{session.timerRunning ? 'Pause timer' : 'Resume timer'}</button>}</div></section>
    <section className="agenda"><div className="section-heading"><div><p className="eyebrow">A clear path</p><h2>Today&apos;s plan</h2></div><span className="duration">{session.completed ? 'Completed' : `Step ${currentStep + 1} of 4`}</span></div><div className="agenda-steps">{lessonSteps.map((item, index) => <div className={`agenda-item ${session.completed || index < session.lessonStep ? 'done' : ''} ${!session.completed && index === session.lessonStep ? 'active' : ''}`} key={item}><span>{session.completed || index < session.lessonStep ? 'Done' : index + 1}</span><div><strong>{item}</strong><small>{['See instructions become a program', 'Meet variables', 'Run and trace your code', 'Make a score counter'][index]}</small></div></div>)}</div></section>
    <section className="level-section"><div className="section-heading"><div><p className="eyebrow">Choose your challenge</p><h2>Learning levels</h2></div><span className="duration">Current: {profile.level}</span></div><div className="level-grid">{levelOptions.map(([id, label, description]) => <button key={id} className={`level-card ${profile.level === id ? 'active' : ''}`} onClick={() => updateProfile({ level: id })}><span>{label}</span><small>{description}</small>{profile.level === id && <b>Selected</b>}</button>)}</div></section>
    <section className="two-column"><div className="lesson-card"><p className="eyebrow">Coding path - Unit {session.lessonIndex + 1} of {courseLessons.length}</p><h2>{session.completed ? completionMessage : unit.title}</h2><p>{session.completed ? nextUnit ? nextUnit.summary : 'Every unit is available from your learning map whenever you want to revisit an idea.' : unit.summary}</p><button className="primary" onClick={onStartLesson}>{mainAction}</button></div><div className="progress-card"><p className="eyebrow">Your momentum</p><div className="progress-number"><strong>{session.completed ? 4 : currentStep + 1}</strong><span>{session.completed ? 'lesson complete' : 'of 4 lesson steps'}</span></div><div className="badge-row"><span>{session.timerRunning ? 'Timer running' : 'Progress saved'}</span><span>{session.completedLessonIndexes.length} of {courseLessons.length} units complete</span></div></div></section>
    <section className="ged-spotlight"><div><p className="eyebrow">High school equivalency</p><h2>Your GED study plan is ready.</h2><p>Build an eight-week plan for {gedStates[profile.gedState]?.label || 'Washington'}, then study real lessons and practice questions here in Versed.</p></div><button className="secondary" onClick={onOpenGed}>Open GED plan</button></section>
  </main>;
}

function Lesson({ profile, session, setLessonStep, setScreen, onOpenPlayground, onFinishLesson, onToggleTimer }) {
  const lessonStep = session.lessonStep;
  const unit = courseLessons[session.lessonIndex] || courseLessons[0];
  const details = unit.steps[lessonStep];
  const next = () => { if (lessonStep === 1 || lessonStep === 2) { onOpenPlayground(); return; } if (lessonStep === 3) { onFinishLesson(); return; } setLessonStep(lessonStep + 1); };
  return <main className="page lesson-page"><LessonNav step={lessonStep} session={session} setScreen={setScreen} onToggleTimer={onToggleTimer} /><section className="lesson-main"><p className="eyebrow">Unit {session.lessonIndex + 1} of {courseLessons.length} - Step {lessonStep + 1} of 4</p><h1>{details.title}</h1><p className="lesson-body">{details.body}</p><div className="flow-callout"><strong>{unit.title}</strong><span>Warm-up</span><i /> <span>New idea</span><i /> <span className={lessonStep === 2 ? 'flow-current' : ''}>Playground</span><i /> <span>Challenge</span></div><div className="lesson-visual"><div className="instruction-row"><span>1</span><p>Read the program&apos;s next instruction</p></div><div className="instruction-row active"><span>2</span><p>Notice how the current value changes</p></div><div className="instruction-row"><span>3</span><p>Check the output and explain the result</p></div><div className="value-box"><small>step</small><strong>{lessonStep + 1}</strong></div></div><div className="lesson-actions"><button className="text-button" onClick={() => setLessonStep(Math.max(0, lessonStep - 1))} disabled={!lessonStep}>Previous</button><button className="primary" onClick={next}>{details.action}</button></div></section><ConfusionBox profile={profile} /></main>;
}

function LessonNav({ step, session, setScreen, onToggleTimer }) { return <aside className="lesson-nav"><button className="back-link" onClick={() => setScreen('home')}>Back to today</button><p className="eyebrow">Today&apos;s plan</p>{lessonSteps.map((item, index) => <div key={item} className={`lesson-nav-item ${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`}><span>{index < step ? 'Done' : index + 1}</span>{item}</div>)}<div className="timer-card"><small>{session.timerRunning ? 'Session timer running' : 'Session timer paused'}</small><strong>{formatDuration(session.elapsedSeconds)}</strong><p>Your place is saved as you go.</p><button className="timer-control" onClick={onToggleTimer}>{session.timerRunning ? 'Pause timer' : 'Resume timer'}</button></div></aside>; }

function Playground({ profile, session, updateProfile, onProgramRun, onContinueLesson, onReturnToLesson, onStartLesson }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(starterPrograms[profile.level].python);
  const [trace, setTrace] = useState({ steps: [], error: null });
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const unit = courseLessons[session.lessonIndex] || courseLessons[0];
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
  const handleEditorKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const indentation = '  ';
    if (event.shiftKey && code.slice(Math.max(0, start - indentation.length), start) === indentation) {
      changeCode(`${code.slice(0, start - indentation.length)}${code.slice(start)}`);
      requestAnimationFrame(() => { editor.selectionStart = start - indentation.length; editor.selectionEnd = Math.max(start - indentation.length, end - indentation.length); });
      return;
    }
    changeCode(`${code.slice(0, start)}${indentation}${code.slice(start)}`);
    requestAnimationFrame(() => { editor.selectionStart = start + indentation.length; editor.selectionEnd = end + indentation.length; });
  };
  return <main className="page playground-page">
    <div className="playground-heading"><div><p className="eyebrow">{inLessonFlow ? `Unit ${session.lessonIndex + 1}, lesson step 3 of 4` : 'A real learning sandbox'}</p><h1>Code playground</h1><p className="playground-note">Run gives the finished result. The tracer uses the exact same execution steps.</p></div><div className="language-switch" role="group" aria-label="Choose language"><button className={language === 'python' ? 'active' : ''} onClick={() => chooseLanguage('python')}>Python</button><button className={language === 'pseudo' ? 'active' : ''} onClick={() => chooseLanguage('pseudo')}>Pseudocode</button><button className={language === 'cpp' ? 'active' : ''} onClick={() => chooseLanguage('cpp')}>C++</button></div></div>
    <div className="level-switch" role="group" aria-label="Choose learning level">{levelOptions.map(([id, label]) => <button key={id} className={profile.level === id ? 'active' : ''} onClick={() => chooseLevel(id)}>{label}</button>)}</div>
    <section className="playground-grid"><div className="editor-panel"><div className="panel-head"><span>{unit.title} - {profile.level} starter</span><button className="run-button" onClick={run}>Run program</button></div><div className="editor-wrap"><div className="line-numbers">{code.split('\n').map((_, index) => <span className={current.line === index + 1 ? 'current-line' : ''} key={index}>{index + 1}</span>)}</div><textarea aria-label="Code editor" value={code} spellCheck="false" onChange={(event) => changeCode(event.target.value)} onKeyDown={handleEditorKeyDown} /></div>{trace.error && <div className="gentle-error">Let's trace it together: {trace.error}</div>}<div className="output"><span>{runOutput ? 'Run result' : 'Output'}</span><code>{runOutput ? runOutput.length ? runOutput.join('\n') : 'This program finished without displaying a value.' : 'Run the program to see its result.'}</code></div></div><Tracer trace={trace} current={current} step={step} onMove={move} auto={auto} setAuto={setAuto} /></section>
    <section className={`playground-flow ${inLessonFlow ? 'in-flow' : ''}`}>{inLessonFlow && !session.playgroundComplete && <><p className="eyebrow">Your next move</p><h2>Run your program to unlock the next lesson step.</h2><p>{unit.playgroundPrompt} When the run result appears, you can continue to the challenge.</p></>}{inLessonFlow && session.playgroundComplete && <><p className="eyebrow">Step 3 complete</p><h2>Your program ran successfully.</h2><p>You can keep experimenting, or continue to the final challenge whenever you are ready.</p><button className="primary" onClick={onContinueLesson}>Continue to challenge</button></>}{!inLessonFlow && sessionInProgress && <><p className="eyebrow">Lesson in progress</p><h2>Your guided session is waiting.</h2><p>Return to the lesson to continue from step {session.lessonStep + 1} of 4.</p><button className="secondary" onClick={onReturnToLesson}>Return to lesson</button></>}{!inLessonFlow && !sessionInProgress && <><p className="eyebrow">Free practice</p><h2>Explore at your own pace.</h2><p>Start a lesson when you want the timer, step-by-step guidance, and a clear finish.</p><button className="secondary" onClick={onStartLesson}>Start this lesson</button></>}</section>
    <ConfusionBox profile={profile} context="program" />
  </main>;
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

function GedPlan({ profile, progress, onChooseState, onChooseTest, onToggleTask }) {
  const stateId = gedStates[profile.gedState] ? profile.gedState : 'washington';
  const state = gedStates[stateId];
  const testKey = stateId === 'washington' ? 'ged' : profile.gedTest === 'hiset' ? 'hiset' : 'ged';
  const test = gedTestDetails[testKey];
  const taskIds = gedPlanWeeks.flatMap((week, weekIndex) => week.tasks.map((_, taskIndex) => `${stateId}-${testKey}-${weekIndex}-${taskIndex}`));
  const completedCount = taskIds.filter((taskId) => progress[taskId]).length;
  const progressPercent = Math.round(completedCount / taskIds.length * 100);
  const stateControls = Object.entries(gedStates);

  return <main className="page ged-page">
    <section className="ged-hero">
      <div><p className="eyebrow">High school equivalency</p><h1>{state.label} {test.label} study plan</h1><p>A complete eight-week path built around the subjects, practice, and test-day decisions that matter. Check off work as you go; your progress stays saved here.</p></div>
      <div className="ged-progress" aria-label={`${progressPercent}% of this GED plan complete`}><span>Plan progress</span><strong>{progressPercent}%</strong><div className="meter"><i style={{ width: `${progressPercent}%` }} /></div><small>{completedCount} of {taskIds.length} study tasks complete</small></div>
    </section>

    <section className="ged-controls" aria-label="GED plan choices"><div><span>State</span><div className="segmented-control">{stateControls.map(([id, item]) => <button key={id} className={stateId === id ? 'active' : ''} onClick={() => onChooseState(id)}>{item.label}</button>)}</div></div>{stateId === 'louisiana' && <div><span>Testing route</span><div className="segmented-control">{['ged', 'hiset'].map((id) => <button key={id} className={testKey === id ? 'active' : ''} onClick={() => onChooseTest(id)}>{gedTestDetails[id].label}</button>)}</div></div>}<p>Rules can change. Confirm the official state requirements before paying or scheduling.</p></section>

    <section className="ged-overview-grid"><article className="ged-info-card"><p className="eyebrow">Your test route</p><h2>{test.label} subjects</h2><ul>{test.subjects.map((subject) => <li key={subject}>{subject}</li>)}</ul><p className="readiness-note">{test.readiness}</p></article><article className="ged-info-card"><p className="eyebrow">Start here</p><h2>{state.credential} in {state.label}</h2><p>{state.overview}</p><div className="state-facts"><span>{test.subjects.length} subjects</span><span>8-week plan</span><span>Saved checklist</span></div></article></section>

    <section className="study-plan"><div className="section-heading"><div><p className="eyebrow">Your study route</p><h2>Eight weeks to ready</h2></div><span className="duration">Study 4 to 5 days each week</span></div><div className="week-grid">{gedPlanWeeks.map((week, weekIndex) => { const weekTaskIds = week.tasks.map((_, taskIndex) => `${stateId}-${testKey}-${weekIndex}-${taskIndex}`); const done = weekTaskIds.filter((taskId) => progress[taskId]).length; return <article className={`week-card ${done === week.tasks.length ? 'complete' : ''}`} key={week.title}><div className="week-head"><span>Week {weekIndex + 1}</span><small>{done} / {week.tasks.length} done</small></div><h3>{week.title}</h3><p>{week.focus}</p><div className="task-list">{week.tasks.map((task, taskIndex) => { const taskId = `${stateId}-${testKey}-${weekIndex}-${taskIndex}`; return <label key={taskId}><input type="checkbox" checked={Boolean(progress[taskId])} onChange={() => onToggleTask(taskId)} /><span>{task}</span></label>; })}</div></article>; })}</div></section>

    <section className="state-guidance"><div className="guidance-card"><p className="eyebrow">Eligibility and paperwork</p><h2>Check before you schedule</h2><ul>{state.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="guidance-card"><p className="eyebrow">Testing options</p><h2>Know your route</h2><ul>{state.testing.map((item) => <li key={item}>{item}</li>)}</ul></div></section>

    <section className="official-resources"><div><p className="eyebrow">Official next steps</p><h2>Use the source, not a guess.</h2><p>These links are the places to verify current rules, practice, and schedule your test.</p></div><div className="resource-links">{state.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<span aria-hidden="true">Open</span></a>)}</div></section>
  </main>;
}

function PersonalizedGedPlan({ profile, studyProgress, onChooseState, onChooseTest, onUpdateStudySettings, onOpenStudy }) {
  const stateId = gedStates[profile.gedState] ? profile.gedState : 'washington';
  const state = gedStates[stateId];
  const testKey = stateId === 'washington' ? 'ged' : profile.gedTest === 'hiset' ? 'hiset' : 'ged';
  const test = gedTestDetails[testKey];
  const settings = getGedStudySettings(profile);
  const subjects = gedSubjectsByTest[testKey] || gedSubjectsByTest.ged;
  const sessions = buildGedStudySessions(stateId, testKey, settings).map((session) => ({ ...session, module: gedStudyModules.find((module) => module.id === session.moduleId) }));
  const completed = sessions.filter((session) => studyProgress.completedSessions[session.id]).length;
  const progressPercent = Math.round(completed / sessions.length * 100);
  const nextSession = sessions.find((session) => !studyProgress.completedSessions[session.id]) || sessions[0];
  const focusMinutes = getFocusMinutes(profile.focusLength);

  return <main className="page ged-page personalized-ged-page">
    <section className="ged-hero">
      <div><p className="eyebrow">Your adaptive study path</p><h1>{state.label} {test.label} study plan</h1><p>{profile.name ? `${profile.name}, ` : ''}your answers set the order. We put subjects needing the most practice first, keep sessions to about {focusMinutes} minutes, and bring skills back for review.</p></div>
      <div className="ged-progress" aria-label={`${progressPercent}% of your study plan complete`}><span>Plan progress</span><strong>{progressPercent}%</strong><div className="meter"><i style={{ width: `${progressPercent}%` }} /></div><small>{completed} of {sessions.length} study sessions complete</small></div>
    </section>

    <section className="ged-controls" aria-label="GED plan choices"><div><span>State</span><div className="segmented-control">{Object.entries(gedStates).map(([id, item]) => <button key={id} className={stateId === id ? 'active' : ''} onClick={() => onChooseState(id)}>{item.label}</button>)}</div></div>{stateId === 'louisiana' && <div><span>Testing route</span><div className="segmented-control">{['ged', 'hiset'].map((id) => <button key={id} className={testKey === id ? 'active' : ''} onClick={() => onChooseTest(id)}>{gedTestDetails[id].label}</button>)}</div></div>}<p>Rules can change. Confirm the official state requirements before paying or scheduling.</p></section>

    <section className="plan-builder"><div className="plan-builder-copy"><p className="eyebrow">Build your plan</p><h2>Answer once. Study from here.</h2><p>These answers decide the order of your study sessions. Change them anytime; the plan will rebalance around what you need most.</p></div><div className="plan-builder-controls"><div className="plan-field"><span>How many study days feel realistic each week?</span><div className="segmented-control" role="group" aria-label="Study days per week">{[3, 4, 5].map((days) => <button key={days} className={settings.daysPerWeek === days ? 'active' : ''} onClick={() => onUpdateStudySettings({ daysPerWeek: days })}>{days} days</button>)}</div></div><div className="confidence-grid">{subjects.map((subject) => <div className="confidence-field" key={subject}><span>{gedSubjectLabels[subject]}</span><div className="confidence-options" role="group" aria-label={`${gedSubjectLabels[subject]} confidence`}>{confidenceOptions.map(([value, label]) => <button key={value} className={settings.confidence[subject] === value ? 'active' : ''} onClick={() => onUpdateStudySettings({ confidence: { [subject]: value } })}>{label}</button>)}</div></div>)}</div></div></section>

    <section className="study-next"><div><p className="eyebrow">Your next study session</p><h2>{nextSession.review ? `Review: ${nextSession.module.title}` : nextSession.module.title}</h2><p>{nextSession.module.skill} {getStudyStylePrompt(profile)}</p><div className="study-meta"><span>Week {nextSession.week}, session {nextSession.day}</span><span>{focusMinutes}-minute focus</span><span>{gedSubjectLabels[nextSession.module.subject]}</span></div></div><button className="primary" onClick={() => onOpenStudy(nextSession)}>{completed === sessions.length ? 'Study a review session' : 'Study this session'}</button></section>

    <section className="personal-study-plan"><div className="section-heading"><div><p className="eyebrow">Your eight-week schedule</p><h2>Every card is a study session here in Versed.</h2></div><span className="duration">{settings.daysPerWeek} sessions per week</span></div><div className="session-grid">{sessions.map((session) => { const isComplete = Boolean(studyProgress.completedSessions[session.id]); return <button key={session.id} className={`study-session ${isComplete ? 'complete' : ''}`} onClick={() => onOpenStudy(session)}><div><span>Week {session.week}</span><small>Session {session.day}</small></div><strong>{session.review ? `Review: ${session.module.title}` : session.module.title}</strong><p>{gedSubjectLabels[session.module.subject]}</p><b>{isComplete ? 'Completed - revisit' : session.id === nextSession.id ? 'Study next' : 'Open session'}</b></button>; })}</div></section>

    <section className="ged-overview-grid"><article className="ged-info-card"><p className="eyebrow">Your test route</p><h2>{test.label} subjects</h2><ul>{test.subjects.map((subject) => <li key={subject}>{subject}</li>)}</ul><p className="readiness-note">{test.readiness}</p></article><article className="ged-info-card"><p className="eyebrow">Start here</p><h2>{state.credential} in {state.label}</h2><p>{state.overview}</p><div className="state-facts"><span>{test.subjects.length} subjects</span><span>{settings.daysPerWeek} days a week</span><span>Lessons included</span></div></article></section>

    <section className="state-guidance"><div className="guidance-card"><p className="eyebrow">Eligibility and paperwork</p><h2>Check before you schedule</h2><ul>{state.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="guidance-card"><p className="eyebrow">Testing options</p><h2>Know your route</h2><ul>{state.testing.map((item) => <li key={item}>{item}</li>)}</ul></div></section>

    <section className="official-resources"><div><p className="eyebrow">Official next steps</p><h2>Use the source, not a guess.</h2><p>Verify current rules, practice, and scheduling details through the official providers.</p></div><div className="resource-links">{state.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<span aria-hidden="true">Open</span></a>)}</div></section>
  </main>;
}

function GedStudy({ profile, studySession, onBack, onComplete }) {
  const module = gedStudyModules.find((item) => item.id === studySession.moduleId) || gedStudyModules[0];
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  useEffect(() => { setSelected(''); setSubmitted(false); setShowHint(false); }, [studySession.id]);
  const isCorrect = submitted && selected === module.question.answer;
  const focusMinutes = getFocusMinutes(profile.focusLength);
  const confidence = getGedStudySettings(profile).confidence[module.subject];
  const confidenceLabel = confidenceOptions.find(([value]) => value === confidence)?.[1] || 'Some practice';
  const checkAnswer = () => { if (selected) setSubmitted(true); };

  return <main className="page ged-study-page"><button className="back-link" onClick={onBack}>Back to my study plan</button><section className="study-session-head"><div><p className="eyebrow">Week {studySession.week}, session {studySession.day}</p><h1>{module.title}</h1><p>{module.skill}</p></div><div className="study-time"><span>Your pace</span><strong>{focusMinutes} min</strong><small>{gedSubjectLabels[module.subject]}</small></div></section><section className="study-workspace"><article className="study-lesson"><p className="eyebrow">Key idea</p><h2>Learn the move</h2><p>{module.teach}</p><div className="worked-example"><p className="eyebrow">Worked example</p><p>{module.example}</p></div><p className="study-style-note">{getStudyStylePrompt(profile)}</p></article><article className="study-practice"><p className="eyebrow">Try it now</p><h2>{module.question.prompt}</h2><div className="answer-options" role="group" aria-label="Choose an answer">{module.question.choices.map((choice) => <button key={choice} className={`${selected === choice ? 'selected' : ''} ${submitted && choice === module.question.answer ? 'correct' : ''} ${submitted && selected === choice && choice !== module.question.answer ? 'incorrect' : ''}`} onClick={() => { if (!submitted) setSelected(choice); }}>{choice}</button>)}</div>{!submitted && <div className="practice-actions"><button className="text-button" onClick={() => setShowHint(!showHint)}>{showHint ? 'Hide hint' : 'Show a hint'}</button><button className="primary" disabled={!selected} onClick={checkAnswer}>Check answer</button></div>}{showHint && !submitted && <p className="hint-box">{module.question.hint}</p>}{submitted && isCorrect && <div className="answer-feedback success"><p><b>That is right.</b> {module.question.explanation}</p><button className="primary" onClick={() => onComplete(studySession, module)}>Complete this session</button></div>}{submitted && !isCorrect && <div className="answer-feedback retry"><p><b>Not quite.</b> {module.question.hint}</p><button className="secondary" onClick={() => { setSelected(''); setSubmitted(false); setShowHint(true); }}>Try another answer</button></div>}</article><aside className="study-plan-note"><p className="eyebrow">Why this is next</p><h2>Your plan listens.</h2><p>You said {gedSubjectLabels[module.subject].toLowerCase()} needs <b>{confidenceLabel.toLowerCase()}</b>, so this skill appears early and returns again for review.</p><div><span>State</span><strong>{gedStates[profile.gedState]?.label || 'Washington'}</strong></div><div><span>Route</span><strong>{profile.gedState === 'louisiana' && profile.gedTest === 'hiset' ? 'HiSET' : 'GED'}</strong></div></aside></section></main>;
}

function LearningMap({ profile, session, onSelectLesson }) { return <main className="page map-page"><p className="eyebrow">Coding path - {profile.level}</p><h1>Your learning map</h1><p className="map-intro">Every lesson is here. Choose a unit to begin, revisit, or keep moving forward.</p><div className="map-road">{courseLessons.map((unit, index) => { const completed = session.completedLessonIndexes.includes(index); const current = index === session.lessonIndex && !session.completed; return <button onClick={() => onSelectLesson(index)} className={`map-node ${current ? 'current' : ''} ${completed ? 'complete' : ''}`} key={unit.title}><span>{completed ? 'Done' : index + 1}</span><strong>{unit.title}</strong><small>{completed ? 'Completed - revisit' : current ? 'Current lesson' : 'Start this lesson'}</small></button>; })}</div></main>; }

function getAnalogy(profile, concept) { if (profile.plainMode) return analogies.plain[concept]; return (analogies[profile.interests[0]] || analogies.plain)[concept]; }

export default App;
