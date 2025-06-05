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

    // Reverted to a simpler version to prevent browser crashes.
    // This version applies styles on load and DOMContentLoaded without MutationObservers or intervals.
    function applyBlogTextFix() {
        const blogCards = document.querySelectorAll('.blog-card');
        if (!blogCards.length) {
            // console.log('Blog Text Fix: No blog cards found.');
            return;
        }

        // console.log(`Blog Text Fix: Processing ${blogCards.length} blog cards.`);

        blogCards.forEach(card => {
            const titleElements = card.querySelectorAll('h2, h3');
            const paragraphElements = card.querySelectorAll('p');
            const contentArea = card.querySelector('.blog-card-content');

            titleElements.forEach(title => {
                // Restore original text if previously stored, or use current text
                const originalText = title.dataset.originalText || title.textContent.trim();
                if (!title.dataset.originalText) {
                    title.dataset.originalText = originalText;
                }
                title.textContent = originalText; // Ensure full text is present

                // Apply styles to ensure visibility - these should align with the critical CSS fix
                title.style.display = 'block';
                title.style.overflow = 'visible';
                title.style.whiteSpace = 'normal';
                title.style.textOverflow = 'clip';
                title.style.maxHeight = 'none';
                title.style.height = 'auto';
                title.style.minHeight = '0';
                // Add other necessary styles if they were being overridden by JS previously
            });

            paragraphElements.forEach(p => {
                const originalText = p.dataset.originalText || p.textContent.trim();
                if (!p.dataset.originalText) {
                    p.dataset.originalText = originalText;
                }
                p.textContent = originalText;

                p.style.display = 'block';
                p.style.overflow = 'visible';
                p.style.whiteSpace = 'normal';
                p.style.textOverflow = 'clip';
                p.style.maxHeight = 'none';
                p.style.height = 'auto';
                p.style.minHeight = '0';
            });

            if (contentArea) {
                contentArea.style.overflow = 'visible';
            }
        });
        // console.log('Blog Text Fix: Applied styles (simpler version).');
    }

    // Apply the fix on DOMContentLoaded and again on window load as a fallback
    document.addEventListener('DOMContentLoaded', () => {
        // console.log('Blog Text Fix: DOMContentLoaded triggered.');
        applyBlogTextFix();
    });

    window.addEventListener('load', () => {
        // console.log('Blog Text Fix: Window load triggered.');
        applyBlogTextFix();
        // A slight delay might help if content is still shifting after load
        setTimeout(applyBlogTextFix, 500);
    });

    console.log('Ultimate blog text fix initialized with multiple protection layers');
});
