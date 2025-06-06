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
RUN mkdir -p ./assets/images/blogs \
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

# Create required CSS files with basic content - using printf to avoid heredoc issues
RUN echo "Creating required CSS files with minimal content..." && \
    mkdir -p ./css && \
    # Create visual-fixes.css
    printf "%s\n" \
    "/* Visual fixes CSS - Created during Docker build */" \
    "" \
    ".blog-grid {" \
    "  display: grid;" \
    "  gap: 20px;" \
    "  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));" \
    "}" \
    "" \
    ".blog-card {" \
    "  display: flex;" \
    "  flex-direction: column;" \
    "  height: 100%;" \
    "}" \
    "" \
    "img {" \
    "  max-width: 100%;" \
    "  height: auto;" \
    "}" > ./css/visual-fixes.css && \
    # Create enhanced-visual-fixes.css
    printf "%s\n" \
    "/* Enhanced visual fixes CSS - Created during Docker build */" \
    "" \
    ".button:hover," \
    ".btn:hover," \
    "a.cta-button:hover {" \
    "  transform: translateY(-2px);" \
    "  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);" \
    "  transition: all 0.3s ease;" \
    "}" \
    "" \
    "a:focus," \
    "button:focus," \
    "input:focus," \
    "textarea:focus {" \
    "  outline: 2px solid #4a90e2;" \
    "  outline-offset: 2px;" \
    "}" \
    "" \
    ".animated-element {" \
    "  transition: all 0.3s ease-in-out;" \
    "}" > ./css/enhanced-visual-fixes.css && \
    # Create anti-jitter.css
    printf "%s\n" \
    "/**" \
    " * Anti-Jitter CSS" \
    " * " \
    " * This stylesheet prevents screen jitter and improves the visual stability" \
    " * of the Evolve Acoustics website through several optimizations." \
    " */" \
    "" \
    "/* Content-Visibility Control - Improve rendering performance */" \
    ".content-block {" \
    "  content-visibility: auto;" \
    "  contain-intrinsic-size: 1px 1000px; /* Reserve space for content */" \
    "}" \
    "" \
    "/* Force hardware acceleration for smoother animations and scrolling */" \
    "body {" \
    "  -webkit-transform: translateZ(0);" \
    "  -moz-transform: translateZ(0);" \
    "  -ms-transform: translateZ(0);" \
    "  -o-transform: translateZ(0);" \
    "  transform: translateZ(0);" \
    "  -webkit-backface-visibility: hidden;" \
    "  -moz-backface-visibility: hidden;" \
    "  -ms-backface-visibility: hidden;" \
    "  backface-visibility: hidden;" \
    "  -webkit-perspective: 1000;" \
    "  -moz-perspective: 1000;" \
    "  -ms-perspective: 1000;" \
    "  perspective: 1000;" \
    "}" \
    "" \
    "/* Prevent CLS (Cumulative Layout Shift) for images */" \
    "img, picture, video, canvas, svg {" \
    "  display: block;" \
    "  max-width: 100%;" \
    "  height: auto;" \
    "}" \
    "" \
    "/* Pre-define aspect ratio for common elements to prevent layout shifts */" \
    ".blog-card-image {" \
    "  aspect-ratio: 16 / 9;" \
    "  overflow: hidden;" \
    "}" \
    "" \
    "/* Prevent font-based layout shifts */" \
    "html {" \
    "  font-size: 100%; /* Ensures consistent base font size */" \
    "  text-size-adjust: 100%; /* Prevents mobile browsers from automatically adjusting font sizes */" \
    "  -webkit-text-size-adjust: 100%;" \
    "  -moz-text-size-adjust: 100%;" \
    "}" > ./css/anti-jitter.css && \
    # Create fixed-header.css
    printf "%s\n" \
    "/**" \
    " * Fixed Header CSS" \
    " * " \
    " * This stylesheet implements a fixed header that remains visible while scrolling" \
    " * without causing layout shifts or performance issues." \
    " */" \
    "" \
    "/* Fixed header base styles */" \
    "header {" \
    "  position: fixed;" \
    "  top: 0;" \
    "  left: 0;" \
    "  width: 100%;" \
    "  z-index: 1000;" \
    "  transition: transform 0.3s ease, box-shadow 0.3s ease;" \
    "  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);" \
    "  " \
    "  /* Hardware acceleration for smoother performance */" \
    "  transform: translateZ(0);" \
    "  will-change: transform, box-shadow;" \
    "}" \
    "" \
    "/* Create space for the fixed header */" \
    "body {" \
    "  padding-top: 230px; /* Adjust based on header height + extra padding */" \
    "}" \
    "" \
    "/* Header shrink effect on scroll */" \
    ".header-shrink {" \
    "  transform: translateY(-20px);" \
    "  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);" \
    "}" \
    "" \
    ".header-shrink .logo-img {" \
    "  height: 150px; /* Reduce logo size when scrolling */" \
    "  transition: height 0.3s ease;" \
    "}" > ./css/fixed-header.css && \
    # Create enhanced-preloader.css
    printf "%s\n" \
    "/* Enhanced preloader CSS - Created during Docker build */" \
    "" \
    ".evolve-preloader {" \
    "  position: fixed;" \
    "  top: 0;" \
    "  left: 0;" \
    "  width: 100%;" \
    "  height: 100%;" \
    "  background-color: #171717;" \
    "  z-index: 9999;" \
    "  display: flex;" \
    "  flex-direction: column;" \
    "  justify-content: center;" \
    "  align-items: center;" \
    "  transition: opacity 0.5s ease-out, visibility 0.5s;" \
    "}" \
    "" \
    ".evolve-preloader.hidden {" \
    "  opacity: 0;" \
    "  visibility: hidden;" \
    "}" \
    "" \
    ".logo-container {" \
    "  margin-bottom: 20px;" \
    "}" \
    "" \
    ".logo {" \
    "  max-width: 200px;" \
    "  height: auto;" \
    "}" \
    "" \
    ".progress-container {" \
    "  width: 80%;" \
    "  max-width: 300px;" \
    "  height: 4px;" \
    "  background-color: rgba(255, 255, 255, 0.2);" \
    "  border-radius: 2px;" \
    "  overflow: hidden;" \
    "}" \
    "" \
    ".progress-bar {" \
    "  height: 100%;" \
    "  background-color: #f7f7f7;" \
    "  width: 0;" \
    "  transition: width 0.3s ease;" \
    "}" \
    "" \
    ".loading-text {" \
    "  color: #f7f7f7;" \
    "  margin-top: 10px;" \
    "  font-family: Arial, sans-serif;" \
    "  font-size: 14px;" \
    "}" > ./css/enhanced-preloader.css && \
    echo "Created all required CSS files"

