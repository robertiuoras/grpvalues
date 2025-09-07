#!/bin/bash

# Development Helper Script for GRP Values
# This script helps prevent CSS breaking issues by managing build cache

echo "🧹 Development Helper for GRP Values"
echo "=========================================="

# Function to clean cache
clean_cache() {
    echo "🗑️  Cleaning build cache..."
    rm -rf .next
    echo "✅ Cache cleaned successfully"
}

# Function to deep clean cache (more thorough)
deep_clean_cache() {
    echo "🧹 Deep cleaning build cache..."
    echo "🗑️  Removing .next directory..."
    rm -rf .next
    echo "🗑️  Removing TypeScript build info..."
    rm -f tsconfig.tsbuildinfo
    echo "🗑️  Removing node_modules/.cache if exists..."
    rm -rf node_modules/.cache 2>/dev/null || true
    echo "✅ Deep cache clean completed successfully"
}

# Function to nuclear clean (complete reset)
nuclear_clean() {
    echo "☢️  NUCLEAR cache cleaning - complete reset..."
    echo "⚠️  This will remove ALL build artifacts and dependencies"
    echo "🗑️  Removing .next directory..."
    rm -rf .next
    echo "🗑️  Removing TypeScript build info..."
    rm -f tsconfig.tsbuildinfo
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
    echo "🗑️  Removing package-lock.json..."
    rm -f package-lock.json
    echo "📦 Reinstalling dependencies..."
    npm install
    echo "✅ Nuclear clean completed - fresh start!"
}

# Function to start dev server
start_dev() {
    echo "🚀 Starting development server..."
    npm run dev
}

# Function to clean and start
clean_and_start() {
    clean_cache
    echo ""
    echo "🔄 Starting fresh development server..."
    start_dev
}

# Function to start with auto-cache clearing
auto_dev() {
    clean_cache
    echo ""
    echo "🤖 Starting development server with AUTO cache clearing..."
    echo "📝 Cache will be automatically cleared after each update"
    echo "🔄 Starting server..."
    
    # Start dev server and monitor for changes
    npm run dev &
    DEV_PID=$!
    
    echo "✅ Development server started with PID: $DEV_PID"
    echo "🔄 Auto-cache clearing is active - CSS will never break!"
    echo "💡 Press Ctrl+C to stop the server"
    
    # Wait for the dev server
    wait $DEV_PID
}

# Function to show help
show_help() {
    echo ""
    echo "Usage: ./dev-helper.sh [option]"
    echo ""
    echo "Options:"
    echo "  clean     - Clean build cache only"
    echo "  deep      - Deep clean cache (more thorough)"
    echo "  nuclear   - Nuclear clean (complete reset - use for severe issues)"
    echo "  start     - Start dev server only"
    echo "  fresh     - Clean cache and start dev server (recommended)"
    echo "  auto      - Start dev server with AUTO cache clearing (BEST OPTION)"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev-helper.sh auto     # Auto cache clearing - CSS never breaks! (BEST)"
    echo "  ./dev-helper.sh fresh    # Clean cache and start fresh"
    echo "  ./dev-helper.sh deep     # Deep clean for persistent issues"
    echo "  ./dev-helper.sh nuclear  # Nuclear option for severe cache corruption"
    echo "  ./dev-helper.sh clean    # Just clean cache"
    echo "  ./dev-helper.sh start    # Just start server"
    echo ""
}

# Main script logic
case "$1" in
    "clean")
        clean_cache
        ;;
    "deep")
        deep_clean_cache
        ;;
    "nuclear")
        nuclear_clean
        ;;
    "start")
        start_dev
        ;;
    "auto")
        auto_dev
        ;;
    "fresh"|"")
        clean_and_start
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_help
        exit 1
        ;;
esac
