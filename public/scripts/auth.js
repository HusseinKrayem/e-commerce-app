const API_BASE = 'http://localhost:3000/api';


document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }


    checkExistingAuth();
});


function checkExistingAuth() {
    const token = localStorage.getItem('token');
    if (token && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        window.location.href = '/';
    }
}


async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');

    const email = form.email.value;
    const password = form.password.value;


    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/authMiddleware/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem('token', data.data.token);
            showMessage('Login successful! Redirecting...', 'success');


            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {

            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {

        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
}


async function handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');

    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;


    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }


    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/authMiddleware/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {

            showMessage('Account created successfully! Redirecting to login...', 'success');


            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 2000);
        } else {

            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {

        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
}


function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.innerHTML = `
        <div class="${type === 'error' ? 'error' : 'success'}" style="margin: 0;">
            ${message}
        </div>
    `;
}


window.handleLogin = handleLogin;
window.handleRegister = handleRegister;