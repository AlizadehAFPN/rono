# Rono on Hetzner + Coolify

Migration runbook to move Rono off AWS (ECS/RDS/ElastiCache/CloudFront) onto a
single Hetzner Cloud VPS managed by [Coolify](https://coolify.io) — a self-hosted
PaaS that gives git-push deploys, automatic HTTPS, and managed Postgres/Redis with
backups.

**Decision (2026-06-19):** Coolify PaaS, fully replacing AWS (no parallel run).

> Division of labour: the repo already contains everything Coolify needs
> (`backend/Dockerfile`, `frontend/Dockerfile` with a `runner` prod target). The
> steps below run **on the server / in the Coolify UI / in DNS / in AWS** — they
> can't be done from the codebase. Follow them in order.

---

## Target architecture

```
                 ┌──────────────────────── Hetzner CPX31 (Ubuntu 24.04) ───────────────────────┐
   Internet ──▶  │  Coolify (Traefik proxy, Let's Encrypt)                                       │
                 │     ├── frontend  (Next.js, :3000)   ◀── https://rono.getjanus.dev          │
                 │     ├── backend   (FastAPI, :8000)   ◀── https://api.rono.getjanus.dev      │
                 │     ├── postgres  (managed by Coolify, nightly backups)                        │
                 │     └── redis     (managed by Coolify)                                         │
                 └──────────────────────────────────────────────────────────────────────────────┘
```

One CPX31 (4 vCPU / 8 GB, ~€15/mo) comfortably runs the whole stack.

---

## 1. Provision the server

In the Hetzner Cloud Console (the **Janus** project):

1. Create a server: **CPX31**, image **Ubuntu 24.04**, in a EU location (e.g. Falkenstein/Helsinki).
2. Add your SSH key. Enable backups (cheap insurance) if you like.
3. Note the public IPv4.

> If the existing server in Janus is smaller than CPX31, resize it or create a new one.

## 2. Install Coolify

SSH in and run the official installer:

```bash
ssh root@<SERVER_IP>
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Then open `http://<SERVER_IP>:8000`, create the admin account, and finish onboarding.
(Coolify uses :8000 for its own UI — our backend is only exposed via a domain, no port clash.)

## 3. DNS

Point these A records at `<SERVER_IP>` (DNS for `getjanus.dev`):

| Record | Type | Value |
|---|---|---|
| `rono.getjanus.dev`     | A | `<SERVER_IP>` |
| `api.rono.getjanus.dev` | A | `<SERVER_IP>` |

Coolify provisions Let's Encrypt certificates automatically once DNS resolves.

## 4. Connect the repo

In Coolify: **Sources → GitHub** → install the Coolify GitHub App on the
`Rono-Qbank/Rono` repo. This gives push-to-deploy.

## 5. Create the databases (managed → backups included)

In your Coolify project:

1. **+ New Resource → Database → PostgreSQL 16.** Name it `rono-postgres`.
   - Set a strong password.
   - Enable **Scheduled Backups** (e.g. daily) → configure an S3-compatible
     target (Hetzner Object Storage or a Storage Box via restic). **This replaces RDS's automated backups — do not skip it.**
   - Note the internal connection host (Coolify gives an internal hostname usable by other resources in the same project).
2. **+ New Resource → Database → Redis 7.** Name it `rono-redis`.

## 6. Deploy the backend (FastAPI)

**+ New Resource → Application → from GitHub repo**, branch `staging` (or `main`):

- **Build pack:** Dockerfile
- **Base directory:** `/backend`
- **Dockerfile:** `Dockerfile`
- **Port:** `8000`
- **Health check path:** `/api/v1/ready`
- **Pre-deploy command** (runs migrations before traffic shifts):
  ```
  uv run alembic upgrade head
  ```
  This applies all migrations, including `a7b8c9d0e1f2` which seeds the global
  TUS topic taxonomy.
- **Domain:** `https://api.rono.getjanus.dev`
- **Environment variables:** see §8.

## 7. Deploy the frontend (Next.js)

**+ New Resource → Application → same repo**:

- **Build pack:** Dockerfile
- **Base directory:** `/frontend`
- **Dockerfile:** `Dockerfile`
- **Docker build target:** `runner`  (the production stage)
- **Port:** `3000`
- **Domain:** `https://rono.getjanus.dev`
- **Environment variables:** see §8.

## 8. Environment variables

**Backend** (`rono` backend app):

| Key | Value |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://app:<PW>@<coolify-postgres-host>:5432/adaptive_learn` |
| `REDIS_URL` | `redis://<coolify-redis-host>:6379/0` |
| `JWT_SECRET` | generate: `openssl rand -hex 32` |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `ENVIRONMENT` | `production` |
| `LOG_LEVEL` | `INFO` |
| `CORS_ORIGINS` | `https://rono.getjanus.dev` |
| `COOKIE_SECURE` | `true` |

**Frontend** (`rono` frontend app):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.rono.getjanus.dev` |
| `INTERNAL_API_URL` | `http://<coolify-backend-internal-host>:8000` |
| `NODE_ENV` | `production` |

> Use Coolify's **internal** hostnames for service-to-service traffic
> (`DATABASE_URL`, `REDIS_URL`, `INTERNAL_API_URL`) so it stays on the private
> Docker network; use the public domains only for browser-facing values
> (`NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`).

## 9. First deploy + smoke test

Trigger a deploy of both apps. Then:

```bash
curl https://api.rono.getjanus.dev/api/v1/health   # {"status":"ok"} — liveness
curl https://api.rono.getjanus.dev/api/v1/ready     # checks Postgres + Redis
open https://rono.getjanus.dev                       # login page
```

Optional demo data (dev only — skip for a clean prod):
```
# In the backend app's Coolify terminal:
PYTHONPATH=src uv run python scripts/seed.py
```
The TUS taxonomy is already seeded by the migration; no manual step needed.

## 10. Decommission AWS (after Hetzner is verified)

Order matters — kill the deploy automation first so nothing redeploys to a dying stack.

1. **Stop CI deploys to AWS.** Disable/delete `.github/workflows/deploy-staging.yml`
   and `deploy-prod.yml` (or gate them). Coolify now owns deploys.
2. **Take a final RDS dump** (belt-and-suspenders) before destroying:
   ```bash
   pg_dump "<rds-connection-url>" -Fc -f rono-rds-final.dump
   ```
   (Run from somewhere that can reach RDS, e.g. a temporary bastion / your old CI.)
3. **Terraform destroy**, per environment:
   ```bash
   cd infra/terraform/environments/staging && terraform destroy
   cd infra/terraform/environments/prod    && terraform destroy
   cd infra/terraform/environments/shared  && terraform destroy   # ECR, networking — last
   ```
4. Confirm in the AWS console that ECS services, RDS, ElastiCache, ALB,
   CloudFront, and NAT gateways are gone (NAT gateways and idle ALBs are the
   sneaky ongoing charges).
5. Cancel/duplicate-check Route53 hosted zones if DNS fully moved.

---

## Scheduled jobs (host cron)

Two jobs run on the box via the root crontab (`crontab -e`). Both live in this
repo under `infra/hetzner/` and are deployed alongside the stack.

```cron
# Nightly Postgres backup at 03:00
0 3 * * *  /opt/rono/infra/hetzner/backup.sh    >> /var/log/rono-backup.log 2>&1

# Weekly IRT item calibration, Mondays at 04:00. Turns accumulated responses into
# per-item difficulty/discrimination so adaptive selection (and Daily Review's
# new-card picks) stop being random. Safe to run more often; it's idempotent.
0 4 * * 1  /opt/rono/infra/hetzner/calibrate.sh >> /var/log/rono-calibrate.log 2>&1
```

Adjust the path prefix to wherever the repo is synced on the host. Run
`calibrate.sh` once by hand after first deploy to seed initial item parameters:

```bash
infra/hetzner/calibrate.sh
```

## Notes / trade-offs vs AWS

- **Postgres backups are now yours** (step 5). RDS did this invisibly; Coolify
  does it too, but only if you configure the backup target. Verify a restore once.
- **Single box = single point of failure.** Fine for staging / early prod. If you
  later need HA, Coolify supports multi-server, or add a managed Postgres
  elsewhere and point `DATABASE_URL` at it.
- **Cost:** ~€15/mo (one CPX31) vs the AWS ECS+RDS+CloudFront+NAT bill.
- The app code and Dockerfiles are unchanged — this is purely an infra swap.
```
