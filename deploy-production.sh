#!/bin/bash

# Glenugie Kennels - Production Deployment Script
# This script helps deploy your site to production

set -e  # Exit on error

echo "🐾 Glenugie Kennels - Production Deployment"
echo "==========================================="
echo ""

# Step 1: Clean previous builds
echo "📦 Step 1: Cleaning previous builds..."
rm -rf dist/
echo "✅ Clean complete"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Build for production
echo "🔨 Step 3: Building for production..."
npm run build
echo "✅ Build complete"
echo ""

# Step 4: Check if .assetsignore exists in dist
if [ -f "dist/.assetsignore" ]; then
  echo "✅ .assetsignore copied to dist/"
else
  echo "⚠️  Warning: .assetsignore not found in dist/"
fi
echo ""

# Step 5: Deploy options
echo "🚀 Step 4: Ready to deploy!"
echo ""
echo "Choose your deployment method:"
echo ""
echo "Option A: Deploy via Webflow (Recommended)"
echo "  1. Open your site in Webflow"
echo "  2. Go to Apps panel"
echo "  3. Click 'Deploy to Production'"
echo ""
echo "Option B: Deploy via Wrangler CLI"
echo "  Run: npx wrangler deploy"
echo ""

read -p "Deploy via Wrangler now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Deploying via Wrangler..."
  npx wrangler deploy
  echo ""
  echo "✅ Deployment complete!"
else
  echo "⏭️  Skipping Wrangler deployment"
  echo "   Deploy manually via Webflow when ready"
fi

echo ""
echo "📋 Post-Deployment Checklist:"
echo "  [ ] Set environment variables in production"
echo "  [ ] Initialize KV storage: /api/admin/init-kv"
echo "  [ ] Initialize booking data: /api/admin/init-data"
echo "  [ ] Test admin login: /admin"
echo "  [ ] Test booking flow: /booking"
echo ""
echo "📖 See DEPLOY_TO_PRODUCTION_NOW.md for detailed instructions"
echo ""
echo "🎉 Happy deploying!"
