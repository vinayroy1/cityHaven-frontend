# 🌐 Awasio Complete Production Infrastructure & VPS Migration Guide

This document is the master operational, migration, and disaster recovery runbook for the **Awasio Production Infrastructure**. All configurations, scripts, and environment templates in this directory are self-contained and reproducible on any fresh Ubuntu/Debian VPS.

---

## 🏛️ System Architecture & Port Mapping

```
                              INTERNET / INDIAN USERS
                                         │
                                         ▼ (10ms - 15ms)
                   [Cloudflare Global Edge CDN (DEL / BOM)]
                   ├── Unlimited Bandwidth & DDoS Shield
                   ├── Free Universal SSL / TLS (Full Mode)
                   └── HTTP/3 + Brotli Edge Compression
                                         │
                                         ▼ (Encrypted HTTPS)
                        [Nginx Reverse Proxy / Edge Router]
                            (Ports 80 & 443 on VPS Host)
                       ├── 4 In-Memory RAM Microcache Zones
                       ├── Anti-Flood Rate Limiting (429 status)
                       └── Keepalive Upstream Connection Pools
                                   │             │
                 ┌─────────────────┘             └─────────────────┐
                 ▼                                                 ▼
       [awasio-frontend]                                   [awasio-backend]
       Docker (Next.js 16)                               Docker (Express/Node)
       127.0.0.1:3000                                     127.0.0.1:4000
       (awasio-frontend-net)                             (awasio_awasio-net)
                 │                                                 │
                 └─────────────────┐             ┌─────────────────┘
                                   ▼             ▼
                       ┌─────────────────────────────────────┐
                       │    Shared Database & Cache Tier     │
                       ├─────────────────────────────────────┤
                       │ • awasio-postgres (Port 5432)       │
                       │ • awasio-redis    (Port 6379)       │
                       │ • awasio-opensearch (Port 9200)     │
                       │ • awasio-jenkins  (127.0.0.1:8080)  │
                       └─────────────────────────────────────┘
```

### Port Allocation Matrix

| Service | Container Name | Internal Port | Host Binding | Network |
|---|---|---|---|---|
| **Nginx Edge** | *System Service* | 80, 443 | `0.0.0.0:80`, `0.0.0.0:443` | Host |
| **Next.js Frontend** | `awasio-frontend` | 3000 | `127.0.0.1:3000` | `awasio-frontend-net`, `awasio-net` |
| **Express Backend** | `awasio-backend` | 4000 | `127.0.0.1:4000` | `awasio-net`, `awasio-frontend-net` |
| **PostgreSQL 15** | `awasio-postgres` | 5432 | *Internal Only* | `awasio-net` |
| **Redis 7** | `awasio-redis` | 6379 | *Internal Only* | `awasio-net` |
| **OpenSearch 2.18** | `awasio-opensearch` | 9200 | *Internal Only* | `awasio-net` |
| **Jenkins CI/CD** | `awasio-jenkins` | 8080 | `127.0.0.1:8080` | `awasio-net` |

---

## 📁 Repository Configuration Files

```
awasio-frontend/deploy/
├── MIGRATION_GUIDE.md                     # 📖 This Master Runbook
├── docker/
│   ├── setup-docker-stack.sh              # 🚀 Phase 1: Docker & DB Stack Installer
│   ├── docker-compose.production.yml      # Core Infrastructure Compose (Postgres, Redis, OpenSearch, Jenkins)
│   ├── env.backend.production.template    # Backend Production Env Template
│   ├── env.frontend.production.template   # Frontend Production Env Template
│   ├── backup_db.sh                       # Automated Gzipped PostgreSQL Dump Script
│   ├── restore_db.sh                      # Database Restoration Helper Script
│   └── crontab.txt                        # Automated Daily 03:00 AM Backup & Sunday Prune
└── nginx/
    ├── setup-vps-edge.sh                  # 🚀 Phase 2: Nginx Edge & Microcache Installer
    ├── README.md                          # Nginx Modular Architecture Documentation
    ├── nginx.conf                         # Tuned Worker Connections & File Limits
    ├── conf.d/
    │   ├── 01-cache-zones.conf            # In-Memory RAM Zones & Bypass Rules
    │   └── 02-rate-limits.conf            # Anti-Flood Rate Limiting (429 status)
    ├── snippets/
    │   └── api-cache-common.conf          # Reusable Proxy Headers & Debug X-Cache-Status
    └── sites-available/
        └── awasio                         # 5-Tier Routing for awasio.com & SSL
```

