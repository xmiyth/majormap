export type ChallengeResponse = string | string[];
export type ChallengeQuestion = {
  id: string;
  prompt: string;
  type: 'single' | 'multi' | 'text';
  options?: string[];
  helper?: string;
  explanation?: string;
};
export type MajorChallenge = {
  id: string;
  majorId: string;
  version: number;
  title: string;
  scenario: string;
  minutes: number;
  questions: ChallengeQuestion[];
};

const q = (id: string, prompt: string, type: ChallengeQuestion['type'], options?: string[], helper?: string): ChallengeQuestion => ({ id, prompt, type, options, helper });

export const majorChallenges: MajorChallenge[] = [
  { id:'psych-research', majorId:'psychology', version:1, title:'Design a Research Study', minutes:7, scenario:'A school notices that students who sleep less tend to report higher stress.', questions:[
    q('hypothesis','Which hypothesis could this study examine?','single',['Less sleep is associated with higher reported stress','Stress is always caused by lack of sleep','All students need exactly eight hours of sleep']),
    q('variables','Which variables should be measured?','multi',['Hours of sleep','Reported stress level','Favorite school subject','Relevant factors such as workload']),
    q('method','Which approach would you start with?','single',['Survey sleep and stress over several weeks','Ask one student for an opinion','Assign students to avoid sleep']),
    q('plan','Briefly describe how you would test the relationship fairly.','text',undefined,'There can be more than one reasonable design.'),
  ]},
  { id:'cs-debug', majorId:'cs', version:1, title:'Logic & Debugging Challenge', minutes:6, scenario:'A program should total the numbers 1 through 5, but it stops before adding 5: total = 0; for n from 1 while n < 5: total = total + n.', questions:[
    q('bug','What is the main problem?','single',['The stopping condition excludes 5','The total should begin at 1','Addition cannot be used in a loop']),
    q('fix','Which change fixes it?','single',['Use n ≤ 5','Use n > 5','Remove the loop']),
    q('test','Which test results would help confirm the fix?','multi',['An empty range totals 0','1 through 5 totals 15','1 through 3 totals 6','The screen color looks correct']),
    q('explain','Explain why your change works.','text'),
  ]},
  { id:'business-growth', majorId:'business', version:1, title:'Plan the Next Stage of Growth', minutes:7, scenario:'A small company has a popular reusable bottle, but sales have stopped growing.', questions:[
    q('problem','What should the company investigate first?','multi',['Whether customers repurchase','Which groups know the product','Profit per sale','The founder’s favorite color']),
    q('strategy','Choose an initial growth strategy.','single',['Reach a new customer segment','Cut every price immediately','Launch many unrelated products']),
    q('measure','Which evidence would best test the strategy?','multi',['Customer interviews','A small campaign experiment','Sales and margin data','A competitor’s logo']),
    q('recommendation','Explain your recommendation and one risk.','text'),
  ]},
  { id:'economics-rates', majorId:'economics', version:1, title:'Reason Through an Economic Shift', minutes:6, scenario:'Inflation rises substantially, and interest rates also rise.', questions:[
    q('borrowing','What is a likely near-term effect on borrowing?','single',['Borrowing generally becomes more expensive','All borrowing becomes free','Interest rates have no connection to borrowing costs']),
    q('effects','Which effects are plausible?','multi',['Some consumers delay large purchases','Mortgage payments may rise for new borrowers','Housing demand may cool','Every household responds identically']),
    q('evidence','What evidence would you examine before making a firm conclusion?','multi',['Loan rates','Consumer spending data','Housing sales','One social-media post']),
    q('reasoning','Explain one likely effect and what could make it different.','text'),
  ]},
  { id:'biology-light', majorId:'biology', version:1, title:'Investigate Plant Growth', minutes:6, scenario:'Seedlings receive 2, 6, or 10 hours of light. After three weeks their average heights are 8 cm, 14 cm, and 13 cm.', questions:[
    q('hypothesis','Choose a testable hypothesis.','single',['Growth changes with daily light exposure','Light always makes every plant taller','Plants do not respond to their environment']),
    q('variables','Which elements belong in the investigation?','multi',['Hours of light as the independent variable','Plant height as the dependent variable','The same soil and water','Different plant species in every group']),
    q('result','What does this small result suggest?','single',['Six hours produced the greatest average height here','Ten hours always kills plants','Two hours guarantees no growth']),
    q('next','Describe one useful next step or limitation.','text'),
  ]},
  { id:'engineering-structure', majorId:'engineering', version:1, title:'Strengthen a Lightweight Structure', minutes:7, scenario:'A pedestrian bridge model must support more weight without becoming much heavier.', questions:[
    q('changes','Which changes are worth testing?','multi',['Add triangular bracing','Redistribute material near high-stress joints','Make every part solid','Remove all cross supports']),
    q('choice','Which first prototype is most reasonable?','single',['A braced design using the same material','A design twice as heavy','A visually identical model with no measurements']),
    q('tradeoffs','Which tradeoffs should be measured?','multi',['Load capacity','Added mass','Material cost','Logo size']),
    q('justify','Justify your design and describe how you would test it.','text'),
  ]},
  { id:'policy-traffic', majorId:'political-science', version:1, title:'Compare Public Policy Options', minutes:8, scenario:'A city wants to reduce traffic congestion while keeping travel accessible.', questions:[
    q('options','Which policies could be combined in a pilot?','multi',['Public transportation investment','Congestion pricing','Cycling infrastructure','Additional road capacity']),
    q('tradeoff','Which is a relevant tradeoff?','single',['Travel time, cost, access, and neighborhood effects','Only whether the policy has a catchy name','Whether every resident has identical preferences']),
    q('evidence','What evidence should officials examine?','multi',['Traffic counts','Transit access by neighborhood','Cost and emissions estimates','Only comments supporting one option']),
    q('recommend','Recommend an approach and name a tradeoff.','text',undefined, 'Reason from evidence; no political viewpoint is expected.'),
  ]},
  { id:'marketing-launch', majorId:'marketing', version:1, title:'Position a New Product', minutes:7, scenario:'A company is launching an affordable planning app for high-school and university-age consumers.', questions:[
    q('audience','Choose a useful first audience.','single',['Students balancing classes and activities','Every person of every age','Only people who already use the app']),
    q('message','Which positioning is clearest?','single',['Plan school and life in one simple place','The world’s best app, guaranteed','It has many unspecified features']),
    q('channels','Which channels could test that message?','multi',['Student organization partnerships','Short-form video demonstrations','A small campus ambassador pilot','Unrelated luxury catalogs']),
    q('why','Explain why the message and channels fit the audience.','text'),
  ]},
  { id:'finance-projects', majorId:'finance', version:1, title:'Compare Two Investments', minutes:7, scenario:'Project A has a steadier, moderate return over two years. Project B may return more over five years but has greater uncertainty.', questions:[
    q('factors','Which factors matter to the decision?','multi',['Risk tolerance','When cash is needed','Expected return','The project name']),
    q('short','Which project better fits a company needing reliable cash soon?','single',['Project A','Project B regardless of risk','They are identical']),
    q('evidence','What additional information would help?','multi',['Range of possible outcomes','Upfront cost','Strategic value','The manager’s favorite number']),
    q('recommend','Choose a project for a stated goal and explain the tradeoff.','text'),
  ]},
  { id:'communications-change', majorId:'communications', version:1, title:'Communicate an Important Change', minutes:6, scenario:'A university is changing the deadline and process for course registration.', questions:[
    q('audiences','Who needs tailored communication?','multi',['Current students','Academic advisers','Support staff','People unaffected by registration']),
    q('channel','Choose the strongest channel mix.','single',['Direct email plus portal notice and adviser briefing','One temporary poster','A vague social post after the deadline']),
    q('message','Which opening is clearest?','single',['Registration now closes Friday: review the new steps below','Important changes are happening sometime','Everything is different']),
    q('draft','Write a concise key message including the action and deadline.','text'),
  ]},
];

export const challengeForMajor = (majorId: string) => majorChallenges.find(challenge => challenge.majorId === majorId);
