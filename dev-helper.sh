#!/bin/bash

# Development Helper Script for GRP Database
# This script helps prevent CSS breaking issues by managing build cache

echo "🧹 Development Helper for GRP Database"
echo "=========================================="

# Function to clean cache
clean_cache() {
    echo "🗑️  Cleaning build cache..."
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    echo "✅ Cache cleaned successfully"
}

# Function to restart development server
restart_dev() {
    echo "🔄 Restarting development server..."
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    npm run dev &
    echo "✅ Development server restarted"
}

# Function to check if server is running
check_server() {
    if pgrep -f "next dev" > /dev/null; then
        echo "✅ Development server is running"
        return 0
    else
        echo "❌ Development server is not running"
        return 1
    fi
}

# Main menu
echo "Choose an option:"
echo "1) Clean cache only"
echo "2) Restart development server"
echo "3) Clean cache and restart"
echo "4) Check server status"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        clean_cache
        ;;
    2)
        restart_dev
        ;;
    3)
        clean_cache
        restart_dev
        ;;
    4)
        check_server
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "🎉 GRP Database development helper completed!"