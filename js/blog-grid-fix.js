/**
 * Blog Grid Fix
 *
 * This script fixes layout issues with the blog grid by ensuring
 * consistent card heights and proper spacing.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all blog cards
    const blogCards = document.querySelectorAll('.blog-card');

    // Apply fixes to ensure consistent layout
    blogCards.forEach(card => {
        // Ensure proper height calculation
        const cardContent = card.querySelector('.blog-card-content');
        if (cardContent) {
            // Make sure content takes available space
            cardContent.style.display = 'flex';
            cardContent.style.flexDirection = 'column';
            cardContent.style.flexGrow = '1';
        }

        // Ensure card is visible and properly sized
        card.style.opacity = '1';
        card.style.visibility = 'visible';
    });
});