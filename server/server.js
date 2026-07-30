const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3005;

// Users database (replace with your own credentials)
const users = [
  { id: 1, username: 'user1', password: 'CHANGE_ME_1', name: 'User 1', role: 'admin', avatar: 'U1' },
  { id: 2, username: 'user2', password: 'CHANGE_ME_2', name: 'User 2', role: 'admin', avatar: 'U2' },
  { id: 3, username: 'user3', password: 'CHANGE_ME_3', name: 'User 3', role: 'admin', avatar: 'U3' }
];

// Create sessions table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Clean expired sessions on startup
db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// Auth middleware - check database sessions
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')").get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = { id: session.user_id, username: session.username, name: session.name, role: session.role, avatar: session.avatar };
  next();
}

// Log activity
function logActivity(projectId, taskId, userName, action, details = '') {
  try {
    db.prepare('INSERT INTO activity (project_id, task_id, user_name, action, details) VALUES (?, ?, ?, ?, ?)').run(projectId, taskId, userName, action, details);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage });

// ==================== AUTH API ====================

app.post('/api/login', (req, res) => {
  const { username, password, remember } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
  
  const token = generateToken();
  // Token valid for 30 days if remember me, otherwise 24 hours
  const days = remember ? 30 : 1;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  
  db.prepare('INSERT INTO sessions (token, user_id, username, name, role, avatar, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    token, user.id, user.username, user.name, user.role, user.avatar, expiresAt
  );
  
  res.json({ 
    token, 
    user: { id: user.id, username: user.username, name: user.name, role: user.role, avatar: user.avatar },
    expires_at: expiresAt
  });
});

app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ==================== PROJECTS API ====================

