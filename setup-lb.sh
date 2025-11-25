#!/bin/bash

################################################################################
# Load Balancer Setup Script for Lb01
# Installs and configures nginx to distribute traffic to Web01 and Web02
# Usage: ./setup-lb.sh <web01_ip> <web02_ip> [lb_ip]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    log_error "Missing required arguments"
    echo "Usage: ./setup-lb.sh <web01_ip> <web02_ip> [lb_ip]"
    echo ""
    echo "Example:"
    echo "  ./setup-lb.sh 192.168.1.101 192.168.1.102 192.168.1.100"
    echo ""
    exit 1
fi

WEB01_IP="$1"
WEB02_IP="$2"
LB_IP="${3:-}"
LB_DOMAIN="lb01.refoodify.local"

log_info "====== Refoodify Load Balancer Setup ======"
log_info "Web01 IP: $WEB01_IP"
log_info "Web02 IP: $WEB02_IP"
[ -n "$LB_IP" ] && log_info "Lb01 IP: $LB_IP"

# Step 1: Update system
log_step "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Step 2: Install nginx
log_step "Installing nginx..."
sudo apt-get install -y nginx

# Step 3: Backup original nginx config
log_step "Backing up original nginx configuration..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Step 4: Create nginx configuration for load balancing
log_step "Creating nginx load balancer configuration..."
sudo tee /etc/nginx/sites-available/refoodify-lb > /dev/null << 'NGINX_CONFIG'
# Refoodify Load Balancer Configuration
upstream refoodify_backend {
    # Round-robin load balancing across Web01 and Web02
    server WEB01_IP_PLACEHOLDER:3000 max_fails=3 fail_timeout=30s;
    server WEB02_IP_PLACEHOLDER:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP server
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
    access_log /var/log/nginx/refoodify_access.log combined;
    error_log /var/log/nginx/refoodify_error.log;
    
    # Redirect all traffic through load balancer
    location / {
        proxy_pass http://refoodify_backend;
        proxy_http_version 1.1;
        
        # Preserve original request information
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "LB is healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Load balancer status page (requires ngx_http_stub_status_module)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow ::1;
        deny all;
    }
}
NGINX_CONFIG

# Replace placeholders with actual IPs
log_step "Updating configuration with backend IPs..."
sudo sed -i "s/WEB01_IP_PLACEHOLDER/$WEB01_IP/g" /etc/nginx/sites-available/refoodify-lb
sudo sed -i "s/WEB02_IP_PLACEHOLDER/$WEB02_IP/g" /etc/nginx/sites-available/refoodify-lb

# Step 5: Enable the site
log_step "Enabling refoodify-lb site..."
sudo ln -sf /etc/nginx/sites-available/refoodify-lb /etc/nginx/sites-enabled/refoodify-lb
sudo rm -f /etc/nginx/sites-enabled/default

# Step 6: Test nginx configuration
log_step "Testing nginx configuration..."
if sudo nginx -t; then
    log_info "✓ Nginx configuration is valid"
else
    log_error "✗ Nginx configuration test failed"
    sudo nginx -t
    exit 1
fi

# Step 7: Start and enable nginx
log_step "Starting nginx service..."
sudo systemctl restart nginx
sudo systemctl enable nginx

sleep 2

# Step 8: Verify nginx is running
if sudo systemctl is-active --quiet nginx; then
    log_info "✓ Nginx is running"
else
    log_error "✗ Nginx failed to start"
    sudo systemctl status nginx
    exit 1
fi

# Step 9: Test connectivity to backends
log_step "Testing connectivity to backend servers..."
echo ""
echo "Testing Web01 ($WEB01_IP:3000)..."
if timeout 5 bash -c "echo > /dev/tcp/$WEB01_IP/3000" 2>/dev/null; then
    log_info "✓ Web01 is reachable"
else
    log_warn "⚠ Web01 is not responding (might not be running yet)"
fi

echo "Testing Web02 ($WEB02_IP:3000)..."
if timeout 5 bash -c "echo > /dev/tcp/$WEB02_IP/3000" 2>/dev/null; then
    log_info "✓ Web02 is reachable"
else
    log_warn "⚠ Web02 is not responding (might not be running yet)"
fi

# Step 10: Display configuration and URLs
log_info "====== Load Balancer Setup Complete ======"
echo ""
echo "Configuration Summary:"
echo "  Backend 1 (Web01): http://$WEB01_IP:3000"
echo "  Backend 2 (Web02): http://$WEB02_IP:3000"
echo "  Load Balancer:     http://localhost"
[ -n "$LB_IP" ] && echo "  Load Balancer IP:  http://$LB_IP"
echo ""
echo "Useful Commands:"
echo "  View LB status:       curl http://localhost/nginx_status"
echo "  View access logs:     tail -f /var/log/nginx/refoodify_access.log"
echo "  View error logs:      tail -f /var/log/nginx/refoodify_error.log"
echo "  Reload config:        sudo nginx -s reload"
echo "  Stop nginx:           sudo systemctl stop nginx"
echo ""
echo "Configuration file: /etc/nginx/sites-available/refoodify-lb"
echo "Backup file:        /etc/nginx/sites-available/refoodify-lb.backup"
echo ""

log_info "Next steps:"
log_info "  1. Deploy Web01 and Web02: ./deploy.sh <web01_ip> 3000"
log_info "  2. Test load balancing:    ./test-lb.sh <lb_ip>"

exit 0
