/**
 * Script Loader for Grid Fixes
 *
 * This script determines which page is currently loaded and includes the appropriate
 * JavaScript files for fixing grid layouts.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a blog list page
    if (document.querySelector('.blog-grid')) {
        // Load the blog grid fix script
        const blogGridScript = document.createElement('script');
        blogGridScript.src = '/js/blog-grid-fix.js';
        document.body.appendChild(blogGridScript);
    }

    // Check if we're on a single blog post page with related posts
    if (document.querySelector('.related-posts-grid')) {
        // Load the related posts fix script
        const relatedPostsScript = document.createElement('script');
        relatedPostsScript.src = '/js/related-posts-fix.js';
        document.body.appendChild(relatedPostsScript);
    }
});
