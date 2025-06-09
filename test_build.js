/**
 * Simple test script to verify CSS file copying
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  srcDir: path.resolve(__dirname),
  distDir: path.resolve(__dirname, 'dist'),
};

console.log('=== CSS File Processing Test ===');

// Ensure dist directory exists
fs.ensureDirSync(path.join(config.distDir, 'css'));

// List all CSS files in source
const cssSourceDir = path.join(config.srcDir, 'css');
const cssFiles = glob.sync(`${cssSourceDir}/*.css`);

console.log(`Found ${cssFiles.length} CSS files in source: ${cssFiles.map(f => path.basename(f)).join(', ')}`);

// Copy all CSS files to dist
cssFiles.forEach(file => {
  const filename = path.basename(file);
  const destPath = path.join(config.distDir, 'css', filename);
  fs.copyFileSync(file, destPath);
  console.log(`Copied: ${filename}`);
});

// Verify files were copied
const copiedFiles = glob.sync(`${config.distDir}/css/*.css`);
console.log(`\nVerification: ${copiedFiles.length} CSS files copied to dist/css`);
console.log(`Files in dist: ${copiedFiles.map(f => path.basename(f)).join(', ')}`);

// Check for specific required files
const requiredFiles = ['style.css', 'responsive.css', 'navigation.css', 'visual-enhancements.css', 'forms-contact.css'];
const missingRequired = requiredFiles.filter(file => !fs.existsSync(path.join(config.distDir, 'css', file)));

if (missingRequired.length > 0) {
  console.log(`\n❌ ERROR: Some required files are missing: ${missingRequired.join(', ')}`);
} else {
  console.log('\n✅ All required CSS files successfully copied!');
}
