export type SatDifficulty = 'Easy' | 'Medium' | 'Hard';

export type DailySatQuestion = {
  id: string;
  section: 'Math' | 'Reading & Writing';
  domain: string;
  difficulty: SatDifficulty;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

// Original SAT-style practice written for MajorMap. No College Board items are reproduced here.
export const dailySatQuestions: DailySatQuestion[] = [
  {
    id: 'm-linear-1', section: 'Math', domain: 'Algebra', difficulty: 'Easy',
    prompt: 'If 3x + 7 = 25, what is the value of x?',
    options: ['4', '6', '8', '10'], answer: 1,
    explanation: 'Subtract 7 from both sides to get 3x = 18, then divide by 3. Therefore, x = 6.',
  },
  {
    id: 'm-percent-1', section: 'Math', domain: 'Problem-Solving and Data Analysis', difficulty: 'Easy',
    prompt: 'A jacket originally costs $80 and is discounted by 25%. What is its sale price?',
    options: ['$20', '$55', '$60', '$65'], answer: 2,
    explanation: 'The discount is 0.25 × 80 = 20 dollars. Subtracting gives 80 − 20 = 60 dollars.',
  },
  {
    id: 'm-ratio-1', section: 'Math', domain: 'Problem-Solving and Data Analysis', difficulty: 'Easy',
    prompt: 'A recipe uses flour and sugar in a ratio of 5:2. If 15 cups of flour are used, how many cups of sugar are needed?',
    options: ['4', '6', '7.5', '10'], answer: 1,
    explanation: 'The flour amount was multiplied by 3, from 5 to 15, so the sugar amount is also multiplied by 3: 2 × 3 = 6.',
  },
  {
    id: 'm-function-1', section: 'Math', domain: 'Advanced Math', difficulty: 'Medium',
    prompt: 'The function f is defined by f(x) = x² − 4x + 7. What is f(3)?',
    options: ['2', '4', '7', '10'], answer: 1,
    explanation: 'Substitute 3 for x: 3² − 4(3) + 7 = 9 − 12 + 7 = 4.',
  },
  {
    id: 'm-system-1', section: 'Math', domain: 'Algebra', difficulty: 'Medium',
    prompt: 'For the system y = 2x + 1 and y = −x + 10, what is the value of x at the intersection?',
    options: ['2', '3', '4', '9'], answer: 1,
    explanation: 'Set the expressions for y equal: 2x + 1 = −x + 10. Then 3x = 9, so x = 3.',
  },
  {
    id: 'm-mean-1', section: 'Math', domain: 'Problem-Solving and Data Analysis', difficulty: 'Medium',
    prompt: 'The mean of five numbers is 18. Four of the numbers are 12, 16, 19, and 21. What is the fifth number?',
    options: ['20', '21', '22', '23'], answer: 2,
    explanation: 'The five numbers total 5 × 18 = 90. The four known numbers total 68, so the fifth is 90 − 68 = 22.',
  },
  {
    id: 'm-quadratic-1', section: 'Math', domain: 'Advanced Math', difficulty: 'Hard',
    prompt: 'For what positive value of k does x² − 10x + k = 0 have exactly one real solution?',
    options: ['10', '20', '25', '50'], answer: 2,
    explanation: 'Exactly one real solution occurs when the discriminant is zero: (−10)² − 4(1)(k) = 0. Thus 100 − 4k = 0 and k = 25.',
  },
  {
    id: 'm-exponential-1', section: 'Math', domain: 'Advanced Math', difficulty: 'Hard',
    prompt: 'A population is modeled by P(t) = 600(1.08)ᵗ, where t is measured in years. Which statement best describes 1.08?',
    options: ['The population starts at 1.08', 'The population increases by 8% each year', 'The population increases by 108 each year', 'The population doubles every 8 years'], answer: 1,
    explanation: 'In an exponential model, 1 + r is the growth factor. Since 1.08 = 1 + 0.08, the annual increase is 8%.',
  },
  {
    id: 'rw-transition-1', section: 'Reading & Writing', domain: 'Expression of Ideas', difficulty: 'Easy',
    prompt: 'Mina expected the trail to be crowded. _____, she encountered only two other hikers during the entire afternoon.',
    options: ['Similarly', 'However', 'For example', 'Therefore'], answer: 1,
    explanation: 'The second sentence contrasts with Mina’s expectation, so “However” is the most logical transition.',
  },
  {
    id: 'rw-boundary-1', section: 'Reading & Writing', domain: 'Standard English Conventions', difficulty: 'Easy',
    prompt: 'The research team collected soil samples from six locations _____ the samples were then analyzed in a laboratory.',
    options: [',', ';', ': and', 'because'], answer: 1,
    explanation: 'Both sides are independent clauses. A semicolon correctly joins two closely related independent clauses.',
  },
  {
    id: 'rw-precision-1', section: 'Reading & Writing', domain: 'Craft and Structure', difficulty: 'Medium',
    prompt: 'Because the newly discovered letters clarified several disputed dates, historians considered them _____ to the investigation.',
    options: ['ordinary', 'incidental', 'invaluable', 'questionable'], answer: 2,
    explanation: 'The letters resolved uncertainty, so “invaluable,” meaning extremely useful, is the most precise choice.',
  },
  {
    id: 'rw-inference-1', section: 'Reading & Writing', domain: 'Information and Ideas', difficulty: 'Medium',
    prompt: 'A city replaced several downtown parking spaces with protected bicycle lanes. During the following year, bicycle traffic increased by 35%, while total visits to downtown businesses remained stable. Which conclusion is best supported?',
    options: ['The bicycle lanes caused business visits to decline.', 'Most downtown visitors now travel by bicycle.', 'Adding the lanes coincided with more bicycle traffic without reducing total business visits.', 'Parking spaces have no effect on transportation choices.'], answer: 2,
    explanation: 'The evidence supports only the measured association: bicycle traffic rose and business visits did not fall.',
  },
  {
    id: 'rw-notes-1', section: 'Reading & Writing', domain: 'Expression of Ideas', difficulty: 'Medium',
    prompt: 'A student wants to emphasize the scale of a library’s growth. Notes: It opened in 1998 with 4,000 books. It now holds 28,000 books. Which choice best uses the notes?',
    options: ['The library opened in 1998.', 'The library has books and other materials.', 'Since opening with 4,000 books in 1998, the library’s collection has grown sevenfold to 28,000.', 'The library’s collection is currently larger than it was before.'], answer: 2,
    explanation: 'This choice uses both figures and explicitly communicates the sevenfold scale of the collection’s growth.',
  },
  {
    id: 'rw-agreement-1', section: 'Reading & Writing', domain: 'Standard English Conventions', difficulty: 'Hard',
    prompt: 'Neither the lead researcher nor the assistants _____ prepared to publish the preliminary findings.',
    options: ['was', 'is', 'were', 'has been'], answer: 2,
    explanation: 'With “neither...nor,” the verb agrees with the nearer subject. “Assistants” is plural, so “were” is correct.',
  },
  {
    id: 'rw-purpose-1', section: 'Reading & Writing', domain: 'Craft and Structure', difficulty: 'Hard',
    prompt: 'A report first describes a decline in a wetland bird population, then presents evidence that restored nesting areas increased the number of chicks that survived. What is the main purpose of the evidence?',
    options: ['To question whether the population declined', 'To identify a possible response to the decline', 'To prove that all wetlands should be closed to visitors', 'To compare the bird with unrelated species'], answer: 1,
    explanation: 'The restoration evidence presents a potentially effective response to the population decline described earlier.',
  },
  {
    id: 'rw-synthesis-1', section: 'Reading & Writing', domain: 'Information and Ideas', difficulty: 'Hard',
    prompt: 'Two studies examine remote work. Study A finds higher employee satisfaction; Study B finds that results depend strongly on access to quiet workspace. Which statement best synthesizes both findings?',
    options: ['Remote work always improves satisfaction.', 'Remote work never benefits employees without home offices.', 'Remote work may improve satisfaction, but working conditions can influence its effectiveness.', 'The studies reach completely unrelated conclusions.'], answer: 2,
    explanation: 'This choice preserves Study A’s positive finding while incorporating Study B’s qualification about working conditions.',
  },
];
