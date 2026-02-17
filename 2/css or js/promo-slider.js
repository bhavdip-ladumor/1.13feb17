/**
 * PROMO SLIDER ENGINE - promo-slider.js
 * Optimized for 33-column database.js structure
 */

function initPromoSlider() {
    const track = document.getElementById('promo-track');
    const viewport = document.querySelector('.promo-viewport');
    
    // Safety check: Prevent building twice
    if (!track || !viewport || track.dataset.loaded === "true") return;

    // The IDs from your database Column 1 you want to show in the slider
    const promoIDs = ["1", "2", "3", "4", "5", "6"]; 

    const buildSlider = () => {
        // Find products directly from window.allProducts using String comparison
        const products = promoIDs
            .map(id => window.allProducts.find(p => String(p.id) === String(id)))
            .filter(p => p !== undefined);

        if (products.length === 0) {
            console.warn("Promo Slider: No matching products found in database.");
            return;
        }

        // FIXED: Using product.images[0] to match your new database structure
        track.innerHTML = products.map(product => `
            <div class="promo-card">
                <a href="product.html?id=${product.id}" class="promo-image-wrapper">
                    <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/150?text=No+Image'}" 
                         alt="${product.name}" 
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Broken+Link';">
                </a>
                <div class="promo-info">
                    <h5 class="promo-title">${product.name}</h5>
                </div>
            </div>
        `).join('').repeat(3); // Repeat for infinite loop effect
        
        track.dataset.loaded = "true"; 
        setupInteractions(track, viewport);
    };

    // Listen for database ready signal
    window.addEventListener('db_ready', () => {
        track.dataset.loaded = "false"; 
        buildSlider();
    });

    // Initial check if data loaded before script
    if (window.allProducts && window.allProducts.length > 0) {
        buildSlider();
    }
}

function setupInteractions(el, view) {
    let isDown = false;
    let startX;
    let scrollLeft;

    const pause = () => el.style.animationPlayState = 'paused';
    const resume = () => {
        setTimeout(() => {
            if (!isDown) el.style.animationPlayState = 'running';
        }, 2000);
    };

    view.addEventListener('mousedown', (e) => {
        isDown = true;
        pause();
        startX = e.pageX - view.offsetLeft;
        scrollLeft = view.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
        isDown = false;
        resume();
    });

    view.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - view.offsetLeft;
        const walk = (x - startX) * 2;
        view.scrollLeft = scrollLeft - walk;
    });

    view.addEventListener('touchstart', pause, {passive: true});
    view.addEventListener('touchend', resume, {passive: true});
}

// Start Slider logic
initPromoSlider();