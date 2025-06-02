/**
 * Enhanced Preloader Script for Evolve Acoustics
 *
 * This script implements a smooth loading experience with
 * a progress bar preloader that ensures all content is loaded
 * before displaying the page.
 */

// Add preloader HTML to the document immediately
document.addEventListener('DOMContentLoaded', function() {
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

    // Add preloader HTML
    const preloaderHTML = `
        <div class="evolve-preloader">
            <div class="logo-container">
                <img src="${getBasePath()}assets/images/logo_light.png" alt="Evolve Acoustics" class="logo">
                <div class="loading-text">LOADING</div>
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
            </div>
        </div>
    `;

    // Add preloader to the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);

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

    // When everything is loaded
    window.addEventListener('load', function() {
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
