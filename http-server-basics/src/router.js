/**
 * router.js - Маршрутизатор запитів
 * Демонструє: Request.url, роутинг, URL parameters
 */

const fs = require('fs');
const path = require('path');
const url = require('url');
const DATA_DIR = path.join(__dirname, '..', 'data');
const VIEWS_DIR = path.join(__dirname, '..', 'views');

// ============================================
// Визначення маршрутів
// ============================================

const routes = {
    'GET': {},
    'POST': {},
    'PUT': {},
    'PATCH': {},
    'DELETE': {}
};

// ============================================
// Реєстрація маршрутів
// ============================================

function registerRoute(method, pathPattern, handler) {
    if (!routes[method]) {
        routes[method] = {};
    }
    routes[method][pathPattern] = handler;
    console.log(`  ✓ ${method} ${pathPattern}`);
}

// ============================================
// Головна сторінка
// ============================================
registerRoute('GET', '/', async (req, res) => {
    const htmlPath = path.join(VIEWS_DIR, 'home.html');

    // Якщо файл існує, читаємо його
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } else {
        // Інакше генеруємо динамічно
        const now = new Date().toLocaleString('uk-UA');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HTTP Server Basics</title>
    <link rel="stylesheet" href="/public/style.css">
</head>
<body>
    <div class="container">
        <h1>🌐 HTTP Server Basics</h1>
        <p>Демонстрація Node.js http модуля</p>
        <p class="time">Поточний час: <strong>${now}</strong></p>

        <div class="nav">
            <a href="/">Головна</a>
            <a href="/about">Про нас</a>
            <a href="/time">Час</a>
            <a href="/form">Форма</a>
            <a href="/api/users">API</a>
        </div>

        <div class="info">
            <h3>📚 Демонстрація:</h3>
            <ul>
                <li><code>GET /hello?name=Вася</code> - привітання</li>
                <li><code>GET /user/123</code> - URL параметри</li>
                <li><code>POST /form</code> - обробка POST</li>
                <li><code>GET /json</code> - JSON API</li>
            </ul>
        </div>
    </div>
</body>
</html>
        `);
    }
});

// ============================================
// Про сайт
// ============================================
registerRoute('GET', '/about', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Про нас</title>
    <link rel="stylesheet" href="/public/style.css">
</head>
<body>
    <div class="container">
        <h1>📖 Про цей проект</h1>
        <p>HTTP Server Basics - навчальний проект для демонстрації:</p>
        <ul>
            <li>Модуля <code>http</code> в Node.js</li>
            <li>Створення веб-сервера</li>
            <li>Роутингу запитів</li>
            <li>Обробки GET та POST</li>
            <li>Роботи з querystring</li>
        </ul>
        <a href="/" class="btn">← На головну</a>
    </div>
</body>
</html>
    `);
});

// ============================================
// Поточний час (JSON)
// ============================================
registerRoute('GET', '/time', (req, res) => {
    const now = new Date();
    const timeData = {
        current: now.toLocaleString('uk-UA'),
        iso: now.toISOString(),
        unix: now.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(timeData, null, 2));
});

// ============================================
// Привітання з query параметром
// ============================================
registerRoute('GET', '/hello', (req, res, query) => {
    const name = query.name || 'Гість';

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Привітання</title>
    <link rel="stylesheet" href="/public/style.css">
</head>
<body>
    <div class="container">
        <h1>👋 Привіт, ${escapeHtml(name)}!</h1>
        <p>Ласкаво просимо на наш сервер!</p>
        <a href="/hello?name=Олександр">Спробувати з іменем</a> |
        <a href="/">На головну</a>
    </div>
</body>
</html>
    `);
});

// ============================================
// URL параметри (наприклад /user/:id)
// ============================================
registerRoute('GET', '/user/:id', (req, res) => {
    const userId = req.params.id;

    // Демо-дані користувача
    const users = {
        '1': { name: 'Олександр', role: 'Адмін' },
        '2': { name: 'Марія', role: 'Користувач' },
        '3': { name: 'Іван', role: 'Модератор' }
    };

    const user = users[userId];

    if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ id: userId, ...user }, null, 2));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Користувача не знайдено' }));
    }
});

// ============================================
// Форма (GET та POST)
// ============================================
registerRoute('GET', '/form', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Форма</title>
    <link rel="stylesheet" href="/public/style.css">
</head>
<body>
    <div class="container">
        <h1>📝 Форма</h1>

        <div class="form-section">
            <h3>GET форма</h3>
            <form action="/form" method="GET">
                <input type="text" name="search" placeholder="Пошук...">
                <button type="submit">Шукати</button>
            </form>
        </div>

        <div class="form-section">
            <h3>POST форма</h3>
            <form action="/form" method="POST">
                <input type="text" name="username" placeholder="Ім'я користувача" required>
                <input type="email" name="email" placeholder="Email" required>
                <textarea name="message" placeholder="Повідомлення"></textarea>
                <button type="submit">Надіслати</button>
            </form>
        </div>

        <a href="/">← На головну</a>
    </div>
</body>
</html>
    `);
});

