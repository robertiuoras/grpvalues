#!/bin/bash

# Development Helper Script for GRP Values
# Automatically detects and fixes Webpack module errors

echo "🔧 GRP Values Development Helper"
echo "====================================="

# Function to check if Next.js is running
check_nextjs() {
    if pgrep -f "next dev" > /dev/null; then
        echo "⚠️  Next.js development server is already running"
        echo "   Stopping existing server..."
        pkill -f "next dev"
        sleep 2
    fi
}

# Function to clean all caches
clean_caches() {
    echo "🧹 Cleaning all caches..."
    rm -rf .next
    rm -rf node_modules/.cache
    npm cache clean --force
    echo "✅ Caches cleaned"
}

# Function to check for Webpack errors
check_webpack_errors() {
    echo "🔍 Checking for Webpack errors..."
    
    # Check if .next directory exists and has issues
    if [ -d ".next" ]; then
        if [ ! -f ".next/routes-manifest.json" ] || [ ! -f ".next/server/app-paths-manifest.json" ]; then
            echo "⚠️  Detected corrupted .next directory"
            return 1
        fi
    fi
    
    return 0
}

# Function to start development server
start_dev() {
    echo "🚀 Starting development server..."
    echo "   Using: npm run dev:stable"
    echo "   This will automatically clean caches and start fresh"
    echo ""
    echo "💡 If you still get Webpack errors, try:"
    echo "   npm run clean:all"
    echo ""
    
    npm run dev:stable
}

# Main execution
main() {
    check_nextjs
    clean_caches
    
    if check_webpack_errors; then
        echo "✅ No Webpack errors detected"
    else
        echo "⚠️  Webpack errors detected, cleaning and restarting..."
        clean_caches
    fi
    
    start_dev
}

# Run main function
main
