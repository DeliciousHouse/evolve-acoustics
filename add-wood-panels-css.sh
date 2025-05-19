#!/bin/bash

# Script to add wood-accent-panels.css to all HTML files

# Find all HTML files
HTML_FILES=$(find /home/bkam/evolve-acoustics -name "*.html")

# Add the wood-accent-panels.css link to each HTML file before the closing </head> tag
for file in $HTML_FILES; do
  echo "Processing $file..."

  # Check if the file already has the wood-accent-panels.css
  if grep -q "wood-accent-panels.css" "$file"; then
    echo "  wood-accent-panels.css already added to $file, skipping."
  else
    # Add the wood-accent-panels.css link before the closing </head> tag
    sed -i 's|</head>|    <link rel="stylesheet" href="/css/wood-accent-panels.css">\n</head>|' "$file"
    echo "  Added wood-accent-panels.css to $file"
  fi
done

echo "Done! All HTML files have been updated."