registerRoute('POST', '/form', (req, res, query) => {
    const { username, email, message } = req.body;

    console.log('📨 POST дані форми:', req.body);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Результат</title>
    <link rel="stylesheet" href="/public/style.css">
</head>
<body>
    <div class="container">
        <h1>✅ Дані отримано!</h1>
        <div class="result">
            <p><strong>Ім'я:</strong> ${escapeHtml(username || 'N/A')}</p>
            <p><strong>Email:</strong> ${escapeHtml(email || 'N/A')}</p>
            <p><strong>Повідомлення:</strong> ${escapeHtml(message || 'N/A')}</p>
        </div>
        <pre>${JSON.stringify(req.body, null, 2)}</pre>
        <a href="/form">← Назад до форми</a> |
        <a href="/">Головна</a>
    </div>
</body>
</html>
    `);
});

// GET форма результат
registerRoute('GET', '/form', (req, res, query) => {
    if (query.search) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Результат пошуку</title>
    <link rel="stylesheet" href="/public/style.css">
</head>
<body>
    <div class="container">
        <h1>🔍 Результат пошуку</h1>
        <p>Ви шукали: <strong>${escapeHtml(query.search)}</strong></p>
        <a href="/form">← Назад до форми</a>
    </div>
</body>
</html>
        `);
    }
});

// ============================================
// JSON API
// ============================================
registerRoute('GET', '/json', (req, res) => {
    const data = {
        message: 'Ласкаво просимо до JSON API!',
        endpoints: [
            'GET  /json          - цей endpoint',
            'POST /json          - зберегти дані',
            'GET  /api/users     - список користувачів',
            'POST /api/data      - отримати POST дані'
        ],
        timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
});

registerRoute('POST', '/json', (req, res) => {
    console.log('📦 POST /json:', req.body);

    // Зберігаємо дані у файл (демо)
    const dataFile = path.join(DATA_DIR, 'received.json');
    fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2));

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
        success: true,
        message: 'Дані збережено!',
        saved: req.body
    }, null, 2));
});

// ============================================
// API Endpoints
// ============================================

// Список користувачів
registerRoute('GET', '/api/users', (req, res) => {
    const users = [
        { id: 1, name: 'Олександр', email: 'alex@example.com', role: 'admin' },
        { id: 2, name: 'Марія', email: 'maria@example.com', role: 'user' },
        { id: 3, name: 'Іван', email: 'ivan@example.com', role: 'user' },
        { id: 4, name: 'Анна', email: 'anna@example.com', role: 'moderator' }
    ];

    // Фільтрація за роллю
    const role = url.parse(req.url, true).query.role;
    const filteredUsers = role ? users.filter(u => u.role === role) : users;

    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
        count: filteredUsers.length,
        users: filteredUsers
    }, null, 2));
});

// Отримання POST даних
registerRoute('POST', '/api/data', (req, res) => {
    console.log('📨 API POST дані:', req.body);

    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
        received: true,
        data: req.body
    }, null, 2));
});

// PUT - оновлення
registerRoute('PUT', '/api/users/:id', (req, res) => {
    const id = req.params.id;
    console.log(`📝 PUT /api/users/${id}:`, req.body);

    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify({
        success: true,
        message: `Користувача ${id} оновлено`,
        data: req.body
    }, null, 2));
});

// DELETE - видалення
registerRoute('DELETE', '/api/users/:id', (req, res) => {
    const id = req.params.id;
    console.log(`🗑️  DELETE /api/users/${id}`);

    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify({
        success: true,
        message: `Користувача ${id} видалено`
    }, null, 2));
});

// ============================================
// Матчинг маршрутів
// ============================================

function match(reqPath, method) {
    const methodRoutes = routes[method];

    if (!methodRoutes) {
        return null;
    }

    // 1. Точний матчинг
    if (methodRoutes[reqPath]) {
        return { handler: methodRoutes[reqPath], params: {} };
    }

    // 2. Паттерн з параметрами (наприклад /user/:id)
    for (const pattern of Object.keys(methodRoutes)) {
        const params = matchParams(pattern, reqPath);
        if (params !== null) {
            return { handler: methodRoutes[pattern], params };
        }
    }

    return null;
}

function matchParams(pattern, path) {
    // Перетворюємо /user/:id в регулярку
    const paramNames = [];
    const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
        });
        return params;
    }

    return null;
}

// ============================================
// Допоміжні функції
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// Експорт
// ============================================

module.exports = {
    registerRoute,
    match,
    routes
};