const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyhRUS6VfWR-5OMp07wLXBKSXWF_ojrrKBBo8HCek_6qgX9zC4bkklflC-vegUp0xC8zGZlvzsVh7I/pub?gid=1029231511&single=true&output=csv';

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('SHOP_CART')) || [];
const clean = (val) => val ? val.replace(/"/g, '').trim() : "";

// Your updated 33-column configuration


function mapRowToProduct(cols) {
    const rawTagweb = clean(cols[col.tagweb - 1]);
    const rawNames = clean(cols[col.attrName - 1]);
    const rawValues = clean(cols[col.attrValue - 1]);
    
    const namesArr = rawNames ? rawNames.split(',').map(s => s.trim()) : [];
    const valuesArr = rawValues ? rawValues.split(',').map(s => s.trim()) : [];

    const attributes = namesArr.map((name, index) => ({
        name: name,
        value: valuesArr[index] || "" 
    }));

    return {
        id: clean(cols[col.id - 1]),
        sku: clean(cols[col.skuId - 1]),
        name: clean(cols[col.name - 1]),
        category: clean(cols[col.category - 1]),
        subcategory: clean(cols[col.subcategory - 1]),
        tagweb: rawTagweb,
        brand: clean(cols[col.brand - 1]),
        attr1: namesArr[0] ? `${namesArr[0]}: ${valuesArr[0] || ''}` : "",
        attr2: namesArr[1] ? `${namesArr[1]}: ${valuesArr[1] || ''}` : "",
        attr3: namesArr[2] ? `${namesArr[2]}: ${valuesArr[2] || ''}` : "",
        tagline: clean(cols[col.tagline - 1]),
        description: clean(cols[col.description - 1]),
        details: clean(cols[col.otherDetails - 1]),
        mrp: clean(cols[col.mrp - 1]) || "0",
        sale: clean(cols[col.sellingPrice - 1]) || "0",
        stock: clean(cols[col.stock - 1]),
        minOrder: clean(cols[col.minOrder - 1]),
        isKit: clean(cols[col.isKit - 1]).toLowerCase() === 'true',
        kitName: clean(cols[col.kitName - 1]),
        kitComponents: clean(cols[col.kitComponents - 1]),
        keywords: clean(cols[col.keyword - 1]),
        trending: clean(cols[col.trending - 1]),
        delivery: clean(cols[col.delivery - 1]),
        images: [
            clean(cols[col.img1 - 1]), clean(cols[col.img2 - 1]), 
            clean(cols[col.img3 - 1]), clean(cols[col.img4 - 1]),
            clean(cols[col.img5 - 1]), clean(cols[col.img6 - 1]),
            clean(cols[col.img7 - 1]), clean(cols[col.img8 - 1]),
            clean(cols[col.img9 - 1]), clean(cols[col.img10 - 1])
        ].filter(img => img !== ""),
        vid: clean(cols[col.vid - 1]),
        hasOptions: attributes.length > 0
    };
}

async function loadProducts() {
    const CACHE_KEY = 'UTTAM_HUB_PRODUCTS';
    const CACHE_TIME_KEY = 'UTTAM_HUB_TIMESTAMP';
    const EXPIRE_TIME = 20 * 1000; 

    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && (now - cachedTime < EXPIRE_TIME)) {
            allProducts = JSON.parse(cachedData);
            renderSidePanelData(); 
            return;
        }

        const response = await fetch(CSV_URL);
        const data = await response.text();
        const rows = data.split(/\r?\n/).filter(row => row.trim() !== "");

        allProducts = []; 
        rows.slice(1).forEach(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (cols.length > 1) {
                allProducts.push(mapRowToProduct(cols));
            }
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify(allProducts));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());
        renderSidePanelData(); 

    } catch (error) {
        console.error("Error loading CSV:", error);
    }
}

