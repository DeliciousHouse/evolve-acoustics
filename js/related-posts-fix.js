/**
 * Related Posts Fix
 *
 * This script fixes styling and interaction issues with related posts.
 * It ensures all related post cards are visible and clickable.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Related posts fix script loaded');

    const fixRelatedPosts = function() {
        // Find all related post containers - different sites might use different class names
        const relatedContainers = [
            '.related-posts',
            '.related-articles',
            '.blog-related-posts',
            '.article-related'
        ];

        let foundContainers = false;

        // Try each possible container class
        relatedContainers.forEach(containerClass => {
            const containers = document.querySelectorAll(containerClass);
            if (containers.length > 0) {
                foundContainers = true;
                console.log(`Found ${containers.length} related posts containers with class: ${containerClass}`);

                containers.forEach(container => {
                    // Find all post items within this container
                    const postItems = container.querySelectorAll('.post-item, .blog-card, article, .card');

                    if (postItems.length > 0) {
                        console.log(`Found ${postItems.length} related post items`);

                        postItems.forEach(item => {
                            // Ensure visibility
                            item.style.opacity = '1';
                            item.style.visibility = 'visible';

                            // Make sure flexbox layout is applied
                            item.style.display = 'flex';
                            item.style.flexDirection = 'column';

                            // Find the main link in the item
                            const link = item.querySelector('a');
                            if (link) {
                                // Make the entire item clickable
                                item.style.cursor = 'pointer';

                                // Add click event if not already present
                                if (!item.hasAttribute('data-clickable')) {
                                    item.setAttribute('data-clickable', 'true');
                                    item.addEventListener('click', function(e) {
                                        // Only trigger if the click wasn't on the link itself
                                        if (e.target !== link && !link.contains(e.target)) {
                                            link.click();
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });

        if (!foundContainers) {
            console.log('No related posts containers found. This might be expected if not on a post detail page.');
        }
    };

    // Run the fix immediately and after a short delay
    fixRelatedPosts();
    setTimeout(fixRelatedPosts, 500);
});