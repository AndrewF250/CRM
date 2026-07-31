const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'crm.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    phone TEXT DEFAULT '',
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'Новый',
    urgent INTEGER DEFAULT 0,
    deadline TEXT,
    progress INTEGER DEFAULT 0,
    pay_status TEXT DEFAULT 'unpaid',
    pay_method TEXT DEFAULT 'По счёту',
    discount TEXT DEFAULT 'no',
    discount_val TEXT DEFAULT '',
    adequacy TEXT DEFAULT 'good',
    source TEXT DEFAULT 'Сайт',
    description TEXT DEFAULT '',
    hashtags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT DEFAULT '',
    name TEXT NOT NULL,
    column_status TEXT DEFAULT 'Ожидает',
    person TEXT DEFAULT 'Костя',
    date TEXT,
    time TEXT,
    done INTEGER DEFAULT 0,
    urgent INTEGER DEFAULT 0,
    hashtags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    name TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    person TEXT DEFAULT '',
    deadline TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT DEFAULT '',
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    date TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    task_id TEXT,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    amount REAL NOT NULL,
    month TEXT NOT NULL,
    paid INTEGER DEFAULT 0,
    paid_date TEXT,
    note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    person TEXT DEFAULT '',
    project_id TEXT,
    note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: add payment_due_date if not exists
try {
  db.prepare("SELECT payment_due_date FROM projects LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE projects ADD COLUMN payment_due_date TEXT DEFAULT ''");
}

// Create reminders table
db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    type TEXT DEFAULT 'payment',
    message TEXT NOT NULL,
    remind_date TEXT NOT NULL,
    is_sent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
`);

// Migration: add doc_category if not exists
try {
  db.prepare("SELECT doc_category FROM documents LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE documents ADD COLUMN doc_category TEXT DEFAULT 'client'");
}

// Migration: add template_category if not exists
try {
  db.prepare("SELECT template_category FROM documents LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE documents ADD COLUMN template_category TEXT DEFAULT 'Другое'");
}

// Migration: add parent_id to tasks (for task nesting)
try {
  db.prepare("SELECT parent_id FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN parent_id TEXT DEFAULT NULL REFERENCES tasks(id) ON DELETE CASCADE");
}

// Migration: add date_end to tasks (date range)
try {
  db.prepare("SELECT date_end FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN date_end TEXT DEFAULT ''");
}

// Migration: add priority to tasks (low/medium/high)
try {
  db.prepare("SELECT priority FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'");
}

// Migration: add description to tasks
try {
  db.prepare("SELECT description FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN description TEXT DEFAULT ''");
}

// Migration: allow empty project_id in tasks (remove NOT NULL + FOREIGN KEY)
try {
  const cols = db.prepare("PRAGMA table_info(tasks)").all();
  const pidCol = cols.find(c => c.name === 'project_id');
  if (pidCol && pidCol.notnull === 1) {
    const migrateTasks = db.transaction(() => {
      db.exec(`
        CREATE TABLE tasks_new (
          id TEXT PRIMARY KEY,
          project_id TEXT DEFAULT '',
          name TEXT NOT NULL,
          column_status TEXT DEFAULT 'Ожидает',
          person TEXT DEFAULT 'Костя',
          date TEXT,
          time TEXT,
          done INTEGER DEFAULT 0,
          urgent INTEGER DEFAULT 0,
          hashtags TEXT DEFAULT '[]',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          parent_id TEXT DEFAULT NULL,
          date_end TEXT DEFAULT '',
          priority TEXT DEFAULT 'medium',
          description TEXT DEFAULT ''
        );
        INSERT INTO tasks_new SELECT * FROM tasks;
        DROP TABLE tasks;
        ALTER TABLE tasks_new RENAME TO tasks;
      `);
    });
    migrateTasks();
  }
} catch (e) {
  console.error('Tasks migration error:', e.message);
}

// Create kanban_columns table for configurable project columns
db.exec(`
  CREATE TABLE IF NOT EXISTS kanban_columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT 'blue',
    sort_order INTEGER DEFAULT 0
  );
`);

// Create task_columns table for configurable task statuses
db.exec(`
  CREATE TABLE IF NOT EXISTS task_columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT 'blue',
    sort_order INTEGER DEFAULT 0
  );
`);

// Per-user notifications about task changes
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    actor TEXT DEFAULT '',
    action TEXT DEFAULT '',
    message TEXT NOT NULL,
    task_id TEXT,
    project_id TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_name, is_read);
`);

// Migration: add assignee to projects
try {
  db.prepare("SELECT assignee FROM projects LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE projects ADD COLUMN assignee TEXT DEFAULT ''");
}

// Users table (login accounts)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'manager',
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default users if table is empty
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password, name, role, avatar) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('Костя', 'kostya2026', 'Костя', 'admin', 'КИ');
  insertUser.run('Максим', 'maxim2026', 'Максим', 'admin', 'МИ');
  insertUser.run('Андрей', 'andrey2026', 'Андрей', 'admin', 'АН');
}

// Migration: epic flag for tasks (Agile-style parent stories)
try {
  db.prepare("SELECT is_epic FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN is_epic INTEGER DEFAULT 0");
}

// Migration: track who created / last updated a task
try {
  db.prepare("SELECT created_by FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN created_by TEXT DEFAULT ''");
}
try {
  db.prepare("SELECT updated_by FROM tasks LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE tasks ADD COLUMN updated_by TEXT DEFAULT ''");
}

// Goals (team objectives with multi-assignees and calendar dates)
db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignees TEXT DEFAULT '[]',
    date_start TEXT DEFAULT '',
    date_end TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_by TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
