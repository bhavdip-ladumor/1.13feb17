/**
 * PROMO SLIDER 2: MANUAL SNAP CAROUSEL
 * Uses the same CSS classes but different scroll logic.
 */
function initPromoSlider2() {
    const track = document.getElementById('promo-track-2');
    const viewport = document.querySelector('.promo-viewport-2');
    
    if (!track || !viewport || track.dataset.loaded === "true") return;

    // Use different IDs for this section (e.g., your next set of products)
    const promoIDs = ["7", "8", "3", "10", "2", "1"]; 

   const buildSlider = () => {
    const products = promoIDs
        .map(id => window.getProductById(id))
        .filter(p => p !== undefined);

    if (products.length === 0) return;

    track.innerHTML = products.map(product => `
        <div class="promo-card">
            <a href="product.html?id=${product.id}" class="promo-image-wrapper">
                <img src="${product.img1 || 'assets/broken-image.png'}" 
                     alt="${product.name}" 
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Broken+Link';">
            </a>
            <div class="promo-info">
                <h5 class="promo-title">${product.name}</h5>
            </div>
        </div>
        `).join(''); 
        
        track.dataset.loaded = "true";
        // Disable the auto-animation for this specific version
        track.style.animation = "none"; 
        applySnapLogic(viewport);
    };

    function applySnapLogic(view) {
        // Enable CSS Scroll Snapping dynamically
        view.style.scrollSnapType = "x mandatory";
        const cards = view.querySelectorAll('.promo-card');
        cards.forEach(card => {
            card.style.scrollSnapAlign = "center";
        });
    }

    if (window.allProducts && window.allProducts.length > 0) {
        buildSlider();
    } else {
        window.addEventListener('db_ready', buildSlider, { once: true });
    }
}

initPromoSlider2();