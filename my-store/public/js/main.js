/**
 * main.js - Клієнтський JavaScript
 * Demo: DOM events, form validation, fetch API
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 MyStore loaded');

    // Confirm delete
    initDeleteConfirmation();

    // Form validation
    initFormValidation();

    // Show/hide password
    initPasswordToggle();
});

/**
 * Підтвердження видалення
 */
function initDeleteConfirmation() {
    const deleteForms = document.querySelectorAll('form[action*="delete"]');

    deleteForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!confirm('Ви впевнені що хочете видалити цей товар?')) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Валідація форм
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const required = form.querySelectorAll('[required]');
            let valid = true;

            required.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = '#e74c3c';
                } else {
                    field.style.borderColor = '';
                }
            });

            // Перевірка паролів
            const password = form.querySelector('#password');
            const confirmPassword = form.querySelector('#confirmPassword');

            if (password && confirmPassword) {
                if (password.value !== confirmPassword.value) {
                    valid = false;
                    confirmPassword.style.borderColor = '#e74c3c';
                    alert('Паролі не співпадають!');
                }
            }

            if (!valid) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Show/hide password toggle
 */
function initPasswordToggle() {
    const passwordFields = document.querySelectorAll('input[type="password"]');

    passwordFields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.innerHTML = '👁️';
        toggle.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;';

        toggle.addEventListener('click', () => {
            if (field.type === 'password') {
                field.type = 'text';
                toggle.innerHTML = '🙈';
            } else {
                field.type = 'password';
                toggle.innerHTML = '👁️';
            }
        });

        wrapper.appendChild(toggle);
    });
}

// Глобальні функції для use elsewhere
window.MyStore = {
    confirmDelete: (name) => confirm(`Видалити "${name}"?`),
    formatPrice: (price) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(price)
};