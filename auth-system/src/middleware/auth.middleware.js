/**
 * auth.middleware.js - Authentication Middleware
 * Демонструє: JWT, Session validation, Role checking
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'auth-system-jwt-secret-2026';

/**
 * JWT: Generate Token
 * Створення JWT токена для авторизації
 */
function generateToken(user, expiresIn = '24h') {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn }
    );
}

/**
 * JWT: Verify Token
 * Перевірка та розшифрування JWT токена
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Session Auth Middleware
 * Перевіряє чи користувач авторизований через сесію
 */
function requireAuth(req, res, next) {
    // 1. Перевіряємо сесію
    if (req.session && req.session.user) {
        return next();
    }

    // 2. Перевіряємо JWT token в cookie
    const token = req.cookies?.token;
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            // Відновлюємо сесію з JWT
            req.session.user = decoded;
            return next();
        }
    }

    // 3. Перевіряємо Authorization header (API)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
            return next();
        }
    }

    // Не авторизований
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Потрібна авторизація' });
    }

    res.redirect('/login');
}

/**
 * Admin Role Middleware
 * Перевіряє чи користувач має роль admin
 */
function requireAdmin(req, res, next) {
    // Спочатку requireAuth
    if (!req.session?.user && !req.cookies?.token) {
        return requireAuth(req, res, next);
    }

    const user = req.session?.user;

    // Розшифровуємо JWT якщо сесії немає
    if (!user && req.cookies?.token) {
        const decoded = verifyToken(req.cookies.token);
        if (decoded && decoded.role === 'admin') {
            return next();
        }
    }

    if (user && user.role === 'admin') {
        return next();
    }

    // Заборонено
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Forbidden', message: 'Доступ заборонено' });
    }

    res.status(403).render('403', {
        title: '403 - Доступ заборонено',
        message: 'Потрібен доступ адміністратора'
    });
}

/**
 * Optional Auth Middleware
 * Дозволяє як авторизованим так і анонімним користувачам
 */
function optionalAuth(req, res, next) {
    if (req.session?.user) {
        return next();
    }

    const token = req.cookies?.token;
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.session.user = decoded;
        }
    }

    next();
}

/**
 * CSRF Protection Middleware
 * Захист від Cross-Site Request Forgery
 */
function csrfProtection(req, res, next) {
    // Перевіряємо Referer заголовок
    const referer = req.headers.referer || req.headers.origin;

    if (process.env.NODE_ENV === 'production') {
        if (!referer || !referer.includes(req.hostname)) {
            return res.status(403).json({ error: 'CSRF', message: 'Invalid referer' });
        }
    }

    next();
}

/**
 * Rate Limiting Middleware
 * Захист від brute-force атак
 */
const rateLimitStore = new Map();

function rateLimit(options = {}) {
    const max = options.max || 5;
    const windowMs = options.windowMs || 60 * 1000; // 1 хвилина
    const key = options.key || ((req) => req.ip);

    return (req, res, next) => {
        const identifier = typeof key === 'function' ? key(req) : req[key];
        const now = Date.now();

        if (!rateLimitStore.has(identifier)) {
            rateLimitStore.set(identifier, []);
        }

        const requests = rateLimitStore.get(identifier);
        const validRequests = requests.filter(time => now - time < windowMs);

        if (validRequests.length >= max) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `Занадто багато запитів. Спробуйте через ${Math.ceil(windowMs / 1000)} секунд.`
            });
        }

        validRequests.push(now);
        rateLimitStore.set(identifier, validRequests);

        // Очищуємо старе
        setTimeout(() => {
            rateLimitStore.delete(identifier);
        }, windowMs);

        next();
    };
}

module.exports = {
    generateToken,
    verifyToken,
    requireAuth,
    requireAdmin,
    optionalAuth,
    csrfProtection,
    rateLimit,
    JWT_SECRET
};