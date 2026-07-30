# CRM System — WebAgency

Внутренняя CRM для управления проектами веб-агентства. Только для сотрудников компании.

## Быстрый старт

```bash
cd server
npm install
node seed.js      # заполнить базу тестовыми данными
node server.js    # запустить сервер на порту 3005
```

Откройте http://localhost:3005

## Деплой на сервер

### Вариант 1: PM2 + Nginx

```bash
# Загрузить файлы на сервер
scp -r ./server/* user@server:/var/www/crm/

# На сервере:
cd /var/www/crm
npm install
node seed.js
npm install -g pm2
pm2 start server.js --name crm
pm2 save
pm2 startup
```

Nginx — проксировать на `http://127.0.0.1:3005`.

### Вариант 2: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server/ .
RUN npm install
RUN node seed.js
EXPOSE 3005
CMD ["node", "server.js"]
```

```bash
docker build -t crm .
docker run -d -p 3005:3005 crm
```

## Структура проекта

```
crm-webagency/
├── server/
│   ├── server.js       → Express API (681 строка)
│   ├── database.js     → SQLite схема и миграции
│   ├── seed.js         → заполнение базы тестовыми данными
│   ├── package.json    → зависимости
│   └── public/         → фронтенд (SPA)
│       ├── index.html  → редирект на login
│       ├── assets/
│       │   ├── css/style.css   → стили (570 строк)
│       │   └── js/
│       │       ├── api.js      → API-клиент с авторизацией
│       │       ├── app.js      → компоненты и UI-логика
│       │       └── crm-data.js → слой данных
│       └── pages/
│           ├── login.html      → авторизация
│           ├── dashboard.html  → дашборд
│           ├── projects.html   → Канбан-доска
│           ├── tasks.html      → задачи
│           ├── documents.html  → документы
│           ├── calendar.html   → календарь
│           ├── money.html      → финансы
│           ├── settings.html   → настройки
│           └── project.html    → детали проекта (динамическая)
├── nginx.conf          → конфиг Nginx
└── deploy.sh           → скрипт деплоя
```

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/login` | Авторизация |
| POST | `/api/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/projects` | Список проектов |
| POST | `/api/projects` | Создать проект |
| PUT | `/api/projects/:id` | Обновить проект |
| DELETE | `/api/projects/:id` | Удалить проект |
| GET | `/api/tasks` | Список задач |
| POST | `/api/tasks` | Создать задачу |
| PUT | `/api/tasks/:id` | Обновить задачу |
| DELETE | `/api/tasks/:id` | Удалить задачу |
| GET | `/api/documents` | Документы |
| POST | `/api/documents/upload` | Загрузить файл |
| GET | `/api/stats` | Статистика дашборда |
| GET | `/api/salaries` | Зарплаты |
| GET | `/api/expenses` | Расходы |

## Авторизация

Логины по умолчанию (захардкожены в `server.js`):

| Логин | Пароль |
|-------|--------|
| Костя | kostya2026 |
| Максим | maxim2026 |
| Андрей | andrey2026 |

## Требования

- Node.js 18+
- npm
