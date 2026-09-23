const test=require('node:test');const assert=require('node:assert/strict');
const React=require('react');const {act,create}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
let frameId=0,deferFrames=false;
const frames=new Map();
global.requestAnimationFrame=callback=>{const id=++frameId;frames.set(id,callback);if(!deferFrames)queueMicrotask(()=>{const pending=frames.get(id);frames.delete(id);pending?.();});return id;};
global.cancelAnimationFrame=id=>frames.delete(id);
let deferAnimations=false, motionReduced=false;
const animationQueue=[], animationRuns=[];
class AnimatedValue { constructor(value){this.value=value;} setValue(value){this.value=value;} }
const makeAnimation=(kind,config)=>({
 start(callback){animationRuns.push({kind,config});if(deferAnimations)animationQueue.push(()=>callback?.({finished:true}));else callback?.({finished:true});},
 stop(){},
});
const native={Pressable:'Pressable',ScrollView:'ScrollView',View:'View',Modal:'Modal',StyleSheet:{create:x=>x},
 Animated:{Value:AnimatedValue,View:'AnimatedView',delay:n=>makeAnimation('delay',n),timing:(value,config)=>makeAnimation('timing',config),parallel:items=>makeAnimation('parallel',items),sequence:items=>makeAnimation('sequence',items)},
 Easing:{quad:'quad',cubic:'cubic',inOut:x=>x,out:x=>x},
 AccessibilityInfo:{isReduceMotionEnabled:async()=>motionReduced,addEventListener:()=>({remove(){}})},
};
const Module=require('node:module');const original=Module._load;
const db={major_assessments:[],majormap_active:[],saved_majors:[],majormap_activity:[],major_challenge_attempts:[]};let failure=false,failedCollection='';let count=0;let held;
const pb={authStore:{record:{id:'alice'}},filter:(_filter,args)=>args,collection:name=>({
 getFullList:async({filter})=>{if(held)return held; if(failure||failedCollection===name)throw new Error('Network unavailable');return db[name].filter(r=>r.owner===filter.owner&&(!filter.majorId||r.majorId===filter.majorId));},
 create:async(data)=>{if(failure)throw new Error('Network unavailable');const r={...data,id:`record${++count}`};db[name].push(r);return r;},
 update:async(id,data)=>{if(failure)throw new Error('Network unavailable');const r=db[name].find(r=>r.id===id);Object.assign(r,data);return r;},
 delete:async(id)=>{if(failure)throw new Error('Network unavailable');db[name]=db[name].filter(r=>r.id!==id);},
})};
Module._load=function(request,parent,isMain){
 if(request==='react-native')return native;
 if(request.endsWith('/Typography'))return {Text:'Text',TextInput:'TextInput'};
 if(request.endsWith('/theme'))return {useTheme:()=>({isDark:false})};
 if(request==='./pocketbase'&&(parent.filename.endsWith('useMajorMap.ts')||parent.filename.endsWith('useChallengeAttempts.ts')))return {pb,pocketBaseErrorMessage:(e)=>e.message};
 return original.call(this,request,parent,isMain);
};
const {DiscoverScreen}=require('../src/screens/DiscoverScreen.tsx');
const {useMajorMap}=require('../src/lib/useMajorMap.ts');
const {useChallengeAttempts}=require('../src/lib/useChallengeAttempts.ts');
const {majorChallenges}=require('../src/data/majorChallenges.ts');
const {questions,rankMajors}=require('../src/lib/matching.ts');
const {MatchResults}=require('../src/components/MatchResults.tsx');
const {MajorChallengeFlow}=require('../src/components/MajorChallengeFlow.tsx');
Module._load=original;
const assessment=(id)=>({id,owner:'alice',answers:{},results:[],modelVersion:'test',completedAt:'2026-09-12T00:00:00Z'});
const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):node?.props?text(node.props.children):'';
function button(renderer,label){return renderer.root.findAllByType('Pressable').find(n=>text(n).includes(label));}
function shows(renderer,label){return renderer.root.findAllByType('Text').some(n=>text(n).includes(label));}
async function press(renderer,label){const b=button(renderer,label);assert.ok(b,`Missing button: ${label}`);await act(async()=>{await b.props.onPress();});}
async function finishQuiz(renderer){for(let index=0;index<questions.length;index+=2){await press(renderer,questions[index].options[0].label);await press(renderer,questions[index+1].options[0].label);}}
test('retake saves history but requires confirmation; cancellation keeps active map; activation failure is visible',async()=>{
 const first=assessment('first'),second=assessment('second');let saves=0,activations=0,failActivation=false;let renderer;
 const props={isSignedIn:true,onSignUp:()=>{},onExplore:()=>{},onOpenMajor:()=>{},history:[first],active:first,onSave:async()=>{saves++;return second;},onActivate:async()=>{activations++;if(failActivation)throw new Error('Activation failed');}};
 await act(async()=>{renderer=create(React.createElement(DiscoverScreen,props));});
 await press(renderer,'Retake Discover');
 await finishQuiz(renderer);
 await press(renderer,'Save assessment');assert.equal(saves,1);assert.equal(activations,0);
 await press(renderer,'Keep current MajorMap');assert.equal(activations,0);
 await press(renderer,'Use this assessment');failActivation=true;
 await press(renderer,'Confirm replacement');assert.equal(activations,1);assert.ok(JSON.stringify(renderer.toJSON()).includes('Activation failed'));
 failActivation=false;await press(renderer,'Confirm replacement');assert.equal(activations,2);
 await act(async()=>renderer.unmount());
});
test('failed assessment save retains answers and can be retried',async()=>{
 let fail=true,captured;let renderer;
 await act(async()=>{renderer=create(React.createElement(DiscoverScreen,{isSignedIn:true,history:[],onSignUp:()=>{},onExplore:()=>{},onOpenMajor:()=>{},onActivate:async()=>{},onSave:async a=>{captured=a;if(fail)throw new Error('Save failed');return assessment('saved');}}));});
 await finishQuiz(renderer);
 await press(renderer,'Save assessment');assert.ok(JSON.stringify(renderer.toJSON()).includes('Save failed'));assert.equal(Object.keys(captured).length,24);
 fail=false;await press(renderer,'Save assessment');assert.ok(JSON.stringify(renderer.toJSON()).includes('Saved assessment'));
 await act(async()=>renderer.unmount());
});
test('completed guest answers survive sign-in',async()=>{
 let renderer,captured;const props={isSignedIn:false,history:[],onSignUp:()=>{},onExplore:()=>{},onOpenMajor:()=>{},onActivate:async()=>{},onSave:async a=>{captured=a;return assessment('guest-result');}};
 await act(async()=>{renderer=create(React.createElement(DiscoverScreen,props));});
 await finishQuiz(renderer);
 await act(async()=>renderer.update(React.createElement(DiscoverScreen,{...props,isSignedIn:true})));
 await press(renderer,'Save assessment');assert.equal(Object.keys(captured).length,24);
 await act(async()=>renderer.unmount());
});
test('persistence hook does not pretend failed saves succeeded and isolates accounts',async()=>{
 let map,renderer;function Harness({owner}){map=useMajorMap(owner);return null;}
 await act(async()=>{renderer=create(React.createElement(Harness,{owner:'alice'}));});
 failure=true;await act(async()=>{await assert.rejects(map.toggleSave('cs'),/Network/);});assert.deepEqual(map.savedIds,[]);
 failure=false;await act(async()=>{await map.toggleSave('cs');});assert.deepEqual(map.savedIds,['cs']);
 failure=true;await act(async()=>{await assert.rejects(map.toggleSave('cs'),/Network/);});assert.deepEqual(map.savedIds,['cs']);
 failure=false;pb.authStore.record={id:'bob'};
 await act(async()=>renderer.update(React.createElement(Harness,{owner:'bob'})));assert.deepEqual(map.savedIds,[]);
 await act(async()=>{await map.toggleSave('biology');});assert.deepEqual(map.savedIds,['biology']);
 pb.authStore.record={id:'alice'};await act(async()=>renderer.update(React.createElement(Harness,{owner:'alice'})));assert.deepEqual(map.savedIds,['cs']);
 await act(async()=>renderer.unmount());
});

