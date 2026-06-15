/**
 * api.routes.js - REST API endpoints
 */

const express = require('express');
const router = express.Router();
const { Product } = require('../db/sequelize.config');
const { ProductMongo } = require('../db/mongodb.config');

// ============================================
// Products API
// ============================================

// GET /api/products
router.get('/products', async (req, res) => {
    try {
        let products = await Product.findAll({
            where: { active: true },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, count: products.length, products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Не знайдено' });
        }
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/products
router.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/products/:id
router.put('/products/:id', async (req, res) => {
    try {
        const [updated] = await Product.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Не знайдено' });
        }
        const product = await Product.findByPk(req.params.id);
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/products/:id
router.delete('/products/:id', async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Не знайдено' });
        }
        res.json({ success: true, message: 'Видалено' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;