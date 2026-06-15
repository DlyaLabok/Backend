/**
 * queryParser.js - Парсер querystring
 * Демонструє: querystring модуль (deprecated в нових версіях Node.js)
 *
 * Примітка: В сучасному Node.js (v10+) URLSearchParams
 * є стандартним способом роботи з query strings
 */

const url = require('url');

// ============================================
// Парсинг querystring
// ============================================

/**
 * Парсить рядок типу "name=John&age=30" в об'єкт
 */
function parse(queryString) {
    if (!queryString || typeof queryString !== 'string') {
        return {};
    }

    const result = {};

    // Розділяємо по &
    queryString.split('&').forEach(pair => {
        const [key, ...valueParts] = pair.split('=');
        if (key) {
            // Декодуємо URL компоненти
            const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
            const decodedValue = decodeURIComponent(
                valueParts.join('=').replace(/\+/g, ' ')
            );
            result[decodedKey] = decodedValue;
        }
    });

    return result;
}

/**
 * Перевірка чи рядок є querystring
 */
function isQueryString(str) {
    return str && str.includes('=');
}

// ============================================
// Демонстраційні функції
// ============================================

/**
 * Демо: різні способи парсингу
 */
function demo() {
    const queryString = 'name=John+Doe&age=30&city=Kyiv&skills=js,node,express';

    console.log('\n📝 Querystring демонстрація:');
    console.log('─'.repeat(50));

    // Спосіб 1: url.parse() - класичний
    console.log('\n1️⃣ url.parse() з true:');
    const parsed1 = url.parse('?' + queryString, true);
    console.log(parsed1.query);

    // Спосіб 2: URLSearchParams
    console.log('\n2️⃣ URLSearchParams:');
    const params = new URLSearchParams(queryString);
    console.log('name:', params.get('name'));
    console.log('age:', params.get('age'));
    console.log('skills:', params.get('skills'));

    // Спосіб 3: вручну
    console.log('\n3️⃣ Ручний парсинг:');
    console.log(parse(queryString));
}

/**
 * Парсинг URL з компонентами
 */
function parseUrl(fullUrl) {
    try {
        const parsed = url.parse(fullUrl, true);
        return {
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port,
            pathname: parsed.pathname,
            query: parsed.query,
            search: parsed.search,
            hash: parsed.hash,
            full: parsed.href
        };
    } catch (err) {
        return null;
    }
}

/**
 * Збірка querystring з об'єкта
 */
function stringify(params) {
    return Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(value);
            return `${encodedKey}=${encodedValue}`;
        })
        .join('&');
}

// ============================================
// Експорт
// ============================================

module.exports = {
    parse,
    isQueryString,
    parseUrl,
    stringify,
    demo
};