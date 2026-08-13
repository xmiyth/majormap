migrate((app) => {
  const profiles = app.findCollectionByNameOrId('public_profiles');
  profiles.viewQuery = 'SELECT id, name, username, grade, school, interests, dailySatStreak FROM users';
  app.save(profiles);

  const members = app.findCollectionByNameOrId('school_members');
  members.viewQuery = 'SELECT id, name, username, grade, school, gpa, sat, psat, dailySatStreak, schoolMemberships FROM users WHERE schoolMemberships = "almaty-international-school"';
  app.save(members);
}, (app) => {
  const profiles = app.findCollectionByNameOrId('public_profiles');
  profiles.viewQuery = 'SELECT id, name, username, grade, school, interests FROM users';
  app.save(profiles);

  const members = app.findCollectionByNameOrId('school_members');
  members.viewQuery = 'SELECT id, name, username, grade, school, gpa, sat, psat, schoolMemberships FROM users WHERE schoolMemberships = "almaty-international-school"';
  app.save(members);
});
