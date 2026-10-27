#!/bin/bash
BACKUP_DIR="/opt/awasio/backups"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec awasio-postgres pg_dump -U awasio_prod -d awasio_prod_db | gzip > "$BACKUP_DIR/awasio_backup_$DATE.sql.gz"
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
