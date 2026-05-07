#!/bin/bash

echo "================================"
echo "DEPLOYING STAGING FIX"
echo "================================"
echo ""

# Check we're on staging branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "staging" ]; then
    echo "❌ ERROR: Not on staging branch (currently on $BRANCH)"
    echo "Run: git checkout staging"
    exit 1
fi

echo "✅ On staging branch"
echo ""

# Pull latest
echo "📥 Pulling latest changes..."
git pull origin staging
echo ""

# Build
echo "🔨 Building..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Deploy
echo "🚀 Deploying to Cloudflare..."
npx wrangler deploy
if [ $? -ne 0 ]; then
    echo "❌ Deploy failed!"
    exit 1
fi

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Visit your site"
echo "2. Go to /test-date-blocking"
echo "3. Test the booking form"
echo "4. Verify dates are blocked"
echo ""
