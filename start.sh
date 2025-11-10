#!/bin/bash
# SpiegelMatch - Quick Start Script

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║    🎭 SpiegelMatch - Quick Start               ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env Datei nicht gefunden!"
    echo "   Bitte erstelle .env mit den Supabase-Credentials."
    echo "   Siehe .env.example"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start services
echo "🚀 Starting SpiegelMatch..."
echo ""
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev:all
