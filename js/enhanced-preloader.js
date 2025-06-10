/**
 * Enhanced Preloader Script for Evolve Acoustics
 *
 * This script implements a smooth loading experience with
 * a progress bar preloader that ensures all content is loaded
 * before displaying the page.
 */

// CORRECTED: Use standard addEventListener for DOMContentLoaded
// The event target for DOMContentLoaded is 'document'.
// While {passive: true} has minimal impact on 'DOMContentLoaded' for scroll performance (as it's not a scroll-blocking input event),
// it's harmless and aligns with the intent if the listener doesn't call preventDefault().
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, will remove js-loading class');

    // Remove loading class immediately on DOMContentLoaded
    document.documentElement.classList.remove('js-loading');
    // Add preloader CSS (now part of visual-enhancements.css)
    function loadPreloaderCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = getBasePath() + 'css/visual-enhancements.css'; // Using consolidated CSS file
        document.head.appendChild(link);
    }

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

    // Load preloader CSS
    loadPreloaderCSS();

    // Create preloader HTML using DOM methods (CSP-compatible)
    function createPreloaderElements() {
        // Main container
        const preloader = document.createElement('div');
        preloader.className = 'evolve-preloader';

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';

        // Logo image
        const logoImg = document.createElement('img');
        logoImg.src = getBasePath() + 'assets/images/logo_light.ico';
        logoImg.alt = 'Evolve Acoustics';
        logoImg.className = 'logo';

        // Loading text
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'LOADING';

        // Progress bar container
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        // Progress indicator
        const progress = document.createElement('div');
        progress.className = 'progress';

        // Assemble elements
        progressBar.appendChild(progress);
        logoContainer.appendChild(logoImg);
        logoContainer.appendChild(loadingText);
        logoContainer.appendChild(progressBar);
        preloader.appendChild(logoContainer);

        return preloader;
    }

    // Add preloader to the beginning of the body
    const preloaderElement = createPreloaderElements();
    document.body.insertBefore(preloaderElement, document.body.firstChild);

    // Add loading class to body
    document.body.classList.add('loading');

    // Track loading progress
    let loadingProgress = 0;
    const progressBarElement = document.querySelector('.evolve-preloader .progress'); // Renamed to avoid conflict if progressBar was a global

    // Simulate initial progress (35% right away)
    if (progressBarElement) { // Check if progressBarElement exists
        setTimeout(() => {
            loadingProgress = 35;
            progressBarElement.style.width = loadingProgress + '%';
        }, 100);
    }


    // Gradually increase progress while waiting for page to load
    const progressInterval = setInterval(() => {
        if (progressBarElement && loadingProgress < 85) { // Check if progressBarElement exists
            loadingProgress += Math.random() * 8;
            if (loadingProgress > 85) loadingProgress = 85;
            progressBarElement.style.width = loadingProgress + '%';
        } else if (!progressBarElement && loadingProgress < 85) {
            // If progressBarElement somehow became null, clear interval to prevent errors
             clearInterval(progressInterval);
        }
    }, 300);

    // When everything is loaded
    window.addEventListener('load', function() {
        // Clear the interval
        clearInterval(progressInterval);

        const preloader = document.querySelector('.evolve-preloader');
        console.log('Preloader element found:', preloader !== null);
        const progressBar = document.querySelector('.evolve-preloader .progress');

        // Ensure progress bar completes
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        // Immediately remove js-loading class again
        document.documentElement.classList.remove('js-loading');
        console.log('js-loading class removed (load event)');

        // Simplified preloader handling
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800); // Match transition time
        }

        // Reveal the page content
        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }, 100);
    });

}, { passive: true }); // Added {passive: true} to the DOMContentLoaded listener

// If page takes too long to load, hide preloader after 8 seconds
setTimeout(() => {
    const preloader = document.querySelector('.evolve-preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        // Remove the js-loading class to ensure content is always displayed
        document.documentElement.classList.remove('js-loading');
        // Remove the preloader element after animation completes
        setTimeout(() => {
            if (preloader) {
                preloader.style.display = 'none';
            }
        }, 1000);
    }
}, 8000);

// Failsafe: Always show content after 5 seconds max
setTimeout(function() {
    if (document.documentElement.classList.contains('js-loading')) {
        console.log('Failsafe activated: removing js-loading class');
        document.documentElement.classList.remove('js-loading');
    }
}, 5000);
