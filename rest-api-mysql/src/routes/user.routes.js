/**
 * user.routes.js - Маршрути для користувачів
 * Демонструє: Express Router, CRUD routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET    /api/users         - всі користувачі
// GET    /api/users/:id     - один користувач
// POST   /api/users         - створити
// PUT    /api/users/:id     - оновити
// DELETE /api/users/:id     - видалити

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;