app.get('/api/projects', requireAuth, (req, res) => {
  try {
    const { hashtag } = req.query;
    let projects;
    if (hashtag) {
      projects = db.prepare('SELECT * FROM projects WHERE hashtags LIKE ? ORDER BY created_at DESC').all(`%${hashtag}%`);
    } else {
      projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    }
    // Get team members for each project from tasks
    const teamStmt = db.prepare("SELECT DISTINCT person FROM tasks WHERE project_id = ? AND person != ''");
    res.json(projects.map(p => ({
      ...p,
      urgent: !!p.urgent,
      hashtags: JSON.parse(p.hashtags || '[]'),
      team: teamStmt.all(p.id).map(r => r.person)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', requireAuth, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const team = db.prepare("SELECT DISTINCT person FROM tasks WHERE project_id = ? AND person != ''").all(req.params.id).map(r => r.person);
    res.json({ ...project, urgent: !!project.urgent, hashtags: JSON.parse(project.hashtags || '[]'), team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', requireAuth, (req, res) => {
  try {
    const { id, name, client, phone, amount, status, urgent, deadline, progress, pay_status, pay_method, discount, discount_val, adequacy, source, description, hashtags, payment_due_date } = req.body;
    const projectId = id || 'proj_' + Date.now();
    
    db.prepare(`INSERT INTO projects (id, name, client, phone, amount, status, urgent, deadline, progress, pay_status, pay_method, discount, discount_val, adequacy, source, description, hashtags, payment_due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      projectId, name, client, phone || '', amount || 0, status || 'Новый', urgent ? 1 : 0, deadline, progress || 0,
      pay_status || 'unpaid', pay_method || 'По счёту', discount || 'no', discount_val || '',
      adequacy || 'good', source || 'Сайт', description || '', JSON.stringify(hashtags || []), payment_due_date || ''
    );
    
    // Create reminder if payment_due_date is set
    if (payment_due_date) {
      const remindDate = new Date(payment_due_date);
      remindDate.setDate(remindDate.getDate() - 3);
      const remindDateStr = remindDate.toISOString().split('T')[0];
      db.prepare('INSERT INTO reminders (project_id, type, message, remind_date) VALUES (?, ?, ?, ?)').run(
        projectId, 'payment', `Напоминание: оплата по проекту "${name}" через 3 дня (${payment_due_date})`, remindDateStr
      );
    }
    
    logActivity(projectId, null, req.user.name, 'create_project', `Создан проект: ${name}`);
    
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    res.status(201).json({ ...project, urgent: !!project.urgent, hashtags: JSON.parse(project.hashtags || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', requireAuth, (req, res) => {
  try {
    const { name, client, phone, amount, status, urgent, deadline, progress, pay_status, pay_method, discount, discount_val, adequacy, source, description, hashtags, payment_due_date } = req.body;
    
    const old = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    db.prepare(`UPDATE projects SET name=?, client=?, phone=?, amount=?, status=?, urgent=?, deadline=?, progress=?, pay_status=?, pay_method=?, discount=?, discount_val=?, adequacy=?, source=?, description=?, hashtags=?, payment_due_date=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?`).run(
      name, client, phone || '', amount, status, urgent ? 1 : 0, deadline, progress,
      pay_status, pay_method, discount, discount_val, adequacy, source,
      description, JSON.stringify(hashtags || []), payment_due_date || '', req.params.id
    );
    
    // Update reminder if payment_due_date changed
    if (payment_due_date && payment_due_date !== old.payment_due_date) {
      // Delete old reminders
      db.prepare("DELETE FROM reminders WHERE project_id = ? AND type = 'payment'").run(req.params.id);
      // Create new reminder
      const remindDate = new Date(payment_due_date);
      remindDate.setDate(remindDate.getDate() - 3);
      const remindDateStr = remindDate.toISOString().split('T')[0];
      db.prepare('INSERT INTO reminders (project_id, type, message, remind_date) VALUES (?, ?, ?, ?)').run(
        req.params.id, 'payment', `Напоминание: оплата по проекту "${name}" через 3 дня (${payment_due_date})`, remindDateStr
      );
    }
    
    if (old && old.status !== status) {
      logActivity(req.params.id, null, req.user.name, 'change_status', `${old.status} → ${status}`);
    }
    
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json({ ...project, urgent: !!project.urgent, hashtags: JSON.parse(project.hashtags || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all unique hashtags
app.get('/api/hashtags', requireAuth, (req, res) => {
  try {
    const projects = db.prepare('SELECT hashtags FROM projects').all();
    const allHashtags = new Set();
    projects.forEach(p => {
      const tags = JSON.parse(p.hashtags || '[]');
      tags.forEach(t => allHashtags.add(t));
    });
    res.json([...allHashtags].sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TASKS API ====================

app.get('/api/tasks', requireAuth, (req, res) => {
  try {
    const { project_id } = req.query;
    let tasks;
    if (project_id) {
      tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at').all(project_id);
    } else {
      tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at').all();
    }
    res.json(tasks.map(t => ({
      ...t,
      done: !!t.done,
      urgent: !!t.urgent,
      hashtags: JSON.parse(t.hashtags || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', requireAuth, (req, res) => {
  try {
    const { id, project_id, name, column_status, person, date, date_end, time, done, urgent, hashtags, parent_id, priority, description } = req.body;
    const taskId = id || 'task_' + Date.now();
    
    // Validate parent_id
    if (parent_id) {
      if (parent_id === taskId) return res.status(400).json({ error: 'Задача не может быть подзадачей самой себя' });
      const parent = db.prepare('SELECT * FROM tasks WHERE id = ?').get(parent_id);
      if (!parent) return res.status(400).json({ error: 'Родительская задача не найдена' });
      if (parent.project_id !== project_id) return res.status(400).json({ error: 'Родительская задача должна быть из того же проекта' });
    }
    
    db.prepare(`INSERT INTO tasks (id, project_id, name, column_status, person, date, date_end, time, done, urgent, hashtags, parent_id, priority, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      taskId, project_id || '', name, column_status || 'Ожидает', person || 'Костя',
      date || '', date_end || '', time || '', done ? 1 : 0, urgent ? 1 : 0, JSON.stringify(hashtags || []), parent_id || null, priority || 'medium', description || ''
    );
    
    if (project_id) updateProjectProgress(project_id);
    logActivity(project_id || '', taskId, req.user.name, 'create_task', `Создана задача: ${name}`);
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.status(201).json({ ...task, done: !!task.done, urgent: !!task.urgent, hashtags: JSON.parse(task.hashtags || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', requireAuth, (req, res) => {
  try {
    const { name, column_status, person, date, date_end, time, done, urgent, hashtags, parent_id, priority, description } = req.body;
    
    const old = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!old) return res.status(404).json({ error: 'Задача не найдена' });
    
    // Validate parent_id if changing
    const newParentId = parent_id !== undefined ? (parent_id || null) : old.parent_id;
    if (newParentId) {
      if (newParentId === req.params.id) return res.status(400).json({ error: 'Задача не может быть подзадачей самой себя' });
      let checkId = newParentId;
      while (checkId) {
        if (checkId === req.params.id) return res.status(400).json({ error: 'Нельзя создать цикл вложенности' });
        const p = db.prepare('SELECT parent_id FROM tasks WHERE id = ?').get(checkId);
        checkId = p ? p.parent_id : null;
      }
      const parent = db.prepare('SELECT * FROM tasks WHERE id = ?').get(newParentId);
      if (parent && parent.project_id !== old.project_id) return res.status(400).json({ error: 'Родительская задача должна быть из того же проекта' });
    }
    
    db.prepare(`UPDATE tasks SET name=?, column_status=?, person=?, date=?, date_end=?, time=?, done=?, urgent=?, hashtags=?, parent_id=?, priority=?, description=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?`).run(
      name, column_status, person, date || '', date_end || '', time || '', done ? 1 : 0, urgent ? 1 : 0,
      JSON.stringify(hashtags || []), newParentId, priority || 'medium', description || '', req.params.id
    );
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (task) {
      if (task.project_id) updateProjectProgress(task.project_id);
      if (old && old.done !== (done ? 1 : 0)) {
        logActivity(task.project_id, req.params.id, req.user.name, done ? 'complete_task' : 'uncomplete_task', name);
      }
    }
    
    res.json({ ...task, done: !!task.done, urgent: !!task.urgent, hashtags: JSON.parse(task.hashtags || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (task) updateProjectProgress(task.project_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function updateProjectProgress(projectId) {
  const stats = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) as done FROM tasks WHERE project_id = ?').get(projectId);
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  db.prepare('UPDATE projects SET progress = ? WHERE id = ?').run(progress, projectId);
}

// ==================== KANBAN COLUMNS API ====================

app.get('/api/kanban-columns', requireAuth, (req, res) => {
  try {
    const columns = db.prepare('SELECT * FROM kanban_columns ORDER BY sort_order').all();
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kanban-columns', requireAuth, (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название обязательно' });
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM kanban_columns').get();
    const sortOrder = (maxOrder.max || 0) + 1;
    const result = db.prepare('INSERT INTO kanban_columns (name, color, sort_order) VALUES (?, ?, ?)').run(name.trim(), color || 'blue', sortOrder);
    const column = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(column);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Колонка с таким названием уже существует' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/kanban-columns/:id', requireAuth, (req, res) => {
  try {
    const { name, color, sort_order } = req.body;
    const existing = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Колонка не найдена' });
    db.prepare('UPDATE kanban_columns SET name = ?, color = ?, sort_order = ? WHERE id = ?').run(
      name || existing.name, color || existing.color, sort_order !== undefined ? sort_order : existing.sort_order, req.params.id
    );
    const column = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(req.params.id);
    res.json(column);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Колонка с таким названием уже существует' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/kanban-columns/:id', requireAuth, (req, res) => {
  try {
    const column = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(req.params.id);
    if (!column) return res.status(404).json({ error: 'Колонка не найдена' });
    const projectsUsing = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get(column.name);
    if (projectsUsing.count > 0) return res.status(400).json({ error: `В колонке "${column.name}" ${projectsUsing.count} проектов. Сначала переместите их.` });
    db.prepare('DELETE FROM kanban_columns WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TASK COLUMNS API ====================

app.get('/api/task-columns', requireAuth, (req, res) => {
  try {
    const columns = db.prepare('SELECT * FROM task_columns ORDER BY sort_order').all();
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/task-columns', requireAuth, (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название обязательно' });
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM task_columns').get();
    const sortOrder = (maxOrder.max || 0) + 1;
    const result = db.prepare('INSERT INTO task_columns (name, color, sort_order) VALUES (?, ?, ?)').run(name.trim(), color || 'blue', sortOrder);
    const column = db.prepare('SELECT * FROM task_columns WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(column);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Статус с таким названием уже существует' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/task-columns/:id', requireAuth, (req, res) => {
  try {
    const { name, color, sort_order } = req.body;
    const existing = db.prepare('SELECT * FROM task_columns WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Статус не найден' });
    db.prepare('UPDATE task_columns SET name = ?, color = ?, sort_order = ? WHERE id = ?').run(
      name || existing.name, color || existing.color, sort_order !== undefined ? sort_order : existing.sort_order, req.params.id
    );
    const column = db.prepare('SELECT * FROM task_columns WHERE id = ?').get(req.params.id);
    res.json(column);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Статус с таким названием уже существует' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/task-columns/:id', requireAuth, (req, res) => {
  try {
    const column = db.prepare('SELECT * FROM task_columns WHERE id = ?').get(req.params.id);
    if (!column) return res.status(404).json({ error: 'Статус не найден' });
    const tasksUsing = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE column_status = ?').get(column.name);
    if (tasksUsing.count > 0) return res.status(400).json({ error: `Статус "${column.name}" используется ${tasksUsing.count} задачами. Сначала переместите их.` });
    db.prepare('DELETE FROM task_columns WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SUBTASKS API ====================

app.get('/api/tasks/:taskId/subtasks', requireAuth, (req, res) => {
  try {
    const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at').all(req.params.taskId);
    res.json(subtasks.map(s => ({ ...s, done: !!s.done })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subtasks', requireAuth, (req, res) => {
  try {
    const { task_id, name, person, deadline } = req.body;
    const subtaskId = 'sub_' + Date.now();
    
    db.prepare('INSERT INTO subtasks (id, task_id, name, person, deadline) VALUES (?, ?, ?, ?, ?)').run(subtaskId, task_id, name, person || '', deadline || '');
    
    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId);
    res.status(201).json({ ...subtask, done: !!subtask.done });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/subtasks/:id', requireAuth, (req, res) => {
  try {
    const { name, done, person, deadline } = req.body;
    db.prepare('UPDATE subtasks SET name=?, done=?, person=?, deadline=? WHERE id=?').run(name, done ? 1 : 0, person || '', deadline || '', req.params.id);
    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(req.params.id);
    res.json({ ...subtask, done: !!subtask.done });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subtasks/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM subtasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DOCUMENTS API ====================

app.get('/api/documents', requireAuth, (req, res) => {
  try {
    const { project_id, category } = req.query;
    let docs;
    if (project_id) {
      docs = db.prepare('SELECT * FROM documents WHERE project_id = ? ORDER BY created_at DESC').all(project_id);
    } else if (category) {
      if (category === 'template') {
        docs = db.prepare("SELECT * FROM documents WHERE doc_category = 'template' ORDER BY created_at DESC").all();
      } else {
        docs = db.prepare("SELECT d.*, p.name as project_name, p.client as project_client FROM documents d JOIN projects p ON d.project_id = p.id WHERE d.doc_category = 'client' OR d.doc_category IS NULL ORDER BY d.created_at DESC").all();
      }
    } else {
      docs = db.prepare('SELECT d.*, p.name as project_name, p.client as project_client FROM documents d JOIN projects p ON d.project_id = p.id ORDER BY d.created_at DESC').all();
    }
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', requireAuth, (req, res) => {
  try {
    const { project_id, name, type, size, doc_category, template_category } = req.body;
    const category = doc_category || 'client';
    const projId = category === 'template' ? null : project_id;
    const tplCat = template_category || 'Другое';
    db.prepare('INSERT INTO documents (project_id, name, type, size, doc_category, template_category) VALUES (?, ?, ?, ?, ?, ?)').run(projId, name, type, size || '', category, tplCat);
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    const { project_id, name, type, size, doc_category, template_category } = req.body;
    const category = doc_category || 'client';
    const projId = category === 'template' ? null : project_id;
    const tplCat = template_category || 'Другое';
    const file_path = req.file ? req.file.filename : null;
    db.prepare('INSERT INTO documents (project_id, name, type, size, file_path, doc_category, template_category) VALUES (?, ?, ?, ?, ?, ?, ?)').run(projId, name, type, size || '', file_path, category, tplCat);
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/uploads/:filename', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
});

// ==================== CALLS API ====================

app.get('/api/calls', requireAuth, (req, res) => {
  try {
    const { project_id } = req.query;
    let calls;
    if (project_id) {
      calls = db.prepare('SELECT * FROM calls WHERE project_id = ? ORDER BY created_at DESC').all(project_id);
    } else {
      calls = db.prepare('SELECT c.*, p.name as project_name, p.client as project_client FROM calls c JOIN projects p ON c.project_id = p.id ORDER BY c.created_at DESC').all();
    }
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/calls', requireAuth, (req, res) => {
  try {
    const { project_id, date, text } = req.body;
    db.prepare('INSERT INTO calls (project_id, date, text) VALUES (?, ?, ?)').run(project_id, date, text);
    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);
    res.status(201).json(call);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calls/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM calls WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ACTIVITY API ====================

app.get('/api/activity', requireAuth, (req, res) => {
  try {
    const { project_id, limit } = req.query;
    let activity;
    if (project_id) {
      activity = db.prepare('SELECT * FROM activity WHERE project_id = ? ORDER BY created_at DESC LIMIT ?').all(project_id, parseInt(limit) || 20);
    } else {
      activity = db.prepare('SELECT a.*, p.name as project_name, p.client as project_client FROM activity a LEFT JOIN projects p ON a.project_id = p.id ORDER BY a.created_at DESC LIMIT ?').all(parseInt(limit) || 50);
    }
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SALARIES API ====================

app.get('/api/salaries', requireAuth, (req, res) => {
  try {
    const { month } = req.query;
    let salaries;
    if (month) {
      salaries = db.prepare('SELECT * FROM salaries WHERE month = ? ORDER BY created_at DESC').all(month);
    } else {
      salaries = db.prepare('SELECT * FROM salaries ORDER BY created_at DESC').all();
    }
    res.json(salaries.map(s => ({ ...s, paid: !!s.paid })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/salaries', requireAuth, (req, res) => {
  try {
    const { user_name, amount, month, note } = req.body;
    db.prepare('INSERT INTO salaries (user_name, amount, month, note) VALUES (?, ?, ?, ?)').run(user_name, amount, month, note || '');
    const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);
    logActivity(null, null, req.user.name, 'add_salary', `Зарплата: ${user_name} - ${amount}₽ (${month})`);
    res.status(201).json({ ...salary, paid: !!salary.paid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/salaries/:id', requireAuth, (req, res) => {
  try {
    const { user_name, amount, month, paid, note } = req.body;
    const paidDate = paid ? new Date().toISOString().split('T')[0] : null;
    db.prepare('UPDATE salaries SET user_name=?, amount=?, month=?, paid=?, paid_date=?, note=? WHERE id=?').run(user_name, amount, month, paid ? 1 : 0, paidDate, note || '', req.params.id);
    const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(req.params.id);
    res.json({ ...salary, paid: !!salary.paid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/salaries/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM salaries WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EXPENSES API ====================

app.get('/api/expenses', requireAuth, (req, res) => {
  try {
    const { category, month } = req.query;
    let expenses;
    if (category) {
      expenses = db.prepare('SELECT * FROM expenses WHERE category = ? ORDER BY date DESC, created_at DESC').all(category);
    } else if (month) {
      expenses = db.prepare("SELECT * FROM expenses WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC, created_at DESC").all(month);
    } else {
      expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').all();
    }
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', requireAuth, (req, res) => {
  try {
    const { category, description, amount, date, person, project_id, note } = req.body;
    db.prepare('INSERT INTO expenses (category, description, amount, date, person, project_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)').run(category, description, amount, date, person || '', project_id || null, note || '');
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);
    logActivity(project_id || null, null, req.user.name, 'add_expense', `${category}: ${description} - ${amount}₽`);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/expenses/:id', requireAuth, (req, res) => {
  try {
    const { category, description, amount, date, person, project_id, note } = req.body;
    db.prepare('UPDATE expenses SET category=?, description=?, amount=?, date=?, person=?, project_id=?, note=? WHERE id=?').run(category, description, amount, date, person || '', project_id || null, note || '', req.params.id);
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/expenses/stats', requireAuth, (req, res) => {
  try {
    const { month } = req.query;
    let stats;
    if (month) {
      stats = db.prepare("SELECT category, SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date) = ? GROUP BY category ORDER BY total DESC").all(month);
    } else {
      stats = db.prepare("SELECT category, SUM(amount) as total FROM expenses GROUP BY category ORDER BY total DESC").all();
    }
    const total = stats.reduce((sum, s) => sum + s.total, 0);
    res.json({ categories: stats, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== REMINDERS API ====================

app.get('/api/reminders', requireAuth, (req, res) => {
  try {
    const { active } = req.query;
    let reminders;
    if (active === 'true') {
      const today = new Date().toISOString().split('T')[0];
      reminders = db.prepare(`
        SELECT r.*, p.name as project_name, p.client as project_client, p.amount as project_amount, p.payment_due_date
        FROM reminders r 
        JOIN projects p ON r.project_id = p.id 
        WHERE r.remind_date <= ? AND r.is_sent = 0
        ORDER BY r.remind_date ASC
      `).all(today);
    } else {
      reminders = db.prepare(`
        SELECT r.*, p.name as project_name, p.client as project_client, p.amount as project_amount, p.payment_due_date
        FROM reminders r 
        JOIN projects p ON r.project_id = p.id 
        ORDER BY r.remind_date DESC
      `).all();
    }
    res.json(reminders.map(r => ({ ...r, is_sent: !!r.is_sent })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reminders/:id/sent', requireAuth, (req, res) => {
  try {
    db.prepare('UPDATE reminders SET is_sent = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reminders/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== STATS API ====================

app.get('/api/stats', requireAuth, (req, res) => {
  try {
    const projects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    const activeProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status IN ('В работе', 'Переговоры', 'Новый', 'Абонемент')").get();
    const tasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE done = 0').get();
    const overdueTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 0 AND urgent = 1").get();
    const pendingPayments = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM projects WHERE pay_status = 'unpaid' OR pay_status = 'pending'").get();
    const clients = db.prepare('SELECT COUNT(DISTINCT client) as count FROM projects').get();
    
    res.json({
      totalProjects: projects.count,
      activeProjects: activeProjects.count,
      pendingTasks: tasks.count,
      overdueTasks: overdueTasks.count,
      pendingPayments: pendingPayments.total,
      totalClients: clients.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CRM Server running on http://0.0.0.0:${PORT}`);
});
