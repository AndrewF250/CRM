/**
 * CRM System — Full Interactivity
 * Kanban drag&drop with status sync, inline editing, task CRUD, localStorage.
 */
(function() {
    'use strict';

    // ===== SIDEBAR TOGGLE =====
    var toggle = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', function() { sidebar.classList.toggle('open'); });
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target))
                sidebar.classList.remove('open');
        });
    }

    // ===== DROPDOWNS =====
    var notifBtn = document.getElementById('notifBtn');
    var notifDropdown = document.getElementById('notifDropdown');
    if (notifBtn && notifDropdown) notifBtn.addEventListener('click', function(e) { e.stopPropagation(); closeAll(); notifDropdown.classList.toggle('show'); });
    var userBtn = document.getElementById('userMenuBtn');
    var userDropdown = document.getElementById('userDropdown');
    if (userBtn && userDropdown) userBtn.addEventListener('click', function(e) { e.stopPropagation(); closeAll(); userDropdown.classList.toggle('show'); });
    document.addEventListener('click', closeAll);
    function closeAll() { document.querySelectorAll('.notif-dropdown.show, .user-dropdown.show').forEach(function(d) { d.classList.remove('show'); }); }

    // ===== MODALS =====
    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', window.closeModal);
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.closeModal(); });
    }
    window.openModal = function(id) {
        var el = document.getElementById(id);
        if (!el || !overlay) return;
        if (!overlay.contains(el)) { overlay.innerHTML = ''; overlay.appendChild(el); }
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    window.closeModal = function() {
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    };

    // ===== TABS =====
    document.querySelectorAll('.tabs').forEach(function(group) {
        var btns = group.querySelectorAll('.tab-btn');
        btns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var target = btn.dataset.tab;
                if (!target) return;
                btns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var parent = group.parentElement;
                parent.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
                var el = document.getElementById(target);
                if (el) el.classList.add('active');
            });
        });
    });

    // ===== COPY BUTTONS =====
    document.querySelectorAll('.cred-copy').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var val = btn.closest('.cred-block');
            if (!val) return;
            var txt = val.querySelector('.cred-value');
            if (!txt) return;
            navigator.clipboard.writeText(txt.textContent.trim()).then(function() {
                var orig = btn.innerHTML;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
                setTimeout(function() { btn.innerHTML = orig; }, 1500);
            });
        });
    });

    // ===== FILTER CHIPS (non-calendar) =====
    document.querySelectorAll('.filter-bar .filter-chip:not(.cal-filter):not(.cal-filter-person)').forEach(function(chip) {
        chip.addEventListener('click', function() {
            var bar = chip.closest('.filter-bar');
            bar.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
        });
    });

    // ===== TASK CHECKBOXES =====
    document.querySelectorAll('.task-checkbox').forEach(function(cb) {
        cb.addEventListener('change', function() {
            var item = cb.closest('.task-item');
            if (item) {
                item.classList.toggle('completed', cb.checked);
                // Update data if task has data-id
                var taskId = item.dataset.taskId;
                if (taskId && window.CRM) {
                    CRM.updateTask(taskId, { done: cb.checked, column: cb.checked ? 'Готово' : 'В работе' });
                }
            }
        });
    });

    // ===== TOAST =====
    window.showToast = function(msg, type) {
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 24px;border-radius:10px;font-size:0.9rem;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.2);';
        t.style.background = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 2500);
    };

    // ===== KANBAN DRAG & DROP WITH STATUS SYNC =====
    window.initKanban = function() {
        document.querySelectorAll('.kanban-card').forEach(function(card) {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', function(e) {
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.dataset.taskId || '');
            });
            card.addEventListener('dragend', function() {
                card.classList.remove('dragging');
                updateKanbanCounts();
            });
        });
        document.querySelectorAll('.kanban-column-body').forEach(function(col) {
            col.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.style.background = 'rgba(99,102,241,0.05)'; });
            col.addEventListener('dragleave', function() { col.style.background = ''; });
            col.addEventListener('drop', function(e) {
                e.preventDefault();
                col.style.background = '';
                var dragging = document.querySelector('.kanban-card.dragging');
                if (!dragging) return;
                col.appendChild(dragging);
                // Sync status
                var taskId = dragging.dataset.taskId;
                var newColumn = col.dataset.column;
                if (taskId && newColumn && window.CRM) {
                    CRM.moveTask(taskId, newColumn);
                    // Update badge color
                    updateCardStatus(dragging, newColumn);
                    showToast('Статус: ' + newColumn, 'success');
                }
                updateKanbanCounts();
            });
        });
    };

    function updateCardStatus(card, column) {
        var badge = card.querySelector('.kanban-card-status');
        if (!badge) return;
        var colorMap = { 'Готово': 'gray', 'В работе': 'green', 'Согласуем': 'yellow', 'Ожидает': 'gray' };
        var dot = badge.querySelector('.status-dot');
        if (dot) { dot.className = 'status-dot ' + (colorMap[column] || 'gray'); }
        var label = badge.querySelector('.status-label');
        if (label) label.textContent = column;
    }

    function updateKanbanCounts() {
        document.querySelectorAll('.kanban-column').forEach(function(c) {
            var badge = c.querySelector('.kanban-count');
            if (badge) badge.textContent = c.querySelectorAll('.kanban-card').length;
        });
    }

    // Auto-init kanban on page load
    if (document.querySelector('.kanban-board') || document.querySelector('.kanban-column-body')) {
        document.addEventListener('DOMContentLoaded', window.initKanban);
        // Also init now in case DOM is already ready
        if (document.readyState !== 'loading') window.initKanban();
    }

    // ===== ADD TASK MODAL =====
    window.addTaskToProject = function(projectId) {
        var name = document.getElementById('newTaskName').value.trim();
        if (!name) { showToast('Введите название задачи', 'error'); return; }
        var person = document.getElementById('newTaskPerson').value;
        var date = document.getElementById('newTaskDate').value;
        var time = document.getElementById('newTaskTime').value;
        var hashtagsRaw = document.getElementById('newTaskHashtags').value.trim();
        var hashtags = hashtagsRaw ? hashtagsRaw.split(',').map(function(s) { return s.trim(); }) : [];

        var task = CRM.addTask({
            projectId: projectId,
            name: name,
            column: 'Ожидает',
            person: person,
            date: date || '—',
            time: time || '',
            done: false,
            urgent: false,
            hashtags: hashtags,
        });

        // Add card to DOM
        var col = document.querySelector('.kanban-column-body[data-column="Ожидает"]');
        if (col) {
            var card = createTaskCard(task);
            col.appendChild(card);
            window.initKanban();
            updateKanbanCounts();
        }
        closeModal();
        showToast('Задача создана', 'success');
    };

    function createTaskCard(task) {
        var card = document.createElement('div');
        card.className = 'kanban-card';
        card.dataset.taskId = task.id;
        var tagsHtml = (task.hashtags || []).map(function(h) { return '<span class="hashtag">' + h + '</span>'; }).join('');
        card.innerHTML = '<div class="kanban-card-title" style="font-weight:600;font-size:0.85rem;">' + task.name + '</div>' +
            (tagsHtml ? '<div class="hashtags" style="margin-top:4px;">' + tagsHtml + '</div>' : '') +
            '<div style="font-size:0.7rem;color:var(--gray-500);margin-top:4px;">' + task.person + ' · ' + task.date + ' <span class="task-time">' + task.time + '</span></div>';
        return card;
    }

    // ===== EDIT PROJECT MODAL =====
    window.saveProjectEdit = function(projectId) {
        var updates = {};
        var fields = {
            'editName': 'name', 'editClient': 'client', 'editAmount': 'amount',
            'editStatus': 'status', 'editDeadline': 'deadline', 'editDescription': 'description',
            'editSource': 'source', 'editPayStatus': 'payStatus', 'editPayMethod': 'payMethod',
            'editDiscount': 'discount', 'editAdequacy': 'adequacy', 'editUrgent': 'urgent',
        };
        for (var elId in fields) {
            var el = document.getElementById(elId);
            if (!el) continue;
            if (el.type === 'checkbox') updates[fields[elId]] = el.checked;
            else if (el.type === 'number') updates[fields[elId]] = parseFloat(el.value) || 0;
            else updates[fields[elId]] = el.value;
        }
        // Recalculate progress based on tasks
        var tasks = CRM.getTasks(projectId);
        var done = tasks.filter(function(t) { return t.done; }).length;
        updates.progress = tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;

        CRM.updateProject(projectId, updates);
        closeModal();
        showToast('Проект обновлён', 'success');
        setTimeout(function() { location.reload(); }, 500);
    };

    // ===== QUICK PAY STATUS TOGGLE =====
    window.togglePayStatus = function(projectId) {
        var p = CRM.getProject(projectId);
        if (!p) return;
        var cycle = { 'unpaid': 'pending', 'pending': 'paid', 'paid': 'unpaid' };
        var newStatus = cycle[p.payStatus] || 'unpaid';
        CRM.updateProject(projectId, { payStatus: newStatus });
        // Update icon in DOM
        var icons = document.querySelectorAll('[data-pay-icon="' + projectId + '"]');
        icons.forEach(function(icon) {
            icon.className = 'pay-icon ' + newStatus;
            icon.title = { unpaid: 'Не оплачено', pending: 'Ждём оплату', paid: 'Оплачено' }[newStatus];
        });
        showToast({ unpaid: 'Не оплачено', pending: 'Ждём оплату', paid: 'Оплачено' }[newStatus], 'success');
    };

    // ===== INLINE EDIT (double-click) =====
    document.addEventListener('dblclick', function(e) {
        var el = e.target.closest('[data-editable]');
        if (!el || el.querySelector('input,textarea,select')) return;
        var field = el.dataset.editable;
        var currentValue = el.textContent.trim();
        var input;
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

        function save() {
            var newVal = input.value.trim() || currentValue;
            el.textContent = newVal;
            // Save to data if has data-id
            var taskId = el.closest('[data-task-id]');
            var projectId = el.closest('[data-project-id]');
            if (taskId) {
                var updates = {};
                updates[field] = newVal;
                CRM.updateTask(taskId.dataset.taskId, updates);
            } else if (projectId) {
                var updates2 = {};
                updates2[field] = newVal;
                CRM.updateProject(projectId.dataset.projectId, updates2);
            }
        }
        input.addEventListener('blur', save);
        input.addEventListener('keydown', function(ev) {
            if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); input.blur(); }
            if (ev.key === 'Escape') { el.textContent = currentValue; }
        });
    });

    // ===== RENDER PROJECT PAGE FROM DATA =====
    window.renderProjectPage = function(projectId) {
        var p = CRM.getProject(projectId);
        if (!p) return;
        var tasks = CRM.getTasks(projectId);
        var columns = ['Готово', 'В работе', 'Согласуем', 'Ожидает'];
        var board = document.getElementById('kanbanBoard');
        if (!board) return;

        var html = '';
        columns.forEach(function(col) {
            var colTasks = tasks.filter(function(t) { return t.column === col; });
            var bgMap = { 'Готово': 'var(--gray-100)', 'В работе': 'var(--success-light)', 'Согласуем': 'var(--warning-light)', 'Ожидает': 'var(--gray-100)' };
            html += '<div class="kanban-column" style="min-width:220px;flex:1;background:' + bgMap[col] + ';border-radius:var(--radius-lg);padding:12px;">';
            html += '<div style="font-weight:700;font-size:0.85rem;color:var(--gray-600);margin-bottom:10px;display:flex;align-items:center;gap:6px;">';
            html += '<span class="status-dot ' + ({'Готово':'gray','В работе':'green','Согласуем':'yellow','Ожидает':'gray'}[col]) + '"></span> ' + col;
            html += ' <span class="kanban-count" style="background:var(--gray-300);color:var(--gray-700);font-size:0.6rem;padding:2px 6px;border-radius:9999px;">' + colTasks.length + '</span></div>';
            html += '<div class="kanban-column-body" data-column="' + col + '" style="min-height:60px;">';
            colTasks.forEach(function(t) {
                var opacity = t.done ? 'opacity:0.6;' : '';
                var border = col === 'В работе' ? 'border:2px solid var(--success);' : col === 'Согласуем' ? 'border:2px solid var(--warning);' : 'border:1px solid var(--gray-200);';
                var tagsHtml = (t.hashtags || []).map(function(h) { return '<span class="hashtag">' + h + '</span>'; }).join('');
                var timer = t.urgent ? '<span class="timer-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></span>' : '';
                html += '<div class="kanban-card" data-task-id="' + t.id + '" style="background:var(--white);' + border + 'border-radius:var(--radius-md);padding:10px;margin-bottom:8px;cursor:grab;' + opacity + '">';
                html += '<div style="display:flex;align-items:center;gap:6px;"><input type="checkbox" ' + (t.done ? 'checked' : '') + ' style="width:14px;height:14px;" onchange="CRM.updateTask(\'' + t.id + '\',{done:this.checked,column:this.checked?\'Готово\':\'В работе\'});"><span style="font-weight:600;font-size:0.85rem;" data-editable="name">' + t.name + '</span></div>';
                if (tagsHtml) html += '<div class="hashtags" style="margin-top:4px;">' + tagsHtml + '</div>';
                html += '<div style="font-size:0.7rem;color:var(--gray-500);margin-top:4px;">' + t.person + ' · ' + t.date + ' ' + timer + ' <span class="task-time">' + t.time + '</span></div>';
                html += '</div>';
            });
            html += '</div></div>';
        });
        board.innerHTML = html;
        window.initKanban();
    };

})();
