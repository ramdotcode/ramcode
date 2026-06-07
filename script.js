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

    // 3. Portfolio Slider Logic
    const portoContainer = document.querySelector('#portfolio .overflow-x-auto');
    const nextBtn = document.getElementById('next-porto');
    const prevBtn = document.getElementById('prev-porto');

    if (portoContainer && nextBtn && prevBtn) {
        // Cache layout values to ELIMINATE FORCED REFLOW
        let cachedLayout = {
            scrollAmount: 0,
            maxScroll: 0,
            fullWidth: 0
        };

        const updateLayoutCache = () => {
            const firstCard = portoContainer.querySelector('.bento-block');
            const clientWidth = portoContainer.clientWidth;
            const scrollWidth = portoContainer.scrollWidth;
            
            cachedLayout.scrollAmount = firstCard ? firstCard.offsetWidth + 32 : 320;
            cachedLayout.maxScroll = scrollWidth - clientWidth;
            cachedLayout.fullWidth = scrollWidth;
        };

        // Update ONLY on resize (avoids layout thrashing during scrolls/clicks)
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(updateLayoutCache).observe(portoContainer);
        }
        updateLayoutCache();

        let autoSlideInterval;
        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                if (portoContainer.scrollLeft >= cachedLayout.maxScroll - 10) {
                    portoContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    portoContainer.scrollBy({ left: cachedLayout.scrollAmount, behavior: 'smooth' });
                }
            }, 4000);
        };

        const stopAutoSlide = () => {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        };

        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            if (portoContainer.scrollLeft >= cachedLayout.maxScroll - 10) {
                portoContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                portoContainer.scrollBy({ left: cachedLayout.scrollAmount, behavior: 'smooth' });
            }
            startAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            if (portoContainer.scrollLeft <= 10) {
                portoContainer.scrollTo({ left: cachedLayout.fullWidth, behavior: 'smooth' });
            } else {
                portoContainer.scrollBy({ left: -cachedLayout.scrollAmount, behavior: 'smooth' });
            }
            startAutoSlide();
        });

        // Only run auto-slide when section is in viewport (Saves CPU on Mobile)
        const viewObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) startAutoSlide();
            else stopAutoSlide();
        }, { threshold: 0.1 });
        viewObserver.observe(portoContainer);

        portoContainer.addEventListener('mouseenter', stopAutoSlide);
        portoContainer.addEventListener('mouseleave', startAutoSlide);
        portoContainer.addEventListener('touchstart', stopAutoSlide, { passive: true });
        portoContainer.addEventListener('touchend', startAutoSlide, { passive: true });

        // Initial Peek Hint (Zero Reflow)
        let hasPeeked = false;
        const peekObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasPeeked) {
                hasPeeked = true;
                setTimeout(() => {
                    portoContainer.scrollBy({ left: cachedLayout.scrollAmount, behavior: 'smooth' });
                }, 500);
                peekObserver.unobserve(portoContainer);
            }
        }, { threshold: 0.5 });
        peekObserver.observe(portoContainer);

        // Progress bar with Zero Reflow & Throttling
        const progressBar = document.getElementById('porto-progress');
        let scrollRAF = null;
        portoContainer.addEventListener('scroll', () => {
            if (!progressBar || scrollRAF) return;
            scrollRAF = requestAnimationFrame(() => {
                if (cachedLayout.maxScroll > 0) {
                    progressBar.style.left = `${(portoContainer.scrollLeft / cachedLayout.maxScroll) * 75}%`;
                }
                scrollRAF = null;
            });
        }, { passive: true });
    }

    // 4. Floating WhatsApp Scroll Behavior (Throttled & Reflow Free)
    const waBtn = document.getElementById('whatsapp-btn');
    const waText = document.getElementById('wa-text');
    if (waBtn && waText) {
        let waRAF = null;
        window.addEventListener('scroll', () => {
            if (waRAF) return;
            waRAF = requestAnimationFrame(() => {
                // Use scrollY once per frame
                const scrolled = window.scrollY;
                if (scrolled > 100) {
                    waText.classList.add('opacity-0', 'pointer-events-none');
                    waText.classList.remove('opacity-100');
                    waBtn.classList.remove('md:max-w-[200px]', 'pr-6');
                    waBtn.classList.add('max-w-[64px]', 'pr-3');
                } else {
                    waText.classList.remove('opacity-0', 'pointer-events-none');
                    waText.classList.add('opacity-100');
                    waBtn.classList.add('md:max-w-[200px]', 'pr-6');
                    waBtn.classList.remove('max-w-[64px]', 'pr-3');
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
