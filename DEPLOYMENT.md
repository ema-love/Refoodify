# Refoodify Deployment Guide - Oracle Cloud (Web01, Web02, Lb01)

## Overview

This guide walks you through deploying the Refoodify application across Oracle Cloud with:
- **Web01**: Application server running Node.js (port 3000)
- **Web02**: Application server running Node.js (port 3000)  
- **Lb01**: Nginx load balancer routing traffic across Web01 and Web02

## Architecture

```
┌─────────────────────────────────────────┐
│           Internet / Clients             │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Lb01 (Nginx LB)    │
        │  192.168.1.100:80    │
        └──────────┬───────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
    ┌─────────────┐    ┌─────────────┐
    │  Web01      │    │  Web02      │
    │ Node 3000   │    │ Node 3000   │
    │192.168.1.101│    │192.168.1.102│
    └─────────────┘    └─────────────┘
```

## Prerequisites

### Local Machine (where you run deployment scripts)
- Bash shell (macOS/Linux)
- SSH access configured to Oracle Cloud servers
- SSH key pair for authentication
- Git installed

### Oracle Cloud VMs
- Ubuntu 20.04 LTS or 22.04 LTS
- Security groups allowing:
  - Port 22 (SSH) - from your local IP
  - Port 80 (HTTP) - from clients
  - Port 443 (HTTPS) - from clients (optional)
  - Port 3000 (Node.js) - between LB and Web servers

## Step 1: Prepare Deployment Scripts

First, make all scripts executable on your local machine:

```bash
cd /Users/user/Documents/refoodify
chmod +x deploy.sh setup-lb.sh test-lb.sh
```

## Step 2: Deploy Web01 and Web02

Deploy the Refoodify application to both web servers.

### Deploy to Web01:

```bash
./deploy.sh 192.168.1.101 3000
```

**What this does:**
1. Connects to Web01 via SSH
2. Updates system packages
3. Installs Node.js and npm
4. Clones Refoodify repository from GitHub
5. Installs npm dependencies
6. Creates systemd service for auto-start/restart
7. Verifies application is running
8. Returns logs showing successful deployment

**Expected output:**
```
[INFO] ====== Refoodify Deployment Script ======
[INFO] Target Server: 192.168.1.101
[INFO] App Port: 3000
[INFO] Connecting to server and preparing deployment...
...
[INFO] ====== Deployment Successful ======
[INFO] Server: 192.168.1.101
[INFO] Port: 3000
[INFO] URL: http://192.168.1.101:3000
```

### Deploy to Web02:

```bash
./deploy.sh 192.168.1.102 3000
```

### Verify Both Servers

Test that both servers are running:

```bash
# Test Web01
curl -I http://192.168.1.101:3000/index.html

# Test Web02
curl -I http://192.168.1.102:3000/index.html

# Expected: HTTP/1.1 200 OK
```

## Step 3: Configure Load Balancer on Lb01

Setup nginx on the load balancer to route traffic across Web01 and Web02.

```bash
./setup-lb.sh 192.168.1.101 192.168.1.102 192.168.1.100
```

**Parameters:**
- `192.168.1.101` - Web01 IP address
- `192.168.1.102` - Web02 IP address  
- `192.168.1.100` - Lb01 IP address (optional, for display only)

**What this does:**
1. Connects to Lb01 via SSH
2. Installs nginx
3. Creates load balancing configuration
4. Configures round-robin distribution
5. Enables and starts nginx service
6. Tests connectivity to backend servers
7. Displays status and useful commands

**Expected output:**
```
[STEP] Updating system packages...
[STEP] Installing nginx...
[STEP] Creating nginx load balancer configuration...
...
[INFO] ✓ Nginx is running
[INFO] ====== Load Balancer Setup Complete ======

Configuration Summary:
  Backend 1 (Web01): http://192.168.1.101:3000
  Backend 2 (Web02): http://192.168.1.102:3000
  Load Balancer:     http://localhost
```

## Step 4: Test Load Balancing

Verify that traffic alternates between Web01 and Web02.

```bash
./test-lb.sh 192.168.1.100 20 80
```

**Parameters:**
- `192.168.1.100` - Lb01 IP address
- `20` - Number of test requests (default: 20)
- `80` - HTTP port (default: 80)

**Expected output:**
All requests should return 200 OK, indicating both servers are handling traffic.

### Advanced Testing

**1. Monitor live access logs:**

```bash
# SSH to Lb01 and watch logs
ssh ubuntu@192.168.1.100 'tail -f /var/log/nginx/refoodify_access.log'
```

**2. Verify round-robin distribution:**

```bash
# Run 100 requests and count by backend IP
for i in {1..100}; do
  curl -s -H "Host: localhost" http://192.168.1.100 &
done
wait
```

**3. Load test with Apache Bench:**

