#!/bin/bash

# iPod PWA Local Server
# Run this script to start the development server

echo "🎵 iPod Music Player - Local Server"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found"
    echo "Please run this script from the ipod directory"
    exit 1
fi

# Check for icons
if [ ! -f "icon-192.png" ] || [ ! -f "icon-512.png" ]; then
    echo "⚠️  Warning: App icons not found"
    echo "Open icon-generator.html in your browser to create them"
    echo ""
fi

# Find available port (default 8000)
PORT=8000

# Try Python 3 first (most reliable on macOS)
if command -v python3 &> /dev/null; then
    echo "✅ Starting Python server on port $PORT..."
    echo ""
    echo "📱 Access on iPhone:"
    echo "   1. Connect iPhone to same WiFi"
    echo "   2. Find Mac IP: System Settings > Network"
    echo "   3. Open Safari on iPhone"
    echo "   4. Visit: http://YOUR_MAC_IP:$PORT"
    echo ""
    echo "💻 Access on Mac:"
    echo "   Visit: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "===================================="
    echo ""
    python3 -m http.server $PORT

# Fallback to PHP (also built into macOS)
elif command -v php &> /dev/null; then
    echo "✅ Starting PHP server on port $PORT..."
    echo ""
    echo "📱 Access on iPhone: http://YOUR_MAC_IP:$PORT"
    echo "💻 Access on Mac: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "===================================="
    echo ""
    php -S localhost:$PORT

# Fallback to Node.js
elif command -v node &> /dev/null; then
    echo "✅ Starting Node.js server on port $PORT..."
    echo ""
    echo "📱 Access on iPhone: http://YOUR_MAC_IP:$PORT"
    echo "💻 Access on Mac: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "===================================="
    echo ""
    npx -y serve -p $PORT

else
    echo "❌ Error: No suitable server found"
    echo ""
    echo "Please install one of the following:"
    echo "  • Python 3 (recommended)"
    echo "  • Node.js"
    echo "  • PHP"
    exit 1
fi
