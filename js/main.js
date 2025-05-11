// JavaScript for interactive elements
$(document).ready(function() {
    // Mobile menu toggle
    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.nav-links').toggleClass('active');
    });

    // Mobile dropdown toggle
    $('.dropdown > a').click(function(e) {
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
        }
    });
});