test('load failure is visible and prevents overwriting unseen saved data',async()=>{
 let map,renderer;function Harness(){map=useMajorMap('alice');return null;}
 failure=true;pb.authStore.record={id:'alice'};
 await act(async()=>{renderer=create(React.createElement(Harness));});
 assert.match(map.error,/Network/);
 await act(async()=>{await assert.rejects(map.toggleSave('cs'),/required MajorMap data/);});
 failure=false;await act(async()=>map.reload());assert.equal(map.error,'');assert.ok(map.savedIds.includes('cs'));
 await act(async()=>renderer.unmount());
});
test('an active map changed elsewhere is not silently replaced',async()=>{
 let map,renderer;function Harness(){map=useMajorMap('alice');return null;}
 pb.authStore.record={id:'alice'};
 await act(async()=>{renderer=create(React.createElement(Harness));});
 db.majormap_active.push({id:'external-active',owner:'alice',assessment:'external-assessment'});
 await act(async()=>{await assert.rejects(map.activate(assessment('replacement')),/changed/);});
 assert.equal(db.majormap_active[0].assessment,'external-assessment');
 await act(async()=>renderer.unmount());
});


test('answer selection fades automatically into the next focused substep',async()=>{
 let renderer;deferAnimations=true;
 const props={isSignedIn:false,history:[],onSignUp:()=>{},onExplore:()=>{},onOpenMajor:()=>{},onActivate:async()=>{},onSave:async()=>assessment('unused')};
 try {
  await act(async()=>{renderer=create(React.createElement(DiscoverScreen,props));});
  const first=button(renderer,'Very appealing');
  await act(async()=>{first.props.onPress();});
  assert.equal(button(renderer,'Very appealing').props.disabled,true);
  assert.equal(button(renderer,'Very appealing').props.accessibilityState.selected,true);
  assert.equal(button(renderer,'Tried it several times'),undefined);
  assert.equal(animationQueue.length,1);
  deferAnimations=false;await act(async()=>animationQueue.shift()());
  assert.ok(button(renderer,'Tried it several times'));
 }finally{deferAnimations=false;animationQueue.length=0;await act(async()=>renderer?.unmount());}
});
test('reduced motion advances without a fading or sliding animation',async()=>{
 motionReduced=true;let renderer;
 try {
  await act(async()=>{renderer=create(React.createElement(DiscoverScreen,{isSignedIn:false,history:[],onSignUp:()=>{},onExplore:()=>{},onOpenMajor:()=>{},onActivate:async()=>{},onSave:async()=>assessment('unused')}));});
  const before=animationRuns.length;
  await press(renderer,'Very appealing');
  await press(renderer,'Tried it several times');
  assert.equal(button(renderer,'Very appealing').props.accessibilityState.selected,false);assert.equal(animationRuns.length,before);
 }finally{motionReduced=false;await act(async()=>renderer?.unmount());}
});
test('result cards explain confidence separately and open the actual major',async()=>{
 let renderer,opened;
 const matches=rankMajors({'code:interest':'yes','code:evidence':'new'});
 await act(async()=>{renderer=create(React.createElement(MatchResults,{matches,onOpenMajor:m=>opened=m}));});
 assert.ok(JSON.stringify(renderer.toJSON()).includes('Early picture'));
 await press(renderer,'How to read your results');
 assert.ok(JSON.stringify(renderer.toJSON()).includes('Evidence confidence'));
 assert.ok(!JSON.stringify(renderer.toJSON()).includes('/100'));
 const card=renderer.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel?.startsWith('View '));
 await act(async()=>card.props.onPress());assert.equal(opened.id,matches[0].majorId);
 await act(async()=>renderer.unmount());
});


