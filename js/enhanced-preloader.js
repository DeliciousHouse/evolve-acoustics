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
        const progressBar = document.querySelector('.evolve-preloader .progress');

        // Ensure progress bar completes
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        // Function to reveal the page
        const revealPage = () => {
            // Check if the preloader exists and hide it
            if (preloader) {
                preloader.classList.add('hidden'); // This starts the 0.8s fade-out

                // Listen for the end of the fade-out animation
                preloader.addEventListener('transitionend', function() {
                    preloader.style.display = 'none'; // Fully remove the preloader
                    // Remove the hiding class to show the page content
                    document.documentElement.classList.remove('js-loading');
                }, { once: true }); // Ensure the event runs only once

            } else {
                // If there's no preloader for some reason, just show the page
                document.documentElement.classList.remove('js-loading');
            }
        };

        // Wait a brief moment for the progress bar to animate, then start revealing
        setTimeout(revealPage, 300);
    });

}, { passive: true }); // Added {passive: true} to the DOMContentLoaded listener

// If page takes too long to load, hide preloader after 8 seconds
setTimeout(() => {
    const preloader = document.querySelector('.evolve-preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        // Consider also removing the preloader element itself after a delay here too
    }
}, 8000);
