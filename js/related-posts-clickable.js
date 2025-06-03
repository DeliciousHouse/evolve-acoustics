// Makes related posts clickable
// Use passive event listener for DOMContentLoaded
window.addPassiveEventListener(document, 'DOMContentLoaded', function() {
    const relatedPosts = document.querySelectorAll('.related-post');

    relatedPosts.forEach(post => {
        // Find the URL from the read more link
        const readMoreLink = post.querySelector('a');
        if (readMoreLink) {
            const articleUrl = readMoreLink.getAttribute('href');

            // Make the entire card clickable - click event doesn't need passive but will use helper for consistency
            window.addPassiveEventListener(post, 'click', function(e) {
                // Don't navigate if clicking on the actual read more link
                if (e.target.closest('a')) {
                    return;
                }

                // Navigate to the article page
                window.location.href = articleUrl;
            });
        }
    });
});
