/**
 * engine.routes.js - Перемикач двигунів шаблонів
 * Демонструє: динамічний вибір template engine
 */

const express = require('express');
const router = express.Router();

router.get('/switch-engine', (req, res) => {
    const engine = req.query.engine || 'pug';
    const redirect = req.query.redirect || '/';

    // Встановлюємо cookie з вибором двигуна
    res.cookie('template_engine', engine, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: false
    });

    // Перенаправляємо назад
    const url = new URL(redirect, `http://${req.headers.host}`);
    url.searchParams.set('engine', engine);

    res.redirect(url.pathname + url.search);
});

module.exports = router;