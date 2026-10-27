#!/usr/bin/env bash
# ==============================================================================
# Awasio Production Edge Nginx & Kernel Setup Script
# Works on any Debian/Ubuntu VPS migration with 1 command.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Awasio Edge Nginx Setup..."

# 1. Install Nginx if not already installed
if ! command -v nginx >/dev/null 2>&1; then
    echo "📦 Installing Nginx..."
    apt-get update -y
    apt-get install -y nginx
fi

# 2. Configure Linux Kernel & Socket Backlog Parameters
echo "⚙️  Tuning Linux kernel socket backlog & file descriptor limits..."
sysctl -w net.core.somaxconn=16384 >/dev/null
sysctl -w net.ipv4.tcp_max_syn_backlog=16384 >/dev/null

# Persist sysctl parameters across reboots
if ! grep -q "net.core.somaxconn=16384" /etc/sysctl.conf 2>/dev/null; then
    echo "net.core.somaxconn=16384" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_max_syn_backlog=16384" >> /etc/sysctl.conf
fi

# Set ulimit in limits.conf
if ! grep -q "nofile 65535" /etc/security/limits.conf 2>/dev/null; then
    cat << 'EOF' >> /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
root soft nofile 65535
root hard nofile 65535
www-data soft nofile 65535
www-data hard nofile 65535
EOF
fi

# 3. Create Microcache Directories with www-data permissions
echo "📁 Initializing in-memory SSD cache storage directories..."
mkdir -p /var/cache/nginx/awasio_metadata \
         /var/cache/nginx/awasio_search \
         /var/cache/nginx/awasio_pdp \
         /var/cache/nginx/awasio_static
chown -R www-data:www-data /var/cache/nginx
chmod 700 /var/cache/nginx/*

# 4. Copy Modular Configuration Files
echo "📝 Deploying modular Nginx configurations..."
mkdir -p /etc/nginx/conf.d /etc/nginx/snippets /etc/nginx/sites-available /etc/nginx/sites-enabled

cp -f "${SCRIPT_DIR}/nginx.conf" /etc/nginx/nginx.conf
cp -f "${SCRIPT_DIR}/conf.d/"*.conf /etc/nginx/conf.d/
cp -f "${SCRIPT_DIR}/snippets/"*.conf /etc/nginx/snippets/
cp -f "${SCRIPT_DIR}/sites-available/awasio" /etc/nginx/sites-available/awasio

# 5. Enable Site
ln -sf /etc/nginx/sites-available/awasio /etc/nginx/sites-enabled/awasio

# 6. Validate & Restart
echo "🔍 Testing Nginx syntax..."
nginx -t

echo "🔄 Restarting Nginx service..."
systemctl restart nginx

echo "✅ Awasio Edge Nginx & Microcaching successfully deployed and active!"