function renderSidePanelData() {
    const partnersList = document.getElementById('side-partners-list');
    const categoryList = document.getElementById('side-category-list');
    if (!allProducts || allProducts.length === 0) return;

    let allTags = [];
    allProducts.forEach(p => {
        if (p.tagweb) {
            const splitTags = p.tagweb.split(',').map(tag => tag.trim());
            allTags = allTags.concat(splitTags);
        }
    });
    const uniquePartners = [...new Set(allTags)].filter(Boolean).sort();

    if (partnersList) {
        partnersList.innerHTML = uniquePartners.map(name => `
            <a href="#" class="side-partner-link" onclick="filterView('${name}', this); toggleMenu();">
                <i class="fas fa-handshake"></i> ${name}
            </a>
        `).join('');
    }

    let allCats = [];
    allProducts.forEach(p => {
        if (p.category) {
            const splitCats = p.category.split(',').map(cat => cat.trim());
            allCats = allCats.concat(splitCats);
        }
    });
    const uniqueCats = [...new Set(allCats)].filter(Boolean).sort();

    if (categoryList) {
        categoryList.innerHTML = `<a href="javascript:void(0)" class="side-cat-item active" onclick="filterView('all', this)">All Category</a>`;
        categoryList.innerHTML += uniqueCats.map(cat => `
            <a href="#" onclick="filterView('${cat}', this); toggleMenu();">${cat}</a>
        `).join('');
    }
}

function handleSearch() {
    const query = document.getElementById('db-search').value.toLowerCase();
    const filtered = allProducts.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.brand.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.subcategory.toLowerCase().includes(query) ||
        (item.keywords && item.keywords.toLowerCase().includes(query))
    );
    // Ensure you have a function to render these, like filterView's logic
    renderFilteredProducts(filtered); 
}

function toggleMenu() {
    const side = document.getElementById('side-panel');
    const overlay = document.getElementById('menu-overlay');
    if(side) side.classList.toggle('active');
    if(overlay) overlay.classList.toggle('active');
}

function syncSideMenu() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    const sidePanelLinks = document.getElementById('side-panel-links');
    if(!navPlaceholder || !sidePanelLinks) return;
    
    const checkNav = setInterval(() => {
        const links = navPlaceholder.querySelectorAll('.card');
        if (links.length > 0) {
            sidePanelLinks.innerHTML = "";
            links.forEach(card => {
                const originalLink = card.querySelector('a');
                const title = card.querySelector('h3').innerText;
                const iconClass = card.querySelector('i').className;
                const newLink = document.createElement('a');
                newLink.href = originalLink.getAttribute('href');
                newLink.innerHTML = `<i class="${iconClass}"></i> ${title}`;
                sidePanelLinks.appendChild(newLink);
            });
            clearInterval(checkNav);
        }
    }, 500);
}

// Slider Logic
let heroIndex = 0;
const heroSlides = document.querySelectorAll('.hero-ms-slide');
const heroDots = document.querySelectorAll('.hero-ms-dot');

function showHeroSlide(index) {
    if (heroSlides.length === 0) return;
    if (index >= heroSlides.length) heroIndex = 0;
    else if (index < 0) heroIndex = heroSlides.length - 1;
    else heroIndex = index;

    heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === heroIndex));
    heroDots.forEach((dot, i) => dot.classList.toggle('active', i === heroIndex));
}

function autoScrollHero() {
    heroIndex++;
    showHeroSlide(heroIndex);
}

let heroTimer = setInterval(autoScrollHero, 5000);

function currentHeroSlide(n) {
    clearInterval(heroTimer);
    showHeroSlide(n);
    heroTimer = setInterval(autoScrollHero, 5000);
}

// Global Back Behavior
window.addEventListener('popstate', function (event) {
    const productPage = document.getElementById('product-page');
    const mainView = document.getElementById('main-view');

    if (productPage && productPage.style.display === 'block') {
        productPage.style.display = 'none';
        if (mainView) mainView.style.display = 'block';
        window.scrollTo(0, 0);
    } 
    
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel && sidePanel.classList.contains('active')) toggleMenu();
    
    const kitModal = document.getElementById('kit-modal');
    if (kitModal && kitModal.style.display === 'flex') closeModal();
});

