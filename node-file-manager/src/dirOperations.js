/**
 * dirOperations.js - Операції з директоріями
 * Демонструє: fs.mkdir, fs.rmdir, fs.readdir, fs.rmSync (recursive)
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ============================================
// Список файлів у директорії
// ============================================

/**
 * readdir() vs readdirSync() - читання вмісту директорії
 */
async function listDirectory(dirPath) {
    // Використовуємо поточну директорію якщо не вказано
    const targetDir = dirPath || process.cwd();

    try {
        // Перевірка існування
        if (!fs.existsSync(targetDir)) {
            console.log(chalk.red(`❌ Директорія не існує: ${targetDir}`));
            return;
        }

        const stats = fs.statSync(targetDir);
        if (!stats.isDirectory()) {
            console.log(chalk.red(`❌ Це не директорія: ${targetDir}`));
            return;
        }

        console.log(chalk.blue(`\n📂 Вміст директорії: ${path.resolve(targetDir)}`));
        console.log(chalk.cyan('─'.repeat(50)));

        // readdirSync() - синхронне читання
        const items = fs.readdirSync(targetDir);

        if (items.length === 0) {
            console.log(chalk.gray('  (порожня директорія)'));
        } else {
            let fileCount = 0;
            let dirCount = 0;

            for (const item of items) {
                const fullPath = path.join(targetDir, item);
                const itemStats = fs.statSync(fullPath);

                if (itemStats.isDirectory()) {
                    console.log(`  ${chalk.blue('📁')} ${chalk.blue(item)}/`);
                    dirCount++;
                } else {
                    const size = formatBytes(itemStats.size);
                    console.log(`  ${chalk.green('📄')} ${item} ${chalk.gray(`(${size})`)}`);
                    fileCount++;
                }
            }

            console.log(chalk.cyan('─'.repeat(50)));
            console.log(chalk.gray(`  ${fileCount} файлів, ${dirCount} директорій`));
        }
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

/**
 * readdir() - асинхронна версія
 */
async function listDirectoryAsync(dirPath) {
    const targetDir = dirPath || process.cwd();

    try {
        const items = await fs.promises.readdir(targetDir, { withFileTypes: true });

        console.log(chalk.blue(`\n📂 ${targetDir} (асинхронно):`));
        console.log(chalk.cyan('─'.repeat(40)));

        for (const item of items) {
            const icon = item.isDirectory() ? '📁' : '📄';
            const color = item.isDirectory() ? chalk.blue : chalk.green;
            console.log(`  ${icon} ${color(item.name)}${item.isDirectory() ? '/' : ''}`);
        }
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

// ============================================
// Створення директорії
// ============================================

/**
 * fs.mkdir() / fs.mkdirSync() - створення директорії
 */
async function createDirectory(dirName) {
    if (!dirName) {
        console.log(chalk.red('❌ Потрібно вказати ім\'я директорії'));
        return;
    }

    try {
        // Перевірка чи вже існує
        if (fs.existsSync(dirName)) {
            console.log(chalk.yellow(`⚠ Директорія вже існує: ${dirName}`));
            return;
        }

        // mkdirSync - синхронне створення
        // { recursive: true } - створює батьківські директорії якщо потрібно
        fs.mkdirSync(dirName, { recursive: true });
        console.log(chalk.green(`✓ Створено директорію: ${dirName}`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

/**
 * Асинхронне створення директорії
 */
async function createDirectoryAsync(dirName) {
    try {
        await fs.promises.mkdir(dirName, { recursive: true });
        console.log(chalk.green(`✓ Директорію створено: ${dirName}`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

// ============================================
// Видалення директорії
// ============================================

/**
 * fs.rmdir() / fs.rmSync() - видалення директорії
 */
async function removeDirectory(dirName, recursive = false) {
    if (!dirName) {
        console.log(chalk.red('❌ Потрібно вказати директорію для видалення'));
        return;
    }

    try {
        if (!fs.existsSync(dirName)) {
            console.log(chalk.yellow(`⚠ Директорія не існує: ${dirName}`));
            return;
        }

        if (recursive) {
            // fs.rmSync() з { recursive: true } - видаляє рекурсивно
            fs.rmSync(dirName, { recursive: true, force: true });
            console.log(chalk.green(`✓ Рекурсивно видалено: ${dirName}`));
        } else {
            // rmdirSync - видалення порожньої директорії
            fs.rmdirSync(dirName);
            console.log(chalk.green(`✓ Видалено директорію: ${dirName}`));
        }
    } catch (err) {
        if (err.code === 'ENOTEMPTY') {
            console.log(chalk.yellow(`⚠ Директорія не порожня. Використайте --recursive`));
            console.log(chalk.gray(`  Приклад: node index.js rmdir ${dirName} --recursive`));
        } else {
            console.error(chalk.red('❌ Помилка:'), err.message);
        }
    }
}

// ============================================
// Підрахунок файлів у директорії (Assignment демо)
// ============================================

/**
 * Підрахунок файлів та папок у директорії
 */
async function countItems(dirPath) {
    const targetDir = dirPath || process.cwd();
    let fileCount = 0;
    let dirCount = 0;

    function countRecursive(dir) {
        try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);

                if (stats.isDirectory()) {
                    dirCount++;
                    countRecursive(fullPath); // рекурсія!
                } else {
                    fileCount++;
                }
            }
        } catch (err) {
            console.error(chalk.red(`Помилка доступу: ${dir}`));
        }
    }

    countRecursive(targetDir);

    console.log(chalk.green(`\n📊 Статистика: ${targetDir}`));
    console.log(chalk.cyan('─'.repeat(40)));
    console.log(`  Файлів:    ${chalk.yellow(fileCount)}`);
    console.log(`  Папок:     ${chalk.blue(dirCount)}`);
    console.log(`  Всього:    ${chalk.green(fileCount + dirCount)}`);
}

// ============================================
// Допоміжні функції
// ============================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ============================================
// Експорт
// ============================================

module.exports = {
    listDirectory,
    listDirectoryAsync,
    createDirectory,
    createDirectoryAsync,
    removeDirectory,
    countItems
};