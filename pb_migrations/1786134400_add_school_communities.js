migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  if (!users.fields.getByName('schoolCommunities')) {
    users.fields.add(new JSONField({ name: 'schoolCommunities', maxSize: 2000 }));
    app.save(users);
  }
}, (app) => {
  const users = app.findCollectionByNameOrId('users');
  const field = users.fields.getByName('schoolCommunities');
  if (field) {
    users.fields.removeById(field.id);
    app.save(users);
  }
});
