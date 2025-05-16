#!/bin/bash
# Script to commit changes to GitHub for evolve-acoustics project

# Navigate to project directory
cd /home/bkam/evolve-acoustics

# First, fetch changes from remote repository
echo "Fetching latest changes from remote repository..."
git fetch origin

# Check git status to see what files have been modified
echo "Checking git status..."
git status

# Check if branches have diverged or if local branch is behind remote
if git status | grep -q "Your branch and 'origin/main' have diverged"; then
    echo "Your branch has diverged from the remote. Performing a merge..."
    # Configure git to use merge strategy for pull (only for this session)
    git config pull.rebase false
    git pull origin main

    # Check if pull was successful
    if [ $? -ne 0 ]; then
        echo "Error pulling changes. You may have conflicts to resolve."
        exit 1
    fi
elif git status | grep -q "Your branch is behind"; then
    echo "Your local branch is behind the remote. Pulling latest changes..."
    git pull origin main

    # Check if pull was successful
    if [ $? -ne 0 ]; then
        echo "Error pulling changes. You may have conflicts to resolve."
        exit 1
    fi
fi

# First add all changes so we can analyze them properly
echo "Adding all changes to git..."
git add .

# Now store changed files for commit message (using --cached to see staged changes)
CHANGED_FILES=$(git diff --cached --name-only)
HTML_CHANGES=$(git diff --cached --name-only | grep -c "\.html$" || true)

# Generate commit message dynamically
COMMIT_MSG="Website updates:\n\n"

if [ "$HTML_CHANGES" -gt 0 ]; then
    COMMIT_MSG+="- Fixed social media icons in ${HTML_CHANGES} HTML files\n"
fi

# Check for specific types of changes
if git diff --cached | grep -q "fab fa-"; then
    COMMIT_MSG+="- Removed text from Font Awesome icon tags\n"
fi

if git diff --cached | grep -q "elfsight"; then
    COMMIT_MSG+="- Added support for Elfsight widgets\n"
fi

# Add a generic message if nothing specific was detected
if [ "$COMMIT_MSG" == "Website updates:\n\n" ]; then
    COMMIT_MSG+="- General website improvements and fixes\n"
fi

# Commit the changes with the dynamic message
echo "Committing changes with message:"
echo -e "$COMMIT_MSG"
git commit -m "$(echo -e "$COMMIT_MSG")"

# Push the changes to GitHub
echo "Pushing changes to GitHub repository..."
git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Changes successfully pushed to GitHub!"
    echo "Repository: https://github.com/DeliciousHouse/evolve-acoustics.git"

    # Build and push Docker image
    echo -e "\n=== Building and pushing Docker image ==="

    # Generate a version tag based on date and time
    VERSION_TAG=$(date '+%Y%m%d-%H%M%S')
    DOCKER_IMAGE="bkamai/evolve-acoustics:${VERSION_TAG}"
    DOCKER_LATEST="bkamai/evolve-acoustics:latest"

    echo "Building Docker image with tag: ${DOCKER_IMAGE}"
    docker build -t ${DOCKER_IMAGE} -t ${DOCKER_LATEST} .

    if [ $? -eq 0 ]; then
        echo "Docker image built successfully!"

        echo "Pushing Docker image to registry..."
        docker push ${DOCKER_IMAGE}
        docker push ${DOCKER_LATEST}

        echo "Deployment process completed successfully!"
    else
        echo "Error building Docker image. Please check the Dockerfile and try again."
    fi
else
    echo "Error pushing changes to GitHub. Please check your credentials and try again."
fi