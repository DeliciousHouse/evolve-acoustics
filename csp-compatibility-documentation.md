# CSP Compatibility for Evolve Acoustics Visual Enhancements

This document explains the changes made to ensure that all visual enhancements are compatible with Content Security Policy (CSP).

## What is Content Security Policy?

Content Security Policy (CSP) is a security feature implemented by modern web browsers. It allows website administrators to control what resources can be loaded and executed on their pages, helping prevent various types of attacks such as Cross-Site Scripting (XSS).

## Changes Made for CSP Compatibility

### 1. Image Optimization Script

**Before:**
- Used data URI scheme for placeholder images
- This approach was blocked by CSP

**After:**
- Uses file-based placeholder images
- Determines the correct path to the placeholder image based on the current page location
- All placeholders are referenced from the filesystem instead of using inline data URIs

```javascript
// Changed from data URI to file-based placeholder
if (originalSrc && !img.getAttribute('data-src')) {
    img.setAttribute('data-src', originalSrc);
    const basePath = window.location.pathname.includes('/pages/blogs/') ?
        '../../assets/images/placeholder.png' :
        window.location.pathname.includes('/pages/') ?
            '../assets/images/placeholder.png' :
            'assets/images/placeholder.png';
    img.setAttribute('src', basePath);
}
```

### 2. Enhanced Preloader

**Before:**
- Used template literals to generate HTML content
- Injected HTML directly using innerHTML
- This approach was blocked by CSP

**After:**
- Uses DOM creation methods to build the preloader structure
- All elements are created using standard DOM APIs
- No string-to-HTML conversion that could potentially be exploited

```javascript
// Changed from template literals to DOM creation methods
function createPreloaderElements() {
    const preloader = document.createElement('div');
    preloader.className = 'evolve-preloader';

    // More DOM element creation...

    return preloader;
}
```

### 3. CSS Image Transitions

**Before:**
- More aggressive fade-in effects
- Potentially affected by CSP restrictions

**After:**
- Simpler, more compatible opacity transitions
- Only apply fade effects to images that are being lazy loaded

```css
/* Changed image opacity handling for better compatibility */
img {
    transition: opacity 0.3s ease-in-out;
}

img.loaded {
    opacity: 1;
}

/* Only fade in images with data-src that are being lazy loaded */
img[data-src]:not(.loaded) {
    opacity: 0.2;
}
```

### 4. CSP Configuration

**Server Configuration:**
- Created .htaccess file with appropriate CSP headers
- Allows execution of scripts only from trusted sources
- Permits inline styles which are needed for some components

**HTML Meta Tags:**
- Added CSP meta tags to all HTML files as a fallback
- Ensures protection even if server headers are not applied correctly

## Implementation

To apply these CSP-compatible fixes, run:

```bash
./apply-csp-compatible-fixes.sh
```

This script will:
1. Apply all visual enhancements
2. Create the appropriate .htaccess file
3. Add CSP meta tags to all HTML files
4. Verify placeholder images exist
5. Check script compatibility

## Testing

After applying these changes, you should:

1. Test the website in different browsers
2. Check the browser console for CSP violation messages
3. Verify that all images load correctly with lazy loading
4. Ensure the preloader works properly on all pages
5. Test all interactive elements to ensure they function correctly

CSP violations will be reported in the browser's developer console.

## Additional Resources

- [MDN Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
