/**
 * One-off remote helper. Password via env CRM_SSH_PASS only.
 * node _ssh_deploy.js
 */
const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(process.env.TEMP || '/tmp', 'crm-ssh', 'node_modules', 'ssh2'));

const HOST = process.env.CRM_SSH_HOST || '78.17.100.31';
const USER = process.env.CRM_SSH_USER || 'root';
const PASS = process.env.CRM_SSH_PASS || '';
const REPO = 'https://github.com/AndrewF250/CRM.git';

if (!PASS) {
  console.error('Set CRM_SSH_PASS env var');
  process.exit(1);
}

function exec(conn, cmd, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { timeout: timeoutMs }, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      let errOut = '';
      stream.on('data', d => { out += d.toString(); process.stdout.write(d); });
      stream.stderr.on('data', d => { errOut += d.toString(); process.stderr.write(d); });
      stream.on('close', code => resolve({ code, out, errOut }));
    });
  });
}

function upload(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      sftp.fastPut(localPath, remotePath, (e) => e ? reject(e) : resolve());
    });
  });
}

const conn = new Client();
conn.on('ready', async () => {
  try {
    console.log('Connected to', HOST);

    // Discover layout + DB
    const discover = await exec(conn, `
set -e
echo '--- paths ---'
ls -la /var/www 2>/dev/null || true
ls -la /var/www/crm-app 2>/dev/null || true
ls -la /var/www/crm 2>/dev/null || true
echo '--- find crm.db ---'
find /var/www /root /opt /home -name 'crm.db' -type f 2>/dev/null | head -20
echo '--- pm2 ---'
pm2 list 2>/dev/null || true
echo '--- node ---'
which node; node -v 2>/dev/null || true
echo '--- git ---'
which git || true
echo '--- listening ---'
ss -lntp 2>/dev/null | grep -E '3005|80|443' || netstat -lntp 2>/dev/null | grep -E '3005|80|443' || true
`);

    // Ensure app dir exists
    await exec(conn, 'mkdir -p /var/www/crm-app/backups /var/www/crm-app/uploads');

    // Upload update script
    const localScript = path.join(__dirname, 'update-from-github.sh');
    await upload(conn, localScript, '/var/www/crm-app/update-from-github.sh');
    await exec(conn, 'chmod +x /var/www/crm-app/update-from-github.sh');

    // Install git/rsync if needed, then run update
    console.log('\n=== Running update-from-github.sh ===\n');
    const result = await exec(conn, `
export DEBIAN_FRONTEND=noninteractive
which git >/dev/null || apt-get install -y git
which rsync >/dev/null || apt-get install -y rsync
APP_DIR=/var/www/crm-app/server BACKUP_DIR=/var/www/crm-app/backups REPO_URL=${REPO} BRANCH=main bash /var/www/crm-app/update-from-github.sh
`, 300000);

    console.log('\nExit code:', result.code);
    conn.end();
    process.exit(result.code || 0);
  } catch (e) {
    console.error(e);
    conn.end();
    process.exit(1);
  }
});
conn.on('error', (e) => { console.error('SSH error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 20000 });
