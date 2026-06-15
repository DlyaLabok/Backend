/**
 * sql/init.js - Ініціалізація бази даних
 * Запустити: npm run db:init
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    console.log('🚀 Ініціалізація бази даних...\n');

    // Підключаємось без вибору бази (для CREATE DATABASE)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        // Читаємо SQL файл
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Виконую schema.sql...');

        // Виконуємо SQL
        await connection.query(sql);

        console.log('\n✅ База даних успішно ініціалізована!');
        console.log('\n📋 Створено таблиці:');
        console.log('   • users (користувачі)');
        console.log('   • products (товари)');
        console.log('\n📝 Додано початкові дані:');
        console.log('   • 5 користувачів');
        console.log('   • 5 товарів');

    } catch (err) {
        console.error('❌ Помилка ініціалізації:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initDatabase();