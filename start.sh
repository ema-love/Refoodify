#!/bin/bash
# Quick Start Script for Refoodify
# This script starts the backend server and opens the app in your browser

echo "Starting Refoodify Backend Server..."
echo "========================================"

# Navigate to the project directory
cd "$(dirname "$0")" || exit

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo ""
echo "🚀 Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

PORT=3000 npm start

# If you want to open in browser automatically, uncomment below
# sleep 2 && open http://localhost:3000
