#!/usr/bin/env bash
set -e

echo "🌸 =========================================="
echo "🌸  Building SakuraFocus Native macOS App  "
echo "🌸 =========================================="
echo ""

# Ensure Node.js and npm are present
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "📦 1. Installing dependencies..."
npm install

echo ""
echo "⚙️ 2. Compiling application & packaging for macOS (.dmg and .app)..."
npm run build:mac

echo ""
echo "✨ =========================================="
echo "✨  Build Successful!                       "
echo "✨ =========================================="
echo "Your native macOS application has been built in:"
echo "👉 $(pwd)/dist-mac"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🚀 Opening the installer folder in Finder..."
  open dist-mac || true
fi
