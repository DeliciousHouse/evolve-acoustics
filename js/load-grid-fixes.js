/**
 * Script Loader for Grid Fixes
 *
 * This script ensures that visual-fixes.css is properly applied
 * without relying on separate JS files.
 */

// Use passive event listener for DOMContentLoaded
window.addPassiveEventListener(document, 'DOMContentLoaded', function() {
    // Determine the base path based on the current URL
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/blogs/')) {
            return '../../';
        } else if (path.includes('/pages/') || path.includes('/templates/')) {
            return '../';
        }
        return '';
    }

    const cssPath = getBasePath() + 'css/visual-fixes.css'; // Use relative path based on current location
    // Check if the CSS is already linked
    if (!document.querySelector(`link[href$="${cssPath}"]`)) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = cssPath;
        cssLink.onload = function() {
            console.log(cssPath + ' loaded dynamically.');
        };
        cssLink.onerror = function() {
            console.error('Failed to load ' + cssPath);
        };
        document.head.appendChild(cssLink);
    } else {
        console.log(cssPath + ' was already loaded.');
    }

    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
        console.log('Blog grid element found. CSS rules from ' + cssPath + ' should be applying.');
        // If your visual-fixes.css requires a specific class on the grid container to activate,
        // you could add it here, e.g.:
        // blogGrid.classList.add('grid-styling-active');
    }
});
