let heroIndex = 0;

function showHeroSlide(index) {
    const heroSlides = document.querySelectorAll('.hero-ms-slide');
    const heroDots = document.querySelectorAll('.hero-ms-dot');

    if (heroSlides.length === 0) return;

    if (index >= heroSlides.length) heroIndex = 0;
    else if (index < 0) heroIndex = heroSlides.length - 1;
    else heroIndex = index;

    // Apply Active Classes
    heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === heroIndex);
    });

    heroDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === heroIndex);
    });
}

function autoScrollHero() {
    heroIndex++;
    showHeroSlide(heroIndex);
}

let heroTimer = setInterval(autoScrollHero, 5000);

function currentHeroSlide(n) {
    clearInterval(heroTimer);
    showHeroSlide(n);
    heroTimer = setInterval(autoScrollHero, 2000);
}

/**
 * Click Action for Slider
 * Can be used to redirect or trigger search
 */
function handleHeroClick(tag) {
    console.log("Slider clicked for:", tag);
    // Future: window.location.href = `search.html?q=${tag}`;
}

// Ensure first slide is correct on boot
window.addEventListener('DOMContentLoaded', () => {
    showHeroSlide(0);
});