const {dimensions,questions,rankMajors}=require('../src/lib/matching.ts');
const {majors}=require('../src/data/majors.ts');
function answersFor(preferences,experience='once') {
 return Object.fromEntries(dimensions.flatMap(([id])=>[[`${id}:interest`,preferences[id]??'no'],[`${id}:evidence`,experience]]));
}
const representative={
 'Broad interests':answersFor(Object.fromEntries(dimensions.map(([id])=>[id,'yes'])),'repeated'),
 'Undecided':Object.fromEntries(questions.map(q=>[q.id,'unknown'])),
 'New to computing':answersFor({code:'yes',quant:'yes',build:'some'},'new'),
 'Hands-on healthcare':answersFor({care:'yes',people:'yes',lab:'some',nature:'some'}),
 'Creative storyteller':answersFor({visual:'yes',perform:'yes',words:'some'}),
 'Public issues and writing':answersFor({society:'yes',words:'yes',people:'some'}),
 'Quantitative business':answersFor({quant:'yes',enterprise:'yes',society:'some'}),
 'Experimental science':answersFor({lab:'yes',nature:'yes',quant:'some'}),
};
// Search only legal, complete questionnaire responses; never read major profiles.
// Seeded coordinate search retains concrete witnesses for independent replay.
function reachability() {
 let seed=431;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const witnesses={};
 for(const major of majors) {
  let bestRank=Infinity,bestAnswers;
  for(let restart=0;restart<12&&bestRank>5;restart++) {
   let answers=answersFor(Object.fromEntries(dimensions.map(([id])=>[id,['no','some','yes'][Math.floor(random()*3)]])));
   const quality=a=>{const r=rankMajors(a);const index=r.findIndex(x=>x.majorId===major.id);return {rank:index+1,loss:(r[0].score-r[index].score)*100+index};};
   let q=quality(answers);
   for(let sweep=0;sweep<5;sweep++) {
    let changed=false;
    const shuffled=[...dimensions];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    for(const [id] of shuffled) {
     for(const option of ['no','little','some','yes']) {
      const trial={...answers,[`${id}:interest`]:option};const next=quality(trial);
      if(next.loss<q.loss){answers=trial;q=next;changed=true;}
     }
    }
    if(!changed)break;
   }
   if(q.rank<bestRank){bestRank=q.rank;bestAnswers=answers;}
  }
  witnesses[major.id]={rank:bestRank,answers:bestAnswers};
 }
 return witnesses;
}
module.exports={answersFor,representative,reachability};
if(require.main===module) {
 for(const [name,answers] of Object.entries(representative)) {
  console.log(`\n${name} — Top 10`);
  rankMajors(answers).slice(0,10).forEach((m,i)=>console.log(`${i+1}. ${majors.find(x=>x.id===m.majorId).title}: ${m.score===null?'unmeasured':m.score.toFixed(2)}; confidence ${m.confidence.toFixed(1)}`));
 }
 const witnesses=reachability();
 const fs=require('node:fs');fs.mkdirSync('evaluation',{recursive:true});fs.writeFileSync('evaluation/reachability.json',JSON.stringify(witnesses,null,2));
 const failed=Object.entries(witnesses).filter(([,w])=>w.rank>5);
 console.log(`\nQuestionnaire reachability: ${majors.length-failed.length}/${majors.length} in Top 5. Worst rank: ${Math.max(...Object.values(witnesses).map(w=>w.rank))}`);
 if(failed.length){console.error(failed.map(([id,w])=>`${id}: ${w.rank}`).join('\n'));process.exitCode=1;}
}
