document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.overlay') || document.createElement('div');

    if (!document.querySelector('.overlay')) {
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    if (menuToggle && nav && overlay) {
        const header = document.querySelector('header');
        const toggleMenu = () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            if (header) header.classList.toggle('menu-open');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
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

    // Header Scroll Effect
    const header = document.querySelector('header');
    let headerScrollTimeout;
    window.addEventListener('scroll', () => {
        if (headerScrollTimeout) return;
        headerScrollTimeout = requestAnimationFrame(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            headerScrollTimeout = null;
        });
    }, { passive: true });

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
            }
        });
    });

    // Native Animations (Intersection Observer)
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

    document.querySelectorAll('[data-aos-custom], [data-aos]').forEach(el => observer.observe(el));

    // Native Slider Track logic
    const tracks = document.querySelectorAll('.slider-track');
    tracks.forEach(track => {
        const container = track.parentElement;
        const prevBtn = container.querySelector('.slider-prev');
        const nextBtn = container.querySelector('.slider-next');
        const dots = container.querySelectorAll('.slider-dot');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const itemWidth = track.querySelector('.slider-item').offsetWidth;
                track.scrollBy({ left: -itemWidth, behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                const itemWidth = track.querySelector('.slider-item').offsetWidth;
                track.scrollBy({ left: itemWidth, behavior: 'smooth' });
            });
        }

        if (dots.length > 0) {
            const updateDots = () => {
                const index = Math.round(track.scrollLeft / track.offsetWidth);
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            };
            track.addEventListener('scroll', updateDots, { passive: true });

            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    track.scrollTo({
                        left: i * track.offsetWidth,
                        behavior: 'smooth'
                    });
                });
            });
        }
    });

    // 📌 Wycena auta (Lead Generation Logic Preserved)
    const valuationForm = document.getElementById('valuation-form');
    const fileInput = document.getElementById('car-photos');
    const previewContainer = document.getElementById('file-preview-container');

    if (valuationForm) {
        // 📸 Podgląd zdjęć
        if (fileInput && previewContainer) {
            fileInput.addEventListener('change', () => {
                previewContainer.innerHTML = '';
                Array.from(fileInput.files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const div = document.createElement('div');
                            div.className = 'preview-item';
                            div.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                            previewContainer.appendChild(div);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
        }

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

            const formData = new FormData(valuationForm);

            // Re-append files with compression
            const files = fileInput ? fileInput.files : [];
            if (files.length > 0) {
                formData.delete('photos[]');
                for (let file of files) {
                    const compressed = await compressImage(file);
                    formData.append('photos[]', compressed, file.name);
                }
            }

            try {
                const res = await fetch('send.php', { method: 'POST', body: formData });
                const text = await res.text();
                if (text === "OK") {
                    msgDiv.textContent = '✅ Wysłano pomyślnie!';
                    msgDiv.classList.add('success');
                    valuationForm.reset();
                    if (previewContainer) previewContainer.innerHTML = '';
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
});
