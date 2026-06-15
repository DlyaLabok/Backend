/**
 * mongodb.config.js - MongoDB через Mongoose
 * Демонструє: Mongoose ODM, схеми, моделі
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_store';

/**
 * Підключення до MongoDB
 */
async function connectMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Mongoose підключено до MongoDB');
        return true;
    } catch (err) {
        console.log('⚠️  MongoDB недоступний:', err.message);
        return false;
    }
}

// ============================================
// Mongoose Schemas & Models
// ============================================

/**
 * Product Schema (MongoDB)
 */
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 255
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        default: 'uncategorized'
    },
    image: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const ProductMongo = mongoose.model('ProductMongo', productSchema);

/**
 * User Schema (MongoDB)
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    },
    cart: [{
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number
    }]
}, {
    timestamps: true
});

const UserMongo = mongoose.model('UserMongo', userSchema);

module.exports = {
    connectMongoDB,
    ProductMongo,
    UserMongo
};