/**
 * app.js - Клієнтський JavaScript
 * Демонстрація: fetch API, DOM маніпуляції
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 HTTP Server Demo loaded');

    // Оновлюємо час кожну секунду якщо є елемент .current-time
    updateTime();
    setInterval(updateTime, 1000);

    // Демо fetch запиту
    initFetchDemo();
});

/**
 * Оновлення часу
 */
function updateTime() {
    const timeElements = document.querySelectorAll('.current-time');
    if (timeElements.length > 0) {
        const now = new Date();
        timeElements.forEach(el => {
            el.textContent = now.toLocaleTimeString('uk-UA');
        });
    }
}

/**
 * Демо Fetch API
 */
async function initFetchDemo() {
    // Якщо ми на головній сторінці з API демо
    const apiDemo = document.getElementById('api-demo');
    if (apiDemo) {
        await fetchTime();
        await fetchUsers();
    }
}

/**
 * GET запит за часом
 */
async function fetchTime() {
    try {
        const response = await fetch('/time');
        const data = await response.json();

        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.innerHTML = `
                <p><strong>Локальний час:</strong> ${data.current}</p>
                <p><strong>ISO:</strong> ${data.iso}</p>
                <p><strong>Unix:</strong> ${data.unix}</p>
            `;
        }
    } catch (err) {
        console.error('Помилка отримання часу:', err);
    }
}

/**
 * GET запит за користувачами
 */
async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        const data = await response.json();

        const usersDisplay = document.getElementById('users-display');
        if (usersDisplay) {
            usersDisplay.innerHTML = data.users.map(user => `
                <li>
                    <strong>${user.name}</strong> (${user.email}) - ${user.role}
                </li>
            `).join('');
        }
    } catch (err) {
        console.error('Помилка отримання користувачів:', err);
    }
}

/**
 * POST запит
 */
async function postData(data) {
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    } catch (err) {
        console.error('Помилка POST:', err);
        throw err;
    }
}

/**
 * Формування URL з параметрами
 */
function buildQueryUrl(baseUrl, params) {
    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    return url.toString();
}

// Глобальні функції для HTML
window.fetchAPI = {
    time: fetchTime,
    users: fetchUsers,
    post: postData,
    buildUrl: buildQueryUrl
};