function filterView(categoryTag, btn) {
    if (btn) {
        document.querySelectorAll('.cat-btn, .side-cat-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const container = document.getElementById('product-grid');
    if (!container) return;
    container.innerHTML = ""; 

    let filtered = (categoryTag === 'all') ? allProducts : 
        allProducts.filter(p => p.tagweb.toLowerCase().includes(categoryTag.toLowerCase()));

    const grouped = filtered.reduce((acc, p) => {
        if (!acc[p.id]) acc[p.id] = [];
        acc[p.id].push(p);
        return acc;
    }, {});

    Object.values(grouped).forEach(variants => {
        const initial = variants[0];
        const hasVariants = variants.length > 1;
        const isKit = variants.some(v => v.isKit);
        const defaultText = [initial.attr1, initial.attr2, initial.attr3].filter(v => v).join(' / ');
        const defaultSpecs = hasVariants ? `<div class="variant-specs" id="specs-${initial.id}">Default: ${defaultText}</div>` : "";

        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${initial.id}`; 

        let buttonsHtml = "";
        if (isKit) buttonsHtml += `<button class="btn-kit" onclick="openKitModal('${initial.id}')">Buy Kit</button>`;
        if (hasVariants) {
            buttonsHtml += `<button class="btn-cart" style="background:#2d3436" onclick="openVariantSheet('${initial.id}')">Choose Options</button>`;
        } else {
            buttonsHtml += `<button class="btn-cart" onclick="addToCart('${initial.id}')">Add to Cart</button>`;
        }

        card.innerHTML = `
            <img src="${initial.images[0] || ''}" alt="${initial.name}" loading="lazy">
            <div class="card-content">
                <span class="category">${initial.category}</span> 
                <h3>${initial.name}</h3>
                ${defaultSpecs}
                <div class="price-row">
                    <span class="sell-price" id="price-${initial.id}">₹${initial.sale}</span>
                    <span class="mrp" id="mrp-${initial.id}">₹${initial.mrp}</span>
                </div>
                <div class="card-buttons">${buttonsHtml}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Variant Selection Logic
let selectedAttrs = {};

function openVariantSheet(productId) {
    const variants = allProducts.filter(p => p.id === productId);
    selectedAttrs = {}; 
    const sheet = document.getElementById('variant-bottom-sheet');
    const overlay = document.getElementById('variant-sheet-overlay');
    if(!sheet || !overlay) return;

    document.getElementById('sheet-product-name').innerText = variants[0].name;
    renderSheetControls(variants);
    sheet.classList.add('open');
    overlay.classList.add('open');
    updateSheetUI(variants);
}

function renderSheetControls(variants) {
    const content = document.getElementById('sheet-content');
    if(!content) return;
    content.innerHTML = "";
    const keys = ['attr1', 'attr2', 'attr3'];
    const labels = ['Size', 'Width', 'Shape'];

    keys.forEach((key, i) => {
        const values = [...new Set(variants.map(v => v[key]))].filter(v => v !== "");
        if (values.length === 0) return;

        const group = document.createElement('div');
        group.className = 'attr-group';
        group.innerHTML = `<small>${labels[i]}:</small><div class="btn-group-variants" id="group-${key}"></div>`;
        content.appendChild(group);

        values.forEach(val => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = val;
            btn.onclick = () => { 
                selectedAttrs[key] = (selectedAttrs[key] === val) ? null : val; 
                updateSheetUI(variants); 
            };
            btn.dataset.key = key;
            btn.dataset.val = val;
            group.querySelector('.btn-group-variants').appendChild(btn);
        });
    });
}

function updateSheetUI(variants) {
    const keys = ['attr1', 'attr2', 'attr3'];
    const productId = variants[0].id;
    
    document.querySelectorAll('.opt-btn').forEach(btn => {
        const key = btn.dataset.key;
        const val = btn.dataset.val;
        btn.classList.toggle('active', selectedAttrs[key] === val);
        const tempSelection = {...selectedAttrs};
        delete tempSelection[key];
        const possible = variants.some(v => v[key] === val && Object.entries(tempSelection).every(([k, vVal]) => !vVal || v[k] === vVal));
        btn.disabled = !possible;
    });

    const match = variants.find(v => keys.every(k => !selectedAttrs[k] || v[k] === selectedAttrs[k]));
    const addBtn = document.getElementById('sheet-add-btn');

    if (match) {
        document.getElementById('sheet-price').innerText = `₹${match.sale}`;
        const cardPrice = document.getElementById(`price-${productId}`);
        const cardMrp = document.getElementById(`mrp-${productId}`);
        const cardSpecs = document.getElementById(`specs-${productId}`);
        if (cardPrice) cardPrice.innerText = `₹${match.sale}`;
        if (cardMrp) cardMrp.innerText = `₹${match.mrp}`;
        if (cardSpecs) {
            const currentStr = [match.attr1, match.attr2, match.attr3].filter(v => v).join(' / ');
            cardSpecs.innerHTML = `Selected: <strong>${currentStr}</strong>`;
        }
    }

    const allPicked = keys.every(k => !variants.some(v => v[k] !== "") || selectedAttrs[k]);
    if (allPicked && match) {
        addBtn.disabled = false;
        addBtn.innerText = "Confirm Selection";
        addBtn.onclick = () => { addToCart(match.id, match); closeVariantSheet(); };
    } else {
        addBtn.disabled = true;
        addBtn.innerText = "Select All Options";
    }
}

function closeVariantSheet() {
    document.getElementById('variant-bottom-sheet').classList.remove('open');
    document.getElementById('variant-sheet-overlay').classList.remove('open');
}

// Cart Core Logic
function addToCart(id, specificProduct = null) {
    const product = specificProduct || allProducts.find(p => String(p.id) === String(id));
    if (!product) return;

    const uniqueId = `${product.id}_${product.attr1 || ''}_${product.attr2 || ''}_${product.attr3 || ''}`;
    const existing = cart.find(item => item.uniqueId === uniqueId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        const startQty = parseInt(product.minOrder) || 1;
        cart.push({ 
            uniqueId: uniqueId,
            id: product.id, 
            name: product.name,
            variant: [product.attr1, product.attr2, product.attr3].filter(v => v).join(' / '),
            image: product.images[0] || '', 
            sellPrice: Number(product.sale) || 0, 
            quantity: startQty 
        });
    }
    saveCart();
    if (document.getElementById('cart-sidebar')) toggleCart();
}

function saveCart() {
    localStorage.setItem('SHOP_CART', JSON.stringify(cart));
    renderCartUI();
    animateCartAction();
}

function updateQuantity(uniqueId, change) {
    const item = cart.find(p => p.uniqueId === uniqueId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(p => p.uniqueId !== uniqueId);
        saveCart();
    }
}

function clearCart() {
    if(confirm("Clear your cart?")) {
        cart = [];
        saveCart();
    }
}

function renderCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalDisplay = document.getElementById('cart-total-amount');
    const countBadge = document.getElementById('cart-count');
    if (!container || !totalDisplay || !countBadge) return;

    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.innerText = totalQty;

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">Your cart is empty</p>`;
        totalDisplay.innerText = "0";
        return;
    }

    let grandTotal = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = (Number(item.sellPrice) || 0) * item.quantity;
        grandTotal += itemTotal;
        return `
            <div class="cart-row" style="display:flex; align-items:center; gap:10px; padding:12px; border-bottom:1px solid #eee;">
                <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                <div style="flex:1;">
                    <p style="margin:0; font-weight:600; font-size:0.9rem;">${item.name}</p>
                    <small style="color:#777;">${item.variant || 'Standard'}</small>
                    <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
                        <button onclick="updateQuantity('${item.uniqueId}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.uniqueId}', 1)">+</button>
                    </div>
                </div>
                <div style="font-weight:bold; color:#B12704;">₹${itemTotal.toLocaleString('en-IN')}</div>
            </div>`;
    }).join('');
    totalDisplay.innerText = grandTotal.toLocaleString('en-IN');
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;
    let message = "*📦 NEW ORDER FROM UTTAM HUB*%0A--------------------------%0A";
    cart.forEach((item, index) => {
        message += `*${index + 1}. ${item.name}*%0A`;
        if(item.variant) message += `_Options: ${item.variant}_%0A`;
        message += `Qty: ${item.quantity} | Price: ₹${(item.sellPrice * item.quantity).toLocaleString('en-IN')}%0A%0A`;
    });
    const total = document.getElementById('cart-total-amount').innerText;
    message += `*TOTAL PAYABLE: ₹${total}*%0A--------------------------%0APlease process my order.`;
    window.open(`https://wa.me/919724362981?text=${message}`, '_blank');
}

