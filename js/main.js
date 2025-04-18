// JavaScript for interactive elements
$(document).ready(function() {
    // Mobile menu toggle
    $('.menu-toggle').click(function() {
        $('.nav-links').toggleClass('active');
    });

    // Mobile dropdown toggle
    $('.dropdown > a').click(function(e) {
        if ($(window).width() <= 768) {
            e.preventDefault();
            $(this).siblings('.dropdown-content').toggleClass('active');
        }
    });

    // Close mobile menu when clicking outside
    $(document).click(function(event) {
        if (!$(event.target).closest('.menu-toggle, .nav-links').length) {
            $('.nav-links').removeClass('active');
        }
    });
});
