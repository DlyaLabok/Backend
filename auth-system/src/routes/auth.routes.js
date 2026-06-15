/**
 * auth.routes.js - Authentication Routes
 * Демонструє: POST /login, POST /signup, GET /logout
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth, rateLimit } = require('../middleware/auth.middleware');

// Rate limiting для login/signup
const authRateLimit = rateLimit({ max: 10, windowMs: 60 * 1000 });

// ============================================
// GET /login - форма входу
// ============================================
router.get('/login', (req, res) => {
    // Якщо вже авторизований - на dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Вхід', error: null });
});

// ============================================
// POST /login - авторизація
// ============================================
router.post('/login', authRateLimit, authController.login);

// ============================================
// GET /signup - форма реєстрації
// ============================================
router.get('/signup', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('signup', { title: 'Реєстрація', error: null });
});

// ============================================
// POST /signup - створення акаунту
// ============================================
router.post('/signup', authRateLimit, authController.signup);

// ============================================
// GET /logout - вихід
// ============================================
router.get('/logout', authController.logout);

// ============================================
// GET /profile - профіль користувача
// ============================================
router.get('/profile', requireAuth, authController.profile);

// ============================================
// POST /profile - оновлення профілю
// ============================================
router.post('/profile', requireAuth, authController.updateProfile);

module.exports = router;