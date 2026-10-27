# Awasio Edge Nginx & High-Performance Microcaching Configuration

This directory contains the production-grade, modular Nginx edge configuration and automated setup script for Awasio.

---

## 📁 Configuration File Map

| Path | Purpose |
|---|---|
| [`setup-vps-edge.sh`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/deploy/nginx/setup-vps-edge.sh) | **Automated 1-command installer script** for any new VPS migration. Configures kernel socket limits, creates cache dirs, copies configs, tests syntax, and starts Nginx. |
| [`nginx.conf`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/deploy/nginx/nginx.conf) | Master Nginx configuration tuned for high concurrency (`8192 worker_connections`, `65535 worker_rlimit_nofile`). |
| [`conf.d/01-cache-zones.conf`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/deploy/nginx/conf.d/01-cache-zones.conf) | Declares shared in-memory RAM microcache storage zones (`metadata`, `search`, `pdp`, `static`) and authorization bypass maps. |
| [`conf.d/02-rate-limits.conf`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/deploy/nginx/conf.d/02-rate-limits.conf) | Declares rate limiting zones (150 req/s general, 60 req/s search) with HTTP 429 status and load-test whitelisting. |
| [`snippets/api-cache-common.conf`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/deploy/nginx/snippets/api-cache-common.conf) | Reusable proxy headers, stale fallback (`proxy_cache_use_stale`), upstream header stripping, and `X-Cache-Status` debug header. |
| [`sites-available/awasio`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/deploy/nginx/sites-available/awasio) | 5-Tier server routing configuration for `awasio.com` and SSL termination. |

---

## 🚀 Migrating to a Brand New VPS (1-Command Setup)

When moving to a fresh VPS (Ubuntu / Debian):

### Step 1: Copy this directory to the new server
```bash
scp -r deploy/nginx root@<NEW_VPS_IP>:/root/nginx-setup
```

### Step 2: Run the installer script on the new server
```bash
ssh root@<NEW_VPS_IP> "bash /root/nginx-setup/setup-vps-edge.sh"
```

The script will automatically:
1. Install Nginx if missing.
2. Tune Linux kernel socket limits (`somaxconn=16384`, `nofile=65535`).
3. Create all cache directories with `www-data` ownership.
4. Copy all configuration files to `/etc/nginx/`.
5. Test syntax and restart Nginx.

---

## 🔒 SSL Certificate Setup (Let's Encrypt)

On a new VPS, install Certbot once to generate your SSL certificates:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d awasio.com -d www.awasio.com
```
