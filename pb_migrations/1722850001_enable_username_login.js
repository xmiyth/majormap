migrate((app) => {
  const collection = app.findCollectionByNameOrId('users');
  const fields = [
    new TextField({ name: 'username', required: true, min: 3, max: 30, pattern: '^[a-zA-Z0-9._-]+$' }),
    new TextField({ name: 'name', required: true, min: 2, max: 80 }),
    new TextField({ name: 'grade', required: true, max: 2 }),
    new TextField({ name: 'school', required: true, max: 160 }),
    new TextField({ name: 'schoolId', max: 80 }),
    new TextField({ name: 'schoolCity', max: 160 }),
    new TextField({ name: 'schoolState', max: 100 }),
    new TextField({ name: 'gpa', required: true, max: 4 }),
    new TextField({ name: 'sat', max: 4 }),
    new TextField({ name: 'psat', max: 4 }),
    new TextField({ name: 'bio', max: 1000 }),
    new TextField({ name: 'instagram', max: 100 }),
    new TextField({ name: 'linkedin', max: 250 }),
    new EmailField({ name: 'gmail' }),
    new JSONField({ name: 'interests', maxSize: 2000 }),
  ];

  for (const field of fields) {
    if (!collection.fields.getByName(field.name)) collection.fields.add(field);
  }

  if (!collection.indexes.some((index) => index.includes('idx_users_username'))) {
    collection.addIndex('idx_users_username', true, 'username', '');
  }

  collection.fields.getByName('email').required = true;
  collection.passwordAuth.enabled = true;
  app.save(collection);
  collection.passwordAuth.identityFields = ['email', 'username'];
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('users');
  collection.passwordAuth.identityFields = ['email'];
  app.save(collection);
});
