/**
 * Blog Text Fix Script
 *
 * This script ensures blog card text is displayed properly without unwanted truncation.
 * It overrides any CSS issues that might be causing the text to be cut off prematurely.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog text fix script loaded');

    // Target all blog card title and content elements
    const blogTitles = document.querySelectorAll('.blog-card h2, .blog-card h3');
    const blogDescriptions = document.querySelectorAll('.blog-card p');

    // Fix titles
    blogTitles.forEach(title => {
        // Override any CSS properties that might be causing truncation
        title.style.overflow = 'visible';
        title.style.display = 'block';
        title.style.webkitLineClamp = 'none';
        title.style.lineClamp = 'none';
        title.style.maxHeight = 'none';
        title.style.whiteSpace = 'normal';
    });

    // Fix descriptions
    blogDescriptions.forEach(description => {
        // Override any CSS properties that might be causing truncation
        description.style.overflow = 'visible';
        description.style.display = 'block';
        description.style.webkitLineClamp = 'none';
        description.style.lineClamp = 'none';
        description.style.maxHeight = 'none';
        description.style.whiteSpace = 'normal';
    });

    // Get all blog cards and ensure they have proper height
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.style.minHeight = '350px';
    });

    console.log('Blog text fix completed');
});
