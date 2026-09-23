import { useEffect, useMemo, useRef, useState } from 'react';
import { RecordModel } from 'pocketbase';
import { pb, pocketBaseErrorMessage } from './pocketbase';
import { withCurrentScores } from './assessmentResults';
import { Answers, Match, MODEL_VERSION, questions, rankMajors } from './matching';
function majorMapPersistenceError(cause:unknown,fallback:string) {
 const details=cause as {status?:number;response?:{message?:string}};
 const message=details.response?.message??(cause instanceof Error?cause.message:'');
 if(details.status===404||/missing or invalid collection context/i.test(message)) return 'MajorMap saving is not available on this server yet. Apply the PocketBase personalization migration.';
 if(cause instanceof Error&&!details.response)return cause.message;
 return pocketBaseErrorMessage(cause,fallback);
}
export type Assessment = RecordModel & { owner:string; answers:Answers; results:Match[]; modelVersion:string; completedAt:string };
export function useMajorMap(owner?:string) {
 const [history,setHistory]=useState<Assessment[]>([]);
 const [activeId,setActiveId]=useState('');
 const [saved,setSaved]=useState<RecordModel[]>([]);
 const [activity,setActivity]=useState<RecordModel[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [revision,setRevision]=useState(0);
 const [loadedOwner,setLoadedOwner]=useState<string>();
 const [ready,setReady]=useState({history:false,active:false,saved:false,activity:false});
 const current=useRef(owner); current.current=owner;
 const busy=useRef(new Set<string>());
 useEffect(()=>{
  let alive=true; setHistory([]);setActiveId('');setSaved([]);setActivity([]);setError('');setLoading(!!owner);setLoadedOwner(undefined);setReady({history:false,active:false,saved:false,activity:false});
  if(owner) Promise.allSettled([
   pb.collection('major_assessments').getFullList<Assessment>({filter:pb.filter('owner = {:owner}',{owner}),sort:'-completedAt',requestKey:null}),
   pb.collection('majormap_active').getFullList({filter:pb.filter('owner = {:owner}',{owner}),requestKey:null}),
   pb.collection('saved_majors').getFullList({filter:pb.filter('owner = {:owner}',{owner}),requestKey:null}),
   pb.collection('majormap_activity').getFullList({filter:pb.filter('owner = {:owner}',{owner}),requestKey:null}),
  ]).then(([h,a,s,v])=>{if(alive){
    if(h.status==='fulfilled')setHistory(h.value);
    if(a.status==='fulfilled')setActiveId(a.value[0]?.assessment??'');
    if(s.status==='fulfilled')setSaved(s.value);
    if(v.status==='fulfilled')setActivity(v.value);
    setReady({history:h.status==='fulfilled',active:a.status==='fulfilled',saved:s.status==='fulfilled',activity:v.status==='fulfilled'});
    setLoadedOwner(owner);
    const failed=[h,a,s,v].find(result=>result.status==='rejected');
    if(failed?.status==='rejected')setError(majorMapPersistenceError(failed.reason,'Some MajorMap data could not be loaded.'));
  }})
   .finally(()=>{if(alive)setLoading(false);});
  return ()=>{alive=false;};
 },[owner,revision]);
 async function run<T>(key:string,task:()=>Promise<T>,dataReady=true):Promise<T> {
  if(!owner || pb.authStore.record?.id!==owner) throw new Error('Sign in to save your MajorMap.');
  if(loading || !dataReady || loadedOwner!==owner) throw new Error('The required MajorMap data did not load. Retry before saving.');
  const lock=`${owner}:${key}`;
  if(busy.current.has(lock)) throw new Error('Save in progress. Please wait.');
  busy.current.add(lock);
  try{return await task();}catch(cause){throw new Error(majorMapPersistenceError(cause,'Could not save your MajorMap.'));}finally{busy.current.delete(lock);}
 }
 async function saveAssessment(answers:Answers) {
  return run('assessment',async()=>{
   if(questions.some(q=>!answers[q.id])) throw new Error('Please finish every question.');
   const results=rankMajors(answers);
   if(!results.some(r=>r.score!==null)) throw new Error('Add at least one measured interest to see matches.');
   const record=await pb.collection('major_assessments').create<Assessment>({owner,answers,results,modelVersion:MODEL_VERSION,completedAt:new Date().toISOString()});
   if(current.current===owner) setHistory(h=>[record,...h]);
   return record;
  });
 }
 async function activate(record:Assessment) {
  return run('activate',async()=>{
   if(record.owner!==owner) throw new Error('This assessment belongs to another account.');
   const list=await pb.collection('majormap_active').getFullList({filter:pb.filter('owner = {:owner}',{owner}),requestKey:null});
   if((list[0]?.assessment??'')!==activeId) {
    if(current.current===owner)setRevision(r=>r+1);
    throw new Error('Your active MajorMap changed. Review the refreshed history and confirm again.');
   }
   if(list[0]) await pb.collection('majormap_active').update(list[0].id,{assessment:record.id});
   else await pb.collection('majormap_active').create({owner,assessment:record.id});
   if(current.current===owner) setActiveId(record.id);
  },ready.active);
 }
 async function toggleSave(majorId:string) {
  return run(`saved:${majorId}`,async()=>{
   const existing=await pb.collection('saved_majors').getFullList({filter:pb.filter('owner = {:owner} && majorId = {:majorId}',{owner,majorId}),requestKey:null});
   if(existing[0]) {await pb.collection('saved_majors').delete(existing[0].id);if(current.current===owner)setSaved(s=>s.filter(r=>r.majorId!==majorId));}
   else {const record=await pb.collection('saved_majors').create({owner,majorId});if(current.current===owner)setSaved(s=>[...s.filter(r=>r.majorId!==majorId),record]);}
  },ready.saved);
 }
 async function markReviewed(majorId:string) {
  if(!owner || !activeId || activity.some(a=>a.assessment===activeId)) return;
  return run('review',async()=>{
   const record=await pb.collection('majormap_activity').create({owner,assessment:activeId,majorId});
   if(current.current===owner)setActivity(a=>[...a,record]);
  },ready.active&&ready.activity);
 }
 const accountHistory=useMemo(()=>history.filter(h=>h.owner===owner).map(withCurrentScores),[history,owner]);
 return {history:accountHistory,active:accountHistory.find(h=>h.id===activeId),savedIds:saved.filter(s=>s.owner===owner).map(s=>s.majorId as string),reviewed:activity.some(a=>a.owner===owner&&a.assessment===activeId),loading,error,reload:()=>setRevision(r=>r+1),saveAssessment,activate,toggleSave,markReviewed};
}
