/**
 * product.routes.js - CRUD маршрути для товарів
 * Демонструє: express.Router(), middleware, res.render, res.sendFile
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const productController = require('../controllers/product.controller');
const { requireAuth } = require('../middleware/auth');

// Multer налаштування для завантаження файлів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Тільки зображення дозволені!'));
    }
});

// ============================================
// Routes
// ============================================

// GET /products - список товарів
router.get('/', productController.getAll);

// GET /products/add - форма додавання
router.get('/add', requireAuth, productController.addForm);

// POST /products/add - зберегти новий товар
router.post('/add', requireAuth, upload.single('image'), productController.create);

// GET /products/:id - редагування товару
router.get('/:id', productController.editForm);

// POST /products/:id - оновити товар
router.post('/:id', requireAuth, upload.single('image'), productController.update);

// GET /products/delete/:id - видалити товар
router.get('/delete/:id', requireAuth, productController.delete);

// POST /products/delete/:id - видалити товар (POST form)
router.post('/delete/:id', requireAuth, productController.delete);

module.exports = router;