---

## 🚀 Complete Step-by-Step Migration to a New VPS

Follow these sequential steps when upgrading or migrating to any fresh VPS (Ubuntu 22.04 or 24.04 LTS):

### Step 1: Push Deploy Package to New VPS

From your local machine:
```bash
# Define target server IP
NEW_VPS="root@<NEW_VPS_IP>"

# Copy deploy directory to target server
scp -r deploy ${NEW_VPS}:/root/awasio-deploy
```

---

### Step 2: Initialize Docker Infrastructure & Databases

SSH into the new VPS and run the automated installer:
```bash
ssh ${NEW_VPS}

# Run automated Docker stack setup
cd /root/awasio-deploy/docker
chmod +x setup-docker-stack.sh restore_db.sh backup_db.sh
./setup-docker-stack.sh
```

**What this automatically does:**
1. Installs latest Docker CE & Docker Compose engine.
2. Creates `/opt/awasio` and `/opt/awasio/backups`.
3. Creates bridge networks `awasio-net` and `awasio-frontend-net`.
4. Copies `.env.backend` and `.env.frontend` templates to `/opt/awasio/`.
5. Schedules automated daily backups at **03:00 AM** and weekly Docker cleanup at **04:00 AM Sundays**.
6. Starts **PostgreSQL**, **Redis**, **OpenSearch**, and **Jenkins** in detached mode.

---

### Step 3: Restore Database Backup from Old VPS

1. On the **old VPS**, trigger a fresh backup:
   ```bash
   /opt/awasio/backup_db.sh
   # Generates: /opt/awasio/backups/awasio_backup_<TIMESTAMP>.sql.gz
   ```
2. Copy the backup file directly to the new VPS:
   ```bash
   scp /opt/awasio/backups/awasio_backup_latest.sql.gz root@<NEW_VPS_IP>:/opt/awasio/
   ```
3. On the **new VPS**, restore the database:
   ```bash
   cd /opt/awasio
   ./restore_db.sh /opt/awasio/awasio_backup_latest.sql.gz
   ```
4. Verify restoration:
   ```bash
   docker exec -it awasio-postgres psql -U awasio_prod -d awasio_prod_db -c "\dt"
   ```

---

### Step 4: Deploy Nginx Edge & In-Memory Microcaching

Run the automated Nginx installer:
```bash
cd /root/awasio-deploy/nginx
chmod +x setup-vps-edge.sh
./setup-vps-edge.sh
```

**What this automatically does:**
1. Installs Nginx and tunes Linux kernel socket buffers (`somaxconn=16384`, `nofile=65535`).
2. Creates SSD/RAM microcache zones with `www-data` permissions.
3. Deploys the 5-tier modular routing configuration.
4. Validates syntax (`nginx -t`) and restarts Nginx.

---

### Step 5: Issue Origin SSL Certificate (Let's Encrypt)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d awasio.com -d www.awasio.com
```

---

### Step 6: Deploy Backend & Frontend Containers

You can deploy the application containers via Jenkins or directly via Docker:

#### A. Deploy Backend:
```bash
cd /opt/awasio/awasio-backend  # Or git clone https://github.com/vinayroy1/cityHaven-backend.git
docker build -f Dockerfile.production -t awasio-backend:latest .

docker stop awasio-backend || true
docker rm awasio-backend || true

docker run -d \
    --name awasio-backend \
    --restart always \
    -p 4000:4000 \
    --network awasio-net \
    --env-file /opt/awasio/.env.backend \
    awasio-backend:latest