# Copy FontAwesome CSS files (typically already minified)
RUN if [ -d "/app/src/css/fontawesome" ]; then cp -r /app/src/css/fontawesome ./css/; fi
# Copy FontAwesome webfonts from src/assets/webfonts to dist/webfonts
# This path is relative to /app/dist (current WORKDIR)
RUN if [ -d "/app/src/assets/webfonts" ]; then cp -r /app/src/assets/webfonts/* ./webfonts/; fi

# --- JavaScript File Preparation and Path Fixing ---
# Copy JS files first
RUN mkdir -p ./js && \
    echo "Copying JavaScript files from source..." && \
    if [ -d "/app/src/js" ]; then \
      find /app/src/js -type f -name "*.js" -exec cp {} ./js/ \; 2>/dev/null || true; \
    fi && \
    if [ -d "/app/js" ]; then \
      find /app/js -type f -name "*.js" -exec cp {} ./js/ \; 2>/dev/null || true; \
    fi

# Fix any absolute paths in JavaScript files before minification
RUN echo "Checking and fixing absolute paths in JavaScript files..." && \
    # First copy source JS files to ensure we have them
    mkdir -p ./js && \
    if [ -d "/app/src/js" ]; then \
      find /app/src/js -type f -name "*.js" -exec cp {} ./js/ \; 2>/dev/null || true; \
    fi && \
    if [ -d "/app/js" ]; then \
      find /app/js -type f -name "*.js" -exec cp {} ./js/ \; 2>/dev/null || true; \
    fi && \
    # Now fix any absolute paths
    for js_file in ./js/*.js; do \
      if [ -f "$js_file" ]; then \
        # First check if the file has any absolute paths
        if grep -q "/css/" "$js_file"; then \
          echo "Found absolute CSS path in $js_file, fixing..."; \
          # Add getBasePath function if it doesn't exist
          if ! grep -q "function getBasePath()" "$js_file"; then \
            echo "Adding getBasePath() function to $js_file"; \
            # Create a temporary file for holding modified content
            TEMP_FILE=$(mktemp); \
            # Extract filename without path
            JS_FILENAME=$(basename "$js_file"); \
            echo "/**" > $TEMP_FILE; \
            echo " * Fixed version of $JS_FILENAME with relative paths" >> $TEMP_FILE; \
            echo " * Generated on $(date)" >> $TEMP_FILE; \
            echo " */" >> $TEMP_FILE; \
            echo "" >> $TEMP_FILE; \
            # Add getBasePath function early in the file
            if grep -q "DOMContentLoaded" "$js_file"; then \
              # For files with DOMContentLoaded event listener
              sed -n '1,/DOMContentLoaded/p' "$js_file" >> $TEMP_FILE; \
              echo "    // Determine the base path based on the current URL" >> $TEMP_FILE; \
              echo "    function getBasePath() {" >> $TEMP_FILE; \
              echo "        const path = window.location.pathname;" >> $TEMP_FILE; \
              echo "        if (path.includes('/pages/blogs/')) {" >> $TEMP_FILE; \
              echo "            return '../../';" >> $TEMP_FILE; \
              echo "        } else if (path.includes('/pages/') || path.includes('/templates/')) {" >> $TEMP_FILE; \
              echo "            return '../';" >> $TEMP_FILE; \
              echo "        }" >> $TEMP_FILE; \
              echo "        return '';" >> $TEMP_FILE; \
              echo "    }" >> $TEMP_FILE; \
              echo "" >> $TEMP_FILE; \
              sed -n '/DOMContentLoaded/,$p' "$js_file" | tail -n +2 >> $TEMP_FILE; \
            else \
              # For files without DOMContentLoaded event listener
              echo "// Determine the base path based on the current URL" >> $TEMP_FILE; \
              echo "function getBasePath() {" >> $TEMP_FILE; \
              echo "    const path = window.location.pathname;" >> $TEMP_FILE; \
              echo "    if (path.includes('/pages/blogs/')) {" >> $TEMP_FILE; \
              echo "        return '../../';" >> $TEMP_FILE; \
              echo "    } else if (path.includes('/pages/') || path.includes('/templates/')) {" >> $TEMP_FILE; \
              echo "        return '../';" >> $TEMP_FILE; \
              echo "    }" >> $TEMP_FILE; \
              echo "    return '';" >> $TEMP_FILE; \
              echo "}" >> $TEMP_FILE; \
              echo "" >> $TEMP_FILE; \
              cat "$js_file" >> $TEMP_FILE; \
            fi; \
            # Replace the original file with our modified version
            cat $TEMP_FILE > "$js_file"; \
            rm $TEMP_FILE; \
          fi; \
          \
          # Replace all instances of absolute paths with relative paths
          sed -i 's|"/css/|"" + getBasePath() + "css/|g' "$js_file"; \
          sed -i "s|'/css/|'' + getBasePath() + 'css/|g" "$js_file"; \
          echo "Fixed absolute paths in $js_file"; \
        else \
          echo "No absolute paths found in $js_file"; \
        fi; \
      fi; \
    done

# Minify all JavaScript files in one step
RUN echo "Minifying all JavaScript files..." && \
    mkdir -p /tmp/js_original && \
    cp -r ./js/* /tmp/js_original/ && \
    for js_file in /tmp/js_original/*.js; do \
      if [ -f "$js_file" ]; then \
        filename=$(basename "$js_file"); \
        echo "Minifying $filename..."; \
        npx uglify-js "$js_file" -c -m -o "./js/$filename" || \
          echo "Warning: Could not minify $filename, keeping original"; \
      fi; \
    done && \
    echo "JavaScript minification complete"

# Process any special JavaScript files that might be in different locations
RUN if [ -f "/app/src/preloader.js" ]; then \
      echo "Processing special preloader.js..."; \
      npx uglify-js /app/src/preloader.js -c -m -o ./preloader.js; \
    fi

# Create fixed-header.js script
RUN echo "Creating fixed-header.js..." && \
    mkdir -p ./js && \
    printf "%s\n" \
    "/**" \
    " * Fixed Header Script" \
    " * " \
    " * This script handles the behavior of the fixed header, implementing:" \
    " * - Header shrinking on scroll" \
    " * - Performance optimized with throttling" \
    " */" \
    "" \
    "document.addEventListener('DOMContentLoaded',function(){const e=document.querySelector('header');if(!e)return;let t=0,n=!1;function r(){const r=window.pageYOffset||document.documentElement.scrollTop;r>50?e.classList.add('header-shrink'):e.classList.remove('header-shrink'),t=r<=0?0:r}function o(){n||(window.requestAnimationFrame(()=>{r(),n=!1}),n=!0)}r(),window.addEventListener('scroll',o,{passive:!0}),document.querySelectorAll('a[href^=\"#\"]').forEach(t=>{t.addEventListener('click',function(t){const n=document.querySelector(this.getAttribute('href'));if(n){t.preventDefault();const r=e.offsetHeight,o=n.getBoundingClientRect().top+window.pageYOffset-r-20;window.scrollTo({top:o,behavior:'smooth'})}})})});" > ./js/fixed-header.js && \
    echo "Created fixed-header.js"


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

# Add defer attribute to JavaScript files directly in the build process
RUN echo "Adding defer attribute to scripts in HTML files..." && \
    # Process index.html
    if [ -f "/app/dist/index.html" ]; then \
      sed -i 's|<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>|<script src="https://code.jquery.com/jquery-3.6.0.min.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/utilities.js"></script>|<script src="js/utilities.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/main.js"></script>|<script src="js/main.js" defer></script>|g' "/app/dist/index.html" && \
      # Removed image-fallback.js script reference
      sed -i 's|<script src="js/evolve-visual-fixes.js"></script>|<script src="js/evolve-visual-fixes.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/image-optimization.js"></script>|<script src="js/image-optimization.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/visual-issue-detector.js"></script>|<script src="js/visual-issue-detector.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/performance-monitor.js"></script>|<script src="js/performance-monitor.js" defer></script>|g' "/app/dist/index.html"; \
    fi && \
    # Process HTML files in pages directory
    find /app/dist/pages -name "*.html" -type f -exec sed -i 's|<script src="../js/utilities.js"></script>|<script src="../js/utilities.js" defer></script>|g; \
      s|<script src="../js/main.js"></script>|<script src="../js/main.js" defer></script>|g; \
      # Removed image-fallback.js script reference
      s|<script src="../js/evolve-visual-fixes.js"></script>|<script src="../js/evolve-visual-fixes.js" defer></script>|g; \
      s|<script src="../js/image-optimization.js"></script>|<script src="../js/image-optimization.js" defer></script>|g; \
      s|<script src="../js/visual-issue-detector.js"></script>|<script src="../js/visual-issue-detector.js" defer></script>|g; \
      s|<script src="../js/performance-monitor.js"></script>|<script src="../js/performance-monitor.js" defer></script>|g; \
      s|<script src="../js/fixed-header.js"></script>|<script src="../js/fixed-header.js" defer></script>|g; \
      s|<script src="../js/blog-text-fix.js"></script>|<script src="../js/blog-text-fix.js" defer></script>|g;' {} \; && \
    # Process HTML files in pages/blogs directory
    find /app/dist/pages/blogs -name "*.html" -type f -exec sed -i 's|<script src="../../js/utilities.js"></script>|<script src="../../js/utilities.js" defer></script>|g; \
      s|<script src="../../js/main.js"></script>|<script src="../../js/main.js" defer></script>|g; \
      # Removed image-fallback.js script reference
      s|<script src="../../js/evolve-visual-fixes.js"></script>|<script src="../../js/evolve-visual-fixes.js" defer></script>|g; \
      s|<script src="../../js/image-optimization.js"></script>|<script src="../../js/image-optimization.js" defer></script>|g; \
      s|<script src="../../js/visual-issue-detector.js"></script>|<script src="../../js/visual-issue-detector.js" defer></script>|g; \
      s|<script src="../../js/performance-monitor.js"></script>|<script src="../../js/performance-monitor.js" defer></script>|g;' {} \;

# Add passive event fix script to HTML files
RUN echo "Adding passive-event-fix.js to HTML files..." && \
    # Add to index.html
    if [ -f "/app/dist/index.html" ]; then \
      sed -i "/<head>/a \    <script data-cfasync=\"false\" src=\"js/passive-event-fix.js\"></script>" "/app/dist/index.html"; \
    fi && \
    # Add to pages/*.html
    find /app/dist/pages -maxdepth 1 -name "*.html" -type f -exec sed -i "/<head>/a \    <script data-cfasync=\"false\" src=\"../js/passive-event-fix.js\"></script>" {} \; && \
    # Add to pages/blogs/*.html
    find /app/dist/pages/blogs -maxdepth 1 -name "*.html" -type f -exec sed -i "/<head>/a \    <script data-cfasync=\"false\" src=\"../../js/passive-event-fix.js\"></script>" {} \;

# This section is intentionally removed as it's redundant with the command above

# Simply inject critical CSS and optimize CSS loading with simple inline script approach
RUN mkdir -p js && \
    printf "%s\n" \
    "/*! loadCSS. [c]2017 Filament Group, Inc. MIT License */" \
    "(function(w){" \
    "  var loadCSS = function(href, before, media) {" \
    "    var doc = w.document;" \
    "    var ss = doc.createElement(\"link\");" \
    "    ss.rel = \"stylesheet\";" \
    "    ss.href = href;" \
    "    ss.media = \"only x\";" \
    "    doc.head.appendChild(ss);" \
    "    setTimeout(function(){" \
    "      ss.media = media || \"all\";" \
    "    }, 0);" \
    "    return ss;" \
    "  };" \
    "  w.loadCSS = loadCSS;" \
    "}(typeof global !== \"undefined\" ? global : this));" > js/css-loader-min.js

# Add script reference to HTML files
RUN if [ -f "index.html" ]; then \
      sed -i "/<\/head>/i \    <script src=\"js/css-loader-min.js\"></script>" index.html; \
    fi

# Process critical CSS if available
RUN if [ -f "css/critical.css" ]; then \
      CRITICAL_CSS=$(cat css/critical.css); \
      STYLE_TAG="<!-- Critical CSS for above-the-fold content -->\n<style>\n${CRITICAL_CSS}\n</style>"; \
      if [ -f "index.html" ]; then \
        sed -i "/<head>/a \\${STYLE_TAG}" index.html; \
        sed -i "s|<link rel=\"stylesheet\" href=\"css/style.css\">|<!-- Non-critical CSS loaded asynchronously -->\n    <link rel=\"preload\" href=\"css/style.css\" as=\"style\" onload=\"this.onload=null;this.rel='stylesheet'\">\n    <noscript><link rel=\"stylesheet\" href=\"css/style.css\"></noscript>|g" index.html; \
      fi; \
    fi

# Also copy the original images (for fallbacks and non-responsive cases)
RUN cp -R /app/src/assets/images /app/dist/assets/

# Finally, optimize all images including original copies
RUN npx imagemin "/app/dist/assets/images/**/*.{png,gif,svg,webp}" --out-dir=/app/dist/assets/images --plugin=mozjpeg --plugin=pngquant --plugin=gifsicle --plugin=svgo

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