function animateCartAction() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    badge.classList.remove('cart-bounce');
    void badge.offsetWidth; 
    badge.classList.add('cart-bounce');
}

// Kit Logic
function openKitModal(productId) {
    const product = allProducts.find(p => String(p.id) === String(productId));
    if (!product) return;
    const modal = document.getElementById('kit-modal');
    const kitContent = document.getElementById('kit-items-list');
    const footerLogic = document.getElementById('modal-footer-logic');
    const componentIDs = product.kitComponents.split(',').map(id => id.trim());
    const components = allProducts.filter(p => componentIDs.includes(String(p.id)));

    let totalMRP = 0, totalSell = 0;
    kitContent.innerHTML = components.map((item) => {
        totalMRP += Number(item.mrp) || 0;
        totalSell += Number(item.sale) || 0;
        return `<div class="kit-item"><img src="${item.images[0]}" class="kit-item-img"><div class="kit-item-details"><div class="kit-item-name">${item.name}</div><div class="kit-item-price"><span class="sell">₹${item.sale}</span><span class="mrp">₹${item.mrp}</span></div></div></div>`;
    }).join('');

    footerLogic.innerHTML = `<div class="kit-total-display"><p>Total Bundle MRP: <span class="mrp-total">₹${totalMRP}</span></p><p class="final-price">Kit Price: ₹${totalSell}</p></div><button class="btn-buy-bundle" onclick="addKitToCart('${product.id}'); closeModal();">ADD FULL BUNDLE TO CART</button>`;
    modal.style.display = 'flex';
}

