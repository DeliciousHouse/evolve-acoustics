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

# Copy fix script to create missing CSS files and fix references
COPY fix_missing_css_references.sh ./
RUN chmod +x ./fix_missing_css_references.sh && \
    ./fix_missing_css_references.sh || echo "Script execution failed, creating files manually"

# Always check and create CSS files if they don't exist
RUN mkdir -p ./css && \
    if [ ! -f "./css/visual-fixes.css" ]; then \
      echo "/* Visual fixes CSS - Created during Docker build */\n\n.blog-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }\n.blog-card { display: flex; flex-direction: column; height: 100%; }\nimg { max-width: 100%; height: auto; }" > ./css/visual-fixes.css; \
      echo "Created visual-fixes.css"; \
    fi && \
    if [ ! -f "./css/enhanced-visual-fixes.css" ]; then \
      echo "/* Enhanced visual fixes CSS - Created during Docker build */\n\n.button:hover, .btn:hover, a.cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }\na:focus, button:focus, input:focus, textarea:focus { outline: 2px solid #4a90e2; outline-offset: 2px; }\n.animated-element { transition: all 0.3s ease-in-out; }" > ./css/enhanced-visual-fixes.css; \
      echo "Created enhanced-visual-fixes.css"; \
    fi && \
    if [ ! -f "./css/enhanced-preloader.css" ]; then \
      echo "/* Enhanced preloader CSS - Created during Docker build */\n\n.evolve-preloader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #171717; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: opacity 0.5s ease-out, visibility 0.5s; }\n.evolve-preloader.hidden { opacity: 0; visibility: hidden; }\n.logo-container { margin-bottom: 20px; }\n.logo { max-width: 200px; height: auto; }\n.progress-container { width: 80%; max-width: 300px; height: 4px; background-color: rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden; }\n.progress-bar { height: 100%; background-color: #f7f7f7; width: 0; transition: width 0.3s ease; }\n.loading-text { color: #f7f7f7; margin-top: 10px; font-family: Arial, sans-serif; font-size: 14px; }" > ./css/enhanced-preloader.css; \
      echo "Created enhanced-preloader.css"; \
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

# Fix any absolute paths in JavaScript files
RUN echo "Checking and fixing absolute paths in JavaScript files..." && \
    for js_file in ./js/*.js; do \
      if [ -f "$js_file" ]; then \
        # Replace any references to '/css/' with relative paths using getBasePath()
        if grep -q "loadCSS(\"/css/" "$js_file" || grep -q "href = \"/css/" "$js_file" || grep -q "cssPath = '/css/" "$js_file"; then \
          echo "Fixing absolute CSS paths in $js_file"; \
          # Add getBasePath function if it doesn't exist
          if ! grep -q "function getBasePath()" "$js_file"; then \
            sed -i '/loadCSS(/i \    // Determine the base path based on the current URL\n    function getBasePath() {\n        const path = window.location.pathname;\n        if (path.includes("/pages/blogs/")) {\n            return "../../";\n        } else if (path.includes("/pages/") || path.includes("/templates/")) {\n            return "../";\n        }\n        return "";\n    }' "$js_file"; \
          fi; \
          # Replace absolute paths with relative paths using getBasePath()
          sed -i 's|loadCSS("/css/|loadCSS(getBasePath() + "css/|g' "$js_file"; \
          sed -i 's|href = "/css/|href = getBasePath() + "css/|g' "$js_file"; \
          sed -i 's|cssPath = \'/css/|cssPath = getBasePath() + \'css/|g' "$js_file"; \
        fi; \
      fi; \
    done

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
RUN mkdir -p js && echo '/*! loadCSS. [c]2017 Filament Group, Inc. MIT License */' > js/css-loader-min.js && \
    echo '(function(w){' >> js/css-loader-min.js && \
    echo '  var loadCSS = function(href, before, media) {' >> js/css-loader-min.js && \
    echo '    var doc = w.document;' >> js/css-loader-min.js && \
    echo '    var ss = doc.createElement("link");' >> js/css-loader-min.js && \
    echo '    ss.rel = "stylesheet";' >> js/css-loader-min.js && \
    echo '    ss.href = href;' >> js/css-loader-min.js && \
    echo '    ss.media = "only x";' >> js/css-loader-min.js && \
    echo '    doc.head.appendChild(ss);' >> js/css-loader-min.js && \
    echo '    setTimeout(function(){' >> js/css-loader-min.js && \
    echo '      ss.media = media || "all";' >> js/css-loader-min.js && \
    echo '    }, 0);' >> js/css-loader-min.js && \
    echo '    return ss;' >> js/css-loader-min.js && \
    echo '  };' >> js/css-loader-min.js && \
    echo '  w.loadCSS = loadCSS;' >> js/css-loader-min.js && \
    echo '}(typeof global !== "undefined" ? global : this));' >> js/css-loader-min.js

