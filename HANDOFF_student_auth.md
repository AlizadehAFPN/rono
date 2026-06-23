# Handoff: Student self-registration + per-user IRT/FSRS learning

Paste the block below into a fresh session.

---

## TASK
Build **student self-registration + login**, and make sure **each registered user
gets their own per-user learning system over the question bank** — IRT proposes
the next question adaptively, FSRS-5 schedules reviews. Make it **fully done**:
backend + frontend, deployed to the live server, and verified end-to-end.

For now: **no username/password rules and no email confirmation** (we add those
later). A self-signup just needs email + password + name → creates an active
**student** account in the existing institution and logs them in.

## WHAT ALREADY EXISTS (don't rebuild)
- Backend: FastAPI + SQLAlchemy 2.0 async in `backend/`. Endpoints under
  `/api/v1`: `auth` (register/login/refresh/logout/me), `topics`, `items`,
  `practice` (`/sessions` start/next/answer/finish — adaptive + review modes),
  `progress` (`/me/progress`), `users`, `institution`, `analytics`.
- Per-user learning is already wired: `user_thetas` (IRT θ, global + per-topic),
  `card_states` + `review_logs` (FSRS-5), `user_topic_mastery`. Practice answer
  cascade updates θ + FSRS + mastery. Review mode = `session_type="review"`
  (due FSRS cards). IRT 2PL engine + FSRS-5 engine in `backend/src/app/services/`.
  Calibration job `scripts/calibrate_items.py` (weekly cron).
- Frontend: Next.js 16 in `frontend/`. Pages under
  `app/(dashboard)/dashboard/`: practice, progress, analytics, users, settings,
  items, topics. Login/register pages exist under auth.
- 120 TUS Basic Sciences questions loaded (exam_type=tus, exam_part=basic_sciences).

## THE GAP TO CLOSE
`POST /api/v1/auth/register` currently creates a **new institution + admin**
(see `auth_service.register`). Student self-signup must instead create a
**student membership in the EXISTING institution** (the single one: "Synapse Demo
University"). So:
1. Backend: add an open **student signup** path (e.g. `POST /api/v1/auth/signup`)
   → create User (hashed pw) + Membership(role=student, status=active) in the
   existing institution, set the same httpOnly auth cookies as login, return
   `MeResponse`. No validation beyond "email looks like an email, password
   non-empty" (keep minimal; we harden later). Decide institution: the lone
   existing institution (look it up; if multi later, revisit).
2. Frontend: a **signup page** (reuse the login page's style + i18n en/tr) that
   posts to signup, then routes to `/dashboard/practice`.
3. Verify a brand-new self-registered user can: log in → start an adaptive
   practice session → answer → see θ move → finish with score/net → review mode →
   `/dashboard/progress` shows their own θ/mastery/sessions. Confirm θ + FSRS
   card state are isolated per user.

## ENVIRONMENT & ACCESS
- Repo (local, source of truth): `/Users/wallex/Desktop/Synapse`, branch
  `staging`. The Bash tool runs on this Mac.
- Live server (Hetzner "Argus"): `ssh -o BatchMode=yes root@178.105.254.90`
  (the Mac's SSH key is authorized). App: **https://synapse.getjanus.dev**.
  Admin login: `admin@synapse-demo.edu` / `Admin1234!`.
- Stack on server: Docker Compose project **synapse** at
  `/opt/synapse/infra/hetzner/docker-compose.prod.yml` (postgres + redis +
  backend + frontend), behind the host **nginx** (already routes the domain with
  Let's Encrypt). Frontend published on `127.0.0.1:3100`; backend internal.

## DEPLOY / VERIFY WORKFLOW (this is how everything ships)
1. Edit locally. Typecheck frontend: `cd frontend && npx tsc --noEmit`.
   Backend imports: `cd backend && PYTHONPATH=src .venv/bin/python -c "import app.main"`.
   Run backend tests: `cd backend && .venv/bin/python -m pytest -q`.
2. Sync to server:
   `rsync -az -e "ssh -o BatchMode=yes" --exclude .venv --exclude __pycache__ --exclude '*.pyc' backend/src/ root@178.105.254.90:/opt/synapse/backend/src/`
   `rsync -az -e "ssh -o BatchMode=yes" --exclude node_modules --exclude .next frontend/ root@178.105.254.90:/opt/synapse/frontend/`
3. Rebuild only what changed (long; run in background):
   `ssh root@178.105.254.90 'cd /opt/synapse/infra/hetzner && docker compose -f docker-compose.prod.yml -p synapse --env-file .env up -d --build backend frontend'`
4. Migrations run automatically on backend start (its command is
   `alembic upgrade head && uvicorn ...`). For new tables/columns add an Alembic
   migration in `backend/alembic/versions/` (current head: check
   `alembic history`). Models live in `backend/src/app/models/`.
5. Verify against https://synapse.getjanus.dev with curl (login sets httpOnly
   cookies; the `/api/v1/sessions/` POST 308-redirects on trailing slash — use
   `curl -L`). The browser/fetch follows it fine.

## HARD RULES / GOTCHAS
- **Do NOT `git push` to `staging` or `main`** — those trigger a dead AWS deploy.
  Back up code by pushing to the **`hetzner`** branch:
  `git push origin staging:hetzner`. Commit locally as you go.
- **Next.js rewrites bake `INTERNAL_API_URL` at BUILD time** — it's a Docker
  build arg in the frontend Dockerfile/compose (`http://backend:8000`). Don't
  break that.
- **i18n parity**: every new string goes in BOTH `en` and `tr` in
  `frontend/lib/i18n/dictionaries/*.ts`, and new dictionaries must be registered
  in `dictionaries/index.ts`. Types enforce parity.
- **Numeric columns**: SQLAlchemy async UoW doesn't reliably flush `Numeric`
  attribute mutations — use explicit `sql_update(...).values(...)` (see
  item_service / practice_service).
- **Circular FK** items↔item_versions: flush order item→version→options→set
  current_version_id→commit.
- Auth: bcrypt via `app.core.security.hash_password`; roles in
  `app.core.roles` (`role_gte`, `Role`); `require_role(...)` dep; current user
  via `get_current_user`. JWT in httpOnly cookies.
- Frontend conventions: API modules `lib/api/*.ts` over `lib/api/client.ts`;
  react-query hooks `lib/hooks/use-*.ts`; pages are client components using
  `useI18n()`. Auth store: `lib/stores/auth.ts` (has `role`).

## DEFINITION OF DONE
- New user can self-register on the live site, lands logged-in, and immediately
  uses the adaptive practice + review + progress flow with their own isolated
  θ/FSRS state. Backend tests pass; frontend typechecks; committed locally and
  pushed to `hetzner`. Confirm with a real end-to-end run on
  https://synapse.getjanus.dev using a freshly created account.
