# 🔐 Auth System

Демонстраційний проект автентифікації з Node.js, що охоплює Cookies, Sessions, JWT та BCrypt.

## 🎯 Охоплені теми курсу

### Модуль 11 - Cookies

| Тема | Де демонструється |
|------|-------------------|
| `res.cookie()` | `src/index.js`, `auth.controller.js` |
| `cookie-parser` | `src/index.js` |
| `res.setHeader('Cookie', ...)` | демо |
| Cookie expiry (expires, maxAge) | `src/index.js` |
| Cookie security (httpOnly, sameSite) | `src/index.js` |
| Reading cookies `req.cookies` | `auth.middleware.js` |
| Clearing cookies `res.clearCookie()` | `auth.controller.js` |

### Модуль 12 - Session Cookie Authentication

| Тема | Де демонструється |
|------|-------------------|
| `express-session` | `src/index.js` |
| Session store | `src/index.js` |
| `req.session.user` | `auth.controller.js` |
| `req.session.destroy()` | `auth.controller.js` |
| Session cookie config | `src/index.js` |
| Flash messages | `src/index.js` |

### Модуль 13 - JWT Authentication

| Тема | Де демонструється |
|------|-------------------|
| `jwt.sign()` | `auth.middleware.js` |
| `jwt.verify()` | `auth.middleware.js` |
| JWT payload | `auth.middleware.js` |
| Token in cookie | `auth.controller.js` |
| Token in Authorization header | `auth.middleware.js` |
| Token expiry | `auth.middleware.js` |
| Middleware validation | `auth.middleware.js` |

### Модуль 14 - BCrypt

| Тема | Де демонструється |
|------|-------------------|
| `bcrypt.hash()` | `user.model.js` |
| `bcrypt.genSalt()` | `user.model.js` |
| `bcrypt.compare()` | `user.model.js` |
| Salt rounds | `user.model.js` |
| Password hashing on signup | `auth.controller.js` |
| Password verification on login | `auth.controller.js` |

## 📦 Встановлення

```bash
cd auth-system
npm install
```

## 🚀 Запуск

```bash
# Звичайний запуск
npm start

# Режим розробки
npm run dev
```

Сервер буде доступний: **http://localhost:3000**

## 👤 Демо-користувачі

```
Email:    admin@auth.com
Password: password123

Email:    user@auth.com
Password: password123
```

## 🛣️ Routes

### Auth Routes
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/login` | Форма входу |
| POST | `/auth/login` | Авторизація |
| GET | `/signup` | Форма реєстрації |
| POST | `/auth/signup` | Створити акаунт |
| GET | `/auth/logout` | Вихід |
| GET | `/auth/profile` | Профіль |
| POST | `/auth/profile` | Оновити профіль |

### Dashboard
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/` | Редирект на /dashboard або /login |
| GET | `/dashboard` | Dashboard (protected) |

### Demos
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/demo/cookies` | Встановити cookies |
| GET | `/demo/cookies/read` | Читати cookies |
| GET | `/demo/cookies/clear` | Очистити cookies |
| GET | `/demo/jwt` | Згенерувати JWT |

### API
| Метод | URL | Опис |
|-------|-----|------|
| POST | `/api/auth/login` | API авторизація |
| POST | `/api/auth/signup` | API реєстрація |
| GET | `/api/auth/me` | Поточний користувач |
| GET | `/api/auth/verify-token` | Перевірити JWT |
| POST | `/api/auth/refresh` | Оновити JWT |
| POST | `/api/auth/logout` | API вихід |

## 🧪 Тестування

### curl

```bash
# Web Login
curl -X POST http://localhost:3000/auth/login \
  -d "email=admin@auth.com&password=password123" \
  -c cookies.txt

# API Login (отримати JWT)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@auth.com","password":"password123"}'

# API з JWT
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### JavaScript (fetch)

```javascript
// Login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@auth.com', password: 'password123' })
});
const { token } = await response.json();

// Use token
fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

## 📚 Приклади коду

### Cookies

```javascript
// Встановлення cookie
res.cookie('name', 'value', {
    maxAge: 3600000,     // 1 година
    httpOnly: true,      // JS не має доступу
    secure: false,       // HTTPS only
    sameSite: 'strict'   // CSRF захист
});

// Читання cookie
console.log(req.cookies.name);

// Видалення cookie
res.clearCookie('name');
```

### Session

```javascript
// Зберегти в сесію
req.session.user = { id: 1, name: 'Admin' };

// Прочитати з сесії
console.log(req.session.user);

// Знищити сесію
req.session.destroy((err) => {
    res.redirect('/login');
});
```

### JWT

```javascript
const jwt = require('jsonwebtoken');

// Створити токен
const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: '24h' }
);

// Перевірити токен
try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(decoded);
} catch (err) {
    console.log('Токен невалідний');
}
```

### BCrypt

```javascript
const bcrypt = require('bcryptjs');

// Хешування
const hash = await bcrypt.hash(password, 10);

// Перевірка
const match = await bcrypt.compare(plainPassword, hash);
```

## 🔐 Безпека

| Функція | Реалізація |
|---------|------------|
| httpOnly cookies | Сесія недоступна з JS |
| sameSite | Захист від CSRF |
| BCrypt | Паролі з salt, rainbow table resistant |
| Rate limiting | 10 запитів/хв на auth endpoints |
| JWT expiry | Токени автоматично спливають |

## 📂 Структура проекту

```
auth-system/
├── package.json
├── README.md
├── src/
│   ├── index.js              # Express server
│   ├── config/
│   ├── routes/
│   │   ├── auth.routes.js    # Auth routes
│   │   └── api.routes.js     # API routes
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── models/
│       └── user.model.js
├── views/
│   ├── login.ejs
│   ├── signup.ejs
│   ├── dashboard.ejs
│   └── profile.ejs
├── public/
│   ├── css/style.css
│   └── js/
└── data/
    └── users.json
```

---

Happy coding! 🚀