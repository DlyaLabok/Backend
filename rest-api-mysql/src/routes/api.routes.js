/**
 * api.routes.js - Загальні API endpoints
 */

const express = require('express');
const router = express.Router();
const { getPoolStatus, demoQuery, demoExecute } = require('../config/db.config');

// Статистика пулу
router.get('/status', (req, res) => {
    res.json({
        pool: getPoolStatus(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Демо запитів (для навчання)
router.get('/demo-query', async (req, res) => {
    try {
        await demoQuery();
        res.json({ message: 'Дивіться консоль для результатів демо' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/demo-execute', async (req, res) => {
    try {
        await demoExecute();
        res.json({ message: 'Дивіться консоль для результатів демо' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;