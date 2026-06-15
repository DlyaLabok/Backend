/**
 * index.js - Головний файл MyStore
 * Демонструє:
 * - Express.js server creation
 * - Multiple templating engines (Pug, EJS, Handlebars)
 * - Middleware (bodyParser, cookie-parser, session)
 * - Static files serving
 * - Routes
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Template engines setup
const pugEngine = require('./config/pug.config');
const ejsEngine = require('./config/ejs.config');
const hbsEngine = require('./config/handlebars.config');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Database setup (Sequelize + MySQL)
// ============================================

const { sequelize, testConnection } = require('./db/sequelize.config');
const { connectMongoDB } = require('./db/mongodb.config');

// ============================================
// View Engines Configuration
// ============================================

// За замовчуванням використовуємо Pug (курс починає з Pug)
const DEFAULT_ENGINE = process.env.VIEW_ENGINE || 'pug';

// Налаштування Pug
app.engine('pug', pugEngine);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views', 'pug'));

// Налаштування EJS
app.engine('ejs', ejsEngine);
app.engine('html', ejsEngine);

// Налаштування Handlebars
app.engine('handlebars', hbsEngine.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '..', 'views', 'handlebars'));

// ============================================
// Middleware
// ============================================

// CORS
app.use(cors());

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (express.static)
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Session store
const sessionStoreOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_store',
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnName: 'session_id',
        dataColumnName: 'expires',
        dataColumnType: 'bigint'
    }
};

const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(session({
    key: 'my_store_session',
    secret: process.env.SESSION_SECRET || 'my-store-secret-key-2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true
    }
}));

// Flash messages middleware
app.use((req, res, next) => {
    res.locals.success = req.flash ? req.flash('success') : [];
    res.locals.error = req.flash ? req.flash('error') : [];
    res.locals.user = req.session.user || null;
    res.locals.engine = DEFAULT_ENGINE;
    next();
});

// ============================================
// Routes
// ============================================

// Перемикач двигуна шаблонів
app.use('/', require('./routes/engine.routes'));

// Головні маршрути
app.use('/', require('./routes/home.routes'));

// Маршрути товарів (CRUD)
app.use('/products', require('./routes/product.routes'));

// Маршрути користувачів (Auth)
app.use('/auth', require('./routes/auth.routes'));

// API endpoints
app.use('/api', require('./routes/api.routes'));

// ============================================
// Error handling
// ============================================

app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Сторінку не знайдено',
        message: `Маршрут ${req.path} не знайдено`
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).render('error', {
        title: 'Помилка',
        message: err.message || 'Щось пішло не так'
    });
});

// ============================================
// Server Start
// ============================================

async function startServer() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    MyStore - E-commerce App                    ║
╠════════════════════════════════════════════════════════════════╣`);

    // Підключення до MySQL (Sequelize)
    try {
        await testConnection();
        console.log('║  ✅ MySQL підключено                                      ║');
    } catch (err) {
        console.log('║  ⚠️  MySQL недоступний (демо-режим)                         ║');
    }

    // Підключення до MongoDB (Mongoose)
    try {
        await connectMongoDB();
        console.log('║  ✅ MongoDB підключено                                     ║');
    } catch (err) {
        console.log('║  ⚠️  MongoDB недоступний (демо-режим)                        ║');
    }

    console.log(`║                                                            ║`);
    console.log(`║  🏪 Демо режим двигуна: ${DEFAULT_ENGINE.toUpperCase().padEnd(15)}                        ║`);
    console.log(`║  🌐 Сервер:          http://localhost:${PORT}                       ║`);
    console.log(`║                                                            ║`);
    console.log(`║  📦 Маршрути:                                               ║`);
    console.log(`║  • GET  /                - Головна сторінка                 ║`);
    console.log(`║  • GET  /products        - Каталог товарів                  ║`);
    console.log(`║  • GET  /products/add    - Додати товар                     ║`);
    console.log(`║  • POST /products        - Зберегти товар                   ║`);
    console.log(`║  • GET  /products/:id     - Редагувати товар                ║`);
    console.log(`║  • GET  /auth/signup      - Реєстрація                      ║`);
    console.log(`║  • GET  /auth/login       - Вхід                            ║`);
    console.log(`║                                                            ║`);
    console.log(`║  🔧 Змінити двигун:                                         ║`);
    console.log(`║  ?engine=pug     - Pug шаблони                             ║`);
    console.log(`║  ?engine=ejs     - EJS шаблони                             ║`);
    console.log(`║  ?engine=hbs     - Handlebars шаблони                      ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝`);

    app.listen(PORT, () => {
        console.log(`\n🚀 Сервер запущено!`);
    });
}

startServer();

module.exports = app;