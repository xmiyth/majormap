const test=require('node:test');const assert=require('node:assert/strict');
const {rankMajors,questions,dimensions}=require('../src/lib/matching.ts');
const {majors}=require('../src/data/majors.ts');
const {answersFor,representative,reachability}=require('../scripts/evaluate.cjs');
test('56 complete profiles, bounded compatibility, independent of catalog order',()=>{
 assert.equal(majors.length,56);
 for(const a of Object.values(representative)) {
  const results=rankMajors(a);assert.equal(results.length,56);
  assert.deepEqual(results,rankMajors(a,[...majors].reverse()));
  for(const r of results){assert.ok(r.score===null||(r.score>=0&&r.score<=100));assert.ok(r.confidence>=0&&r.confidence<=100);}
 }
});
test('missing evidence has no score, weakness or penalty',()=>{
 for(const r of rankMajors({})){assert.equal(r.score,null);assert.equal(r.confidence,0);assert.deepEqual(r.mismatches,[]);}
 const a={'code:interest':'yes','code:evidence':'once'};
 const b={...a,'quant:interest':'no','quant:evidence':'unknown'};
 assert.deepEqual(rankMajors(a),rankMajors(b));
 assert.ok(Math.abs(rankMajors(a).find(r=>r.majorId==='cs').score-95)<1e-10);
});
test('relevance times evidence weighting, confidence separate from score',()=>{
 const a={'code:interest':'yes','code:evidence':'repeated','quant:interest':'no','quant:evidence':'new'};
 const r=rankMajors(a).find(r=>r.majorId==='cs');
 const expectedWeight=1+.72*.35;
 const expectedScore=100*(.95+.72*.35*.18)/expectedWeight;
 assert.ok(Math.abs(r.score-expectedScore)<1e-10);
 assert.ok(Math.abs(r.confidence-100*expectedWeight/3.3)<1e-10);
 const x=rankMajors(answersFor({code:'yes',quant:'yes'},'once')).find(r=>r.majorId==='cs');
 const y=rankMajors(answersFor({code:'yes',quant:'yes'},'repeated')).find(r=>r.majorId==='cs');
 assert.ok(Math.abs(x.score-y.score)<1e-10);assert.ok(x.confidence<y.confidence);
});
test('reject unknown answer ids and choices',()=>{
 assert.throws(()=>rankMajors({invented:'yes'}));assert.throws(()=>rankMajors({'code:interest':'999'}));
});
test('explanations are deterministic and mismatches require measured preferences',()=>{
 const a=answersFor({code:'yes',quant:'no'});const r=rankMajors(a).find(r=>r.majorId==='cs');
 assert.ok(r.reasons.some(t=>t.includes('computing')));assert.ok(r.mismatches.some(t=>t.includes('quantitative')));
 assert.deepEqual(rankMajors(a),rankMajors(a));
});
test('all majors reach Top 5 through complete actual questionnaire responses',()=>{
 const witnesses=reachability();
 for(const major of majors){const w=witnesses[major.id];assert.ok(w.rank<=5,`${major.id}: rank ${w.rank}`);
  assert.equal(Object.keys(w.answers).length,questions.length);
  for(const q of questions)assert.ok(q.options.some(o=>o.id===w.answers[q.id]));
  assert.ok(rankMajors(w.answers).slice(0,5).some(r=>r.majorId===major.id));
 }
});

test('ranking retains differences hidden by display rounding',()=>{
 let found=false;
 for(const witness of Object.values(reachability())) {
  const results=rankMajors(witness.answers);
  for(let i=1;i<results.length;i++){
   const a=results[i-1],b=results[i];
   if(a.score!==null&&b.score!==null&&a.score>b.score&&Math.round(a.score)===Math.round(b.score)){
    found=true;assert.ok(a.score>b.score);assert.deepEqual(results,rankMajors(witness.answers,[...majors].reverse()));
   }
  }
 }
 assert.ok(found,'Evaluation must exercise distinct scores that look tied after rounding');
});


test('broad yes answers do not automatically produce perfect matches',()=>{
 const broad=answersFor(Object.fromEntries(dimensions.map(([id])=>[id,'yes'])),'repeated');
 const results=rankMajors(broad);
 assert.ok(results.every(r=>r.score<100));
 assert.deepEqual(results,rankMajors(broad,[...majors].reverse()));
});
test('sparse alignment stays high without becoming a perfect score or inflating confidence',()=>{
 const sparse=rankMajors({'code:interest':'yes','code:evidence':'new'}).find(r=>r.majorId==='cs');
 assert.ok(Math.abs(sparse.score-95)<1e-10);assert.ok(sparse.confidence<20);
});


test('updating displayed scores preserves the saved snapshot and reports invalid answers',()=>{
 const {withCurrentScores}=require('../src/lib/assessmentResults.ts');
 const answers=answersFor(Object.fromEntries(dimensions.map(([id])=>[id,'yes'])),'repeated');
 const snapshot={id:'original',answers,modelVersion:'interests-v1',results:rankMajors(answers).map(r=>({...r,score:100}))};
 const before=JSON.stringify(snapshot);const display=withCurrentScores(snapshot);
 assert.ok(display.results.every(r=>r.score<100));assert.equal(JSON.stringify(snapshot),before);
 assert.equal(display.id,snapshot.id);assert.equal(display.modelVersion,'interests-v1');
 const invalid=withCurrentScores({...snapshot,answers:{oldQuestion:'oldAnswer'}});
 assert.ok(invalid.scoreError);assert.deepEqual(invalid.results,[]);
});
