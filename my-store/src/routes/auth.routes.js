/**
 * auth.routes.js - Автентифікація
 * Демонструє: cookie, session, bcrypt, JWT
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/sequelize.config');
const { UserMongo } = require('../db/mongodb.config');
const { requireAuth } = require('../middleware/auth');

// ============================================
// GET /auth/signup - форма реєстрації
// ============================================
router.get('/signup', (req, res) => {
    res.render('auth/signup', {
        title: 'Реєстрація',
        error: null
    });
});

// ============================================
// POST /auth/signup - створити акаунт
// ============================================
router.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Валідація
        if (!name || !email || !password) {
            return res.render('auth/signup', {
                title: 'Реєстрація',
                error: 'Всі поля обов\'язкові'
            });
        }

        if (password !== confirmPassword) {
            return res.render('auth/signup', {
                title: 'Реєстрація',
                error: 'Паролі не співпадають'
            });
        }

        if (password.length < 6) {
            return res.render('auth/signup', {
                title: 'Реєстрація',
                error: 'Пароль має бути мінімум 6 символів'
            });
        }

        // Хешування пароля (BCrypt демо)
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 Пароль захешовано через BCrypt');

        // Зберігаємо в MySQL
        try {
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'user'
            });

            console.log('✅ Користувача створено:', user.email);
        } catch (err) {
            // Демо-режим
            console.log('⚠️  Демо-режим реєстрації');
        }

        req.flash = req.flash || (() => {});
        if (req.flash) req.flash('success', 'Обліковий запис створено!');
        res.redirect('/auth/login');

    } catch (err) {
        res.render('auth/signup', {
            title: 'Реєстрація',
            error: 'Помилка реєстрації'
        });
    }
});

// ============================================
// GET /auth/login - форма входу
// ============================================
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Вхід',
        error: null
    });
});

// ============================================
// POST /auth/login - автентифікація
// ============================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.render('auth/login', {
                title: 'Вхід',
                error: 'Введіть email та пароль'
            });
        }

        // Шукаємо користувача
        let user = null;
        try {
            user = await User.findOne({ where: { email } });
        } catch (err) {
            // Демо-режим
        }

        // Демо-користувач
        if (!user) {
            if (email === 'admin@store.com' && password === 'admin123') {
                req.session.user = {
                    id: 1,
                    name: 'Адмін',
                    email: 'admin@store.com',
                    role: 'admin'
                };

                // JWT демо
                const token = jwt.sign(
                    { id: 1, email, role: 'admin' },
                    process.env.JWT_SECRET || 'my-store-jwt-secret',
                    { expiresIn: '24h' }
                );
                console.log('🔑 JWT токен згенеровано');

                return res.redirect('/');
            }

            return res.render('auth/login', {
                title: 'Вхід',
                error: 'Неправильний email або пароль'
            });
        }

        // Перевірка пароля (BCrypt демо)
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.render('auth/login', {
                title: 'Вхід',
                error: 'Неправильний email або пароль'
            });
        }

        // Зберігаємо в сесію
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/');

    } catch (err) {
        res.render('auth/login', {
            title: 'Вхід',
            error: 'Помилка входу'
        });
    }
});

// ============================================
// GET /auth/logout - вихід
// ============================================
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// ============================================
// JWT Middleware демо
// ============================================
router.get('/profile', requireAuth, (req, res) => {
    res.render('auth/profile', {
        title: 'Профіль',
        user: req.session.user
    });
});

module.exports = router;