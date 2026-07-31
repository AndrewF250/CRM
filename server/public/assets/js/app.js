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
                <a href="/pages/goals.html" class="nav-item${activePage === 'goals' ? ' active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    <span>Цели</span>
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
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                    <span>Настройки</span>
                </a>
            </div>
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="user-avatar"><span>${avatar}</span></div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-role">${role === 'admin' ? 'Администратор' : (role === 'manager' ? 'Менеджер' : 'Пользователь')}</div>
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
                <div class="header-hotkeys">
                    <button class="header-icon-btn header-hot-btn" id="hotkeysBtn" title="Хоткеи" aria-label="Хоткеи" aria-expanded="false">HOT</button>
                    <div class="hotkeys-dropdown" id="hotkeysDropdown">
                        <div class="hotkeys-header">Хоткеи</div>
                        <div class="hotkeys-settings" id="hotkeysSettings"></div>
                        <div class="hotkeys-list" id="hotkeysList"></div>
                    </div>
                </div>
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
                        <div class="notif-header">
                            <span>Уведомления</span>
                            <div style="display:flex;gap:2px;align-items:center;">
                                <button class="notif-clear" id="notifLoadMore" onclick="loadMoreNotifications(event)" title="Загрузить старые уведомления" aria-label="Загрузить старые уведомления" style="padding:4px 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg></button>
                                <button class="notif-clear" onclick="markAllNotificationsRead(event)" title="Прочитать все" aria-label="Прочитать все" style="padding:4px 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg></button>
                                <button class="notif-clear" onclick="deleteAllNotifications(event)" title="Удалить все" aria-label="Удалить все" style="padding:4px 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                            </div>
                        </div>
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
    // Badges must refresh on every call: pages re-render the whole #app on tab
    // switches, which resets the badge elements to their "0" template values
    updateBadges();

    if (window._commonUIInit) return;
    window._commonUIInit = true;

    // Overlay for mobile sidebar (lives outside #app, so created once)
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
    sidebarOverlay.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
    });

    function closeAll() {
        document.querySelectorAll('.notif-dropdown.show, .user-dropdown.show, .hotkeys-dropdown.show').forEach(d => d.classList.remove('show'));
        const hotBtn = document.getElementById('hotkeysBtn');
        if (hotBtn) hotBtn.setAttribute('aria-expanded', 'false');
    }

    // All header/sidebar clicks are delegated to document so they keep working
    // after pages replace the whole DOM via app.innerHTML = ...
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');

        if (e.target.closest('#sidebarToggle')) {
            if (sidebar) {
                sidebar.classList.toggle('open');
                sidebarOverlay.classList.toggle('show');
            }
            return;
        }

        if (e.target.closest('#hotkeysBtn')) {
            const dd = document.getElementById('hotkeysDropdown');
            const btn = document.getElementById('hotkeysBtn');
            const wasOpen = dd && dd.classList.contains('show');
            closeAll();
            if (dd && !wasOpen) {
                renderHotkeysPanel();
                dd.classList.add('show');
                if (btn) btn.setAttribute('aria-expanded', 'true');
            }
            return;
        }

        if (e.target.closest('#notifBtn')) {
            const dd = document.getElementById('notifDropdown');
            const wasOpen = dd && dd.classList.contains('show');
            closeAll();
            if (dd && !wasOpen) dd.classList.add('show');
            return;
        }

        if (e.target.closest('#userMenuBtn')) {
            const dd = document.getElementById('userDropdown');
            const wasOpen = dd && dd.classList.contains('show');
            closeAll();
            if (dd && !wasOpen) dd.classList.add('show');
            return;
        }

        if (e.target.closest('.hotkeys-dropdown')) return;

        closeAll();

        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target)) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        }

        // Tabs (.tab-btn with data-tab)
        const tabBtn = e.target.closest('.tabs .tab-btn');
        if (tabBtn) {
            const target = tabBtn.dataset.tab;
            if (target) {
                const group = tabBtn.closest('.tabs');
                group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                tabBtn.classList.add('active');
                group.parentElement.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const el = document.getElementById(target);
                if (el) el.classList.add('active');
            }
            return;
        }

        // Filter chips
        const chip = e.target.closest('.filter-bar .filter-chip');
        if (chip && !chip.classList.contains('cal-filter') && !chip.classList.contains('cal-filter-person')) {
            const bar = chip.closest('.filter-bar');
            bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        }
    });

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

}

