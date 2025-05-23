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
# Minify CSS files directly in /app/src/css/ (excluding subdirectories)
RUN find /app/src/css/ -maxdepth 1 -type f -name "*.css" -exec sh -c 'npx csso-cli --input "$1" --output "./css/$(basename "$1")" --comments none' _ {} \;
# Copy FontAwesome CSS files (typically already minified)
RUN if [ -d "/app/src/css/fontawesome" ]; then cp -r /app/src/css/fontawesome ./css/; fi
# Copy FontAwesome webfonts from src/assets/webfonts to dist/webfonts
# This path is relative to /app/dist (current WORKDIR)
RUN if [ -d "/app/src/assets/webfonts" ]; then cp -r /app/src/assets/webfonts/* ./webfonts/; fi

# --- JavaScript Minification ---
RUN npx uglify-js /app/src/js/main.js -c -m -o ./js/main.js
RUN npx uglify-js /app/src/js/image-fallback.js -c -m -o ./js/image-fallback.js
RUN npx uglify-js /app/src/js/favicon-fix.js -c -m -o ./js/favicon-fix.js
# If preloader.js is used client-side and is in the root of your project:
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
# Copy the entire 'images' directory from src/assets to dist/assets, preserving subdirectories.
# This is crucial for your .webp files in assets/images/blogs and assets/images/placeholders.
RUN cp -R /app/src/assets/images ./assets/
# Note: Image optimization with imagemin-cli for complex structures can be tricky.
# This version copies images as-is to ensure paths are correct.
# Consider optimizing images locally before the build if needed, or implement a more robust imagemin script.

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