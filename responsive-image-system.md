# Responsive Image System

This document outlines the responsive image system implemented for the Evolve Acoustics website to optimize image delivery across different devices and screen sizes.

## Overview

The responsive image system automatically:

1. Generates multiple sizes of each image (320px, 640px, 960px, 1280px, 1920px)
2. Creates modern format versions (WebP, AVIF) alongside original formats (JPG/PNG)
3. Updates HTML files to use `<picture>` elements with appropriate `srcset` and `sizes` attributes
4. Provides fallback mechanisms for browsers that don't support modern formats

## Implementation Details

### Build Process

During the build process, the following steps are executed:

1. Original images are processed to create multiple resolutions
2. Each image is converted to WebP and AVIF formats for better compression
3. JavaScript files are configured to load with defer attribute to improve page loading performance
4. Passive event listeners are implemented for touch and wheel events to improve scrolling performance
3. HTML files are scanned and `<img>` elements are replaced with responsive `<picture>` elements
4. A manifest file is generated listing all processed images and their variations

### HTML Output

The system transforms standard image tags like:

```html
<img src="assets/images/example.jpg" alt="Example">
```

Into responsive picture elements:

```html
<picture>
  <source type="image/avif" srcset="assets/images/responsive/example-320w.avif 320w, ... example-1920w.avif 1920w" sizes="(min-width: 1200px) 50vw, 100vw">
  <source type="image/webp" srcset="assets/images/responsive/example-320w.webp 320w, ... example-1920w.webp 1920w" sizes="(min-width: 1200px) 50vw, 100vw">
  <img src="assets/images/example.jpg" srcset="assets/images/responsive/example-320w.jpg 320w, ... example-1920w.jpg 1920w" sizes="(min-width: 1200px) 50vw, 100vw" alt="Example" loading="lazy" decoding="async">
</picture>
```

### Format Support Detection

A JavaScript utility (`format-support-detector.js`) detects browser support for WebP and AVIF formats and applies appropriate CSS classes to the document element. This ensures fallback to supported formats when necessary.

## Image Categories

The system applies different `sizes` attributes based on the image's role in the page:

- Hero images: `100vw` (full viewport width)
- Logo: `200px` (fixed width)
- Blog images: `(min-width: 1200px) 1100px, (min-width: 768px) 700px, 100vw`
- Service items: `(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw`
- And more...

## Local Testing

You can test the responsive image generation locally using the `test-responsive-images.sh` script:

```bash
./test-responsive-images.sh
```

This will process images and HTML files without requiring a full Docker build.

## Benefits

1. **Faster Loading**: Smaller images load faster on mobile devices
2. **Bandwidth Savings**: Modern formats (WebP, AVIF) typically reduce file size by 30-50%
3. **Better SEO**: Page speed is a ranking factor for search engines
4. **Improved UX**: Users see appropriate image sizes for their devices
5. **Future-Proof**: Support for new formats can be added easily

## Maintenance

When adding new images:

1. Place them in the appropriate directory under `assets/images/`
2. No additional steps needed - the build process will handle responsive versions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge): Full support for WebP and/or AVIF
- Older browsers: Will use JPG/PNG fallbacks automatically

## JavaScript Performance Optimizations

In addition to responsive images, we've implemented several JavaScript performance optimizations:

### 1. Deferred Script Loading

All non-critical JavaScript files are loaded with the `defer` attribute, which:
- Allows HTML parsing to continue uninterrupted
- Improves initial page load and rendering times
- Maintains script execution order

Example:
```html
<script src="js/utilities.js" defer></script>
<script src="js/main.js" defer></script>
```

### 2. Passive Event Listeners

Touch and wheel events are configured as passive by default to improve scrolling performance:
- Implemented via a polyfill loaded early in the page
- Split event handlers for cases where `preventDefault()` is needed
- Optimizes scrolling on mobile devices

### 3. Image Loading Optimizations

- Lazy loading of images below the fold
- Format detection to serve appropriate image formats
- Progressive loading for better perceived performance

For more details, see the [JavaScript Performance Optimizations](javascript-performance-optimizations.md) document.