function addKitToCart(id) {
    const product = allProducts.find(p => String(p.id) === String(id));
    if (!product || !product.kitComponents) return;
    const componentIDs = product.kitComponents.split(',').map(cid => cid.trim());
    const components = allProducts.filter(p => componentIDs.includes(String(p.id)));
    let kitTotal = components.reduce((sum, item) => sum + (Number(item.sale) || 0), 0);
    const kitBundleId = `kit_${id}`; 
    const existingKit = cart.find(item => item.id === kitBundleId);
    if (existingKit) existingKit.quantity += 1;
    else cart.push({ id: kitBundleId, name: `${product.kitName || product.name} Bundle`, image: product.images[0], sellPrice: kitTotal, quantity: 1 });
    saveCart();
}

function closeModal() { document.getElementById('kit-modal').style.display = 'none'; }

async function injectGlobalCart() {
    const placeholder = document.getElementById('cart-placeholder');
    if (!placeholder) return;
    const pathSegments = window.location.pathname.split('/').filter(p => p).length;
    let prefix = (pathSegments > 1) ? "../".repeat(pathSegments - 1) : "";
    try {
        const response = await fetch(prefix + 'cart-component.html');
        const html = await response.text();
        placeholder.innerHTML = html;
        renderCartUI(); 
    } catch (err) { console.error("Cart injection failed.", err); }
}

document.addEventListener('DOMContentLoaded', () => {
    injectGlobalCart();
    syncSideMenu();
    if (document.getElementById('product-grid')) loadProducts();
});

loadProducts();