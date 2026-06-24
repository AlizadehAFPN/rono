# Rono — Build Phases

Adaptive learning platform for medical exam preparation (USMLE Step 1/2/3, TUS).  
Architecture: FastAPI + SQLAlchemy 2.0 async · PostgreSQL 16 · Redis 7 · Next.js 16 · Docker Compose.

---

## Status Legend

- ✅ Complete & tested
- 🔧 Complete with known caveats
- 📋 Planned — not started

---

## Phase 0 — Project Scaffold ✅

**Goal:** Working local dev environment, project skeleton, CI-ready structure.

- Docker Compose with 4 services: `postgres:16`, `redis:7`, `backend` (FastAPI), `frontend` (Next.js)
- FastAPI project at `backend/src/app/` with structured layout (`api/`, `models/`, `schemas/`, `services/`, `core/`)
- Alembic migrations wired (`make migrate` / `make migration`)
- `Makefile` with shortcut commands: `up`, `down`, `migrate`, `migration`, `seed`, `shell-db`, `shell-backend`
- `.env` for secrets (DATABASE_URL, REDIS_URL, JWT keys, CORS origins)
- Volume mounts for hot-reload: `./backend/src` → `/home/app/src` (Python changes live immediately)
- Frontend: Next.js 16 with TypeScript 5, Tailwind CSS v4, `proxy.ts` route protection

---

## Phase 1 — Database Schema ✅

**Goal:** Complete relational schema covering all planned features upfront.

**33 tables across 5 domains:**

### Auth domain (4 tables)
| Table | Purpose |
|-------|---------|
| `users` | Accounts — email, hashed password, profile, MFA fields |
| `memberships` | User ↔ Institution join with role (`student`, `instructor`, `institution_admin`, `superadmin`) |
| `auth_sessions` | Server-side JWT session tracking, revocation support |
| `password_reset_tokens` | Time-limited email reset tokens |

### Content domain (8 tables)
| Table | Purpose |
|-------|---------|
| `topics` | 4-level taxonomy (Exam → Subject → Domain → Sub-domain) via materialized path |
| `items` | Question metadata — `exam_type`, `item_type`, IRT parameters (a, b, c), status, soft delete |
| `item_versions` | Full version history of question text + options per item |
| `options` | Answer choices per version — `content`, `is_correct`, `explanation` |
| `item_topic_links` | Item ↔ Topic many-to-many with `is_primary` flag (one topic per question enforced at service layer) |
| `item_tags` | Free-form tags on items |
| `item_flags` | User-reported content issues |
| `item_analytics` | Aggregated per-item statistics (attempts, correct rate, etc.) |

### Learning domain (6 tables)
| Table | Purpose |
|-------|---------|
| `practice_sessions` | A student's exam session (adaptive or fixed) |
| `responses` | Per-question answer record within a session — selected option, time, IRT scoring |
| `user_thetas` | Per-user per-topic ability estimate (θ) — NULL `topic_id` = global theta |
| `theta_history` | Append-only log of theta updates after each response |
| `user_topic_mastery` | Summarised mastery metrics per topic per user |
| `card_states` | FSRS-5 spaced repetition state per item per user (due date, stability, difficulty) |

### Curriculum domain (5 tables)
| Table | Purpose |
|-------|---------|
| `curricula` | Named course/curriculum per institution |
| `curriculum_enrollments` | Student enrollment in a curriculum |
| `assignments` | Question sets assigned to enrolled students |
| `cohort_snapshots` | Point-in-time class performance snapshots for analytics |
| `report_definitions` | Saved report configurations |

### Infrastructure domain (10 tables)
| Table | Purpose |
|-------|---------|
| `institutions` | Multi-tenant root — every record scoped by `institution_id` |
| `feature_flags` | Per-institution feature toggle |
| `background_jobs` | Async job queue tracking |
| `media_assets` | Uploaded images/files with S3-style references |
| `notifications` | In-app notification records |
| `notification_templates` | Reusable notification message templates |
| `audit_logs` | Immutable admin action log |
| `permissions` | Fine-grained permission overrides beyond role |
| `irt_calibration_runs` | IRT batch calibration job records |
| `review_logs` | Content review workflow history |

