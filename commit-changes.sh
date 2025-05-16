#!/bin/bash
# Script to commit changes to GitHub for evolve-acoustics project

# Navigate to project directory
cd /home/bkam/evolve-acoustics

# Check git status to see what files have been modified
echo "Checking git status..."
git status

# Add all changed files to git
echo "Adding all changes to git..."
git add .

# Commit the changes with a descriptive message
echo "Committing changes..."
git commit -m "Fix social media icons display and CSP configuration

- Removed text content from Font Awesome icon tags
- Updated Content Security Policy to allow necessary domains
- Fixed hamburger menu functionality
- Added support for Elfsight widgets"

# Push the changes to GitHub
echo "Pushing changes to GitHub repository..."
git push origin master  # Assuming you're using the 'master' branch

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Changes successfully pushed to GitHub!"
    echo "Repository: https://github.com/DeliciousHouse/evolve-acoustics.git"
else
    echo "Error pushing changes to GitHub. Please check your credentials and try again."
fi