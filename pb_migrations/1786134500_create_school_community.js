migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  if (!users.fields.getByName('schoolMemberships')) {
    users.fields.add(new SelectField({
      name: 'schoolMemberships',
      values: ['almaty-international-school'],
      maxSelect: 1,
    }));
    app.save(users);
    app.db().newQuery("UPDATE users SET schoolMemberships = 'almaty-international-school' WHERE schoolCommunities LIKE '%almaty-international-school%'").execute();
  }

  let members;
  try {
    members = app.findCollectionByNameOrId('school_members');
  } catch {
    members = new Collection({ type: 'view', name: 'school_members' });
  }
  members.listRule = '@request.auth.schoolMemberships = "almaty-international-school"';
  members.viewRule = '@request.auth.schoolMemberships = "almaty-international-school"';
  members.viewQuery = "SELECT id, name, username, grade, school, gpa, sat, psat, schoolMemberships FROM users WHERE schoolMemberships = 'almaty-international-school'";
  app.save(members);

  let messages;
  try {
    messages = app.findCollectionByNameOrId('school_messages');
  } catch {
    messages = new Collection({
      type: 'base',
      name: 'school_messages',
    });
    messages.fields.add(new TextField({ name: 'schoolId', required: true, max: 80 }));
    messages.fields.add(new TextField({ name: 'senderId', required: true, min: 15, max: 15, pattern: '^[a-z0-9]+$' }));
    messages.fields.add(new TextField({ name: 'body', required: true, min: 1, max: 1000 }));
    messages.addIndex('idx_school_messages_school', false, 'schoolId', '');
  }
  messages.listRule = '@request.auth.schoolMemberships = schoolId';
  messages.viewRule = '@request.auth.schoolMemberships = schoolId';
  messages.createRule = '@request.auth.id != "" && @request.auth.schoolMemberships = schoolId && senderId = @request.auth.id';
  messages.updateRule = 'senderId = @request.auth.id && @request.auth.schoolMemberships = schoolId && @request.body.senderId:changed = false && @request.body.schoolId:changed = false';
  messages.deleteRule = 'senderId = @request.auth.id && @request.auth.schoolMemberships = schoolId';
  app.save(messages);
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId('school_messages'));
  } catch {}
  try {
    app.delete(app.findCollectionByNameOrId('school_members'));
  } catch {}

  const users = app.findCollectionByNameOrId('users');
  const field = users.fields.getByName('schoolMemberships');
  if (field) {
    users.fields.removeById(field.id);
    app.save(users);
  }
});
