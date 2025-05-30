/**
 * Blog Grid Fix
 *
 * This script dynamically adjusts the blog grid layout to eliminate blank spaces
 * between blog cards by using a masonry-like approach.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to fix the blog grid layout
    function fixBlogGridLayout() {
        const blogGrid = document.querySelector('.blog-grid');

        // Exit if blog grid doesn't exist on this page
        if (!blogGrid) return;

        const cards = Array.from(blogGrid.querySelectorAll('.blog-card'));
        const gridComputedStyle = window.getComputedStyle(blogGrid);
        const columnGap = parseInt(gridComputedStyle.columnGap) || 20; // Default to 20px if not set

        // Get the container width and card width to determine how many columns we have
        const containerWidth = blogGrid.clientWidth;
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0;

        if (!cardWidth) return; // Exit if no cards or invalid card width

        // Calculate number of columns (accounting for gaps)
        const numColumns = Math.floor((containerWidth + columnGap) / (cardWidth + columnGap));
        if (numColumns <= 1) return; // No need to fix if only one column

        // Create an array to track the current height of each column
        const columnHeights = new Array(numColumns).fill(0);

        // Position each card in the shortest column
        cards.forEach((card) => {
            // Find the shortest column
            const shortestColIndex = columnHeights.indexOf(Math.min(...columnHeights));

            // Calculate the position
            const leftPosition = shortestColIndex * (cardWidth + columnGap);
            const topPosition = columnHeights[shortestColIndex];

            // Position the card
            card.style.position = 'absolute';
            card.style.left = leftPosition + 'px';
            card.style.top = topPosition + 'px';

            // Update the column height
            columnHeights[shortestColIndex] += card.offsetHeight + columnGap;
        });

        // Update the grid container height to fit all cards
        blogGrid.style.height = Math.max(...columnHeights) + 'px';
        blogGrid.style.position = 'relative';
    }

    // Run the layout fix
    fixBlogGridLayout();

    // Re-run on window resize
    window.addEventListener('resize', fixBlogGridLayout);

    // Re-run when images load as they might affect card heights
    window.addEventListener('load', fixBlogGridLayout);

    // If there are filters that change the visible cards, we need to reapply the layout
    const filterButtons = document.querySelectorAll('.blog-filter-button');
    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Give time for the DOM to update with filtered cards
                setTimeout(fixBlogGridLayout, 100);
            });
        });
    }
});
