// Page preloader functionality
$(document).ready(function() {
    // Create and insert preloader HTML
    $('body').prepend('<div class="preloader"><div class="preloader-spinner"></div></div>');

    // Function to remove preloader when page is loaded
    $(window).on('load', function() {
        setTimeout(function() {
            $('.preloader').addClass('fade-out');
            setTimeout(function() {
                $('.preloader').remove();
            }, 500);
        }, 300); // Short delay for animation smoothness
    });

    // Fallback to remove preloader if window.load takes too long
    setTimeout(function() {
        $('.preloader').addClass('fade-out');
        setTimeout(function() {
            $('.preloader').remove();
        }, 500);
    }, 4000); // 4 second maximum wait time
});
