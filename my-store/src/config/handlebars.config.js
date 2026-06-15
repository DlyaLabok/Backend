/**
 * handlebars.config.js - Handlebars шаблонізатор
 * Демонструє: Handlebars, layouts, partials, helpers
 */

const { engine } = require('express-handlebars');
const path = require('path');

/**
 * Handlebars engine setup
 * Handlebars - mustache-like синтаксис, потужні helpers
 */
const hbs = engine({
    extname: '.handlebars',
    layoutsDir: path.join(__dirname, '..', '..', 'views', 'handlebars', 'layouts'),
    partialsDir: path.join(__dirname, '..', '..', 'views', 'handlebars', 'partials'),
    defaultLayout: 'main',
    helpers: {
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

        // ifEquals
        ifEquals: (arg1, arg2, options) => {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },

        // eachWithIndex
        eachWithIndex: (items, options) => {
            let out = '';
            for (let i = 0; i < items.length; i++) {
                out += options.fn(items[i], {
                    data: { index: i + 1 }
                });
            }
            return out;
        },

        // truncate
        truncate: (str, length) => {
            if (str && str.length > length) {
                return str.substring(0, length) + '...';
            }
            return str;
        },

        // json
        json: (obj) => {
            return JSON.stringify(obj);
        }
    }
});

module.exports = { engine: hbs };