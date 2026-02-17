/* UTTAMHUB - Main Logic Script */

let cart = JSON.parse(localStorage.getItem('SHOP_CART')) || [];

// 1. Initial Data check
function initData() {
    if (window.allProducts && window.allProducts.length > 0) {
        console.log("Database detected. Initializing UI...");
        // Signal for other scripts (resin.js, clock.js, etc.)
        window.dispatchEvent(new Event('db_ready'));
    } else {
        console.warn("Waiting for database.js to load...");
    }
}

// 2. Global helper to find products
window.getProductById = function(id) {
    return (window.allProducts || []).find(product => product.id === id);
};

// 3. Sidebar and Menu Logic
function toggleMenu() {
    const side = document.getElementById('side-panel');
    const overlay = document.getElementById('menu-overlay');
    if(side) side.classList.toggle('active');
    if(overlay) overlay.classList.toggle('active');
    document.body.style.overflow = (side && side.classList.contains('active')) ? 'hidden' : 'auto';
}

function syncSideMenu() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    const sidePanelLinks = document.getElementById('side-panel-links');
    if(!navPlaceholder || !sidePanelLinks) return;
    
    const checkNav = setInterval(() => {
        const cards = navPlaceholder.querySelectorAll('.card');
        if (cards.length > 0) {
            sidePanelLinks.innerHTML = "";
            cards.forEach(card => {
                const originalLink = card.querySelector('a');
                const title = card.querySelector('h3').innerText;
                const iconClass = card.querySelector('i').className;
                const newLink = document.createElement('a');
                newLink.href = originalLink.getAttribute('href');
                newLink.innerHTML = `<i class="${iconClass}"></i> ${title}`;
                newLink.onclick = () => toggleMenu();
                sidePanelLinks.appendChild(newLink);
            });
            clearInterval(checkNav);
        }
    }, 500);
}

// Start Engine
window.addEventListener('DOMContentLoaded', () => {
    initData();
    syncSideMenu();
});