#!/bin/bash

# Refoodify API Testing Helper Script
# Run this to start a local server and test APIs

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Refoodify API Integration Testing${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
fi

# Start local server
echo -e "${YELLOW}Starting local web server on port 8080...${NC}"
cd "$(dirname "$0")" || exit
python3 -m http.server 8080 &
SERVER_PID=$!

echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
echo ""
echo -e "${YELLOW}Testing API endpoints...${NC}"
echo ""

# Test Spoonacular API
echo -e "${YELLOW}1. Testing Spoonacular API${NC}"
curl -s "https://api.spoonacular.com/recipes/findByIngredients?apiKey=825ab033e0a4406388d0145f156d52be&ingredients=apple,chicken" | head -c 200
echo ""
echo ""

# Test Google Custom Search API
echo -e "${YELLOW}2. Testing Google Custom Search${NC}"
echo "   Note: Custom Search Engine ID needs to be configured in script.js"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo -e "${GREEN}1. Open http://localhost:8080 in your browser${NC}"
echo -e "${GREEN}2. Navigate to analyzer.html${NC}"
echo -e "${GREEN}3. Enter ingredients (e.g., 'apple')${NC}"
echo -e "${GREEN}4. Check browser console (F12) for API responses${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Press Ctrl+C to stop the server."
wait $SERVER_PID
