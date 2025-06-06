/**
 * Fixed Header Script
 *
 * This script handles the behavior of the fixed header, implementing:
 * - Header shrinking on scroll
 * - Optional header hiding when scrolling down
 * - Performance optimized with throttling
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Fixed header script loaded');

    // Get header element
    const header = document.querySelector('header');
    if (!header) return;

    // Set padding on body to match header height - CRITICAL FIX
    function adjustBodyPadding() {
        const headerHeight = header.offsetHeight;
        document.body.style.paddingTop = headerHeight + 'px';
        console.log('Body padding set to:', headerHeight + 'px');
    }

    // Initial padding adjustment
    adjustBodyPadding();

    // Variables for scroll handling
    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 50; // Minimum scroll amount before header changes

    // Throttle scroll events for better performance
    function throttleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleHeaderOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Handle header state based on scroll position
    function handleHeaderOnScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Track if header state changed (for body padding adjustment)
        const wasHeaderShrunk = header.classList.contains('header-shrink');

        // Add shrink effect when scrolled down
        if (currentScroll > scrollThreshold) {
            header.classList.add('header-shrink');

            // Optional: Hide header when scrolling down
            // if (currentScroll > lastScrollTop && currentScroll > 300) {
            //     header.classList.add('header-hidden');
            // } else {
            //     header.classList.remove('header-hidden');
            // }
        } else {
            header.classList.remove('header-shrink');
            // header.classList.remove('header-hidden');
        }

        // If header state changed, adjust body padding
        if (wasHeaderShrunk !== header.classList.contains('header-shrink')) {
            // Small delay to allow the header transition to start
            setTimeout(adjustBodyPadding, 10);
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    // Set initial header state
    handleHeaderOnScroll();

    // Listen for scroll events with throttling
    window.addEventListener('scroll', throttleScroll, { passive: true });

    // Update body padding when window is resized
    window.addEventListener('resize', function() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                adjustBodyPadding();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Handle anchor links to account for fixed header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight - 20; // Extra 20px padding

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log('Fixed header functionality initialized');
});
