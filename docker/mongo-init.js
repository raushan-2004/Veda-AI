db = db.getSiblingDB('veda-ai');

db.createUser({
  user: 'veda_user',
  pwd: 'veda_password',
  roles: [{ role: 'readWrite', db: 'veda-ai' }],
});

db.createCollection('users');
db.createCollection('assessments');
db.createCollection('submissions');

print('MongoDB initialized for veda-ai database');