// Notification pagination state
let _notifState = { offset: 0, total: 0 };

function renderNotifItem(n) {
    let time = '';
    if (n.created_at) {
        const dt = new Date(n.created_at.replace(' ', 'T') + 'Z');
        if (!isNaN(dt)) time = dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' + dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return `<div class="notif-item${n.is_read ? '' : ' unread'}" data-notif-id="${n.id}" onclick="openNotification(event, ${n.id}, '${n.task_id || ''}', '${n.project_id || ''}')" style="cursor:pointer;">
        <div class="notif-dot"></div>
        <div class="notif-content">
            <p>${n.message}</p>
            <span class="notif-time">${time}</span>
        </div>
    </div>`;
}

// The load-more button is always visible; nothing to toggle
function updateLoadMoreVisibility() {}

// Update sidebar badges + notification dropdown
async function updateBadges() {
    try {
        const stats = await API.getStats();
        const projectsBadge = document.getElementById('projectsBadge');
        const tasksBadge = document.getElementById('tasksBadge');
        const notifBadge = document.getElementById('notifBadge');
        
        if (projectsBadge) projectsBadge.textContent = stats.activeProjects;
        if (tasksBadge) tasksBadge.textContent = stats.pendingTasks;

        // Payment reminders + task notifications
        let reminders = [];
        let notifData = { items: [], unread: 0, total: 0 };
        try { reminders = (await API.get('/api/reminders?active=true')) || []; } catch (err) {}
        try { notifData = (await API.get('/api/notifications?limit=10&offset=0')) || notifData; } catch (err) {}
        _notifState = { offset: notifData.items.length, total: notifData.total };

        const notifList = document.getElementById('notifList');
        if (notifList) {
            let html = reminders.map(r => {
                const date = r.remind_date ? new Date(r.remind_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : '';
                return `<div class="notif-item unread" data-reminder-id="${r.id}">
                    <div class="notif-dot"></div>
                    <div class="notif-content">
                        <p>${r.message}</p>
                        <span class="notif-time">${date}</span>
                    </div>
                    <button class="notif-dismiss" onclick="dismissNotification(${r.id}, event)" title="Закрыть" aria-label="Закрыть уведомление">&times;</button>
                </div>`;
            }).join('');
            html += notifData.items.map(renderNotifItem).join('');
            notifList.innerHTML = html || '<div style="padding:20px;text-align:center;font-size:0.85rem;color:var(--gray-400);">Нет уведомлений</div>';
        }
        updateLoadMoreVisibility();

        if (notifBadge) {
            const count = reminders.length + (notifData.unread || 0);
            notifBadge.textContent = count;
            notifBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch (err) {
        console.error('Failed to update badges:', err);
    }
}

// Open the task/project a notification refers to
async function openNotification(e, id, taskId, projectId) {
    if (e) e.stopPropagation();
    try { await API.put(`/api/notifications/${id}/read`); } catch (err) {}
    if (taskId) {
        window.location.href = '/pages/task.html?id=' + encodeURIComponent(taskId);
    } else if (projectId) {
        window.location.href = '/pages/project.html?id=' + encodeURIComponent(projectId);
    } else {
        window.location.href = '/pages/tasks.html';
    }
}

// Mark all notifications as read (checkmark button)
async function markAllNotificationsRead(e) {
    if (e) e.stopPropagation();
    try {
        await API.put('/api/notifications/read-all');
        document.querySelectorAll('.notif-item[data-notif-id]').forEach(item => item.classList.remove('unread'));
        const badge = document.getElementById('notifBadge');
        const remindersCount = document.querySelectorAll('.notif-item[data-reminder-id]').length;
        if (badge) {
            badge.textContent = remindersCount;
            badge.style.display = remindersCount > 0 ? 'flex' : 'none';
        }
    } catch (err) {}
}

// Delete all notifications and reminders (cross button)
async function deleteAllNotifications(e) {
    if (e) e.stopPropagation();
    try {
        await API.delete('/api/notifications/all');
        const reminderItems = document.querySelectorAll('.notif-item[data-reminder-id]');
        for (const item of reminderItems) {
            try { await API.delete(`/api/reminders/${item.dataset.reminderId}`); } catch (err) {}
        }
        _notifState = { offset: 0, total: 0 };
        const list = document.getElementById('notifList');
        if (list) list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.85rem;color:var(--gray-400);">Нет уведомлений</div>';
        const badge = document.getElementById('notifBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        updateLoadMoreVisibility();
    } catch (err) {}
}

// Load older notifications, 10 at a time (circular arrow button)
async function loadMoreNotifications(e) {
    if (e) e.stopPropagation();
    try {
        const data = await API.get(`/api/notifications?limit=10&offset=${_notifState.offset}`);
        if (data && data.items.length > 0) {
            const list = document.getElementById('notifList');
            if (list) list.insertAdjacentHTML('beforeend', data.items.map(renderNotifItem).join(''));
            _notifState.offset += data.items.length;
            _notifState.total = data.total;
        } else if (typeof showToast === 'function') {
            showToast('Старых уведомлений больше нет', 'info');
        }
    } catch (err) {}
}

// Dismiss a single notification
async function dismissNotification(reminderId, e) {
    if (e) e.stopPropagation();
    try {
        await API.delete(`/api/reminders/${reminderId}`);
        const item = document.querySelector(`.notif-item[data-reminder-id="${reminderId}"]`);
        if (item) {
            item.style.transition = 'opacity 0.2s, transform 0.2s';
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            setTimeout(() => item.remove(), 200);
        }
        // Update badge count
        const badge = document.getElementById('notifBadge');
        if (badge) {
            const count = parseInt(badge.textContent) || 0;
            const newCount = Math.max(0, count - 1);
            badge.textContent = newCount;
            badge.style.display = newCount > 0 ? 'flex' : 'none';
        }
        // Show empty state if no more items
        setTimeout(() => {
            const list = document.getElementById('notifList');
            if (list && !list.querySelector('.notif-item')) {
                list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.85rem;color:var(--gray-400);">Нет уведомлений</div>';
            }
        }, 250);
    } catch (err) {}
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
        card.ondragstart = (e) => {
            document.body.classList.add('dnd-active');
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.taskId || card.dataset.projectId || '');
        };
        card.ondragend = () => {
            document.body.classList.remove('dnd-active');
            card.classList.remove('dragging');
            updateKanbanCounts();
        };
    });

    document.querySelectorAll('.kanban-column-body').forEach(col => {
        col.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            col.style.background = 'rgba(99,102,241,0.05)';
        };
        col.ondragleave = () => { col.style.background = ''; };
        col.ondrop = async (e) => {
            e.preventDefault();
            document.body.classList.remove('dnd-active');
            col.style.background = '';
            const dragging = document.querySelector('.kanban-card.dragging');
            if (!dragging) return;

            const taskId = dragging.dataset.taskId;
            const projectId = dragging.dataset.projectId;
            const newColumn = col.dataset.column;

            if (taskId && newColumn) {
                try {
                    await CRM.updateTask(taskId, {
                        column_status: newColumn,
                        done: /готов|выполн|done/i.test(newColumn || '')
                    });
                    col.appendChild(dragging);
                    showToast('Статус: ' + newColumn, 'success');
                } catch (err) {
                    showToast('Ошибка: ' + (err.message || ''), 'error');
                }
            } else if (projectId && newColumn) {
                try {
                    const projects = await API.getProjects();
                    const project = projects.find(p => p.id === projectId);
                    if (project) {
                        await API.updateProject(projectId, { ...project, status: newColumn });
                        col.appendChild(dragging);
                        showToast('Статус: ' + newColumn, 'success');
                    }
                } catch (err) {
                    showToast('Ошибка: ' + (err.message || ''), 'error');
                }
            }
            updateKanbanCounts();
        };
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

// ==================== REALTIME UPDATES ====================
// Poll the server change version; when data changed (by anyone), refresh
// badges/notifications and the current page (pages expose window.refreshPageData)
let _rtVersion = null;

async function pollRealtimeChanges() {
    if (!API.isLoggedIn()) return;
    try {
        const resp = await fetch('/api/version', { headers: { 'Authorization': 'Bearer ' + API.token } });
        if (!resp.ok) return;
        const data = await resp.json();
        if (_rtVersion !== null && data.v !== _rtVersion) {
            updateBadges();
            // Don't re-render while the user is editing in a modal or rich editor
            const overlay = document.getElementById('modalOverlay');
            const editing = overlay && overlay.classList.contains('show');
            if (!editing && typeof isAnyRichEditorOpen === 'function' && isAnyRichEditorOpen()) return;
            if (!editing && typeof window.refreshPageData === 'function') window.refreshPageData();
        }
        _rtVersion = data.v;
    } catch (err) {}
}

// Task burger menu — slides action tray to the left
window.toggleTaskMenu = function(btn) {
    const wrap = btn.closest('.task-actions');
    if (!wrap) return;
    const isOpen = wrap.classList.contains('open');
    document.querySelectorAll('.task-actions.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) wrap.classList.add('open');
};

document.addEventListener('click', function(e) {
    if (e.target.closest('.task-menu-tray .task-action-btn')) {
        document.querySelectorAll('.task-actions.open').forEach(el => el.classList.remove('open'));
        return;
    }
    if (!e.target.closest('.task-actions')) {
        document.querySelectorAll('.task-actions.open').forEach(el => el.classList.remove('open'));
    }
});

// ==================== GLOBAL HOTKEYS ====================
const HOTKEY_LS_ENABLED = 'crm_hotkeys_enabled';
const HOTKEY_LS_BLOCK_TYPING = 'crm_hotkeys_block_typing';

function getHotkeysEnabled() {
    const v = localStorage.getItem(HOTKEY_LS_ENABLED);
    return v === null ? true : v === '1';
}
function getHotkeysBlockTyping() {
    const v = localStorage.getItem(HOTKEY_LS_BLOCK_TYPING);
    return v === null ? true : v === '1';
}
function setHotkeysEnabled(on) {
    localStorage.setItem(HOTKEY_LS_ENABLED, on ? '1' : '0');
    updateHotkeysBtnState();
}
function setHotkeysBlockTyping(on) {
    localStorage.setItem(HOTKEY_LS_BLOCK_TYPING, on ? '1' : '0');
}

function updateHotkeysBtnState() {
    const btn = document.getElementById('hotkeysBtn');
    if (!btn) return;
    btn.classList.toggle('hotkeys-off', !getHotkeysEnabled());
    btn.title = getHotkeysEnabled() ? 'Хоткеи' : 'Хоткеи выключены';
}

const CRMKeys = {
    _page: [],
    register(items) {
        this._page = Array.isArray(items) ? items : [];
        renderHotkeysPanel();
    },
    clear() { this._page = []; renderHotkeysPanel(); },
    globals: [
        { keys: 'HOT / Ctrl+/', label: 'Подсказки хоткеев', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '/', always: true },
        { keys: 'Ctrl+K', label: 'Фокус на поиск', match: (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' },
        { keys: 'Ctrl+1', label: 'Дашборд', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '1', go: '/pages/dashboard.html' },
        { keys: 'Ctrl+2', label: 'Проекты', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '2', go: '/pages/projects.html' },
        { keys: 'Ctrl+3', label: 'Задачи', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '3', go: '/pages/tasks.html' },
        { keys: 'Ctrl+4', label: 'Цели', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '4', go: '/pages/goals.html' },
        { keys: 'Ctrl+5', label: 'Календарь', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '5', go: '/pages/calendar.html' },
        { keys: 'Ctrl+6', label: 'Деньги', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '6', go: '/pages/money.html' },
        { keys: 'Ctrl+7', label: 'Настройки', match: (e) => (e.ctrlKey || e.metaKey) && e.key === '7', go: '/pages/settings.html' },
        { keys: 'Ctrl+Z', label: 'Отмена (на странице)', match: (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey, action: 'undo' },
        { keys: 'Ctrl+Y', label: 'Повтор (на странице)', match: (e) => (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)), action: 'redo' },
        { keys: 'Esc', label: 'Закрыть модалку / меню', match: (e) => e.key === 'Escape' }
    ]
};

function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'textarea' || el.isContentEditable) return true;
    if (tag === 'select') return true;
    if (tag === 'input') {
        const type = (el.type || 'text').toLowerCase();
        if (['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'color', 'range', 'hidden'].includes(type)) return false;
        return true;
    }
    return false;
}

/** Text-editing shortcuts that should still work while typing */
function isTextEditingShortcut(e) {
    if (!(e.ctrlKey || e.metaKey)) return false;
    const k = e.key.toLowerCase();
    return ['a', 'c', 'v', 'x', 'z', 'y', 'b', 'i', 'u'].includes(k) || (k === 'z' && e.shiftKey);
}

function renderHotkeysSettings() {
    const box = document.getElementById('hotkeysSettings');
    if (!box) return;
    const enabled = getHotkeysEnabled();
    const blockTyping = getHotkeysBlockTyping();
    box.innerHTML = `
        <label class="hotkeys-switch">
            <span>Все хоткеи</span>
            <input type="checkbox" id="hkEnabled" ${enabled ? 'checked' : ''}>
            <span class="hotkeys-switch-ui" aria-hidden="true"></span>
        </label>
        <label class="hotkeys-switch">
            <span>Выкл. при вводе текста</span>
            <input type="checkbox" id="hkBlockTyping" ${blockTyping ? 'checked' : ''}>
            <span class="hotkeys-switch-ui" aria-hidden="true"></span>
        </label>
    `;
    const en = document.getElementById('hkEnabled');
    const bt = document.getElementById('hkBlockTyping');
    if (en) en.addEventListener('change', () => {
        setHotkeysEnabled(en.checked);
        if (bt) bt.disabled = !en.checked;
    });
    if (bt) {
        bt.disabled = !enabled;
        bt.addEventListener('change', () => setHotkeysBlockTyping(bt.checked));
    }
}

function renderHotkeysList() {
    const list = document.getElementById('hotkeysList');
    if (!list) return;
    const rows = [
        ...CRMKeys.globals.map(h => ({ keys: h.keys, label: h.label })),
        ...CRMKeys._page.map(h => ({ keys: h.keys, label: h.label }))
    ];
    list.innerHTML = rows.map(r => {
        const keysHtml = String(r.keys).split(/\s*\/\s*/).map(combo =>
            combo.split('+').map(k => '<kbd>' + k.trim() + '</kbd>').join('<span class="hotkeys-plus">+</span>')
        ).join(' <span class="hotkeys-plus">/</span> ');
        return `
        <div class="hotkeys-item">
            <span class="hotkeys-keys">${keysHtml}</span>
            <span class="hotkeys-label">${r.label}</span>
        </div>`;
    }).join('');
}

function renderHotkeysPanel() {
    renderHotkeysSettings();
    renderHotkeysList();
    updateHotkeysBtnState();
}

function toggleHotkeysPanel() {
    const dd = document.getElementById('hotkeysDropdown');
    const btn = document.getElementById('hotkeysBtn');
    if (!dd) return;
    const open = dd.classList.contains('show');
    document.querySelectorAll('.notif-dropdown.show, .user-dropdown.show').forEach(d => d.classList.remove('show'));
    if (open) {
        dd.classList.remove('show');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
        renderHotkeysPanel();
        dd.classList.add('show');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
}

function initGlobalHotkeys() {
    if (window._globalHotkeysInit) return;
    window._globalHotkeysInit = true;
    updateHotkeysBtnState();

    document.addEventListener('keydown', (e) => {
        const typing = isTypingTarget(document.activeElement);

        // Always allow opening the HOT panel
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleHotkeysPanel();
            return;
        }

        if (!getHotkeysEnabled()) return;

        // While typing: keep browser/text shortcuts, block CRM action hotkeys
        if (typing && getHotkeysBlockTyping()) {
            if (isTextEditingShortcut(e)) return;
            // Block page letter hotkeys (N, S, P…) and CRM navigation while typing
            for (const h of CRMKeys._page) {
                if (h.allowInInput && h.match && h.match(e)) {
                    e.preventDefault();
                    if (typeof h.run === 'function') h.run(e);
                    return;
                }
            }
            return;
        }

        // Page-specific
        for (const h of CRMKeys._page) {
            if (h.allowInInput || !typing) {
                if (h.match && h.match(e)) {
                    e.preventDefault();
                    if (typeof h.run === 'function') h.run(e);
                    return;
                }
            }
        }

        if (typing) return;

        for (const h of CRMKeys.globals) {
            if (!h.match || !h.match(e)) continue;
            if (h.keys === 'Esc' || h.always) continue;
            if (h.go) { e.preventDefault(); window.location.href = h.go; return; }
            if (h.action === 'undo' && typeof window.pageUndo === 'function') { e.preventDefault(); window.pageUndo(); return; }
            if (h.action === 'redo' && typeof window.pageRedo === 'function') { e.preventDefault(); window.pageRedo(); return; }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const search = document.querySelector('.search-input');
                if (search) search.focus();
                return;
            }
        }
    });
}

// ==================== RICH TEXT EDITOR ====================
function escapeHtmlAttr(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function sanitizeRichHtml(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    // Interactive nodes break drag-and-drop and card layout — strip them
    div.querySelectorAll('script,iframe,object,embed,link,style,input,textarea,select,button,form').forEach(n => n.remove());
    div.querySelectorAll('*').forEach(el => {
        [...el.attributes].forEach(a => {
            if (/^on/i.test(a.name) || ((a.name === 'href' || a.name === 'src') && /^\s*javascript:/i.test(a.value))) {
                el.removeAttribute(a.name);
            }
        });
        if (el.tagName === 'A') el.setAttribute('draggable', 'false');
    });
    return div.innerHTML;
}

function escapeHtmlText(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function plainOrHtmlToRich(text) {
    if (!text) return '';
    if (/<[a-z][\s\S]*>/i.test(text)) return sanitizeRichHtml(text);
    return String(text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

function renderRichHtml(text) {
    if (!text) return '';
    return plainOrHtmlToRich(text);
}

function stripHtmlText(html) {
    if (!html) return '';
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
}

/** YYYY-MM-DD[THH:mm] (+ optional legacy time) → value for datetime-local */
function toDatetimeLocalValue(dateStr, legacyTime) {
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    if (s.includes('T')) return s.slice(0, 16);
    if (/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return s.replace(' ', 'T').slice(0, 16);
    const day = s.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return '';
    const t = (legacyTime || '00:00').toString().slice(0, 5);
    return day + 'T' + ( /^\d{2}:\d{2}$/.test(t) ? t : '00:00' );
}

function todayDatetimeLocal() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function datePart(value) {
    if (!value) return '';
    return String(value).trim().slice(0, 10);
}

/** Display: 31.07.2026 14:00 */
function formatTaskDateTime(value, legacyTime) {
    const local = toDatetimeLocalValue(value, legacyTime);
    if (!local) return '';
    const [day, time] = local.split('T');
    const p = day.split('-');
    if (p.length !== 3) return local;
    const nice = `${p[2]}.${p[1]}.${p[0]}`;
    if (!time || time === '00:00') return nice;
    return nice + ' ' + time.slice(0, 5);
}

function formatTaskDateRange(t) {
    const a = formatTaskDateTime(t.date, t.time);
    const b = formatTaskDateTime(t.date_end, !t.date ? t.time : '');
    if (a && b && a !== b) return a + ' — ' + b;
    return a || b || '';
}

const PRIORITY_DOT = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
const PRIORITY_LABEL = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

function renderPriorityMark(priority) {
    const p = priority || 'medium';
    return `<span class="prio-mark" title="${PRIORITY_LABEL[p] || 'Средний'}" style="background:${PRIORITY_DOT[p] || PRIORITY_DOT.medium};"></span>`;
}

/**
 * Compact description preview (plain text) — safe for drag-and-drop cards.
 * Clicking the chevron toggles; does not navigate / start drag.
 */
function renderDescClamp(html, { lines = 3, id } = {}) {
    const text = stripHtmlText(html);
    if (!text) return '';
    const cid = id || ('dc_' + Math.random().toString(36).slice(2, 9));
    const long = text.length > 90;
    // Plain text only: rich HTML (checkbox/links/headings) breaks DnD and layout
    return `<div class="desc-clamp-wrap${long ? '' : ' desc-short'}" data-desc-clamp="${cid}">
        <div class="desc-clamp-row">
            <div class="desc-clamp" id="${cid}" style="--desc-lines:${lines}">${escapeHtmlText(text)}</div>
            ${long ? `<button type="button" class="desc-clamp-btn" onclick="event.stopPropagation();toggleDescClamp(this)" title="Развернуть" aria-label="Развернуть описание">
                <svg class="chev-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
                <svg class="chev-up" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18,15 12,9 6,15"/></svg>
            </button>` : ''}
        </div>
    </div>`;
}

window.toggleDescClamp = function(btn) {
    const wrap = btn && btn.closest ? btn.closest('.desc-clamp-wrap') : null;
    if (!wrap) return;
    wrap.classList.toggle('expanded');
    const open = wrap.classList.contains('expanded');
    btn.title = open ? 'Свернуть' : 'Развернуть';
    btn.setAttribute('aria-label', open ? 'Свернуть описание' : 'Развернуть описание');
};

function renderRichEditor(id, value = '', placeholder = 'Текст…') {
    const body = plainOrHtmlToRich(value);
    const empty = !stripHtmlText(value);
    return `
    <div class="rich-editor rich-collapsed" data-rich-wrap="${id}" data-placeholder="${escapeHtmlAttr(placeholder)}">
        <div class="rich-toolbar" data-rich-toolbar="${id}">
            <button type="button" data-cmd="bold" title="Жирный (Ctrl+B)"><b>B</b></button>
            <button type="button" data-cmd="italic" title="Курсив (Ctrl+I)"><i>I</i></button>
            <button type="button" data-cmd="underline" title="Подчёркнутый (Ctrl+U)"><u>U</u></button>
            <button type="button" data-cmd="strikeThrough" title="Зачёркнутый"><s>S</s></button>
            <span class="rich-sep"></span>
            <button type="button" data-cmd="formatBlock" data-val="h2" title="Заголовок">H2</button>
            <button type="button" data-cmd="formatBlock" data-val="h3" title="Подзаголовок">H3</button>
            <button type="button" data-cmd="formatBlock" data-val="p" title="Обычный текст">¶</button>
            <span class="rich-sep"></span>
            <button type="button" data-cmd="insertUnorderedList" title="Маркированный список">•</button>
            <button type="button" data-cmd="insertOrderedList" title="Нумерованный список">1.</button>
            <button type="button" data-cmd="checklist" title="Чекбоксы">☑</button>
            <span class="rich-sep"></span>
            <button type="button" data-cmd="justifyLeft" title="По левому краю">⇤</button>
            <button type="button" data-cmd="justifyCenter" title="По центру">≡</button>
            <button type="button" data-cmd="createLink" title="Ссылка">URL</button>
            <button type="button" data-cmd="removeFormat" title="Очистить формат">Tx</button>
            <button type="button" class="rich-done-btn" data-cmd="done" title="Готово">Готово</button>
        </div>
        <div class="rich-body${empty ? ' rich-empty' : ''}" id="${id}" contenteditable="false" data-placeholder="${escapeHtmlAttr(placeholder)}" role="textbox">${empty ? '' : body}</div>
    </div>`;
}

function getRichEditorValue(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.classList.contains('rich-empty')) return '';
    const html = el.innerHTML.trim();
    if (html === '<br>' || html === '<div><br></div>') return '';
    return sanitizeRichHtml(html);
}

/** Read description from rich editor or fallback textarea/input */
function getDescValue(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.classList.contains('rich-body')) return getRichEditorValue(id);
    return (el.value || '').trim();
}

function bindRichEditor(id, { onBlur, onChange } = {}) {
    const wrap = document.querySelector(`[data-rich-wrap="${id}"]`);
    const body = document.getElementById(id);
    if (!wrap || !body || wrap.dataset.richBound === '1') return;
    wrap.dataset.richBound = '1';

    function isOpen() {
        return !wrap.classList.contains('rich-collapsed');
    }

    function openEditor() {
        if (isOpen()) return;
        wrap.classList.remove('rich-collapsed');
        wrap.dataset.richOpen = '1';
        if (body.classList.contains('rich-empty')) {
            body.classList.remove('rich-empty');
            body.innerHTML = '';
        }
        body.contentEditable = 'true';
        body.focus();
    }

    function closeEditor(save) {
        if (!isOpen()) return;
        const html = getRichEditorValue(id);
        body.contentEditable = 'false';
        wrap.classList.add('rich-collapsed');
        delete wrap.dataset.richOpen;
        if (!stripHtmlText(html)) {
            body.innerHTML = '';
            body.classList.add('rich-empty');
        } else {
            body.classList.remove('rich-empty');
            body.innerHTML = sanitizeRichHtml(html);
        }
        if (save && typeof onBlur === 'function') onBlur(html);
    }

    wrap.querySelectorAll('[data-cmd]').forEach(btn => {
        // Keep focus in editor when using toolbar — never close on button press
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isOpen()) openEditor();
            const cmd = btn.dataset.cmd;
            if (cmd === 'done') {
                closeEditor(true);
                return;
            }
            body.focus();
            if (cmd === 'checklist') {
                document.execCommand('insertHTML', false,
                    '<ul class="rich-checklist"><li><input type="checkbox"> пункт</li></ul>');
                return;
            }
            if (cmd === 'createLink') {
                const url = prompt('Ссылка (https://…)', 'https://');
                if (url) document.execCommand('createLink', false, url);
                body.focus();
                return;
            }
            if (cmd === 'formatBlock') {
                document.execCommand('formatBlock', false, btn.dataset.val || 'h3');
                return;
            }
            document.execCommand(cmd, false, btn.dataset.val || null);
        });
    });

    body.addEventListener('click', (e) => {
        if (e.target && e.target.matches('input[type="checkbox"]')) {
            e.stopPropagation();
            return;
        }
        if (!isOpen()) {
            e.preventDefault();
            openEditor();
        }
    });

    wrap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isOpen() && !e.target.closest('.rich-toolbar')) {
            openEditor();
        }
    });

    body.addEventListener('mousedown', (e) => {
        if (e.target && e.target.matches('input[type="checkbox"]')) e.stopPropagation();
    });
    body.addEventListener('change', (e) => {
        if (e.target && e.target.matches('input[type="checkbox"]')) {
            if (e.target.checked) e.target.setAttribute('checked', '');
            else e.target.removeAttribute('checked');
            if (typeof onChange === 'function') onChange(getRichEditorValue(id));
            else if (typeof onBlur === 'function' && !isOpen()) onBlur(getRichEditorValue(id));
        }
    });

    // Close ONLY on click outside the editor (not on focus loss / toolbar)
    const onDocPointer = (e) => {
        if (!isOpen()) return;
        if (wrap.contains(e.target)) return;
        closeEditor(true);
    };
    document.addEventListener('mousedown', onDocPointer, true);
    wrap._richOutsideClose = onDocPointer;

    if (typeof onChange === 'function') {
        body.addEventListener('input', () => onChange(getRichEditorValue(id)));
    }
}

/** True if any rich editor is currently open (expanded) */
function isAnyRichEditorOpen() {
    return !!document.querySelector('.rich-editor[data-rich-open="1"]');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCommonUI();
    initCopyButtons();
    initInlineEdit();
    initGlobalHotkeys();
    setInterval(pollRealtimeChanges, 7000);
});
