// Scroll-to-top button functionality
$(document).ready(function() {
    // Add the button to the body
    $('body').append('<button class="scroll-to-top" aria-label="Scroll to top"><i class="fas fa-chevron-up"></i></button>');

    const $scrollToTop = $('.scroll-to-top');

    // Show/hide button based on scroll position
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $scrollToTop.addClass('visible');
        } else {
            $scrollToTop.removeClass('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    $scrollToTop.click(function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 800);
    });
});
