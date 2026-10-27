#!/usr/bin/env bash
# ==============================================================================
# Awasio Production Docker Stack Setup Script
# Initializes /opt/awasio, networks, volumes, databases & backup cron on a new VPS.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="/opt/awasio"

echo "🚀 Setting up Awasio Production Docker Infrastructure..."

# 1. Install Docker & Docker Compose if missing
if ! command -v docker >/dev/null 2>&1; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 2. Create Target Directories
echo "📁 Initializing ${TARGET_DIR} directories..."
mkdir -p "${TARGET_DIR}/backups"

# 3. Create Docker Networks
echo "🌐 Configuring Docker networks..."
docker network inspect awasio-net >/dev/null 2>&1 || docker network create awasio-net
docker network inspect awasio-frontend-net >/dev/null 2>&1 || docker network create awasio-frontend-net

# 4. Copy Compose & Backup Scripts
echo "📝 Deploying docker-compose and backup tools..."
cp -f "${SCRIPT_DIR}/docker-compose.production.yml" "${TARGET_DIR}/docker-compose.yml"
cp -f "${SCRIPT_DIR}/backup_db.sh" "${TARGET_DIR}/backup_db.sh"
cp -f "${SCRIPT_DIR}/restore_db.sh" "${TARGET_DIR}/restore_db.sh"
chmod +x "${TARGET_DIR}/backup_db.sh" "${TARGET_DIR}/restore_db.sh"

# 5. Copy Environment Files (if template needs initialization)
if [ ! -f "${TARGET_DIR}/.env.backend" ]; then
    echo "⚠️  Copying .env.backend template. Please review and update sensitive keys in ${TARGET_DIR}/.env.backend"
    cp "${SCRIPT_DIR}/env.backend.production.template" "${TARGET_DIR}/.env.backend"
    chmod 600 "${TARGET_DIR}/.env.backend"
fi

if [ ! -f "${TARGET_DIR}/.env.frontend" ]; then
    echo "⚠️  Copying .env.frontend template. Please review and update sensitive keys in ${TARGET_DIR}/.env.frontend"
    cp "${SCRIPT_DIR}/env.frontend.production.template" "${TARGET_DIR}/.env.frontend"
    chmod 600 "${TARGET_DIR}/.env.frontend"
fi

# 6. Configure Daily Backup Crontab
echo "⏰ Setting up automated daily database backup crontab (03:00 AM)..."
(crontab -l 2>/dev/null | grep -v "/opt/awasio/backup_db.sh" || true; echo "0 3 * * * /opt/awasio/backup_db.sh >/dev/null 2>&1") | crontab -

# 7. Start Core Infrastructure Services (PostgreSQL, Redis, OpenSearch, Jenkins)
echo "🐳 Starting core database and infrastructure containers..."
cd "${TARGET_DIR}"
docker compose up -d postgres redis opensearch jenkins

echo "✅ Awasio Docker Infrastructure successfully initialized!"
echo "   PostgreSQL: awasio-postgres (port 5432)"
echo "   Redis:      awasio-redis (port 6379)"
echo "   OpenSearch: awasio-opensearch (port 9200)"
echo "   Jenkins:    awasio-jenkins (port 8080)"
