/**
 * sequelize.config.js - MySQL через Sequelize
 * Демонструє: Sequelize ORM, моделі, associations
 */

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'my_store',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

/**
 * Тест підключення
 */
async function testConnection() {
    await sequelize.authenticate();
    console.log('✅ Sequelize підключено до MySQL');
    return true;
}

/**
 * Синхронізація моделей з БД
 */
async function syncModels() {
    try {
        // Синхронізуємо всі моделі
        await sequelize.sync({ alter: true });
        console.log('✅ Моделі синхронізовано');
    } catch (err) {
        console.log('⚠️  Синхронізація пропущена:', err.message);
    }
}

// ============================================
// Models
// ============================================

/**
 * Product модель
 */
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true
});

/**
 * User модель
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = {
    sequelize,
    testConnection,
    syncModels,
    Product,
    User
};