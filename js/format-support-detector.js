/**
 * Enhanced Image Format Fallback Script
 *
 * This script detects browser support for WebP and AVIF image formats
 * and adds a CSS class to the document element which can be used for CSS fallbacks.
 *
 * It also ensures that any <source> elements with unsupported formats are disabled.
 */

(function() {
    /**
     * Check if the browser supports a specific image format
     * @param {string} format - The image format to test ('webp' or 'avif')
     * @param {Function} callback - Callback function receiving the result
     */
    function checkFormatSupport(format, callback) {
        var img = new Image();
        img.onload = function() {
            callback(img.width > 0 && img.height > 0);
        };
        img.onerror = function() {
            callback(false);
        };

        // Test images
        if (format === 'webp') {
            img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        } else if (format === 'avif') {
            img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        }
    }

    /**
     * Handle the detection result for an image format
     * @param {string} format - The image format ('webp' or 'avif')
     * @param {boolean} isSupported - Whether the format is supported
     */
    function handleFormatSupport(format, isSupported) {
        if (isSupported) {
            document.documentElement.classList.add(format + '-support');
        } else {
            document.documentElement.classList.add('no-' + format);

            // Disable unsupported source elements
            var sources = document.querySelectorAll('source[type="image/' + format + '"]');
            for (var i = 0; i < sources.length; i++) {
                sources[i].setAttribute('data-disabled', 'true');
                sources[i].srcset = '';
            }
        }
    }

    // Test WebP support
    checkFormatSupport('webp', function(isSupported) {
        handleFormatSupport('webp', isSupported);
    });

    // Test AVIF support
    checkFormatSupport('avif', function(isSupported) {
        handleFormatSupport('avif', isSupported);
    });

    // Add CSS for fallback styling
    var style = document.createElement('style');
    style.textContent = `
        .no-webp source[type="image/webp"],
        .no-avif source[type="image/avif"] {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // MutationObserver to handle dynamically added picture/source elements
    if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeName === 'SOURCE') {
                            var type = node.getAttribute('type');
                            if ((type === 'image/webp' && !document.documentElement.classList.contains('webp-support')) ||
                                (type === 'image/avif' && !document.documentElement.classList.contains('avif-support'))) {
                                node.setAttribute('data-disabled', 'true');
                                node.srcset = '';
                            }
                        } else if (node.querySelectorAll) {
                            var sources = node.querySelectorAll('source[type="image/webp"], source[type="image/avif"]');
                            sources.forEach(function(source) {
                                var type = source.getAttribute('type');
                                if ((type === 'image/webp' && !document.documentElement.classList.contains('webp-support')) ||
                                    (type === 'image/avif' && !document.documentElement.classList.contains('avif-support'))) {
                                    source.setAttribute('data-disabled', 'true');
                                    source.srcset = '';
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})();
