/**
 * Enhanced Preloader Script for Evolve Acoustics
 *
 * This script implements a smooth loading experience with
 * a progress bar preloader that ensures all content is loaded
 * before displaying the page.
 */

// Add preloader HTML to the document immediately
// Use passive event listener for DOMContentLoaded
window.addPassiveEventListener(document, 'DOMContentLoaded', function() {
    // Add preloader CSS
    function loadPreloaderCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = getBasePath() + 'css/enhanced-preloader.css';
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
        logoImg.src = getBasePath() + 'assets/images/logo_light.png';
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
    const progressBar = document.querySelector('.evolve-preloader .progress');

    // Simulate initial progress (35% right away)
    setTimeout(() => {
        loadingProgress = 35;
        progressBar.style.width = loadingProgress + '%';
    }, 100);

    // Gradually increase progress while waiting for page to load
    const progressInterval = setInterval(() => {
        if (loadingProgress < 85) {
            loadingProgress += Math.random() * 8;
            if (loadingProgress > 85) loadingProgress = 85;
            progressBar.style.width = loadingProgress + '%';
        }
    }, 300);

    // When everything is loaded - using passive event listener
    window.addPassiveEventListener(window, 'load', function() {
        // Clear the interval
        clearInterval(progressInterval);

        // Set to 100% and fade out
        loadingProgress = 100;
        progressBar.style.width = '100%';

        // Wait a bit before hiding the preloader
        setTimeout(() => {
            const preloader = document.querySelector('.evolve-preloader');
            if (preloader) {
                preloader.classList.add('hidden');
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');

                // Remove preloader after animation completes
                setTimeout(() => {
                    preloader.remove();
                }, 1000);
            }
        }, 500);
    });
});

// If page takes too long to load, hide preloader after 8 seconds
setTimeout(() => {
    const preloader = document.querySelector('.evolve-preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }
}, 8000);
