export const interestOptions = [
  ['space', 'Space'], ['gaming', 'Gaming'], ['music', 'Music'], ['building', 'Building things'],
  ['nature', 'Nature'], ['sports', 'Sports'], ['cooking', 'Cooking'], ['anime', 'Anime'],
];

export const onboarding = [
  {
    id: 'name', type: 'text', eyebrow: '1 of 11', title: 'What should we call you?',
    subtitle: 'A first name or nickname is perfect. It makes this space feel more like yours.', placeholder: 'Type a name or nickname',
  },
  {
    id: 'learningNotes', type: 'multi', eyebrow: '2 of 11', title: 'Have you been diagnosed with, or do you identify with, any of these?',
    subtitle: 'Choose anything that helps this space fit you. Sharing is optional, and you can change this anytime.',
    options: [['autism', 'Autism'], ['adhd', 'ADHD'], ['dyslexia', 'Dyslexia'], ['dyscalculia', 'Dyscalculia'], ['multiple', 'More than one'], ['none', 'No diagnosis'], ['private', 'Prefer not to say']],
  },
  { id: 'interests', type: 'interests', eyebrow: '3 of 11', title: 'What do you love?', subtitle: 'Your choices shape examples, projects, and explanations.' },
  {
    id: 'learningStyle', type: 'single', eyebrow: '4 of 11', title: 'How do you like to learn something new?',
    options: [['watch', 'Watch it happen'], ['read', 'Read it slowly'], ['try', 'Try it myself immediately'], ['story', 'Hear it as a story']],
  },
  {
    id: 'focusLength', type: 'single', eyebrow: '5 of 11', title: 'How long feels good before a break?',
    options: [['5', '5 minutes'], ['10', '10 minutes'], ['15', '15 minutes'], ['25', '25 minutes'], ['choose', 'Let me choose each time']],
  },
  {
    id: 'motion', type: 'single', eyebrow: '6 of 11', title: 'Sounds and animations?',
    options: [['full', 'Love them, bring it on'], ['some', 'Some is fine'], ['calm', 'Keep it calm and quiet']],
  },
  {
    id: 'readingPreference', type: 'single', eyebrow: '7 of 11', title: 'What helps reading feel comfortable?',
    options: [['standard', 'Regular text'], ['friendly', 'Easy-reading font and extra space'], ['listen', 'Read it out loud'], ['both', 'Easy-reading font and read aloud']],
  },
  {
    id: 'feedback', type: 'single', eyebrow: '8 of 11', title: 'When something feels tricky, what helps?',
    options: [['trace', 'Show me step by step'], ['hint', 'Give me a hint first'], ['example', 'Show a similar example']],
  },
  {
    id: 'track', type: 'single', eyebrow: '9 of 11', title: 'What would you like to explore?',
    options: [['coding', 'Coding'], ['math', 'Math'], ['both', 'Both']],
  },
  {
    id: 'codingExperience', type: 'single', eyebrow: '10 of 11', title: 'Have you ever coded before?',
    options: [['never', 'Never'], ['little', 'A little'], ['some', 'Some'], ['lots', 'A lot']],
  },
  {
    id: 'theme', type: 'theme', eyebrow: '11 of 11', title: 'Pick a vibe', subtitle: 'This is your space. Make it feel like yours.',
    options: [['ocean', 'Calm ocean'], ['space', 'Dark mode space'], ['pastel', 'Soft pastel'], ['contrast', 'High contrast'], ['arcade', 'Retro arcade']],
  },
];

export const lessonSteps = ['Warm-up', 'New idea', 'Playground', 'Challenge'];

export const starterPrograms = {
  beginner: {
    python: `# A program follows instructions in order\nscore = 0\nscore = score + 1\nprint(score)`,
    pseudo: `SET score TO 0\nADD 1 TO score\nDISPLAY score`,
    cpp: `int score = 0;\nscore = score + 1;\nstd::cout << score;`,
  },
  intermediate: {
    python: `score = 0\nfor lap in range(3):\n  score = score + 2\nprint(score)`,
    pseudo: `SET score TO 0\nREPEAT 3 TIMES\n  ADD 2 TO score\nEND REPEAT\nDISPLAY score`,
    cpp: `int score = 0;\nfor (int lap = 0; lap < 3; lap++) {\n  score = score + 2;\n}\nstd::cout << score;`,
  },
  advanced: {
    python: `score = 4\nif score > 3:\n  score = score * 2\nprint(score)`,
    pseudo: `SET score TO 4\nADD score TO score\nDISPLAY score`,
    cpp: `int score = 4;\nif (score > 3) {\n  score = score * 2;\n}\nstd::cout << score;`,
  },
};

export const levelOptions = [
  ['beginner', 'Beginner', 'Build confidence with variables and output.'],
  ['intermediate', 'Intermediate', 'Explore repeated steps and loops.'],
  ['advanced', 'Advanced', 'Use decisions and multi-step logic.'],
];

export const analogies = {
  space: { variable: 'a labeled cargo bay that keeps one item ready', loop: 'an orbit that follows the same path again' },
  gaming: { variable: 'a named inventory slot that holds one item', loop: 'replaying the same game move until the round ends' },
  music: { variable: 'a labeled track holding one sound', loop: 'a beat that repeats in the same pattern' },
  building: { variable: 'a labeled bin that holds one tool', loop: 'repeating the same building step for each row' },
  cooking: { variable: 'a labeled jar in the pantry', loop: 'stirring the same number of times' },
  nature: { variable: 'a labeled nest holding one thing safely', loop: 'a bird flying the same migration path' },
  sports: { variable: 'a scoreboard slot with a name', loop: 'running laps around the same track' },
  plain: { variable: 'a named place where the program stores a value', loop: 'doing a set of instructions more than once' },
};
