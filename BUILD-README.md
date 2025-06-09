# Evolve Acoustics Build System

This build system provides a comprehensive way to optimize the Evolve Acoustics website for production deployment. It performs all the optimizations that were previously handled by the Dockerfile.

## Features

- HTML, CSS, and JavaScript minification
- Responsive image generation
- Script defer attribute addition
- Passive event listener optimization
- Critical CSS inlining
- Image optimization
- Path fixing for different page levels
- Automatic directory structure creation

## Prerequisites

- Node.js (v14 or higher)
- NPM (v7 or higher)

## Installation

```bash
# Install all dependencies
npm install
```

## Usage

To build the website for production:

```bash
npm run build
```

This will process the entire website and output all optimized files to the `dist` directory.

## Build Steps

The build script (`scripts/build.js`) performs these steps in sequence:

1. **Clean build directory**: Removes previous build artifacts
2. **Create directory structure**: Prepares output folder structure
3. **Create required CSS files**: Generates utility CSS files
4. **Create required JS files**: Generates utility JS files
5. **Process CSS files**: Minifies and copies CSS files
6. **Process JavaScript files**: Fixes paths and minifies JS files
7. **Generate responsive images**: Creates optimized images in different sizes
8. **Minify HTML files**: Compresses all HTML files
9. **Process HTML for responsive images**: Updates image tags for responsive loading
10. **Add defer to scripts**: Adds defer attribute to script tags
11. **Add passive event fix**: Adds performance optimization for event listeners
12. **Copy and optimize images**: Copies and compresses all images
13. **Copy miscellaneous files**: Copies files like ads.txt, robots.txt, etc.
14. **Process critical CSS**: Inlines critical CSS and sets up async loading for non-critical CSS

## Development

To add new build features, modify the `scripts/build.js` file.

## Individual Build Tasks

The package.json also defines individual build tasks that can be run separately:

```bash
# Minify HTML files only
npm run minify-html

# Minify CSS files only
npm run minify-css

# Minify JS files only
npm run minify-js

# Optimize images only
npm run optimize-images

# Generate responsive images only
npm run responsive-images

# Process HTML with responsive images only
npm run process-html
```

## Output

After running the build script, the `dist` directory will contain the optimized website ready for deployment.
