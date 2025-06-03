/**
 * Evolve Acoustics Utilities
 *
 * General utility functions and performance enhancements.
 */

// Passive event listener support detection
window.passiveSupported = false;
try {
  // Test via a getter in the options object to see if the passive property is accessed
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      window.passiveSupported = true;
      return true;
    }
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
  console.log('Passive event listeners are supported');
} catch (e) {
  console.log('Passive event listeners are not supported');
}

/**
 * Add an event listener with automatic passive option when appropriate
 *
 * @param {Element} element - The DOM element to attach the event to
 * @param {string} eventName - The event name (e.g., 'scroll', 'touchstart')
 * @param {Function} handler - The event handler function
 * @param {boolean} forcePassive - Force passive mode (optional)
 * @param {boolean} forceActive - Force non-passive mode, for cases where preventDefault() is required (optional)
 * @return {Function} - Removal function that can be called to remove the listener
 */
window.addPassiveEventListener = function(element, eventName, handler, forcePassive = false, forceActive = false) {
  // Touch and wheel events benefit most from passive listeners
  const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel', 'touchend'];

  // Determine if this event should be passive
  const shouldBePassive = (passiveEvents.includes(eventName) && !forceActive) || forcePassive;

  // Only use passive option if the browser supports it
  const options = window.passiveSupported && shouldBePassive ? { passive: true } : false;

  // Log when we're NOT using passive for events that typically benefit from it
  if (passiveEvents.includes(eventName) && !shouldBePassive) {
    console.log(`Non-passive event listener added for ${eventName} (using preventDefault)`);
  }

  // Add the event listener
  element.addEventListener(eventName, handler, options);

  // Return a removal function for easy cleanup
  return function() {
    element.removeEventListener(eventName, handler, options);
  };
};

/**
 * Simple performance monitoring for event handlers
 */
window.monitorEventPerformance = function() {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only look at event handlers taking more than 50ms
        if (entry.duration > 50 && entry.name.includes('event')) {
          console.warn(`Long task detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    console.log('Performance monitoring for events initialized');
  } catch (e) {
    console.log('Performance monitoring not supported in this browser');
  }
};

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', function() {
  window.monitorEventPerformance();
});
