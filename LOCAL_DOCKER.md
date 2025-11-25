Local Docker Test Harness

This document explains how to run a local Docker simulation of Web01, Web02 and Lb01 (nginx) to validate round-robin behavior.

Prerequisites
- Docker Engine and Docker Compose installed on your local machine
- Ports 8080 available on localhost

Files created
- `Dockerfile`            - builds the Refoodify app container
- `docker-compose.yml`   - runs `web01`, `web02` and `lb` (nginx)
- `lb/nginx.conf`         - nginx config for load balancing
- `.dockerignore`         - files to exclude from build

Run the stack (from repository root)

```bash
# build and start containers
docker compose up -d --build

# check containers
docker compose ps
```

Access the load balancer
- LB listens on host port 8080
- Health endpoint: http://localhost:8080/health
- App UI: http://localhost:8080/index.html

Verify simple alternation

```bash
# Send 10 sequential requests and print the HTTP status
for i in {1..10}; do
  curl -s -o /dev/null -w "%{http_code} - " http://localhost:8080/health
  echo "Request $i"
done
```

If your app logs or HTML includes a backend identity, you can check which backend served each request by inspecting container logs:

```bash
# Tail web01 logs
docker logs -f refoodify_web01

# Tail web02 logs
docker logs -f refoodify_web02

# Tail LB logs
docker logs -f refoodify_lb
```

Stop and remove the stack

```bash
docker compose down --volumes --remove-orphans
```

Notes
- Compose file maps LB to host port 8080. Change in `docker-compose.yml` if needed.
- If Docker is not available in your environment, you can still use the same nginx config on a VM (Lb01) and deploy web services to VMs.
