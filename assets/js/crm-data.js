/**
 * CRM Data Layer — localStorage persistence + CRUD
 * Все данные проектов и задач хранятся в localStorage.
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'crm_data';

    // ===== DEFAULT DATA =====
    function defaultData() {
        return {
            projects: [
                { id:'petrov', name:'Авито бот', client:'ИП Петров', amount:85000, status:'В работе', urgent:true, deadline:'25.07.2026', progress:62, payStatus:'unpaid', payMethod:'По счёту', discount:'yes', discountVal:'10%', adequacy:'good', source:'Авито', workTypes:['Бот','Авито'], description:'Бот для автоматических ответов на Авито.', hashtags:['#бот','#авито','#telegram'] },
                { id:'romashka', name:'Корпоративный сайт', client:'ООО Ромашка', amount:150000, status:'Переговоры', urgent:false, deadline:'01.08.2026', progress:10, payStatus:'pending', payMethod:'По счёту', discount:'yes', discountVal:'5%', adequacy:'good', source:'Знакомые', workTypes:['Сайт'], description:'Корпоративный сайт на WordPress.', hashtags:['#wordpress','#сайт'] },
                { id:'mayak', name:'Контекстная реклама', client:'Студия Маяк', amount:45000, status:'В работе', urgent:false, deadline:'30.07.2026', progress:40, payStatus:'paid', payMethod:'Наличные', discount:'no', discountVal:'', adequacy:'good', source:'Реклама', workTypes:['Реклама'], description:'Настройка Яндекс.Директ.', hashtags:['#реклама','#директ'] },
                { id:'tehno', name:'Telegram бот', client:'ООО ТехноСервис', amount:60000, status:'В работе', urgent:false, deadline:'28.07.2026', progress:55, payStatus:'paid', payMethod:'По счёту', discount:'maybe', discountVal:'', adequacy:'good', source:'Telegram', workTypes:['Бот','Telegram'], description:'Telegram-бот для записи клиентов.', hashtags:['#бот','#telegram'] },
                { id:'kuznetsov', name:'SEO аудит', client:'ИП Кузнецов', amount:25000, status:'В работе', urgent:false, deadline:'26.07.2026', progress:30, payStatus:'pending', payMethod:'Наличные', discount:'no', discountVal:'', adequacy:'warn', source:'Авито', workTypes:['SEO'], description:'SEO-аудит сайта.', hashtags:['#seo','#аудит'] },
                { id:'sidorov', name:'SEO продвижение', client:'ИП Сидоров', amount:30000, status:'Абонемент', urgent:false, deadline:'Каждый месяц', progress:100, payStatus:'unpaid', payMethod:'По счёту', discount:'no', discountVal:'', adequacy:'good', source:'Знакомые', workTypes:['SEO'], description:'Ежемесячное SEO-продвижение.', hashtags:['#seo','#абонемент'] },
                { id:'barista', name:'Лендинг кофейни', client:'ИП Бариста', amount:50000, status:'Новый', urgent:false, deadline:'10.08.2026', progress:0, payStatus:'unpaid', payMethod:'Наличные', discount:'maybe', discountVal:'', adequacy:'good', source:'Сайт', workTypes:['Сайт'], description:'Лендинг для кофейни.', hashtags:['#wordpress','#лендинг'] },
                { id:'style', name:'Интернет-магазин', client:'ООО Стиль', amount:200000, status:'Новый', urgent:false, deadline:'15.09.2026', progress:0, payStatus:'unpaid', payMethod:'По счёту', discount:'no', discountVal:'', adequacy:'warn', source:'Реклама', workTypes:['Сайт','SEO'], description:'Интернет-магазин на WordPress.', hashtags:['#wordpress','#seo'] },
                { id:'xyz', name:'Мобильное приложение', client:'Стартап XYZ', amount:350000, status:'Переговоры', urgent:false, deadline:'01.10.2026', progress:5, payStatus:'unpaid', payMethod:'Рассрочка', discount:'no', discountVal:'', adequacy:'bad', source:'Telegram', workTypes:['Бот'], description:'Мобильное приложение + Telegram-бот.', hashtags:['#бот','#telegram'] },
                { id:'avto', name:'Настройка Авито', client:'ООО АвтоДеталь', amount:20000, status:'Выполнено', urgent:false, deadline:'Выполнено', progress:100, payStatus:'paid', payMethod:'Наличные', discount:'no', discountVal:'', adequacy:'good', source:'Авито', workTypes:['Авито'], description:'Настройка объявлений на Авито.', hashtags:['#авито'] },
                { id:'masterov', name:'Сайт-визитка', client:'ИП Мастеров', amount:40000, status:'Выполнено', urgent:false, deadline:'Выполнено', progress:100, payStatus:'paid', payMethod:'Наличные', discount:'no', discountVal:'', adequacy:'good', source:'Знакомые', workTypes:['Сайт'], description:'Сайт-визитка на WordPress.', hashtags:['#wordpress','#визитка'] },
                { id:'vesta', name:'Поддержка сайта', client:'ООО Веста', amount:15000, status:'Абонемент', urgent:false, deadline:'Каждый месяц', progress:100, payStatus:'paid', payMethod:'По счёту', discount:'no', discountVal:'', adequacy:'good', source:'Сайт', workTypes:['Сайт'], description:'Ежемесячная поддержка сайта.', hashtags:['#wordpress','#поддержка'] },
            ],
            tasks: [
                { id:'t1', projectId:'petrov', name:'Настроить webhook', column:'Готово', person:'Админ Иван', date:'20.07', time:'09:00', done:true, urgent:false, hashtags:['#бот'] },
                { id:'t2', projectId:'petrov', name:'Логика ответов', column:'Готово', person:'Админ Иван', date:'20.07', time:'14:00', done:true, urgent:false, hashtags:['#бот','#авито'] },
                { id:'t3', projectId:'petrov', name:'Интеграция с CRM', column:'В работе', person:'Админ Иван', date:'Сегодня', time:'10:00', done:false, urgent:true, hashtags:['#бот','#авито','#crm'] },
                { id:'t4', projectId:'petrov', name:'Тестирование', column:'Согласуем', person:'Менеджер А', date:'24.07', time:'14:00', done:false, urgent:false, hashtags:['#тест'] },
                { id:'t5', projectId:'petrov', name:'Деплой и передача', column:'Ожидает', person:'Админ Иван', date:'25.07', time:'12:00', done:false, urgent:false, hashtags:['#деплой','#авито'] },
                { id:'t6', projectId:'romashka', name:'Согласовать макет', column:'В работе', person:'Менеджер А', date:'Сегодня', time:'14:00', done:false, urgent:false, hashtags:['#wordpress','#дизайн'] },
                { id:'t7', projectId:'romashka', name:'Верстка главной', column:'Ожидает', person:'Админ Иван', date:'28.07', time:'10:00', done:false, urgent:false, hashtags:['#wordpress'] },
                { id:'t8', projectId:'mayak', name:'Подбор ключей', column:'Готово', person:'Админ Иван', date:'18.07', time:'10:00', done:true, urgent:false, hashtags:['#ключи'] },
                { id:'t9', projectId:'mayak', name:'Запустить рекламу', column:'В работе', person:'Админ Иван', date:'Сегодня', time:'16:00', done:false, urgent:false, hashtags:['#реклама','#директ'] },
                { id:'t10', projectId:'tehno', name:'Бот-заготовка', column:'Готово', person:'Админ Иван', date:'15.07', time:'09:00', done:true, urgent:false, hashtags:['#бот'] },
                { id:'t11', projectId:'tehno', name:'Уведомления', column:'В работе', person:'Админ Иван', date:'Завтра', time:'11:00', done:false, urgent:false, hashtags:['#бот','#telegram'] },
                { id:'t12', projectId:'kuznetsov', name:'Аудит сайта', column:'В работе', person:'Админ Иван', date:'18.07', time:'10:00', done:false, urgent:false, hashtags:['#seo'] },
                { id:'t13', projectId:'sidorov', name:'Отчёт по SEO', column:'В работе', person:'Админ Иван', date:'28.07', time:'09:00', done:false, urgent:false, hashtags:['#отчёт','#seo'] },
            ],
            nextTaskId: 14,
        };
    }

    // ===== LOAD / SAVE =====
    window.CRM = {
        _data: null,

        load: function() {
            try {
                var raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    this._data = JSON.parse(raw);
                    // Migration: ensure nextTaskId exists
                    if (!this._data.nextTaskId) this._data.nextTaskId = 100;
                } else {
                    this._data = defaultData();
                    this.save();
                }
            } catch(e) {
                this._data = defaultData();
                this.save();
            }
            return this._data;
        },

        save: function() {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); } catch(e) {}
        },

        reset: function() {
            this._data = defaultData();
            this.save();
            location.reload();
        },

        // ===== PROJECTS =====
        getProjects: function() { return this._data.projects; },
        getProject: function(id) {
            for (var i = 0; i < this._data.projects.length; i++) {
                if (this._data.projects[i].id === id) return this._data.projects[i];
            }
            return null;
        },
        updateProject: function(id, updates) {
            var p = this.getProject(id);
            if (!p) return;
            for (var k in updates) { if (updates.hasOwnProperty(k)) p[k] = updates[k]; }
            this.save();
        },
        addProject: function(proj) {
            proj.id = proj.id || 'proj_' + Date.now();
            this._data.projects.push(proj);
            this.save();
            return proj;
        },

        // ===== TASKS =====
        getTasks: function(projectId) {
            if (!projectId) return this._data.tasks;
            return this._data.tasks.filter(function(t) { return t.projectId === projectId; });
        },
        getTask: function(id) {
            for (var i = 0; i < this._data.tasks.length; i++) {
                if (this._data.tasks[i].id === id) return this._data.tasks[i];
            }
            return null;
        },
        updateTask: function(id, updates) {
            var t = this.getTask(id);
            if (!t) return;
            for (var k in updates) { if (updates.hasOwnProperty(k)) t[k] = updates[k]; }
            this.save();
        },
        addTask: function(task) {
            task.id = 't' + (this._data.nextTaskId++);
            this._data.tasks.push(task);
            this.save();
            return task;
        },
        deleteTask: function(id) {
            this._data.tasks = this._data.tasks.filter(function(t) { return t.id !== id; });
            this.save();
        },
        moveTask: function(taskId, newColumn) {
            var t = this.getTask(taskId);
            if (!t) return;
            t.column = newColumn;
            t.done = (newColumn === 'Готово');
            this.save();
        },

        // ===== HELPERS =====
        statusToColumn: function(status) {
            var map = { 'Новый': 'Ожидает', 'Переговоры': 'Согласуем', 'В работе': 'В работе', 'Абонемент': 'В работе', 'Выполнено': 'Готово' };
            return map[status] || 'Ожидает';
        },
        columnToStatus: function(column) {
            var map = { 'Готово': 'Выполнено', 'В работе': 'В работе', 'Согласуем': 'Переговоры', 'Ожидает': 'Новый' };
            return map[column] || 'Новый';
        },
    };

    CRM.load();
})();
