// JavaScript for interactive elements
$(document).ready(function() {
    // Mobile menu toggle
    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.nav-links').toggleClass('active');

        // Add aria attributes for accessibility
        if ($('.nav-links').hasClass('active')) {
            $(this).attr('aria-expanded', 'true');
        } else {
            $(this).attr('aria-expanded', 'false');
        }
    });

    // Mobile dropdown toggle for touch devices
    $('.dropdown > a').on('click touchstart', function(e) {
        if ($(window).width() <= 768) {
            e.preventDefault();
            e.stopPropagation();
            $(this).siblings('.dropdown-content').toggleClass('active');
        }
    });

    // Close mobile menu when clicking outside
    $(document).on('click touchstart', function(event) {
        if (!$(event.target).closest('.menu-toggle, .nav-links').length) {
            $('.nav-links').removeClass('active');
            $('.dropdown-content').removeClass('active');
        }
    });
});
