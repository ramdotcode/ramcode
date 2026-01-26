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
        // Clone items for infinite loop (optional but better for "unlimited" feel)
        // If you prefer jump-back, we'll use a simpler logic below.
        
        const scrollAmount = () => portoContainer.querySelector('.bento-block').offsetWidth + 32;
        let autoSlideInterval;

        const startAutoSlide = () => {
            stopAutoSlide(); // Clear existing
            autoSlideInterval = setInterval(() => {
                const maxScroll = portoContainer.scrollWidth - portoContainer.clientWidth;
                if (portoContainer.scrollLeft >= maxScroll - 10) {
                    portoContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    portoContainer.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
                }
            }, 4000); // Change every 4 seconds
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
                portoContainer.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
            }
            startAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            if (portoContainer.scrollLeft <= 10) {
                portoContainer.scrollTo({ left: portoContainer.scrollWidth, behavior: 'smooth' });
            } else {
                portoContainer.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
            }
            startAutoSlide();
        });

        // Pause on mouse enter, resume on leave
        portoContainer.addEventListener('mouseenter', stopAutoSlide);
        portoContainer.addEventListener('mouseleave', startAutoSlide);
        
        // Touch events for mobile interaction
        portoContainer.addEventListener('touchstart', stopAutoSlide);
        portoContainer.addEventListener('touchend', startAutoSlide);

        // 4. Initial Peek Hint on first scroll (Slide once, don't return)
        let hasPeeked = false;
        const peekObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasPeeked) {
                hasPeeked = true;
                stopAutoSlide();
                
                // Immediately slide to the next card to show movement
                setTimeout(() => {
                    portoContainer.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
                    // After the first manual "peek" slide, resume normal auto-slide interval
                    setTimeout(startAutoSlide, 1000);
                }, 500); 
                
                peekObserver.unobserve(portoContainer);
            }
        }, { threshold: 0.5 });

        peekObserver.observe(portoContainer);

        // Initial Start (will be handled by peek logic or fallback)
        // startAutoSlide();

        // Update sliding indicator on scroll
        const progressBar = document.getElementById('porto-progress');
        portoContainer.addEventListener('scroll', () => {
            const scrollLeft = portoContainer.scrollLeft;
            const maxScroll = portoContainer.scrollWidth - portoContainer.clientWidth;
            
            if (progressBar && maxScroll > 0) {
                // Calculation: total track is 100%, indicator is 25% (w-1/4). 
                // So max movement is 75% of the total width.
                const movementProgress = (scrollLeft / maxScroll) * 75;
                progressBar.style.left = `${movementProgress}%`;
            }
        });
    }
});
