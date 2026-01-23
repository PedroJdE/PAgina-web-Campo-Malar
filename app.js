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


// Actualizar carrusel
function updateCarousel(newIndex) {
    carouselImages[currentIndex].classList.remove('active');
    carouselImages[currentIndex].classList.add('prev');

    currentIndex = newIndex;

    carouselImages[currentIndex].classList.add('active');

    setTimeout(() => {
        carouselImages.forEach(img => img.classList.remove('prev'));
    }, 1000);

    carouselContainer.style.backgroundImage = `url(${carouselImages[currentIndex].src})`;
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
    updateCarousel(0);
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

// Reordenar thumbnails
const thumbnailsItems = thumbnail.querySelectorAll('.item');
thumbnail.appendChild(thumbnailsItems[0]);

function showSlider(direction) {
    const sliderItems = sliderList.querySelectorAll('.item');
    const thumbItems = thumbnail.querySelectorAll('.item');

    if (direction === 'next') {
        sliderList.appendChild(sliderItems[0]);
        thumbnail.appendChild(thumbItems[0]);
        carousel2.classList.add('next');
    } else {
        sliderList.prepend(sliderItems[sliderItems.length - 1]);
        thumbnail.prepend(thumbItems[thumbItems.length - 1]);
        carousel2.classList.add('prev');
    }

    // limpiar clases de animación
    setTimeout(() => {
        carousel2.classList.remove('next', 'prev');
    }, 300); // mismo tiempo que tu animación CSS
}

// Eventos botones
if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => showSlider('next'));
    prevBtn.addEventListener('click', () => showSlider('prev'));
}
