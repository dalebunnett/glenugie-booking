#!/bin/bash
echo "🚀 Deployment Verification Checklist"
echo "===================================="
echo ""

# Check if complete.css exists
if [ -f "src/styles/complete.css" ]; then
    echo "✅ complete.css exists"
    echo "   Size: $(wc -c < src/styles/complete.css) bytes"
else
    echo "❌ complete.css missing"
fi

# Check main layout
if grep -q "complete.css" src/layouts/main.astro; then
    echo "✅ main.astro imports complete.css"
else
    echo "❌ main.astro doesn't import complete.css"
fi

# Check if all required CSS files exist
echo ""
echo "📁 Required CSS Files:"
for file in "src/site-components/css/normalize.css" "src/site-components/css/defaults.css" "src/site-components/css/fonts.css" "src/site-components/css/global.css" "generated/webflow.css"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file MISSING"
    fi
done

echo ""
echo "🔍 Build Status:"
if [ -d "dist" ]; then
    echo "   ✅ dist folder exists"
    
    # Check for CSS in dist
    css_count=$(find dist -name "*.css" 2>/dev/null | wc -l)
    echo "   📊 CSS files in dist: $css_count"
    
    if [ $css_count -gt 0 ]; then
        echo "   📄 CSS files:"
        find dist -name "*.css" -type f | head -5 | while read file; do
            size=$(wc -c < "$file" 2>/dev/null || echo "0")
            echo "      - $(basename $file) (${size} bytes)"
        done
    fi
else
    echo "   ⚠️  dist folder not found (run 'npm run build')"
fi

echo ""
echo "✨ Deployment Ready!"
