# =================================================================
# Stage 1: Build Optimized Static Assets
# =================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install build-time OS dependencies for native Node.js addons
RUN apk add --no-cache alpine-sdk autoconf automake libtool git python3 nasm

# Copy package files and install ALL dependencies to leverage Docker caching.
# Add sharp, cheerio, fs-extra, html-minifier, csso-cli, uglify-js, imagemin etc.
# to your package.json devDependencies.
COPY package*.json ./
RUN npm install --save-dev esbuild@latest esbuild-plugin-imagemin@latest esbuild-copy-static-files@latest
RUN npm install --save-dev imagemin-mozjpeg@latest imagemin-pngquant@latest imagemin-gifsicle@latest imagemin-svgo@latest

# Copy the rest of the application source code
COPY . .

# Run a single, consolidated build script.
# This script handles all minification, image processing, and HTML modifications.
RUN npm run build

# =================================================================
# Stage 2: Serve Statically with Nginx
# =================================================================
FROM nginx:1.25-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the optimized assets from the builder stage
# The build script in the previous stage should output to a `/app/dist` directory.
COPY --from=builder /app/dist /usr/share/nginx/html


# FIX: Correct the image directory structure after the build script runs
RUN mv /app/dist/assets/images/responsive/blogs/* /app/dist/assets/images/responsive/ \
    && rmdir /app/dist/assets/images/responsive/blogs

# If you have a custom Nginx configuration, copy it here
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]