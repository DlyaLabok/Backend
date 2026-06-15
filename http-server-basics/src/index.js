/**
 * index.js - Головний HTTP сервер
 * Демонструє: http модуль, createServer, Request, Response,
 *              Request.url, setHeader, querystring, POST
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const router = require('./router');
const staticHandler = require('./staticHandler');
const queryParser = require('./queryParser');

// ============================================
// Конфігурація сервера
// ============================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VIEWS_DIR = path.join(__dirname, '..', 'views');
const DATA_DIR = path.join(__dirname, '..', 'data');

// ============================================
// Створення сервера
// ============================================

const server = http.createServer(async (req, res) => {
    // Засікаємо час запиту (для демонстрації)
    const startTime = Date.now();

    try {
        // Парсимо URL
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;
        const method = req.method.toUpperCase();

        console.log(`\n${'─'.repeat(50)}`);
        console.log(`${method} ${pathname}`);

        // Відображаємо query parameters
        if (Object.keys(query).length > 0) {
            console.log(`Query:`, query);
        }

        // ============================================
        // Статичні файли (CSS, JS, images)
        // ============================================
        if (staticHandler.isStatic(pathname)) {
            await staticHandler.serveStatic(req, res, pathname, PUBLIC_DIR);
            logResponse(req, res, startTime);
            return;
        }

        // ============================================
        // Роутинг (динамічні маршрути)
        // ============================================
        const routeResult = router.match(pathname, method);

        if (routeResult) {
            // Роути з параметрами (напр. /user/:id)
            if (routeResult.params) {
                req.params = routeResult.params;
            }

            // Обробляємо POST/PUT/PATCH дані
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                await handleBody(req, res, routeResult.handler, query);
            } else {
                await routeResult.handler(req, res, query);
            }

            logResponse(req, res, startTime);
            return;
        }

        // ============================================
        // 404 - маршрут не знайдено
        // ============================================
        serve404(res);
        logResponse(req, res, startTime);

    } catch (err) {
        console.error('❌ Помилка:', err.message);
        serveError(res, 500, 'Internal Server Error');
        logResponse(req, res, startTime);
    }
});

// ============================================
// Обробка POST/PUT/PATCH body
// ============================================

function handleBody(req, res, handler, query) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                // Парсимо body в залежності від Content-Type
                let parsedBody = {};

                const contentType = req.headers['content-type'] || '';

                if (contentType.includes('application/json')) {
                    parsedBody = JSON.parse(body || '{}');
                } else if (contentType.includes('application/x-www-form-urlencoded')) {
                    parsedBody = queryParser.parse(body);
                } else if (contentType.includes('multipart/form-data')) {
                    // Для Multer потрібно - тут просто показуємо raw
                    parsedBody = { _raw: body.substring(0, 1000) };
                }

                req.body = parsedBody;
                await handler(req, res, query);
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', reject);
    });
}

// ============================================
// Допоміжні функції
// ============================================

function logResponse(req, res, startTime) {
    const duration = Date.now() - startTime;
    const status = res.statusCode || 200;
    console.log(`Status: ${status} | Time: ${duration}ms`);
}

function serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Not Found</title>
            <style>
                body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                .container { text-align: center; }
                h1 { font-size: 72px; color: #e74c3c; margin: 0; }
                p { color: #666; }
                a { color: #3498db; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <p>Сторінку не знайдено</p>
                <a href="/">← На головну</a>
            </div>
        </body>
        </html>
    `);
}

function serveError(res, code, message) {
    res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>${code} - ${message}</h1>`);
}

// ============================================
// Запуск сервера
// ============================================

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          HTTP Server Basics - Node.js Demo                  ║
╠════════════════════════════════════════════════════════════╣
║  Сервер запущено:  http://${HOST}:${PORT}                   ║
║  Режим розробки:    npm run dev (з Nodemon)                 ║
║                                                            ║
║  Доступні маршрути:                                         ║
║  • GET  /              - Головна сторінка                  ║
║  • GET  /about         - Про сайт                          ║
║  • GET  /time          - Поточний час                      ║
║  • GET  /hello?name=X  - Привітання з query param          ║
║  • GET  /api/users     - JSON API список користувачів      ║
║  • POST /api/data      - Отримання даних (POST)            ║
║  • GET  /form          - Форма з GET                       ║
║  • POST /form          - Форма з POST                      ║
║  • GET  /json          - JSON API демо                     ║
║  • POST /json          - Збереження в JSON файл            ║
║                                                            ║
║  Ctrl+C для зупинки                                        ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// ============================================
// process.on() - обробка подій
// ============================================

process.on('SIGINT', () => {
    console.log('\n\n🛑 Сервер зупиняється...');
    server.close(() => {
        console.log('👋 Сервер зупинено.');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('❌ Необроблена помилка:', err.message);
    process.exit(1);
});

module.exports = { server, PORT, HOST };