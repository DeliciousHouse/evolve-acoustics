// JavaScript for interactive elements
$(document).ready(function() {
    // Enhanced mobile menu toggle with better accessibility
    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Toggle mobile menu
        $('.nav-links').toggleClass('active');

        const isExpanded = $('.nav-links').hasClass('active');

        // Update ARIA attributes
        $(this).attr('aria-expanded', isExpanded ? 'true' : 'false');

        // Close all dropdown menus when closing the main menu
        if (!isExpanded) {
            $('.dropdown-content').removeClass('active');
            $('.dropdown').removeClass('active');
            $('.dropdown > a').attr('aria-expanded', 'false');
        }

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

    // Enhanced mobile dropdown toggle with passive event handling
    // Split touchstart and click events for better performance
    $('.dropdown > a').on('touchstart', function() {
        // Just mark it as touched without preventing default (passive event)
        $(this).data('touched', true);
    });

    // Handle actual functionality in the click event
    $('.dropdown > a').on('click', function(e) {
        if ($(window).width() <= 768) {
            e.preventDefault();
            e.stopPropagation();

            const $dropdown = $(this).parent('.dropdown');
            const $dropdownContent = $(this).siblings('.dropdown-content');

            // Force a reflow/repaint to ensure CSS transitions work correctly
            $dropdown.css('display', 'none').height();
            $dropdown.css('display', '');

            // Toggle active state classes
            $dropdown.toggleClass('active');
            $dropdownContent.toggleClass('active');

            // Update ARIA attributes for accessibility
            const isExpanded = $dropdown.hasClass('active');
            $(this).attr('aria-expanded', isExpanded);

            // Close other dropdowns for cleaner UI
            $('.dropdown').not($dropdown).removeClass('active');
            $('.dropdown-content.active').not($dropdownContent).removeClass('active');
            $('.dropdown > a').not($(this)).attr('aria-expanded', 'false');

            // Force the display style to ensure visibility
            if (isExpanded) {
                // Ensure dropdown is visible with explicit styles
                $dropdownContent.css({
                    'display': 'block',
                    'opacity': '1',
                    'visibility': 'visible',
                    'max-height': '500px'
                });

                // Mark parent as active too
                $dropdown.addClass('dropdown-open');
            } else {
                // Reset styles when closing
                setTimeout(function() {
                    $dropdownContent.css({
                        'display': '',
                        'opacity': '',
                        'visibility': '',
                        'max-height': ''
                    });
                }, 300); // Match transition duration

                $dropdown.removeClass('dropdown-open');
            }
        }
    });

    // Ensure submenu links navigate correctly on mobile and don't close the menu prematurely
    $('.dropdown-content a').each(function() {
        const linkElement = this;

        // Handle click with jQuery as before
        $(linkElement).on('click', function(e) {
            if ($(window).width() <= 768) {
                e.stopPropagation(); // Prevent this click from closing the main menu
                                     // The default link navigation will proceed as e.preventDefault() is NOT called here.
            }
        });

        // CORRECTED: Handle touchstart with a native passive listener
        linkElement.addEventListener('touchstart', function(e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
            }
        }, { passive: true });
    });


    // Handler function for closing mobile menu when clicking outside
    const closeMobileMenuOnClickOutside = function(event) {
        // Check if the menu is active and the click is outside
        if ($('.nav-links').hasClass('active') && !$(event.target).closest('.menu-toggle, .nav-links').length) {
            $('.nav-links').removeClass('active');
            $('.dropdown-content').removeClass('active'); // Ensure submenus also close
            $('.dropdown').removeClass('active');
            // Reset aria-expanded attributes
            $('.menu-toggle').attr('aria-expanded', 'false');
            $('.dropdown > a').attr('aria-expanded', 'false'); // Reset services dropdown parent
        }
    };

    // Use jQuery for 'click' event as before
    $(document).on('click', closeMobileMenuOnClickOutside);
    // CORRECTED: Use native addEventListener for 'touchstart' with { passive: true }
    document.addEventListener('touchstart', closeMobileMenuOnClickOutside, { passive: true });


    // Handle escape key to close menu
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('.nav-links').hasClass('active')) {
            $('.nav-links').removeClass('active');
            $('.dropdown').removeClass('active');
            $('.dropdown-content').removeClass('active');
            $('.menu-toggle').attr('aria-expanded', 'false');
            $('.dropdown > a').attr('aria-expanded', 'false');
            $('.menu-toggle').focus();
        }
    });

    // Scroll-to-top functionality removed as requested
    // It was considered distracting and has been disabled

    // Floating contact button functionality
    const floatingContact = $('#floating-contact');
    const contactButton = floatingContact.find('.floating-contact-button');

    contactButton.click(function() {
        floatingContact.toggleClass('active');

        // Update aria-expanded attribute
        const isExpanded = floatingContact.hasClass('active');
        $(this).attr('aria-expanded', isExpanded ? 'true' : 'false');
    });

    // Handler for closing contact menu when clicking outside
    const closeContactMenuOnClickOutside = function(event) {
        if (!$(event.target).closest('#floating-contact').length && floatingContact.hasClass('active')) {
            floatingContact.removeClass('active');
            contactButton.attr('aria-expanded', 'false');
        }
    };
    // Use jQuery for 'click' event
    $(document).on('click', closeContactMenuOnClickOutside);
    // CORRECTED: Use native addEventListener for 'touchstart' with { passive: true } for the contact menu
    document.addEventListener('touchstart', closeContactMenuOnClickOutside, { passive: true });


    // Animated counter for statistics
    // The actual checkIfInView function for stats, to be used by the event listener
    let statsAnimated = false; // Moved to a broader scope if animateStats is called multiple times or if checkIfInView is global
    function checkIfInView() {
        const statsSection = $('.stats-section'); // Re-select or ensure it's available
        if (!statsSection.length) return; // Exit if section not found

        const windowHeight = $(window).height();
        const windowTopPosition = $(window).scrollTop();
        const windowBottomPosition = (windowTopPosition + windowHeight);

        const elementTopPosition = statsSection.offset().top;
        const elementBottomPosition = (elementTopPosition + statsSection.outerHeight());

        // Check if stats section is in view and hasn't been animated yet
        if ((elementBottomPosition >= windowTopPosition) &&
            (elementTopPosition <= windowBottomPosition) &&
            !statsAnimated) { // Use the correctly scoped 'statsAnimated'

            const statItems = $('.stat-number'); // Re-select or ensure it's available
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
            statsAnimated = true; // Set flag after animation starts
        }
    }

    function animateStats() {
        const statsSection = $('.stats-section');
        if (statsSection.length) {
            // CORRECTED: Use native addEventListener for 'scroll' with { passive: true }
            window.addEventListener('scroll', checkIfInView, { passive: true });
            checkIfInView(); // Initial check
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
                e.preventDefault(); // This preventDefault is for keyboard interaction, not scrolling.

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
            e.preventDefault(); // For keyboard interaction
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
                e.preventDefault(); // For keyboard navigation
            }
            // Left arrow or up arrow
            else if (e.keyCode === 37 || e.keyCode === 38) {
                const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
                showSlide(prevIndex);
                e.preventDefault(); // For keyboard navigation
            }
        });

        // Auto-advance every 5 seconds
        let carouselInterval = setInterval(function() {
            const nextIndex = (currentIndex + 1) % slideCount;
            showSlide(nextIndex);
        }, 5000);

        // Pause auto-advance on hover or focus
        // These are not scroll/touch events that need passive listeners for scroll performance.
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

    // Testing code to verify jQuery is working correctly
    console.log('jQuery version:', $.fn.jquery);
    console.log('Dropdowns found:', $('.dropdown').length);
    console.log('Dropdown links found:', $('.dropdown > a').length);

});
