/**
 * index.js - Chat Server with Socket.IO
 * Демонструє:
 * - Socket.IO server setup
 * - Real-time events (connection, disconnect, message)
 * - Broadcasting messages
 * - Private messages
 * - Room management
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// ============================================
// In-memory storage (для демо)
// ============================================

const users = new Map();        // socketId -> user info
const rooms = new Map();        // roomName -> Set of socketIds
const userSockets = new Map();  // userId -> socketId
const messages = new Map();     // roomName -> message history

// Default rooms
rooms.set('general', new Set());
rooms.set('tech', new Set());
rooms.set('random', new Set());

// ============================================
// Express Middleware
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================
// Routes
// ============================================

// Головна - форма входу
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'join.html'));
});

// Кімната чату
app.get('/chat', (req, res) => {
    const { username, room } = req.query;
    if (!username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '..', 'views', 'chat.html'));
});

// ============================================
// Socket.IO Events
// ============================================

io.on('connection', (socket) => {
    console.log(`\n🔌 Нове підключення: ${socket.id}`);

    // ============================================
    // join - Приєднання до кімнати
    // ============================================
    socket.on('join', ({ username, room }) => {
        // Зберігаємо дані користувача
        const user = {
            id: socket.id,
            username,
            room,
            joinedAt: new Date()
        };
        users.set(socket.id, user);

        // Приєднуємо до кімнати
        socket.join(room);

        // Додаємо до кімнати
        if (!rooms.has(room)) {
            rooms.set(room, new Set());
        }
        rooms.get(room).add(socket.id);

        // Вітальне повідомлення
        socket.emit('message', {
            type: 'system',
            text: `Ласкаво просимо, ${username}! Ви в кімнаті "${room}".`,
            timestamp: new Date()
        });

        // Повідомлення іншим
        socket.to(room).emit('message', {
            type: 'system',
            text: `${username} приєднався до чату.`,
            timestamp: new Date()
        });

        // Оновлюємо список користувачів
        updateRoomUsers(room);

        console.log(`👤 ${username} приєднався до "${room}"`);
    });

    // ============================================
    // chatMessage - Повідомлення в чаті
    // ============================================
    socket.on('chatMessage', (text) => {
        const user = users.get(socket.id);
        if (!user) return;

        const message = {
            id: Date.now(),
            type: 'message',
            username: user.username,
            text,
            room: user.room,
            timestamp: new Date()
        };

        // Зберігаємо в історію
        if (!messages.has(user.room)) {
            messages.set(user.room, []);
        }
        messages.get(user.room).push(message);

        // Зберігаємо останні 100 повідомлень
        if (messages.get(user.room).length > 100) {
            messages.get(user.room).shift();
        }

        // Відправляємо всім у кімнаті (включаючи відправника)
        io.to(user.room).emit('message', message);

        console.log(`💬 [${user.room}] ${user.username}: ${text}`);
    });

    // ============================================
    // Private message - Приватне повідомлення
    // ============================================
    socket.on('privateMessage', ({ to, text }) => {
        const user = users.get(socket.id);
        const targetSocket = userSockets.get(to);

        if (!user || !targetSocket) return;

        const message = {
            type: 'private',
            from: user.username,
            fromId: socket.id,
            to,
            text,
            timestamp: new Date()
        };

        // Відправляємо получателю
        io.to(targetSocket).emit('privateMessage', message);

        // Відправляємо відправнику (підтвердження)
        socket.emit('privateMessage', {
            ...message,
            to: users.get(targetSocket)?.username
        });

        console.log(`🔒 [PM] ${user.username} → ${to}: ${text}`);
    });

    // ============================================
    // Typing indicator - Індикатор друку
    // ============================================
    socket.on('typing', () => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('typing', {
                username: user.username,
                isTyping: true
            });
        }
    });

    socket.on('stopTyping', () => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('typing', {
                username: user.username,
                isTyping: false
            });
        }
    });

    // ============================================
    // Room management - Управління кімнатами
    // ============================================
    socket.on('switchRoom', (newRoom) => {
        const user = users.get(socket.id);
        if (!user) return;

        const oldRoom = user.room;

        // Виходимо зі старої кімнати
        socket.leave(oldRoom);
        rooms.get(oldRoom)?.delete(socket.id);

        // Приєднуємося до нової
        socket.join(newRoom);
        user.room = newRoom;
        users.set(socket.id, user);

        if (!rooms.has(newRoom)) {
            rooms.set(newRoom, new Set());
        }
        rooms.get(newRoom).add(socket.id);

        // Повідомлення
        socket.emit('message', {
            type: 'system',
            text: `Ви перейшли до кімнати "${newRoom}".`,
            timestamp: new Date()
        });

        socket.to(oldRoom).emit('message', {
            type: 'system',
            text: `${user.username} покинув кімнату.`,
            timestamp: new Date()
        });

        socket.to(newRoom).emit('message', {
            type: 'system',
            text: `${user.username} приєднався.`,
            timestamp: new Date()
        });

        // Відправляємо історію нової кімнати
        const roomHistory = messages.get(newRoom) || [];
        socket.emit('loadHistory', roomHistory);

        // Оновлюємо списки
        updateRoomUsers(oldRoom);
        updateRoomUsers(newRoom);

        console.log(`🔄 ${user.username}: ${oldRoom} → ${newRoom}`);
    });

    // ============================================
    // Send image - Відправка зображення
    // ============================================
    socket.on('sendImage', ({ imageData, filename }) => {
        const user = users.get(socket.id);
        if (!user) return;

        const message = {
            type: 'image',
            username: user.username,
            imageData,
            filename,
            room: user.room,
            timestamp: new Date()
        };

        // Зберігаємо
        if (!messages.has(user.room)) {
            messages.set(user.room, []);
        }
        messages.get(user.room).push(message);

        // Відправляємо
        io.to(user.room).emit('message', message);

        console.log(`🖼️  [${user.room}] ${user.username} надіслав зображення`);
    });

    // ============================================
    // Disconnect - Відключення
    // ============================================
    socket.on('disconnect', () => {
        const user = users.get(socket.id);

        if (user) {
            // Повідомляємо інших
            socket.to(user.room).emit('message', {
                type: 'system',
                text: `${user.username} покинув чат.`,
                timestamp: new Date()
            });

            // Видаляємо з кімнати
            rooms.get(user.room)?.delete(socket.id);

            // Видаляємо з мап
            users.delete(socket.id);
            userSockets.delete(user.username);

            // Оновлюємо список
            updateRoomUsers(user.room);

            console.log(`👋 ${user.username} відключився`);
        }

        console.log(`🔌 Відключено: ${socket.id}`);
    });
});

// ============================================
// Helper: Update users in room
// ============================================

function updateRoomUsers(room) {
    const roomUsers = [];
    const roomSet = rooms.get(room);

    if (roomSet) {
        for (const socketId of roomSet) {
            const user = users.get(socketId);
            if (user) {
                roomUsers.push({
                    id: socketId,
                    username: user.username
                });
            }
        }
    }

    // Відправляємо всім у кімнаті
    io.to(room).emit('roomUsers', roomUsers);
}

// ============================================
// Server Start
// ============================================

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║              Chat App with Socket.IO                        ║
╠════════════════════════════════════════════════════════════╣
║  🌐 Сервер:          http://localhost:${PORT}                   ║
║  🔌 Socket.IO:       Підключено                             ║
║                                                            ║
║  📡 Events:                                                  ║
║  • join            - Приєднання до кімнати                  ║
║  • chatMessage     - Повідомлення в чат                     ║
║  • privateMessage  - Приватне повідомлення                  ║
║  • typing          - Індикатор друку                        ║
║  • switchRoom      - Зміна кімнати                          ║
║  • sendImage       - Відправка зображення                   ║
║                                                            ║
║  🏠 Кімнати:                                               ║
║  • general         - Загальна                              ║
║  • tech            - Технічна                               ║
║  • random          - Випадкова                              ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = { app, server, io };