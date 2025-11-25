# Quick Start Deployment Guide

## What You Have

Your Refoodify repository now includes complete deployment automation for Oracle Cloud with:

1. **deploy.sh** - Automated deployment to Web01 and Web02
2. **setup-lb.sh** - Nginx load balancer configuration for Lb01
3. **test-lb.sh** - Load balancing verification tests
4. **nginx.conf** - Reference nginx configuration
5. **DEPLOYMENT.md** - Comprehensive deployment guide

## In 5 Steps

### Step 1: Make scripts executable (local machine)
```bash
cd /Users/user/Documents/refoodify
chmod +x deploy.sh setup-lb.sh test-lb.sh
```

### Step 2: Deploy to Web01
```bash
./deploy.sh 192.168.1.101 3000
# Replace 192.168.1.101 with your actual Web01 IP
# This automatically:
# - Installs Node.js, npm, Git
# - Clones Refoodify repository
# - Installs npm dependencies
# - Creates systemd service for auto-restart
# - Starts the application on port 3000
```

### Step 3: Deploy to Web02
```bash
./deploy.sh 192.168.1.102 3000
# Replace 192.168.1.102 with your actual Web02 IP
```

### Step 4: Setup Load Balancer on Lb01
```bash
./setup-lb.sh 192.168.1.101 192.168.1.102 192.168.1.100
# Parameters: web01_ip web02_ip lb01_ip (optional)
# This automatically:
# - Installs nginx
# - Configures round-robin load balancing
# - Sets up health checks and failover
# - Starts nginx service
```

### Step 5: Test Load Balancing
```bash
./test-lb.sh 192.168.1.100 20 80
# Parameters: lb01_ip iterations port
# This verifies traffic alternates between Web01 and Web02
```

## Expected Results

✅ Both Web01 and Web02 running Refoodify on port 3000  
✅ Lb01 routing traffic across both servers  
✅ Requests alternating between Web01 and Web02  
✅ Automatic failover if one server goes down  

## Verify It's Working

### Test round-robin distribution:
```bash
# Make 10 requests and watch them alternate
for i in {1..10}; do 
  curl -I http://192.168.1.100/ 2>/dev/null | head -1
  echo "Request $i"
done
```

### View live logs on Lb01:
```bash
ssh ubuntu@192.168.1.100 'tail -f /var/log/nginx/refoodify_access.log'
```

### Monitor backend servers:
```bash
# Web01
ssh ubuntu@192.168.1.101 'sudo journalctl -u refoodify -f'

# Web02
ssh ubuntu@192.168.1.102 'sudo journalctl -u refoodify -f'
```

### Load test with Apache Bench:
```bash
ab -n 1000 -c 50 http://192.168.1.100/
```

## Key Features Configured

### Round-Robin Load Balancing (Default)
Traffic distributes equally:
- Request 1 → Web01
- Request 2 → Web02  
- Request 3 → Web01
- Request 4 → Web02
- ...and so on

### Health Checks & Failover
- Servers checked every 30 seconds
- After 3 failed checks, server marked as down
- Traffic only goes to healthy servers
- Automatic recovery when server comes back

### Optimizations Included
- Connection pooling (keepalive)
- Response buffering for performance
- Proper header forwarding for client IPs
- Static file caching support
- Gzip compression ready

## Common Commands

### Manage Web Servers
```bash
# Check status
ssh ubuntu@192.168.1.101 'sudo systemctl status refoodify'

# Restart service
ssh ubuntu@192.168.1.101 'sudo systemctl restart refoodify'

# View logs
ssh ubuntu@192.168.1.101 'sudo journalctl -u refoodify -n 50'
```

### Manage Load Balancer
```bash
# Check nginx status
ssh ubuntu@192.168.1.100 'sudo systemctl status nginx'

# Reload config (no downtime)
ssh ubuntu@192.168.1.100 'sudo nginx -s reload'

# Test config syntax
ssh ubuntu@192.168.1.100 'sudo nginx -t'

# View access logs
ssh ubuntu@192.168.1.100 'tail -f /var/log/nginx/refoodify_access.log'

# View nginx status page
curl http://192.168.1.100/nginx_status
```

## Troubleshooting

### "Connection refused" error
- [ ] Check Web01/Web02 are running: `systemctl status refoodify`
- [ ] Verify port 3000 is open: `netstat -tlnp | grep 3000`
- [ ] Check security groups allow traffic

### All traffic goes to one server
- [ ] Check other server is running: `systemctl status refoodify`
- [ ] Check LB can reach both: `curl http://192.168.1.101:3000/health`
- [ ] Review nginx error logs: `tail -f /var/log/nginx/refoodify_error.log`

### Slow responses
- [ ] Check CPU/memory on all servers
- [ ] Monitor network connectivity
- [ ] Check application logs for errors

## Switching Load Balancing Methods

Edit `/etc/nginx/sites-available/refoodify-lb` on Lb01:

**Least Connections** (good for video streaming, long uploads):
```nginx
upstream refoodify_backend {
    least_conn;
    server 192.168.1.101:3000;
    server 192.168.1.102:3000;
}
```

**IP Hash** (keep same client on same server - sticky sessions):
```nginx
upstream refoodify_backend {
    ip_hash;
    server 192.168.1.101:3000;
    server 192.168.1.102:3000;
}
```

**Weighted** (unequal distribution):
```nginx
upstream refoodify_backend {
    server 192.168.1.101:3000 weight=3;  # 75%
    server 192.168.1.102:3000 weight=1;  # 25%
}
```

After editing, reload: `sudo nginx -s reload`

## Adding More Web Servers

To add Web03, Web04, etc.:

1. Deploy: `./deploy.sh 192.168.1.103 3000`

2. Update Lb01 nginx config:
   ```bash
   ssh ubuntu@192.168.1.100 'sudo nano /etc/nginx/sites-available/refoodify-lb'
   ```

3. Add to upstream section:
   ```nginx
   server 192.168.1.103:3000 max_fails=3 fail_timeout=30s;
   server 192.168.1.104:3000 max_fails=3 fail_timeout=30s;
   ```

4. Reload: `sudo nginx -s reload`

## Security Notes

Currently configured for:
- HTTP (port 80) - consider adding HTTPS
- Backend servers only need port 3000 from LB
- SSH access via private keys

Recommendations:
- Use HTTPS/SSL on load balancer
- Restrict security groups (backend only from LB)
- Enable monitoring and alerting
- Set up automated backups

## Next Steps

1. ✅ Deploy Web01 and Web02
2. ✅ Setup Lb01
3. ✅ Test load balancing
4. 📋 Monitor production traffic
5. 📋 Enable HTTPS on load balancer
6. 📋 Setup database (if needed)
7. 📋 Configure CI/CD for auto-deployment

## Reference

- Full guide: See `DEPLOYMENT.md`
- Nginx config: See `nginx.conf`
- Repository: https://github.com/ema-love/Refoodify

---

**Ready to deploy? Start with:**
```bash
./deploy.sh 192.168.1.101 3000
```
