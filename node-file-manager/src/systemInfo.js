/**
 * systemInfo.js - Системна інформація
 * Демонструє: os модуль, Buffers, глобальні об'єкти process
 */

const os = require('os');
const chalk = require('chalk');

// ============================================
// OS Module - інформація про систему
// ============================================

function showSystemInfo() {
    console.log(`
${chalk.bold.cyan('╔═══════════════════════════════════════════════════════╗')}
${chalk.bold.cyan('║')}         💻 Системна інформація (OS Module)              ${chalk.bold.cyan('║')}
${chalk.bold.cyan('╚═══════════════════════════════════════════════════════╝')}
    `);

    console.log(chalk.yellow('\n🖥️  Платформа:'));
    console.log(`   OS:              ${os.platform()} ${os.arch()}`);
    console.log(`   Тип:             ${getPlatformType()}`);
    console.log(`   Реліз:           ${os.release()}`);

    console.log(chalk.yellow('\n⏰ Час:'));
    console.log(`   Поточний час:    ${new Date().toLocaleString('uk-UA')}`);
    console.log(`   Uptime:          ${formatUptime(os.uptime())}`);
    console.log(`   Часова зона:     UTC${os.hostname()}`);

    console.log(chalk.yellow('\n🧠 Процесор:'));
    console.log(`   Модель:          ${os.cpus()[0]?.model || 'N/A'}`);
    console.log(`   Ядер:            ${os.cpus().length}`);
    console.log(`   Швидкість:       ${os.cpus()[0]?.speed || 'N/A'} MHz`);

    console.log(chalk.yellow('\n💾 Пам\u02BCять:'));
    const totalMem = formatBytes(os.totalmem());
    const freeMem = formatBytes(os.freemem());
    const usedMem = formatBytes(os.totalmem() - os.freemem());
    console.log(`   Всього:          ${totalMem}`);
    console.log(`   Використано:     ${usedMem}`);
    console.log(`   Вільно:          ${freeMem}`);
    console.log(`   Використання:    ${((1 - os.freemem() / os.totalmem()) * 100).toFixed(1)}%`);

    console.log(chalk.yellow('\n📁 Шляхи:'));
    console.log(`   Домашня:         ${os.homedir()}`);
    console.log(`   Тимчасова:       ${os.tmpdir()}`);
    console.log(`   Хост:            ${os.hostname()}`);

    console.log(chalk.yellow('\n🔧 Node.js інформація:'));
    console.log(`   Версія Node:     ${process.version}`);
    console.log(`   Версія V8:       ${process.versions?.v8 || 'N/A'}`);
    console.log(`   Платформа:       ${process.platform}`);
    console.log(`   Архітектура:     ${process.arch}`);
    console.log(`   PID:             ${process.pid}`);

    console.log(chalk.cyan('\n' + '─'.repeat(55)));
}

// ============================================
// Buffer - демонстрація
// ============================================

function bufferDemo() {
    console.log(`
${chalk.bold.magenta('╔═══════════════════════════════════════════════════════╗')}
${chalk.bold.magenta('║')}              Buffer - демонстрація                      ${chalk.bold.magenta('║')}
${chalk.bold.magenta('╚═══════════════════════════════════════════════════════╝')}
    `);

    // Створення буфера
    console.log(chalk.yellow('\n1️⃣  Створення буферів:'));

    // Buffer.from() - з рядка
    const buf1 = Buffer.from('Hello, Node.js!', 'utf8');
    console.log(`   Buffer.from("Hello, Node.js!"):`);
    console.log(`   → ${buf1}`);
    console.log(`   → hex:   ${buf1.toString('hex')}`);
    console.log(`   → base64: ${buf1.toString('base64')}`);
    console.log(`   → length: ${buf1.length} байт`);

    // Buffer.alloc() - порожній буфер
    const buf2 = Buffer.alloc(10);
    console.log(`\n   Buffer.alloc(10):`);
    console.log(`   → ${buf2}`);
    console.log(`   → length: ${buf2.length}`);

    // Buffer.allocUnsafe() - швидкий буфер (не ініціалізований)
    const buf3 = Buffer.allocUnsafe(5);
    console.log(`\n   Buffer.allocUnsafe(5):`);
    console.log(`   → ${buf3}`);

    // Маніпуляції з буферами
    console.log(chalk.yellow('\n2️⃣  Маніпуляції з буферами:'));

    const buf4 = Buffer.from('Hello');
    const buf5 = Buffer.from(' World');

    // concat() - об'єднання
    const combined = Buffer.concat([buf4, buf5]);
    console.log(`   Buffer.concat(["Hello", " World"]):`);
    console.log(`   → "${combined.toString()}"`);

    // slice() - зріз
    const buf6 = Buffer.from('Node.js');
    console.log(`\n   Buffer.from("Node.js").slice(0, 4):`);
    console.log(`   → "${buf6.slice(0, 4).toString()}"`);

    // Запис у буфер
    const buf7 = Buffer.alloc(16);
    buf7.write('Hello', 'utf8');
    buf7.write('World', 8, 'utf8');
    console.log(`\n   Буфер з записами:`);
    console.log(`   → "${buf7.toString('utf8', 0, 13)}"`);

    // Копіювання
    console.log(chalk.yellow('\n3️⃣  Копіювання буферів:'));
    const source = Buffer.from('Source text');
    const dest = Buffer.alloc(20);
    source.copy(dest);
    console.log(`   source.copy(dest):`);
    console.log(`   → source: "${source.toString()}"`);
    console.log(`   → dest:   "${dest.toString().trim()}"`);

    // Перевірка кодувань
    console.log(chalk.yellow('\n4️⃣  Різні кодування:'));
    const text = 'Привіт';
    const buf8 = Buffer.from(text);
    console.log(`   Текст: "${text}"`);
    console.log(`   utf8:    ${buf8.toString('utf8')}`);
    console.log(`   hex:     ${buf8.toString('hex')}`);
    console.log(`   base64:  ${buf8.toString('base64')}`);
    console.log(`   bytes:   [${buf8.join(', ')}]`);

    console.log(chalk.cyan('\n' + '─'.repeat(55)));
}

