// JavaScript for interactive elements
$(document).ready(function() {
    // Example: Smooth scrolling for navigation links
    $('nav a').on('click', function(event) {
        event.preventDefault();
        const target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 500);
    });
});
