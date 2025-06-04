# JavaScript Performance Optimizations

## Overview

This document details the JavaScript performance optimizations implemented on the Evolve Acoustics website to improve page load times, reduce rendering blocking, and enhance user interaction responsiveness.

## Key Optimizations

### 1. Deferred Script Loading

All non-critical JavaScript files are now loaded with the `defer` attribute, which:
- Allows HTML parsing to continue while scripts are downloaded
- Executes scripts only after HTML parsing is complete
- Maintains script execution order
- Reduces time to interactive metrics

**Example implementation:**
```html
<script src="js/utilities.js" defer></script>
<script src="js/main.js" defer></script>
```

**Exceptions:**
- `enhanced-preloader.js`: This script runs early in the page lifecycle to show the loading animation.
- Analytics/tracking scripts: These use `async` attributes.

### 2. Passive Event Listeners

Touch and wheel events are now configured as passive by default, allowing the browser to optimize scrolling performance.

**Implementation details:**
1. A polyfill (`passive-event-fix.js`) is loaded early in the page head
2. Event listeners for touch/scroll events are automatically made passive
3. For specific cases where `preventDefault()` is required, events are split into separate handlers

**Before:**
```javascript
$('.dropdown > a').on('click touchstart', function(e) {
    e.preventDefault();
    // Handle interaction
});
```

**After:**
```javascript
// Passive touchstart (no preventDefault)
$('.dropdown > a').on('touchstart', function() {
    $(this).data('touched', true);
});

// Click handler with preventDefault
$('.dropdown > a').on('click', function(e) {
    e.preventDefault();
    // Handle interaction
});
```

### 3. Optimized jQuery Usage

- Replaced `$(document).ready()` with native `DOMContentLoaded` events
- Cached jQuery selectors for repeated use
- Added passive event options to jQuery event bindings

### 4. Browser Support Considerations

These optimizations maintain full compatibility with:
- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- iOS Safari and Chrome
- Android Chrome and WebView

For older browsers without passive event support, a fallback mechanism ensures the site continues to work properly.

## Performance Impact

The implemented optimizations significantly improve the following metrics:
- First Input Delay (FID)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

## Testing and Verification

These optimizations can be verified using:
- Chrome DevTools Performance tab
- Lighthouse performance audits
- PageSpeed Insights
- WebPageTest.org

Look for "Avoid passive listener" warnings in the Console tab of DevTools to confirm that all event listeners are properly configured.

## Maintenance Guidelines

When adding new JavaScript functionality:
1. Always add the `defer` attribute to script tags
2. Use passive event listeners for touch and scroll interactions
3. Split events that need `preventDefault()` into separate handlers
4. Ensure any third-party scripts follow these same principles
