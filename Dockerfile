# Stage 1: Builder stage - To install Node.js, tools, and perform minification/optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
# If you have a package-lock.json, uncomment the next line
# COPY package-lock.json ./

# Install dependencies (minification tools)
RUN npm install

# Copy all website source files into a 'src' directory in the build stage
COPY . ./src/

# Create output directory
WORKDIR /app/dist

# Run minification and optimization tasks
# We need to handle the directory structure carefully

# 1. Copy non-minified assets first (like fonts, or any other assets that don't need processing)
# Create necessary directories in dist
RUN mkdir -p ./assets/images && \
    mkdir -p ./css/fontawesome && \
    mkdir -p ./js && \
    mkdir -p ./pages/blogs

# Copy assets that don't need minification/optimization directly
# Example: FontAwesome webfonts (assuming they are in src/css/webfonts)
# Adjust this if your fontawesome webfonts are elsewhere or if you have other static assets
RUN if [ -d "/app/src/css/webfonts" ]; then cp -r /app/src/css/webfonts ./css/; fi
RUN if [ -d "/app/src/assets/fonts" ]; then cp -r /app/src/assets/fonts ./assets/; fi


# 2. Optimize images
# imagemin-cli can be a bit tricky with complex directory structures directly.
# We'll copy, optimize, and then structure.
RUN mkdir -p /app/temp_images_optimized
RUN npx imagemin-cli /app/src/assets/images/* --out-dir=/app/temp_images_optimized --plugin=mozjpeg --plugin=pngquant --plugin=gifsicle --plugin=svgo
RUN cp -r /app/temp_images_optimized/* ./assets/images/
RUN rm -rf /app/temp_images_optimized

# 3. Minify CSS
# csso-cli can handle recursive directories.
RUN npx csso-cli --input /app/src/css/ --output ./css/ --recursive --comments none
# Ensure FontAwesome CSS files are copied if not processed by csso (or if you want them as is)
RUN cp /app/src/css/fontawesome/*.css ./css/fontawesome/


# 4. Minify JavaScript
# Specific files for now, adjust if you have more.
RUN npx uglify-js /app/src/js/main.js -c -m -o ./js/main.js
RUN npx uglify-js /app/src/js/image-fallback.js -c -m -o ./js/image-fallback.js
# If you have other JS files, add them here or use a script to loop through them.

# 5. Minify HTML
# html-minifier needs to run on each file. We'll find them and process them.
# Root HTML files
RUN find /app/src -maxdepth 1 -name "*.html" -exec sh -c 'npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./$(basename {})' \;
# HTML files in pages/
RUN find /app/src/pages -maxdepth 1 -name "*.html" -exec sh -c 'mkdir -p ./pages && npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./pages/$(basename {})' \;
# HTML files in pages/blogs/
RUN find /app/src/pages/blogs -maxdepth 1 -name "*.html" -exec sh -c 'mkdir -p ./pages/blogs && npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o ./pages/blogs/$(basename {})' \;

# Copy any other necessary files that were not processed (e.g., .txt, .xml, .well-known, etc.)
# Example:
# RUN if [ -f "/app/src/robots.txt" ]; then cp /app/src/robots.txt ./robots.txt; fi
# RUN if [ -f "/app/src/sitemap.xml" ]; then cp /app/src/sitemap.xml ./sitemap.xml; fi
# RUN if [ -d "/app/src/.well-known" ]; then cp -r /app/src/.well-known ./.well-known; fi


# Stage 2: Final stage - Serve the optimized files with Nginx
FROM nginx:1.25-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy optimized website files from the builder stage's 'dist' directory
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
