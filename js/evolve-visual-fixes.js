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

    // Debugging helper - log when all fixes are loaded
    console.log('Evolve Acoustics visual fixes loaded: ' + new Date().toLocaleString());
});
