/**
 * Merge two SQLite DBs: local is primary on conflicts.
 * - Base = local.db (copy)
 * - From server: insert rows whose primary key is missing in local
 * Usage: node _merge_dbs.js <local.db> <server.db> <out.db>
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const localPath = process.argv[2];
const serverPath = process.argv[3];
const outPath = process.argv[4];

if (!localPath || !serverPath || !outPath) {
  console.error('Usage: node _merge_dbs.js <local.db> <server.db> <out.db>');
  process.exit(1);
}

fs.copyFileSync(localPath, outPath);
const out = new Database(outPath);
const server = new Database(serverPath, { readonly: true });

out.pragma('foreign_keys = OFF');

function tables(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);
}

function columns(db, table) {
  return db.prepare(`PRAGMA table_info(${table})`).all();
}

function pkCols(cols) {
  const pks = cols.filter(c => c.pk > 0).sort((a, b) => a.pk - b.pk).map(c => c.name);
  return pks.length ? pks : null;
}

const outTables = new Set(tables(out));
const serverTables = tables(server);
const report = [];

for (const table of serverTables) {
  if (!outTables.has(table)) {
    report.push(`SKIP ${table}: not in local`);
    continue;
  }
  const outCols = columns(out, table);
  const srvCols = columns(server, table);
  const outNames = outCols.map(c => c.name);
  const shared = srvCols.map(c => c.name).filter(n => outNames.includes(n));
  if (!shared.length) {
    report.push(`SKIP ${table}: no shared columns`);
    continue;
  }

  const pks = pkCols(outCols);
  const srvRows = server.prepare(`SELECT * FROM ${table}`).all();
  let inserted = 0;
  let skipped = 0;

  const insertSql = `INSERT INTO ${table} (${shared.join(',')}) VALUES (${shared.map(() => '?').join(',')})`;
  const insert = out.prepare(insertSql);

  const existsStmt = pks
    ? out.prepare(`SELECT 1 FROM ${table} WHERE ${pks.map(c => `${c}=?`).join(' AND ')} LIMIT 1`)
    : null;

  const tx = out.transaction((rows) => {
    for (const row of rows) {
      if (existsStmt) {
        const key = pks.map(c => row[c]);
        if (key.some(v => v === undefined)) { skipped++; continue; }
        if (existsStmt.get(...key)) { skipped++; continue; }
      }
      try {
        insert.run(...shared.map(c => row[c] ?? null));
        inserted++;
      } catch (e) {
        skipped++;
      }
    }
  });

  tx(srvRows);
  report.push(`${table}: +${inserted} from server, keep/skip ${skipped}`);
}

server.close();
out.close();

console.log('Merged DB written to', outPath);
report.forEach(l => console.log(' -', l));