```bash
ab -n 1000 -c 50 http://192.168.1.100/
```

**Expected results:**
- Requests should alternate between Web01 and Web02
- Access logs show requests from both backend IPs
- Load is distributed roughly equally (50/50)

## Monitoring and Management

### Check Service Status

**On Web01/Web02:**
```bash
# Check if Refoodify is running
ssh ubuntu@192.168.1.101 'sudo systemctl status refoodify'

# View recent logs
ssh ubuntu@192.168.1.101 'sudo journalctl -u refoodify -n 50 -f'

# Check port is listening
ssh ubuntu@192.168.1.101 'netstat -tlnp | grep 3000'
```

**On Lb01:**
```bash
# Check if nginx is running
ssh ubuntu@192.168.1.100 'sudo systemctl status nginx'

# View access logs
ssh ubuntu@192.168.1.100 'tail -f /var/log/nginx/refoodify_access.log'

# View nginx status
curl http://192.168.1.100/nginx_status
```

### Common Commands

```bash
# Restart Refoodify service
ssh ubuntu@192.168.1.101 'sudo systemctl restart refoodify'

# Reload nginx config (no downtime)
ssh ubuntu@192.168.1.100 'sudo nginx -s reload'

# View nginx configuration
ssh ubuntu@192.168.1.100 'cat /etc/nginx/sites-available/refoodify-lb'

# Check nginx config syntax
ssh ubuntu@192.168.1.100 'sudo nginx -t'

# View nginx error logs
ssh ubuntu@192.168.1.100 'tail -f /var/log/nginx/refoodify_error.log'
```

## Load Balancing Methods

By default, nginx uses **round-robin** load balancing:
- Request 1 → Web01
- Request 2 → Web02
- Request 3 → Web01
- Request 4 → Web02
- ...and so on

### Other Load Balancing Options

Edit `/etc/nginx/sites-available/refoodify-lb` on Lb01 to change methods:

**Least Connections** (good for long-lived connections):
```nginx
upstream refoodify_backend {
    least_conn;
    server 192.168.1.101:3000;
    server 192.168.1.102:3000;
}
```

**IP Hash** (session persistence - same client goes to same server):
```nginx
upstream refoodify_backend {
    ip_hash;
    server 192.168.1.101:3000;
    server 192.168.1.102:3000;
}
```

**Weighted Round-Robin** (distribute by ratio):
```nginx
upstream refoodify_backend {
    server 192.168.1.101:3000 weight=3;  # 60% of traffic
    server 192.168.1.102:3000 weight=1;  # 40% of traffic
}
```

After editing, reload nginx:
```bash
ssh ubuntu@192.168.1.100 'sudo nginx -s reload'
```

## Health Checks and Failover

The current configuration includes basic health checks:
```nginx
server 192.168.1.101:3000 max_fails=3 fail_timeout=30s;
server 192.168.1.102:3000 max_fails=3 fail_timeout=30s;
```

This means:
- If a server fails 3 consecutive health checks
- It's marked as down for 30 seconds
- Traffic only goes to the healthy server
- After 30s, the unhealthy server is retried

### Testing Failover

Stop Web01 and verify traffic only goes to Web02:

```bash
# Stop Web01 service
ssh ubuntu@192.168.1.101 'sudo systemctl stop refoodify'

# Monitor logs on Lb01
ssh ubuntu@192.168.1.100 'tail -f /var/log/nginx/refoodify_access.log'

# Make requests - should all come from Web02 (192.168.1.102)
for i in {1..10}; do curl http://192.168.1.100/; done

# Restart Web01
ssh ubuntu@192.168.1.101 'sudo systemctl restart refoodify'

# Traffic should resume alternating between both servers
```

## Troubleshooting

### Web servers not responding

**Check if service is running:**
```bash
ssh ubuntu@192.168.1.101 'sudo systemctl status refoodify'
ssh ubuntu@192.168.1.102 'sudo systemctl status refoodify'
```

**Check logs for errors:**
```bash
ssh ubuntu@192.168.1.101 'sudo journalctl -u refoodify -n 100'
```

**Manually verify port is open:**
```bash
ssh ubuntu@192.168.1.101 'curl http://localhost:3000/health'
```

### Load balancer not routing traffic

**Verify nginx configuration:**
```bash
ssh ubuntu@192.168.1.100 'sudo nginx -t'
```

**Check nginx is running:**
```bash
ssh ubuntu@192.168.1.100 'sudo systemctl status nginx'
```

**Test connectivity from LB to backends:**
```bash
ssh ubuntu@192.168.1.100 'curl http://192.168.1.101:3000/health'
ssh ubuntu@192.168.1.100 'curl http://192.168.1.102:3000/health'
```

### All traffic goes to one server

