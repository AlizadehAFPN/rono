#!/usr/bin/env bash
# Nightly Postgres backup for the Synapse stack on Argus.
# Dumps the synapse postgres container, gzips it, and prunes old files.
# Installed via cron (see infra/hetzner/README.md).
set -euo pipefail

BACKUP_DIR=/opt/synapse/backups
RETENTION_DAYS=14
CONTAINER=synapse-postgres-1
DB=adaptive_learn
DB_USER=app

mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d-%H%M%S)
FILE="$BACKUP_DIR/synapse-$TS.sql.gz"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB" | gzip > "$FILE"
echo "$(date -Is) backup OK: $FILE ($(du -h "$FILE" | cut -f1))"

# Prune backups older than the retention window
find "$BACKUP_DIR" -name 'synapse-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
