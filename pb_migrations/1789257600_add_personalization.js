migrate((app) => {
 const users=app.findCollectionByNameOrId('users');
 const own='@request.auth.id != "" && owner = @request.auth.id';
 function base(name) {
  const c=new Collection({type:'base',name,listRule:own,viewRule:own,createRule:own,updateRule:null,deleteRule:null});
  c.fields.add(new RelationField({name:'owner',required:true,collectionId:users.id,maxSelect:1,cascadeDelete:true}));
  return c;
 }
 const assessments=base('major_assessments');
 assessments.fields.add(new JSONField({name:'answers',required:true,maxSize:30000}));
 assessments.fields.add(new JSONField({name:'results',required:true,maxSize:200000}));
 assessments.fields.add(new TextField({name:'modelVersion',required:true,max:80}));
 assessments.fields.add(new DateField({name:'completedAt',required:true}));
 app.save(assessments);
 const active=base('majormap_active');
 active.fields.add(new RelationField({name:'assessment',required:true,collectionId:assessments.id,maxSelect:1,cascadeDelete:true}));
 active.createRule=own+' && assessment.owner = @request.auth.id';
 active.updateRule=own+' && @request.body.owner:changed = false && @request.body.assessment.owner = @request.auth.id';
 active.addIndex('idx_majormap_active_owner',true,'owner','');app.save(active);
 const saved=base('saved_majors');
 saved.fields.add(new TextField({name:'majorId',required:true,max:80}));
 saved.deleteRule=own;saved.addIndex('idx_saved_major_owner',true,'owner, majorId','');app.save(saved);
 const activity=base('majormap_activity');
 activity.fields.add(new RelationField({name:'assessment',required:true,collectionId:assessments.id,maxSelect:1,cascadeDelete:true}));
 activity.fields.add(new TextField({name:'majorId',required:true,max:80}));
 activity.createRule=own+' && assessment.owner = @request.auth.id';
 activity.addIndex('idx_majormap_review',true,'owner, assessment','');app.save(activity);
}, (app) => {
 throw new Error('Personalization history is preserved. Restore a backup for rollback; do not delete student assessments.');
});
