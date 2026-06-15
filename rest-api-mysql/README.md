# 📦 REST API з MySQL

Повноцінний REST API сервер з MySQL базою даних, що демонструє CRUD операції.

## 🎯 Охоплені теми курсу

| Модуль | Тема | Де демонструється |
|--------|------|-------------------|
| **MySQL Basics** | Підключення до БД | `src/config/db.config.js` |
| **MySQL Basics** | pool.query() | `src/controllers/*.js` |
| **MySQL Basics** | pool.execute() | `src/controllers/*.js` |
| **MySQL Basics** | INSERT, UPDATE, DELETE | `src/controllers/*.js` |
| **REST APIs** | API Creation | `src/index.js` |
| **REST APIs** | Status Codes | `src/controllers/*.js` |
| **REST APIs** | CRUD з POST/GET/PUT/DELETE | `src/routes/*.js` |
| **Express.js** | express.Router() | `src/routes/*.routes.js` |
| **Express.js** | Middleware | `src/index.js` |
| **Express.js** | JSON body parsing | `src/index.js` |

## 📦 Встановлення

```bash
cd rest-api-mysql
npm install
```

## 🗄️ Налаштування MySQL

1. Скопіюйте `.env.example` в `.env`
2. Вкажіть ваші дані для підключення:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rest_api_db
PORT=3000
```

3. Ініціалізуйте базу даних:

```bash
npm run db:init
```

## 🚀 Запуск

```bash
# Режим розробки (з Nodemon)
npm run dev

# Звичайний запуск
npm start
```

Сервер буде доступний: **http://localhost:3000**

## 📂 Структура проекту

```
rest-api-mysql/
├── package.json
├── README.md
├── env.example
├── src/
│   ├── index.js              # Головний сервер
│   ├── config/
│   │   └── db.config.js      # MySQL пул з'єднань
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   └── api.routes.js
│   ├── controllers/
│   │   ├── user.controller.js
│   │   └── product.controller.js
│   └── utils/
└── sql/
    ├── schema.sql            # Схема БД
    └── init.js               # Скрипт ініціалізації
```

## 🛣️ API Endpoints

### Користувачі

| Метод | URL | Опис | Status Codes |
|-------|-----|------|--------------|
| GET | `/api/users` | Всі користувачі | 200 |
| GET | `/api/users/:id` | Один користувач | 200, 404 |
| POST | `/api/users` | Створити | 201, 400, 409 |
| PUT | `/api/users/:id` | Оновити | 200, 400, 404 |
| DELETE | `/api/users/:id` | Видалити | 200, 404 |

### Товари

| Метод | URL | Опис | Query params |
|-------|-----|------|--------------|
| GET | `/api/products` | Всі товари | `?category=X&minPrice=X&maxPrice=X&sort=price` |
| GET | `/api/products/:id` | Один товар | - |
| POST | `/api/products` | Створити | 201, 400 |
| PUT | `/api/products/:id` | Оновити | 200, 400, 404 |
| DELETE | `/api/products/:id` | Видалити | 200, 404 |

## 🧪 Тестування

### curl

```bash
# Отримати всіх користувачів
curl http://localhost:3000/api/users

# Отримати одного користувача
curl http://localhost:3000/api/users/1

# Створити користувача
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"Новий користувач","email":"new@test.com","role":"user"}' \
     http://localhost:3000/api/users

# Оновити користувача
curl -X PUT -H "Content-Type: application/json" \
     -d '{"status":"inactive"}' \
     http://localhost:3000/api/users/1

# Видалити користувача
curl -X DELETE http://localhost:3000/api/users/5

# Фільтрація товарів
curl "http://localhost:3000/api/products?category=electronics&minPrice=1000&sort=-price"
```

## 📚 Приклади коду

### Підключення до MySQL

```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'my_db',
    connectionLimit: 10
});

// Використання
const [rows] = await pool.query('SELECT * FROM users');
```

### pool.query() vs pool.execute()

```javascript
// query() - автоекранування, для SELECT
const [users] = await pool.query(
    'SELECT * FROM users WHERE status = ?',
    ['active']
);

// execute() - prepared statements, для INSERT/UPDATE
const [result] = await pool.execute(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['John', 'john@example.com']
);
```

### CRUD операції

```javascript
// CREATE
const [result] = await pool.execute(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
);
console.log(result.insertId);

// READ
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

// UPDATE
const [result] = await pool.execute(
    'UPDATE users SET status = ? WHERE id = ?',
    ['active', id]
);
console.log(result.affectedRows);

// DELETE
const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
```

### Express Router

```javascript
const express = require('express');
const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
```

## 🔢 HTTP Status Codes

| Код | Опис | Коли використовується |
|-----|------|----------------------|
| 200 | OK | Успішний GET, PUT, DELETE |
| 201 | Created | Створено новий ресурс |
| 400 | Bad Request | Невалідні дані |
| 404 | Not Found | Ресурс не знайдено |
| 409 | Conflict | Дублікат (напр. email) |
| 500 | Internal Server Error | Серверна помилка |

## 🎓 Завдання

1. Додати пагінацію: `?page=1&limit=10`
2. Додати пошук: `?q=searchterm`
3. Реалізувати валідацію з Joi
4. Додати JWT авторизацію
5. Написати unit тести з Jest

---

Happy coding! 🚀