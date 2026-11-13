import { majors } from '../data/majors';
import { Major } from '../types';
export const MODEL_VERSION = 'interests-v5';
export const dimensions = [
 ['quant','quantitative reasoning','Solve number puzzles or spot patterns in data'],
 ['code','computing','Write code or figure out why a program is not working'],
 ['build','physical design','Build models, circuits, machines, or useful spaces'],
 ['nature','natural systems','Investigate living things, ecosystems, or the universe'],
 ['lab','experimentation','Run careful experiments and compare observations'],
 ['care','individual support','Help someone with health or personal challenges'],
 ['people','human behavior','Explore how people think, learn, and interact'],
 ['enterprise','organizations and markets','Plan a product, budget, or business idea'],
 ['society','society and institutions','Learn about cultures, social issues, or governments'],
 ['words','language and argument','Read, write, or explain your point of view'],
 ['visual','visual creativity','Create images, layouts, spaces, or visual stories'],
 ['perform','expression and presentation','Perform, give a presentation, or entertain an audience'],
] as const;
export type Answers = Record<string,string>;
export const preferenceOptions = [
 {id:'yes',label:'A lot',value:1}, {id:'some',label:'Quite a bit',value:.65},
 {id:'little',label:'A little',value:.3}, {id:'no',label:'Not really',value:0}, {id:'unknown',label:'Not sure yet',value:null},
];
export const evidenceOptions = [
 {id:'repeated',label:'Tried it several times',strength:1}, {id:'once',label:'Tried something similar once',strength:.7},
 {id:'new',label:'I have not tried it yet',strength:.35}, {id:'unknown',label:'Not sure',strength:0},
];
export const questions = dimensions.flatMap(([id,label,activity]) => [
 {id:`${id}:interest`,text:`Would you enjoy this? ${activity}.`,options:preferenceOptions},
 {id:`${id}:evidence`,text:`Have you done something like this? ${activity}.`,options:evidenceOptions},
]);
// Ordered activity profiles: primary, secondary, then supporting activities.
// Every dimension has some relevance because a complete preference shape is more
// informative than a few positive answers. Low-relevance dimensions have little effect,
// and still have zero effect when they are unmeasured.
const profiles: Record<string,string> = {
 "luxury-management": "enterprise people visual",
 "fashion-design": "visual build perform",
 "fashion-management": "enterprise visual people",
 "textile-design": "visual build nature",
 "textile-development": "lab enterprise build",
 "accessory-design": "visual build enterprise",
 "jewelry-design": "visual build lab",
 "footwear-design": "visual build people",
 "fashion-communication": "words visual enterprise",
 "industrial-design": "visual build people",
 "quantitative-finance": "quant code enterprise",
 "financial-engineering": "quant enterprise code",
 "econometrics": "quant lab society",
 "quantitative-economics": "quant society enterprise",
 "operations-research": "quant code enterprise",
 "applied-mathematics": "quant code nature",
 "business-analytics": "enterprise quant code",
 "risk-management": "enterprise quant society",
 "fintech": "code enterprise quant",
 "retail-management": "enterprise people quant",

 'aerospace-engineering':'build quant nature code', 'chemical-engineering':'lab build quant nature',
 'computer-engineering':'code build quant', 'environmental-engineering':'build nature society',
 'industrial-engineering':'enterprise build quant people', 'materials-engineering':'lab build nature',
 mechatronics:'build code quant', 'petroleum-engineering':'build nature enterprise',
 'nuclear-engineering':'quant lab build', 'marine-engineering':'build nature quant',
 'automotive-engineering':'build quant code', 'manufacturing-engineering':'build enterprise lab',
 'structural-engineering':'build quant visual', 'geological-engineering':'nature build lab',
 'agricultural-engineering':'nature build enterprise', 'systems-engineering':'build enterprise code',
 statistics:'quant lab code', 'actuarial-science':'quant enterprise lab', geology:'nature lab build', 'food-science':'lab nature enterprise',

 cs:'code quant build', economics:'quant enterprise society', psychology:'people lab care', business:'enterprise people words', engineering:'build quant nature', architecture:'build visual society', biology:'nature lab quant', animation:'visual perform code',
 nursing:'care people lab', 'environmental-science':'nature society lab', 'data-science':'quant code lab', marketing:'enterprise perform people', 'graphic-design':'visual words enterprise', 'mechanical-engineering':'build quant lab', 'political-science':'society words enterprise', education:'people words perform', finance:'quant enterprise words', chemistry:'lab quant nature', journalism:'words society perform', cybersecurity:'code society quant', 'public-health':'care society quant', 'ux-design':'visual people code',
 'software-engineering':'code build people', 'artificial-intelligence':'code quant people', 'information-systems':'code enterprise people', 'game-design':'code visual people perform', 'electrical-engineering':'build code quant lab', 'civil-engineering':'build society quant', 'biomedical-engineering':'build care lab', robotics:'build code people', mathematics:'quant words code', physics:'quant lab nature', astronomy:'nature quant code', neuroscience:'people nature lab', biochemistry:'lab nature quant care', 'pre-medicine':'care lab nature', pharmacy:'lab care quant', nutrition:'care nature people', accounting:'enterprise quant words', entrepreneurship:'enterprise build perform', 'supply-chain':'enterprise build quant', 'international-business':'enterprise society words perform', law:'words society people', 'criminal-justice':'society care lab', sociology:'society people lab', anthropology:'society nature people', history:'society words nature', english:'words perform society', philosophy:'words quant people', 'international-relations':'society words people perform', communications:'words people perform enterprise', film:'visual perform words', music:'perform quant people', 'interior-design':'visual build people', 'social-work':'care people society', 'special-education':'people care words',
};
export type Match = {majorId:string;score:number|null;confidence:number;reasons:string[];mismatches:string[]};
export function validateAnswers(answers:Answers) {
 for(const [id,value] of Object.entries(answers)) {
  const q=questions.find(q=>q.id===id);
  if(!q || !q.options.some(o=>o.id===value)) throw new Error('Invalid assessment answer');
 }
}
export function rankMajors(answers:Answers,catalog:Major[]=majors):Match[] {
 validateAnswers(answers);
 return catalog.map(major=>{
  const emphasis=profiles[major.id]?.split(' ');
  if(!emphasis) throw new Error(`Missing major profile: ${major.id}`);
  let total=0,weight=0,possible=0;
  const support:{text:string;weight:number;fit:number;relevance:number}[]=[];
  for(const [id,label] of dimensions) {
   const index=emphasis.indexOf(id);
   const relevance = index === 0 ? 1 : index === 1 ? .72 : index === 2 ? .5 : index === 3 ? .35 : .12;
   const target = index === 0 ? .95 : index === 1 ? .82 : index === 2 ? .64 : index === 3 ? .52 : .18;
   possible+=relevance;
   const value=preferenceOptions.find(o=>o.id===answers[`${id}:interest`])?.value;
   const strength=evidenceOptions.find(o=>o.id===answers[`${id}:evidence`])?.strength??0;
   if(value==null || !strength) continue;
   const w=relevance*strength,fit=1-Math.abs(value-target);
   total+=w*fit; weight+=w; support.push({text:label,weight:w,fit,relevance});
  }
  support.sort((a,b)=>b.weight-a.weight || a.text.localeCompare(b.text));
  return {majorId:major.id,score:weight?100*total/weight:null,confidence:possible?100*weight/possible:0,
   reasons:support.filter(s=>s.relevance>=.5&&s.fit>=.75).slice(0,3).map(s=>`Your interest in ${s.text} fits this field.`),
   mismatches:support.filter(s=>s.relevance>=.5&&s.fit<.45).slice(0,2).map(s=>`Your stated preference for ${s.text} is lower than this field's emphasis; explore its coursework.`)};
 }).sort((a,b)=>(b.score??-1)-(a.score??-1) || a.majorId.localeCompare(b.majorId));
}
