migrate((app) => {
  const users = app.findCollectionByNameOrId('users');

  let blocks;
  try {
    blocks = app.findCollectionByNameOrId('user_blocks');
  } catch {
    blocks = new Collection({ type: 'base', name: 'user_blocks' });
    blocks.fields.add(new RelationField({ name: 'blocker', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true }));
    blocks.fields.add(new RelationField({ name: 'blocked', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true }));
    blocks.fields.add(new TextField({ name: 'blockedName', max: 80 }));
    blocks.fields.add(new TextField({ name: 'blockedUsername', max: 30 }));
    blocks.addIndex('idx_user_blocks_pair', true, 'blocker, blocked', '');
  }
  blocks.listRule = 'blocker = @request.auth.id';
  blocks.viewRule = 'blocker = @request.auth.id';
  blocks.createRule = '@request.auth.id != "" && blocker = @request.auth.id && blocked != @request.auth.id';
  blocks.updateRule = null;
  blocks.deleteRule = 'blocker = @request.auth.id';
  app.save(blocks);

  let reports;
  try {
    reports = app.findCollectionByNameOrId('user_reports');
  } catch {
    reports = new Collection({ type: 'base', name: 'user_reports' });
    reports.fields.add(new RelationField({ name: 'reporter', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true }));
    reports.fields.add(new RelationField({ name: 'reported', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true }));
    reports.fields.add(new SelectField({ name: 'reason', required: true, values: ['harassment', 'spam', 'impersonation', 'inappropriate_content', 'safety', 'other'], maxSelect: 1 }));
    reports.fields.add(new TextField({ name: 'details', max: 1000 }));
    reports.fields.add(new TextField({ name: 'context', max: 80 }));
    reports.fields.add(new TextField({ name: 'reportedName', max: 80 }));
    reports.fields.add(new TextField({ name: 'reportedUsername', max: 30 }));
    reports.addIndex('idx_user_reports_reporter', false, 'reporter', '');
    reports.addIndex('idx_user_reports_reported', false, 'reported', '');
  }
  reports.listRule = 'reporter = @request.auth.id';
  reports.viewRule = 'reporter = @request.auth.id';
  reports.createRule = '@request.auth.id != "" && reporter = @request.auth.id && reported != @request.auth.id';
  reports.updateRule = null;
  reports.deleteRule = null;
  app.save(reports);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId('user_reports')); } catch {}
  try { app.delete(app.findCollectionByNameOrId('user_blocks')); } catch {}
});
