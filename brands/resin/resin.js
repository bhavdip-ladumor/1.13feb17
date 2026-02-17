/**
 * RESIN COSMOS - BRAND LOGIC
 * Optimized for 33-column database structure
 * Located in: /brand/resin/resin.js
 */

const RESIN_CONFIG = {
    whatsapp: "919724362981",
    brandTag: "resin", // This matches the 'tagweb' column in your database
    containerId: "resin-grid",
    categoryId: "resin-categories"
};

// 1. INITIALIZER
function initResinPage() {
    // Check if data is already available
    if (window.allProducts && window.allProducts.length > 0) {
        startWorkflow();
    } else {
        // Wait for the 'db_ready' signal from script.js
        window.addEventListener('db_ready', () => {
            console.log("Resin Page: Database Ready");
            startWorkflow();
        });
    }
}

// 2. FILTERING LOGIC
function startWorkflow() {
    // Filters products where 'tagweb' contains "resin"
    const resinData = window.allProducts.filter(p => {
        if (!p.tagweb) return false;
        const tags = p.tagweb.toLowerCase().split(',').map(t => t.trim());
        return tags.includes(RESIN_CONFIG.brandTag);
    });

    if (resinData.length === 0) {
        const container = document.getElementById(RESIN_CONFIG.containerId);
        if(container) container.innerHTML = `<div style="text-align:center; padding:40px;">No products found in this category.</div>`;
        return;
    }

    renderResinCategories(resinData);
    renderResinGrid(resinData);
}

// 3. RENDER CATEGORY BUTTONS
function renderResinCategories(data) {
    const catBox = document.getElementById(RESIN_CONFIG.categoryId);
    if (!catBox) return;

    // Get unique categories from the filtered resin list
    const categories = ["All", ...new Set(data.map(p => p.category))].filter(Boolean);
    
    catBox.innerHTML = categories.map(cat => `
        <button class="cat-btn" onclick="filterByCat('${cat}')">${cat}</button>
    `).join('');
}

// 4. RENDER PRODUCT GRID
function renderResinGrid(data) {
    const grid = document.getElementById(RESIN_CONFIG.containerId);
    if (!grid) return;

    // Grouping by ID to avoid showing every single SKU/Variant on the main grid
    const seenIds = new Set();
    const displayData = data.filter(item => {
        if (seenIds.has(String(item.id))) return false;
        seenIds.add(String(item.id));
        return true;
    });

    grid.innerHTML = displayData.map(p => {
        // Check if this product has multiple variants (different SKUs with same ID)
        const variants = window.allProducts.filter(item => String(item.id) === String(p.id));
        
        // Use the first image from the array
        const displayImg = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400?text=No+Image';

        return `
        <div class="product-card">
            <div class="card-img-container" onclick="goToProduct('${p.id}')">
                <img src="${displayImg}" class="card-img" loading="lazy" onerror="this.src='https://via.placeholder.com/400?text=Image+Error'">
                ${p.stock === 'soldout' ? '<div class="sold-out-badge">Sold Out</div>' : ''}
            </div>
            <div class="card-info" onclick="goToProduct('${p.id}')">
                <div class="tiny-meta">${p.category}</div>
                <h4 class="card-title">${p.name}</h4>
                <div class="price-row">
                    <span class="sale-price">₹${p.sale}</span>
                    <span class="mrp-price">₹${p.mrp}</span>
                </div>
                ${variants.length > 1 ? `<div class="options-badge">More Options Available</div>` : '<div style="height:20px;"></div>'}
            </div>
            <div class="card-actions">
                <button class="cart-btn-sm" onclick="shareProduct(event, '${p.name}', '${p.id}')">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="buy-btn-sm" onclick="goToProduct('${p.id}')">
                    VIEW DETAILS
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// 5. INTERACTION & NAVIGATION
function filterByCat(category) {
    const allResin = window.allProducts.filter(p => {
        if (!p.tagweb) return false;
        const tags = p.tagweb.toLowerCase().split(',').map(t => t.trim());
        return tags.includes(RESIN_CONFIG.brandTag);
    });

    if (category === "All") {
        renderResinGrid(allResin);
    } else {
        const filtered = allResin.filter(p => p.category === category);
        renderResinGrid(filtered);
    }
    
    // Smooth scroll back to top of grid
    document.getElementById(RESIN_CONFIG.containerId).scrollIntoView({ behavior: 'smooth' });
}

function shareProduct(event, name, id) {
    event.stopPropagation();
    const shareUrl = `${window.location.origin}/product.html?id=${id}`;
    if (navigator.share) {
        navigator.share({ title: name, url: shareUrl });
    } else {
        navigator.clipboard.writeText(shareUrl);
        alert("Product link copied to clipboard!");
    }
}

/**
 * NAVIGATION LOGIC
 * Since resin.html is in /brand/resin/, we use ../../ to reach root product.html
 */
function goToProduct(id) {
    window.location.href = `../../product.html?id=${id}`;
}

// Start the engine
initResinPage();