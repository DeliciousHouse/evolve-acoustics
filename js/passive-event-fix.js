/**
 * Passive Event Listeners Fix
 *
 * This script makes touch events passive by default to improve
 * scrolling performance on mobile devices.
 */

(function() {
  // Detect if the browser supports passive event listeners
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}

  // If browser supports passive events, make touchstart/touchmove passive by default
  if (supportsPassive) {
    // Save reference to the original addEventListener
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    // Override addEventListener
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      // For touch events, make them passive by default unless explicitly specified
      if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
        // Default behavior: make passive true
        let newOptions = options;

        if (options === undefined || options === false) {
          newOptions = { passive: true };
        } else if (typeof options === 'object' && options.passive === undefined) {
          // Clone the options object to avoid modifying the original
          newOptions = Object.assign({}, options, { passive: true });
        }

        // Call the original method with new options
        originalAddEventListener.call(this, type, listener, newOptions);
      } else {
        // For all other events, use the original behavior
        originalAddEventListener.call(this, type, listener, options);
      }
    };

    // Helper function for adding passive event listeners
    window.addPassiveEventListener = function(element, eventName, callback) {
      element.addEventListener(eventName, callback, { passive: true });
    };
  } else {
    // Fallback for browsers that don't support passive
    window.addPassiveEventListener = function(element, eventName, callback) {
      element.addEventListener(eventName, callback);
    };
  }

  // Add special case handling for jQuery if it exists
  if (typeof jQuery !== 'undefined') {
    const originalOn = jQuery.fn.on;

    jQuery.fn.on = function() {
      // Convert arguments to array
      const args = Array.prototype.slice.call(arguments);

      // Check if this is a touch event binding
      if (typeof args[0] === 'string' &&
         (args[0].includes('touchstart') || args[0].includes('touchmove'))) {

        // If no options provided, add them
        if (args.length < 4 || typeof args[3] !== 'object') {
          args[3] = { passive: true };
        }
        // If options provided but passive not specified, add it
        else if (args[3].passive === undefined) {
          args[3].passive = true;
        }
      }

      // Call original method with new arguments
      return originalOn.apply(this, args);
    };
  }
})();
