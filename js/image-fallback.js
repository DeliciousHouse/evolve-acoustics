/**
 * Image Fallback Handler for Blog Images
 * This script provides fallback handling for images that fail to load
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle blog card images
    const blogCardImages = document.querySelectorAll('.blog-card-image img');
    blogCardImages.forEach(image => {
        // Handle path differences between blog listing and blog post pages
        const isInBlogListing = window.location.pathname.endsWith('blog.html');
        const placeholderPath = isInBlogListing ? '../assets/images/placeholders/blog-card-placeholder.png' : '../../assets/images/placeholders/blog-card-placeholder.png';

        image.addEventListener('error', function() {
            this.src = placeholderPath;
            const originalAlt = this.alt;
            this.alt = originalAlt.startsWith('Placeholder')
                ? originalAlt
                : `Placeholder image for ${originalAlt}`;
        });

        // Trigger error handler for images that might be missing
        if (image.src.includes('blogs/before_home_diy.webp') ||
            image.src.includes('blog/after_home_professional.webp') ||
            image.src.includes('restaurant-acoustics.jpg') ||
            image.src.includes('acoustic-panels.jpg') ||
            image.src.includes('home-studio.jpg') ||
            image.src.includes('office-design.jpg')) {
            const testImg = new Image();
            testImg.onerror = function() {
                image.dispatchEvent(new Event('error'));
            };
            testImg.src = image.src;
        }
    });

    // Determine if we're on blog listing or post page
    const isInBlogListing = window.location.pathname.endsWith('blog.html');
    const contentPlaceholderPath = isInBlogListing ? '../assets/images/placeholders/blog-content-placeholder.png' : '../../assets/images/placeholders/blog-content-placeholder.png';
    const relatedPlaceholderPath = isInBlogListing ? '../assets/images/placeholders/related-post-placeholder.png' : '../../assets/images/placeholders/related-post-placeholder.png';

    // Handle blog content images
    const contentImages = document.querySelectorAll('.blog-content img:not(.author-image):not(.related-post-image)');
    contentImages.forEach(image => {
        image.addEventListener('error', function() {
            this.src = contentPlaceholderPath;
            const originalAlt = this.alt;
            this.alt = originalAlt.startsWith('Placeholder')
                ? originalAlt
                : `Placeholder image for ${originalAlt}`;
        });
    });

    // Handle author images
    const authorImages = document.querySelectorAll('.blog-author .author-image');
    authorImages.forEach(image => {
        image.addEventListener('error', function() {
            this.src = contentPlaceholderPath;
            const originalAlt = this.alt;
            this.alt = originalAlt.startsWith('Placeholder')
                ? originalAlt
                : `Placeholder image for ${originalAlt}`;
        });
    });

    // Handle related post images
    const relatedImages = document.querySelectorAll('.related-post-image');
    relatedImages.forEach(image => {
        image.addEventListener('error', function() {
            this.src = relatedPlaceholderPath;
            const originalAlt = this.alt;
            this.alt = originalAlt.startsWith('Placeholder')
                ? originalAlt
                : `Placeholder image for ${originalAlt}`;
        });

        // Check if specific related post images are missing
        if (image.src.includes('home-theater.jpg') ||
            image.src.includes('acoustic-treatment.jpg')) {
            const testImg = new Image();
            testImg.onerror = function() {
                image.dispatchEvent(new Event('error'));
            };
            testImg.src = image.src;
        }
    });
});
