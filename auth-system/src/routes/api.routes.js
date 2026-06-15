/**
 * api.routes.js - Auth API Routes
 * Демонструє: JWT API endpoints, Authorization header
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth, verifyToken, generateToken, rateLimit } = require('../middleware/auth.middleware');

// Rate limiting
const apiRateLimit = rateLimit({ max: 20, windowMs: 60 * 1000 });

// ============================================
// POST /api/auth/login - API Login
// ============================================
router.post('/login', apiRateLimit, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email та пароль обов\'язкові' });
    }

    try {
        const authController = require('../controllers/auth.controller');
        await authController.apiLogin(req, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// POST /api/auth/signup - API Signup
// ============================================
router.post('/signup', apiRateLimit, async (req, res) => {
    try {
        await authController.apiSignup(req, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// GET /api/auth/me - Get current user
// ============================================
router.get('/me', requireAuth, (req, res) => {
    res.json({
        success: true,
        user: req.user || req.session.user
    });
});

// ============================================
// GET /api/auth/verify-token - Verify JWT
// ============================================
router.get('/verify-token', (req, res) => {
    const token = req.query.token || req.cookies?.token;

    if (!token) {
        return res.status(400).json({ error: 'Токен не надано' });
    }

    const decoded = verifyToken(token);

    if (decoded) {
        res.json({
            valid: true,
            payload: decoded,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
    } else {
        res.status(401).json({ valid: false, error: 'Токен невалідний або прострочений' });
    }
});

// ============================================
// POST /api/auth/refresh - Refresh token
// ============================================
router.post('/refresh', requireAuth, (req, res) => {
    const user = req.user || req.session.user;
    const newToken = generateToken(user);

    res.json({
        success: true,
        token: newToken
    });
});

// ============================================
// POST /api/auth/logout - API Logout
// ============================================
router.post('/logout', (req, res) => {
    // Очищуємо session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка виходу' });
        }

        // Очищуємо cookie
        res.clearCookie('auth_session');
        res.clearCookie('token');

        res.json({ success: true, message: 'Вихід успішний' });
    });
});

module.exports = router;