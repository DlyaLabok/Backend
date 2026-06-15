/**
 * ejs.config.js - EJS шаблонізатор
 * Демонструє: EJS, partials, template includes, loops
 */

const ejs = require('ejs');
const path = require('path');

/**
 * EJS engine setup
 * EJS - простий та familiar синтаксис (<%= %>)
 */
function ejsEngine(filePath, options, callback) {
    try {
        // Рендеримо EJS файл
        const html = ejs.renderFile(filePath, {
            ...options,
            // Допоміжні функції
            formatPrice: (price) => {
                return new Intl.NumberFormat('uk-UA', {
                    style: 'currency',
                    currency: 'UAH'
                }).format(price);
            },
            formatDate: (date) => {
                return new Date(date).toLocaleDateString('uk-UA');
            },
            truncate: (str, length = 100) => {
                if (str && str.length > length) {
                    return str.substring(0, length) + '...';
                }
                return str;
            }
        });

        html.then(html => callback(null, html))
            .catch(err => callback(err));
    } catch (err) {
        callback(err);
    }
}

module.exports = ejsEngine;