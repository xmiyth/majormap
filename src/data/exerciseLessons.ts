import { ChallengeQuestion } from './majorChallenges';

export const csExamples: Record<string, string> = {
  precise: 'A useful instruction has an action and a measurable amount: "turn left once" can be followed exactly. "Turn a little" requires guessing.',
  route: 'Plan before moving. On a different board, a target one column right and two rows down needs three moves. The order can change, but the destination must be the same. Collect only when you arrive.',
  boundary: 'Debug by comparing expected and actual results. If a counter starts at 4 and one click should add 2, expect 6. A result of 2 suggests the counter was replaced instead of increased.',
  test: 'Trace a small example by hand: starting at 2 and adding 3 twice gives 2 ? 5 ? 8. Test zero actions, one action, and several actions to catch different mistakes.',
  win: 'A condition chooses between outcomes. For a target of 7, score >= 7 accepts both 7 and 8. score == 7 accepts only 7. Pick the rule that matches the goal.',
  predict: 'Work backward from a target. With a target of 8, a score of 2, and 3 points per star, you need 6 more points: two stars. Round up if a partial star would be needed.',
  event: 'An event is something that happens, such as a tap. Its handler changes the app state. A volume button might update volume, then redraw the level indicator. The trigger and the result are different things.',
  play: 'Predict ? run ? compare. Write down the score you expect after one collection, then check the real score. A game is tested by observing its rules, not just reaching its ending.',
  design: 'Separate appearance from behavior. Changing a character color is visual; changing its movement speed affects difficulty. Change one thing at a time so you can explain its effect.',
  project: 'Make a prediction before experimenting. If a game awards 3 points per token and the target is 8, it takes three tokens. Try a different rule, then check whether the result matches your prediction.',
};
const fields: Record<string, string> = {
  psychology: 'A relationship between two measurements does not establish cause. Define what you will measure, consider other explanations, and choose an ethical way to gather evidence.',
  cs: 'Trace a program one step at a time. Compare the expected state with the actual state, especially at the first and last iteration. A fix needs tests, not just a plausible explanation.',
  business: 'A business decision starts with a specific customer problem. Compare possible causes, test one change on a small scale, and measure both demand and the cost of serving it.',
  economics: 'Follow a cause-and-effect chain. When an incentive changes, people may change decisions, which can affect other markets. Use "may" when the outcome depends on circumstances.',
  biology: 'An experiment changes one factor and measures a response. Keep other conditions comparable. A small result suggests a pattern; repeat it before making a broad claim.',
  engineering: 'A design must meet a goal under constraints. Compare alternatives using the same load and materials, measure tradeoffs, and revise the prototype based on evidence.',
  'political-science': 'A policy has benefits, costs, and effects on different groups. Compare who gains access, who pays, and what evidence would show that a trial is working.',
  marketing: 'A message connects a specific audience with a useful benefit. Choose channels that reach that audience, then test whether people take the intended action.',
  finance: 'Compare timing, uncertainty, and possible returns together. A larger potential return may not fit someone who needs reliable cash soon. Ask what happens in a worse-than-expected outcome.',
  communications: 'Useful communication answers who needs to know, what changes, when it happens, and what action to take. Make the most important action easy to find.',
};
const methods = [
  ['Frame the problem', 'Separate observations from assumptions. Name the goal before judging a solution.', 'If a library gets fewer visitors, the observation is lower visits. "Students dislike reading" is only one possible explanation.'],
  ['Choose an approach', 'Compare options against the goal and constraints. Explain the mechanism: how would this choice help?', 'A library might trial later hours for two weeks rather than permanently changing every service at once.'],
  ['Look for evidence', 'Choose information that could support or challenge your idea. Include a comparison or a baseline.', 'Compare visits before and during the trial, and check whether exams or holidays changed at the same time.'],
  ['Defend your decision', 'State a choice, give a reason, and name a limitation or a next test. A strong answer acknowledges uncertainty.', '"I would extend hours because evening visits rose, but I would repeat the trial outside exam week before committing."'],
];
export function lessonForQuestion(majorId: string, step: number, question: ChallengeQuestion) {
  const [title, method, example] = methods[Math.min(step, methods.length - 1)];
  return { title, concept: fields[majorId] ?? 'Define the goal, compare alternatives, and explain your reasoning with evidence.', method: question.type === 'multi' ? method + ' Evaluate each option independently; more than one may be useful.' : question.type === 'text' ? method + ' Use your own words rather than repeating the example.' : method, example };
}
