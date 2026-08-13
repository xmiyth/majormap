import { CategoryKey, QuizQuestion } from '../types';

export const questions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'If you were given £10 million to improve the world, what would you do?',
    options: [
      { label: 'Build tools to help people learn faster', categories: ['Technology', 'Business'] },
      { label: 'Support mental health services in schools', categories: ['Health', 'Psychology'] },
      { label: 'Launch a community startup hub', categories: ['Business', 'Entrepreneurship'] },
    ],
  },
  {
    id: 'q2',
    text: 'Which activity sounds most exciting?',
    options: [
      { label: 'Designing a mobile app for everyday life', categories: ['Technology', 'Arts'] },
      { label: 'Analyzing what makes people choose one product over another', categories: ['Business', 'Economics'] },
      { label: 'Studying how the brain reacts during stress', categories: ['Psychology', 'Health'] },
    ],
  },
  {
    id: 'q3',
    text: 'What type of class would you pick first?',
    options: [
      { label: 'A coding challenge class', categories: ['Technology', 'Engineering'] },
      { label: 'A course about creating persuasive campaigns', categories: ['Business', 'Arts'] },
      { label: 'A lab that studies living systems', categories: ['Science', 'Health'] },
    ],
  },
  {
    id: 'q4',
    text: 'When solving a problem, you prefer:',
    options: [
      { label: 'Building a working prototype', categories: ['Engineering', 'Technology'] },
      { label: 'Finding the story behind the data', categories: ['Economics', 'Business'] },
      { label: 'Learning how people feel and react', categories: ['Psychology', 'Humanities'] },
    ],
  },
  {
    id: 'q5',
    text: 'Which description fits you best?',
    options: [
      { label: 'I enjoy creating and improving digital experiences', categories: ['Technology', 'Animation'] },
      { label: 'I love understanding how the world makes decisions', categories: ['Business', 'Economics'] },
      { label: 'I care about supporting people and teams', categories: ['Psychology', 'Education'] },
    ],
  },
  {
    id: 'q6',
    text: 'What would you rather do in a group project?',
    options: [
      { label: 'Lead the design and user experience', categories: ['Arts', 'Animation'] },
      { label: 'Organize the plan and make sure everyone succeeds', categories: ['Business', 'Entrepreneurship'] },
      { label: 'Solve technical challenges and build the final result', categories: ['Technology', 'Engineering'] },
    ],
  },
  {
    id: 'q7',
    text: 'What kind of future role feels motivating?',
    options: [
      { label: 'A role that blends creativity with technology', categories: ['Animation', 'Technology'] },
      { label: 'A role focused on improving business outcomes', categories: ['Business', 'Economics'] },
      { label: 'A role helping people learn and grow', categories: ['Psychology', 'Education'] },
    ],
  },
  {
    id: 'q8',
    text: 'Which study plan excites you most?',
    options: [
      { label: 'A mix of coding, AI, and digital tools', categories: ['Technology', 'Arts'] },
      { label: 'A mix of market research, strategy, and teamwork', categories: ['Business', 'Economics'] },
      { label: 'A mix of behavior science, counseling, and writing', categories: ['Psychology', 'Health'] },
    ],
  },
  {
    id: 'q9',
    text: 'What kind of problem would you rather solve?',
    options: [
      { label: 'How to make technology easier to use', categories: ['Technology', 'Animation'] },
      { label: 'How to help companies grow responsibly', categories: ['Business', 'Economics'] },
      { label: 'How to support student wellbeing and motivation', categories: ['Psychology', 'Health'] },
    ],
  },
  {
    id: 'q10',
    text: 'How do you want your work to feel?',
    options: [
      { label: 'Creative and design-focused', categories: ['Arts', 'Animation'] },
      { label: 'Strategic and impact-driven', categories: ['Business', 'Economics'] },
      { label: 'Supportive and people-centered', categories: ['Psychology', 'Education'] },
    ],
  },
];
