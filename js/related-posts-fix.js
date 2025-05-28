/**
 * Related Posts Grid Fix
 *
 * This script dynamically adjusts the related posts grid layout to eliminate blank spaces
 * between post cards by using a masonry-like approach.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to fix the related posts grid layout
    function fixRelatedPostsLayout() {
        const relatedGrid = document.querySelector('.related-posts-grid');

        // Exit if related posts grid doesn't exist on this page
        if (!relatedGrid) return;

        const posts = Array.from(relatedGrid.querySelectorAll('.related-post'));
        const gridComputedStyle = window.getComputedStyle(relatedGrid);
        const columnGap = parseInt(gridComputedStyle.columnGap) || 20; // Default to 20px if not set

        // Get the container width and post width to determine how many columns we have
        const containerWidth = relatedGrid.clientWidth;
        const postWidth = posts.length > 0 ? posts[0].offsetWidth : 0;

        if (!postWidth) return; // Exit if no posts or invalid post width

        // Calculate number of columns (accounting for gaps)
        const numColumns = Math.floor((containerWidth + columnGap) / (postWidth + columnGap));
        if (numColumns <= 1) return; // No need to fix if only one column

        // Create an array to track the current height of each column
        const columnHeights = new Array(numColumns).fill(0);

        // Position each post in the shortest column
        posts.forEach((post) => {
            // Find the shortest column
            const shortestColIndex = columnHeights.indexOf(Math.min(...columnHeights));

            // Calculate the position
            const leftPosition = shortestColIndex * (postWidth + columnGap);
            const topPosition = columnHeights[shortestColIndex];

            // Position the post
            post.style.position = 'absolute';
            post.style.left = leftPosition + 'px';
            post.style.top = topPosition + 'px';

            // Update the column height
            columnHeights[shortestColIndex] += post.offsetHeight + columnGap;
        });

        // Update the grid container height to fit all posts
        relatedGrid.style.height = Math.max(...columnHeights) + 'px';
        relatedGrid.style.position = 'relative';
    }

    // Run the layout fix
    fixRelatedPostsLayout();

    // Re-run on window resize
    window.addEventListener('resize', fixRelatedPostsLayout);

    // Re-run when images load as they might affect post heights
    window.addEventListener('load', fixRelatedPostsLayout);
});
