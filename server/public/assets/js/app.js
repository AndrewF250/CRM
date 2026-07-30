/**
 * WebAgency CRM - Main Application
 * Full CRUD functionality with API backend
 */

// ==================== DARK MODE ====================
function initTheme() {
    const saved = localStorage.getItem('crm_theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('crm_theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('crm_theme', 'dark');
    }
    // Reload to apply theme to all inline-styled elements
    location.reload();
}

// ==================== SIDEBAR COMPONENT ====================
function renderSidebar(activePage) {
    const user = API.getCurrentUser();
    const avatar = user ? user.avatar : 'АИ';
    const name = user ? user.name : 'Админ';
    const role = user ? user.role : 'admin';
    
    return `
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <div class="logo-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/></svg>
                </div>
                <div class="logo-text">
                    <span class="logo-name">WebAgency</span>
                    <span class="logo-sub">CRM System</span>
                </div>
            </div>
        </div>
        <nav class="sidebar-nav">
            <div class="nav-section">
                <div class="nav-section-title">Главное</div>
                <a href="/pages/dashboard.html" class="nav-item${activePage === 'dashboard' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    <span>Дашборд</span>
                </a>
                <a href="/pages/projects.html" class="nav-item${activePage === 'projects' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    <span>Проекты</span>
                    <span class="nav-badge" id="projectsBadge">0</span>
                </a>
                <a href="/pages/tasks.html" class="nav-item${activePage === 'tasks' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    <span>Задачи</span>
                    <span class="nav-badge warning" id="tasksBadge">0</span>
                </a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Работа</div>
                <a href="/pages/documents.html" class="nav-item${activePage === 'documents' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    <span>Документы</span>
                </a>
                <a href="/pages/calendar.html" class="nav-item${activePage === 'calendar' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>Календарь</span>
                </a>
                <a href="/pages/money.html" class="nav-item${activePage === 'money' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    <span>Деньги</span>
                </a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Система</div>
                <a href="/pages/settings.html" class="nav-item${activePage === 'settings' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4"/></svg>
                    <span>Настройки</span>
                </a>
            </div>
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="user-avatar"><span>${avatar}</span></div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-role">${role === 'admin' ? 'Администратор' : 'Менеджер'}</div>
                </div>
            </div>
        </div>
    </aside>`;
}

// ==================== HEADER COMPONENT ====================
function renderHeader() {
    const user = API.getCurrentUser();
    const avatar = user ? user.avatar : 'АИ';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    return `
    <div class="main-wrapper">
        <header class="header">
            <div class="header-left">
                <button class="sidebar-toggle" id="sidebarToggle" aria-label="Меню">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                <div class="header-search">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="search-input" placeholder="Поиск..." aria-label="Поиск">
                </div>
            </div>
            <div class="header-right">
                <button class="header-icon-btn" onclick="toggleTheme()" title="${isDark ? 'Светлая тема' : 'Тёмная тема'}" aria-label="${isDark ? 'Светлая тема' : 'Тёмная тема'}">
                    ${isDark
                        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
                        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
                    }
                </button>
                <div class="header-notifications">
                    <button class="header-icon-btn" id="notifBtn" title="Уведомления" aria-label="Уведомления">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                        <span class="notif-badge" id="notifBadge">0</span>
                    </button>
                    <div class="notif-dropdown" id="notifDropdown">
                        <div class="notif-header"><span>Уведомления</span></div>
                        <div class="notif-list" id="notifList"></div>
                    </div>
                </div>
                <div class="header-user-menu">
                    <button class="header-user-btn" id="userMenuBtn" aria-label="Меню пользователя"><div class="header-avatar">${avatar}</div></button>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="/pages/settings.html" class="dropdown-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg> Настройки</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item danger" onclick="API.logout()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Выйти</a>
                    </div>
                </div>
            </div>
        </header>
        <main class="main-content">
            <div class="content-wrapper">`;
}

