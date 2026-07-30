# WebAgency CRM

Внутренняя CRM для управления проектами веб-агентства. Node.js + Express + SQLite + Vanilla JS.

## Быстрый старт

```bash
cd server
npm install
node seed.js --reset   # заполнить базу тестовыми данными
node server.js          # запустить сервер на порту 3005
```

Откройте http://localhost:3005

## Логины

| Логин | Пароль |
|-------|--------|
| Костя | kostya2026 |
| Максим | maxim2026 |
| Андрей | andrey2026 |

---

## Структура проекта

```
crm-webagency/
├── server/
│   ├── server.js              → Express API (эндпоинты, авторизация, бизнес-логика)
│   ├── database.js            → SQLite схема таблиц + миграции
│   ├── seed.js                → заполнение БД тестовыми данными (--reset для перезаписи)
│   ├── package.json           → зависимости (express, better-sqlite3, multer, cors)
│   └── public/                → фронтенд (SPA на Vanilla JS)
│       ├── index.html         → редирект на login
│       ├── assets/
│       │   ├── css/style.css  → дизайн-система, компоненты, адаптив, тёмная тема
│       │   └── js/
│       │       ├── api.js     → API-клиент, loading bar, toast, модалки
│       │       ├── app.js     → sidebar, header, kanban, валидация, undo, theme
│       │       └── crm-data.js→ кэш данных (проекты, задачи)
│       └── pages/
│           ├── login.html     → авторизация
│           ├── dashboard.html → дашборд (статистика, задачи на сегодня, напоминания)
│           ├── projects.html  → проекты (канбан + таблица, настройка колонок)
│           ├── tasks.html     → задачи (иерархия, настройка статусов, action-кнопки)
│           ├── documents.html → документы (загрузка, привязка к проектам)
│           ├── calendar.html  → календарь (события по дням)
│           ├── money.html     → финансы (расходы, зарплаты, статистика)
│           ├── settings.html  → настройки профиля
│           └── project.html   → детали проекта (канбан задач, документы, звонки, доступы)
├── nginx.conf                 → конфиг Nginx (reverse proxy на порт 3005)
├── deploy.sh                  → скрипт деплоя на сервер
└── README.md
```

---

## Что за что отвечает

### Бэкенд

| Файл | Назначение |
|------|------------|
| `server/server.js` | Все API-эндпоинты, авторизация (сессии в SQLite), бизнес-логика, вычисление прогресса проектов |
| `server/database.js` | Создание таблиц (projects, tasks, subtasks, documents, calls, activity, salaries, expenses, reminders, sessions, kanban_columns, task_columns), миграции |
| `server/seed.js` | Тестовые данные: 12 проектов, 15 задач (с вложенностью), 5 колонок канбана, 5 статусов задач |

### Фронтенд — JavaScript

| Файл | Назначение |
|------|------------|
| `api.js` | HTTP-клиент с Bearer-токеном, loading bar при запросах, toast с иконками и close-кнопкой, `withButtonLock()` для блокировки кнопок при отправке, `validateForm()` с подсветкой ошибок, `confirmDelete()` с 5-секундным undo |
| `app.js` | `renderSidebar()` / `renderHeader()` — компоненты; `initKanban()` — drag-and-drop; inline-редактирование по двойному клику; тёмная тема (localStorage); мобильный overlay для sidebar; focus trap в модалках |
| `crm-data.js` | Кэш проектов и задач, CRUD через API, `moveTask()` для канбана |

### Фронтенд — страницы

