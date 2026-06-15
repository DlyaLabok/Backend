/**
 * product.controller.js - CRUD для товарів
 * Демонструє: Sequelize CRUD, Mongoose CRUD, демо-дані
 */

const { Product } = require('../db/sequelize.config');
const { ProductMongo } = require('../db/mongodb.config');

// Демо-товари
const demoProducts = [
    { id: 1, name: 'Ноутбук ASUS ROG', price: 45999, category: 'electronics', description: 'Ігровий ноутбук з RTX 4060', stock: 15, image: null },
    { id: 2, name: 'Клавіатура Logitech MX', price: 2499, category: 'electronics', description: 'Бездротова механічна', stock: 45, image: null },
    { id: 3, name: 'Миша Razer DeathAdder', price: 1899, category: 'electronics', description: 'Ігрова миша 16000 DPI', stock: 80, image: null },
    { id: 4, name: 'Монітор Samsung 27"', price: 12999, category: 'electronics', description: '4K UHD монітор', stock: 20, image: null },
    { id: 5, name: 'Навушники Sony WH-1000XM5', price: 11999, category: 'electronics', description: 'ANC навушники', stock: 30, image: null }
];
let nextId = 6;

// ============================================
// GET /products - список товарів
// ============================================

async function getAll(req, res) {
    const engine = req.query.engine || 'pug';
    const category = req.query.category;

    try {
        let products = [];

        // Спроба MySQL
        try {
            const where = { active: true };
            if (category) where.category = category;

            products = await Product.findAll({
                where,
                order: [['createdAt', 'DESC']]
            });
        } catch (err) {
            // Спроба MongoDB
            try {
                const query = { active: true };
                if (category) query.category = category;

                products = await ProductMongo.find(query)
                    .sort({ createdAt: -1 });
            } catch (err2) {
                // Демо-режим
                products = category
                    ? demoProducts.filter(p => p.category === category)
                    : demoProducts;
            }
        }

        if (engine === 'pug') {
            return res.render('products/index', {
                title: 'Каталог товарів',
                products,
                currentCategory: category,
                currentEngine: engine
            });
        } else if (engine === 'ejs') {
            return res.render('../ejsl/products/index', {
                title: 'Каталог товарів',
                products,
                currentCategory: category,
                currentEngine: engine
            });
        } else if (engine === 'hbs') {
            return res.render('products/index', {
                title: 'Каталог товарів',
                products,
                currentCategory: category,
                currentEngine: engine
            });
        }

        res.render('products/index', {
            title: 'Каталог товарів',
            products,
            currentCategory: category
        });

    } catch (err) {
        console.error('Products error:', err);
        res.render('products/index', {
            title: 'Каталог товарів',
            products: demoProducts
        });
    }
}

// ============================================
// GET /products/add - форма додавання
// ============================================

function addForm(req, res) {
    const engine = req.query.engine || 'pug';

    if (engine === 'pug') {
        return res.render('products/add', {
            title: 'Додати товар',
            product: null,
            currentEngine: engine
        });
    } else if (engine === 'ejs') {
        return res.render('../ejsl/products/add', {
            title: 'Додати товар',
            product: null,
            currentEngine: engine
        });
    } else if (engine === 'hbs') {
        return res.render('products/add', {
            title: 'Додати товар',
            product: null,
            currentEngine: engine
        });
    }

    res.render('products/add', {
        title: 'Додати товар',
        product: null
    });
}

// ============================================
// POST /products/add - зберегти товар
// ============================================

async function create(req, res) {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        let product;

        // MySQL
        try {
            product = await Product.create({
                name,
                description,
                price,
                category,
                stock: stock || 0,
                image
            });
        } catch (err) {
            // MongoDB
            try {
                product = await ProductMongo.create({
                    name,
                    description,
                    price,
                    category,
                    stock: stock || 0,
                    image
                });
            } catch (err2) {
                // Демо-режим
                product = {
                    id: nextId++,
                    name,
                    description,
                    price,
                    category,
                    stock: stock || 0,
                    image
                };
                demoProducts.push(product);
            }
        }

        console.log('✅ Товар створено:', product.name || product.id);

        res.redirect('/products');

    } catch (err) {
        console.error('Create error:', err);
        res.render('products/add', {
            title: 'Додати товар',
            product: { name, description, price, category, stock },
            error: 'Помилка створення товару'
        });
    }
}

// ============================================
// GET /products/:id - форма редагування
// ============================================

async function editForm(req, res) {
    const { id } = req.params;
    const engine = req.query.engine || 'pug';

    try {
        let product;

        try {
            product = await Product.findByPk(id);
        } catch (err) {
            try {
                product = await ProductMongo.findById(id);
            } catch (err2) {
                product = demoProducts.find(p => p.id === parseInt(id));
            }
        }

        if (!product) {
            return res.status(404).render('404', {
                title: '404 - Не знайдено'
            });
        }

        if (engine === 'pug') {
            return res.render('products/edit', {
                title: 'Редагувати товар',
                product,
                currentEngine: engine
            });
        } else if (engine === 'ejs') {
            return res.render('../ejsl/products/edit', {
                title: 'Редагувати товар',
                product,
                currentEngine: engine
            });
        } else if (engine === 'hbs') {
            return res.render('products/edit', {
                title: 'Редагувати товар',
                product,
                currentEngine: engine
            });
        }

        res.render('products/edit', {
            title: 'Редагувати товар',
            product
        });

    } catch (err) {
        res.status(500).render('error', {
            title: 'Помилка',
            message: err.message
        });
    }
}

// ============================================
// POST /products/:id - оновити товар
// ============================================

async function update(req, res) {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
        const updateData = { name, description, price, category, stock };
        if (image) updateData.image = image;

        try {
            await Product.update(updateData, { where: { id } });
        } catch (err) {
            try {
                await ProductMongo.findByIdAndUpdate(id, updateData);
            } catch (err2) {
                // Демо-режим
                const index = demoProducts.findIndex(p => p.id === parseInt(id));
                if (index !== -1) {
                    Object.assign(demoProducts[index], updateData);
                }
            }
        }

        console.log('✅ Товар оновлено:', id);
        res.redirect('/products');

    } catch (err) {
        res.render('products/edit', {
            title: 'Редагувати товар',
            product: { id, name, description, price, category, stock },
            error: 'Помилка оновлення'
        });
    }
}

// ============================================
// GET/POST /products/delete/:id - видалити товар
// ============================================

async function remove(req, res) {
    const { id } = req.params;

    try {
        try {
            await Product.destroy({ where: { id } });
        } catch (err) {
            try {
                await ProductMongo.findByIdAndDelete(id);
            } catch (err2) {
                // Демо-режим
                const index = demoProducts.findIndex(p => p.id === parseInt(id));
                if (index !== -1) {
                    demoProducts.splice(index, 1);
                }
            }
        }

        console.log('🗑️  Товар видалено:', id);
        res.redirect('/products');

    } catch (err) {
        res.status(500).render('error', {
            title: 'Помилка',
            message: err.message
        });
    }
}

module.exports = {
    getAll,
    addForm,
    create,
    editForm,
    update,
    delete: remove
};