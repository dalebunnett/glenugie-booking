#!/bin/bash

# Glenugie Booking - Push to GitHub Script
# Run this on your local computer after downloading the code

echo "🚀 Pushing Glenugie Booking System to GitHub..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Make sure you're in the project directory"
    exit 1
fi

# Set Git config
git config user.email "info@glenugiekennels.co.uk"
git config user.name "Glenugie Kennels"

# Add remote (will fail if already exists, which is fine)
git remote add origin https://github.com/dalebunnett/glenugie-booking.git 2>/dev/null || true

# Show status
echo "📦 Repository status:"
git status --short | head -20
echo ""

# Push to GitHub
echo "🔄 Pushing to GitHub..."
echo "You will be prompted for:"
echo "  Username: dalebunnett"
echo "  Password: <your Personal Access Token>"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository: https://github.com/dalebunnett/glenugie-booking"
    echo ""
    echo "Next steps:"
    echo "1. Webflow Cloud will automatically detect the new code"
    echo "2. Check your Webflow dashboard for build progress"
    echo "3. Your app will be live at: https://www.glenugiekennels.co.uk/app/"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "1. Make sure you created the repository on GitHub"
    echo "2. Use your Personal Access Token (not password)"
    echo "3. Token must have 'repo' permissions"
    echo ""
    echo "Generate token: https://github.com/settings/tokens"
fi
