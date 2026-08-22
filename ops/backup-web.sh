#!/usr/bin/env bash
# AROORAA static frontend backup — snapshots /var/www/arooraa before any redeploy.
# Retention: keeps the last 14 snapshots, deletes anything older.
set -euo pipefail

SOURCE_DIR=/var/www/arooraa
BACKUP_DIR=/opt/arooraa/backups/web
RETENTION_DAYS=14
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
OUT_DIR="${BACKUP_DIR}/${TIMESTAMP}"

mkdir -p "$OUT_DIR"
cp -r "$SOURCE_DIR"/. "$OUT_DIR"/

echo "Web backup written: $OUT_DIR ($(du -sh "$OUT_DIR" | cut -f1))"

find "$BACKUP_DIR" -maxdepth 1 -mindepth 1 -type d -mtime "+${RETENTION_DAYS}" -exec rm -rf {} \;
