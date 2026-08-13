migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  const fields = [
    new NumberField({ name: 'dailySatStreak', min: 0, onlyInt: true }),
    new NumberField({ name: 'dailySatBest', min: 0, onlyInt: true }),
    new TextField({ name: 'dailySatLastCompleted', max: 10 }),
    new TextField({ name: 'dailySatFreezeWeek', max: 10 }),
  ];
  for (const field of fields) {
    if (!users.fields.getByName(field.name)) users.fields.add(field);
  }
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId('users');
  for (const name of ['dailySatStreak', 'dailySatBest', 'dailySatLastCompleted', 'dailySatFreezeWeek']) {
    const field = users.fields.getByName(name);
    if (field) users.fields.removeById(field.id);
  }
  app.save(users);
});
