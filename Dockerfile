# Use nginx as the base image since this is a static website
FROM nginx:alpine

# Copy the website files to the nginx html directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# The default command from nginx image will start the server automatically
# We use a health check to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1

# Add labels with metadata
LABEL maintainer="Evolve Acoustics <evolveacoustics@gmail.com>"
LABEL version="1.0"
LABEL description="Evolve Acoustics Website"