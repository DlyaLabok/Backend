/**
 * user.model.js - User Model (JSON-based для демо)
 * Демонструє: User data, BCrypt password hashing
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

// Демо-користувачі з вже захешованими паролями
const DEFAULT_USERS = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@auth.com',
        password: '$2a$10$8K1p/a0dL1LXMIgZ7gE5QOqI2tJRvZ4S7U1nN3k5r6s0Tv7fHuZy', // password123
        role: 'admin',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'User',
        email: 'user@auth.com',
        password: '$2a$10$8K1p/a0dL1LXMIgZ7gE5QOqI2tJRvZ4S7U1nN3k5r6s0Tv7fHuZy', // password123
        role: 'user',
        createdAt: new Date().toISOString()
    }
];

// ============================================
// Ініціалізація файлу даних
// ============================================

function initDataFile() {
    if (!fs.existsSync(path.join(__dirname, '..', '..', 'data'))) {
        fs.mkdirSync(path.join(__dirname, '..', '..', 'data'), { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_USERS, null, 2));
        console.log('✅ Users data file created');
    }
}

// ============================================
// CRUD операції
// ============================================

function getAllUsers() {
    initDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

function getUserById(id) {
    const users = getAllUsers();
    return users.find(u => u.id === parseInt(id));
}

function getUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function createUser({ name, email, password, role = 'user' }) {
    const users = getAllUsers();

    // Перевірка на дублікат email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Користувач з таким email вже існує');
    }

    // Хешування пароля через BCrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    console.log('🔐 Password hashed with BCrypt (salt rounds: 10)');

    // Повертаємо без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

async function verifyPassword(plainPassword, hashedPassword) {
    // BCrypt: порівняння plaintext з хешем
    return await bcrypt.compare(plainPassword, hashedPassword);
}

async function updateUser(id, updates) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === parseInt(id));

    if (index === -1) {
        throw new Error('Користувача не знайдено');
    }

    // Якщо оновлюється пароль - хешуємо
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    users[index] = { ...users[index], ...updates };
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    const { password: _, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
}

function deleteUser(id) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === parseInt(id));

    if (index === -1) {
        throw new Error('Користувача не знайдено');
    }

    users.splice(index, 1);
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    return true;
}

// ============================================
// BCrypt Demo
// ============================================

async function demoBcrypt() {
    console.log('\n🔐 BCrypt Demo:');
    console.log('─'.repeat(50));

    const password = 'mySecretPassword123';

    // Генерація salt
    console.log('1. Генерація salt...');
    const salt = await bcrypt.genSalt(10);
    console.log(`   Salt: ${salt.substring(0, 30)}...`);

    // Хешування
    console.log('2. Хешування пароля...');
    const hash = await bcrypt.hash(password, 10);
    console.log(`   Hash: ${hash}`);

    // Перевірка правильного пароля
    console.log('3. Перевірка правильного пароля...');
    const match1 = await bcrypt.compare(password, hash);
    console.log(`   "mySecretPassword123" → ${match1 ? '✅ VALID' : '❌ INVALID'}`);

    // Перевірка неправильного пароля
    console.log('4. Перевірка неправильного пароля...');
    const match2 = await bcrypt.compare('wrongPassword', hash);
    console.log(`   "wrongPassword" → ${match2 ? '✅ VALID' : '❌ INVALID'}`);

    console.log('─'.repeat(50));
}

// Експорт для демо
demoBcrypt();

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    verifyPassword,
    updateUser,
    deleteUser,
    demoBcrypt
};