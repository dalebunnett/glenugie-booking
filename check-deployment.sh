#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking Glenugie Kennels Deployment Status"
echo "=============================================="
echo ""

# Get current git commit
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "📝 Current local commit: ${GREEN}${CURRENT_COMMIT}${NC}"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  ${YELLOW}Warning: You have uncommitted changes${NC}"
    git status -s
    echo ""
fi

# Try to fetch deployed version
echo ""
echo "🌐 Checking deployed version..."

# You'll need to replace this with your actual domain
DOMAIN="your-app-domain.workers.dev"

if command -v curl &> /dev/null; then
    DEPLOYED_VERSION=$(curl -s "https://${DOMAIN}/BUILD_VERSION.txt" 2>/dev/null)
    
    if [ -n "$DEPLOYED_VERSION" ]; then
        echo "🚀 Deployed version: ${GREEN}${DEPLOYED_VERSION}${NC}"
        
        if [ "$CURRENT_COMMIT" = "$DEPLOYED_VERSION" ]; then
            echo "✅ ${GREEN}Deployment is UP TO DATE${NC}"
        else
            echo "❌ ${RED}Deployment is OUT OF DATE${NC}"
            echo ""
            echo "To deploy the latest version:"
            echo "  ${YELLOW}npm run build && npx wrangler deploy${NC}"
        fi
    else
        echo "⚠️  ${YELLOW}Could not fetch deployed version${NC}"
        echo "   Make sure the domain is correct in this script"
    fi
else
    echo "⚠️  ${YELLOW}curl not found - cannot check deployed version${NC}"
fi

echo ""
echo "📊 Recent commits:"
git log --oneline -5

echo ""
echo "🔧 Quick commands:"
echo "  Deploy:        ${YELLOW}npm run build && npx wrangler deploy${NC}"
echo "  Push to Git:   ${YELLOW}git add . && git commit -m 'message' && git push${NC}"
echo "  Check status:  ${YELLOW}git status${NC}"
