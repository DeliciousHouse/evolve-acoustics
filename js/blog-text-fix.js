/**
 * Blog Text Fix Script
 *
 * This script ensures blog card text is displayed properly without unwanted truncation.
 * It overrides any CSS issues that might be causing the text to be cut off prematurely.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog text fix script loaded - ENHANCED VERSION');

    // Inject a style element with !important rules to override any conflicting styles
    function injectCriticalCSSFix() {
        const styleEl = document.createElement('style');
        styleEl.id = 'critical-blog-text-fix';
        styleEl.innerHTML = `
            .blog-card h2, .blog-card h3 {
                display: block !important;
                overflow: visible !important;
                white-space: normal !important;
                text-overflow: clip !important;
                max-height: none !important;
                min-height: 0 !important;
                height: auto !important;
                line-height: 1.3 !important;
                margin-bottom: 10px !important;
                color: #ffffff !important;
                padding: 0 !important;
                -webkit-line-clamp: unset !important;
                line-clamp: unset !important;
                -webkit-box-orient: unset !important;
                box-orient: unset !important;
                word-break: normal !important;
                word-wrap: break-word !important;
            }

            .blog-card p {
                display: block !important;
                overflow: visible !important;
                white-space: normal !important;
                text-overflow: clip !important;
                max-height: none !important;
                min-height: 0 !important;
                height: auto !important;
                line-height: 1.6 !important;
                margin-bottom: 15px !important;
                color: #e0e0e0 !important;
                -webkit-line-clamp: unset !important;
                line-clamp: unset !important;
                -webkit-box-orient: unset !important;
                box-orient: unset !important;
                word-break: normal !important;
                word-wrap: break-word !important;
            }

            .blog-card-content {
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: visible !important;
                padding: 2rem !important;
            }

            .blog-card {
                overflow: visible !important;
                min-height: 350px !important;
                height: auto !important;
            }
        `;
        document.head.appendChild(styleEl);
        console.log('Critical CSS fix injected');
    }

    // Fix function to handle all text elements in cards with inline styling
    function fixTextTruncation() {
        // Target all blog card title and content elements
        const blogTitles = document.querySelectorAll('.blog-card h2, .blog-card h3');
        const blogDescriptions = document.querySelectorAll('.blog-card p');
        const blogCardContents = document.querySelectorAll('.blog-card-content');
        const blogCards = document.querySelectorAll('.blog-card');

        console.log(`Found ${blogTitles.length} titles, ${blogDescriptions.length} descriptions`);

        // Fix titles with aggressive inline styling
        blogTitles.forEach(title => {
            // Override any CSS properties that might be causing truncation
            title.setAttribute('style', `
                display: block !important;
                overflow: visible !important;
                white-space: normal !important;
                text-overflow: clip !important;
                max-height: none !important;
                height: auto !important;
                min-height: 0 !important;
                line-height: 1.3 !important;
                margin-bottom: 10px !important;
                color: #ffffff !important;
                padding: 0 !important;
                -webkit-line-clamp: unset !important;
                line-clamp: unset !important;
                -webkit-box-orient: unset !important;
                box-orient: unset !important;
                word-break: normal !important;
                word-wrap: break-word !important;
            `);
        });

        // Fix descriptions with aggressive inline styling
        blogDescriptions.forEach(description => {
            description.setAttribute('style', `
                display: block !important;
                overflow: visible !important;
                white-space: normal !important;
                text-overflow: clip !important;
                max-height: none !important;
                height: auto !important;
                min-height: 0 !important;
                line-height: 1.6 !important;
                margin-bottom: 15px !important;
                color: #e0e0e0 !important;
                -webkit-line-clamp: unset !important;
                line-clamp: unset !important;
                -webkit-box-orient: unset !important;
                box-orient: unset !important;
                word-break: normal !important;
                word-wrap: break-word !important;
            `);
        });

        // Fix content containers
        blogCardContents.forEach(content => {
            content.setAttribute('style', `
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: visible !important;
                padding: 2rem !important;
            `);
        });

        // Get all blog cards and ensure they have proper height and overflow
        blogCards.forEach(card => {
            card.setAttribute('style', `
                overflow: visible !important;
                min-height: 350px !important;
                height: auto !important;
            `);
        });
    }

    // Inject critical CSS fix
    injectCriticalCSSFix();

    // Run fix immediately
    fixTextTruncation();

    // Run fix again after a short delay to ensure it applies after any dynamic content loads
    setTimeout(fixTextTruncation, 500);

    // Run again after all images load, which might affect layout
    window.addEventListener('load', fixTextTruncation);

    // Apply fix periodically for 5 seconds to ensure it sticks
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
        fixTextTruncation();
        attempts++;

        if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.log('Blog text fix completed after multiple attempts');
        }
    }, 500);

    console.log('Enhanced blog text fix initialized');
});
