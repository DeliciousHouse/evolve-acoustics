/**
 * Responsive Image Generator
 *
 * This script generates responsive versions of images in various sizes and formats
 * for optimal loading across different devices and screen sizes.
 */

const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
    // Image sizes to generate (widths in pixels)
    sizes: [320, 640, 960, 1280, 1920],

    // Quality settings
    quality: {
        webp: 80,
        jpg: 80,
        avif: 65
    },

    // Source image patterns - globs to match images in the project
    sourcePatterns: [
        '/app/src/assets/images/**/*.{jpg,jpeg,png,webp}',
        '!./app/src/assets/images/icons/**/*',
        '!./app/src/assets/images/placeholders/**/*',
        '!./app/src/assets/images/favicon.png',
        '!./app/src/assets/images/logo_*.{png,jpg,jpeg}'
    ],

    // Output directory structure
    outputBase: '/app/dist/assets/images/responsive'
};

// Create the output directory if it doesn't exist
fs.ensureDirSync(config.outputBase);

/**
 * Generate responsive versions of an image
 * @param {string} imagePath - Path to the source image
 * @returns {Promise} - A promise that resolves when all images are processed
 */
async function processImage(imagePath) {
    try {
        // Parse file information
        const parsedPath = path.parse(imagePath);
        const relativeDir = path.relative('/app/src/assets/images', parsedPath.dir);
        const outputDir = path.join(config.outputBase, relativeDir);
        const filename = parsedPath.name;

        // Create the output directory structure
        fs.ensureDirSync(outputDir);

        // Get image metadata
        const metadata = await sharp(imagePath).metadata();

        // Array to hold all processing promises
        const processPromises = [];

        // Process each size for WebP and original format
        for (const size of config.sizes) {
            // Skip sizes larger than the original image
            if (size > metadata.width) {
                continue;
            }

            // Generate WebP version
            const webpPromise = sharp(imagePath)
                .resize(size)
                .webp({ quality: config.quality.webp })
                .toFile(path.join(outputDir, `${filename}-${size}w.webp`));

            processPromises.push(webpPromise);

            // Generate AVIF version (more modern, smaller format)
            const avifPromise = sharp(imagePath)
                .resize(size)
                .avif({ quality: config.quality.avif })
                .toFile(path.join(outputDir, `${filename}-${size}w.avif`));

            processPromises.push(avifPromise);

            // Generate original format version (jpg/png)
            const originalFormatPromise = sharp(imagePath)
                .resize(size)
                .toFile(path.join(outputDir, `${filename}-${size}w${parsedPath.ext}`));

            processPromises.push(originalFormatPromise);
        }

        // Wait for all processing to finish
        await Promise.all(processPromises);
        console.log(`✓ Processed ${imagePath}`);

        // Return information about the processed image
        return {
            original: imagePath,
            sizes: config.sizes.filter(size => size <= metadata.width),
            outputDir,
            filename,
            extension: parsedPath.ext,
            relativePath: path.join(relativeDir, parsedPath.base)
        };
    } catch (err) {
        console.error(`✗ Error processing ${imagePath}:`, err);
        return null;
    }
}

/**
 * Generate a manifest of processed images and their variations
 * @param {Array} results - Array of processed image information
 */
function generateManifest(results) {
    const manifest = results.filter(Boolean).reduce((acc, img) => {
        if (!img) return acc;

        acc[img.relativePath] = {
            sizes: img.sizes,
            formats: ['webp', 'avif', img.extension.replace('.', '')],
            filename: img.filename,
            outputDir: path.relative('./dist', img.outputDir)
        };
        return acc;
    }, {});

    fs.writeFileSync(
        path.join(config.outputBase, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    console.log(`✓ Generated image manifest at ${path.join(config.outputBase, 'manifest.json')}`);
}

/**
 * Main function to process all images
 */
async function main() {
    try {
        // Get all source images matching patterns
        const sourceImages = config.sourcePatterns.reduce((acc, pattern) => {
            const matches = glob.sync(pattern);
            return acc.concat(matches);
        }, []);

        console.log(`Found ${sourceImages.length} images to process`);

        // Process all images in parallel with a concurrency limit
        const concurrencyLimit = 4; // Adjust based on your system's capabilities
        const results = [];

        for (let i = 0; i < sourceImages.length; i += concurrencyLimit) {
            const batch = sourceImages.slice(i, i + concurrencyLimit);
            const batchResults = await Promise.all(batch.map(processImage));
            results.push(...batchResults);
        }

        // Generate the manifest file
        generateManifest(results);

        console.log(`✓ Successfully processed ${results.filter(Boolean).length} images`);
    } catch (err) {
        console.error('Error during image processing:', err);
        process.exit(1);
    }
}

main();
