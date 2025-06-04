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
RUN npx uglify-js /app/src/js/passive-event-fix.js -c -m -o ./js/passive-event-fix.js

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

# Add defer attribute to JavaScript files directly in the build process
RUN echo "Adding defer attribute to scripts in HTML files..." && \
    # Process index.html
    if [ -f "/app/dist/index.html" ]; then \
      sed -i 's|<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>|<script src="https://code.jquery.com/jquery-3.6.0.min.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/utilities.js"></script>|<script src="js/utilities.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/main.js"></script>|<script src="js/main.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/image-fallback.js"></script>|<script src="js/image-fallback.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/evolve-visual-fixes.js"></script>|<script src="js/evolve-visual-fixes.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/image-optimization.js"></script>|<script src="js/image-optimization.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/visual-issue-detector.js"></script>|<script src="js/visual-issue-detector.js" defer></script>|g' "/app/dist/index.html" && \
      sed -i 's|<script src="js/performance-monitor.js"></script>|<script src="js/performance-monitor.js" defer></script>|g' "/app/dist/index.html"; \
    fi && \
    # Process HTML files in pages directory
    find /app/dist/pages -name "*.html" -type f -exec sed -i 's|<script src="../js/utilities.js"></script>|<script src="../js/utilities.js" defer></script>|g; \
      s|<script src="../js/main.js"></script>|<script src="../js/main.js" defer></script>|g; \
      s|<script src="../js/image-fallback.js"></script>|<script src="../js/image-fallback.js" defer></script>|g; \
      s|<script src="../js/evolve-visual-fixes.js"></script>|<script src="../js/evolve-visual-fixes.js" defer></script>|g; \
      s|<script src="../js/image-optimization.js"></script>|<script src="../js/image-optimization.js" defer></script>|g; \
      s|<script src="../js/visual-issue-detector.js"></script>|<script src="../js/visual-issue-detector.js" defer></script>|g; \
      s|<script src="../js/performance-monitor.js"></script>|<script src="../js/performance-monitor.js" defer></script>|g;' {} \; && \
    # Process HTML files in pages/blogs directory
    find /app/dist/pages/blogs -name "*.html" -type f -exec sed -i 's|<script src="../../js/utilities.js"></script>|<script src="../../js/utilities.js" defer></script>|g; \
      s|<script src="../../js/main.js"></script>|<script src="../../js/main.js" defer></script>|g; \
      s|<script src="../../js/image-fallback.js"></script>|<script src="../../js/image-fallback.js" defer></script>|g; \
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

# Inject critical CSS and optimize CSS loading with simple inline script approach
RUN mkdir -p js && \
    cat > js/css-loader-min.js << 'EOL'
/*! loadCSS. [c]2017 Filament Group, Inc. MIT License */
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
}(typeof global !== "undefined" ? global : this));
EOL
EOL

# Create passive event fix for touchstart and touchmove events
RUN cat > js/passive-event-fix.js << 'EOL'
/**
 * Passive Event Listeners Fix
 *
 * This script makes touch events passive by default to improve
 * scrolling performance on mobile devices.
 */
(function(){
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, "passive", {
      get: function() { supportsPassive = true; return true; }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (e) {}

  if (supportsPassive) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === "touchstart" || type === "touchmove" || type === "wheel" || type === "mousewheel") {
        let opts = options;
        if (options === undefined || options === false) {
          opts = { passive: true };
        } else if (typeof options === "object" && options.passive === undefined) {
          opts = Object.assign({}, options, { passive: true });
        }
        originalAddEventListener.call(this, type, listener, opts);
      } else {
        originalAddEventListener.call(this, type, listener, options);
      }
    };

    window.addPassiveEventListener = function(element, eventName, handler) {
      element.addEventListener(eventName, handler, { passive: true });
    };
  } else {
    window.addPassiveEventListener = function(element, eventName, handler) {
      element.addEventListener(eventName, handler);
    };
  }

  // jQuery integration if jQuery is loaded
  if (typeof jQuery !== "undefined") {
    (function() {
      const originalOn = jQuery.fn.on;
      jQuery.fn.on = function() {
        const args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === "string" &&
            (args[0].includes("touchstart") || args[0].includes("touchmove"))) {
          if (args.length < 4 || typeof args[3] !== "object") {
            args[3] = { passive: true };
          } else if (args[3].passive === undefined) {
            args[3].passive = true;
          }
        }
        return originalOn.apply(this, args);
      };
    })();
  }
})();
EOL
EOL

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