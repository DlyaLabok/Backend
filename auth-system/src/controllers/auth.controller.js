/**
 * auth.controller.js - Authentication Controller
 * Демонструє:
 * - BCrypt password hashing/verification
 * - Session management
 * - JWT token generation
 * - Cookie handling
 */

const UserModel = require('../models/user.model');
const { generateToken, verifyToken } = require('../middleware/auth.middleware');

// ============================================
// POST /auth/login - Авторизація
// ============================================

async function login(req, res) {
    const { email, password, rememberMe } = req.body;

    try {
        // Валідація
        if (!email || !password) {
            return res.render('login', {
                title: 'Вхід',
                error: 'Введіть email та пароль'
            });
        }

        // Знаходимо користувача
        const user = UserModel.getUserByEmail(email);

        if (!user) {
            return res.render('login', {
                title: 'Вхід',
                error: 'Неправильний email або пароль'
            });
        }

        // Перевіряємо пароль (BCrypt)
        const isValid = await UserModel.verifyPassword(password, user.password);

        if (!isValid) {
            console.log('❌ Неправильний пароль для:', email);
            return res.render('login', {
                title: 'Вхід',
                error: 'Неправильний email або пароль'
            });
        }

        console.log('✅ Авторизація успішна:', user.email);

        // Зберігаємо в сесію
        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        req.session.user = sessionUser;

        // Якщо "Запам'ятати мене" - генеруємо JWT
        if (rememberMe) {
            const token = generateToken(user);
            res.cookie('token', token, {
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
                httpOnly: true,
                sameSite: 'strict'
            });
            console.log('🔑 JWT токен згенеровано (7 днів)');
        }

        // Flash message
        req.session.success = [`Ласкаво просимо, ${user.name}!`];

        res.redirect('/dashboard');

    } catch (err) {
        console.error('❌ Login error:', err);
        res.render('login', {
            title: 'Вхід',
            error: 'Помилка авторизації'
        });
    }
}

// ============================================
// POST /auth/signup - Реєстрація
// ============================================

async function signup(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Валідація
        if (!name || !email || !password) {
            return res.render('signup', {
                title: 'Реєстрація',
                error: 'Всі поля обов\'язкові'
            });
        }

        if (password.length < 6) {
            return res.render('signup', {
                title: 'Реєстрація',
                error: 'Пароль має бути мінімум 6 символів'
            });
        }

        if (password !== confirmPassword) {
            return res.render('signup', {
                title: 'Реєстрація',
                error: 'Паролі не співпадають'
            });
        }

        // Створюємо користувача (BCrypt хешування всередині)
        const newUser = await UserModel.createUser({
            name,
            email,
            password,
            role: 'user'
        });

        console.log('✅ Користувача зареєстровано:', newUser.email);

        // Flash message та редирект на login
        req.session.success = ['Обліковий запис створено! Увійдіть з вашими даними.'];
        res.redirect('/login');

    } catch (err) {
        console.error('❌ Signup error:', err);

        if (err.message.includes('вже існує')) {
            return res.render('signup', {
                title: 'Реєстрація',
                error: 'Користувач з таким email вже існує'
            });
        }

        res.render('signup', {
            title: 'Реєстрація',
            error: 'Помилка реєстрації'
        });
    }
}

// ============================================
// GET /auth/logout - Вихід
// ============================================

function logout(req, res) {
    const userName = req.session.user?.name || 'Гість';

    // Видаляємо сесію
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
        }

        // Очищуємо cookies
        res.clearCookie('auth_session');
        res.clearCookie('token');

        console.log('👋 Користувач вийшов:', userName);
        res.redirect('/login');
    });
}

// ============================================
// GET /auth/profile - Профіль
// ============================================

function profile(req, res) {
    const user = req.session.user;

    // Отримуємо повні дані
    const fullUser = UserModel.getUserById(user.id);

    res.render('profile', {
        title: 'Профіль',
        user: fullUser,
        error: null,
        success: null
    });
}

// ============================================
// POST /auth/profile - Оновлення профілю
// ============================================

async function updateProfile(req, res) {
    const user = req.session.user;
    const { name, currentPassword, newPassword, confirmNewPassword } = req.body;

    try {
        const fullUser = UserModel.getUserById(user.id);

        // Оновлення імені
        if (name && name !== fullUser.name) {
            await UserModel.updateUser(user.id, { name });
            req.session.user.name = name;
        }

        // Оновлення пароля
        if (newPassword) {
            // Перевіряємо поточний пароль
            const isValid = await UserModel.verifyPassword(currentPassword, fullUser.password);

            if (!isValid) {
                return res.render('profile', {
                    title: 'Профіль',
                    user: fullUser,
                    error: 'Неправильний поточний пароль',
                    success: null
                });
            }

            if (newPassword.length < 6) {
                return res.render('profile', {
                    title: 'Профіль',
                    user: fullUser,
                    error: 'Новий пароль має бути мінімум 6 символів',
                    success: null
                });
            }

            if (newPassword !== confirmNewPassword) {
                return res.render('profile', {
                    title: 'Профіль',
                    user: fullUser,
                    error: 'Нові паролі не співпадають',
                    success: null
                });
            }

            // Оновлюємо пароль (BCrypt всередині)
            await UserModel.updateUser(user.id, { password: newPassword });
        }

        res.render('profile', {
            title: 'Профіль',
            user: UserModel.getUserById(user.id),
            error: null,
            success: 'Профіль оновлено!'
        });

    } catch (err) {
        console.error('❌ Profile update error:', err);
        res.render('profile', {
            title: 'Профіль',
            user: UserModel.getUserById(user.id),
            error: 'Помилка оновлення профілю',
            success: null
        });
    }
}

// ============================================
// API: Login (JSON)
// ============================================

async function apiLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = UserModel.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Неправильний email або пароль' });
        }

        const isValid = await UserModel.verifyPassword(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Неправильний email або пароль' });
        }

        // Генеруємо JWT
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ============================================
// API: Signup (JSON)
// ============================================

async function apiSignup(req, res) {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Всі поля обов\'язкові' });
        }

        const newUser = await UserModel.createUser({ name, email, password });

        res.status(201).json({
            success: true,
            message: 'Користувача створено',
            user: newUser
        });

    } catch (err) {
        if (err.message.includes('вже існує')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    login,
    signup,
    logout,
    profile,
    updateProfile,
    apiLogin,
    apiSignup
};