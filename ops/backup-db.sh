#!/usr/bin/env bash
# AROORAA database backup — pg_dump via the running arooraa-leads-postgres container.
# Retention: keeps the last 14 daily backups, deletes anything older.
set -euo pipefail

BACKUP_DIR=/opt/arooraa/backups/database
RETENTION_DAYS=14
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
OUT_FILE="${BACKUP_DIR}/arooraa_leads_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

docker exec arooraa-leads-postgres pg_dump -U arooraa_leads_app -d arooraa_leads \
  | gzip > "$OUT_FILE"

if [ ! -s "$OUT_FILE" ]; then
  echo "ERROR: backup file is empty or was not created: $OUT_FILE" >&2
  exit 1
fi

chmod 600 "$OUT_FILE"
echo "Backup written: $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"

find "$BACKUP_DIR" -name 'arooraa_leads_*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete
