FROM node:18-alpine AS builder

# Install build dependencies needed for native addons (like gifsicle and mozjpeg)
# alpine-sdk includes build-base (gcc, g++, make etc.)
# autoconf, automake, libtool are often needed for C/C++ based packages
# git might be needed by some npm packages to fetch dependencies
# nasm is required by mozjpeg
RUN apk add --no-cache alpine-sdk autoconf automake libtool git python3 nasm

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
# If you have a package-lock.json, uncomment the next line
# COPY package-lock.json ./

# Install dependencies (minification tools)
# Using --legacy-peer-deps to avoid potential issues with peer dependency conflicts.
RUN npm install --legacy-peer-deps

# Copy all website source files into a 'src' directory in the build stage
# This includes your HTML, CSS, JS, assets (images, webfonts), and ads.txt
COPY . ./src/

# Set working directory for output
WORKDIR /app/dist

# --- Create necessary output directory structure ---
# This ensures target directories exist before copying or processing files into them.
RUN mkdir -p ./assets/images/blogs ./assets/images/placeholders && \
    mkdir -p ./css/fontawesome ./webfonts && \
    mkdir -p ./js && \
    mkdir -p ./pages/blogs && \
    mkdir -p ./templates

# --- CSS Minification & Copying ---
# Extract critical CSS first
RUN if [ -f "/app/css/critical.css" ]; then cp /app/css/critical.css ./css/; fi

# Minify CSS files directly in /app/src/css/ (excluding subdirectories)
RUN find /app/src/css/ -maxdepth 1 -type f -name "*.css" -exec sh -c 'npx csso-cli --input "$1" --output "./css/$(basename "$1")" --comments none' _ {} \;

# Ensure responsive-images.css is included
RUN if [ -f "/app/css/responsive-images.css" ]; then \
      npx csso-cli --input "/app/css/responsive-images.css" --output "./css/responsive-images.css" --comments none; \
    fi

# Copy FontAwesome CSS files (typically already minified)
RUN if [ -d "/app/src/css/fontawesome" ]; then cp -r /app/src/css/fontawesome ./css/; fi
# Copy FontAwesome webfonts from src/assets/webfonts to dist/webfonts
# This path is relative to /app/dist (current WORKDIR)
RUN if [ -d "/app/src/assets/webfonts" ]; then cp -r /app/src/assets/webfonts/* ./webfonts/; fi

# --- JavaScript Minification ---
# Existing files:
RUN npx uglify-js /app/src/js/main.js -c -m -o ./js/main.js
RUN npx uglify-js /app/src/js/image-fallback.js -c -m -o ./js/image-fallback.js
RUN npx uglify-js /app/src/js/favicon-fix.js -c -m -o ./js/favicon-fix.js

# ADD THESE LINES for the missing JS files:
RUN if [ -f "/app/src/js/enhanced-preloader.js" ]; then npx uglify-js /app/src/js/enhanced-preloader.js -c -m -o ./js/enhanced-preloader.js; fi
RUN if [ -f "/app/src/js/utilities.js" ]; then npx uglify-js /app/src/js/utilities.js -c -m -o ./js/utilities.js; fi
RUN if [ -f "/app/src/js/format-support-detector.js" ]; then npx uglify-js /app/src/js/format-support-detector.js -c -m -o ./js/format-support-detector.js; fi
RUN if [ -f "/app/js/format-support-detector.js" ]; then npx uglify-js /app/js/format-support-detector.js -c -m -o ./js/format-support-detector.js; fi
RUN if [ -f "/app/js/css-loader.js" ]; then npx uglify-js /app/js/css-loader.js -c -m -o ./js/css-loader.js; fi
RUN if [ -f "/app/src/js/evolve-visual-fixes.js" ]; then npx uglify-js /app/src/js/evolve-visual-fixes.js -c -m -o ./js/evolve-visual-fixes.js; fi
RUN if [ -f "/app/src/js/image-optimization.js" ]; then npx uglify-js /app/src/js/image-optimization.js -c -m -o ./js/image-optimization.js; fi
RUN if [ -f "/app/src/js/visual-issue-detector.js" ]; then npx uglify-js /app/src/js/visual-issue-detector.js -c -m -o ./js/visual-issue-detector.js; fi
RUN if [ -f "/app/src/js/performance-monitor.js" ]; then npx uglify-js /app/src/js/performance-monitor.js -c -m -o ./js/performance-monitor.js; fi

# Your other files that were listed in your js/ directory (add as needed):
RUN if [ -f "/app/src/js/blog-grid-fix.js" ]; then npx uglify-js /app/src/js/blog-grid-fix.js -c -m -o ./js/blog-grid-fix.js; fi
RUN if [ -f "/app/src/js/load-grid-fixes.js" ]; then npx uglify-js /app/src/js/load-grid-fixes.js -c -m -o ./js/load-grid-fixes.js; fi
RUN if [ -f "/app/src/js/related-posts-clickable.js" ]; then npx uglify-js /app/src/js/related-posts-clickable.js -c -m -o ./js/related-posts-clickable.js; fi
RUN if [ -f "/app/src/js/related-posts-fix.js" ]; then npx uglify-js /app/src/js/related-posts-fix.js -c -m -o ./js/related-posts-fix.js; fi
# Note: a root preloader.js, if it's different from enhanced-preloader.js
RUN if [ -f "/app/src/preloader.js" ]; then npx uglify-js /app/src/preloader.js -c -m -o ./preloader.js; fi


# --- HTML Minification (maintaining directory structure) ---
# Root HTML files (e.g., index.html)
RUN find /app/src -maxdepth 1 -name "*.html" -exec sh -c 'npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./$(basename {})' \;
# HTML files in pages/ (e.g., about-us.html)
RUN find /app/src/pages -maxdepth 1 -name "*.html" -exec sh -c 'mkdir -p ./pages && npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./pages/$(basename {})' \;
# HTML files in pages/blogs/
RUN find /app/src/pages/blogs -maxdepth 1 -name "*.html" -exec sh -c 'mkdir -p ./pages/blogs && npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./pages/blogs/$(basename {})' \;
# HTML files in templates/
RUN if [ -d "/app/src/templates" ]; then \
      find /app/src/templates -maxdepth 1 -name "*.html" -exec sh -c 'mkdir -p ./templates && npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./templates/$(basename {})' \; ; \
    fi

# --- Image Handling ---
# First, set up directory structure for the build
RUN mkdir -p /app/src
RUN find /app -maxdepth 1 -not -path "/app" -not -path "/app/src" -not -path "/app/dist" -not -path "/app/node_modules" -exec cp -r {} /app/src/ \; 2>/dev/null || true
RUN mkdir -p /app/dist/assets/images/responsive

# Copy scripts to the app directory
RUN mkdir -p /app/scripts
COPY ./scripts/generate-responsive-images.js /app/scripts/
COPY ./scripts/process-html-images.js /app/scripts/

# Install required packages for image processing
RUN npm install --save sharp glob cheerio fs-extra

# Generate responsive images
RUN node /app/scripts/generate-responsive-images.js

# Process HTML files to use responsive images
RUN node /app/scripts/process-html-images.js

# Inject critical CSS and optimize CSS loading (inline implementation)
RUN mkdir -p /app/js && \
    echo '#!/bin/bash
# This script injects critical CSS into HTML files for optimal loading performance
set -e

# Read the critical CSS file
if [ ! -f "css/critical.css" ]; then
    echo "Error: critical.css file not found!"
    exit 1
fi

CRITICAL_CSS=$(cat css/critical.css)

# Create the critical CSS style tag to insert
STYLE_TAG="<!-- Critical CSS for above-the-fold content -->
    <style>
$CRITICAL_CSS
    </style>"

# Function to inject critical CSS into an HTML file
inject_critical_css() {
    local file=$1

    # First backup the original file
    cp "$file" "${file}.bak"

    # Insert critical CSS after head tag
    sed -i "/<head>/a\\
$STYLE_TAG" "$file"

    # Convert regular CSS links to preload for non-critical CSS
    sed -i '\''s|<link rel="stylesheet" href="\(.*\)css/style.css">|<!-- Non-critical CSS loaded asynchronously -->\\
    <link rel="preload" href="\1css/style.css" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''">\\
    <noscript><link rel="stylesheet" href="\1css/style.css"></noscript>|g'\'' "$file"

    # Convert other CSS files to preload
    sed -i '\''s|<link rel="stylesheet" href="\(.*\)css/\(responsive\|navigation\|visual-enhancements\|blog\).css">|<link rel="preload" href="\1css/\2.css" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''">\\
    <noscript><link rel="stylesheet" href="\1css/\2.css"></noscript>|g'\'' "$file"
}

# Process main HTML files
echo "Processing index.html..."
inject_critical_css "index.html"

# Process blog template
if [ -f "templates/blog-post-template.html" ]; then
    echo "Processing blog template..."
    inject_critical_css "templates/blog-post-template.html"
fi

# Process blog posts
echo "Processing blog posts..."
find ./pages/blogs -name "*.html" | while read file; do
    echo "  Processing $file..."
    inject_critical_css "$file"
done

# Add script for loading CSS asynchronously
cat > js/css-loader.js << '\''EOF'\''
/*! loadCSS. [c]2017 Filament Group, Inc. MIT License */
(function(w){"use strict";var loadCSS=function(href,before,media,attributes){var doc=w.document;var ss=doc.createElement("link");var ref;if(before){ref=before;}else{var refs=(doc.body||doc.getElementsByTagName("head")[0]).childNodes;ref=refs[refs.length-1];}
var sheets=doc.styleSheets;ss.rel="stylesheet";ss.href=href;ss.media="only x";function ready(cb){if(doc.body){return cb();}
setTimeout(function(){ready(cb);});}
ready(function(){ref.parentNode.insertBefore(ss,(before?ref:ref.nextSibling));});var onloadcssdefined=function(cb){var resolvedHref=ss.href;var i=sheets.length;while(i--){if(sheets[i].href===resolvedHref){return cb();}}
setTimeout(function(){onloadcssdefined(cb);});};function loadCB(){if(ss.addEventListener){ss.removeEventListener("load",loadCB);}
ss.media=media||"all";}
if(ss.addEventListener){ss.addEventListener("load",loadCB);}
ss.onloadcssdefined=onloadcssdefined;onloadcssdefined(loadCB);return ss;};if(typeof exports!=="undefined"){exports.loadCSS=loadCSS;}
else{w.loadCSS=loadCSS;}}(typeof global!=="undefined"?global:this));

/*! loadCSS rel=preload polyfill. [c]2017 Filament Group, Inc. MIT License */
(function(w){"use strict";if(!w.loadCSS){return;}
var rp=loadCSS.relpreload={};rp.support=(function(){try{return w.document.createElement("link").relList.supports("preload");}catch(e){return false;}})();rp.poly=function(){var links=w.document.getElementsByTagName("link");for(var i=0;i<links.length;i++){var link=links[i];if(link.rel==="preload"&&link.getAttribute("as")==="style"&&!link.getAttribute("data-loadcss")){link.setAttribute("data-loadcss",true);rp.bindMediaToggle(link);}}};rp.bindMediaToggle=function(link){var finalMedia=link.media||"all";function enableStyleOnLoad(){link.media=finalMedia;}
if(link.addEventListener){link.addEventListener("load",enableStyleOnLoad);}else if(link.attachEvent){link.attachEvent("onload",enableStyleOnLoad);}
setTimeout(function(){link.rel="stylesheet";link.media="only x";});setTimeout(enableStyleOnLoad,3000);};rp.poly();var links=w.document.getElementsByTagName("link");for(var i=0;i<links.length;i++){var link=links[i];if(link.rel==="preload"&&link.getAttribute("as")==="style"&&!link.getAttribute("data-loadcss")){rp.bindMediaToggle(link);}};}(this));
EOF

# Add script reference to HTML files
sed -i '\''/<\/head>/i \    <script src="js/css-loader.js"></script>'\'' index.html

if [ -f "templates/blog-post-template.html" ]; then
    sed -i '\''/<\/head>/i \    <script src="../js/css-loader.js"></script>'\'' templates/blog-post-template.html
fi

find ./pages -name "*.html" -not -path "*/html_backup*/*" | while read file; do
    sed -i '\''/<\/head>/i \    <script src="../js/css-loader.js"></script>'\'' "$file"
done

find ./pages/blogs -name "*.html" | while read file; do
    sed -i '\''s|<script src="../js/css-loader.js"></script>|<script src="../../js/css-loader.js"></script>|g'\'' "$file"
done
' > /app/inline-critical-css.sh && chmod +x /app/inline-critical-css.sh && /app/inline-critical-css.sh

# Also copy the original images (for fallbacks and non-responsive cases)
RUN cp -R /app/assets/images /app/dist/assets/

# Finally, optimize all images including original copies
RUN npx imagemin "/app/dist/assets/images/**/*.{jpg,jpeg,png,gif,svg}" --plugin=mozjpeg --plugin=pngquant --plugin=gifsicle --plugin=svgo

# --- Copy ads.txt (from project root to dist root) ---
RUN if [ -f "/app/src/ads.txt" ]; then cp /app/src/ads.txt ./ads.txt; fi

# --- Copy other root files if necessary (e.g., robots.txt, sitemap.xml) ---
# These files are assumed to be in the root of your project locally.
RUN if [ -f "/app/src/robots.txt" ]; then cp /app/src/robots.txt ./robots.txt; fi
RUN if [ -f "/app/src/sitemap.xml" ]; then cp /app/src/sitemap.xml ./sitemap.xml; fi


# Stage 2: Final stage - Serve the optimized/copied files with Nginx
FROM nginx:1.25-alpine

# Remove default Nginx website content
RUN rm -rf /usr/share/nginx/html/*

# Copy processed website files from the builder stage's '/app/dist/' directory
# to Nginx's webroot. This will include the correct image subdirectory structure
# and ads.txt at the root.
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]