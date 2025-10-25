const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let currentToken = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
    loadFeaturedProducts();
});

async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };

    if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return { success: true, data };
    } catch (error) {
        console.error('API call failed:', error);
        showNotification(error.message, 'error');
        return { success: false, error: error.message };
    }
}

async function checkAuthStatus() {
    console.log('Checking auth status...');

    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (currentToken) {
        console.log('User is logged in');

        try {
            const result = await apiCall('/users/me');
            if (result.success) {
                currentUser = result.data.data;
                if (userName) {
                    userName.textContent = currentUser.name;
                }
                console.log('👤 User data loaded:', currentUser.name);
            }
        } catch (error) {
            console.log('Failed to load user data, token might be invalid');
            logout();
            return;
        }

        // Update UI for logged in state
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    } else {
        console.log('User is logged out');

        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

async function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = '<div class="loading">Loading products...</div>';

    const result = await apiCall('/products?limit=6&page=1');

    if (result.success) {
        const products = result.data.data;
        if (products.length === 0) {
            featuredContainer.innerHTML = '<p>No products available</p>';
            return;
        }

        featuredContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.name.charAt(0).toUpperCase()}
                </div>
                <h3>${product.name}</h3>
                <p class="description">${product.description || 'No description available'}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="category">${product.category || 'Uncategorized'}</p>
                <p class="stock">${product.stock} in stock</p>
                <button class="btn btn-primary" onclick="addToCart('${product._id}')" ${product.stock === 0 ? 'disabled style="background: #bdc3c7;"' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `).join('');
    } else {
        featuredContainer.innerHTML = '<div class="error">Failed to load products</div>';
    }
}

async function addToCart(productId) {
    if (!currentToken) {
        showNotification('Please login to add items to cart', 'error');
        window.location.href = '/pages/login.html';
        return;
    }

    const result = await apiCall('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
            productId: productId,
            quantity: 1
        })
    });

    if (result.success) {
        showNotification('Product added to cart!', 'success');
        if (window.location.pathname.includes('cart.html')) {
            loadCart();
        }
    } else {
        showNotification('Failed to add product to cart: ' + (result.error || 'Unknown error'), 'error');
    }
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 6px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'error' ? 'background: #e74c3c;' : ''}
        ${type === 'success' ? 'background: #27ae60;' : ''}
        ${type === 'info' ? 'background: #3498db;' : ''}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function logout() {
    console.log('🔄 Logout function called');

    currentToken = null;
    currentUser = null;
    localStorage.removeItem('token');

    console.log('Token removed from localStorage');

    showNotification('Logged out successfully', 'success');

    checkAuthStatus();

    setTimeout(() => {
        console.log('🔀 Redirecting to home page');
        window.location.href = '/';
    }, 1000);
}

function setupLogoutListeners() {
    const logoutButtons = document.querySelectorAll('#logoutBtn, [onclick*="logout"], .logout-btn');

    logoutButtons.forEach(button => {
        button.removeAttribute('onclick');

        button.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('🖱️ Logout button clicked');
            logout();
        });
    });

    console.log(`🔧 Setup ${logoutButtons.length} logout button(s)`);
}

document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
    loadFeaturedProducts();
    setupLogoutListeners();

    setTimeout(setupLogoutListeners, 100);
});

window.logout = logout;
window.addToCart = addToCart;