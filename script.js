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
        // Cache offsetWidth ONCE to avoid forced reflow on every event
        let cachedScrollAmount = 0;
        const firstCard = portoContainer.querySelector('.bento-block');
        const updateScrollAmount = () => {
            cachedScrollAmount = firstCard ? firstCard.offsetWidth + 32 : 320;
        };
        updateScrollAmount();
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(updateScrollAmount).observe(portoContainer);
        }
        const getScroll = () => cachedScrollAmount;
        let autoSlideInterval;

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                const maxScroll = portoContainer.scrollWidth - portoContainer.clientWidth;
                if (portoContainer.scrollLeft >= maxScroll - 10) {
                    portoContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    portoContainer.scrollBy({ left: getScroll(), behavior: 'smooth' });
                }
            }, 4000);
        };

        const stopAutoSlide = () => {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        };

        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            const maxScroll = portoContainer.scrollWidth - portoContainer.clientWidth;
            if (portoContainer.scrollLeft >= maxScroll - 10) {
                portoContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                portoContainer.scrollBy({ left: getScroll(), behavior: 'smooth' });
            }
            startAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            if (portoContainer.scrollLeft <= 10) {
                portoContainer.scrollTo({ left: portoContainer.scrollWidth, behavior: 'smooth' });
            } else {
                portoContainer.scrollBy({ left: -getScroll(), behavior: 'smooth' });
            }
            startAutoSlide();
        });

        portoContainer.addEventListener('mouseenter', stopAutoSlide);
        portoContainer.addEventListener('mouseleave', startAutoSlide);
        portoContainer.addEventListener('touchstart', stopAutoSlide, { passive: true });
        portoContainer.addEventListener('touchend', startAutoSlide, { passive: true });

        // 4. Initial Peek Hint on first scroll (Slide once, don't return)
        let hasPeeked = false;
        const peekObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasPeeked) {
                hasPeeked = true;
                stopAutoSlide();
                
                setTimeout(() => {
                    portoContainer.scrollBy({ left: getScroll(), behavior: 'smooth' });
                    setTimeout(startAutoSlide, 1000);
                }, 500);
                
                peekObserver.unobserve(portoContainer);
            }
        }, { threshold: 0.5 });

        peekObserver.observe(portoContainer);

        // Throttled scroll progress bar (rAF prevents layout thrashing)
        const progressBar = document.getElementById('porto-progress');
        let scrollRAF = null;
        portoContainer.addEventListener('scroll', () => {
            if (scrollRAF) return;
            scrollRAF = requestAnimationFrame(() => {
                const maxScroll = portoContainer.scrollWidth - portoContainer.clientWidth;
                if (progressBar && maxScroll > 0) {
                    progressBar.style.left = `${(portoContainer.scrollLeft / maxScroll) * 75}%`;
                }
                scrollRAF = null;
            });
        }, { passive: true });
    }

    // 4. Floating WhatsApp Scroll Behavior
    const waBtn = document.getElementById('whatsapp-btn');
    const waText = document.getElementById('wa-text');
    
    if (waBtn && waText) {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                // Scrolled down: Collapse to just logo
                waText.classList.add('opacity-0', 'pointer-events-none');
                waText.classList.remove('opacity-100');
                waBtn.classList.remove('md:max-w-[200px]', 'pr-6');
                waBtn.classList.add('max-w-[64px]', 'pr-3');
            } else {
                // Near top: Show full text
                waText.classList.remove('opacity-0', 'pointer-events-none');
                waText.classList.add('opacity-100');
                waBtn.classList.add('md:max-w-[200px]', 'pr-6');
                waBtn.classList.remove('max-w-[64px]', 'pr-3');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial call to set state
        handleScroll();
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

    function getCloudinaryUrl(publicId, transformations = 'f_auto,q_auto,w_800') {
        // If it's already a full URL, return it
        if (publicId.startsWith('http')) return publicId;
        return `${CLOUDINARY_BASE}/${transformations}/${publicId}`;
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