// ============================================
// Global Objects демонстрація
// ============================================

function globalObjectsDemo() {
    console.log(`
${chalk.bold.green('╔═══════════════════════════════════════════════════════╗')}
${chalk.bold.green('║')}        Глобальні об'єкти Node.js                      ${chalk.bold.green('║')}
${chalk.bold.green('╚═══════════════════════════════════════════════════════╝')}
    `);

    console.log(chalk.yellow('\n⏱️  Таймери:'));

    // setTimeout
    console.log('   setTimeout(callback, delay) - виконати один раз');
    setTimeout(() => {
        console.log(chalk.green('   ✓ setTimeout спрацював!'));
    }, 100);

    // setInterval (з обмеженням)
    let intervalCount = 0;
    const interval = setInterval(() => {
        intervalCount++;
        if (intervalCount >= 3) {
            clearInterval(interval);
            console.log(chalk.yellow('   (setInterval зупинено після 3х викликів)'));
        } else {
            console.log(chalk.gray(`   Tick #${intervalCount}`));
        }
    }, 100);

    console.log(chalk.yellow('\n📝 process:'));
    console.log(`   process.cwd():     ${process.cwd()}`);
    console.log(`   process.env.USER:   ${process.env.USERNAME || process.env.USER || 'N/A'}`);
    console.log(`   process.pid:        ${process.pid}`);
    console.log(`   process.version:    ${process.version}`);
    console.log(`   process.uptime():   ${process.uptime().toFixed(2)}s`);

    console.log(chalk.yellow('\n🌐 __filename та __dirname (глобальні):'));
    console.log(`   __filename:        Не підтримується напряму`);
    console.log(`   __dirname:         Не підтримується напряму`);
    console.log(chalk.gray('   (Використовуйте import.meta.url у ESM)'));

    console.log(chalk.yellow('\n🧮 Global:'));
    console.log(`   global.global === global: ${global.global === global}`);

    console.log(chalk.cyan('\n' + '─'.repeat(55)));
}

// ============================================
// Event Loop демонстрація
// ============================================

function eventLoopDemo() {
    console.log(`
${chalk.bold.cyan('╔═══════════════════════════════════════════════════════╗')}
${chalk.bold.cyan('║')}              Event Loop - демонстрація                  ${chalk.bold.cyan('║')}
${chalk.bold.cyan('╚═══════════════════════════════════════════════════════╝')}
    `);

    console.log(chalk.yellow('\n🔄 Порядок виконання:'));
    console.log('   1. Синхронний код виконується першим');
    console.log('   2. process.nextTick()');
    console.log('   3. Microtasks (Promise.then)');
    console.log('   4. Звичайні setImmediate()');
    console.log('   5. Таймери (setTimeout, setInterval)');

    console.log(chalk.gray('\n   Дивіться консоль для порядку виводу...'));

    // Демо порядку
    console.log('\n   1️⃣ Синхронний код');

    setImmediate(() => {
        console.log('   4️⃣ setImmediate (Node-specific)');
    });

    setTimeout(() => {
        console.log('   5️⃣ setTimeout (0ms)');
    }, 0);

    Promise.resolve()
        .then(() => console.log('   3️⃣ Promise.then (microtask)'));

    process.nextTick(() => {
        console.log('   2️⃣ process.nextTick (найвищий пріоритет)');
    });

    console.log('   1️⃣ Синхронний код (продовження)');
    console.log(chalk.cyan('\n' + '─'.repeat(55)));
}

// ============================================
// Допоміжні функції
// ============================================

function getPlatformType() {
    const platform = os.platform();
    const types = {
        'win32': 'Windows',
        'darwin': 'macOS',
        'linux': 'Linux'
    };
    return types[platform] || platform;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}д ${hours}г ${minutes}хв`;
    if (hours > 0) return `${hours}г ${minutes}хв`;
    return `${minutes} хв ${Math.floor(seconds % 60)}с`;
}

// ============================================
// Експорт
// ============================================

module.exports = {
    showSystemInfo,
    bufferDemo,
    globalObjectsDemo,
    eventLoopDemo
};

// Якщо запущено напряму
if (require.main === module) {
    console.log('\n');
    showSystemInfo();
    bufferDemo();
    globalObjectsDemo();
    eventLoopDemo();
}