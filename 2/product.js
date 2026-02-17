/**
 * PRODUCT PAGE ENGINE - product.js
 * Optimized for 33-column manual database.js
 * Feature: Priority Rendering (Main Product First, Similar Products Deferred)
 */

let currentProduct = null;
let allVariants = [];

async function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const skuId = params.get('sku');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    // Wait for Master Data (database.js -> script.js)
    if (window.allProducts && window.allProducts.length > 0) {
        renderProductDetails(productId, skuId);
    } else {
        window.addEventListener('db_ready', () => {
            renderProductDetails(productId, skuId);
        });
    }
}

function renderProductDetails(id, skuId) {
    // 1. Find all rows with same ID (Variants)
    allVariants = window.allProducts.filter(p => String(p.id) === String(id));
    
    if (allVariants.length === 0) {
        document.body.innerHTML = `<div style="text-align:center; padding:100px;"><h2>Product Not Found</h2><a href="index.html">Back to Home</a></div>`;
        return;
    }

    // 2. Select specific variant based on SKU or default to first
    currentProduct = skuId ? allVariants.find(v => v.sku === skuId) : allVariants[0];
    if (!currentProduct) currentProduct = allVariants[0];

    // --- PRIORITY 1: IMMEDIATE UI UPDATE (MAIN PRODUCT) ---
    updateMainProductUI();

    // --- PRIORITY 2: DEFERRED TASKS (SIMILAR PRODUCTS & BREADCRUMBS) ---
    // Using setTimeout to allow the browser to paint the main product first
    setTimeout(() => {
        renderSimilarByTag(currentProduct.tagweb, currentProduct.id);
        renderBreadcrumbs();
    }, 50);
}

/**
 * Handles all immediate text and image updates for the clicked product
 */
function updateMainProductUI() {
    document.title = `${currentProduct.name} | Uttamhub`;

    const setElementText = (elId, text) => {
        const el = document.getElementById(elId);
        if (el) el.innerText = text;
    };

    setElementText('product-brand', `By ${currentProduct.brand || 'Uttamhub'}`);
    setElementText('product-name', currentProduct.name);
    setElementText('product-description', currentProduct.description);
    setElementText('product-sale', `₹${currentProduct.sale}`);
    setElementText('product-mrp', `₹${currentProduct.mrp}`);
    
    // Price Discount Logic
    const discElement = document.getElementById('product-discount');
    if (discElement) {
        const s = parseFloat(currentProduct.sale);
        const m = parseFloat(currentProduct.mrp);
        if (m > s) {
            const disc = Math.round(((m - s) / m) * 100);
            discElement.innerText = `${disc}% OFF`;
            discElement.style.display = 'inline';
        } else {
            discElement.style.display = 'none';
        }
    }

    // Main Image
    const mainImg = document.getElementById('main-display-img');
    if(mainImg && currentProduct.images && currentProduct.images.length > 0) {
        mainImg.src = currentProduct.images[0];
    }
    
    // Thumbnail List
    const thumbList = document.getElementById('thumb-list');
    if(thumbList && currentProduct.images) {
        thumbList.innerHTML = currentProduct.images.map((img, idx) => `
            <img src="${img}" class="${idx === 0 ? 'active' : ''}" 
                 onclick="changeMainImage(this, '${img}')" 
                 onerror="this.style.display='none'">
        `).join('');
    }

    // Variant Selection Pills
    const attrBox = document.getElementById('attributes-container');
    if (attrBox) {
        if (allVariants.length > 1) {
            attrBox.innerHTML = `<h4>Select Option:</h4><div class="pill-flex">` + allVariants.map(v => {
                const isActive = v.sku === currentProduct.sku ? 'active-pill' : '';
                return `<span class="attr-pill ${isActive}" onclick="changeVariant('${v.id}', '${v.sku}')">
                    ${v.attrValue || v.sku}
                </span>`;
            }).join('') + `</div>`;
        } else {
            attrBox.innerHTML = currentProduct.attrValue ? `<h4>Option:</h4><span class="attr-pill">${currentProduct.attrValue}</span>` : '';
        }
    }
}

function renderBreadcrumbs() {
    const bc = document.getElementById('breadcrumb');
    if(bc) bc.innerHTML = `<a href="index.html">Home</a> / <span>${currentProduct.category}</span>`;
}

function changeVariant(id, sku) {
    const newUrl = `${window.location.pathname}?id=${id}&sku=${sku}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
    renderProductDetails(id, sku);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function changeMainImage(el, src) {
    const mainDisplay = document.getElementById('main-display-img');
    if (mainDisplay) mainDisplay.src = src;
    document.querySelectorAll('#thumb-list img').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

/**
 * Multi-tag similarity logic (Runs in background)
 */
function renderSimilarByTag(tagString, currentId) {
    const grid = document.getElementById('similar-products-grid');
    if (!grid) return;

    const currentTags = (tagString || "").split(',').map(t => t.trim().toLowerCase()).filter(t => t !== "");

    const seenIds = new Set();
    const similar = window.allProducts.filter(p => {
        if (String(p.id) === String(currentId)) return false; 

        const pTags = (p.tagweb || "").split(',').map(t => t.trim().toLowerCase());
        const isMatch = currentTags.some(tag => pTags.includes(tag));

        if (isMatch && !seenIds.has(p.id)) {
            seenIds.add(p.id);
            return true;
        }
        return false;
    });

    if (similar.length === 0) {
        const container = document.querySelector('.similar-products-container');
        if(container) container.style.display = 'none';
        return;
    }

    grid.innerHTML = similar.slice(0, 10).map(p => `
        <div class="product-card" onclick="goToProduct('${p.id}')">
            <div class="card-img-container">
                <img src="${p.images[0]}" class="card-img" loading="lazy">
            </div>
            <div class="card-info">
                <h4 class="card-title">${p.name}</h4>
                <div class="price-row">
                    <span class="sale-price">₹${p.sale}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function goToProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

function handleWhatsAppOrder() {
    const text = `Hi Uttamhub! I want to order:
Product: ${currentProduct.name}
SKU: ${currentProduct.sku}
Option: ${currentProduct.attrValue || 'Default'}
Price: ₹${currentProduct.sale}
Link: ${window.location.href}`;
    window.open(`https://wa.me/919724362981?text=${encodeURIComponent(text)}`, '_blank');
}

// Start Engine
initProductPage();