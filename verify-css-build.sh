#!/bin/bash

echo "🔍 Verifying CSS Build..."
echo ""

CSS_FILE=$(find dist -name "*.css" -type f | head -1)

if [ -z "$CSS_FILE" ]; then
    echo "❌ ERROR: No CSS file found in dist/"
    exit 1
fi

echo "✅ CSS file found: $CSS_FILE"
echo ""

echo "📊 CSS File Stats:"
echo "  Size: $(du -h "$CSS_FILE" | cut -f1)"
echo "  Lines: $(wc -l < "$CSS_FILE")"
echo ""

echo "🔍 Checking CSS Contents:"
echo ""

if grep -q "tailwindcss" "$CSS_FILE"; then
    echo "  ✅ Tailwind CSS: Found"
else
    echo "  ❌ Tailwind CSS: Missing"
fi

if grep -q "Great Vibes" "$CSS_FILE"; then
    echo "  ✅ Great Vibes font: Found"
else
    echo "  ❌ Great Vibes font: Missing"
fi

if grep -q "Fira Sans" "$CSS_FILE"; then
    echo "  ✅ Fira Sans font: Found"
else
    echo "  ❌ Fira Sans font: Missing"
fi

if grep -q "@layer" "$CSS_FILE"; then
    echo "  ✅ CSS Layers: Found"
else
    echo "  ❌ CSS Layers: Missing"
fi

echo ""
echo "✅ Build verification complete!"
echo ""
echo "Next step: Deploy to Webflow"
