/**
 * Blog Text Fix Script - ULTIMATE VERSION
 *
 * This script ensures blog card text is displayed properly without unwanted truncation,
 * using multiple strategies to guarantee text display regardless of CSS conflicts.
 *
 * Features:
 * - Aggressive CSS !important rules
 * - Direct inline style application
 * - MutationObserver for dynamic content changes
 * - Multiple timers at different intervals
 * - Style prioritization techniques
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog text fix script loaded - ULTIMATE VERSION');

    // Inject a style element with !important rules to override any conflicting styles
    // Use higher specificity selectors with multiple classes and attributes for extra power
    function injectCriticalCSSFix() {
        const styleEl = document.createElement('style');
        styleEl.id = 'critical-blog-text-fix';
        styleEl.setAttribute('data-priority', 'maximum');

        // Using extremely specific selectors for maximum override power
        styleEl.innerHTML = `
            html body .blog-container .blog-grid .blog-card h2,
            html body .blog-container .blog-grid .blog-card h3,
            html body .blog-card h2,
            html body .blog-card h3,
            .blog-card h2[class],
            .blog-card h3[class],
            html body main .blog-card h2,
            html body main .blog-card h3 {
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
                font-size: 1.4rem !important;
            }

            html body .blog-container .blog-grid .blog-card p,
            html body .blog-card p,
            .blog-card p[class],
            html body main .blog-card p {
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

            html body .blog-card-content,
            .blog-card-content[class] {
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: visible !important;
                padding: 2rem !important;
            }

            html body .blog-card,
            .blog-card[class] {
                flex: 0 0 calc(33.333% - 15px) !important;
                max-width: calc(33.333% - 15px) !important;
                min-width: 280px !important;
                overflow: visible !important;
                min-height: 350px !important;
                height: auto !important;
            }
        `;

        // Add to head with priority
        document.head.appendChild(styleEl);
        console.log('Critical CSS fix injected with maximum priority');
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
                font-size: 1.4rem !important;
            `);

            // Add data attribute to mark as fixed
            title.setAttribute('data-text-fixed', 'true');
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

            // Add data attribute to mark as fixed
            description.setAttribute('data-text-fixed', 'true');
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

            content.setAttribute('data-content-fixed', 'true');
        });

        // Get all blog cards and ensure they have proper height and overflow
        blogCards.forEach(card => {
            card.setAttribute('style', `
                flex: 0 0 calc(33.333% - 15px) !important;
                max-width: calc(33.333% - 15px) !important;
                min-width: 280px !important;
                overflow: visible !important;
                min-height: 350px !important;
                height: auto !important;
            `);

            card.setAttribute('data-card-fixed', 'true');
        });
    }

    // Setup mutation observer to watch for dynamically added blog cards
    function setupMutationObserver() {
        const targetNode = document.querySelector('.blog-grid') || document.body;

        const config = {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        };

        const callback = function(mutationsList, observer) {
            let needsRefix = false;

            for(const mutation of mutationsList) {
                if (mutation.type === 'childList' ||
                    (mutation.type === 'attributes' &&
                    (mutation.target.classList.contains('blog-card') ||
                     mutation.target.querySelector('.blog-card')))) {
                    needsRefix = true;
                    break;
                }
            }

            if (needsRefix) {
                console.log('DOM changes detected, re-applying text fixes');
                fixTextTruncation();
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
        console.log('Mutation observer setup for dynamic content');

        return observer;
    }

    // Inject critical CSS fix
    injectCriticalCSSFix();

    // Run fix immediately
    fixTextTruncation();

    // Run fix again after a short delay to ensure it applies after any dynamic content loads
    setTimeout(fixTextTruncation, 100);
    setTimeout(fixTextTruncation, 500);

    // More aggressive multi-timing approach for extra reliability
    const timings = [1000, 2000, 3000, 5000, 8000];
    timings.forEach(timing => {
        setTimeout(fixTextTruncation, timing);
    });

    // Run again after all images and resources load
    window.addEventListener('load', () => {
        fixTextTruncation();
        setTimeout(fixTextTruncation, 500);
    });

    // Apply fix periodically to ensure it sticks
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
        fixTextTruncation();
        attempts++;

        if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.log('Blog text fix completed after multiple attempts');

            // One final check after everything else
            setTimeout(fixTextTruncation, 10000);
        }
    }, 500);

    // Setup mutation observer for dynamic content
    const observer = setupMutationObserver();

    // Handle any future dynamic content additions
    document.addEventListener('DOMNodeInserted', (event) => {
        if (event.target.classList &&
            (event.target.classList.contains('blog-card') ||
             event.target.querySelector('.blog-card'))) {
            console.log('New blog card detected, applying fixes');
            fixTextTruncation();
        }
    });

    console.log('Ultimate blog text fix initialized with multiple protection layers');
});
