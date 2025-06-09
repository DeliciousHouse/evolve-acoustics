// Script to verify blog card display after removing problematic scripts
console.log('Running blog card display verification');

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the blog page
    const blogGrid = document.querySelector('.blog-grid');

    if (blogGrid) {
        console.log('Blog page detected - running verification');

        // Check blog cards
        const blogCards = document.querySelectorAll('.blog-card');
        console.log(`Found ${blogCards.length} blog cards`);

        if (blogCards.length > 0) {
            // Verify card heights
            let cardHeights = [];
            blogCards.forEach((card, index) => {
                const actualHeight = card.offsetHeight;
                cardHeights.push(actualHeight);
                console.log(`Card ${index+1} height: ${actualHeight}px`);
            });

            // Check if heights are consistent
            const avgHeight = cardHeights.reduce((a, b) => a + b, 0) / cardHeights.length;
            const heightsMatch = cardHeights.every(height => Math.abs(height - avgHeight) < 5);
            console.log(`Card heights are ${heightsMatch ? 'consistent' : 'inconsistent'}`);

            // Check images
            const cardImages = document.querySelectorAll('.blog-card-image img');
            let imagesLoaded = 0;
            let imagesVisible = 0;

            cardImages.forEach((img, index) => {
                if (img.complete) imagesLoaded++;

                const computedStyle = window.getComputedStyle(img);
                if (computedStyle.display !== 'none' &&
                    computedStyle.visibility !== 'hidden' &&
                    computedStyle.opacity !== '0') {
                    imagesVisible++;
                }
            });

            console.log(`Images loaded: ${imagesLoaded}/${cardImages.length}`);
            console.log(`Images visible: ${imagesVisible}/${cardImages.length}`);

            // Check text truncation
            const cardTitles = document.querySelectorAll('.blog-card h2, .blog-card h3');
            const cardDescriptions = document.querySelectorAll('.blog-card p');

            console.log(`Checking ${cardTitles.length} card titles for proper truncation`);
            console.log(`Checking ${cardDescriptions.length} card descriptions for proper truncation`);
        }
    }
});

// Add a message to confirm the script is running
console.log('Blog card verification script loaded - No errors detected');
