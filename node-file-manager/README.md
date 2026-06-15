# 📁 Node File Manager

CLI утиліта для роботи з файлами та директоріями, що демонструє основні модулі Node.js.

## 🎯 Охоплені теми курсу

| Модуль | Теми | Файл |
|--------|------|------|
| **Buffers** | Buffer.from, Buffer.alloc, кодування | `src/systemInfo.js` |
| **Модулі** | require/module.exports | всі файли |
| **Глобальні об'єкти** | process, setTimeout, setInterval | `src/index.js`, `src/systemInfo.js` |
| **process.argv** | Парсинг аргументів CLI | `src/index.js` |
| **process.on()** | Обробка подій процесу | `src/index.js` |
| **OS Module** | Інформація про систему | `src/systemInfo.js` |
| **REPL** | readline, інтерактивний режим | `src/repl.js` |
| **Event Loop** | setTimeout, Promise, nextTick | `src/systemInfo.js` |
| **fs.existsSync** | Перевірка існування | `src/fsOperations.js` |
| **fs.readFile/sync** | Читання файлів | `src/fsOperations.js` |
| **fs.writeFile** | Запис файлів | `src/fsOperations.js` |
| **fs.copyFile** | Копіювання | `src/fsOperations.js` |
| **fs.unlink** | Видалення файлів | `src/fsOperations.js` |
| **fs.rename** | Перейменування | `src/fsOperations.js` |
| **fs.mkdir** | Створення директорій | `src/dirOperations.js` |
| **fs.rmdir** | Видалення директорій | `src/dirOperations.js` |
| **fs.readdir** | Читання директорій | `src/dirOperations.js` |
| **fs.stat** | Метадані файлів | `src/fsOperations.js` |
| **chalk** | Кольоровий вивід | всі файли |

## 📦 Встановлення

```bash
cd node-file-manager
npm install
```

## 🚀 Використання

### Режим командного рядка

```bash
# Показати довідку
node src/index.js help

# Системна інформація
node src/index.js sysinfo

# Читати файл
node src/index.js read myfile.txt

# Записати файл
node src/index.js write output.txt "Hello World"

# Копіювати файл
node src/index.js copy source.txt backup.txt

# Видалити файл
node src/index.js delete myfile.txt

# Створити директорію
node src/index.js mkdir myfolder

# Список файлів
node src/index.js ls

# Інформація про файл
node src/index.js info myfile.txt
```

### REPL режим (інтерактивний)

```bash
npm run repl
# або
node src/repl.js
```

В REPL режимі:
```
file-manager> help
file-manager> read myfile.txt
file-manager> write test.txt Hello
file-manager> sysinfo
file-manager> buffer
file-manager> exit
```

### Системна інформація (демо)

```bash
npm run info
```

## 📂 Структура проекту

```
node-file-manager/
├── package.json
├── README.md
├── src/
│   ├── index.js          # Головний файл (CLI)
│   ├── fsOperations.js   # Файлові операції
│   ├── dirOperations.js  # Операції з директоріями
│   ├── systemInfo.js     # OS, Buffer, Event Loop демо
│   └── repl.js           # Інтерактивний REPL
└── test-data/            # Тестові файли
    └── sample.txt
```

## 🎓 Приклади коду

### Робота з буферами

```javascript
const buf = Buffer.from('Hello', 'utf8');
console.log(buf.toString('hex'));  // 48656c6c6f
console.log(buf.length);           // 5
```

### Файлові операції

```javascript
const fs = require('fs');

// Синхронно
const data = fs.readFileSync('file.txt', 'utf8');
fs.writeFileSync('copy.txt', data);

// Асинхронно
await fs.promises.readFile('file.txt');
await fs.promises.writeFile('output.txt', 'content');
```

### process.argv

```javascript
const args = process.argv.slice(2);
// node index.js read myfile.txt
// args = ['read', 'myfile.txt']
```

### OS модуль

```javascript
const os = require('os');
console.log(os.platform());    // win32 / darwin / linux
console.log(os.cpus());       // Інформація про CPU
console.log(os.totalmem());   // Всього пам'яті
console.log(os.freemem());    // Вільної пам'яті
```

## 🧪 Тестування

```bash
# Тест читання файлу
node src/index.js read test-data/sample.txt

# Тест запису
node src/index.js write test.txt "Test content"
node src/index.js read test.txt

# Тест буферів
node src/index.js buffer

# Тест Event Loop
node src/index.js eventloop
```

## 📚 Корисні посилання

- [Node.js Documentation](https://nodejs.org/docs/)
- [fs модуль](https://nodejs.org/api/fs.html)
- [Buffer](https://nodejs.org/api/buffer.html)
- [OS модуль](https://nodejs.org/api/os.html)
- [process](https://nodejs.org/api/process.html)
- [chalk](https://www.npmjs.com/package/chalk)

## 📝 Завдання для самостійного опрацювання

1. **Завдання 1**: Додати команду `find` для пошуку файлів за ім'ям
2. **Завдання 2**: Додати команду `grep` для пошуку тексту у файлах
3. **Завдання 3**: Реалізувати команду `tree` для відображення дерева директорій
4. **Завдання 4**: Додати підтримку pipe операцій (`cat file.txt | grep hello`)

---

Happy coding! 🚀