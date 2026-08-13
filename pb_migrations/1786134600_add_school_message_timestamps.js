migrate((app) => {
  const messages = app.findCollectionByNameOrId('school_messages');
  if (!messages.fields.getByName('created')) {
    messages.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
  }
  if (!messages.fields.getByName('updated')) {
    messages.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
  }
  app.save(messages);
  app.db().newQuery("UPDATE school_messages SET created = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE created IS NULL OR created = ''").execute();
  app.db().newQuery("UPDATE school_messages SET updated = created WHERE updated IS NULL OR updated = ''").execute();
}, (app) => {
  const messages = app.findCollectionByNameOrId('school_messages');
  for (const name of ['created', 'updated']) {
    const field = messages.fields.getByName(name);
    if (field) messages.fields.removeById(field.id);
  }
  app.save(messages);
});
