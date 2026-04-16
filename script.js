document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.overlay');

    if (menuToggle && nav && overlay) {
        const header = document.querySelector('header');
        const toggleMenu = () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            if (header) header.classList.toggle('menu-open');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : 'auto';
        };

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        overlay.addEventListener('click', toggleMenu);

        // Close menu on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

// 📌 Wycena auta
const valuationForm = document.getElementById('valuation-form');
const fileInput = document.getElementById('car-photos');
const previewContainer = document.getElementById('file-preview-container');

if (valuationForm) {
    // 📸 Podgląd zdjęć
    fileInput.addEventListener('change', () => {
        previewContainer.innerHTML = '';
        Array.from(fileInput.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = "100px";
                    img.style.borderRadius = "5px";
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // 🖼️ Kompresja zdjęć
    async function compressImage(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.7);
                };
            };
            reader.readAsDataURL(file);
        });
    }

    // 🚀 Submit wyceny
    valuationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = valuationForm.querySelector('.btn-submit');
        const msgDiv = valuationForm.querySelector('#form-message');

        btn.disabled = true;
        btn.textContent = 'Wysyłanie...';
        msgDiv.textContent = '';
        msgDiv.className = 'form-message';

        const formData = new FormData();
        formData.append('form-type', 'valuation');
        formData.append('brand-model', valuationForm['brand-model'].value);
        formData.append('year', valuationForm['year'].value);
        formData.append('mileage', valuationForm['mileage'].value);
        formData.append('engine', valuationForm['engine'].value);
        formData.append('fuel', valuationForm['fuel'].value);
        formData.append('gearbox', valuationForm['gearbox'].value);
        formData.append('damaged', valuationForm['damaged'].checked ? 'Tak' : 'Nie');
        formData.append('description', valuationForm['description'].value);
        formData.append('phone', valuationForm['phone'].value);
        formData.append('website', valuationForm['website'].value);

        const files = fileInput.files;
        for (let file of files) {
            const compressed = await compressImage(file);
            formData.append('photos[]', compressed, file.name);
        }

        try {
            const res = await fetch('send.php', { method: 'POST', body: formData });
            const text = await res.text();
            if (text === "OK") {
                msgDiv.textContent = '✅ Wysłano pomyślnie!';
                msgDiv.classList.add('success');
                valuationForm.reset();
                previewContainer.innerHTML = '';
            } else {
                msgDiv.textContent = '❌ ' + text;
                msgDiv.classList.add('error');
            }
        } catch {
            msgDiv.textContent = '❌ Błąd połączenia';
            msgDiv.classList.add('error');
        }

        btn.disabled = false;
        btn.textContent = 'WYŚLIJ WYCENĘ';
    });
}

// 📌 Formularz kontaktowy
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn-submit');
        const msgDiv = contactForm.querySelector('#form-message');

        btn.disabled = true;
        btn.textContent = 'Wysyłanie...';
        msgDiv.textContent = '';
        msgDiv.className = 'form-message';

        const formData = new FormData(contactForm);

        try {
            const res = await fetch('send.php', { method: 'POST', body: formData });
            const text = await res.text();
            if (text === "OK") {
                msgDiv.textContent = '✅ Wiadomość wysłana!';
                msgDiv.classList.add('success');
                contactForm.reset();
            } else {
                msgDiv.textContent = '❌ ' + text;
                msgDiv.classList.add('error');
            }
        } catch {
            msgDiv.textContent = '❌ Błąd połączenia';
            msgDiv.classList.add('error');
        }

        btn.disabled = false;
        btn.textContent = 'WYŚLIJ WIADOMOŚĆ';
    });
}


    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (nav && nav.classList.contains('active')) {
                    menuToggle.click();
                }
            }
        });
    });

    // Add scroll effect to header with throttling
    let headerScrollTimeout;
    window.addEventListener('scroll', () => {
        if (headerScrollTimeout) return;
        headerScrollTimeout = requestAnimationFrame(() => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            headerScrollTimeout = null;
        });
    }, { passive: true });
});

// Custom Slider Logic
function initCustomSlider(sliderSelector) {
    const slider = document.querySelector(sliderSelector);
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const items = slider.querySelectorAll('.slider-item');
    const pagination = slider.querySelector('.slider-pagination');
    const prevBtn = slider.querySelector('.slider-prev');
    const nextBtn = slider.querySelector('.slider-next');

    if (!track || items.length === 0) return;

    let currentIndex = 0;
    let autoplayInterval;

    function getItemsInView() {
        return Math.round(track.offsetWidth / items[0].offsetWidth);
    }

    function getMaxIndex() {
        return Math.max(0, items.length - getItemsInView());
    }

    // Create dots
    function createPagination() {
        if (!pagination) return;
        pagination.innerHTML = '';
        const maxIndex = getMaxIndex();
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                stopAutoplay();
                scrollTo(i);
                startAutoplay();
            });
            pagination.appendChild(dot);
        }
    }

    function updatePagination(index) {
        if (!pagination) return;
        const dots = pagination.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function scrollTo(index) {
        const maxIndex = getMaxIndex();
        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;

        currentIndex = index;
        const scrollAmount = items[currentIndex].offsetLeft;
        track.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
        updatePagination(currentIndex);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            scrollTo(currentIndex - 1);
            startAutoplay();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            scrollTo(currentIndex + 1);
            startAutoplay();
        });
    }

    // Update index on scroll
    let scrollTimeout;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const index = Math.round(track.scrollLeft / items[0].offsetWidth);
            const maxIndex = getMaxIndex();
            const newIndex = Math.min(index, maxIndex);
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                updatePagination(currentIndex);
            }
        }, 100);
    }, { passive: true });

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            scrollTo(currentIndex + 1);
        }, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    createPagination();
    startAutoplay();

    window.addEventListener('resize', () => {
        createPagination();
        scrollTo(currentIndex);
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', stopAutoplay, { passive: true });
    slider.addEventListener('touchend', startAutoplay, { passive: true });
}

// Custom Animation Logic (AOS replacement)
function initCustomAOS() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos-custom]').forEach(el => {
        observer.observe(el);
    });
}

// Initialize custom components
document.addEventListener('DOMContentLoaded', () => {
    initCustomSlider('.testimonials-slider');
    initCustomSlider(".buys-slider");
    initCustomAOS();
});

// Final optimizations
(function() {
    // Defer non-critical CSS
    window.addEventListener('load', () => {
        const links = document.querySelectorAll('link[media="print"]');
        links.forEach(link => {
            link.media = 'all';
        });
    });
})();