**Key design decisions:**
- All timestamps timezone-aware (`TIMESTAMP WITH TIME ZONE`)
- Topics use **materialized path** (`/uuid/uuid/...`) for efficient subtree queries
- `items.current_version_id` ↔ `item_versions.item_id` circular FK uses `use_alter=True` — flush order: item → version → options → link back
- `user_thetas` allows multiple NULL `topic_id` rows (NULL ≠ NULL in PostgreSQL unique) — global theta uniqueness enforced in service layer

---

## Phase 2 — Backend API ✅

**Goal:** Full REST API for auth, topics, and items. Smoke-tested and production-ready.

### 2A — Authentication
- `POST /api/v1/auth/register` — create account + institution membership
- `POST /api/v1/auth/login` — return httpOnly cookies (`access_token` 60 min, `refresh_token` 7 days)
- `POST /api/v1/auth/logout` — revoke session in DB, clear cookies
- `POST /api/v1/auth/refresh` — rotate tokens, extend session
- `GET /api/v1/auth/me` — current user + memberships

Cookie strategy: `httpOnly`, `samesite=lax`, `secure=False` in dev. Refresh token path scoped to `/api/v1/auth` to limit exposure. Session validated in DB on every request.

### 2B — Topics API
- `GET /api/v1/topics/` — flat paginated list (filterable by parent_id)
- `GET /api/v1/topics/tree` — full nested tree for the institution + global topics
- `POST /api/v1/topics/` — create topic (instructor+)
- `GET /api/v1/topics/{id}` — single topic
- `PATCH /api/v1/topics/{id}` — update name/slug/description/order/active (instructor+)
- `DELETE /api/v1/topics/{id}` — soft delete / deactivate (institution_admin+)

Topic scoping: queries include `institution_id = X OR institution_id IS NULL` (global topics visible to all).

### 2C — Items API
- `GET /api/v1/items/` — list with filters: `status`, `topic_id`, `exam_type`, `item_type`, pagination
- `POST /api/v1/items/` — atomic create: item + first version + options + topic links
- `GET /api/v1/items/{id}` — item with topics
- `PATCH /api/v1/items/{id}` — update metadata (status, exam_type, topic links)
- `DELETE /api/v1/items/{id}` — soft delete
- `GET /api/v1/items/{id}/versions` — version history
- `POST /api/v1/items/{id}/versions` — create new version (immutable snapshot)

### 2D — Infrastructure probes
- `GET /api/v1/health` — liveness (process alive)
- `GET /api/v1/ready` — readiness (checks Postgres + Redis)

**Post-Phase-2 fixes applied:**
- `redirect_slashes=False` on FastAPI app + explicit no-slash route aliases on collection endpoints (Next.js proxy strips trailing slashes)
- `passlib` replaced with direct `bcrypt` library (passlib incompatible with bcrypt 4.x)
- `User.memberships` FK ambiguity fixed (`foreign_keys=[Membership.user_id]`)
- TopicTree lazy-load MissingGreenlet error fixed (`model_validate` before building tree)
- Global topic visibility in all topic service queries

**Seed data:** `make seed`
| Email | Password | Role |
|-------|----------|------|
| admin@rono-demo.edu | Admin1234! | institution_admin |
| instructor@rono-demo.edu | Teach1234! | instructor |
| student@rono-demo.edu | Study1234! | student |

---

## Phase 3 — Admin Frontend ✅

**Goal:** Fully functional admin panel for managing topics and questions.

**Stack:** Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind CSS v4 · radix-ui v1 (unified package) · TanStack Query v5 · Zustand v5 · react-hook-form v7 · Zod v4

### Auth flow
- `/login`, `/register` — form with Zod validation, JWT cookie auth
- `proxy.ts` (Next.js 16 renamed from `middleware.ts`) — redirects unauthenticated users away from `/dashboard/*`
- Zustand auth store — in-memory user + memberships state
- Auto-refresh on 401 in API client — transparent token rotation
- `AuthGate` in dashboard layout — waits for `isInitialized` before rendering

### API proxy
All browser requests use relative URLs (`/api/v1/...`). `next.config.ts` rewrites → `INTERNAL_API_URL` (Docker: `http://backend:8000`, local: `http://localhost:8000`). No CORS required.

### Pages implemented
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with institution stats cards |
| `/dashboard/topics` | Full 4-level topic taxonomy manager |
| `/dashboard/items` | Question list with filters (exam_type, status, pagination) |
| `/dashboard/items/new` | Create question form with answer choices |
| `/dashboard/items/[id]` | Question detail, inline editing, version history |
| `/dashboard/users` | Stub — coming Phase 4 |
| `/dashboard/settings` | Stub — coming Phase 4 |

