/**
 * Script Loader for Grid Fixes
 *
 * This script ensures that visual-fixes.css is properly applied
 * without relying on separate JS files.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Make sure visual-fixes.css is loaded
    if (!document.querySelector('link[href*="visual-fixes.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/css/visual-fixes.css';
        document.head.appendChild(cssLink);
        console.log('Added visual-fixes.css dynamically');
    }

    // Additional grid initialization could be added here directly if needed
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
        console.log('Blog grid found - applying CSS-based fixes');
    }
});
