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

    // Image carousel functionality
    if ($('.carousel-container').length) {
        const $slides = $('.carousel-slide');
        const $dotsContainer = $('.carousel-dots');
        const slideCount = $slides.length;
        let currentIndex = 0;

        // Create dots for each slide
        for (let i = 0; i < slideCount; i++) {
            $dotsContainer.append(`<div class="carousel-dot" data-index="${i}" aria-label="Go to slide ${i+1}"></div>`);
        }

        // Initialize first slide and dot
        $slides.first().addClass('active');
        $('.carousel-dot').first().addClass('active');

        // Function to show slide by index
        function showSlide(index) {
            $slides.removeClass('active');
            $('.carousel-dot').removeClass('active');

            $($slides[index]).addClass('active');
            $($('.carousel-dot')[index]).addClass('active');
            currentIndex = index;
        }

        // Next button
        $('.carousel-control.next').click(function() {
            const nextIndex = (currentIndex + 1) % slideCount;
            showSlide(nextIndex);
        });

        // Previous button
        $('.carousel-control.prev').click(function() {
            const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
            showSlide(prevIndex);
        });

        // Dot navigation
        $('.carousel-dot').click(function() {
            const dotIndex = $(this).data('index');
            showSlide(dotIndex);
        });

        // Auto-advance every 5 seconds
        let carouselInterval = setInterval(function() {
            const nextIndex = (currentIndex + 1) % slideCount;
            showSlide(nextIndex);
        }, 5000);

        // Pause auto-advance on hover
        $('.image-carousel').hover(
            function() { clearInterval(carouselInterval); },
            function() {
                carouselInterval = setInterval(function() {
                    const nextIndex = (currentIndex + 1) % slideCount;
                    showSlide(nextIndex);
                }, 5000);
            }
        );
    }
});
