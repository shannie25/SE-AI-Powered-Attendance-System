#!/bin/bash
# Face Scanner Launcher for Mac/Linux
# Double-click this file to open the scanner
# Or run: bash open_scanner.sh

# ==========================================
# CONFIGURATION - CHANGE THIS TO YOUR SERVER IP
# ==========================================
SERVER_IP="192.168.1.100"
PORT="8080"

# ==========================================
# Launch scanner
# ==========================================

clear
echo "════════════════════════════════════════════"
echo "   AI Attendance - Face Scanner Launcher"
echo "════════════════════════════════════════════"
echo ""
echo "Connecting to: http://$SERVER_IP:$PORT/scanner.html"
echo ""
echo "Loading scanner..."
echo ""

# Build URL
URL="http://$SERVER_IP:$PORT/scanner.html"

# Detect OS and open accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Detected macOS - Starting Safari..."
    open -a Safari "$URL"
    
    # Alternative: Use Chrome on Mac
    # open -a "Google Chrome" --args --kiosk "$URL"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Detected Linux - Starting browser..."
    
    # Try different browsers
    if command -v google-chrome &> /dev/null; then
        google-chrome --kiosk "$URL" &
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser --kiosk "$URL" &
    elif command -v firefox &> /dev/null; then
        firefox "$URL" &
    else
        xdg-open "$URL" &
    fi
else
    # Unknown OS
    echo "Unknown OS - Opening in default browser..."
    xdg-open "$URL" 2>/dev/null || open "$URL" 2>/dev/null
fi

echo ""
echo "════════════════════════════════════════════"
echo "Scanner should open automatically!"
echo ""
echo "To exit fullscreen:"
echo "  - macOS: Cmd+Ctrl+F or Esc"
echo "  - Linux: F11 or Esc"
echo "════════════════════════════════════════════"
echo ""

# Wait a bit before closing
sleep 3
