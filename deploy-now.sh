#!/bin/bash

echo "🚀 Deploying to Cloudflare Workers..."
echo ""

# Deploy using wrangler
npx wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your admin page: https://glenugiekennels.co.uk/app/admin"
echo "2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "3. Check console - build version should be different from 1778075143"
echo "4. Logs should NOT show 'Initializing data with token'"
echo "5. Click 'Delete All Bookings' and they won't come back!"
