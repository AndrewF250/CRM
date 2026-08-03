const path = require('path');
const { Client } = require(path.join(process.env.TEMP || '/tmp', 'crm-ssh', 'node_modules', 'ssh2'));

const PASS = process.env.CRM_SSH_PASS || '';
if (!PASS) { console.error('CRM_SSH_PASS required'); process.exit(1); }

const cmd = `
pm2 show crm | head -45
echo '=== APP DIR ==='
ls -la /var/www/crm-app | head -35
echo '=== SERVER SUBDIR ==='
ls -la /var/www/crm-app/server 2>/dev/null | head -25 || true
echo '=== HTTP ==='
curl -s -o /dev/null -w 'root:%{http_code}\\n' http://127.0.0.1:3005/
curl -s -o /dev/null -w 'tasks:%{http_code}\\n' http://127.0.0.1:3005/pages/tasks.html
curl -s -o /dev/null -w 'taskhtml:%{http_code}\\n' http://127.0.0.1:3005/pages/task.html
echo '=== DB ==='
cd /var/www/crm-app
node <<'NODE'
const Database = require('better-sqlite3');
const fs = require('fs');
for (const p of ['/var/www/crm-app/crm.db', '/var/www/crm-app/server/crm.db']) {
  if (!fs.existsSync(p)) { console.log(p, 'MISSING'); continue; }
  try {
    const db = new Database(p, { readonly: true });
    const cols = db.prepare('PRAGMA table_info(tasks)').all().map(x => x.name);
    const n = db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c;
    const goals = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='goals'").get();
    console.log(p);
    console.log('  tasks=', n, 'is_epic=', cols.includes('is_epic'), 'created_by=', cols.includes('created_by'), 'goals=', !!goals);
    db.close();
  } catch (e) {
    console.log(p, e.message);
  }
}
NODE
`;

const c = new Client();
c.on('ready', () => {
  c.exec(cmd, (err, stream) => {
    if (err) { console.error(err); process.exit(1); }
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', code => { c.end(); process.exit(code || 0); });
  });
});
c.on('error', e => { console.error(e.message); process.exit(1); });
c.connect({ host: '78.17.100.31', username: 'root', password: PASS, readyTimeout: 20000 });
