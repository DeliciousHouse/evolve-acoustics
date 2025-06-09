/**
 * Master Build Script for Evolve Acoustics Website
 *
 * This script performs all optimization steps in the build process:
 * 1. Create directory structure
 * 2. Create required CSS files
 * 3. Minify CSS files
 * 4. Process JavaScript files (path fixing and minification)
 * 5. Generate responsive images
 * 6. Minify HTML files
 * 7. Process HTML to add responsive image attributes
 * 8. Add defer attributes to scripts
 * 9. Add passive event fix script
 * 10. Copy and optimize images
 * 11. Copy misc files (ads.txt, robots.txt, etc.)
 */

const fs = require('fs-extra');
const path = require('path');
const { exec, execSync } = require('child_process');
const glob = require('glob');
const cheerio = require('cheerio');

// Configuration
const config = {
  srcDir: path.resolve(__dirname, '../'),
  distDir: path.resolve(__dirname, '../dist'),
  tempDir: path.resolve(__dirname, '../.build-temp'),

  // Image processing
  imageSizes: [320, 640, 960, 1280, 1920],

  // Script paths
  responsiveImagesScript: path.resolve(__dirname, './generate-responsive-images.js'),
  processHtmlImagesScript: path.resolve(__dirname, './process-html-images.js')
};

// Create a logger for build progress
const logger = {
  step: (message) => console.log(`\n\x1b[36m>>> ${message}\x1b[0m`),
  info: (message) => console.log(`\x1b[32m${message}\x1b[0m`),
  warn: (message) => console.log(`\x1b[33m⚠️  ${message}\x1b[0m`),
  error: (message) => console.error(`\x1b[31m❌ ${message}\x1b[0m`)
};

// Ensure clean build directory
function cleanBuildDir() {
  logger.step('Cleaning build directory');
  fs.emptyDirSync(config.distDir);
  fs.ensureDirSync(config.tempDir);
}

// Create directory structure
function createDirectoryStructure() {
  logger.step('Creating directory structure');

  // Base directories
  const dirs = [
    `${config.distDir}/assets/images`,
    `${config.distDir}/assets/images/blogs`,
    `${config.distDir}/assets/images/responsive`,
    `${config.distDir}/css/fontawesome`,
    `${config.distDir}/webfonts`,
    `${config.distDir}/js`,
    `${config.distDir}/pages/blogs`,
    `${config.distDir}/templates`
  ];

  dirs.forEach(dir => {
    fs.ensureDirSync(dir);
    logger.info(`Created directory: ${path.basename(dir)}`);
  });
}

// Create required CSS files
function createRequiredCSSFiles() {
  logger.step('Creating required CSS files');

  const cssFiles = {

    'anti-jitter.css': `/**
 * Anti-Jitter CSS
 *
 * This stylesheet prevents screen jitter and improves the visual stability
 * of the Evolve Acoustics website through several optimizations.
 */

/* Content-Visibility Control - Improve rendering performance */
.content-block {
  content-visibility: auto;
  contain-intrinsic-size: 1px 1000px; /* Reserve space for content */
}

/* Force hardware acceleration for smoother animations and scrolling */
body {
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  -moz-perspective: 1000;
  -ms-perspective: 1000;
  perspective: 1000;
}

/* Prevent CLS (Cumulative Layout Shift) for images */
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Pre-define aspect ratio for common elements to prevent layout shifts */
.blog-card-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

/* Prevent font-based layout shifts */
html {
  font-size: 100%; /* Ensures consistent base font size */
  text-size-adjust: 100%; /* Prevents mobile browsers from automatically adjusting font sizes */
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
}`,

    'fixed-header.css': `/**
 * Fixed Header CSS
 *
 * This stylesheet implements a fixed header that remains visible while scrolling
 * without causing layout shifts or performance issues.
 */

/* Fixed header base styles */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  /* Hardware acceleration for smoother performance */
  transform: translateZ(0);
  will-change: transform, box-shadow;
}

/* Create space for the fixed header */
body {
  padding-top: 230px; /* Adjust based on header height + extra padding */
}

/* Header shrink effect on scroll */
.header-shrink {
  transform: translateY(-20px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.header-shrink .logo-img {
  height: 337.5px; /* Reduce logo size when scrolling (1.5x from 225px) */
  transition: height 0.3s ease;
}`,

    /* No individual enhanced-preloader.css here - it's been consolidated into visual-enhancements.css */
  };

  // Write each CSS file
  Object.entries(cssFiles).forEach(([filename, content]) => {
    fs.writeFileSync(`${config.distDir}/css/${filename}`, content);
    logger.info(`Created CSS file: ${filename}`);
  });
}

// Create required JavaScript files
function createRequiredJSFiles() {
  logger.step('Creating required JavaScript files');

  const jsFiles = {
    'fixed-header.js': `/**
 * Fixed Header Script
 *
 * This script handles the behavior of the fixed header, implementing:
 * - Header shrinking on scroll
 * - Performance optimized with throttling
 */

document.addEventListener('DOMContentLoaded',function(){const e=document.querySelector('header');if(!e)return;let t=0,n=!1;function r(){const r=window.pageYOffset||document.documentElement.scrollTop;r>50?e.classList.add('header-shrink'):e.classList.remove('header-shrink'),t=r<=0?0:r}function o(){n||(window.requestAnimationFrame(()=>{r(),n=!1}),n=!0)}r(),window.addEventListener('scroll',o,{passive:!0}),document.querySelectorAll('a[href^="#"]').forEach(t=>{t.addEventListener('click',function(t){const n=document.querySelector(this.getAttribute('href'));if(n){t.preventDefault();const r=e.offsetHeight,o=n.getBoundingClientRect().top+window.pageYOffset-r-20;window.scrollTo({top:o,behavior:'smooth'})}})})});`,

    'passive-event-fix.js': `/* PassiveEventFix - Improves scroll performance with passive event listeners */
!function(){var e=!1;try{var t=Object.defineProperty({},"passive",{get:function(){e=!0}});window.addEventListener("test",null,t),window.removeEventListener("test",null,t)}catch(t){e=!1}var n=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(t,o,i){var s=!i||"object"!=typeof i?{}:i,r=this;function a(t){var e=r.document?r.document.documentElement.scrollTop:0;o.call(r,t),requestAnimationFrame(function(){var t=r.document?r.document.documentElement.scrollTop:0;0!==t&&0!==e||window.dispatchEvent(new CustomEvent("scroll"))})}["scroll","touchstart","touchmove","wheel"].includes(t)&&(i&&void 0!==i.passive||(s.passive=!0),n.call(this,t,"scroll"===t&&o?a:o,s))}}();`,

    'css-loader-min.js': `/*! loadCSS. [c]2017 Filament Group, Inc. MIT License */
(function(w){
  var loadCSS = function(href, before, media) {
    var doc = w.document;
    var ss = doc.createElement("link");
    ss.rel = "stylesheet";
    ss.href = href;
    ss.media = "only x";
    doc.head.appendChild(ss);
    setTimeout(function(){
      ss.media = media || "all";
    }, 0);
    return ss;
  };
  w.loadCSS = loadCSS;
}(typeof global !== "undefined" ? global : this));`
  };

  // Write each JS file
  Object.entries(jsFiles).forEach(([filename, content]) => {
    fs.writeFileSync(`${config.distDir}/js/${filename}`, content);
    logger.info(`Created JS file: ${filename}`);
  });
}

// Copy source CSS files and minify them
function processCSSFiles() {
  logger.step('Processing CSS files');

  // Copy CSS files from source
  const cssSourceDir = path.join(config.srcDir, 'css');
  if (fs.existsSync(cssSourceDir)) {
    // List all CSS files in source directory
    const cssFiles = glob.sync(`${cssSourceDir}/*.css`);
    logger.info(`Found ${cssFiles.length} CSS files in source directory: ${cssFiles.map(file => path.basename(file)).join(', ')}`);

    // First try to minify all CSS files
    try {
      execSync(`npx csso-cli --input ${cssSourceDir} --output ${config.distDir}/css --comments none`, { stdio: 'inherit' });
      logger.info('CSS files minified successfully');

      // Verify that all files were actually minified
      const minifiedFiles = glob.sync(`${config.distDir}/css/*.css`);
      logger.info(`Minified ${minifiedFiles.length} CSS files`);

      // Check which files might be missing
      const sourceFileNames = cssFiles.map(file => path.basename(file));
      const minifiedFileNames = minifiedFiles.map(file => path.basename(file));

      const missingFiles = sourceFileNames.filter(file => !minifiedFileNames.includes(file));
      if (missingFiles.length > 0) {
        logger.warn(`Some CSS files were not minified: ${missingFiles.join(', ')}`);
        logger.info('Copying missing files directly without minification');

        // Copy missing files directly
        missingFiles.forEach(filename => {
          const sourcePath = path.join(cssSourceDir, filename);
          const destPath = path.join(config.distDir, 'css', filename);
          fs.copyFileSync(sourcePath, destPath);
          logger.info(`Copied (not minified): ${filename}`);
        });
      }
    } catch (error) {
      logger.error('Error minifying CSS files, falling back to direct copy');
      console.error(error);

      // Fallback: copy all CSS files directly
      cssFiles.forEach(file => {
        const filename = path.basename(file);
        const destPath = path.join(config.distDir, 'css', filename);
        fs.copyFileSync(file, destPath);
        logger.info(`Copied (fallback): ${filename}`);
      });
    }

    // Check for specific critical CSS files
    const requiredCssFiles = [
      'style.css',
      'responsive.css',
      'navigation.css',
      'visual-enhancements.css',
      'forms-contact.css'
    ];

    // Verify each required file exists in the destination
    requiredCssFiles.forEach(file => {
      const destPath = path.join(config.distDir, 'css', file);
      if (!fs.existsSync(destPath)) {
        const sourcePath = path.join(cssSourceDir, file);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          logger.info(`Copied missing required file: ${file}`);
        } else {
          logger.error(`CRITICAL: Required CSS file not found in source: ${file}`);
        }
      }
    });
  } else {
    logger.warn('CSS source directory not found');
  }

  // Copy FontAwesome files if they exist
  const fontAwesomeSrc = path.join(config.srcDir, 'css/fontawesome');
  if (fs.existsSync(fontAwesomeSrc)) {
    fs.copySync(fontAwesomeSrc, path.join(config.distDir, 'css/fontawesome'));
    logger.info('FontAwesome CSS copied');
  }

  // Copy webfonts if they exist
  const webfontsSrc = path.join(config.srcDir, 'assets/webfonts');
  if (fs.existsSync(webfontsSrc)) {
    fs.copySync(webfontsSrc, path.join(config.distDir, 'webfonts'));
    logger.info('Webfonts copied');
  }
}

// Process JavaScript files - Path fixing and minification
function processJSFiles() {
  logger.step('Processing JavaScript files');

  // Copy JS files from source to dist
  const jsSourceDir = path.join(config.srcDir, 'js');
  const jsDistDir = path.join(config.distDir, 'js');

  if (fs.existsSync(jsSourceDir)) {
    // Create temp directory for original files
    const jsTempDir = path.join(config.tempDir, 'js_original');
    fs.ensureDirSync(jsTempDir);

    // Copy all JS files to temp directory for processing
    glob.sync(`${jsSourceDir}/*.js`).forEach(file => {
      const filename = path.basename(file);
      const destPath = path.join(jsTempDir, filename);
      fs.copyFileSync(file, destPath);

      // Fix absolute paths if needed
      let content = fs.readFileSync(destPath, 'utf8');
      if (content.includes('/css/')) {
        logger.info(`Fixing paths in ${filename}`);

        // Add getBasePath function if it doesn't exist
        if (!content.includes('function getBasePath()')) {
          const basePathFunction = `
// Determine the base path based on the current URL
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/blogs/')) {
        return '../../';
    } else if (path.includes('/pages/') || path.includes('/templates/')) {
        return '../';
    }
    return '';
}
`;

          // Insert function at appropriate place
          if (content.includes('DOMContentLoaded')) {
            const parts = content.split('DOMContentLoaded');
            content = parts[0] + 'DOMContentLoaded' + basePathFunction + parts[1].substring(parts[1].indexOf(')'));
          } else {
            content = basePathFunction + content;
          }
        }

        // Replace absolute paths
        content = content.replace(/["']\/css\//g, '"" + getBasePath() + "css/');
        content = content.replace(/['']\/css\//g, "'' + getBasePath() + 'css/");

        // Write the updated content
        fs.writeFileSync(destPath, content);
      }
    });

    // Minify all JavaScript files
    logger.info('Minifying JavaScript files...');
    glob.sync(`${jsTempDir}/*.js`).forEach(file => {
      const filename = path.basename(file);
      const outputPath = path.join(jsDistDir, filename);

      try {
        execSync(`npx uglify-js "${file}" -c -m -o "${outputPath}"`, { stdio: 'pipe' });
        logger.info(`Minified: ${filename}`);
      } catch (error) {
        logger.warn(`Could not minify ${filename}, keeping original`);
        fs.copyFileSync(file, outputPath);
      }
    });
  } else {
    logger.warn('JavaScript source directory not found');
  }
}

// Generate responsive images
function generateResponsiveImages() {
  logger.step('Generating responsive images');

  // Update script paths to work outside Docker
  const tempScriptPath = path.join(config.tempDir, 'generate-responsive-images.js');

  // Read the original script and modify paths to work with local file system
  let scriptContent = fs.readFileSync(config.responsiveImagesScript, 'utf8');
  scriptContent = scriptContent.replace(/\/app\/src/g, config.srcDir);
  scriptContent = scriptContent.replace(/\/app\/dist/g, config.distDir);

  // Write the modified script to temp location
  fs.writeFileSync(tempScriptPath, scriptContent);

  // Execute the script
  try {
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });
    logger.info('Responsive images generated successfully');
  } catch (error) {
    logger.error('Error generating responsive images');
    console.error(error);
  }
}

// Minify HTML files
function minifyHtmlFiles() {
  logger.step('Minifying HTML files');

  const htmlMinOptions = '--collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true';

  // Root HTML files
  glob.sync(`${config.srcDir}/*.html`).forEach(file => {
    const filename = path.basename(file);
    const output = path.join(config.distDir, filename);

    try {
      execSync(`npx html-minifier ${htmlMinOptions} "${file}" -o "${output}"`, { stdio: 'pipe' });
      logger.info(`Minified: ${filename}`);
    } catch (error) {
      logger.warn(`Could not minify ${filename}, copying original`);
      fs.copyFileSync(file, output);
    }
  });

  // HTML files in pages directory
  glob.sync(`${config.srcDir}/pages/*.html`).forEach(file => {
    const filename = path.basename(file);
    const outputDir = path.join(config.distDir, 'pages');
    const output = path.join(outputDir, filename);

    try {
      execSync(`npx html-minifier ${htmlMinOptions} "${file}" -o "${output}"`, { stdio: 'pipe' });
      logger.info(`Minified: pages/${filename}`);
    } catch (error) {
      logger.warn(`Could not minify pages/${filename}, copying original`);
      fs.copyFileSync(file, output);
    }
  });

  // HTML files in pages/blogs directory
  glob.sync(`${config.srcDir}/pages/blogs/*.html`).forEach(file => {
    const filename = path.basename(file);
    const outputDir = path.join(config.distDir, 'pages/blogs');
    const output = path.join(outputDir, filename);

    try {
      execSync(`npx html-minifier ${htmlMinOptions} "${file}" -o "${output}"`, { stdio: 'pipe' });
      logger.info(`Minified: pages/blogs/${filename}`);
    } catch (error) {
      logger.warn(`Could not minify pages/blogs/${filename}, copying original`);
      fs.copyFileSync(file, output);
    }
  });

  // HTML files in templates directory
  const templatesDir = path.join(config.srcDir, 'templates');
  if (fs.existsSync(templatesDir)) {
    glob.sync(`${templatesDir}/*.html`).forEach(file => {
      const filename = path.basename(file);
      const outputDir = path.join(config.distDir, 'templates');
      const output = path.join(outputDir, filename);

      try {
        execSync(`npx html-minifier ${htmlMinOptions} "${file}" -o "${output}"`, { stdio: 'pipe' });
        logger.info(`Minified: templates/${filename}`);
      } catch (error) {
        logger.warn(`Could not minify templates/${filename}, copying original`);
        fs.copyFileSync(file, output);
      }
    });
  }
}

// Process HTML to add responsive image attributes
function processHtmlWithResponsiveImages() {
  logger.step('Processing HTML for responsive images');

  // Update script paths to work outside Docker
  const tempScriptPath = path.join(config.tempDir, 'process-html-images.js');

  // Read the original script and modify paths to work with local file system
  let scriptContent = fs.readFileSync(config.processHtmlImagesScript, 'utf8');
  scriptContent = scriptContent.replace(/\/app\/src/g, config.srcDir);
  scriptContent = scriptContent.replace(/\/app\/dist/g, config.distDir);

  // Write the modified script to temp location
  fs.writeFileSync(tempScriptPath, scriptContent);

  // Execute the script
  try {
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });
    logger.info('HTML files processed for responsive images');
  } catch (error) {
    logger.error('Error processing HTML for responsive images');
    console.error(error);
  }
}

// Add defer attribute to scripts
function addDeferToScripts() {
  logger.step('Adding defer attribute to scripts');

  // Process index.html
  const indexPath = path.join(config.distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    content = content
      .replace(/<script src="https:\/\/code\.jquery\.com\/jquery-3\.6\.0\.min\.js"><\/script>/g, '<script src="https://code.jquery.com/jquery-3.6.0.min.js" defer></script>')
      .replace(/<script src="js\/utilities\.js"><\/script>/g, '<script src="js/utilities.js" defer></script>')
      .replace(/<script src="js\/main\.js"><\/script>/g, '<script src="js/main.js" defer></script>')
      .replace(/<script src="js\/evolve-visual-fixes\.js"><\/script>/g, '<script src="js/evolve-visual-fixes.js" defer></script>')
      .replace(/<script src="js\/visual-issue-detector\.js"><\/script>/g, '<script src="js/visual-issue-detector.js" defer></script>')
      .replace(/<script src="js\/performance-monitor\.js"><\/script>/g, '<script src="js/performance-monitor.js" defer></script>');

    fs.writeFileSync(indexPath, content);
    logger.info('Added defer attributes in index.html');
  }

  // Process pages directory HTML files
  glob.sync(`${config.distDir}/pages/*.html`).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    content = content
      .replace(/<script src="..\/js\/utilities\.js"><\/script>/g, '<script src="../js/utilities.js" defer></script>')
      .replace(/<script src="..\/js\/main\.js"><\/script>/g, '<script src="../js/main.js" defer></script>')
      .replace(/<script src="..\/js\/evolve-visual-fixes\.js"><\/script>/g, '<script src="../js/evolve-visual-fixes.js" defer></script>')
      .replace(/<script src="..\/js\/visual-issue-detector\.js"><\/script>/g, '<script src="../js/visual-issue-detector.js" defer></script>')
      .replace(/<script src="..\/js\/performance-monitor\.js"><\/script>/g, '<script src="../js/performance-monitor.js" defer></script>')
      .replace(/<script src="..\/js\/fixed-header\.js"><\/script>/g, '<script src="../js/fixed-header.js" defer></script>')
      .replace(/<script src="..\/js\/blog-text-fix\.js"><\/script>/g, '<script src="../js/blog-text-fix.js" defer></script>');

    fs.writeFileSync(file, content);
    logger.info(`Added defer attributes in ${path.basename(file)}`);
  });

  // Process pages/blogs directory HTML files
  glob.sync(`${config.distDir}/pages/blogs/*.html`).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    content = content
      .replace(/<script src="..\/..\/js\/utilities\.js"><\/script>/g, '<script src="../../js/utilities.js" defer></script>')
      .replace(/<script src="..\/..\/js\/main\.js"><\/script>/g, '<script src="../../js/main.js" defer></script>')
      .replace(/<script src="..\/..\/js\/evolve-visual-fixes\.js"><\/script>/g, '<script src="../../js/evolve-visual-fixes.js" defer></script>')
      .replace(/<script src="..\/..\/js\/visual-issue-detector\.js"><\/script>/g, '<script src="../../js/visual-issue-detector.js" defer></script>')
      .replace(/<script src="..\/..\/js\/performance-monitor\.js"><\/script>/g, '<script src="../../js/performance-monitor.js" defer></script>');

    fs.writeFileSync(file, content);
    logger.info(`Added defer attributes in ${path.basename(file)}`);
  });
}

// Add passive event fix script
function addPassiveEventFix() {
  logger.step('Adding passive event fix script');

  // Process index.html
  const indexPath = path.join(config.distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    if (!content.includes('passive-event-fix.js')) {
      content = content.replace(/<head>/, '<head>\n    <script data-cfasync="false" src="js/passive-event-fix.js"></script>');
      fs.writeFileSync(indexPath, content);
      logger.info('Added passive event fix to index.html');
    }
  }

  // Process pages directory HTML files
  glob.sync(`${config.distDir}/pages/*.html`).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('passive-event-fix.js')) {
      content = content.replace(/<head>/, '<head>\n    <script data-cfasync="false" src="../js/passive-event-fix.js"></script>');
      fs.writeFileSync(file, content);
      logger.info(`Added passive event fix to ${path.basename(file)}`);
    }
  });

  // Process pages/blogs directory HTML files
  glob.sync(`${config.distDir}/pages/blogs/*.html`).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('passive-event-fix.js')) {
      content = content.replace(/<head>/, '<head>\n    <script data-cfasync="false" src="../../js/passive-event-fix.js"></script>');
      fs.writeFileSync(file, content);
      logger.info(`Added passive event fix to ${path.basename(file)}`);
    }
  });
}

// Copy and optimize images
function copyAndOptimizeImages() {
  logger.step('Copying and optimizing all image assets');

  const imagesSourceDir = path.join(config.srcDir, 'assets/images');
  const imagesDistDir = path.join(config.distDir, 'assets/images');

  logger.info(`Source directory: ${imagesSourceDir}`);
  logger.info(`Destination directory: ${imagesDistDir}`);

  if (fs.existsSync(imagesSourceDir)) {
    logger.info('Source directory found. Starting copy...');
    try {
      // Ensure the destination directory exists
      fs.ensureDirSync(imagesDistDir);

      // Copy all files from source to destination, overwriting any existing files.
      // This is crucial to ensure CSS background images are included.
      fs.copySync(imagesSourceDir, imagesDistDir, { overwrite: true });
      logger.info('Successfully copied all files from source assets/images.');

      // Optional: Log files found in source to help debug
      const sourceFiles = fs.readdirSync(imagesSourceDir);
      logger.info(`Found ${sourceFiles.length} files in source, including: ${sourceFiles.slice(0, 5).join(', ')}...`);
      if (!sourceFiles.includes('mahogany_texture.webp')) {
          logger.warn('WARNING: mahogany_texture.webp was not found in the source directory!');
      }

      // After copying, optimize all images in the destination
      logger.info('Optimizing images in destination directory...');
      execSync(`npx imagemin "${imagesDistDir}/**/*.{jpg,jpeg,png,gif,svg,webp}" --out-dir=${imagesDistDir} --plugin=mozjpeg --plugin=pngquant --plugin=gifsicle --plugin=svgo`,
        { stdio: 'inherit' });
      logger.info('Image optimization complete.');

    } catch (error) {
      logger.error('An error occurred during image copy or optimization.');
      console.error(error);
    }
  } else {
    logger.error('CRITICAL: Image source directory not found. Cannot copy images.');
  }
}

// Copy misc files (ads.txt, robots.txt, sitemap.xml)
function copyMiscFiles() {
  logger.step('Copying miscellaneous files');

  // List of files to copy from root directory
  const filesToCopy = ['ads.txt', 'robots.txt', 'sitemap.xml'];

  filesToCopy.forEach(file => {
    const srcPath = path.join(config.srcDir, file);
    const destPath = path.join(config.distDir, file);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      logger.info(`Copied: ${file}`);
    }
  });
}

// Add CSS loader script and inline critical CSS
function processCriticalCSS() {
  logger.step('Processing critical CSS');

  // Add CSS loader script to HTML files
  const indexPath = path.join(config.distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // Add CSS loader script if not already present
    if (!content.includes('css-loader-min.js')) {
      content = content.replace(/<\/head>/, '    <script src="js/css-loader-min.js"></script>\n</head>');
      fs.writeFileSync(indexPath, content);
      logger.info('Added CSS loader script to index.html');
    }

    // Inline critical CSS if available
    const criticalCssPath = path.join(config.distDir, 'css/critical.css');
    if (fs.existsSync(criticalCssPath)) {
      const criticalCSS = fs.readFileSync(criticalCssPath, 'utf8');
      const styleTag = `<!-- Critical CSS for above-the-fold content -->\n<style>\n${criticalCSS}\n</style>`;

      if (!content.includes('Critical CSS for above-the-fold')) {
        content = content.replace(/<head>/, `<head>\n${styleTag}`);

        // Async load non-critical CSS
        content = content.replace(/<link rel="stylesheet" href="css\/style\.css">/,
          '<!-- Non-critical CSS loaded asynchronously -->\n    <link rel="preload" href="css/style.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n    <noscript><link rel="stylesheet" href="css/style.css"></noscript>');

        fs.writeFileSync(indexPath, content);
        logger.info('Inlined critical CSS in index.html');
      }
    }
  }
}

// Main build function
async function build() {
  try {
    console.log('\n\x1b[1;36m========================================\x1b[0m');
    console.log('\x1b[1;36m Evolve Acoustics Website Build Process \x1b[0m');
    console.log('\x1b[1;36m========================================\x1b[0m\n');

    // Execute build steps in sequence
    cleanBuildDir();
    createDirectoryStructure();
    createRequiredCSSFiles();
    createRequiredJSFiles();
    processCSSFiles();
    processJSFiles();
    generateResponsiveImages();
    minifyHtmlFiles();
    processHtmlWithResponsiveImages();
    addDeferToScripts();
    addPassiveEventFix();
    copyAndOptimizeImages();
    copyMiscFiles();
    processCriticalCSS();

    // Clean up temporary files
    fs.removeSync(config.tempDir);

    logger.step('Build completed successfully! 🎉');
    console.log('\nOutput files are available in the "dist" directory.');

  } catch (error) {
    logger.error('Build failed');
    console.error(error);
    process.exit(1);
  }
}

// Run the build process
build();
