#!/bin/bash

# Push to GitHub Script
# This will push your committed changes to GitHub

echo "🚀 Pushing authentication fix to GitHub..."
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are commits to push
if git rev-parse @{u} > /dev/null 2>&1; then
    COMMITS_AHEAD=$(git rev-list --count @{u}..HEAD)
    if [ "$COMMITS_AHEAD" -eq 0 ]; then
        echo "✅ Already up to date - no commits to push"
        exit 0
    fi
    echo "📦 Found $COMMITS_AHEAD commit(s) to push"
else
    echo "📦 Preparing to push to remote..."
fi

# Show what will be pushed
echo ""
echo "📋 Commits to push:"
git log origin/main..HEAD --oneline
echo ""

# Try to push
echo "🔄 Pushing to origin/main..."
if git push origin main; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your Webflow project"
    echo "2. Wait 2-3 minutes for auto-deployment"
    echo "3. Hard refresh browser (Ctrl+Shift+R)"
    echo "4. Login at: https://www.glenugiekennels.co.uk/app/admin"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "This usually means:"
    echo "1. Git credentials not configured"
    echo "2. No internet connection"
    echo "3. Remote repository not accessible"
    echo ""
    echo "Solutions:"
    echo "• Use GitHub Desktop instead"
    echo "• Configure Git credentials"
    echo "• Push manually from your Git client"
    echo ""
    exit 1
fi
