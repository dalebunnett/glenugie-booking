#!/bin/bash

# Glenugie Kennels - Complete Production Rebuild Script
# This script removes the old deployment and creates a fresh production build

set -e  # Exit on any error

echo "🧹 Step 1: Cleaning old build artifacts..."
rm -rf dist/
rm -rf .astro/
rm -rf node_modules/.vite/
echo "✅ Clean complete"

echo ""
echo "📦 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "🔨 Step 3: Building production bundle..."
npm run build
echo "✅ Build complete"

echo ""
echo "📋 Step 4: Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found!"
  exit 1
fi

if [ ! -f "dist/_worker.js/index.js" ]; then
  echo "❌ Error: Worker file not found!"
  exit 1
fi

echo "✅ Build verification passed"

echo ""
echo "🚀 Step 5: Deploying to Cloudflare Workers..."
echo "   Domain: glenugiekennels.co.uk/glenugie-booking/*"
echo "   Worker: astro"
echo ""

npx wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site is now live at:"
echo "   https://glenugiekennels.co.uk/glenugie-booking/"
echo "   https://www.glenugiekennels.co.uk/glenugie-booking/"
echo ""
echo "🔧 Admin panel:"
echo "   https://glenugiekennels.co.uk/glenugie-booking/admin"
echo ""
echo "📊 To view deployment status:"
echo "   npx wrangler deployments list"
echo ""
echo "🎉 Production rebuild complete!"
