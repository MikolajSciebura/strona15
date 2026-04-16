/**
 * DAWDAN-CARS - Main Script
 * Handles Navigation, Forms, Custom Slider and Custom Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.overlay');
    const header = document.querySelector('header');

    if (menuToggle && nav && overlay) {
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

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // --- Valuation Form handling ---
    const valuationForm = document.getElementById('valuation-form');
    const fileInput = document.getElementById('car-photos');
    const previewContainer = document.getElementById('file-preview-container');

    if (valuationForm) {
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
                const res = await fetch('send.php', {
                    method: 'POST',
                    body: formData
                });
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

    // --- Contact Form handling ---
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
                const res = await fetch('send.php', {
                    method: 'POST',
                    body: formData
                });
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

    // --- Smooth Scrolling for anchor links ---
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

                if (nav && nav.classList.contains('active')) {
                    menuToggle.click();
                }
            }
        });
    });

    // --- Header Scroll Effect (Performance Optimized) ---
    let headerScrollTimeout;
    let isScrolled = false;

    window.addEventListener('scroll', () => {
        if (headerScrollTimeout) return;
        headerScrollTimeout = requestAnimationFrame(() => {
            const scrollY = window.pageYOffset;
            if (scrollY > 50 && !isScrolled) {
                header.classList.add('scrolled');
                isScrolled = true;
            } else if (scrollY <= 50 && isScrolled) {
                header.classList.remove('scrolled');
                isScrolled = false;
            }
            headerScrollTimeout = null;
        });
    }, {
        passive: true
    });

    // --- Initialize Components ---
    initCustomSlider('.testimonials-slider');
    initCustomSlider(".buys-slider");
    initCustomAOS();
});

/**
 * Custom Lightweight Slider
 */
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
    let itemsInView = 1;
    let maxIndex = 0;
    let itemWidth = 0;
    let itemOffsets = [];

    function updateSliderMetrics() {
        if (items.length === 0) return;
        itemWidth = items[0].offsetWidth;
        if (itemWidth === 0) return; // Not visible yet
        itemsInView = Math.round(track.offsetWidth / itemWidth);
        maxIndex = Math.max(0, items.length - itemsInView);
        itemOffsets = Array.from(items).map(item => item.offsetLeft);
    }

    function createPagination() {
        if (!pagination) return;
        pagination.innerHTML = '';
        const dotsCount = maxIndex + 1;
        for (let i = 0; i < dotsCount; i++) {
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
        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;

        currentIndex = index;
        const scrollAmount = itemOffsets[currentIndex];
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

    // Update active dot on manual scroll
    let scrollTimeout;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (itemWidth === 0) return;
            const index = Math.round(track.scrollLeft / itemWidth);
            const newIndex = Math.min(index, maxIndex);
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                updatePagination(currentIndex);
            }
        }, 100);
    }, {
        passive: true
    });

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            scrollTo(currentIndex + 1);
        }, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Initial init with a small delay to ensure layout is calculated
    const initSlider = () => {
        updateSliderMetrics();
        if (itemWidth > 0) {
            createPagination();
            startAutoplay();
        } else {
            // Retry if layout not ready
            requestAnimationFrame(initSlider);
        }
    };
    requestAnimationFrame(initSlider);

    // Responsive updates
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateSliderMetrics();
            createPagination();
            scrollTo(currentIndex);
        }, 200);
    });

    // Pause on interaction
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', stopAutoplay, {
        passive: true
    });
    slider.addEventListener('touchend', startAutoplay, {
        passive: true
    });
}

/**
 * Custom Animation Triggers (AOS replacement)
 */
function initCustomAOS() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.getAttribute('data-aos-delay')) || 0;
                if (delay > 0) {
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);
                } else {
                    entry.target.classList.add('aos-animate');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos-custom]').forEach(el => {
        observer.observe(el);
    });
}

// Lazy load critical styles helper (if needed)
(function () {
    window.addEventListener('load', () => {
        const links = document.querySelectorAll('link[media="print"]');
        links.forEach(link => {
            link.media = 'all';
        });
    });
})();