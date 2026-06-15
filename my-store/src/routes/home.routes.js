/**
 * home.routes.js - Головна сторінка
 */

const express = require('express');
const router = express.Router();
const { Product } = require('../db/sequelize.config');
const { ProductMongo } = require('../db/mongodb.config');

// GET / - головна сторінка
router.get('/', async (req, res) => {
    const engine = req.query.engine || 'pug';
    const db = req.query.db || 'demo';

    try {
        let products = [];

        if (db === 'mysql' && req.dbConnected) {
            products = await Product.findAll({
                where: { active: true },
                order: [['createdAt', 'DESC']],
                limit: 8
            });
        } else if (db === 'mongo' && req.mongoConnected) {
            products = await ProductMongo.find({ active: true })
                .sort({ createdAt: -1 })
                .limit(8);
        } else {
            // Демо-дані
            products = getDemoProducts().slice(0, 8);
        }

        // Для Pug/EJS - рендеримо з engine параметром
        if (engine === 'pug') {
            return res.render('home', {
                title: 'MyStore - Головна',
                products,
                categories: getCategories(),
                currentEngine: engine
            });
        } else if (engine === 'ejs') {
            return res.render('../ejsl/home', {
                title: 'MyStore - Головна',
                products,
                categories: getCategories(),
                currentEngine: engine
            });
        } else if (engine === 'hbs') {
            return res.render('home', {
                title: 'MyStore - Головна',
                products,
                categories: getCategories(),
                currentEngine: engine
            });
        }

        res.render('home', {
            title: 'MyStore - Головна',
            products,
            categories: getCategories()
        });
    } catch (err) {
        console.error('Home page error:', err);
        res.render('home', {
            title: 'MyStore - Головна',
            products: getDemoProducts().slice(0, 8),
            categories: getCategories()
        });
    }
});

// GET /about - про сайт
router.get('/about', (req, res) => {
    const engine = req.query.engine || 'pug';
    res.render('about', {
        title: 'Про MyStore',
        engine
    });
});

// ============================================
// Демо-дані
// ============================================

function getDemoProducts() {
    return [
        { id: 1, name: 'Ноутбук ASUS ROG', price: 45999, category: 'electronics', image: null, description: 'Ігровий ноутбук', stock: 15 },
        { id: 2, name: 'Клавіатура Logitech', price: 2499, category: 'electronics', image: null, description: 'Бездротова клавіатура', stock: 45 },
        { id: 3, name: 'Миша Razer', price: 1899, category: 'electronics', image: null, description: 'Ігрова миша', stock: 80 },
        { id: 4, name: 'Монітор Samsung 27"', price: 12999, category: 'electronics', image: null, description: '4K монітор', stock: 20 },
        { id: 5, name: 'Навушники Sony', price: 11999, category: 'electronics', image: null, description: 'ANC навушники', stock: 30 },
        { id: 6, name: 'Смартфон iPhone 15', price: 54999, category: 'electronics', image: null, description: 'Apple iPhone', stock: 25 },
        { id: 7, name: 'Планшет iPad', price: 24999, category: 'electronics', image: null, description: 'Apple iPad', stock: 40 },
        { id: 8, name: 'Смарт-годинник', price: 8999, category: 'electronics', image: null, description: 'Smart Watch', stock: 60 }
    ];
}

function getCategories() {
    return [
        { name: 'electronics', label: 'Електроніка', count: 8 },
        { name: 'clothing', label: 'Одяг', count: 0 },
        { name: 'books', label: 'Книги', count: 0 },
        { name: 'home', label: 'Для дому', count: 0 }
    ];
}

module.exports = router;