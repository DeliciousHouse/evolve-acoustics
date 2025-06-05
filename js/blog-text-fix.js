/**
 * Blog Text Fix Script
 *
 * This script ensures blog card text is displayed properly without unwanted truncation.
 * It overrides any CSS issues that might be causing the text to be cut off prematurely.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog text fix script loaded');

    // Fix function to handle all text elements in cards
    function fixTextTruncation() {
        // Target all blog card title and content elements
        const blogTitles = document.querySelectorAll('.blog-card h2, .blog-card h3');
        const blogDescriptions = document.querySelectorAll('.blog-card p');
        const blogCardContents = document.querySelectorAll('.blog-card-content');
        const blogCards = document.querySelectorAll('.blog-card');

        // Fix titles
        blogTitles.forEach(title => {
            // Override any CSS properties that might be causing truncation
            title.style.overflow = 'visible';
            title.style.display = 'block';
            title.style.webkitLineClamp = 'none';
            title.style.lineClamp = 'none';
            title.style.maxHeight = 'none';
            title.style.whiteSpace = 'normal';
            title.style.textOverflow = 'clip';
            title.style.wordWrap = 'break-word';
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
            description.style.textOverflow = 'clip';
            description.style.wordWrap = 'break-word';
        });

        // Fix content containers
        blogCardContents.forEach(content => {
            content.style.overflow = 'visible';
        });

        // Get all blog cards and ensure they have proper height and overflow
        blogCards.forEach(card => {
            card.style.minHeight = '350px';
            card.style.height = 'auto';
            card.style.overflow = 'visible';
        });
    }

    // Run fix immediately
    fixTextTruncation();

    // Run fix again after a short delay to ensure it applies after any dynamic content loads
    setTimeout(fixTextTruncation, 500);

    // Run again after all images load, which might affect layout
    window.addEventListener('load', fixTextTruncation);

    console.log('Blog text fix completed');
});
