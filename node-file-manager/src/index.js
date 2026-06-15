#!/usr/bin/env node

/**
 * Node File Manager - Головний вхідний пункт
 * Демонструє: process.argv, chalk, fs module, глобальні об'єкти
 */

const chalk = require('chalk');
const fsOps = require('./fsOperations');
const dirOps = require('./dirOperations');
const sysInfo = require('./systemInfo');

// ============================================
// ДЕМО: Глобальні об'єкти Node.js
// ============================================

// process.argv - аргументи командного рядка
// console.log('process.argv демонстрація:');
// console.log(process.argv);

// process.env - змінні оточення
// console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// process.cwd() - поточна директорія
console.log(chalk.blue('Поточна директорія:'), process.cwd());

// process.version - версія Node.js
console.log(chalk.cyan('Версія Node.js:'), process.version);

// ============================================
// process.on() - Обробка подій процесу
// ============================================

process.on('exit', (code) => {
    console.log(chalk.gray(`Процес завершується з кодом: ${code}`));
});

process.on('uncaughtException', (err) => {
    console.error(chalk.red('Необроблена помилка:'), err.message);
    process.exit(1);
});

// ============================================
// CLI Interface
// ============================================

const args = process.argv.slice(2); // Видаляємо 'node' та 'index.js'

function showHelp() {
    console.log(`
${chalk.bold.green('╔════════════════════════════════════════════════╗')}
${chalk.bold.green('║')}     Node.js File Manager - CLI утиліта         ${chalk.bold.green('║')}
${chalk.bold.green('╚════════════════════════════════════════════════╝')}
${chalk.yellow('\n📁 Файлові операції:')}
  read <file>              - Читати файл
  write <file> <content>    - Записати у файл
  append <file> <content>   - Дописати у файл
  copy <source> <dest>      - Копіювати файл
  delete <file>             - Видалити файл
  rename <old> <new>        - Перейменувати файл
  info <file>               - Інформація про файл

${chalk.yellow('\n📂 Директорії:')}
  ls [path]                 - Список файлів
  mkdir <name>              - Створити директорію
  rmdir <name>              - Видалити директорію (рекурсивно)
  pwd                       - Поточна директорія
  cd <path>                 - Змінити директорію

${chalk.yellow('\n💻 Системна інформація:')}
  sysinfo                   - Інформація про систему
  buffer                    - Демо буферів
  uptime                    - Час роботи процесу

${chalk.yellow('\n🔧 Сервіс:')}
  help                      - Показати цю довідку
  repl                      - Запустити REPL режим
  exit                      - Вийти

${chalk.gray('\nПриклад: node index.js read myfile.txt')}
    `);
}

async function main() {
    if (args.length === 0) {
        showHelp();
        return;
    }

    const command = args[0].toLowerCase();
    const commandArgs = args.slice(1);

    switch (command) {
        // ============================================
        // Файлові операції
        // ============================================
        case 'read':
            await fsOps.readFile(commandArgs[0]);
            break;

        case 'write':
            if (commandArgs.length < 2) {
                console.log(chalk.red('❌ Потрібно вказати файл та вміст'));
                console.log(chalk.gray('Приклад: node index.js write myfile.txt "Hello World"'));
            } else {
                await fsOps.writeFile(commandArgs[0], commandArgs.slice(1).join(' '));
            }
            break;

        case 'append':
            if (commandArgs.length < 2) {
                console.log(chalk.red('❌ Потрібно вказати файл та вміст'));
            } else {
                await fsOps.appendFile(commandArgs[0], commandArgs.slice(1).join(' '));
            }
            break;

        case 'copy':
            if (commandArgs.length < 2) {
                console.log(chalk.red('❌ Потрібно вказати джерело та призначення'));
                console.log(chalk.gray('Приклад: node index.js copy file.txt backup.txt'));
            } else {
                await fsOps.copyFile(commandArgs[0], commandArgs[1]);
            }
            break;

        case 'delete':
        case 'del':
        case 'rm':
            if (!commandArgs[0]) {
                console.log(chalk.red('❌ Потрібно вказати файл для видалення'));
            } else {
                await fsOps.deleteFile(commandArgs[0]);
            }
            break;

        case 'rename':
            if (commandArgs.length < 2) {
                console.log(chalk.red('❌ Потрібно вказати старе та нове імена'));
            } else {
                await fsOps.renameFile(commandArgs[0], commandArgs[1]);
            }
            break;

        case 'info':
            await fsOps.fileInfo(commandArgs[0]);
            break;

        // ============================================
        // Директорії
        // ============================================
        case 'ls':
        case 'dir':
            await dirOps.listDirectory(commandArgs[0]);
            break;

        case 'mkdir':
            if (!commandArgs[0]) {
                console.log(chalk.red('❌ Потрібно вказати ім\'я директорії'));
            } else {
                await dirOps.createDirectory(commandArgs[0]);
            }
            break;

        case 'rmdir':
            if (!commandArgs[0]) {
                console.log(chalk.red('❌ Потрібно вказати директорію для видалення'));
            } else {
                await dirOps.removeDirectory(commandArgs[0], commandArgs[1] === '--recursive');
            }
            break;

        case 'pwd':
            console.log(chalk.blue('Поточна директорія:'), chalk.green(process.cwd()));
            break;

        case 'cd':
            if (!commandArgs[0]) {
                console.log(chalk.red('❌ Потрібно вказати шлях'));
            } else {
                process.chdir(commandArgs[0]);
                console.log(chalk.green('✓ Директорію змінено на:'), process.cwd());
            }
            break;

        // ============================================
        // Системна інформація
        // ============================================
        case 'sysinfo':
        case 'system':
            sysInfo.showSystemInfo();
            break;

        case 'buffer':
        case 'buf':
            sysInfo.bufferDemo();
            break;

        case 'uptime':
            console.log(chalk.cyan('Час роботи процесу:'), `${(process.uptime()).toFixed(2)} секунд`);
            break;

        case 'pid':
            console.log(chalk.yellow('PID процесу:'), process.pid);
            break;

        // ============================================
        // Сервіс
        // ============================================
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;

        case 'repl':
            console.log(chalk.green('Запуск REPL режиму...'));
            require('./repl');
            break;

        case 'exit':
        case 'quit':
        case 'q':
            console.log(chalk.gray('До побачення! 👋'));
            process.exit(0);

        default:
            console.log(chalk.red(`❌ Невідома команда: ${command}`));
            console.log(chalk.gray('Введіть "help" для списку команд'));
    }
}

// Запускаємо
main().catch(err => {
    console.error(chalk.red('Помилка:'), err.message);
    process.exit(1);
});

// ============================================
// setTimeout / setInterval демонстрація
// (закоментовано, щоб не заважати основній роботі)
// ============================================

// const timer = setTimeout(() => {
//     console.log(chalk.magenta('Це повідомлення з\'явиться через 2 секунди'));
// }, 2000);

// const interval = setInterval(() => {
//     console.log(chalk.gray('Tick...'));
// }, 1000);

// clearInterval(interval);

module.exports = { main, showHelp };