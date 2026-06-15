/**
 * repl.js - Інтерактивний REPL режим
 * Демонструє: REPL, readline, глобальні об'єкти
 */

const readline = require('readline');
const chalk = require('chalk');
const fsOps = require('./fsOperations');
const dirOps = require('./dirOperations');
const sysInfo = require('./systemInfo');

// ============================================
// REPL Interface
// ============================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('file-manager> '),
    completer: commandCompleter
});

console.log(`
${chalk.bold.cyan('╔═══════════════════════════════════════════════════════╗')}
${chalk.bold.cyan('║')}     Node.js File Manager - REPL Mode                  ${chalk.bold.cyan('║')}
${chalk.bold.cyan('╚═══════════════════════════════════════════════════════╝')}
${chalk.gray('   Введіть "help" для списку команд, "exit" для виходу')}
`);

rl.prompt();

// ============================================
// Автодоповнення команд
// ============================================

const commands = [
    'help', 'exit', 'quit', 'clear',
    // Файли
    'read', 'write', 'append', 'copy', 'delete', 'rename', 'info',
    // Директорії
    'ls', 'dir', 'mkdir', 'rmdir', 'pwd', 'cd',
    // Система
    'sysinfo', 'buffer', 'uptime', 'pid',
    // REPL
    'node', 'eval', 'os', 'process', 'global'
];

function commandCompleter(line) {
    const hits = commands.filter(c => c.startsWith(line.toLowerCase()));
    return [hits.length ? hits : [], line];
}

// ============================================
// Обробка команд
// ============================================

rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
        rl.prompt();
        return;
    }

    // Розбиваємо на команду та аргументи
    const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

    try {
        await handleCommand(command, args);
    } catch (err) {
        console.log(chalk.red('❌ Помилка:'), err.message);
    }

    rl.prompt();
});

// ============================================
// Обробник команд
// ============================================

async function handleCommand(command, args) {
    switch (command) {
        // ============================================
        // Сервіс
        // ============================================
        case 'help':
        case 'h':
        case '?':
            showHelp();
            break;

        case 'exit':
        case 'quit':
        case 'q':
            console.log(chalk.gray('До побачення! 👋'));
            rl.close();
            break;

        case 'clear':
        case 'cls':
            console.clear();
            rl.prompt();
            break;

        // ============================================
        // Файли
        // ============================================
        case 'read':
        case 'cat':
            await fsOps.readFile(args[0]);
            break;

        case 'write':
        case 'create':
            await fsOps.writeFile(args[0], args.slice(1).join(' '));
            break;

        case 'append':
            await fsOps.appendFile(args[0], args.slice(1).join(' '));
            break;

        case 'copy':
        case 'cp':
            await fsOps.copyFile(args[0], args[1]);
            break;

        case 'delete':
        case 'del':
        case 'rm':
            await fsOps.deleteFile(args[0]);
            break;

        case 'rename':
        case 'mv':
            await fsOps.renameFile(args[0], args[1]);
            break;

        case 'info':
        case 'stat':
            await fsOps.fileInfo(args[0]);
            break;

        // ============================================
        // Директорії
        // ============================================
        case 'ls':
        case 'dir':
            await dirOps.listDirectory(args[0]);
            break;

        case 'mkdir':
            await dirOps.createDirectory(args[0]);
            break;

        case 'rmdir':
            await dirOps.removeDirectory(args[0], args[1] === '--recursive');
            break;

        case 'pwd':
            console.log(chalk.blue(process.cwd()));
            break;

        case 'cd':
            if (args[0]) {
                process.chdir(args[0]);
                console.log(chalk.green('✓'), chalk.gray(process.cwd()));
            }
            break;

        case 'count':
        case 'statfs':
            await dirOps.countItems(args[0]);
            break;

        // ============================================
        // Система
        // ============================================
        case 'sysinfo':
        case 'system':
            sysInfo.showSystemInfo();
            break;

        case 'buffer':
        case 'buf':
            sysInfo.bufferDemo();
            break;

        case 'eventloop':
            sysInfo.eventLoopDemo();
            break;

        case 'uptime':
            console.log(`Час роботи: ${process.uptime().toFixed(2)}с`);
            break;

        case 'pid':
            console.log(`PID: ${process.pid}`);
            break;

        // ============================================
        // REPL спеціальні команди
        // ============================================
        case 'node':
            // Виконання довільного Node.js коду
            if (args.length > 0) {
                try {
                    const result = eval(args.join(' '));
                    if (result !== undefined) {
                        console.log(chalk.cyan('→'), result);
                    }
                } catch (err) {
                    console.log(chalk.red('❌'), err.message);
                }
            }
            break;

        case 'eval':
        case 'e':
            try {
                const code = args.join(' ');
                const result = eval(code);
                console.log(chalk.green('='), result);
            } catch (err) {
                console.log(chalk.red('❌'), err.message);
            }
            break;

        case 'os':
            const os = require('os');
            console.log(os.platform(), os.arch());
            break;

        case 'process':
            console.log('process.argv:', process.argv);
            console.log('process.env:', { ...process.env });
            break;

        case 'global':
            console.log('global object keys:', Object.keys(global));
            break;

        default:
            console.log(chalk.yellow(`❓ Невідома команда: ${command}`));
            console.log(chalk.gray('   Введіть "help" для списку команд'));
    }
}

// ============================================
// Довідка
// ============================================

function showHelp() {
    console.log(`
${chalk.yellow('📁 Файлові операції:')}
  read <file>              Читати файл
  write <file> <content>   Записати у файл
  append <file> <content>   Дописати у файл
  copy <src> <dest>        Копіювати файл
  delete <file>            Видалити файл
  rename <old> <new>       Перейменувати файл
  info <file>              Інформація про файл

${chalk.yellow('📂 Директорії:')}
  ls [path]                Список файлів
  mkdir <name>             Створити директорію
  rmdir <name> [--recursive] Видалити директорію
  pwd                      Поточна директорія
  cd <path>                Змінити директорію
  count [path]             Підрахувати файли

${chalk.yellow('💻 Система:')}
  sysinfo                  Системна інформація
  buffer                   Демо буферів
  eventloop                Демо Event Loop
  uptime                   Час роботи процесу
  pid                      PID процесу

${chalk.yellow('🔧 REPL:')}
  node <code>              Виконати JS код
  eval <code>              Те саме, коротко
  os                       OS інформація
  process                  Process інформація
  global                   Global об'єкт

${chalk.yellow('🔧 Сервіс:')}
  help                     Ця довідка
  clear                    Очистити екран
  exit                     Вийти
    `);
}

// ============================================
// Події
// ============================================

rl.on('close', () => {
    process.exit(0);
});

rl.on('SIGINT', () => {
    console.log(chalk.gray('\n(Ctrl+C для виходу)'));
    rl.question('Вийти? (y/n) ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            console.log(chalk.gray('До побачення!'));
            rl.close();
        } else {
            rl.prompt();
        }
    });
});

module.exports = rl;