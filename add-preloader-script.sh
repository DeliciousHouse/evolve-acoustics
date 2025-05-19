#!/bin/bash

# Script to add preloader.js to all HTML pages in the pages directory

# Navigate to the pages directory
cd /home/bkam/evolve-acoustics/pages

# For each HTML file in the directory
for file in *.html; do
  # Check if the file already has preloader.js
  if ! grep -q "preloader.js" "$file"; then
    # Insert the script tag before main.js
    sed -i 's|<script src="../js/main.js"></script>|<script src="../js/preloader.js"></script>\n    <script src="../js/main.js"></script>|g' "$file"
    echo "Added preloader.js to $file"
  else
    echo "$file already contains preloader.js"
  fi
done

echo "Script insertion complete!"
