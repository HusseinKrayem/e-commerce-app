document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('orders.html')) {
        loadOrders();
        checkAuthStatus();
    }
});


async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    const emptyOrders = document.getElementById('emptyOrders');

    if (!currentToken) {
        container.innerHTML = `
            <div class="error" style="text-align: center; padding: 2rem;">
                <h3>Please login to view your orders</h3>
                <a href="/pages/login.html" class="btn btn-primary" style="margin-top: 1rem;">Login</a>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="loading">Loading your orders...</div>';
    emptyOrders.style.display = 'none';

    const result = await apiCall('/orders');

    if (result.success) {
        const orders = result.data.data;
        displayOrders(orders);
    } else {
        container.innerHTML = '<div class="error">Failed to load orders</div>';
    }
}


function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    const emptyOrders = document.getElementById('emptyOrders');

    if (orders.length === 0) {
        container.style.display = 'none';
        emptyOrders.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    emptyOrders.style.display = 'none';

    container.innerHTML = `
        <div class="orders-list">
            ${orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Order #${order._id.slice(-8).toUpperCase()}</div>
                            <div class="order-date">Placed on ${new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div class="order-status status-${order.status || 'pending'}">
                            ${order.status || 'pending'}
                        </div>
                    </div>
                    
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-info">
                                    <div class="item-name">${item.productId?.name || 'Product'}</div>
                                    <div class="item-quantity">Quantity: ${item.quantity}</div>
                                </div>
                                <div class="item-total">$${(item.productId?.price || 0) * item.quantity}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-total">
                        Total: $${order.totalAmount || order.items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.loadOrders = loadOrders;