// ==================== INIT COMMON UI ====================
function initCommonUI() {
    // Sidebar toggle
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
        // Create overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            }
        });
    }

    // Dropdowns
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => { e.stopPropagation(); closeAll(); notifDropdown.classList.toggle('show'); });
    }
    const userBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => { e.stopPropagation(); closeAll(); userDropdown.classList.toggle('show'); });
    }
    document.addEventListener('click', closeAll);
    
    function closeAll() {
        document.querySelectorAll('.notif-dropdown.show, .user-dropdown.show').forEach(d => d.classList.remove('show'));
    }

    // Modal overlay
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

        // Focus trap: auto-focus first element when modal opens
        const modalObserver = new MutationObserver(() => {
            if (overlay.classList.contains('show')) {
                const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length) focusable[0].focus();
            }
        });
        modalObserver.observe(overlay, { attributes: true, attributeFilter: ['class'] });

        // Tab key trap within modal
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || !overlay.classList.contains('show')) return;
            const modal = overlay.querySelector('.modal');
            if (!modal) return;
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                last.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        });
    }

    // Tabs
    document.querySelectorAll('.tabs').forEach(group => {
        const btns = group.querySelectorAll('.tab-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                if (!target) return;
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const parent = group.parentElement;
                parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const el = document.getElementById(target);
                if (el) el.classList.add('active');
            });
        });
    });

    // Filter chips
    document.querySelectorAll('.filter-bar .filter-chip:not(.cal-filter):not(.cal-filter-person)').forEach(chip => {
        chip.addEventListener('click', () => {
            const bar = chip.closest('.filter-bar');
            bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // Update badges
    updateBadges();
}

// Update sidebar badges
async function updateBadges() {
    try {
        const stats = await API.getStats();
        const projectsBadge = document.getElementById('projectsBadge');
        const tasksBadge = document.getElementById('tasksBadge');
        const notifBadge = document.getElementById('notifBadge');
        
        if (projectsBadge) projectsBadge.textContent = stats.activeProjects;
        if (tasksBadge) tasksBadge.textContent = stats.pendingTasks;
        if (notifBadge) notifBadge.textContent = stats.overdueTasks;
    } catch (err) {
        console.error('Failed to update badges:', err);
    }
}

// ==================== STATUS HELPERS ====================
const statusColors = {
    'Новый': 'badge-primary',
    'Переговоры': 'badge-warning',
    'В работе': 'badge-success',
    'Абонемент': 'badge-info',
    'Выполнено': 'badge-gray'
};

const payStatusIcons = {
    'unpaid': { class: 'unpaid', title: 'Не оплачено' },
    'pending': { class: 'pending', title: 'Ждём оплату' },
    'paid': { class: 'paid', title: 'Оплачено' }
};

const payMethodClasses = {
    'Наличные': 'cash',
    'По счёту': 'invoice',
    'Рассрочка': 'installment'
};

const adequacyData = {
    'good': { emoji: '😊', label: 'Нормальный' },
    'warn': { emoji: '😐', label: 'Осторожно' },
    'bad': { emoji: '😡', label: 'Не работаем' }
};

function getStatusClass(status) {
    return statusColors[status] || 'badge-gray';
}

function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

// ==================== KANBAN DRAG & DROP ====================
function initKanban() {
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.taskId || '');
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            updateKanbanCounts();
        });
    });

    document.querySelectorAll('.kanban-column-body').forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.style.background = 'rgba(99,102,241,0.05)'; });
        col.addEventListener('dragleave', () => { col.style.background = ''; });
        col.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.style.background = '';
            const dragging = document.querySelector('.kanban-card.dragging');
            if (!dragging) return;
            
            const taskId = dragging.dataset.taskId;
            const newColumn = col.dataset.column;
            
            if (taskId && newColumn) {
                try {
                    // Get current task data
                    const tasks = await API.getTasks();
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        await API.updateTask(taskId, {
                            ...task,
                            column_status: newColumn,
                            done: newColumn === 'Готово'
                        });
                        col.appendChild(dragging);
                        showToast('Статус: ' + newColumn, 'success');
                    }
                } catch (err) {
                    showToast('Ошибка: ' + err.message, 'error');
                }
            }
            updateKanbanCounts();
        });
    });
}

function updateKanbanCounts() {
    document.querySelectorAll('.kanban-column').forEach(c => {
        const badge = c.querySelector('.kanban-count');
        if (badge) badge.textContent = c.querySelectorAll('.kanban-card').length;
    });
}

