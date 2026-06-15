/**
 * user.controller.js - CRUD операції для користувачів
 * Демонструє: pool.query(), pool.execute(), статус коди
 */

const { pool } = require('../config/db.config');

// ============================================
// Демо-дані (коли MySQL недоступний)
// ============================================

const demoUsers = [
    { id: 1, name: 'Олександр', email: 'alex@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Марія', email: 'maria@example.com', role: 'user', status: 'active' },
    { id: 3, name: 'Іван', email: 'ivan@example.com', role: 'user', status: 'inactive' }
];
let nextId = 4;
let useDemo = true;

// ============================================
// GET /api/users - всі користувачі
// ============================================

async function getAll(req, res) {
    try {
        // Спробуємо спочатку MySQL
        const [rows] = await pool.query(
            'SELECT * FROM users ORDER BY id DESC'
        );

        res.status(200).json({
            count: rows.length,
            users: rows
        });
    } catch (err) {
        // Якщо MySQL недоступний - повертаємо демо-дані
        console.log('⚠️  Використовую демо-дані (MySQL недоступний)');
        res.status(200).json({
            count: demoUsers.length,
            users: demoUsers,
            _demo: true
        });
    }
}

// ============================================
// GET /api/users/:id - один користувач
// ============================================

async function getById(req, res) {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Користувача з ID ${id} не знайдено`
            });
        }

        res.status(200).json({ user: rows[0] });
    } catch (err) {
        // Демо-режим
        const user = demoUsers.find(u => u.id === parseInt(id));
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Користувача з ID ${id} не знайдено`
            });
        }
        res.status(200).json({ user });
    }
}

// ============================================
// POST /api/users - створити користувача
// ============================================

async function create(req, res) {
    const { name, email, role, status } = req.body;

    // Валідація
    if (!name || !email) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Поля name та email обов\'язкові'
        });
    }

    try {
        // execute() - prepared statement (краще для INSERT)
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)',
            [name, email, role || 'user', status || 'active']
        );

        res.status(201).json({
            message: 'Користувача створено',
            user: {
                id: result.insertId,
                name,
                email,
                role: role || 'user',
                status: status || 'active'
            }
        });
    } catch (err) {
        // Демо-режим
        if (err.code === 'ECONNREFUSED' || err.code === 'ER_NO_SUCH_TABLE') {
            const newUser = {
                id: nextId++,
                name,
                email,
                role: role || 'user',
                status: status || 'active'
            };
            demoUsers.push(newUser);
            return res.status(201).json({
                message: 'Користувача створено (демо)',
                user: newUser,
                _demo: true
            });
        }

        // Перевірка на дублікат email
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Користувач з таким email вже існує'
            });
        }

        throw err;
    }
}

// ============================================
// PUT /api/users/:id - оновити користувача
// ============================================

async function update(req, res) {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    try {
        // Перевіряємо чи існує
        const [existing] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Користувача з ID ${id} не знайдено`
            });
        }

        // Будуємо запит динамічно
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (role !== undefined) {
            updates.push('role = ?');
            values.push(role);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Немає даних для оновлення'
            });
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Отримуємо оновленого користувача
        const [updated] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Користувача оновлено',
            user: updated[0]
        });
    } catch (err) {
        // Демо-режим
        if (err.code === 'ECONNREFUSED' || err.code === 'ER_NO_SUCH_TABLE') {
            const index = demoUsers.findIndex(u => u.id === parseInt(id));
            if (index === -1) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: `Користувача з ID ${id} не знайдено`
                });
            }

            if (name) demoUsers[index].name = name;
            if (email) demoUsers[index].email = email;
            if (role) demoUsers[index].role = role;
            if (status) demoUsers[index].status = status;

            return res.status(200).json({
                message: 'Користувача оновлено (демо)',
                user: demoUsers[index],
                _demo: true
            });
        }
        throw err;
    }
}

// ============================================
// DELETE /api/users/:id - видалити користувача
// ============================================

async function remove(req, res) {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Користувача з ID ${id} не знайдено`
            });
        }

        res.status(200).json({
            message: 'Користувача видалено',
            deletedId: id
        });
    } catch (err) {
        // Демо-режим
        if (err.code === 'ECONNREFUSED' || err.code === 'ER_NO_SUCH_TABLE') {
            const index = demoUsers.findIndex(u => u.id === parseInt(id));
            if (index === -1) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: `Користувача з ID ${id} не знайдено`
                });
            }

            demoUsers.splice(index, 1);
            return res.status(200).json({
                message: 'Користувача видалено (демо)',
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