### Topics page (current state)
- 4-level hierarchy: **Exam → Subject → Domain → Sub-domain**
- Right-side Sheet panel for add/edit (slides in from right)
- Level selector (4 cards: Exam / Subject / Domain / Sub-domain)
- Cascading parent selectors: Subject requires Exam → Domain requires Exam + Subject → Sub-domain requires all three
- Tree view with connecting lines and colored level dots (orange / blue / violet / emerald)
- Search highlights matching nodes
- Stats bar: Total · Exams · Subjects · Domains · Sub-domains
- Inline edit preserves full parent context as read-only

### UI component library
Built on shadcn conventions with radix-ui. Components in `frontend/components/ui/`:
`button`, `badge`, `card`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `scroll-area`, `select`, `separator`, `skeleton`, `sheet`, `table`, `textarea`, `toast`, `toaster`, `alert`, `avatar`

---

## Phase 4 — IRT Adaptive Engine 📋

**Goal:** Serve adaptive question sessions — right question at the right time based on student ability.

### 3A — Practice Session API
- `POST /api/v1/sessions/` — start a session (adaptive or fixed, scoped to exam/topic)
- `GET /api/v1/sessions/{id}` — session state
- `POST /api/v1/sessions/{id}/answer` — submit answer → triggers IRT scoring + next question selection
- `GET /api/v1/sessions/{id}/next` — get next question (IRT-selected)
- `POST /api/v1/sessions/{id}/finish` — close session, compute final stats

### 3B — IRT 2PL Item Selection
- Model: `P(correct | θ) = 1 / (1 + exp(-a(θ - b)))` where `a` = discrimination, `b` = difficulty
- Item selection: choose item maximizing Fisher Information at current theta: `I(θ) = a² · P · (1-P)`
- Filter candidate items by: exam_type, topic, unused in current session, not flagged
- Initial `b` for new items: 0.0 (average difficulty). Initial `a`: 1.0.

### 3C — Theta Update (EAP or MLE)
- After each response, update `user_thetas.theta` using Expected A Posteriori (EAP) estimation
- Append to `theta_history` for trend analysis
- Update `user_topic_mastery` summary

### 3D — FSRS-5 Spaced Repetition
- For each answered item, update `card_states` (stability, difficulty, due date)
- FSRS-5 algorithm: `S_r = S · exp(ln(0.9) / R)` — stability after review
- New due date = today + `S_r` days
- Separate "review mode" endpoint that serves due cards

### Dependencies before Phase 3
- Topics taxonomy must be populated (at least one Exam with Subjects and Domains)
- Items must be created and linked to topics
- At least one student account must exist

---

## Phase 5 — Content Population & User Management 📋

**Goal:** Seed the real USMLE/TUS taxonomy and build admin user management UI.

### 4A — Global Taxonomy Seeding
- Script to bulk-insert USMLE Step 1 topics (13 subjects, ~40 domains, ~200 sub-domains) as `institution_id=NULL`
- Same for USMLE Step 2, Step 3, and TUS
- These become the shared "global" taxonomy visible to all institutions
- Script location: `backend/scripts/seed_global_taxonomy.py`

**USMLE Step 1 — 13 Subjects:**  
Anatomy, Behavioural Science, Biochemistry, Biostatistics, Embryology, Genetics, Histology, Immunology, Microbiology, Pathology, Pathophysiology, Pharmacology, Physiology

### 4B — Bulk Question Import
- CSV/JSON import endpoint for bulk item creation
- Import format: stem, options (A–E), correct answer, explanation, topic slug, exam_type
- Validation: reject duplicates (by stem hash), unknown topic slugs, missing required fields
- Background job tracking via `background_jobs` table

### 4C — User Management UI (`/dashboard/users`)
- List institution members with role and join date
- Invite by email (sends registration link)
- Change role (institution_admin can promote/demote instructors)
- Deactivate/reactivate account
- Backend: `POST /api/v1/users/invite`, `PATCH /api/v1/users/{id}/role`, `DELETE /api/v1/users/{id}`

### 4D — Institution Settings UI (`/dashboard/settings`)
- Institution name, logo, timezone, locale
- Feature flag management
- CORS / allowed origins management

