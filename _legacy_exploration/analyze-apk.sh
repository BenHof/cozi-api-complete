#!/bin/bash

# Script to download and analyze Cozi Android APK for API endpoints
# This is a quick way to discover hidden endpoints

set -e

echo "🔍 Cozi APK Analyzer"
echo "===================="
echo ""

# Check dependencies
if ! command -v apktool &> /dev/null; then
    echo "📦 Installing apktool..."
    brew install apktool
fi

# Create work directory
WORK_DIR="./apk-analysis"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "📥 Downloading Cozi APK from APKPure..."
echo "Note: You'll need to manually download from https://apkpure.com/cozi-family-organizer/com.cozi.androidfree"
echo ""
echo "Or use this command:"
echo "curl -L 'https://d.apkpure.com/b/APK/com.cozi.androidfree?version=latest' -o cozi.apk"
echo ""

# Check if APK exists
if [ ! -f "cozi.apk" ]; then
    echo "❌ cozi.apk not found!"
    echo ""
    echo "Please download manually:"
    echo "1. Go to https://apkpure.com/cozi-family-organizer/com.cozi.androidfree"
    echo "2. Click 'Download APK'"
    echo "3. Save as ${WORK_DIR}/cozi.apk"
    echo ""
    exit 1
fi

echo "📦 Decompiling APK..."
apktool d cozi.apk -o cozi-decompiled -f

echo ""
echo "🔍 Searching for API endpoints..."
echo ""

cd cozi-decompiled

# Search for API base URLs
echo "=== Base URLs ==="
grep -r "rest.cozi.com" . 2>/dev/null | head -20

echo ""
echo "=== API Versions ==="
grep -r "api/ext/" . 2>/dev/null | grep -v ".smali:" | head -20

echo ""
echo "=== Endpoint Patterns ==="
grep -rE "(reminder|notification|message|recipe|meal|contact|photo|journal)" . 2>/dev/null | \
    grep -i "api" | \
    grep -v ".smali:" | \
    head -30

echo ""
echo "=== String Resources ==="
if [ -f "res/values/strings.xml" ]; then
    grep -i "api\|endpoint\|url" res/values/strings.xml | head -20
fi

echo ""
echo "=== Network Configuration ==="
find . -name "*.xml" -type f | xargs grep -l "rest.cozi.com\|api" 2>/dev/null | head -10

echo ""
echo "📄 Full results saved to: api-endpoints-found.txt"

# Save comprehensive results
{
    echo "=== ALL API REFERENCES ==="
    grep -r "rest.cozi.com" . 2>/dev/null
    echo ""
    echo "=== ALL API PATHS ==="
    grep -r "/api/ext/" . 2>/dev/null
    echo ""
    echo "=== ALL STRINGS WITH 'API' ==="
    find . -name "strings.xml" -type f | xargs cat 2>/dev/null | grep -i api
} > ../api-endpoints-found.txt

cd ..

echo ""
echo "✅ Analysis complete!"
echo ""
echo "Check these files:"
echo "  - api-endpoints-found.txt - All discovered endpoints"
echo "  - cozi-decompiled/ - Full decompiled APK"
echo ""
echo "Next steps:"
echo "1. Review api-endpoints-found.txt"
echo "2. Look in cozi-decompiled/smali/ for business logic"
echo "3. Check cozi-decompiled/res/values/strings.xml for URLs"