// ==================== COPY TO CLIPBOARD ====================
function initCopyButtons() {
    document.querySelectorAll('.cred-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const block = btn.closest('.cred-block');
            if (!block) return;
            const txt = block.querySelector('.cred-value');
            if (!txt) return;
            navigator.clipboard.writeText(txt.textContent.trim()).then(() => {
                const orig = btn.innerHTML;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
                setTimeout(() => { btn.innerHTML = orig; }, 1500);
            });
        });
    });
}

// ==================== BUTTON LOCK (prevent double-submit) ====================
async function withButtonLock(btnOrId, asyncFn) {
    const btn = typeof btnOrId === 'string' ? document.getElementById(btnOrId) : btnOrId;
    if (!btn) return asyncFn();
    if (btn.disabled) return;
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Сохранение...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
    try {
        return await asyncFn();
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
    }
}

// ==================== UNDO DELETE ====================
function confirmDelete(message, onConfirm) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:10px;font-size:0.875rem;font-weight:500;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:all 0.3s ease;max-width:420px;background:#1F2937;';
    let cancelled = false;
    let seconds = 5;
    t.innerHTML = `<span style="flex:1;">${message}</span><button id="undoBtn" style="background:rgba(255,255,255,0.15);border:none;color:#fff;cursor:pointer;padding:4px 12px;border-radius:6px;font-size:0.8rem;font-weight:600;white-space:nowrap;">Отменить (${seconds})</button>`;
    document.body.appendChild(t);

    const undoBtn = t.querySelector('#undoBtn');
    const interval = setInterval(() => {
        seconds--;
        if (undoBtn) undoBtn.textContent = `Отменить (${seconds})`;
        if (seconds <= 0) {
            clearInterval(interval);
            if (!cancelled) {
                t.style.opacity = '0';
                setTimeout(() => { t.remove(); onConfirm(); }, 300);
            }
        }
    }, 1000);

    undoBtn.addEventListener('click', () => {
        cancelled = true;
        clearInterval(interval);
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 300);
        showToast('Удаление отменено', 'info');
    });
}

// ==================== FORM VALIDATION ====================
function validateForm(fields) {
    let valid = true;
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        el.classList.remove('invalid');
        const group = el.closest('.form-group');
        if (group) group.classList.remove('has-error');

        const val = el.value.trim();
        if (f.required && !val) {
            el.classList.add('invalid');
            if (group) {
                group.classList.add('has-error');
                let errEl = group.querySelector('.form-error');
                if (!errEl) {
                    errEl = document.createElement('div');
                    errEl.className = 'form-error';
                    group.appendChild(errEl);
                }
                errEl.textContent = f.message || 'Обязательное поле';
            }
            valid = false;
        }
    });
    if (!valid) {
        const first = document.querySelector('.invalid');
        if (first) first.focus();
    }
    return valid;
}

// ==================== INLINE EDIT (double-click) ====================
function initInlineEdit() {
    document.addEventListener('dblclick', (e) => {
        const el = e.target.closest('[data-editable]');
        if (!el || el.querySelector('input,textarea,select')) return;

        const field = el.dataset.editable;
        const currentValue = el.textContent.trim();
        let input;

        if (field === 'description' || field === 'comment') {
            input = document.createElement('textarea');
            input.style.cssText = 'width:100%;min-height:60px;padding:6px;border:1px solid var(--primary);border-radius:6px;font:inherit;font-size:0.85rem;';
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.style.cssText = 'width:100%;padding:4px 8px;border:1px solid var(--primary);border-radius:6px;font:inherit;font-size:0.85rem;';
        }

        input.value = currentValue;
        el.textContent = '';
        el.appendChild(input);
        input.focus();
        input.select();

        async function save() {
            const newVal = input.value.trim() || currentValue;
            el.textContent = newVal;

            const taskEl = el.closest('[data-task-id]');
            const projectEl = el.closest('[data-project-id]');

            try {
                if (taskEl) {
                    const updates = {};
                    updates[field] = newVal;
                    await API.updateTask(taskEl.dataset.taskId, updates);
                } else if (projectEl) {
                    const updates = {};
                    updates[field] = newVal;
                    await API.updateProject(projectEl.dataset.projectId, updates);
                }
            } catch (err) {
                console.error('Inline edit save failed:', err);
            }
        }

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); input.blur(); }
            if (ev.key === 'Escape') { el.textContent = currentValue; }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCommonUI();
    initCopyButtons();
    initInlineEdit();
});
