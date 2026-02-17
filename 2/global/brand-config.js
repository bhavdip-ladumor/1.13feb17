const BRAND_DATA = {
    "resin-cosmos": {
        name: "Resin Cosmos",
        logo: "assets/resin-logo.png",
        theme: "#00d4ff",
        whatsapp: "919999999999"
    },
    "acrylic-fortune": {
        name: "Acrylic Fortune",
        logo: "assets/acrylic-logo.png",
        theme: "#ff4b2b",
        whatsapp: "918888888888"
    },
    "wooden-beyond": {
        name: "Wooden Beyond",
        logo: "assets/wooden-logo.png",
        theme: "#8b4513",
        whatsapp: "917777777777"
    }
};

function getBrand() {
    // Detect brand from URL (?brand=resin-cosmos) or default to Resin
    const params = new URLSearchParams(window.location.search);
    const key = params.get('brand') || 'resin-cosmos';
    return BRAND_DATA[key] || BRAND_DATA['resin-cosmos'];
}