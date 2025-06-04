# Passive Event Listeners Implementation

## Overview

This document provides details on the implementation of passive event listeners across the Evolve Acoustics website to improve scroll performance and enhance user experience.

## What Are Passive Event Listeners?

Passive event listeners are a web platform feature that improve scrolling performance. By marking event listeners as `passive`, we tell the browser that the event listener will not call `preventDefault()`, allowing the browser to immediately start scrolling rather than waiting for JavaScript execution to determine if scrolling should be prevented.

## Benefits

- **Improved scroll performance**: The browser can begin scrolling immediately without waiting for JavaScript execution
- **Smoother touch interactions**: Especially beneficial on mobile devices
- **Better user experience**: Reduced input latency
- **Better browser resource management**: Lowers CPU and battery usage on mobile devices

## Implementation Details

### 1. Deferred JavaScript Loading

We've implemented deferred JavaScript loading to improve initial page load performance. All non-critical JavaScript files are loaded with the `defer` attribute, which allows the browser to continue parsing the HTML while downloading the script in the background, and only executes it after the HTML parsing is complete.

Benefits:
- Faster initial page rendering
- Reduced blocking of critical resources
- Better user experience, especially on slower connections

### 2. Split Touchstart/Click Event Handling

For mobile menu interactions that previously used combined `touchstart` and `click` events with `preventDefault()`, we've split these into separate handlers:
- A passive `touchstart` event that doesn't call `preventDefault()`
- A separate `click` event that handles the actual UI changes

This allows the browser to optimize touch interactions while maintaining the same user experience.

### 3. Feature Detection

We've added feature detection for passive event listeners support in `utilities.js`:

```javascript
window.passiveSupported = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      window.passiveSupported = true;
      return true;
    }
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {
  console.log('Passive event listeners are not supported');
}
```

### 2. Helper Function

We created a helper function to add event listeners with automatic passive option where appropriate:

```javascript
window.addPassiveEventListener = function(element, eventName, handler,
                                         forcePassive = false, forceActive = false) {
  const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel', 'touchend'];
  const shouldBePassive = (passiveEvents.includes(eventName) && !forceActive) || forcePassive;
  const options = window.passiveSupported && shouldBePassive ? { passive: true } : false;

  element.addEventListener(eventName, handler, options);

  return function() {
    element.removeEventListener(eventName, handler, options);
  };
};
```

### 3. Updated Event Listeners

We've updated all relevant event listeners to use the passive option, especially for:

- `touchstart`
- `touchmove`
- `wheel`
- `mousewheel`
- `touchend`
- `scroll`

### 4. Performance Monitoring

We've added performance monitoring to measure the impact of passive event listeners:

```javascript
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
  } catch (e) {
    console.log('Performance monitoring not supported in this browser');
  }
};
```

## Testing and Performance Verification

A test page has been created at `/passive-test.html` which demonstrates:

1. Whether the browser supports passive event listeners
2. The effect of passive vs non-passive event listeners on performance
3. The behavior of preventDefault() in passive listeners

## Files Modified

- `utilities.js` (new file) - Contains passive event listener detection and helper functions
- `main.js` - Updated event listeners for menus and UI interactions
- `image-optimization.js` - Updated image lazy loading event listeners
- `visual-issue-detector.js` - Updated visual fixes event listeners
- `evolve-visual-fixes.js` - Updated CSS loading and resize handlers
- `enhanced-preloader.js` - Updated loading event handlers
- `related-posts-clickable.js` - Updated post click handlers
- `load-grid-fixes.js` - Updated DOMContentLoaded handlers
- `index.html` - Added utilities.js script reference
- `performance-monitor.js` (new file) - Added performance monitoring capabilities
- `passive-test.html` (new file) - Test page for passive listener demonstration

## Browser Support

Passive event listeners are supported in all modern browsers:

- Chrome 51+
- Firefox 49+
- Safari 10+
- Edge 16+

For browsers that don't support passive event listeners, the site will continue to function normally, as our implementation includes feature detection.

## Future Enhancements

1. Consider extending performance monitoring to gather more detailed metrics
2. Review third-party scripts for non-passive event listener usage
3. Add automated tests to ensure passive event listeners are maintained in future code changes
