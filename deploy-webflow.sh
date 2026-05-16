#!/bin/bash

echo "🏗️  Building site..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo ""
  echo "📦 Build output is in: dist/"
  echo ""
  echo "To deploy to Webflow, you need to:"
  echo "1. Contact Webflow support about the deployment failure"
  echo "2. Or use the Webflow CLI if available"
  echo ""
  echo "Build version: $(cat public/BUILD_VERSION.txt)"
else
  echo "❌ Build failed!"
  exit 1
fi
