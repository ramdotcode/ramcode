document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Elegant Reveal Animation on Scroll
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Check if the element has a staggered delay set
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('reveal-active');
                }, delay);
                
                // Stop observing once revealed for better performance
                observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Slight offset to feel more natural
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    // Apply to all elements with '.reveal' class
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Portfolio Slider Logic (Reflow-Free Version)
    const portoContainer = document.querySelector('#portfolio .overflow-x-auto');
    const nextBtn = document.getElementById('next-porto');
    const prevBtn = document.getElementById('prev-porto');

    if (portoContainer && nextBtn && prevBtn) {
        // PURE MEMORY STATE (Hapus interaksi DOM di logika utama)
        let currentState = {
            currentX: 0,
            scrollAmount: 0,
            maxScroll: 0,
            fullWidth: 0,
            isManualScrolling: false
        };

        const updateLayoutCache = () => {
            const firstCard = portoContainer.querySelector('.bento-block');
            const cw = portoContainer.clientWidth;
            const sw = portoContainer.scrollWidth;
            
            currentState.scrollAmount = firstCard ? firstCard.offsetWidth + 32 : 320;
            currentState.maxScroll = sw - cw;
            currentState.fullWidth = sw;
            currentState.currentX = portoContainer.scrollLeft;
        };

        updateLayoutCache();
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(() => updateLayoutCache()).observe(portoContainer);
        }

        // Sync local state dengan manual scroll user (Throttled)
        let syncRAF = null;
        portoContainer.addEventListener('scroll', () => {
            if (syncRAF) return;
            syncRAF = requestAnimationFrame(() => {
                currentState.currentX = portoContainer.scrollLeft;
                syncRAF = null;
            });
        }, { passive: true });

        const moveSlider = (direction) => {
            if (direction === 'next') {
                if (currentState.currentX >= currentState.maxScroll - 10) currentState.currentX = 0;
                else currentState.currentX += currentState.scrollAmount;
            } else {
                if (currentState.currentX <= 10) currentState.currentX = currentState.maxScroll;
                else currentState.currentX -= currentState.scrollAmount;
            }
            
            portoContainer.scrollTo({ left: currentState.currentX, behavior: 'smooth' });
        };

        let autoSlideInterval;
        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => moveSlider('next'), 4000);
        };
        const stopAutoSlide = () => { if (autoSlideInterval) clearInterval(autoSlideInterval); };

        nextBtn.addEventListener('click', () => { stopAutoSlide(); moveSlider('next'); startAutoSlide(); });
        prevBtn.addEventListener('click', () => { stopAutoSlide(); moveSlider('prev'); startAutoSlide(); });

        const viewObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) startAutoSlide();
            else stopAutoSlide();
        }, { threshold: 0.1 });
        viewObserver.observe(portoContainer);

        portoContainer.addEventListener('touchstart', stopAutoSlide, { passive: true });
        portoContainer.addEventListener('touchend', startAutoSlide, { passive: true });

        // Initial Peek (Zero Reflow)
        let hasPeeked = false;
        const peekObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasPeeked) {
                hasPeeked = true;
                setTimeout(() => { moveSlider('next'); }, 500);
                peekObserver.unobserve(portoContainer);
            }
        }, { threshold: 0.5 });
        peekObserver.observe(portoContainer);

        const progressBar = document.getElementById('porto-progress');
        let progressRAF = null;
        portoContainer.addEventListener('scroll', () => {
            if (!progressBar || progressRAF) return;
            progressRAF = requestAnimationFrame(() => {
                if (currentState.maxScroll > 0) {
                    const progress = (currentState.currentX / currentState.maxScroll) * 75;
                    progressBar.style.transform = `translateX(${progress}vw)`;
                }
                progressRAF = null;
            });
        }, { passive: true });
    }

    // 4. WhatsApp Scroll (Reflow-Free)
    const waBtn = document.getElementById('whatsapp-btn');
    const waText = document.getElementById('wa-text');
    if (waBtn && waText) {
        let waRAF = null;
        let lastKnownScroll = 0;
        window.addEventListener('scroll', () => {
            lastKnownScroll = window.scrollY; // Read
            if (waRAF) return;
            waRAF = requestAnimationFrame(() => { // Write
                if (lastKnownScroll > 100) {
                    waText.style.display = 'none';
                    waBtn.style.maxWidth = '64px';
                } else {
                    waText.style.display = 'block';
                    waBtn.style.maxWidth = '200px';
                }
                waRAF = null;
            });
        }, { passive: true });
    }

    // 5. Gallery Filter Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryGrid = document.getElementById('gallery-grid');

    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.getAttribute('data-filter');

                // Update active state for buttons
                filterButtons.forEach(b => {
                    b.classList.remove('active', 'bg-primary', 'text-white');
                    b.classList.add('bg-white', 'text-slate-500', 'border-ocean-border');
                });
                btn.classList.add('active', 'bg-primary', 'text-white');
                btn.classList.remove('bg-white', 'text-slate-500', 'border-ocean-border');

                // Filter items
                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.classList.remove('hidden-item');
                        // Small delay to trigger reveal animation if it hasn't run
                        setTimeout(() => {
                            item.classList.add('reveal-active');
                        }, 50);
                    } else {
                        item.classList.add('hidden-item');
                    }
                });
            });
        });
    }

    // 6. Cloudinary & Skeleton Loading Logic
    const CLOUDINARY_NAME = 'dh2ud1wfo'; // User's cloud name
    const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload`;

    function getCloudinaryUrl(publicId, transformations) {
        if (publicId.startsWith('http')) return publicId;
        
        // Responsive width: 400px for mobile, 800px for desktop
        // This significantly improves mobile performance scores
        const isMobile = window.innerWidth < 768;
        const defaultTransform = isMobile ? 'f_auto,q_auto,w_400' : 'f_auto,q_auto,w_800';
        const finalTransform = transformations || defaultTransform;
        
        return `${CLOUDINARY_BASE}/${finalTransform}/${publicId}`;
    }

    function initImageLoading() {
        // Find all elements that should use Cloudinary or have a skeleton
        // We look for elements with data-cloudinary-src
        const cloudImages = document.querySelectorAll('[data-cloudinary-src]');
        
        cloudImages.forEach(el => {
            const publicId = el.getAttribute('data-cloudinary-src');
            const isBg = el.hasAttribute('data-as-bg');
            const transformations = el.getAttribute('data-transform') || 'f_auto,q_auto,w_800';
            const finalUrl = getCloudinaryUrl(publicId, transformations);

            // Create a temp image to check loading
            const img = new Image();
            img.src = finalUrl;

            // Add skeleton to the parent or element itself
            el.classList.add('skeleton');
            el.classList.add('image-pending');

            img.onload = () => {
                if (isBg) {
                    el.style.backgroundImage = `url("${finalUrl}")`;
                } else if (el.tagName === 'IMG') {
                    el.src = finalUrl;
                }
                
                el.classList.remove('skeleton');
                el.classList.remove('image-pending');
                el.classList.add('image-loaded');
            };
        });
    }

    initImageLoading();
});
