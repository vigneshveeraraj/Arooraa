# AROORAA production deployment and rollback

Covers the dedicated AROORAA VPS only (backend, database, static frontend). This VPS has
no dependency on any other infrastructure and no other infrastructure depends on it.

## Architecture

```
Internet
  |
 Nginx (arooraa.com vhost)
  |
  +-- /                    -> /var/www/arooraa (static Next.js export)
  +-- /api/leads/*         -> 127.0.0.1:8090/api/v1/*        (public, unauthenticated)
  +-- /api/admin/*         -> 127.0.0.1:8090/api/v1/admin/*  (session + CSRF protected)
                                       |
                              arooraa-lead-service (Docker, 127.0.0.1:8090 only)
                                       |
                              arooraa-leads-postgres (Docker, internal network only,
                                                       no host port published)
```

Both containers run via `docker-compose.prod.yml` (repo root: `backend/`), started with
`--env-file /opt/arooraa/config/production.env`. That env file is `chmod 600`, never in
git, and holds `AROORAA_DB_PASSWORD`, `AROORAA_IP_HASH_SECRET`, and (once set) the admin
bootstrap credentials.

## Redeploying a new backend/frontend version

```bash
cd /opt/arooraa/app
git pull --ff-only origin main

# Backend — rebuild and recreate only if backend/ changed:
cd backend
docker compose -f docker-compose.prod.yml --env-file /opt/arooraa/config/production.env \
  up -d --build arooraa-lead-service
# Watch health before doing anything else:
docker inspect --format='{{.State.Health.Status}}' arooraa-lead-service

# Frontend — build locally (no Node on the VPS by design — see below), then:
/opt/arooraa/scripts/backup-web.sh          # snapshot the current live site first
scp -r frontend/out/* root@<vps>:/var/www/arooraa/
ssh root@<vps> chown -R www-data:www-data /var/www/arooraa
```

Node.js is deliberately not installed on the VPS — the frontend is built locally (or in
CI) and only the static `out/` output is shipped, keeping the production host's package
surface smaller. If that changes later (e.g. CI builds it), document the change here.

## Rollback

**Frontend:** every `backup-web.sh` run leaves a full timestamped snapshot in
`/opt/arooraa/backups/web/<timestamp>/`. To roll back:
```bash
rm -rf /var/www/arooraa/*
cp -r /opt/arooraa/backups/web/<timestamp>/* /var/www/arooraa/
chown -R www-data:www-data /var/www/arooraa
```

**Backend:** redeploy the previous commit:
```bash
cd /opt/arooraa/app && git checkout <previous-sha>
cd backend
docker compose -f docker-compose.prod.yml --env-file /opt/arooraa/config/production.env \
  up -d --build arooraa-lead-service
```

**Database:** Flyway migrations (`V1`–`V4`, ...) are forward-only — never hand-write a
down-migration or manually drop/alter columns to "undo" one. For a schema-affecting
incident, restore from the most recent `pg_dump` backup instead:
```bash
# Stop the backend so nothing writes during restore:
docker compose -f docker-compose.prod.yml --env-file /opt/arooraa/config/production.env \
  stop arooraa-lead-service

gunzip -c /opt/arooraa/backups/database/arooraa_leads_<timestamp>.sql.gz \
  | docker exec -i arooraa-leads-postgres psql -U arooraa_leads_app -d arooraa_leads

docker compose -f docker-compose.prod.yml --env-file /opt/arooraa/config/production.env \
  up -d arooraa-lead-service
```
This restores into the *existing* database/role — it does not recreate the container or
volume, so `AROORAA_DB_PASSWORD` and the dedicated volume stay untouched throughout.

## Backups

- `ops/backup-db.sh` — nightly (02:30 UTC, via `ops/systemd/arooraa-db-backup.{service,timer}`)
  `pg_dump` to `/opt/arooraa/backups/database/`, gzipped, `chmod 600`, 14-day retention.
- `ops/backup-web.sh` — manual, run before any frontend redeploy; snapshots
  `/var/www/arooraa` to `/opt/arooraa/backups/web/<timestamp>/`, 14-day retention.
- Both were run manually once during initial deployment and confirmed to produce real,
  non-empty output before the timer was enabled.
- Hostinger's own account-level weekly VPS backup (or equivalent snapshot feature, if
  enabled on this VPS) is a second, independent layer — confirm it's active in the
  Hostinger control panel; this repo's backup scripts should not be treated as the only
  copy of production data regardless.

## Known limitation carried over from the local dev/CI env

Node isn't installed on the VPS, so `npm audit`/CI-equivalent checks don't run there —
the frontend is only ever built and tested elsewhere (Milestone 2D's own quality gate)
before its static output is shipped.
