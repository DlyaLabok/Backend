/**
 * index.js - Auth System Server
 * Демонструє:
 * - Cookies (res.cookie, cookie-parser)
 * - Session (express-session)
 * - JWT (jsonwebtoken)
 * - BCrypt (bcryptjs)
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Модель користувача (JSON файл для демо)
const UserModel = require('./models/user.model');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cookie налаштування
app.use((req, res, next) => {
    // Демо: виводимо cookies в консоль
    if (req.cookies && Object.keys(req.cookies).length > 0) {
        console.log('🍪 Cookies:', req.cookies);
    }
    next();
});

// Static files
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// ============================================
// Session Configuration
// ============================================

// Демо session store (в пам'яті)
// В продакшені використовувати express-mysql-session або express-redis-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'auth-system-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    name: 'auth_session',           // Назва cookie
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 години
        httpOnly: true,              // Доступ тільки через HTTP
        secure: false,               // true тільки через HTTPS
        sameSite: 'lax'              // Захист від CSRF
    }
}));

// ============================================
// Flash Messages Middleware
// ============================================

app.use((req, res, next) => {
    // Flash messages (одноразові повідомлення)
    res.locals.success = req.session.success || [];
    res.locals.error = req.session.error || [];

    // Очищуємо після читання
    req.session.success = [];
    req.session.error = [];

    // Додаємо user до locals
    res.locals.user = req.session.user || null;

    next();
});

// ============================================
// Auth Middleware
// ============================================

const { requireAuth, requireAdmin, generateToken, verifyToken } = require('./middleware/auth.middleware');

// Підключаємо до locals для використання в views
app.use((req, res, next) => {
    res.locals.generateToken = generateToken;
    res.locals.verifyToken = verifyToken;
    next();
});

// ============================================
// Routes
// ============================================

// Головна / Dashboard
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Dashboard (тільки для авторизованих)
app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user
    });
});

// Auth routes
app.use('/auth', require('./routes/auth.routes'));

// API endpoints (для демонстрації)
app.use('/api/auth', require('./routes/api.routes'));

// ============================================
// Demo: Cookie Examples
// ============================================

app.get('/demo/cookies', (req, res) => {
    // Встановлюємо cookies
    res.cookie('demo_cookie', 'Hello from cookie!', {
        maxAge: 3600000,      // 1 година
        httpOnly: false,       // Доступний з JavaScript
        sameSite: 'strict'
    });

    res.cookie('theme', 'dark', { maxAge: 86400000 }); // 1 день

    res.send(`
        <h1>🍪 Cookies Demo</h1>
        <p>Cookies встановлено! Перевірте DevTools → Application → Cookies</p>
        <a href="/demo/cookies/read">Читати cookies →</a>
        <br><br>
        <a href="/dashboard">Dashboard →</a>
    `);
});

app.get('/demo/cookies/read', (req, res) => {
    res.send(`
        <h1>🍪 Читання Cookies</h1>
        <pre>${JSON.stringify(req.cookies, null, 2)}</pre>
        <a href="/demo/cookies/clear">Очистити cookies →</a>
    `);
});

app.get('/demo/cookies/clear', (req, res) => {
    // Видаляємо cookies
    res.clearCookie('demo_cookie');
    res.clearCookie('theme');

    res.send(`
        <h1>🍪 Cookies очищено!</h1>
        <a href="/dashboard">Dashboard →</a>
    `);
});

// ============================================
// Demo: JWT Examples
// ============================================

app.get('/demo/jwt', requireAuth, (req, res) => {
    const user = req.session.user;

    // Генеруємо JWT
    const token = generateToken(user);

    res.send(`
        <h1>🔑 JWT Demo</h1>
        <h3>Користувач: ${user.name}</h3>

        <h4>JWT Token:</h4>
        <code style="word-break: break-all;">${token}</code>

        <h4>Розшифрований payload:</h4>
        <pre>${JSON.stringify(verifyToken(token), null, 2)}</pre>

        <br>
        <a href="/api/auth/verify-token?token=${token}">Перевірити токен через API →</a>
        <br><br>
        <a href="/dashboard">Dashboard →</a>
    `);
});

// ============================================
// Error Handling
// ============================================

app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Не знайдено',
        message: 'Сторінку не знайдено'
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).send('Server Error: ' + err.message);
});

// ============================================
// Server Start
// ============================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                 Auth System - Node.js                       ║
╠════════════════════════════════════════════════════════════╣
║  🌐 Сервер:          http://localhost:${PORT}                   ║
║                                                            ║
║  🔐 Auth Features:                                         ║
║  • Cookies (res.cookie, cookie-parser)                     ║
║  • Sessions (express-session)                              ║
║  • JWT (jsonwebtoken)                                      ║
║  • BCrypt (bcryptjs)                                       ║
║                                                            ║
║  📍 Routes:                                                ║
║  • GET  /login                     - Форма входу           ║
║  • POST /auth/login                - Авторизація           ║
║  • GET  /signup                    - Реєстрація            ║
║  • POST /auth/signup               - Створити акаунт       ║
║  • GET  /auth/logout               - Вихід                 ║
║  • GET  /dashboard                 - Dashboard (protected) ║
║  • GET  /profile                   - Профіль (protected)   ║
║                                                            ║
║  🔧 Demos:                                                 ║
║  • GET  /demo/cookies              - Cookies demo          ║
║  • GET  /demo/jwt                  - JWT demo              ║
║                                                            ║
║  👤 Demo User: admin@auth.com / password123                ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;