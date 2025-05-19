// JavaScript for interactive elements
$(document).ready(function() {
    // Enhanced mobile menu toggle with better accessibility
    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.nav-links').toggleClass('active');

        const isExpanded = $('.nav-links').hasClass('active');

        // Update aria attributes for accessibility
        $(this).attr('aria-expanded', isExpanded ? 'true' : 'false');

        // Focus on the first menu item if opening
        if (isExpanded) {
            // Use timeout to ensure the menu is visible before focusing
            setTimeout(function() {
                $('.nav-links ul li:first-child a').focus();
            }, 100);

            // Trap focus inside the menu when it's open
            setupFocusTrap();
        }
    });

    // Function to trap focus within the mobile menu
    function setupFocusTrap() {
        if ($(window).width() <= 768 && $('.nav-links').hasClass('active')) {
            const $navLinks = $('.nav-links');
            const $focusableElements = $navLinks.find('a, button');
            const $firstFocusable = $focusableElements.first();
            const $lastFocusable = $focusableElements.last();

            $lastFocusable.on('keydown', function(e) {
                if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    $('.menu-toggle').focus();
                }
            });

            $('.menu-toggle').on('keydown', function(e) {
                if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    $lastFocusable.focus();
                }
            });
        }
    }

    // Mobile dropdown toggle for touch devices with enhanced accessibility
    $('.dropdown > a').on('click touchstart', function(e) {
        if ($(window).width() <= 768) {
            e.preventDefault();
            e.stopPropagation();

            const $dropdownContent = $(this).siblings('.dropdown-content');
            const isExpanded = !$dropdownContent.hasClass('active');

            // Close any other open dropdown menus first
            $('.dropdown-content.active').not($dropdownContent).removeClass('active');
            $('.dropdown > a').not(this).attr('aria-expanded', 'false');

            // Toggle current dropdown
            $dropdownContent.toggleClass('active');
            $(this).attr('aria-expanded', isExpanded ? 'true' : 'false');
        }
    });

    // Close mobile menu when clicking outside
    $(document).on('click touchstart', function(event) {
        if (!$(event.target).closest('.menu-toggle, .nav-links').length) {
            $('.nav-links').removeClass('active');
            $('.dropdown-content').removeClass('active');
        }
    });

    // New scroll-to-top functionality
    const scrollTopButton = $('#scroll-top-button');

    // Show/hide scroll button based on scroll position
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            scrollTopButton.addClass('visible');
        } else {
            scrollTopButton.removeClass('visible');
        }
    });

    // Smooth scroll to top on click
    scrollTopButton.click(function() {
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });

    // Floating contact button functionality
    const floatingContact = $('#floating-contact');
    const contactButton = floatingContact.find('.floating-contact-button');

    contactButton.click(function() {
        floatingContact.toggleClass('active');

        // Update aria-expanded attribute
        const isExpanded = floatingContact.hasClass('active');
        $(this).attr('aria-expanded', isExpanded ? 'true' : 'false');
    });

    // Close contact menu when clicking outside
    $(document).on('click touchstart', function(event) {
        if (!$(event.target).closest('#floating-contact').length && floatingContact.hasClass('active')) {
            floatingContact.removeClass('active');
            contactButton.attr('aria-expanded', 'false');
        }
    });

    // Animated counter for statistics
    function animateStats() {
        const statsSection = $('.stats-section');

        if (statsSection.length) {
            const statItems = $('.stat-number');
            let animated = false;

            function checkIfInView() {
                const windowHeight = $(window).height();
                const windowTopPosition = $(window).scrollTop();
                const windowBottomPosition = (windowTopPosition + windowHeight);

                const elementTopPosition = statsSection.offset().top;
                const elementBottomPosition = (elementTopPosition + statsSection.outerHeight());

                // Check if stats section is in view and hasn't been animated yet
                if ((elementBottomPosition >= windowTopPosition) &&
                    (elementTopPosition <= windowBottomPosition) &&
                    !animated) {

                    // Animate each stat counter
                    statItems.each(function() {
                        const $this = $(this);
                        const finalValue = $this.data('count');

                        $({ Counter: 0 }).animate({ Counter: finalValue }, {
                            duration: 2000,
                            easing: 'swing',
                            step: function() {
                                $this.text(Math.ceil(this.Counter));
                            },
                            complete: function() {
                                $this.text(finalValue);
                            }
                        });
                    });

                    animated = true;
                }
            }

            // Check on scroll and on page load
            $(window).on('scroll', checkIfInView);
            checkIfInView();
        }
    }

    // Initialize animated stats
    animateStats();

    // Add keyboard controls for Before/After section
    $('.before-after-item').each(function() {
        const $item = $(this);
        const $before = $item.find('.before-image');
        const $after = $item.find('.after-image');

        // Make the items focusable
        $before.attr('tabindex', '0');
        $after.attr('tabindex', '0');

        // Add keyboard event listeners
        $item.on('keydown', function(e) {
            // Space or Enter toggles between before/after
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();

                if ($before.css('opacity') !== '0') {
                    $before.css('opacity', '0');
                    $after.css('opacity', '1');
                    $after.focus();
                } else {
                    $before.css('opacity', '1');
                    $after.css('opacity', '0');
                    $before.focus();
                }
            }
        });

        // Add screen reader instructions
        $item.attr('aria-label', 'Press Space or Enter to toggle between before and after images');
    });

    // Accordion functionality for FAQ section
    $('.accordion-header').click(function() {
        const $header = $(this);
        const $content = $header.next('.accordion-content');
        const isExpanded = $header.attr('aria-expanded') === 'true';

        // Toggle current accordion
        $header.attr('aria-expanded', !isExpanded);

        // Optional: Close other open accordions (comment out for multiple open)
        $('.accordion-header').not($header).attr('aria-expanded', 'false');
    });

    // Add keyboard support for accordions
    $('.accordion-header').on('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            $(this).click();
        }
    });

    // Initialize carousel functionality if it exists
    if ($('.carousel-container').length) {
        const $slides = $('.carousel-slide');
        const $dotsContainer = $('.carousel-dots');
        const slideCount = $slides.length;
        let currentIndex = 0;
        let slideLabels = [];

        // Create slide labels array
        $slides.each(function(index) {
            // Get figcaption text as slide label, or use default if none exists
            const captionText = $(this).find('figcaption').text() || `Slide ${index + 1}`;
            slideLabels.push(captionText);
        });

        // Create dots for each slide with proper ARIA roles
        for (let i = 0; i < slideCount; i++) {
            $dotsContainer.append(`
                <button class="carousel-dot"
                    data-index="${i}"
                    role="tab"
                    aria-selected="${i === 0 ? 'true' : 'false'}"
                    aria-label="Show slide: ${slideLabels[i]}"
                    tabindex="${i === 0 ? '0' : '-1'}">
                </button>
            `);
        }

        // Initialize first slide and dot
        $slides.first().addClass('active').attr({
            'aria-hidden': 'false',
            'tabindex': '0'
        });

        $slides.not(':first').attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        });

        $('.carousel-dot').first().addClass('active');

        // Function to show slide by index with enhanced accessibility
        function showSlide(index) {
            $slides.removeClass('active')
                  .attr('aria-hidden', 'true')
                  .attr('tabindex', '-1');

            $('.carousel-dot').removeClass('active')
                             .attr('aria-selected', 'false')
                             .attr('tabindex', '-1');

            $($slides[index]).addClass('active')
                           .attr('aria-hidden', 'false')
                           .attr('tabindex', '0');

            $($('.carousel-dot')[index]).addClass('active')
                                      .attr('aria-selected', 'true')
                                      .attr('tabindex', '0');

            // Announce slide change to screen readers
            $('.image-carousel').attr('aria-label', `Design inspiration gallery, showing slide ${index + 1} of ${slideCount}: ${slideLabels[index]}`);

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

        // Add keyboard support for carousel navigation
        $('.image-carousel').keydown(function(e) {
            // Right arrow or down arrow
            if (e.keyCode === 39 || e.keyCode === 40) {
                const nextIndex = (currentIndex + 1) % slideCount;
                showSlide(nextIndex);
                e.preventDefault();
            }
            // Left arrow or up arrow
            else if (e.keyCode === 37 || e.keyCode === 38) {
                const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
                showSlide(prevIndex);
                e.preventDefault();
            }
        });

        // Auto-advance every 5 seconds
        let carouselInterval = setInterval(function() {
            const nextIndex = (currentIndex + 1) % slideCount;
            showSlide(nextIndex);
        }, 5000);

        // Pause auto-advance on hover or focus
        $('.image-carousel').hover(
            function() { clearInterval(carouselInterval); },
            function() {
                carouselInterval = setInterval(function() {
                    const nextIndex = (currentIndex + 1) % slideCount;
                    showSlide(nextIndex);
                }, 5000);
            }
        ).focus(function() {
            clearInterval(carouselInterval);
        }).blur(function() {
            carouselInterval = setInterval(function() {
                const nextIndex = (currentIndex + 1) % slideCount;
                showSlide(nextIndex);
            }, 5000);
        });
    }
});
