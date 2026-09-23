const test=require('node:test');const assert=require('node:assert/strict');
const {majorChallenges,challengeForMajor}=require('../src/data/majorChallenges.ts');
const {summarizeEvidence}=require('../src/lib/challengeEvidence.ts');
const {majors}=require('../src/data/majors.ts');

test('ten requested majors have reusable, complete challenge definitions',()=>{
 const expected=['psychology','cs','business','economics','biology','engineering','political-science','marketing','finance','communications'];
 assert.deepEqual(majorChallenges.map(c=>c.majorId),expected);
 for(const challenge of majorChallenges){
  assert.ok(majors.some(major=>major.id===challenge.majorId));
  assert.ok(challenge.minutes>=5&&challenge.minutes<=10);
  assert.ok(challenge.questions.length>=2&&challenge.questions.length<=5);
  assert.ok(challenge.questions.some(q=>q.type==='text'));
  assert.equal(new Set(challenge.questions.map(q=>q.id)).size,challenge.questions.length);
  for(const question of challenge.questions){assert.ok(question.prompt);if(question.type!=='text')assert.ok(question.options?.length>=2);}
 }
 const types=new Set(majorChallenges.flatMap(c=>c.questions.map(q=>q.type)));
 assert.deepEqual([...types].sort(),['multi','single','text']);
});
test('unsupported majors safely return no challenge',()=>{
 assert.equal(challengeForMajor('architecture'),undefined);
 assert.equal(challengeForMajor('not-a-major'),undefined);
});
test('evidence stays descriptive and requires repeated attempts for consistency labels',()=>{
 const attempt=(id,enjoyment,futureInterest)=>({id,owner:'a',majorId:'psychology',challengeId:'psych-research',responses:{},completedAt:'2026-01-01',enjoyment,difficulty:3,futureInterest,challengeVersion:1});
 assert.equal(summarizeEvidence([]),null);
 assert.deepEqual(summarizeEvidence([attempt('1',5,'yes')]),{completed:1,enjoyment:5,consistency:'Early evidence'});
 assert.equal(summarizeEvidence([attempt('1',5,'yes'),attempt('2',3,'maybe')]).consistency,'Mixed');
 assert.equal(summarizeEvidence([attempt('1',4,'yes'),attempt('2',5,'yes')]).consistency,'Strong');
});
