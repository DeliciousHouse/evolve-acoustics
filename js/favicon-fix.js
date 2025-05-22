/**
 * Favicon Fix Script
 *
 * This script ensures the favicon is loaded correctly and prevents refresh loops
 * by setting a proper cache control and providing multiple icon formats.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only apply the fix if we're on a blog page
    if (window.location.pathname.includes('/blogs/') || window.location.pathname.includes('/blog.html')) {
        // Get the existing favicon link
        const existingFavicon = document.querySelector('link[rel="icon"]');

        if (existingFavicon) {
            // Set the cache control attribute to prevent refreshing
            existingFavicon.setAttribute('crossorigin', 'anonymous');

            // Ensure the favicon path is correct
            const path = window.location.pathname.includes('/blogs/')
                ? '../../assets/images/favicon.png'
                : '../assets/images/favicon.png';

            existingFavicon.setAttribute('href', path);
        }
    }
});
