#!/usr/bin/env bash
set -euo pipefail

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-finance}
DB_USER=${DB_USER:-finance}
BACKUP_DIR=${BACKUP_DIR:-./backups}

mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/${DB_NAME}_${TS}.sql.gz"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$FILE"
echo "Backup written to $FILE"

