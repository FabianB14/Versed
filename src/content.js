export const interestOptions = [
  ['space', 'Space'], ['gaming', 'Gaming'], ['music', 'Music'], ['building', 'Building things'],
  ['nature', 'Nature'], ['sports', 'Sports'], ['cooking', 'Cooking'], ['anime', 'Anime'],
];

export const onboarding = [
  {
    id: 'learningNotes', type: 'multi', eyebrow: '1 of 8', title: 'Which of these sounds like you?',
    subtitle: 'Choose any that feel useful. You can change this whenever you like.',
    options: [
      ['autism', 'I like clear structure and knowing what is next'],
      ['adhd', 'I do well with small wins and variety'],
      ['dyslexia', 'Reading takes extra effort for me'],
      ['dyscalculia', 'Numbers sometimes feel slippery'],
      ['custom', 'A mix of things'],
      ['none', 'Just tune it to me'],
    ],
  },
  { id: 'interests', type: 'interests', eyebrow: '2 of 8', title: 'What do you love?', subtitle: 'Your choices shape examples, projects, and explanations.' },
  {
    id: 'learningStyle', type: 'single', eyebrow: '3 of 8', title: 'How do you like to learn something new?',
    options: [['watch', 'Watch it happen'], ['read', 'Read it slowly'], ['try', 'Try it myself immediately'], ['story', 'Hear it as a story']],
  },
  {
    id: 'focusLength', type: 'single', eyebrow: '4 of 8', title: 'How long feels good before a break?',
    options: [['5', '5 minutes'], ['10', '10 minutes'], ['15', '15 minutes'], ['25', '25 minutes'], ['choose', 'Let me choose each time']],
  },
  {
    id: 'motion', type: 'single', eyebrow: '5 of 8', title: 'Sounds and animations?',
    options: [['full', 'Love them, bring it on'], ['some', 'Some is fine'], ['calm', 'Keep it calm and quiet']],
  },
  {
    id: 'feedback', type: 'single', eyebrow: '6 of 8', title: 'When something feels tricky, what helps?',
    options: [['trace', 'Show me step by step'], ['hint', 'Give me a hint first'], ['example', 'Show a similar example']],
  },
  {
    id: 'track', type: 'single', eyebrow: '7 of 8', title: 'What would you like to explore?',
    options: [['coding', 'Coding'], ['math', 'Math'], ['both', 'Both']],
  },
  {
    id: 'theme', type: 'theme', eyebrow: '8 of 8', title: 'Pick a vibe', subtitle: 'This is your space. Make it feel like yours.',
    options: [['ocean', 'Calm ocean'], ['space', 'Dark mode space'], ['pastel', 'Soft pastel'], ['contrast', 'High contrast'], ['arcade', 'Retro arcade']],
  },
];

export const lessonSteps = ['Warm-up', 'New idea', 'Playground', 'Challenge'];

export const starterPython = `# A program is a set of instructions\nscore = 0\nscore = score + 1\nprint(score)`;
export const starterPseudo = `SET score TO 0\nADD 1 TO score\nDISPLAY score`;

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
