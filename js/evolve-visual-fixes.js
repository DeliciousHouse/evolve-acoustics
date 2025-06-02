/**
 * Visual Fixes for Evolve Acoustics Website
 *
 * This script simply loads the visual-fixes.css file,
 * which contains all of our CSS-only fixes.
 *
 * The CSS-only approach eliminates the need for JavaScript-based
 * layout adjustments, improving performance and reliability.
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

    // Load our visual fixes CSS
    loadCSS('/css/visual-fixes.css');

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

    // Run fixes immediately and after a short delay to catch any dynamic content
    fixBlogGrid();
    setTimeout(fixBlogGrid, 500);

    // Also run fixes when window is resized or images load
    window.addEventListener('resize', fixBlogGrid);
    window.addEventListener('load', fixBlogGrid);

    // Debugging helper - log when all fixes are loaded
    console.log('Evolve Acoustics visual fixes loaded: ' + new Date().toLocaleString());
});
