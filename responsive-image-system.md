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

## Performance Optimizations

### Critical CSS

The system includes a critical CSS implementation that:

1. Extracts essential above-the-fold styles into a separate `critical.css` file
2. Inlines these critical styles directly in the HTML `<head>` section
3. Defers loading of non-critical CSS files using the `preload` strategy
4. Uses a polyfill (css-loader.js) to ensure browsers support this pattern

This approach significantly improves page load performance metrics like First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

### Implementation

The critical CSS implementation is handled by:

1. The `css/critical.css` file containing minimal styles for above-the-fold content
2. The `inject-critical-css.sh` script that injects these styles into HTML files
3. A small JavaScript loader that manages the asynchronous loading pattern

During the Docker build process, these optimizations are automatically applied to all HTML files.
