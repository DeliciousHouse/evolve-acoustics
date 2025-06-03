/**
 * Visual Issues Detection and Repair Tool
 *
 * This script automatically detects and fixes common visual issues
 * that might appear throughout the Evolve Acoustics website.
 */

// Use passive event listener for DOMContentLoaded
window.addPassiveEventListener(document, 'DOMContentLoaded', function() {
    console.log('Starting visual issues detection...');

    // Collection of fixes to apply
    const visualFixes = [
        // Fix 1: Detect and fix layout overflow issues
        function fixOverflowIssues() {
            document.querySelectorAll('*').forEach(el => {
                const computed = window.getComputedStyle(el);
                // Check if element is causing horizontal scrolling
                if (el.offsetWidth > document.documentElement.offsetWidth &&
                    computed.overflowX !== 'hidden' &&
                    computed.position !== 'fixed' &&
                    !el.matches('html, body')) {

                    console.log('Fixing overflow on element:', el);
                    el.style.maxWidth = '100%';
                    el.style.boxSizing = 'border-box';

                    // If it contains images that might be causing the issue
                    el.querySelectorAll('img').forEach(img => {
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                    });
                }
            });
        },

        // Fix 2: Fix image aspect ratio inconsistencies
        function fixImageAspectRatios() {
            // Target specific image containers where consistency is important
            const imageContainers = [
                {selector: '.blog-card-image', ratio: '16/9'},
                {selector: '.gallery-item', ratio: '16/9'},
                {selector: '.service-intro-figure', ratio: '16/9'},
                {selector: '.team-member-image', ratio: '1/1'}, // Square for team members
            ];

            imageContainers.forEach(container => {
                document.querySelectorAll(container.selector).forEach(el => {
                    if (!el.style.aspectRatio) {
                        el.style.aspectRatio = container.ratio;
                        el.style.overflow = 'hidden';

                        // Ensure the image inside fills the container
                        const img = el.querySelector('img');
                        if (img) {
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.objectFit = 'cover';
                        }
                    }
                });
            });
        },

        // Fix 3: Detect and fix mobile menu issues
        function fixMobileMenuIssues() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');

            if (menuToggle && navLinks) {
                // Ensure proper z-index
                navLinks.style.zIndex = '999';

                // Ensure smooth transition
                if (!navLinks.style.transition) {
                    navLinks.style.transition = 'all 0.3s ease';
                }

                // Fix possible visibility issues - click events don't need passive listeners
                menuToggle.addEventListener('click', function() {
                    // Force visibility when toggled
                    if (navLinks.classList.contains('active')) {
                        navLinks.style.visibility = 'visible';
                    }
                });
            }
        },

        // Fix 4: Fix footer layout issues
        function fixFooterLayout() {
            const footer = document.querySelector('footer');
            if (!footer) return;

            // Ensure footer stays at bottom even with short content
            const body = document.body;
            const html = document.documentElement;

            const height = Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
            );

            if (height <= window.innerHeight) {
                document.body.style.minHeight = '100vh';
                document.body.style.display = 'flex';
                document.body.style.flexDirection = 'column';

                const main = document.querySelector('main') || document.querySelector('.main-content');
                if (main) {
                    main.style.flexGrow = '1';
                }

                footer.style.marginTop = 'auto';
            }
        },

        // Fix 5: Fix form button alignment issues
        function fixFormButtonAlignment() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitButton) {
                    // Ensure submit button has proper display
                    submitButton.style.display = 'block';

                    // Check if it should be aligned right or centered
                    if (form.classList.contains('contact-form')) {
                        submitButton.style.marginLeft = 'auto';
                        submitButton.style.marginRight = '0';
                    }
                }
            });
        },

        // Fix 6: Fix spacing inconsistencies
        function fixSpacingIssues() {
            // Fix heading margins
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                heading.style.marginBottom = '1rem';
                heading.style.marginTop = '2rem';
            });

            // First heading should have no top margin
            document.querySelectorAll('.service-page-content > h1:first-child, .blog-content > h1:first-child').forEach(h => {
                h.style.marginTop = '0';
            });

            // Fix paragraph spacing
            document.querySelectorAll('p + p').forEach(p => {
                p.style.marginTop = '1rem';
            });
        },

        // Fix 7: Detect and fix color inconsistencies
        function fixColorInconsistencies() {
            // Ensure buttons have consistent colors
            document.querySelectorAll('button, .button, .cta-button').forEach(button => {
                // Don't override specific button styles like .menu-toggle
                if (!button.classList.contains('menu-toggle')) {
                    // Only apply if not already styled
                    const style = window.getComputedStyle(button);
                    if (style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent') {
                        button.style.backgroundColor = '#2a9d8f';
                    }

                    // Ensure text is readable
                    if (style.color === 'rgb(0, 0, 0)') {
                        button.style.color = '#ffffff';
                    }
                }
            });
        }
    ];

    // Run all fixes
    visualFixes.forEach(fix => {
        try {
            fix();
        } catch (e) {
            console.error('Error applying visual fix:', e);
        }
    });

    // Run fixes again after all content has loaded
    window.addEventListener('load', function() {
        visualFixes.forEach(fix => {
            try {
                fix();
            } catch (e) {
                console.error('Error applying visual fix on load:', e);
            }
        });
    });

    // Also run when window is resized (with debounce) - using passive event listener
    let resizeTimer;
    window.addPassiveEventListener(window, 'resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            console.log('Running visual fixes after resize');
            visualFixes.forEach(fix => {
                try {
                    fix();
                } catch (e) {
                    console.error('Error applying visual fix on resize:', e);
                }
            });
        }, 250);
    }, true);

    console.log('Visual issues detection and fixes applied');
});
