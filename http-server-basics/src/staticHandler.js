/**
 * staticHandler.js - Обробник статичних файлів
 * Демонструє: res.setHeader, mime types, fs.readFile
 */

const fs = require('fs');
const path = require('path');

// MIME типи
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

/**
 * Перевірка чи це статичний файл
 */
function isStatic(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES.hasOwnProperty(ext);
}

/**
 * Отримання MIME типу
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Обробка статичного файлу
 */
async function serveStatic(req, res, urlPath, publicDir) {
    // Видаляємо /public з шляху
    let filePath = urlPath.replace(/^\/public/, '');

    // Захист від directory traversal
    filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

    const fullPath = path.join(publicDir, filePath);

    try {
        // Перевірка чи файл існує
        if (!fs.existsSync(fullPath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('File not found: ' + urlPath);
            return;
        }

        // Перевірка чи це файл (а не директорія)
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            // Шукаємо index.html
            const indexPath = path.join(fullPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(fs.readFileSync(indexPath));
            } else {
                res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Directory listing not allowed');
            }
            return;
        }

        // Читаємо файл
        const content = fs.readFileSync(fullPath);
        const mimeType = getMimeType(fullPath);

        // Встановлюємо заголовки
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': content.length,
            'Cache-Control': 'public, max-age=3600'
        });

        res.end(content);

    } catch (err) {
        console.error('❌ Помилка статичного файлу:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');
    }
}

module.exports = {
    isStatic,
    getMimeType,
    serveStatic,
    MIME_TYPES
};