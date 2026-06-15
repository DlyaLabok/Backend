/**
 * pug.config.js - Pug шаблонізатор
 * Демонструє: Pug/Jade templating, includes, layouts, loops, conditionals
 */

const pug = require('pug');
const path = require('path');

/**
 * Pug engine setup
 * Pug - традиційний вибір для Express (курс починає з Pug)
 */
function pugEngine(filePath, options, callback) {
    try {
        // Компілюємо Pug файл
        const compiled = pug.compileFile(filePath, {
            basedir: path.join(__dirname, '..', '..', 'views', 'pug'),
            pretty: process.env.NODE_ENV !== 'production'
        });

        // Рендеримо з locals
        const html = compiled(options);
        callback(null, html);
    } catch (err) {
        callback(err);
    }
}

/**
 * Pug helper functions
 */
const pugHelpers = {
    // Форматування ціни
    formatPrice: (price) => {
        return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH'
        }).format(price);
    },

    // Дата
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('uk-UA');
    },

    // Обрізка тексту
    truncate: (str, length = 100) => {
        if (str && str.length > length) {
            return str.substring(0, length) + '...';
        }
        return str;
    },

    // JSON stringify
    json: (obj) => {
        return JSON.stringify(obj);
    }
};

module.exports = pugEngine;
module.exports.helpers = pugHelpers;