# 🌐 HTTP Server Basics

Навчальний проект для демонстрації роботи з `http` модулем Node.js.

## 🎯 Охоплені теми курсу

| Модуль | Тема | Де демонструється |
|--------|------|-------------------|
| **HTTP Module** | Створення сервера | `src/index.js` |
| **HTTP Module** | Request об'єкт | `src/index.js`, `src/router.js` |
| **HTTP Module** | Response об'єкт | `src/index.js` |
| **HTTP Module** | Request.url | `src/index.js`, `src/router.js` |
| **HTTP Module** | setHeader | `src/index.js`, `src/staticHandler.js` |
| **HTTP Module** | JSON Response | `src/router.js` |
| **HTTP Module** | Query String | `src/queryParser.js`, `src/router.js` |
| **HTTP Module** | POST Request | `src/index.js` |
| **HTTP Module** | querystring парсинг | `src/queryParser.js` |
| **Nodemon** | Авто-рестарт | `package.json` scripts |

## 📦 Встановлення

```bash
cd http-server-basics
npm install
```

## 🚀 Запуск

```bash
# Звичайний запуск
npm start

# Режим розробки (з Nodemon)
npm run dev
```

Сервер буде доступний за адресою: **http://localhost:3000**

## 📂 Структура проекту

```
http-server-basics/
├── package.json
├── README.md
├── src/
│   ├── index.js          # Головний сервер
│   ├── router.js         # Маршрутизатор
│   ├── staticHandler.js  # Статичні файли
│   └── queryParser.js    # Парсер querystring
├── public/               # Статичні файли
│   ├── style.css
│   └── app.js
├── views/                # HTML шаблони
│   └── home.html
└── data/                 # Файли даних
```

## 🛣️ Доступні маршрути

### Головні сторінки
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/` | Головна сторінка |
| GET | `/about` | Про сайт |
| GET | `/time` | Поточний час (JSON) |
| GET | `/hello?name=X` | Привітання |
| GET | `/form` | Форма |

### URL параметри
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/user/:id` | Дані користувача |

### API Endpoints
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/users` | Список користувачів |
| POST | `/api/data` | Отримати POST дані |
| PUT | `/api/users/:id` | Оновити користувача |
| DELETE | `/api/users/:id` | Видалити користувача |

## 🧪 Тестування

### curl команди

```bash
# Головна сторінка
curl http://localhost:3000/

# Час
curl http://localhost:3000/time

# Привітання
curl "http://localhost:3000/hello?name=Олександр"

# Користувач по ID
curl http://localhost:3000/user/1

# Список API
curl http://localhost:3000/api/users

# POST запит
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"Test","value":42}' \
     http://localhost:3000/api/data

# Форма
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=John&email=john@example.com" \
     http://localhost:3000/form
```

### POSTMAN
1. Встановити POSTMAN
2. Створити новий запит
3. Ввести URL: `http://localhost:3000/api/data`
4. Вибрати метод POST
5. Додати body (JSON або form-data)

## 📚 Приклади коду

### Створення сервера

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Привіт!</h1>');
});

server.listen(3000, () => {
    console.log('Сервер запущено на порту 3000');
});
```

### Роутинг

```javascript
const url = require('url');

server.on('request', (req, res) => {
    const pathname = url.parse(req.url, true).pathname;

    if (pathname === '/') {
        res.end('Головна');
    } else if (pathname === '/about') {
        res.end('Про нас');
    } else {
        res.writeHead(404);
        res.end('Не знайдено');
    }
});
```

### Обробка POST

```javascript
let body = '';
req.on('data', chunk => {
    body += chunk.toString();
});
req.on('end', () => {
    const data = JSON.parse(body);
    console.log(data);
    res.end('OK');
});
```

### querystring

```javascript
const url = require('url');

const parsed = url.parse(req.url, true);
console.log(parsed.query.name);  // "John"
```

## 🎓 Завдання для самостійного опрацювання

1. **Завдання 1**: Додати маршрут `/search?q=term` який шукає в JSON файлі
2. **Завдання 2**: Реалізувати пагінацію для `/api/users?page=1&limit=10`
3. **Завдання 3**: Додати basic auth для API endpoints
4. **Завдання 4**: Реалізувати CORS headers
5. **Завдання 5**: Додати rate limiting

---

Happy coding! 🚀