docker network connect awasio-frontend-net awasio-backend 2>/dev/null || true
```

#### B. Deploy Frontend:
```bash
cd /opt/awasio/awasio-frontend  # Or git clone https://github.com/vinayroy1/cityHaven-frontend.git
docker build -t awasio-frontend:latest .

docker stop awasio-frontend || true
docker rm awasio-frontend || true

docker run -d \
    --name awasio-frontend \
    --restart always \
    --memory 1g \
    --cpus 1.5 \
    -p 127.0.0.1:3000:3000 \
    --network awasio-frontend-net \
    --env-file /opt/awasio/.env.frontend \
    awasio-frontend:latest

docker network connect awasio-net awasio-frontend 2>/dev/null || true
```

---

### Step 7: Cloudflare Zero-Downtime DNS Cutover (Takes 10 Seconds!)

Because your domain is managed by Cloudflare, switching to your new VPS has **zero downtime** and does not require touching GoDaddy:

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) $\rightarrow$ Select `awasio.com`.
2. Go to **DNS** $\rightarrow$ **Records**.
3. Edit the **`A` record**:
   - Change IP from old VPS to `<NEW_VPS_IP>`.
   - Ensure **Proxy status** remains **Proxied (Orange Cloud ☁️)**.
4. Click **Save**.
5. Go to **SSL/TLS**:
   - Ensure encryption mode is set to **`Full`** (or `Full (strict)`).
6. Go to **SSL/TLS $\rightarrow$ Edge Certificates**:
   - Ensure **"Always Use HTTPS"** is toggled **ON**.

**Result**: All global user traffic will switch to your new server in **5 seconds** without any downtime or DNS propagation delay!

---

## 🩺 Validation & Health Checklist

Run these commands to verify 100% operational status:

```bash
# 1. Verify all 7 containers are running and healthy
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Verify Cloudflare Edge & Response Headers
curl -s -I "https://awasio.com" | grep -E "(server|cf-ray|x-nextjs-cache)"
# Expected:
# server: cloudflare
# cf-ray: ...-DEL  (or BOM)
# x-nextjs-cache: HIT

# 3. Verify Nginx Microcaching is active (expect X-Cache-Status: HIT on 2nd call)
curl -s -I "https://awasio.com/api/v1/billing/platform-config" | grep "X-Cache"
curl -s -I "https://awasio.com/api/v1/cities" | grep "X-Cache"
curl -s -I "https://awasio.com/api/v1/search/suggestions?q=Noida" | grep "X-Cache"
# Expected: X-Cache-Status: HIT, X-Microcache-Engine: Awasio-Nginx-Edge

# 4. Verify Free OpenStreetMap Geocoding (Zero Google API calls)
curl -s "https://awasio.com/api/google/nearby-landmarks?address=Noida"
# Expected: {"success":true,"coordinates":{"lat":28.5706,"lng":77.3272},"transit":[],...}
```

---

## 🧹 Storage Maintenance & Weekly Cleanup

To ensure Docker build caches never exhaust VPS storage:

* **Weekly Automated Cron** (Installed automatically in crontab):
  ```bash
  0 4 * * 0 docker builder prune -af --filter until=168h && docker image prune -af --filter until=168h >/dev/null 2>&1
  ```
* **Manual Immediate Reclaim Command**:
  ```bash
  docker builder prune -a -f && docker system prune -f && docker image prune -a -f --filter "until=24h"
  ```
* **Verify Free Space**:
  ```bash
  df -h /
  docker system df
  ```

---

## 💾 Disaster Recovery SOP

* **Daily Automated Dumps**: Generated daily at `03:00 AM` in `/opt/awasio/backups/awasio_backup_<TIMESTAMP>.sql.gz`.
* **Retention Policy**: Keeps the last 14 days of backups automatically.
* **Manual Snapshot Command**:
  ```bash
  /opt/awasio/backup_db.sh
  ```
* **Off-Site Sync**: Download latest snapshot to your local machine:
  ```bash
  scp root@<VPS_IP>:/opt/awasio/backups/$(ssh root@<VPS_IP> "ls -t /opt/awasio/backups | head -n 1") ./latest_db_backup.sql.gz
  ```
