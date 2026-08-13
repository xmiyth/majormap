migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  users.listRule = 'id = @request.auth.id';
  users.viewRule = 'id = @request.auth.id';
  app.save(users);

  let profiles;
  try {
    profiles = app.findCollectionByNameOrId('public_profiles');
  } catch {
    profiles = new Collection({
      type: 'view',
      name: 'public_profiles',
    });
  }

  profiles.listRule = '@request.auth.id != ""';
  profiles.viewRule = '@request.auth.id != ""';
  profiles.viewQuery = 'SELECT id, name, username, grade, school, interests FROM users';
  app.save(profiles);
}, (app) => {
  const profiles = app.findCollectionByNameOrId('public_profiles');
  app.delete(profiles);

  const users = app.findCollectionByNameOrId('users');
  users.listRule = '@request.auth.id != ""';
  users.viewRule = '@request.auth.id != ""';
  app.save(users);
});
