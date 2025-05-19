#!/bin/bash

# Script to add scroll-to-top.js to all HTML pages in the pages directory

# Navigate to the pages directory
cd /home/bkam/evolve-acoustics/pages

# For each HTML file in the directory
for file in *.html; do
  # Check if the file already has scroll-to-top.js
  if ! grep -q "scroll-to-top.js" "$file"; then
    # Insert the script tag before the closing body tag
    sed -i 's|<script src="../js/main.js"></script>|<script src="../js/main.js"></script>\n    <script src="../js/scroll-to-top.js"></script>|g' "$file"
    echo "Added scroll-to-top.js to $file"
  else
    echo "$file already contains scroll-to-top.js"
  fi
done

echo "Script insertion complete!"
