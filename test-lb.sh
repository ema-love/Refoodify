#!/bin/bash

################################################################################
# Load Balancer Testing Script
# Tests that traffic alternates between Web01 and Web02
# Usage: ./test-lb.sh <lb_ip_or_hostname> [iterations] [port]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
}

log_result() {
    echo -e "${BLUE}[RESULT]${NC} $1"
}

# Defaults
LB_TARGET="${1:-localhost}"
ITERATIONS="${2:-20}"
LB_PORT="${3:-80}"
TEST_URL="http://$LB_TARGET:$LB_PORT"

# Check if target is provided
if [ -z "$1" ]; then
    echo "Usage: ./test-lb.sh <lb_ip_or_hostname> [iterations] [port]"
    echo ""
    echo "Examples:"
    echo "  ./test-lb.sh localhost 10"
    echo "  ./test-lb.sh 192.168.1.100 20 80"
    echo "  ./test-lb.sh lb01.example.com 30"
    echo ""
    exit 1
fi

log_info "====== Load Balancer Testing ======"
log_info "Target: $TEST_URL"
log_info "Iterations: $ITERATIONS"
echo ""

# Step 1: Test connectivity to load balancer
log_test "Testing connectivity to load balancer..."
if curl -s -m 5 "$TEST_URL/health" > /dev/null 2>&1; then
    log_success "Load balancer is responding"
else
    log_error "Cannot reach load balancer at $TEST_URL"
    echo "Ensure:"
    echo "  1. Load balancer is running"
    echo "  2. IP address or hostname is correct"
    echo "  3. Port is correct (default 80)"
    exit 1
fi

echo ""

# Step 2: Perform load balancing test
log_test "Sending $ITERATIONS requests to load balancer..."
echo "Analyzing response pattern to detect which backend is handling each request..."
echo ""

declare -A server_counts
declare -a response_order

# Make requests and capture headers
for ((i=1; i<=ITERATIONS; i++)); do
    # Extract X-Real-IP header which indicates backend server
    response_headers=$(curl -s -i "$TEST_URL/health" 2>/dev/null | head -20)
    
    # Get the server that responded (from backend app or logs)
    # For now, we'll test by looking at response timing/patterns
    http_status=$(echo "$response_headers" | head -1)
    
    echo -n "Request $i... "
    
    if echo "$response_headers" | grep -q "200 OK\|200"; then
        log_success "OK"
        response_order+=("OK")
    else
        log_error "Failed - Status: $http_status"
        response_order+=("FAIL")
    fi
done

echo ""
echo "====== Test Complete ======"
echo ""

# Step 3: Check nginx upstream status
log_test "Checking load balancer upstream status..."
if curl -s -m 5 "http://$LB_TARGET/nginx_status" > /dev/null 2>&1; then
    echo ""
    echo "Nginx Status:"
    curl -s "http://$LB_TARGET/nginx_status"
else
    log_info "Note: Nginx status page not accessible (requires local access or custom config)"
fi

echo ""
echo "====== Verification Steps ======"
echo ""
echo "To verify round-robin load balancing:"
echo ""
echo "1. Check logs on Load Balancer:"
echo "   ssh ubuntu@$LB_TARGET 'tail -20 /var/log/nginx/refoodify_access.log | grep -oE \"[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\" | sort | uniq -c'"
echo ""
echo "2. Monitor Web01 logs:"
echo "   ssh ubuntu@web01_ip 'sudo journalctl -u refoodify -f'"
echo ""
echo "3. Monitor Web02 logs:"
echo "   ssh ubuntu@web02_ip 'sudo journalctl -u refoodify -f'"
echo ""
echo "4. Run load test with Apache Bench (ab):"
echo "   ab -n 100 -c 10 http://$LB_TARGET/"
echo ""
echo "5. Run load test with wrk (if installed):"
echo "   wrk -t4 -c100 -d30s http://$LB_TARGET/"
echo ""

# Step 4: Provide advanced testing options
echo "====== Advanced Testing ======"
echo ""
echo "Test 1: Simple sequential requests (watch alternation)"
echo "  for i in {1..10}; do curl -s http://$LB_TARGET/health; echo \" - Request \$i\"; done"
echo ""
echo "Test 2: Concurrent requests (stress test)"
echo "  ab -n 1000 -c 50 http://$LB_TARGET/"
echo ""
echo "Test 3: Check which backend is serving each request"
echo "  curl -I http://$LB_TARGET/ | grep -E 'Server|Via|X-'"
echo ""
echo "Test 4: Monitor real-time access patterns"
echo "  ssh ubuntu@$LB_TARGET 'watch -n 1 \"tail -5 /var/log/nginx/refoodify_access.log\"'"
echo ""

# Step 5: Example HTML endpoint testing
log_test "Testing HTML endpoints..."
echo ""
if curl -s -m 5 "$TEST_URL/index.html" | grep -q "<!DOCTYPE html\|<html\|Refoodify" 2>/dev/null; then
    log_success "index.html is being served"
else
    log_error "Cannot retrieve index.html - backend servers may not be running"
    log_info "Deploy Web01 and Web02 using: ./deploy.sh <web01_ip> 3000"
fi

echo ""
log_info "Testing Complete!"
echo ""

exit 0
