/**
 * index.js - Головний файл Express сервера
 * Демонструє: Express.js, middleware, CORS, JSON parsing
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db.config');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS - для доступу з інших доменів
app.use(cors());

// JSON парсинг
app.use(express.json());

// URL-encoded парсинг (для форм)
app.use(express.urlencoded({ extended: true }));

// Логування запитів
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
    });
    next();
});

// ============================================
// Routes
// ============================================

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Головна
app.get('/', (req, res) => {
    res.json({
        message: 'REST API з MySQL',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            products: '/api/products',
            health: '/health'
        }
    });
});

// ============================================
// Error handling
// ============================================

// 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Маршрут ${req.method} ${req.path} не знайдено`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'Щось пішло не так'
    });
});

// ============================================
// Запуск сервера
// ============================================

async function startServer() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           REST API з MySQL - Node.js + Express              ║
╠════════════════════════════════════════════════════════════╣`);

    // Тестуємо підключення до MySQL
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.log('║  ⚠️  MySQL недоступний - API буде працювати в демо-режимі');
    }

    console.log(`║  Сервер:        http://localhost:${PORT}                    `);
    console.log(`║  Режим:         ${process.env.NODE_ENV || 'development'}                              `);
    console.log(`║                                                            ║`);
    console.log(`║  Endpoints:                                               ║`);
    console.log(`║  • GET    /api/users         - Список користувачів        ║`);
    console.log(`║  • GET    /api/users/:id      - Один користувач           ║`);
    console.log(`║  • POST   /api/users          - Створити                  ║`);
    console.log(`║  • PUT    /api/users/:id      - Оновити                   ║`);
    console.log(`║  • DELETE /api/users/:id      - Видалити                  ║`);
    console.log(`║  • GET    /api/products       - Список товарів            ║`);
    console.log(`║  • POST   /api/products       - Створити товар             ║`);
    console.log(`║                                                            ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);

    app.listen(PORT, () => {
        console.log(`\n🚀 Сервер запущено! Відкрийте http://localhost:${PORT}`);
    });
}

startServer();

module.exports = app;