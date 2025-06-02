/**
 * Visual Fixes for Evolve Acoustics Website
 *
 * This script applies visual enhancements and fixes to improve the
 * user experience across the entire website. It works alongside
 * the CSS-only fixes to provide a comprehensive solution.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load CSS fixes if not already loaded
    function loadCSS(href) {
        // Check if the CSS has already been loaded
        const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of existingLinks) {
            if (link.href.includes(href)) {
                console.log('CSS already loaded: ' + href);
                return;
            }
        }

        // Load the CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        console.log('Visual fixes CSS loaded: ' + href);
    }

    // Load our visual fixes CSS files
    loadCSS('/css/visual-fixes.css');
    loadCSS('/css/enhanced-visual-fixes.css');

    // Fix for blog grid layout - especially on page 1
    const fixBlogGrid = function() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return;

        console.log('Applying visual fixes to blog grid');

        // Get all blog cards
        const blogCards = document.querySelectorAll('.blog-card');
        if (!blogCards.length) return;

        // Force consistent heights and ensure visibility
        blogCards.forEach(card => {
            // Reset any problematic styles
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';

            // Ensure consistent heights for content areas
            const cardContent = card.querySelector('.blog-card-content');
            if (cardContent) {
                cardContent.style.flexGrow = '1';
            }

            // Fix image container height if present
            const imageContainer = card.querySelector('.blog-card-image');
            if (imageContainer) {
                imageContainer.style.height = '200px'; // Consistent image height
                imageContainer.style.overflow = 'hidden';
            }
        });

        // If we're on page 1, apply special handling for the larger number of items
        const paginationLinks = document.querySelectorAll('.pagination a');
        const isPageOne = !paginationLinks.length ||
                         Array.from(paginationLinks).some(link => link.textContent === '1' && link.classList.contains('active')) ||
                         window.location.href.indexOf('page=1') > -1 ||
                         !window.location.href.match(/page=[2-9]/);

        if (isPageOne) {
            console.log('Detected page 1, applying special grid fixes');
            blogGrid.style.display = 'grid';
            blogGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            blogGrid.style.gap = '30px';
            blogGrid.style.gridAutoRows = '1fr';
        }
    };

    // Image lazy loading implementation
    const lazyLoadImages = function() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');

                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }

                        imageObserver.unobserve(img);
                    }
                });
            });

            // Target all images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            // Also convert regular images to lazy loading if they don't already have it
            document.querySelectorAll('img:not([loading])').forEach(img => {
                if (!img.hasAttribute('loading') && !img.classList.contains('logo-img')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        } else {
            // Fallback for browsers that don't support Intersection Observer
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    };

    // Fix for service page layout issues
    const fixServicePages = function() {
        const serviceGrid = document.querySelector('.service-grid');
        if (!serviceGrid) return;

        console.log('Applying visual fixes to service grid');

        // Fix service cards layout
        const serviceCards = document.querySelectorAll('.service-card, .application-card');
        serviceCards.forEach(card => {
            // Ensure consistent card heights
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.height = '100%';

            // Ensure content takes available space
            const cardContent = card.querySelector('.service-card-content, .application-content');
            if (cardContent) {
                cardContent.style.flexGrow = '1';
            }
        });
    };

    // Fix for contact form and map layout
    const fixContactPage = function() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

        console.log('Applying visual fixes to contact page');

        // Ensure form fields have consistent styling
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.style.width = '100%';
            input.style.boxSizing = 'border-box';
        });

        // Fix map responsiveness if present
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.width = '100%';
            mapContainer.style.height = '400px';
            mapContainer.style.maxWidth = '100%';
        }
    };

    // Run fixes immediately and after a short delay to catch any dynamic content
    fixBlogGrid();
    lazyLoadImages();
    fixServicePages();
    fixContactPage();

    setTimeout(() => {
        fixBlogGrid();
        lazyLoadImages();
        fixServicePages();
        fixContactPage();
    }, 500);

    // Also run fixes when window is resized or images load
    window.addEventListener('resize', () => {
        fixBlogGrid();
        fixServicePages();
        fixContactPage();
    });

    window.addEventListener('load', () => {
        fixBlogGrid();
        lazyLoadImages();
        fixServicePages();
        fixContactPage();
    });

    // Debugging helper - log when all fixes are loaded
    console.log('Evolve Acoustics visual fixes loaded: ' + new Date().toLocaleString());
});
