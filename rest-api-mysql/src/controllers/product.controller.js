/**
 * product.controller.js - CRUD операції для товарів
 */

const { pool } = require('../config/db.config');

// Демо-дані
const demoProducts = [
    { id: 1, name: 'Ноутбук', price: 25000, category: 'electronics', stock: 10 },
    { id: 2, name: 'Клавіатура', price: 1500, category: 'electronics', stock: 50 },
    { id: 3, name: 'Миша', price: 800, category: 'electronics', stock: 100 }
];
let nextProductId = 4;

// ============================================
// GET /api/products - всі товари
// ============================================

async function getAll(req, res) {
    const { category, minPrice, maxPrice, sort } = req.query;

    try {
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (minPrice) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }

        if (sort) {
            const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
            const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortField} ${sortOrder}`;
        } else {
            query += ' ORDER BY id DESC';
        }

        const [rows] = await pool.query(query, params);

        res.status(200).json({
            count: rows.length,
            products: rows
        });
    } catch (err) {
        // Демо-режим
        console.log('⚠️  Використовую демо-дані (MySQL недоступний)');
        let products = [...demoProducts];

        if (category) {
            products = products.filter(p => p.category === category);
        }
        if (minPrice) {
            products = products.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => p.price <= parseFloat(maxPrice));
        }

        res.status(200).json({
            count: products.length,
            products,
            _demo: true
        });
    }
}

// ============================================
// GET /api/products/:id
// ============================================

async function getById(req, res) {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Товар з ID ${id} не знайдено`
            });
        }

        res.status(200).json({ product: rows[0] });
    } catch (err) {
        // Демо-режим
        const product = demoProducts.find(p => p.id === parseInt(id));
        if (!product) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Товар з ID ${id} не знайдено`
            });
        }
        res.status(200).json({ product });
    }
}

// ============================================
// POST /api/products - створити товар
// ============================================

async function create(req, res) {
    const { name, price, category, description, stock } = req.body;

    // Валідація
    if (!name || price === undefined) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Поля name та price обов\'язкові'
        });
    }

    if (price < 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Ціна не може бути від\'ємною'
        });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO products (name, price, category, description, stock) VALUES (?, ?, ?, ?, ?)',
            [name, price, category || null, description || null, stock || 0]
        );

        res.status(201).json({
            message: 'Товар створено',
            product: {
                id: result.insertId,
                name,
                price,
                category,
                description,
                stock: stock || 0
            }
        });
    } catch (err) {
        // Демо-режим
        if (err.code === 'ECONNREFUSED' || err.code === 'ER_NO_SUCH_TABLE') {
            const newProduct = {
                id: nextProductId++,
                name,
                price,
                category,
                description,
                stock: stock || 0
            };
            demoProducts.push(newProduct);
            return res.status(201).json({
                message: 'Товар створено (демо)',
                product: newProduct,
                _demo: true
            });
        }
        throw err;
    }
}

// ============================================
// PUT /api/products/:id
// ============================================

async function update(req, res) {
    const { id } = req.params;
    const { name, price, category, description, stock } = req.body;

    try {
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            values.push(price);
        }
        if (category !== undefined) {
            updates.push('category = ?');
            values.push(category);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (stock !== undefined) {
            updates.push('stock = ?');
            values.push(stock);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Немає даних для оновлення'
            });
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Товар з ID ${id} не знайдено`
            });
        }

        const [updated] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Товар оновлено',
            product: updated[0]
        });
    } catch (err) {
        // Демо-режим
        if (err.code === 'ECONNREFUSED' || err.code === 'ER_NO_SUCH_TABLE') {
            const index = demoProducts.findIndex(p => p.id === parseInt(id));
            if (index === -1) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: `Товар з ID ${id} не знайдено`
                });
            }

            if (name) demoProducts[index].name = name;
            if (price !== undefined) demoProducts[index].price = price;
            if (category !== undefined) demoProducts[index].category = category;
            if (description !== undefined) demoProducts[index].description = description;
            if (stock !== undefined) demoProducts[index].stock = stock;

            return res.status(200).json({
                message: 'Товар оновлено (демо)',
                product: demoProducts[index],
                _demo: true
            });
        }
        throw err;
    }
}

// ============================================
// DELETE /api/products/:id
// ============================================

async function remove(req, res) {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Товар з ID ${id} не знайдено`
            });
        }

        res.status(200).json({
            message: 'Товар видалено',
            deletedId: id
        });
    } catch (err) {
        // Демо-режим
        if (err.code === 'ECONNREFUSED' || err.code === 'ER_NO_SUCH_TABLE') {
            const index = demoProducts.findIndex(p => p.id === parseInt(id));
            if (index === -1) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: `Товар з ID ${id} не знайдено`
                });
            }

            demoProducts.splice(index, 1);
            return res.status(200).json({
                message: 'Товар видалено (демо)',
                deletedId: id,
                _demo: true
            });
        }
        throw err;
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: remove
};