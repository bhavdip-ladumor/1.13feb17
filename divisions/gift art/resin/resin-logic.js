// Example data for resin-db.js
const COSMOS_PRODUCTS = [
    { title: "Nebula Wall Clock", desc: "Hand-poured galaxy swirls with gold leaf.", icon: "fa-clock" },
    { title: "Deep Sea Coasters", desc: "Set of 4 ocean-themed resin coasters.", icon: "fa-circle" },
    { title: "Crystal Jewelry Tray", desc: "Elegant marble finish with glitter inlay.", icon: "fa-gem" },
    { title: "Custom Alphabet Key", desc: "Personalized floral resin keychains.", icon: "fa-key" }
];

function loadCosmos() {
    const grid = document.getElementById('resin-grid');
    grid.innerHTML = "";
    
    COSMOS_PRODUCTS.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="img-box">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="card-info">
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadCosmos);