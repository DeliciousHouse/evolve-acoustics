/**
 * HTML Image Processor
 *
 * This script processes HTML files to add responsive image attributes
 * like srcset and sizes to existing img tags based on available responsive images.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

// Configuration
const config = {
    // Path to the responsive images manifest
    manifestPath: '/app/dist/assets/images/responsive/manifest.json',

    // HTML file patterns
    htmlPatterns: [
        '/app/src/*.html',
        '/app/src/pages/*.html',
        '/app/src/pages/blogs/*.html',
        '/app/src/templates/*.html'
    ],

    // Output directory for processed HTML files
    outputBase: '/app/dist',

    // Default sizes attribute for different image types
    defaultSizes: {
        'hero-image': '100vw',
        'logo-img': '200px',
        'blog-image': '(min-width: 1200px) 1100px, (min-width: 768px) 700px, 100vw',
        'service-item img': '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw',
        'testimonial img': '(min-width: 992px) 25vw, (min-width: 768px) 33vw, 100vw',
        'gallery-image': '(min-width: 1200px) 25vw, (min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw',
        'blog-post-image': '(min-width: 992px) 800px, (min-width: 768px) 700px, 100vw',
        'team-member-image': '(min-width: 992px) 350px, (min-width: 768px) 300px, 250px',
        'default': '(min-width: 1200px) 50vw, 100vw'
    }
};

/**
 * Process an HTML file to add responsive image attributes
 * @param {string} htmlFile - Path to the HTML file
 * @param {object} manifest - The responsive images manifest
 */
async function processHtmlFile(htmlFile, manifest) {
    try {
        // Determine appropriate paths based on HTML file location
        const relativePath = path.relative('/app/src', htmlFile);
        const outputPath = path.join(config.outputBase, relativePath);
        const outputDir = path.dirname(outputPath);

        // Ensure output directory exists
        fs.ensureDirSync(outputDir);

        // Read and parse HTML
        const html = fs.readFileSync(htmlFile, 'utf8');
        const $ = cheerio.load(html);

        // Track changes made to the file
        let changesMade = false;

        // Process each image
        $('img').each((i, imgElement) => {
            const img = $(imgElement);
            const src = img.attr('src');

            // Skip if no src, already has srcset, or is an external image
            if (!src || img.attr('srcset') || src.startsWith('http') || src.startsWith('data:')) {
                return;
            }

            // Normalize the image path to match manifest keys
            let normalizedSrc = src;
            if (src.startsWith('./')) {
                normalizedSrc = src.substring(2);
            }
            if (src.startsWith('assets/images/')) {
                normalizedSrc = src;
            } else if (src.startsWith('../assets/images/')) {
                normalizedSrc = src.replace('../', '');
            } else if (src.startsWith('../../assets/images/')) {
                normalizedSrc = src.replace('../../', '');
            }

            // Try to find this image in our manifest
            const manifestKey = `assets/images/${path.basename(normalizedSrc)}`;
            const manifestEntry = manifest[manifestKey] ||
                                 Object.entries(manifest).find(([key]) =>
                                    key.endsWith(path.basename(normalizedSrc)))?.[1];

            if (!manifestEntry) {
                console.log(`No responsive versions found for ${src}`);
                return;
            }

            // Generate srcset attribute
            const srcsetParts = [];

            // Add WebP srcset if browser supports it
            const webpSrcset = manifestEntry.sizes.map(size => {
                const relativePath = `assets/images/responsive/${path.dirname(manifestKey) === 'assets/images' ? '' : path.dirname(manifestKey).replace('assets/images/', '')}`;
                const imgPath = path.join(relativePath, `${manifestEntry.filename}-${size}w.webp`);
                // Adjust path based on HTML file location
                const adjustedPath = htmlFile.includes('/pages/blogs/')
                    ? `../../${imgPath}`
                    : htmlFile.includes('/pages/')
                        ? `../${imgPath}`
                        : imgPath;
                return `${adjustedPath} ${size}w`;
            }).join(', ');

            // Add AVIF srcset if browser supports it
            const avifSrcset = manifestEntry.sizes.map(size => {
                const relativePath = `assets/images/responsive/${path.dirname(manifestKey) === 'assets/images' ? '' : path.dirname(manifestKey).replace('assets/images/', '')}`;
                const imgPath = path.join(relativePath, `${manifestEntry.filename}-${size}w.avif`);
                // Adjust path based on HTML file location
                const adjustedPath = htmlFile.includes('/pages/blogs/')
                    ? `../../${imgPath}`
                    : htmlFile.includes('/pages/')
                        ? `../${imgPath}`
                        : imgPath;
                return `${adjustedPath} ${size}w`;
            }).join(', ');

            // Regular format srcset for fallback
            const regularSrcset = manifestEntry.sizes.map(size => {
                const relativePath = `assets/images/responsive/${path.dirname(manifestKey) === 'assets/images' ? '' : path.dirname(manifestKey).replace('assets/images/', '')}`;
                const extension = manifestEntry.formats.find(f => f !== 'webp' && f !== 'avif') || 'jpg';
                const imgPath = path.join(relativePath, `${manifestEntry.filename}-${size}w.${extension}`);
                // Adjust path based on HTML file location
                const adjustedPath = htmlFile.includes('/pages/blogs/')
                    ? `../../${imgPath}`
                    : htmlFile.includes('/pages/')
                        ? `../${imgPath}`
                        : imgPath;
                return `${adjustedPath} ${size}w`;
            }).join(', ');

            // Determine the appropriate sizes attribute based on the image's class or parent element
            let sizesAttr = config.defaultSizes.default;

            // Check for known image types
            for (const [selector, sizes] of Object.entries(config.defaultSizes)) {
                if (selector === 'default') continue;

                if (img.hasClass(selector.replace(' img', '')) ||
                    img.closest(`.${selector.replace(' img', '')}`).length ||
                    (selector.includes(' img') && img.parent().is(selector.replace(' img', '')))) {
                    sizesAttr = sizes;
                    break;
                }
            }

            // Create a picture element for modern format support
            const picture = $('<picture></picture>');
            const sourceAvif = $('<source></source>').attr({
                type: 'image/avif',
                srcset: avifSrcset,
                sizes: sizesAttr
            });

            const sourceWebp = $('<source></source>').attr({
                type: 'image/webp',
                srcset: webpSrcset,
                sizes: sizesAttr
            });

            // Update the original img
            img.attr({
                srcset: regularSrcset,
                sizes: sizesAttr,
                loading: img.attr('loading') || 'lazy',
                decoding: 'async'
            });

            // Clone the img element and its attributes
            const imgClone = img.clone();

            // Wrap the img in a picture element
            img.replaceWith(picture);
            picture.append(sourceAvif, sourceWebp, imgClone);

            changesMade = true;
        });

        if (changesMade) {
            // Write the modified HTML
            fs.writeFileSync(outputPath, $.html());
            console.log(`✓ Processed ${htmlFile} -> ${outputPath}`);
        } else {
            // Just copy the file if no changes were needed
            fs.copySync(htmlFile, outputPath);
            console.log(`→ No images to update in ${htmlFile}, copied to ${outputPath}`);
        }
    } catch (err) {
        console.error(`✗ Error processing HTML file ${htmlFile}:`, err);
    }
}

/**
 * Main function to process all HTML files
 */
async function main() {
    try {
        // Check if manifest exists
        if (!fs.existsSync(config.manifestPath)) {
            console.error(`Manifest file not found at ${config.manifestPath}. Run generate-responsive-images.js first.`);
            return;
        }

        // Load the image manifest
        const manifest = fs.readJsonSync(config.manifestPath);

        // Get all HTML files
        const htmlFiles = config.htmlPatterns.reduce((acc, pattern) => {
            const matches = glob.sync(pattern);
            return acc.concat(matches);
        }, []);

        console.log(`Found ${htmlFiles.length} HTML files to process`);

        // Process each HTML file
        for (const htmlFile of htmlFiles) {
            await processHtmlFile(htmlFile, manifest);
        }

        console.log('✓ HTML processing complete');
    } catch (err) {
        console.error('Error during HTML processing:', err);
        process.exit(1);
    }
}

main();
