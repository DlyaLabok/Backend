/**
 * db.config.js - MySQL конфігурація
 * Демонструє: mysql2 пул з'єднань, pool.query, pool.execute
 */

const mysql = require('mysql2');

// ============================================
// Конфігурація пулу з'єднань
// ============================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rest_api_db',
    waitForConnections: true,
    connectionLimit: 10,      // Максимум з'єднань у пулі
    queueLimit: 0,            // Черга без обмежень
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// ============================================
// Тестування з'єднання
// ============================================

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Підключення до MySQL встановлено!');
        console.log(`   Хост: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   База: ${process.env.DB_NAME || 'rest_api_db'}`);
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Помилка підключення до MySQL:', err.message);
        return false;
    }
}

// ============================================
// Демонстрація: pool.query() vs pool.execute()
// ============================================

/**
 * pool.query() - екранує значення автоматично (зручно для SELECT)
 * Підготовлює запит кожного разу
 */
async function demoQuery() {
    console.log('\n📝 pool.query() демонстрація:');

    // SELECT з параметрами (автоматичне екранування)
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE status = ?',
        ['active']
    );
    console.log('Результат:', rows);
}

/**
 * pool.execute() - використовує prepared statements (краще для INSERT/UPDATE)
 * Підготовлює запит один раз, потім виконує багато разів
 */
async function demoExecute() {
    console.log('\n📝 pool.execute() демонстрація:');

    // INSERT з prepared statement
    const [result] = await pool.execute(
        'INSERT INTO users (name, email, status) VALUES (?, ?, ?)',
        ['Новий користувач', 'new@example.com', 'active']
    );
    console.log('ID нового запису:', result.insertId);

    // UPDATE
    const [updateResult] = await pool.execute(
        'UPDATE users SET status = ? WHERE id = ?',
        ['inactive', result.insertId]
    );
    console.log('Оновлено рядків:', updateResult.affectedRows);
}

/**
 * Показати статистику пулу
 */
function getPoolStatus() {
    return {
        totalConnections: pool.pool?._allConnections?.length || 0,
        freeConnections: pool.pool?._freeConnections?.length || 0,
        connectionLimit: pool.pool?._config?.connectionLimit || 10
    };
}

module.exports = {
    pool,
    testConnection,
    demoQuery,
    demoExecute,
    getPoolStatus
};