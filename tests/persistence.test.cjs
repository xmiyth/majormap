const test=require('node:test');const assert=require('node:assert/strict');
const {spawn,spawnSync}=require('node:child_process');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
test('PocketBase migrations and account ownership, history, active map, saved majors and checklist',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'majormap-test-'));
 const exe=path.resolve('pocketbase.exe');const migrations=path.resolve('pb_migrations');
 const args=[`--dir=${dir}`,`--migrationsDir=${migrations}`];
 const migrated=spawnSync(exe,['migrate','up',...args],{encoding:'utf8'});
 assert.equal(migrated.status,0,migrated.stdout+migrated.stderr);
 const server=spawn(exe,['serve','--http=127.0.0.1:18097',...args],{windowsHide:true,stdio:'pipe'});
 let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
 const base='http://127.0.0.1:18097/api';
 async function api(route,method='GET',body,token=''){
  const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',Authorization:token},body:body?JSON.stringify(body):undefined});
  return {status:r.status,data:await r.json().catch(()=>({}))};
 }
 try {
  let ready=false;for(let i=0;i<80;i++){try{const h=await api('/health');if(h.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,logs);
  async function user(n){const email=`test${n}@example.com`,password='Test-MajorMap-928!';const created=await api('/collections/users/records','POST',{email,password,passwordConfirm:password,username:`testuser${n}`,name:'Test Student',grade:'10',school:'Test',gpa:'3.5'});assert.equal(created.status,200,JSON.stringify(created));const auth=await api('/collections/users/auth-with-password','POST',{identity:email,password});assert.equal(auth.status,200,JSON.stringify(auth));return {id:auth.data.record.id,token:auth.data.token};}
  const a=await user(1),b=await user(2);
  async function create(collection,body,u=a){const r=await api(`/collections/${collection}/records`,'POST',body,u.token);assert.equal(r.status,200,JSON.stringify(r));return r.data;}
  const payload={owner:a.id,answers:{'code:interest':'yes'},results:[{majorId:'cs',score:100}],modelVersion:'test-v1',completedAt:new Date().toISOString()};
  const first=await create('major_assessments',payload),second=await create('major_assessments',payload);
  const active=await create('majormap_active',{owner:a.id,assessment:first.id});
  let r=await api(`/collections/majormap_active/records/${active.id}`,'PATCH',{assessment:second.id},a.token);assert.equal(r.status,200,JSON.stringify(r));
  r=await api('/collections/major_assessments/records','GET',undefined,a.token);assert.equal(r.data.totalItems,2);
  for(const c of ['major_assessments','majormap_active']) {r=await api(`/collections/${c}/records`,'GET',undefined,b.token);assert.equal(r.data.totalItems,0);}
  r=await api(`/collections/major_assessments/records/${first.id}`,'PATCH',{results:[]},a.token);assert.ok(r.status>=400);
  r=await api(`/collections/major_assessments/records/${first.id}`,'DELETE',undefined,a.token);assert.ok(r.status>=400);
  r=await api('/collections/majormap_active/records','POST',{owner:b.id,assessment:first.id},b.token);assert.ok(r.status>=400,JSON.stringify(r));
  const other=await create('major_assessments',{...payload,owner:b.id},b);
  r=await api(`/collections/majormap_active/records/${active.id}`,'PATCH',{assessment:other.id},a.token);assert.ok(r.status>=400,JSON.stringify(r));
  const save=await create('saved_majors',{owner:a.id,majorId:'cs'});
  r=await api('/collections/saved_majors/records','POST',{owner:a.id,majorId:'cs'},a.token);assert.ok(r.status>=400);
  await create('saved_majors',{owner:b.id,majorId:'cs'},b);
  r=await api(`/collections/saved_majors/records/${save.id}`,'DELETE',undefined,b.token);assert.ok(r.status>=400);
  const review=await create('majormap_activity',{owner:a.id,assessment:second.id,majorId:'cs'});
  r=await api('/collections/majormap_activity/records','GET',undefined,b.token);assert.equal(r.data.totalItems,0);
  r=await api('/collections/majormap_activity/records','POST',{owner:b.id,assessment:second.id,majorId:'cs'},b.token);assert.ok(r.status>=400);
  const attemptPayload={owner:a.id,majorId:'psychology',challengeId:'psych-research',responses:{hypothesis:'test',variables:['sleep'],method:'survey',plan:'compare groups'},completedAt:new Date().toISOString(),enjoyment:4,difficulty:3,futureInterest:'yes',interestChange:'more',challengeVersion:1};
  const attempt1=await create('major_challenge_attempts',attemptPayload);
  const attempt2=await create('major_challenge_attempts',attemptPayload);
  r=await api('/collections/major_challenge_attempts/records','GET',undefined,a.token);assert.equal(r.data.totalItems,2);
  r=await api('/collections/major_challenge_attempts/records','GET',undefined,b.token);assert.equal(r.data.totalItems,0);
  r=await api(`/collections/major_challenge_attempts/records/${attempt1.id}`,'GET',undefined,b.token);assert.equal(r.status,404);
  r=await api(`/collections/major_challenge_attempts/records/${attempt1.id}`,'PATCH',{enjoyment:1},a.token);assert.ok(r.status>=400);
  r=await api(`/collections/major_challenge_attempts/records/${attempt1.id}`,'DELETE',undefined,a.token);assert.ok(r.status>=400);
  r=await api('/collections/major_challenge_attempts/records','POST',{...attemptPayload,owner:b.id},a.token);assert.ok(r.status>=400);
  assert.notEqual(attempt1.id,attempt2.id);
  r=await api('/collections/major_assessments/records','GET',undefined,a.token);assert.equal(r.data.totalItems,2);
  r=await api(`/collections/saved_majors/records/${save.id}`,'DELETE',undefined,a.token);assert.equal(r.status,204);
  r=await api('/collections/saved_majors/records','GET',undefined,a.token);assert.equal(r.data.totalItems,0);
  r=await api('/collections/users/records/'+a.id,'DELETE',undefined,a.token);assert.equal(r.status,204,JSON.stringify(r));
 }finally{server.kill();await new Promise(resolve=>server.once('exit',resolve));/* Isolated test DB retained in OS temp for diagnosis. */}
});
