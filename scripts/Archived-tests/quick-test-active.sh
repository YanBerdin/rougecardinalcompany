#!/bin/bash

# Quick test script to get auth cookie and run tests
# Usage: ./scripts/quick-test-active.sh

set -e

echo "🔐 Quick Test Active Endpoint"
echo "=============================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Server is not running!"
  echo "Start it with: pnpm dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Instructions to get cookie
echo "📋 How to get your auth cookie:"
echo ""
echo "1. Open DevTools (F12) in your browser"
echo "2. Go to Application → Cookies → http://localhost:3000"
echo "3. Copy the value of 'sb-yvtrlvmbofklefxcxrzv-auth-token'"
echo ""
echo "Or run this command after logging in with curl:"
echo "  curl -c cookies.txt -X POST http://localhost:3000/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}'"
echo ""
echo "=============================="
echo ""

read -p "Enter your auth cookie (or press Enter to skip): " AUTH_COOKIE

if [ -z "$AUTH_COOKIE" ]; then
  echo ""
  echo "⚠️  No cookie provided. Running tests without auth (will show 403 errors)"
  echo ""
  pnpm exec tsx scripts/test-active-endpoint.ts
else
  echo ""
  echo "🧪 Running tests with authentication..."
  echo ""
  pnpm exec tsx scripts/test-active-endpoint.ts --cookie "$AUTH_COOKIE"
fi