| Страница | Функции |
|----------|---------|
| `dashboard.html` | 4 карточки статистики, задачи на сегодня, недавние проекты, напоминания об оплате |
| `projects.html` | Канбан-доска (drag-and-drop между колонками) + таблица; настраиваемые колонки (drag-and-drop, палитра цветов, inline-переименование); аватары команды из задач; фильтры по статусу (только таблица) и хештегам (с автокомплитом); full-width режим |
| `tasks.html` | Иерархический список задач (parent/child drag-to-nest); настраиваемые статусы (как колонки); фильтр по времени (Сегодня/Завтра/Неделя/Просроченные); action-кнопки: ✓ выполнено, ⏸ пауза/▶ продолжить, ⚙ редактирование; модалка редактирования задачи |
| `documents.html` | Загрузка файлов, привязка к проектам, фильтр по категориям |
| `calendar.html` | Месячный календарь, события по дням, цветовая маркировка |
| `money.html` | Расходы по категориям, зарплаты сотрудников, статистика по месяцам |
| `project.html` | Канбан задач проекта (drag-to-nest), документы, звонки, доступы; вложенные задачи в карточках |
| `settings.html` | Профиль, уведомления |
| `login.html` | Авторизация с "запомнить меня" |

### Стили

| Секция в `style.css` | Назначение |
|----------------------|------------|
| CSS Variables | Дизайн-тokens (цвета, отступы, тени, радиусы), тёмная тема через `[data-theme="dark"]` |
| Sidebar/Header | Навигация, поиск, уведомления, меню пользователя |
| Kanban | Доска с колонками, карточки, drag-and-drop, drop-target |
| Tables | Табличный вид проектов |
| Forms/Modals | Поля ввода, модальные окна с focus trap |
| Responsive | 480px / 768px / 1024px / 1440px / 1920px / 2560px breakpoints |
| Components | Toast, loading bar, skeleton, empty state, team avatars, color palette, inline rename |

---

## API эндпоинты

### Авторизация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/login` | Логин (username, password, remember) |
| POST | `/api/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |

### Проекты
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/projects` | Все проекты (с team из задач) |
| GET | `/api/projects/:id` | Один проект |
| POST | `/api/projects` | Создать |
| PUT | `/api/projects/:id` | Обновить |
| DELETE | `/api/projects/:id` | Удалить (CASCADE задачи) |

### Задачи
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/tasks` | Все задачи (?project_id=) |
| POST | `/api/tasks` | Создать (с parent_id для вложенности) |
| PUT | `/api/tasks/:id` | Обновить (parent_id, column_status, done) |
| DELETE | `/api/tasks/:id` | Удалить |

### Подзадачи (чеклисты)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/tasks/:id/subtasks` | Подзадачи |
| POST | `/api/subtasks` | Создать |
| PUT | `/api/subtasks/:id` | Обновить |
| DELETE | `/api/subtasks/:id` | Удалить |

### Колонки проектов
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/kanban-columns` | Список колонок |
| POST | `/api/kanban-columns` | Создать |
| PUT | `/api/kanban-columns/:id` | Обновить (name, color, sort_order) |
| DELETE | `/api/kanban-columns/:id` | Удалить (нельзя если есть проекты) |

### Статусы задач
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/task-columns` | Список статусов |
| POST | `/api/task-columns` | Создать |
| PUT | `/api/task-columns/:id` | Обновить |
| DELETE | `/api/task-columns/:id` | Удалить (нельзя если есть задачи) |

### Документы, звонки, финансы
| Метод | Путь | Описание |
|-------|------|----------|
| GET/POST/DELETE | `/api/documents` | Документы |
| POST | `/api/documents/upload` | Загрузка файла |
| GET/POST/DELETE | `/api/calls` | Звонки |
| GET/POST/PUT/DELETE | `/api/salaries` | Зарплаты |
| GET/POST/PUT/DELETE | `/api/expenses` | Расходы |
| GET | `/api/expenses/stats` | Статистика расходов |
| GET | `/api/stats` | Общая статистика |
| GET | `/api/activity` | Лог активности |

---

## Деплой

### PM2 + Nginx
```bash
scp -r ./server/* user@server:/var/www/crm/
ssh user@server "cd /var/www/crm && npm install && node seed.js && pm2 start server.js --name crm"
```

### Docker
```bash
docker build -t crm .
docker run -d -p 3005:3005 crm
```

---

## Требования

- Node.js 18+
- npm