This usually means the other server is marked as down. Check:
1. Is the other server running? `systemctl status refoodify`
2. Is port 3000 open? `netstat -tlnp | grep 3000`
3. Can LB reach it? From Lb01: `curl http://<server_ip>:3000/health`

### High latency or slow responses

Check:
1. CPU and memory usage on all servers
2. Network connectivity between servers
3. Backend application logs for errors
4. Consider adjusting `proxy_buffer_size` in nginx config

## Scaling and Maintenance

### Adding More Web Servers

To add Web03, Web04, etc.:

1. Deploy using the same script: `./deploy.sh 192.168.1.103 3000`

2. Update Lb01 nginx config:
   ```bash
   ssh ubuntu@192.168.1.100 'sudo nano /etc/nginx/sites-available/refoodify-lb'
   ```
   
   Add to upstream section:
   ```nginx
   server 192.168.1.103:3000 max_fails=3 fail_timeout=30s;
   server 192.168.1.104:3000 max_fails=3 fail_timeout=30s;
   ```

3. Reload nginx:
   ```bash
   ssh ubuntu@192.168.1.100 'sudo nginx -s reload'
   ```

### Updating Application Code

To deploy new code to all servers:

1. Commit and push to GitHub
   ```bash
   cd /Users/user/Documents/refoodify
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. Pull updates on each server:
   ```bash
   ssh ubuntu@192.168.1.101 'cd /opt/refoodify && git pull origin main && npm install'
   ssh ubuntu@192.168.1.102 'cd /opt/refoodify && git pull origin main && npm install'
   ```

3. Restart services (one at a time for zero downtime):
   ```bash
   ssh ubuntu@192.168.1.101 'sudo systemctl restart refoodify'
   # Wait for service to start
   sleep 5
   ssh ubuntu@192.168.1.102 'sudo systemctl restart refoodify'
   ```

## Security Considerations

### Current Setup
- Load balancer accepts HTTP (port 80)
- Backend servers only accept traffic from LB (restrict in security group)

### Recommended Improvements

**1. Enable HTTPS on Load Balancer:**
```bash
# Install Certbot
ssh ubuntu@192.168.1.100 'sudo apt-get install -y certbot python3-certbot-nginx'

# Get certificate
ssh ubuntu@192.168.1.100 'sudo certbot certonly --nginx -d lb01.refoodify.local'

# Update nginx config to use HTTPS and redirect HTTP
```

**2. Restrict Backend Access:**
In Oracle Cloud Security Groups:
- Web01 & Web02: Allow port 3000 only from Lb01 (192.168.1.100)
- Lb01: Allow port 80 and 443 from 0.0.0.0/0

**3. Add Authentication:**
Consider adding basic auth to sensitive endpoints in nginx config

## Performance Tuning

### Nginx Configuration Optimizations

Edit `/etc/nginx/sites-available/refoodify-lb`:

```nginx
upstream refoodify_backend {
    # Increase connection pool size
    keepalive 128;
    
    # Add multiple worker processes
    # (auto-configured based on CPU cores)
    server 192.168.1.101:3000 max_fails=3 fail_timeout=30s;
    server 192.168.1.102:3000 max_fails=3 fail_timeout=30s;
}

server {
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Buffer sizes for better performance
    proxy_buffer_size 16k;
    proxy_buffers 8 16k;
    proxy_busy_buffers_size 32k;
    
    location / {
        proxy_pass http://refoodify_backend;
        # ... other proxy settings
    }
}
```

## Deployment Summary Checklist

- [ ] Created deploy.sh script
- [ ] Created setup-lb.sh script  
- [ ] Created test-lb.sh script
- [ ] Made all scripts executable (`chmod +x`)
- [ ] Deployed to Web01 (`./deploy.sh 192.168.1.101 3000`)
- [ ] Deployed to Web02 (`./deploy.sh 192.168.1.102 3000`)
- [ ] Verified both web servers are running
- [ ] Setup Lb01 (`./setup-lb.sh 192.168.1.101 192.168.1.102`)
- [ ] Tested load balancing (`./test-lb.sh 192.168.1.100`)
- [ ] Verified traffic alternates between Web01 and Web02
- [ ] Monitored access logs to confirm distribution
- [ ] Documented server IPs and access information

## Next Steps

1. **Monitor Production:** Set up monitoring for CPU, memory, disk on all servers
2. **Enable HTTPS:** Configure SSL/TLS on the load balancer
3. **Database:** If using database, set up replication or managed database service
4. **Backups:** Implement automated backups of application code and data
5. **CI/CD:** Set up GitHub Actions to auto-deploy on push

## Support

For issues or questions:
1. Check logs: `journalctl` on app servers, `/var/log/nginx/` on LB
2. Review firewall rules in Oracle Cloud console
3. Verify SSH key access to all servers
4. Ensure IPs are correctly substituted in all scripts

---

**Last Updated:** November 25, 2025
**Version:** 1.0
