# 🛒 MyStore - E-commerce Application

Повний e-commerce застосунок, що демонструє роботу з Node.js, Express, та різними шаблонізаторами (Pug, EJS, Handlebars).

## 🎯 Охоплені теми курсу

### Модуль 7 - Templating Engine (Pug, EJS, Handlebars)

| Тема | Де демонструється |
|------|-------------------|
| Server-Side Rendering | `src/index.js` |
| Pug шаблони | `views/pug/*.pug` |
| EJS шаблони | `views/ejsl/*.ejs` |
| Handlebars шаблони | `views/handlebars/*.handlebars` |
| Template Layouts | `layout.pug`, `layouts/main.handlebars` |
| Includes (partials) | `includes/header.pug`, `includes/footer.ejs` |
| Conditional Rendering | `if !products` в Pug/EJS |
| Loops (each...in) | `each product in products` |
| Template Inheritance | `extends`, `block` в Pug |
| Dynamic Classes | `class=condition ? 'active' : ''` |

### Модулі 16-17 - Sequelize

| Тема | Де демонструється |
|------|-------------------|
| Sequelize підключення | `src/db/sequelize.config.js` |
| Створення моделі | `Product`, `User` моделі |
| CRUD операції | `src/controllers/product.controller.js` |
| Валідації | `src/db/sequelize.config.js` (notEmpty, min, etc.) |

### Модулі 18-20 - MongoDB & Mongoose

| Тема | Де демонструється |
|------|-------------------|
| Mongoose підключення | `src/db/mongodb.config.js` |
| Schema definition | `productSchema`, `userSchema` |
| CRUD операції | `src/controllers/product.controller.js` |
| Validators | Mongoose validators в схемі |

### Модулі 11-14 - Auth (Cookies, Sessions, JWT, BCrypt)

| Тема | Де демонструється |
|------|-------------------|
| Cookie middleware | `src/index.js` (cookie-parser) |
| Session middleware | `src/index.js` (express-session) |
| Session в MySQL | `express-mysql-session` |
| JWT tokens | `src/routes/auth.routes.js` |
| BCrypt hashing | `src/routes/auth.routes.js` |

### Модуль 15 - File Upload (Multer)

| Тема | Де демонструється |
|------|-------------------|
| Multer config | `src/routes/product.routes.js` |
| File storage | `uploads/` директорія |
| Image upload form | `views/pug/products/add.pug` |

## 📦 Встановлення

```bash
cd my-store
npm install
```

## 🗄️ Налаштування

Створи `.env` файл:

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_store

# MongoDB (опціонально)
MONGODB_URI=mongodb://localhost:27017/my_store

# Session
SESSION_SECRET=your-secret-key

# JWT
JWT_SECRET=your-jwt-secret

PORT=3000
```

## 🚀 Запуск

```bash
# Режим розробки
npm run dev

# Звичайний запуск
npm start
```

## 🛣️ Маршрути

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/` | Головна |
| GET | `/products` | Каталог |
| GET | `/products/add` | Додати товар |
| POST | `/products/add` | Зберегти товар |
| GET | `/products/:id` | Редагувати |
| POST | `/products/:id` | Оновити |
| GET | `/products/delete/:id` | Видалити |
| GET | `/auth/signup` | Реєстрація |
| GET | `/auth/login` | Вхід |
| GET | `/auth/logout` | Вихід |

## 🔧 Перемикання шаблонізаторів

```
?engine=pug     - Pug (за замовчуванням)
?engine=ejs     - EJS
?engine=hbs     - Handlebars
```

## 📂 Структура проекту

```
my-store/
├── package.json
├── README.md
├── env.example
├── src/
│   ├── index.js              # Express сервер
│   ├── config/
│   │   ├── pug.config.js     # Pug engine
│   │   ├── ejs.config.js     # EJS engine
│   │   └── handlebars.config.js
│   ├── routes/
│   │   ├── product.routes.js # CRUD routes
│   │   ├── auth.routes.js    # Auth routes
│   │   └── home.routes.js    # Home routes
│   ├── controllers/
│   │   └── product.controller.js
│   ├── db/
│   │   ├── sequelize.config.js   # MySQL
│   │   └── mongodb.config.js     # MongoDB
│   └── middleware/
│       └── auth.middleware.js
├── views/
│   ├── pug/              # Pug templates
│   ├── ejsl/             # EJS templates
│   └── handlebars/       # Handlebars templates
├── public/
│   ├── css/style.css
│   └── js/main.js
├── uploads/              # Uploaded images
└── sql/                  # Database schemas
```

## 🎓 Приклади коду

### Pug шаблон з loops та conditionals

```pug
// each...in loop
each product in products
    .product-card
        h3= product.name

// Conditional
if !products || products.length === 0
    .no-products Товари не знайдено

// Dynamic classes
a(href="/" class=isActive ? 'active' : '')
```

### EJS шаблони

```ejs
<% products.forEach(function(p) { %>
    <div class="product"><%= p.name %></div>
<% }); %>

<% if (user) { %>
    <p>Welcome, <%= user.name %>!</p>
<% } %>
```

### Handlebars з helpers

```handlebars
{{#each products}}
    <div class="price">{{formatPrice this.price}}</div>
{{/each}}

{{#ifEquals category 'electronics'}}...{{/ifEquals}}
```

### Sequelize модель

```javascript
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        validate: { min: 0 }
    }
});
```

### Mongoose схема

```javascript
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 }
}, { timestamps: true });
```

## 🧪 Тестування

```bash
# Демо-вхід
# Email: admin@store.com
# Password: admin123
```

---

Happy coding! 🚀