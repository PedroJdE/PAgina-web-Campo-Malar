/* =========================
   MENU MOBILE (OVERLAY)
========================= */

function openNav() {
    document.getElementById("mobile-menu").style.width = "100%";
}

function closeNav() {
    document.getElementById("mobile-menu").style.width = "0%";
}

// Cerrar menú al hacer click en enlaces
document.querySelectorAll('.overlay-content a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        closeNav();
    });
});


/* =========================
   CAROUSEL 1 (SIMPLE)
========================= */

const carouselImages = document.querySelectorAll('.carousel img');
const carouselContainer = document.querySelector('.carousel-container');
const bgCurrent = document.querySelector('.bg-current');
const bgNext = document.querySelector('.bg-next');

let currentIndex = 0;
let intervalId = null;

// Detectar orientación de imágenes (cuando cargan)
carouselImages.forEach(img => {

    function checkOrientation() {
        if (img.naturalHeight > img.naturalWidth) {
            img.classList.add('vertical');
        } else {
            img.classList.add('horizontal');
        }
    }

    if (img.complete) {
        // imagen ya cargada
        checkOrientation();
    } else {
        // imagen aún no cargada
        img.onload = checkOrientation;
    }
});

// Preload images
carouselImages.forEach(img => {
    const preloadImg = new Image();
    preloadImg.src = img.src;
});

// Preload carousel2 images
const carousel2Images = document.querySelectorAll('.carousel2 img');
carousel2Images.forEach(img => {
    const preloadImg = new Image();
    preloadImg.src = img.src;
});


// Actualizar carrusel
function updateCarousel(newIndex) {
    carouselImages[currentIndex].classList.remove('active');
    carouselImages[currentIndex].classList.add('prev');

    currentIndex = newIndex;

    carouselImages[currentIndex].classList.add('active');

    // Update background with smooth transition
    bgNext.style.backgroundImage = `url(${carouselImages[currentIndex].src})`;
    bgNext.style.opacity = '1';
    // keep bgCurrent visible so we never flash to body background
    // bgCurrent.style.opacity = '0';

    // After transition, update current background and hide the overlay
    setTimeout(() => {
        bgCurrent.style.backgroundImage = bgNext.style.backgroundImage;
        // restore bgNext to transparent so it can be used for the next fade
        bgNext.style.opacity = '0';
    }, 1000);

    setTimeout(() => {
        carouselImages.forEach(img => img.classList.remove('prev'));
    }, 1000);
}

// Autoplay
function startAutoPlay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        const nextIndex = (currentIndex + 1) % carouselImages.length;
        updateCarousel(nextIndex);
    }, 3000);
}

// Inicializar
if (carouselImages.length > 0) {
    // set first slide without triggering the transition effect
    carouselImages[0].classList.add('active');
    bgCurrent.style.backgroundImage = `url(${carouselImages[0].src})`;
    bgCurrent.style.opacity = '1';
    startAutoPlay();
}

/* =========================
   CAROUSEL 2 (MANUAL)
========================= */

const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

const carousel2 = document.querySelector('.carousel2');
const sliderList = carousel2.querySelector('.list');
const thumbnail = carousel2.querySelector('.thumbnail');
const bgCurrent2 = carousel2.querySelector('.bg-current');
const bgNext2 = carousel2.querySelector('.bg-next');

// Reordenar thumbnails
const thumbnailsItems = thumbnail.querySelectorAll('.item');
thumbnail.appendChild(thumbnailsItems[0]);

// low-power detection removed per user request

function showSlider(direction) {
    // prevent double triggers while animating
    if (carousel2.classList.contains('animating')) return;
    carousel2.classList.add('animating');

    // Reorder DOM first so CSS :nth-child selectors target the intended items
    if (direction === 'next') {
        const sliderItems = sliderList.querySelectorAll('.item');
        const thumbItems = thumbnail.querySelectorAll('.item');
        if (sliderItems.length) sliderList.appendChild(sliderItems[0]);
        if (thumbItems.length) thumbnail.appendChild(thumbItems[0]);
    } else {
        const sliderItems = sliderList.querySelectorAll('.item');
        const thumbItems = thumbnail.querySelectorAll('.item');
        if (sliderItems.length) sliderList.prepend(sliderItems[sliderItems.length - 1]);
        if (thumbItems.length) thumbnail.prepend(thumbItems[thumbItems.length - 1]);
    }

    // force a style/layout flush so the browser acknowledges the new order
    // then add the class that triggers the animation (nth-child rules will match)
    void carousel2.offsetWidth;

    if (direction === 'next') {
        carousel2.classList.add('next');
    } else {
        carousel2.classList.add('prev');
    }

    // when animation ends, clear flags and classes
    const finish = () => {
        carousel2.classList.remove('next', 'prev', 'animating');
        // Update background
        const currentItem = carousel2.querySelector('.list .item:nth-child(1)');
        const currentImg = currentItem.querySelector('img');
        bgNext2.style.backgroundImage = `url(${currentImg.src})`;
        bgNext2.style.opacity = '1';
        bgCurrent2.style.opacity = '0';
        setTimeout(() => {
            bgCurrent2.style.backgroundImage = bgNext2.style.backgroundImage;
            bgCurrent2.style.opacity = '1';
            bgNext2.style.opacity = '0';
        }, 600);
    };

    const onAnimEnd = () => {
        finish();
        carousel2.removeEventListener('animationend', onAnimEnd);
        clearTimeout(fallback);
    };

    carousel2.addEventListener('animationend', onAnimEnd);

    // fallback in case animationend doesn't fire
    const fallback = setTimeout(() => {
        carousel2.removeEventListener('animationend', onAnimEnd);
        finish();
    }, 600);
}

// Eventos botones
if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => showSlider('next'));
    prevBtn.addEventListener('click', () => showSlider('prev'));
}

// Initialize background for carousel2
const initialItem = carousel2.querySelector('.list .item:nth-child(1)');
const initialImg = initialItem.querySelector('img');
bgCurrent2.style.backgroundImage = `url(${initialImg.src})`;
