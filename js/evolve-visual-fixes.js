/**
 * Master Fix for Evolve Acoustics Website
 *
 * This script:
 * 1. Loads the necessary CSS fixes (dark blue underlines & layout fixes)
 * 2. Loads the JavaScript fixes for the blog grid and related posts grid
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load CSS fixes
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // Load our visual fixes CSS
    loadCSS('/css/visual-fixes.css');

    // Check if we're on a blog list page
    const isBlogListPage = document.querySelector('.blog-grid');
    if (isBlogListPage) {
        // Load the blog grid fix script
        const blogGridScript = document.createElement('script');
        blogGridScript.src = '/js/blog-grid-fix.js';
        document.body.appendChild(blogGridScript);
    }

    // Check if we're on a single blog post page with related posts
    const isSingleBlogPage = document.querySelector('.related-posts-grid');
    if (isSingleBlogPage) {
        // Load the related posts fix script
        const relatedPostsScript = document.createElement('script');
        relatedPostsScript.src = '/js/related-posts-fix.js';
        document.body.appendChild(relatedPostsScript);
    }

    // Debugging helper - log when all fixes are loaded
    console.log('Evolve Acoustics visual fixes loaded: ' + new Date().toLocaleString());
});
