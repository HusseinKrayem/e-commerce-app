let currentPage = 1;
let currentCategory = '';
let currentSearch = '';
let currentSort = 'name';


document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('products.html')) {
        loadProducts();
        setupEventListeners();
    }
});


function setupEventListeners() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function () {
            currentCategory = this.value;
            currentPage = 1;
            loadProducts();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', function () {
            currentSort = this.value;
            currentPage = 1;
            loadProducts();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
}


async function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    
    const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: currentSort
    });

    if (currentCategory) {
        params.append('category', currentCategory);
    }

    if (currentSearch) {
        params.append('search', currentSearch);
    }

    container.innerHTML = '<div class="loading">Loading products...</div>';

    const result = await apiCall(`/products?${params.toString()}`);

    if (result.success) {
        displayProducts(result.data.data, result.data.pagination);
    } else {
        container.innerHTML = '<div class="error">Failed to load products</div>';
    }
}


function displayProducts(products, pagination) {
    const container = document.getElementById('productsContainer');

    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="products-grid">
            ${products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        ${product.name.charAt(0).toUpperCase()}
                    </div>
                    <h3>${product.name}</h3>
                    <p class="description">${product.description || 'No description available'}</p>
                    <p class="price">$${product.price}</p>
                    <p class="category">${product.category}</p>
                    <p class="${product.stock > 0 ? 'stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small ${product.stock === 0 ? 'btn-disabled' : ''}" 
                                onclick="addToCart('${product._id}')" 
                                ${product.stock === 0 ? 'disabled' : ''}>
                            Add to Cart
                        </button>
                        <button class="btn btn-outline btn-small" onclick="viewProduct('${product._id}')">
                            View Details
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    displayPagination(pagination);
}


function displayPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!pagination || !paginationContainer) return;

    const { totalPages, currentPage: page, hasNextPage, hasPrevPage } = pagination;

    let paginationHTML = '';

    
    paginationHTML += `
        <button class="pagination-btn ${!hasPrevPage ? 'disabled' : ''}" 
                onclick="changePage(${page - 1})" 
                ${!hasPrevPage ? 'disabled' : ''}>
            Previous
        </button>
    `;

    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === page ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === page - 2 || i === page + 2) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
    }

    
    paginationHTML += `
        <button class="pagination-btn ${!hasNextPage ? 'disabled' : ''}" 
                onclick="changePage(${page + 1})" 
                ${!hasNextPage ? 'disabled' : ''}>
            Next
        </button>
    `;

    
    paginationHTML += `
        <span class="pagination-info">
            Page ${page} of ${totalPages} (${pagination.totalProducts} products)
        </span>
    `;

    paginationContainer.innerHTML = paginationHTML;
}


function changePage(page) {
    currentPage = page;
    loadProducts();
    
    document.getElementById('productsContainer').scrollIntoView({ behavior: 'smooth' });
}


function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
    }
}


function viewProduct(productId) {
    
    showNotification('Product details feature coming soon!', 'info');
}


window.changePage = changePage;
window.searchProducts = searchProducts;
window.viewProduct = viewProduct;