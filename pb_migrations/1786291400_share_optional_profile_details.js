migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  if (!users.fields.getByName('shareProfileDetails')) {
    users.fields.add(new BoolField({ name: 'shareProfileDetails' }));
    app.save(users);
  }

  let details;
  try {
    details = app.findCollectionByNameOrId('school_member_profiles');
  } catch {
    details = new Collection({ type: 'view', name: 'school_member_profiles' });
  }
  details.listRule = '@request.auth.schoolMemberships = "almaty-international-school"';
  details.viewRule = '@request.auth.schoolMemberships = "almaty-international-school"';
  details.viewQuery = `SELECT id, bio, instagram, linkedin, gmail, interests FROM users WHERE shareProfileDetails = true AND schoolMemberships = 'almaty-international-school'`;
  app.save(details);
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId('school_member_profiles'));
  } catch {}

  const users = app.findCollectionByNameOrId('users');
  const field = users.fields.getByName('shareProfileDetails');
  if (field) {
    users.fields.removeById(field.id);
    app.save(users);
  }
});
