#!/usr/bin/env bash
# AROORAA database backups — pg_dump via the running Postgres containers.
# Retention: keeps the last 14 daily backups of each database, deletes anything older.
#
# Two databases, deliberately dumped separately rather than into one archive: they belong to
# different services, hold different data, and are restored independently (see
# docs/production-deployment-and-rollback.md). Marion and Mindra also live on this host and are
# no business of this script — nothing below names them.
set -euo pipefail

BACKUP_DIR=/opt/arooraa/backups/database
RETENTION_DAYS=14
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# dump <container> <db-user> <db-name> <file-prefix>
dump() {
  local container="$1" user="$2" db="$3" prefix="$4"
  local out="${BACKUP_DIR}/${prefix}_${TIMESTAMP}.sql.gz"

  docker exec "$container" pg_dump -U "$user" -d "$db" | gzip > "$out"

  if [ ! -s "$out" ]; then
    echo "ERROR: backup file is empty or was not created: $out" >&2
    return 1
  fi

  chmod 600 "$out"
  echo "Backup written: $out ($(du -h "$out" | cut -f1))"
  find "$BACKUP_DIR" -name "${prefix}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete
}

# The lead database is the one this job has always protected, so it goes first and its failure
# is fatal exactly as before.
dump arooraa-leads-postgres arooraa_leads_app arooraa_leads arooraa_leads

# Aura's conversation store. Run after the lead dump and tracked separately, so that a problem
# here can never cost us the lead backup that has already been written to disk — the failure is
# still reported, and the job still exits non-zero, but only at the very end.
aura_status=0
if docker ps --format '{{.Names}}' | grep -qx 'aura-postgres'; then
  dump aura-postgres arooraa_aura_app arooraa_aura arooraa_aura || aura_status=1
else
  # Not an error: Aura is a separate service and this host is expected to work without it.
  echo "aura-postgres is not running — skipping the Aura backup."
fi

exit "$aura_status"
