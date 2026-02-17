const GIFT_STORES = [
    {
        title: "The 3D Miniature Box",
        desc: "Handcrafted 3D Memories",
        icon: "fa-cube",
        ready: false,
        color: "#fdf2f2"
    },
    {
        title: "Polaroid Love",
        desc: "Vintage Polaroid Sets",
        icon: "fa-camera",
        ready: false,
        color: "#f0f7ff"
    },
    {
        title: "Aesthetic Hampers",
        desc: "Curated Luxury Gifts",
        icon: "fa-gift",
        ready: false,
        color: "#fff9f0"
    },
    {
        title: "Music Keychains",
        desc: "Scannable Spotify Codes",
        icon: "fa-music",
        ready: false,
        color: "#f3f0ff"
    }
];

function renderGifts() {
    const grid = document.getElementById('gift-grid');
    GIFT_STORES.forEach(store => {
        const card = document.createElement('div');
        card.className = 'gift-card';
        card.innerHTML = `
            <div class="image-wrapper" style="background: ${store.color}">
                <div class="verified-badge">VERIFIED VENDOR</div>
                <i class="fas ${store.icon}"></i>
            </div>
            <div class="card-info">
                <h3>${store.title}</h3>
                <p>${store.desc}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (!store.ready) {
                // Trigger your coming soon container
                alert("Working with vendor to verify products... Coming Soon!");
            }
        });
        
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', renderGifts);