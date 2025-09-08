#!/bin/bash

# Development Helper Script for GRP Database
# Automatically detects and fixes Webpack module errors

echo "🔧 GRP Database Development Helper"
echo "====================================="

# Function to check if Next.js is running
check_nextjs() {
    if pgrep -f "next dev" > /dev/null; then
        echo "✅ Next.js development server is running"
        return 0
    else
        echo "❌ Next.js development server is not running"
        return 1
    fi
}

# Function to start Next.js if not running
start_nextjs() {
    echo "🚀 Starting Next.js development server..."
    npm run dev &
    sleep 3
    if check_nextjs; then
        echo "✅ Next.js started successfully"
    else
        echo "❌ Failed to start Next.js"
        exit 1
    fi
}

# Function to clean and restart
clean_restart() {
    echo "🧹 Cleaning and restarting..."
    
    # Kill existing Next.js processes
    pkill -f "next dev" 2>/dev/null || true
    
    # Clean cache
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    
    # Restart
    start_nextjs
}

# Main execution
if check_nextjs; then
    echo "✅ Development server is already running"
else
    echo "🔄 Starting development server..."
    start_nextjs
fi

echo "🎉 GRP Database development environment is ready!"
echo "📝 Visit http://localhost:3000 to view the application"