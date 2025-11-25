#!/bin/bash

################################################################################
# Refoodify Application Deployment Script
# Deploys Refoodify to a Web server (Web01 or Web02)
# Usage: ./deploy.sh <server_ip> [optional_port]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/ema-love/Refoodify.git"
APP_DIR="/opt/refoodify"
APP_PORT="${2:-3000}"
SERVICE_NAME="refoodify"
NODE_VERSION="18"

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

# Check arguments
if [ -z "$1" ]; then
    log_error "Missing server IP address"
    echo "Usage: ./deploy.sh <server_ip> [optional_port]"
    echo "Example: ./deploy.sh 192.168.1.100 3000"
    exit 1
fi

SERVER_IP="$1"
SERVER_DOMAIN="${SERVER_IP}"

log_info "====== Refoodify Deployment Script ======"
log_info "Target Server: $SERVER_IP"
log_info "App Port: $APP_PORT"
log_info "App Directory: $APP_DIR"

# Step 1: Connect to server and create deployment commands
log_info "Connecting to server and preparing deployment..."

cat > /tmp/refoodify_deploy_commands.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

APP_DIR="/opt/refoodify"
APP_PORT=$APP_PORT_VAR
SERVICE_NAME="refoodify"

# Step 1: Update system packages
log_info "Step 1: Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Step 2: Install Node.js and npm
log_info "Step 2: Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log_warn "Node.js already installed: $(node --version)"
fi

# Step 3: Install Git
log_info "Step 3: Installing Git..."
sudo apt-get install -y git

# Step 4: Create application directory
log_info "Step 4: Creating application directory..."
sudo mkdir -p "$APP_DIR"
sudo chown -R ubuntu:ubuntu "$APP_DIR"

# Step 5: Clone or update repository
log_info "Step 5: Cloning Refoodify repository..."
if [ -d "$APP_DIR/.git" ]; then
    log_info "Repository exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    log_info "Cloning fresh repository..."
    git clone https://github.com/ema-love/Refoodify.git "$APP_DIR"
    cd "$APP_DIR"
fi

# Step 6: Install dependencies
log_info "Step 6: Installing Node.js dependencies..."
npm install

# Step 7: Create systemd service file
log_info "Step 7: Creating systemd service..."
sudo tee /etc/systemd/system/refoodify.service > /dev/null << SERVICE_FILE
[Unit]
Description=Refoodify Application Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/refoodify
ExecStart=/usr/bin/node /opt/refoodify/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PORT=$APP_PORT"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
SERVICE_FILE

# Step 8: Enable and start service
log_info "Step 8: Enabling and starting Refoodify service..."
sudo systemctl daemon-reload
sudo systemctl enable refoodify
sudo systemctl restart refoodify

# Step 9: Verify service is running
log_info "Step 9: Verifying service..."
sleep 2
if sudo systemctl is-active --quiet refoodify; then
    log_info "✓ Refoodify service is running on port $APP_PORT"
else
    log_error "✗ Refoodify service failed to start"
    sudo systemctl status refoodify
    exit 1
fi

# Step 10: Check application is responding
log_info "Step 10: Testing application endpoint..."
if curl -s http://localhost:$APP_PORT/index.html > /dev/null; then
    log_info "✓ Application is responding on http://localhost:$APP_PORT"
else
    log_warn "⚠ Application endpoint check failed (might be normal if behind LB)"
fi

log_info "====== Deployment Complete ======"
log_info "Application running on: http://$(hostname -I | awk '{print $1}'):$APP_PORT"
log_info "To view logs: sudo journalctl -u refoodify -f"

DEPLOY_SCRIPT

# Step 2: Transfer deployment script to server via SSH
log_info "Transferring deployment script to $SERVER_IP..."
scp -o StrictHostKeyChecking=no /tmp/refoodify_deploy_commands.sh ubuntu@"$SERVER_IP":/tmp/ || {
    log_error "Failed to transfer script. Ensure:"
    log_error "  1. Server is reachable at $SERVER_IP"
    log_error "  2. SSH key is configured for ubuntu user"
    exit 1
}

# Step 3: Execute deployment on remote server
log_info "Executing deployment on remote server..."
ssh -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" \
    APP_PORT_VAR="$APP_PORT" \
    bash /tmp/refoodify_deploy_commands.sh || {
    log_error "Remote deployment failed"
    exit 1
}

log_info "====== Deployment Successful ======"
log_info "Server: $SERVER_IP"
log_info "Port: $APP_PORT"
log_info "URL: http://$SERVER_IP:$APP_PORT"
log_info ""
log_info "Next steps:"
log_info "  1. Verify application is running: curl http://$SERVER_IP:$APP_PORT/index.html"
log_info "  2. Configure load balancer on Lb01"
log_info "  3. Test load balancing with: ./test-lb.sh"

# Cleanup
rm -f /tmp/refoodify_deploy_commands.sh

exit 0
