#!/usr/bin/env bash
# ==============================================================================
# Awasio PostgreSQL Restore Helper Script
# Usage: ./restore_db.sh <backup_file.sql.gz | backup_file.sql>
# ==============================================================================
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "❌ Usage: $0 <backup_file.sql.gz | backup_file.sql>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file '$BACKUP_FILE' not found!"
    exit 1
fi

echo "🔄 Restoring database from '$BACKUP_FILE' into container 'awasio-postgres'..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker exec -i awasio-postgres psql -U awasio_prod -d awasio_prod_db
else
    docker exec -i awasio-postgres psql -U awasio_prod -d awasio_prod_db < "$BACKUP_FILE"
fi

echo "✅ Database restore completed successfully!"