# Create passive event fix for touchstart and touchmove events
RUN echo '/**' > js/passive-event-fix.js && \
    echo ' * Passive Event Listeners Fix' >> js/passive-event-fix.js && \
    echo ' *' >> js/passive-event-fix.js && \
    echo ' * This script makes touch events passive by default to improve' >> js/passive-event-fix.js && \
    echo ' * scrolling performance on mobile devices.' >> js/passive-event-fix.js && \
    echo ' */' >> js/passive-event-fix.js && \
    echo '(function(){' >> js/passive-event-fix.js && \
    echo '  let supportsPassive = false;' >> js/passive-event-fix.js && \
    echo '  try {' >> js/passive-event-fix.js && \
    echo '    const opts = Object.defineProperty({}, "passive", {' >> js/passive-event-fix.js && \
    echo '      get: function() { supportsPassive = true; return true; }' >> js/passive-event-fix.js && \
    echo '    });' >> js/passive-event-fix.js && \
    echo '    window.addEventListener("testPassive", null, opts);' >> js/passive-event-fix.js && \
    echo '    window.removeEventListener("testPassive", null, opts);' >> js/passive-event-fix.js && \
    echo '  } catch (e) {}' >> js/passive-event-fix.js && \
    echo '' >> js/passive-event-fix.js && \
    echo '  if (supportsPassive) {' >> js/passive-event-fix.js && \
    echo '    const originalAddEventListener = EventTarget.prototype.addEventListener;' >> js/passive-event-fix.js && \
    echo '    EventTarget.prototype.addEventListener = function(type, listener, options) {' >> js/passive-event-fix.js && \
    echo '      if (type === "touchstart" || type === "touchmove" || type === "wheel" || type === "mousewheel") {' >> js/passive-event-fix.js && \
    echo '        let opts = options;' >> js/passive-event-fix.js && \
    echo '        if (options === undefined || options === false) {' >> js/passive-event-fix.js && \
    echo '          opts = { passive: true };' >> js/passive-event-fix.js && \
    echo '        } else if (typeof options === "object" && options.passive === undefined) {' >> js/passive-event-fix.js && \
    echo '          opts = Object.assign({}, options, { passive: true });' >> js/passive-event-fix.js && \
    echo '        }' >> js/passive-event-fix.js && \
    echo '        originalAddEventListener.call(this, type, listener, opts);' >> js/passive-event-fix.js && \
    echo '      } else {' >> js/passive-event-fix.js && \
    echo '        originalAddEventListener.call(this, type, listener, options);' >> js/passive-event-fix.js && \
    echo '      }' >> js/passive-event-fix.js && \
    echo '    };' >> js/passive-event-fix.js && \
    echo '' >> js/passive-event-fix.js && \
    echo '    window.addPassiveEventListener = function(element, eventName, handler) {' >> js/passive-event-fix.js && \
    echo '      element.addEventListener(eventName, handler, { passive: true });' >> js/passive-event-fix.js && \
    echo '    };' >> js/passive-event-fix.js && \
    echo '  } else {' >> js/passive-event-fix.js && \
    echo '    window.addPassiveEventListener = function(element, eventName, handler) {' >> js/passive-event-fix.js && \
    echo '      element.addEventListener(eventName, handler);' >> js/passive-event-fix.js && \
    echo '    };' >> js/passive-event-fix.js && \
    echo '  }' >> js/passive-event-fix.js && \
    echo '' >> js/passive-event-fix.js && \
    echo '  // jQuery integration if jQuery is loaded' >> js/passive-event-fix.js && \
    echo '  if (typeof jQuery !== "undefined") {' >> js/passive-event-fix.js && \
    echo '    (function() {' >> js/passive-event-fix.js && \
    echo '      const originalOn = jQuery.fn.on;' >> js/passive-event-fix.js && \
    echo '      jQuery.fn.on = function() {' >> js/passive-event-fix.js && \
    echo '        const args = Array.prototype.slice.call(arguments);' >> js/passive-event-fix.js && \
    echo '        if (typeof args[0] === "string" &&' >> js/passive-event-fix.js && \
    echo '            (args[0].includes("touchstart") || args[0].includes("touchmove"))) {' >> js/passive-event-fix.js && \
    echo '          if (args.length < 4 || typeof args[3] !== "object") {' >> js/passive-event-fix.js && \
    echo '            args[3] = { passive: true };' >> js/passive-event-fix.js && \
    echo '          } else if (args[3].passive === undefined) {' >> js/passive-event-fix.js && \
    echo '            args[3].passive = true;' >> js/passive-event-fix.js && \
    echo '          }' >> js/passive-event-fix.js && \
    echo '        }' >> js/passive-event-fix.js && \
    echo '        return originalOn.apply(this, args);' >> js/passive-event-fix.js && \
    echo '      };' >> js/passive-event-fix.js && \
    echo '    })();' >> js/passive-event-fix.js && \
    echo '  }' >> js/passive-event-fix.js && \
    echo '})();' >> js/passive-event-fix.js

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