---

## Phase 6 — Student-Facing Practice UI 📋

**Goal:** The actual learning experience — students practice questions and track progress.

### 5A — Practice Mode
- Topic browser: explore the 4-level taxonomy, see mastery % per topic
- Start session: choose exam type, topic(s), number of questions, mode (adaptive / fixed)
- Question view: stem + 5 options, timer (optional), flag button
- Answer reveal: correct option highlighted, per-option explanation, overall explanation
- Session summary: score, time, accuracy by topic, estimated theta change

### 5B — Review Mode (Spaced Repetition)
- Dashboard of due cards (items due for review today)
- Same question view as practice mode
- FSRS-5 updates on each response

### 5C — Progress Dashboard
- Per-topic theta chart over time (from `theta_history`)
- Mastery heatmap across topic tree
- Strengths / weaknesses summary
- Performance vs. session history

### 5D — Student Auth
- Students register via invite link or open registration (if institution allows)
- Self-service password reset

---

## Phase 7 — Analytics & Reporting 📋

**Goal:** Give instructors and admins data to improve content quality and track student outcomes.

### 6A — Item Analytics
- Per-question statistics: attempt count, correct rate, average response time
- Discrimination index (point-biserial correlation)
- IRT parameter refinement via `irt_calibration_runs`
- Flag items with poor discrimination (a < 0.5) or extreme difficulty

### 6B — Cohort Analytics
- Class performance per topic (aggregated mastery)
- Identify struggling topics across all students
- Cohort snapshots scheduled weekly (background job)
- Export to CSV

### 6C — Reporting UI (`/dashboard/analytics`)
- Pre-built reports via `report_definitions`
- Charts: theta distribution, topic mastery heatmap, question performance
- Date range filters, export buttons

---

## Technical Reference

### Running locally

```bash
# Start all services
make up

# Apply DB migrations
make migrate

# Seed demo data
make seed

# Watch backend logs
docker compose logs -f backend

# Restart backend after Python changes
docker compose restart backend

# DB shell
make shell-db
```

### Environment variables (`.env`)
```
DATABASE_URL=postgresql+asyncpg://app:dev@postgres:5432/adaptive_learn
REDIS_URL=redis://redis:6379/0
SECRET_KEY=<random 64-char hex>
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
ENVIRONMENT=development
```

### Frontend dev (local, not Docker)
```bash
cd frontend
npm install
npm run dev          # starts at localhost:3001 (3000 if free)
```
Frontend proxies `/api/*` → `http://localhost:8000` via `next.config.ts` rewrites.

### Key file locations
```
backend/src/app/
  api/v1/endpoints/    — route handlers (topics.py, items.py, auth.py)
  models/              — SQLAlchemy ORM models (33 files)
  schemas/             — Pydantic v2 request/response schemas
  services/            — Business logic (topic_service.py, item_service.py)
  core/                — Config, exceptions, roles, database session

frontend/
  app/(dashboard)/     — Protected admin pages
  app/(auth)/          — Login / register
  components/ui/       — Reusable UI components
  lib/api/             — API client (client.ts, auth.ts, topics.ts, items.ts)
  lib/hooks/           — React Query hooks (use-auth.ts, use-topics.ts, use-items.ts)
  lib/stores/          — Zustand stores (auth.ts)
  proxy.ts             — Route protection middleware (Next.js 16)
```

### Architecture decisions log
| Decision | Why |
|----------|-----|
| `redirect_slashes=False` on FastAPI | Next.js proxy strips trailing slashes; explicit no-slash aliases added on collection endpoints |
| `bcrypt` direct (not `passlib`) | passlib incompatible with bcrypt 4.x |
| `use_alter=True` on `items.current_version_id` FK | Circular reference with `item_versions` — cannot create both FKs in one DDL pass |
| Materialized path for topics | Efficient subtree queries without recursive CTEs |
| `selectinload` not `joinedload` for one-to-many | SQLAlchemy async requirement — joinedload causes MissingGreenlet |
| httpOnly cookies (not localStorage) | XSS-safe token storage; samesite=lax prevents CSRF |
| Server-side session table (`auth_sessions`) | Enables instant revocation — pure JWT cannot be revoked |
| `institution_id=NULL` for global topics | USMLE/TUS taxonomy shared across all tenants without duplication |
