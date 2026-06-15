/**
 * auth.middleware.js - Middleware для автентифікації
 * Демонструє: middleware, session, JWT
 */

/**
 * Захист маршрутів - потрібна авторизація
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }

    // Перевіряємо JWT токен
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'my-store-jwt-secret'
            );
            req.session.user = decoded;
            return next();
        } catch (err) {
            // JWT невалідний
        }
    }

    // Не авторизований
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Потрібна авторизація' });
    }

    res.redirect('/auth/login');
}

/**
 * Перевірка ролі адміна
 */
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('403', {
        title: '403 - Доступ заборонено',
        message: 'Потрібен доступ адміністратора'
    });
}

module.exports = {
    requireAuth,
    requireAdmin
};