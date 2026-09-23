migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  const own = '@request.auth.id != "" && owner = @request.auth.id';
  const attempts = new Collection({ type:'base', name:'major_challenge_attempts', listRule:own, viewRule:own, createRule:own, updateRule:null, deleteRule:null });
  attempts.fields.add(new RelationField({ name:'owner', required:true, collectionId:users.id, maxSelect:1, cascadeDelete:true }));
  attempts.fields.add(new TextField({ name:'majorId', required:true, max:80 }));
  attempts.fields.add(new TextField({ name:'challengeId', required:true, max:100 }));
  attempts.fields.add(new JSONField({ name:'responses', required:true, maxSize:100000 }));
  attempts.fields.add(new DateField({ name:'completedAt', required:true }));
  attempts.fields.add(new NumberField({ name:'enjoyment', required:true, min:1, max:5, onlyInt:true }));
  attempts.fields.add(new NumberField({ name:'difficulty', required:true, min:1, max:5, onlyInt:true }));
  attempts.fields.add(new SelectField({ name:'futureInterest', required:true, values:['yes','maybe','no'], maxSelect:1 }));
  attempts.fields.add(new SelectField({ name:'interestChange', values:['more','same','less'], maxSelect:1 }));
  attempts.fields.add(new NumberField({ name:'challengeVersion', required:true, min:1, onlyInt:true }));
  attempts.addIndex('idx_challenge_attempt_owner', false, 'owner, completedAt', '');
  attempts.addIndex('idx_challenge_attempt_major', false, 'owner, majorId', '');
  app.save(attempts);
}, (app) => {
  throw new Error('Challenge history is preserved. Restore a backup for rollback; do not delete student attempts.');
});