test('new question commits while hidden before the entrance animation',async()=>{
 let renderer;deferAnimations=true;deferFrames=true;
  try {
  await act(async()=>{renderer=create(React.createElement(DiscoverScreen,{isSignedIn:false,history:[],onSignUp:()=>{},onExplore:()=>{},onOpenMajor:()=>{},onActivate:async()=>{},onSave:async()=>assessment('unused')}));});
  await press(renderer,'Very appealing');
  deferAnimations=false;await act(async()=>animationQueue.shift()());
  assert.ok(button(renderer,'Tried it several times'));
  assert.equal(button(renderer,'Tried it several times').props.disabled,true);
  const stage=renderer.root.findByType('AnimatedView');assert.equal(stage.props.style.opacity.value,0);
  assert.equal(frames.size,1);
  await act(async()=>{for(const callback of frames.values())callback();frames.clear();});
  assert.equal(button(renderer,'Tried it several times').props.disabled,false);
 }finally{deferAnimations=false;deferFrames=false;frames.clear();animationQueue.length=0;await act(async()=>renderer?.unmount());}
});
test('saved perfect scores are recalculated in the persistence hook without replacing the active assessment',async()=>{
 let map,renderer;function Harness(){map=useMajorMap('carol');return null;}
 const {dimensions}=require('../src/lib/matching.ts');
 const answers=Object.fromEntries(dimensions.flatMap(([id])=>[[id+':interest','yes'],[id+':evidence','repeated']]));
 const saved={...assessment('old-perfect'),owner:'carol',modelVersion:'interests-v1',answers,results:rankMajors(answers).map(r=>({...r,score:100}))};
 db.major_assessments.push(saved);db.majormap_active.push({id:'carol-active',owner:'carol',assessment:saved.id});
 pb.authStore.record={id:'carol'};
 await act(async()=>{renderer=create(React.createElement(Harness));});
 assert.equal(map.active.id,saved.id);
 assert.ok(map.active.results.slice(0,5).every(r=>r.score<100));
 assert.ok(map.history[0].results.slice(0,5).every(r=>r.score<100));
 assert.ok(saved.results.every(r=>r.score===100));
 assert.equal(db.majormap_active.find(r=>r.owner==='carol').assessment,saved.id);
 await act(async()=>renderer.unmount());
});
test('an unrelated MajorMap load failure does not disable saved majors',async()=>{
 let map,renderer;function Harness(){map=useMajorMap('alice');return null;}
 pb.authStore.record={id:'alice'};failedCollection='majormap_activity';
 await act(async()=>{renderer=create(React.createElement(Harness));});
 assert.match(map.error,/Network/);
 await act(async()=>{await map.toggleSave('biology');});
 assert.ok(map.savedIds.includes('biology'));
 failedCollection='';await act(async()=>renderer.unmount());
});
test('challenge completion saves reflection, retakes append, and reloads only the current account',async()=>{
 let state,renderer;function Harness({owner}){state=useChallengeAttempts(owner);return null;}
 const challenge=majorChallenges[0];
 const responses=Object.fromEntries(challenge.questions.map(q=>[q.id,q.type==='multi'?[q.options[0]]:q.type==='text'?'A fair comparison over time':q.options[0]]));
 pb.authStore.record={id:'dana'};
 await act(async()=>{renderer=create(React.createElement(Harness,{owner:'dana'}));});
 await act(async()=>{await state.complete(challenge,{responses,enjoyment:4,difficulty:3,futureInterest:'yes',interestChange:'more'});});
 await act(async()=>{await state.complete(challenge,{responses,enjoyment:3,difficulty:2,futureInterest:'maybe',interestChange:'same'});});
 assert.equal(state.attempts.length,2);assert.notEqual(state.attempts[0].id,state.attempts[1].id);
 assert.equal(state.attempts[0].enjoyment,3);assert.equal(state.attempts[1].enjoyment,4);
 pb.authStore.record={id:'erin'};await act(async()=>renderer.update(React.createElement(Harness,{owner:'erin'})));assert.deepEqual(state.attempts,[]);
 pb.authStore.record={id:'dana'};await act(async()=>renderer.update(React.createElement(Harness,{owner:'dana'})));assert.equal(state.attempts.length,2);
 await act(async()=>renderer.unmount());
});
test('challenge history load failure does not block a new append',async()=>{
 let state,renderer;function Harness(){state=useChallengeAttempts('alice');return null;}
 const challenge=majorChallenges[0];
 const responses=Object.fromEntries(challenge.questions.map(q=>[q.id,q.type==='multi'?[q.options[0]]:q.type==='text'?'A short response':q.options[0]]));
 pb.authStore.record={id:'alice'};failure=true;
 await act(async()=>{renderer=create(React.createElement(Harness));});
 assert.match(state.error,/Network/);
 failure=false;
 await act(async()=>{await state.complete(challenge,{responses,enjoyment:4,difficulty:3,futureInterest:'yes'});});
 assert.equal(state.attempts.length,1);assert.equal(state.error,'');
 await act(async()=>renderer.unmount());
});
test('challenge validation requires all task and core reflection answers',async()=>{
 let state,renderer;function Harness(){state=useChallengeAttempts('finn');return null;}
 pb.authStore.record={id:'finn'};await act(async()=>{renderer=create(React.createElement(Harness));});
 await act(async()=>{await assert.rejects(state.complete(majorChallenges[0],{responses:{},enjoyment:0,difficulty:0,futureInterest:''}),/reflection/);});
 assert.equal(state.attempts.length,0);
 await act(async()=>renderer.unmount());
});
test('challenge flow navigates forward and back without losing responses',async()=>{
 let renderer;const challenge=majorChallenges[0];
 await act(async()=>{renderer=create(React.createElement(MajorChallengeFlow,{challenge,attempts:[],isSignedIn:true,onClose:()=>{},onSignIn:()=>{},onComplete:async()=>({}),onTryAnother:()=>{}}));});
 await press(renderer,'Start challenge');
 await press(renderer,challenge.questions[0].options[0]);await press(renderer,'Next');
 assert.ok(JSON.stringify(renderer.toJSON()).includes(challenge.questions[1].prompt));
 await press(renderer,'Back');assert.ok(JSON.stringify(renderer.toJSON()).includes(challenge.questions[0].prompt));
 assert.ok(button(renderer,challenge.questions[0].options[0]));
 await act(async()=>renderer.unmount());
});
test('completed challenge offers previous result or immutable retake',async()=>{
 let renderer,closed=false;const challenge=majorChallenges[0];const old={id:'old',owner:'a',majorId:challenge.majorId,challengeId:challenge.id,responses:{},completedAt:'2026-09-17',enjoyment:5,difficulty:3,futureInterest:'yes',challengeVersion:1};
 await act(async()=>{renderer=create(React.createElement(MajorChallengeFlow,{challenge,attempts:[old],isSignedIn:true,onClose:()=>{closed=true;},onSignIn:()=>{},onComplete:async()=>({}),onTryAnother:()=>{}}));});
 assert.ok(button(renderer,'View previous result'));assert.ok(button(renderer,'Retake challenge'));assert.ok(button(renderer,'Cancel'));
 await press(renderer,'Retake challenge');assert.ok(JSON.stringify(renderer.toJSON()).includes(challenge.questions[0].prompt));
 assert.equal(closed,false);await act(async()=>renderer.unmount());
});
test('guest challenge responses survive the existing sign-in handoff',async()=>{
 let renderer;const challenge=majorChallenges[0];const props={challenge,attempts:[],isSignedIn:false,onClose:()=>{},onSignIn:()=>{},onComplete:async()=>({}),onTryAnother:()=>{}};
 await act(async()=>{renderer=create(React.createElement(MajorChallengeFlow,props));});
 await press(renderer,'Start challenge');await press(renderer,challenge.questions[0].options[0]);
 await act(async()=>renderer.update(React.createElement(MajorChallengeFlow,{...props,isSignedIn:true})));
 await press(renderer,'Next');assert.ok(JSON.stringify(renderer.toJSON()).includes(challenge.questions[1].prompt));
 await press(renderer,'Back');assert.ok(JSON.stringify(renderer.toJSON()).includes(challenge.questions[0].prompt));
 await act(async()=>renderer.unmount());
});
