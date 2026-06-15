/**
 * fsOperations.js - Файлові операції
 * Демонструє: fs модуль, синхронні/асинхронні методи,
 * readFile, writeFile, copyFile, rename, unlink, existsSync
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ============================================
// fs.existsSync() - Перевірка існування файлу
// ============================================
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// ============================================
// Читання файлу
// ============================================

/**
 * Асинхронне читання - readFile()
 */
async function readFile(filePath) {
    if (!filePath) {
        console.log(chalk.red('❌ Потрібно вказати шлях до файлу'));
        console.log(chalk.gray('Приклад: node index.js read myfile.txt'));
        return;
    }

    try {
        // Перевірка існування через existsSync
        if (!fs.existsSync(filePath)) {
            console.log(chalk.red(`❌ Файл не існує: ${filePath}`));
            return;
        }

        // Асинхронне читання
        const data = await fs.promises.readFile(filePath, 'utf8');
        console.log(chalk.green(`\n✓ Вміст файлу ${filePath}:`));
        console.log(chalk.cyan('─'.repeat(50)));
        console.log(data);
        console.log(chalk.cyan('─'.repeat(50)));

        // Демо буфера - показано байти
        const buffer = Buffer.from(data, 'utf8');
        console.log(chalk.gray(`\n📊 Метадані: ${buffer.length} байт`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка читання:'), err.message);
    }
}

/**
 * Синхронне читання - readFileSync()
 */
function readFileSync(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(chalk.red(`❌ Файл не існує: ${filePath}`));
            return null;
        }

        // Синхронне читання
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        console.error(chalk.red('❌ Помилка читання:'), err.message);
        return null;
    }
}

// ============================================
// Запис у файл
// ============================================

/**
 * Асинхронний запис - writeFile()
 */
async function writeFile(filePath, content) {
    if (!filePath || content === undefined) {
        console.log(chalk.red('❌ Потрібно вказати файл та вміст'));
        return;
    }

    try {
        // Створюємо директорію якщо потрібно
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
            console.log(chalk.gray(`  Створено директорію: ${dir}`));
        }

        // Асинхронний запис
        await fs.promises.writeFile(filePath, content, 'utf8');
        console.log(chalk.green(`✓ Записано у файл: ${filePath}`));
        console.log(chalk.gray(`  Розмір: ${content.length} символів`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка запису:'), err.message);
    }
}

/**
 * Синхронний запис - writeFileSync()
 */
function writeFileSync(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (err) {
        console.error(chalk.red('❌ Помилка запису:'), err.message);
        return false;
    }
}

// ============================================
// Дописування у файл
// ============================================

/**
 * Асинхронне дописування - appendFile()
 */
async function appendFile(filePath, content) {
    if (!filePath || content === undefined) {
        console.log(chalk.red('❌ Потрібно вказати файл та вміст'));
        return;
    }

    try {
        await fs.promises.appendFile(filePath, content, 'utf8');
        console.log(chalk.green(`✓ Дописано у файл: ${filePath}`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

// ============================================
// Копіювання файлу
// ============================================

/**
 * Копіювання - copyFile() / copyFileSync()
 */
async function copyFile(source, dest) {
    if (!source || !dest) {
        console.log(chalk.red('❌ Потрібно вказати джерело та призначення'));
        return;
    }

    try {
        // Перевірка існування джерела
        if (!fs.existsSync(source)) {
            console.log(chalk.red(`❌ Файл не існує: ${source}`));
            return;
        }

        // Створюємо директорію призначення якщо потрібно
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            await fs.promises.mkdir(destDir, { recursive: true });
        }

        // Копіюємо синхронно (copyFile не має простого async)
        fs.copyFileSync(source, dest);

        const stats = fs.statSync(dest);
        console.log(chalk.green(`✓ Скопійовано: ${source} → ${dest}`));
        console.log(chalk.gray(`  Розмір: ${stats.size} байт`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка копіювання:'), err.message);
    }
}

// ============================================
// Видалення файлу
// ============================================

/**
 * Видалення - unlink() / unlinkSync()
 */
async function deleteFile(filePath) {
    if (!filePath) {
        console.log(chalk.red('❌ Потрібно вказати файл для видалення'));
        return;
    }

    try {
        if (!fs.existsSync(filePath)) {
            console.log(chalk.yellow(`⚠ Файл не існує: ${filePath}`));
            return;
        }

        // unlinkSync - синхронне видалення
        fs.unlinkSync(filePath);
        console.log(chalk.green(`✓ Видалено: ${filePath}`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка видалення:'), err.message);
    }
}

// ============================================
// Перейменування / переміщення файлу
// ============================================

/**
 * Перейменування - rename() / renameSync()
 */
async function renameFile(oldPath, newPath) {
    if (!oldPath || !newPath) {
        console.log(chalk.red('❌ Потрібно вказати старе та нове імена'));
        return;
    }

    try {
        if (!fs.existsSync(oldPath)) {
            console.log(chalk.red(`❌ Файл не існує: ${oldPath}`));
            return;
        }

        // renameSync - синхронне перейменування
        fs.renameSync(oldPath, newPath);
        console.log(chalk.green(`✓ Перейменовано: ${oldPath} → ${newPath}`));
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

// ============================================
// Інформація про файл
// ============================================

/**
 * stat() / statSync() - отримання метаданих файлу
 */
async function fileInfo(filePath) {
    if (!filePath) {
        console.log(chalk.red('❌ Потрібно вказати шлях до файлу'));
        return;
    }

    try {
        if (!fs.existsSync(filePath)) {
            console.log(chalk.red(`❌ Файл не існує: ${filePath}`));
            return;
        }

        // statSync - синхронне отримання статистики
        const stats = fs.statSync(filePath);

        console.log(chalk.green(`\n📄 Інформація про файл: ${filePath}`));
        console.log(chalk.cyan('─'.repeat(40)));
        console.log(`  Тип:       ${stats.isFile() ? 'Файл' : stats.isDirectory() ? 'Директорія' : 'Інше'}`);
        console.log(`  Розмір:    ${formatBytes(stats.size)}`);
        console.log(`  Створено:  ${stats.birthtime.toLocaleString('uk-UA')}`);
        console.log(`  Змінено:   ${stats.mtime.toLocaleString('uk-UA')}`);
        console.log(`  Доступ:   ${stats.atime.toLocaleString('uk-UA')}`);
        console.log(chalk.cyan('─'.repeat(40)));
    } catch (err) {
        console.error(chalk.red('❌ Помилка:'), err.message);
    }
}

// ============================================
// Допоміжні функції
// ============================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// Експорт
// ============================================

module.exports = {
    fileExists,
    readFile,
    readFileSync,
    writeFile,
    writeFileSync,
    appendFile,
    copyFile,
    deleteFile,
    renameFile,
    fileInfo,
    formatBytes
};