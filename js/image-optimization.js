/**
 * Image Optimization Script for Evolve Acoustics
 *
 * This script implements lazy loading and image optimization features
 * for improved page load times and user experience.
 */

// Use passive event listener for DOMContentLoaded
window.addPassiveEventListener(document, 'DOMContentLoaded', function() {
    // Function to convert standard images to lazy loaded images
    function enableLazyLoading() {
        console.log('Setting up lazy loading for images');

        // Find all images without loading attribute
        const images = document.querySelectorAll('img:not([loading])');

        images.forEach(img => {
            // Skip logo, critical images, or already processed images
            if (img.classList.contains('logo-img') ||
                img.classList.contains('hero-img') ||
                img.hasAttribute('data-src') ||
                img.hasAttribute('loading') ||
                isInViewport(img)) {
                return;
            }

            // Set native lazy loading attribute
            img.setAttribute('loading', 'lazy');

            // For browsers that don't support native lazy loading
            if ('IntersectionObserver' in window) {
                // Store original source
                const originalSrc = img.getAttribute('src');

                // Set a data attribute for the source and use a local placeholder image
                if (originalSrc && !img.getAttribute('data-src')) {
                    img.setAttribute('data-src', originalSrc);
                    // Use a standard placeholder from assets instead of data URI
                    const basePath = window.location.pathname.includes('/pages/blogs/') ?
                        '../../assets/images/placeholder.png' :
                        window.location.pathname.includes('/pages/') ?
                            '../assets/images/placeholder.png' :
                            'assets/images/placeholder.png';
                    img.setAttribute('src', basePath);
                }
            }
        });
    }

    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Set up IntersectionObserver for custom lazy loading
    function setupLazyLoadObserver() {
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;
                        const src = lazyImage.getAttribute('data-src');

                        if (src) {
                            lazyImage.setAttribute('src', src);
                            lazyImage.removeAttribute('data-src');
                            lazyImage.classList.add('loaded');
                        }

                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });

            // Target all images with data-src
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(image => {
                lazyImageObserver.observe(image);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.setAttribute('src', img.getAttribute('data-src'));
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            });
        }
    }

    // Fix broken images
    function fixBrokenImages() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            // Skip images with no src
            if (!img.getAttribute('src')) return;

            img.onerror = function() {
                // If image fails to load, try WebP fallback or default placeholder
                if (img.src.endsWith('.jpg') || img.src.endsWith('.jpeg') || img.src.endsWith('.png')) {
                    // Try WebP version
                    const webpSrc = img.src.substring(0, img.src.lastIndexOf('.')) + '.webp';
                    img.src = webpSrc;

                    // If that fails too, use placeholder
                    img.onerror = function() {
                        img.src = '../assets/images/placeholder.webp';
                    };
                } else {
                    // Just use placeholder
                    img.src = '../assets/images/placeholder.webp';
                }
            };
        });
    }

    // Generate sizes attribute for responsive images
    function addSizesToImages() {
        const images = document.querySelectorAll('img:not([sizes])');

        images.forEach(img => {
            if (img.classList.contains('blog-card-image img') ||
                img.classList.contains('blog-image') ||
                img.classList.contains('gallery-image')) {
                img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
            }
        });
    }

    // Run optimizations
    enableLazyLoading();
    setupLazyLoadObserver();
    fixBrokenImages();
    addSizesToImages();

    // Re-check on window resize - using passive event listener helper
    window.addPassiveEventListener(window, 'resize', function() {
        // Throttle resize events
        clearTimeout(window.resizeThrottler);
        window.resizeThrottler = setTimeout(function() {
            setupLazyLoadObserver();
        }, 250);
    }, true);

    console.log('Image optimizations applied');
});
