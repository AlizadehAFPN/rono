# Synapse — Adaptive Learning Platform
## Phase 2 Completion Report: Authentication, Security & Core API Layer

**Project:** Synapse — AI-Powered Adaptive Learning for Medical Education
**Phase:** 2 of 6 — Authentication, Security & Core API Layer
**Status:** Complete
**Date Completed:** May 16, 2026
**Prepared by:** Engineering Team

---

## Executive Summary

Phase 2 transformed the Synapse platform from a database schema into a living, communicating system. Where Phase 1 built the foundation and Phase 0 built the scaffolding, Phase 2 built the doors, locks, and rooms — the parts that humans and software actually interact with.

By the end of this phase, a real user can register an account, log in securely, prove their identity on every request, browse the subject matter hierarchy, and retrieve exam questions with their full answer choices and explanations. Every endpoint is protected by a layered security model: authentication verifies identity, session management enables instant revocation, and role-based access control ensures that students, instructors, and administrators each see exactly what they are permitted to see — nothing more.

This phase also incorporated early requirements gathered directly from the client, including the need to support multiple distinct exam types (USMLE Step 1, Step 2, Step 3, and TUS) and a topic taxonomy shared across all institutions. These requirements were designed into the system at the API and data layer — before the frontend exists and before thousands of questions are entered — because changing them after the fact would be far more costly.

At the conclusion of Phase 2, the platform has **20 production-ready source files**, **19 live API endpoints**, and a fully verified end-to-end flow confirmed by automated smoke tests.

---

## What Was Built

### 1. The Security Foundation

Before a single API endpoint could be written, several core security components had to be put in place. These components are not visible to the end user, but they underpin every interaction on the platform.

**Password Hashing**
User passwords are never stored in plain text — not even in a form that can be reversed. When a user sets a password, it is processed through bcrypt, a deliberate one-way cryptographic algorithm. Bcrypt is designed to be slow and computationally expensive, which makes it resistant to large-scale brute-force attacks. The database stores only the resulting hash; if the database were ever compromised, passwords could not be recovered from it.

A technical note: the industry-standard Python library for password hashing (`passlib`) has become unmaintained and is incompatible with current bcrypt versions. Rather than accepting this fragility, the platform was built to use the `bcrypt` library directly. This is a simpler, more maintainable approach that eliminates a known source of runtime failures.

**JSON Web Tokens (JWT)**
When a user logs in successfully, the server issues two cryptographically signed tokens:

- **Access Token** — Valid for 15 minutes. Sent automatically with every API request via a secure cookie. The server validates this token on every request to confirm the user's identity and role without touching the database.
- **Refresh Token** — Valid for 7 days. Sent only when requesting a new access token, via a cookie scoped exclusively to the authentication endpoints. This narrow scope ensures the refresh token is never accidentally sent to other parts of the API.

Both tokens carry a digital signature. If anyone tampers with the contents — for example, trying to change their role from "student" to "instructor" — the signature verification will fail and the request will be rejected.

**Token Rotation**
Every time a refresh token is used to obtain a new access token, the old refresh token is permanently revoked and a new one is issued. This means stolen tokens become useless after a single use, and the window of exposure from any compromise is minimized.

**Session Tracking**
Every login creates a record in the database. This record is checked on every authenticated request — in addition to the JWT signature. If an administrator revokes a user's access (by invalidating the session record), that user is locked out immediately, even if their JWT has not yet expired. Most platforms cannot do this; they must wait for tokens to expire naturally. Synapse does not have this limitation.

**Secure Cookie Delivery**
Tokens are delivered as `httpOnly` cookies, which means they are invisible to JavaScript running in the browser. This design choice eliminates an entire class of attack (Cross-Site Scripting token theft). Cookies are also scoped to HTTPS in all non-development environments.

---

### 2. The Role Hierarchy

The platform supports six distinct roles, arranged in a strict hierarchy of ascending privilege:

| Level | Role | Typical Holder | What They Can Do |
|-------|------|---------------|-----------------|
| 0 | Student | Medical student | Practice questions, view own progress |
| 1 | Content Author | Question writer | Create and edit question drafts |
| 2 | Instructor | Course faculty | Publish content, manage assignments |
| 3 | Coordinator | Program director | Manage curricula and enrollments |
| 4 | Institution Admin | School administrator | Full control within their institution |
| 5 | System Admin | Platform operator | Cross-institution access |

The hierarchy works additively: an instructor can do everything a content author and student can do, plus additional instructor-level actions. When the system checks whether a user can perform an action, it asks "is this user's role at least X?" — not "does this user have exactly role X?" This design means new capabilities can be granted to all appropriate roles by setting a single minimum threshold.

---

### 3. The Authentication API (5 Endpoints)

These endpoints handle every aspect of a user's identity on the platform.

**Register** (`POST /api/v1/auth/register`)
Creates a new institution and its first administrator in a single atomic operation. If anything fails partway through — say, the institution name is already taken — the entire operation is rolled back and no partial data is left in the database. A successful registration immediately issues a session, so the user is logged in as soon as they complete registration. No separate login step required.

**Login** (`POST /api/v1/auth/login`)
Verifies credentials and issues tokens. This endpoint was designed with a subtle but important security property: it takes the same amount of time whether the email address exists or not. This prevents an attacker from using timing differences to enumerate valid email addresses in the system — a technique known as a timing attack. Regardless of whether the email is found or the password is wrong, the response arrives in the same amount of time and carries the same generic error message.

**Logout** (`POST /api/v1/auth/logout`)
Revokes the current session in the database and clears both cookies. After logout, the user's tokens are immediately invalid — even if the JWT itself has not yet expired.

**Refresh** (`POST /api/v1/auth/refresh`)
Issues a new access token using the long-lived refresh token. This is the mechanism that allows users to stay logged in across multiple days without re-entering their password, while still maintaining short-lived access tokens that limit exposure if compromised. The old session is revoked and a new session is created atomically.

**Me** (`GET /api/v1/auth/me`)
Returns the authenticated user's profile and institution memberships. This is the first endpoint a frontend application calls after login — it establishes the user's identity, role, and institution context for all subsequent requests.

---

### 4. The Topics API (6 Endpoints)

Topics are the subject matter hierarchy that organizes all questions on the platform. The architecture supports unlimited depth: a medical school might have Physiology at the top level, Cardiovascular System as a sub-topic, and Congenital Heart Diseases as a further sub-topic. Questions are tagged to specific levels in this hierarchy, allowing students to study at any grain of specificity they choose.

**The Materialized Path Strategy**
Each topic stores its complete lineage as a path string (for example: `/physiology-id/cardiovascular-id/congenital-id`). This is a deliberate database design choice with significant performance implications. Finding all descendants of a topic — a common operation when building a tree or filtering questions by broad subject area — requires a single database query that looks for paths starting with a given prefix. No recursive queries, no self-joins, no expensive traversals.

**Global Topics**
The platform supports two categories of topics: institution-owned topics (visible only within one school) and global topics (visible to all institutions). Global topics will carry standardized taxonomies — the 13 USMLE Step 1 subject areas, the TUS subject hierarchy — which are identical across every institution that uses the platform. Local topics allow individual schools to add their own organizational layers on top of the shared taxonomy. All API queries automatically include both global and institution-specific topics.

**List Topics — Flat** (`GET /api/v1/topics/`)
Returns a flat, paginated list of topics. Supports filtering by parent topic (to get only the immediate children of a given topic), whether to include deactivated topics, and standard pagination controls. Used to populate dropdown menus and search filters.

**Topic Tree** (`GET /api/v1/topics/tree`)
Returns the complete topic hierarchy as a nested structure. The entire tree is assembled in memory from a single database query, sorted by materialized path (which guarantees parents always appear before their children). A single linear pass builds the full nested tree in O(n) time — efficient regardless of how large the taxonomy grows.

**Create Topic** (`POST /api/v1/topics/`)
Creates a new topic and automatically computes its path and depth level. Requires instructor role or higher. The path is computed before the topic is inserted, which allows the platform to know a topic's full lineage without any additional database queries.

**Get Topic** (`GET /api/v1/topics/{id}`)
Retrieves a single topic by ID. Available to any authenticated user.

**Update Topic** (`PATCH /api/v1/topics/{id}`)
Modifies a topic's name, description, display order, or active status. Deliberately does not allow path or level changes — moving a topic to a different parent requires updating the paths of all descendants simultaneously, which is a dedicated operation reserved for a future phase.

**Deactivate Topic** (`DELETE /api/v1/topics/{id}`)
Soft-deletes a topic by marking it inactive — the record is never removed from the database. The operation is refused if any questions are still linked to the topic, preventing orphaned questions. Requires institution administrator role.

---

### 5. The Items API (8 Endpoints)

Items are questions. The Items API is the most complex in Phase 2, because a single question involves multiple interrelated records: the question itself, its content version, its answer options, and its topic associations. All of these must be created atomically, and all must be returned together when a question is fetched.

**The Circular Foreign Key Challenge**
A significant technical challenge in this API: a question points to its current version (to know which version to display), and a version points back to its question (to know which question it belongs to). This mutual dependency means neither record can be inserted before the other.

The solution is a precisely ordered sequence of database operations:
1. Insert the question with no current version yet
2. Flush to the database (gets the question's ID, without committing)
3. Insert the version, referencing the question ID just obtained
4. Flush again (gets the version's ID)
5. Insert the answer options, referencing the version ID
6. Flush again
7. Update the question to point to the new version
8. Commit the entire transaction

Any deviation from this sequence causes a foreign key violation. This sequence is enforced in the service layer and thoroughly documented.

**Create Item** (`POST /api/v1/items/`)
Creates a complete question with its first version and all answer options in a single atomic transaction. At minimum, a question must have at least two answer options, and exactly one must be marked as correct — this is validated at the schema level before the database is touched. Requires instructor role.

**List Items** (`GET /api/v1/items/`)
Returns a paginated list of questions with optional filters: by status (draft, active, retired), by topic, by item type, and by exam type (USMLE Step 1, Step 2, Step 3, or TUS). Includes the full current version with all answer options in each result. The list is scoped to the requesting user's institution.

**Get Item** (`GET /api/v1/items/{id}`)
Returns a single question with its current version, all answer options, and its topic associations. Available to any authenticated user.

**Update Item** (`PATCH /api/v1/items/{id}`)
Updates a question's status or topic associations. Does not allow editing the question text — that is done by creating a new version, preserving the immutable history of all prior versions.

**Soft Delete** (`DELETE /api/v1/items/{id}`)
Marks a question as deleted without removing it from the database. The question is hidden from all queries immediately. Historical student responses linked to this question are preserved. Requires instructor role.

**Create Version** (`POST /api/v1/items/{id}/versions`)
Creates a new version of a question's content — updated question text, revised options, improved explanation. The new version immediately becomes the current version. The previous version is retained permanently. Requires instructor role.

**List Versions** (`GET /api/v1/items/{id}/versions`)
Returns all historical versions of a question in reverse chronological order. This allows content authors to review how a question has changed over time and to understand the evolution of its content.

---

### 6. The Exam Type Architecture

An important design decision was made partway through Phase 2, based on direct requirements gathered from the client:

The platform serves multiple distinct medical licensing exams — USMLE Step 1, USMLE Step 2, USMLE Step 3, and TUS (the Turkish specialty training exam). Each exam has its own subject taxonomy and its own question bank. A question belongs to one exam type; a student preparing for USMLE Step 1 should see only Step 1 questions, not Step 3 questions that cover material they have not yet studied.

To support this, an `exam_type` field was added to every question. The valid values are:

| Value | Exam |
|-------|------|
| `usmle_step1` | USMLE Step 1 |
| `usmle_step2` | USMLE Step 2 CK |
| `usmle_step3` | USMLE Step 3 |
| `tus` | TUS (Türkiye) |
| *(null)* | Universal — not specific to one exam |

This field is indexed for fast filtering and is available as a query parameter on the List Items endpoint.

---

### 7. The Demo Seed Dataset

To support end-to-end testing and provide a realistic starting point for client demonstrations, a seed script was created that populates the database with representative data. The seed is fully idempotent — it can be run any number of times without creating duplicates.

**Institution created:**
- Synapse Demo University

**Users created:**

| Email | Password | Role |
|-------|----------|------|
| admin@synapse-demo.edu | Admin1234! | Institution Admin |
| instructor@synapse-demo.edu | Teach1234! | Instructor |
| student@synapse-demo.edu | Study1234! | Student |

**Topic hierarchy created (8 topics, 3 levels deep):**

```
Basic Sciences
├── Physiology
│   └── Cardiovascular Physiology
└── Biochemistry

Clinical Sciences
├── Cardiology
│   └── Heart Failure
└── Pulmonology
```

**Sample questions created (3 items):**

1. The Frank-Starling mechanism — Cardiovascular Physiology (active, published)
2. Heart failure with reduced ejection fraction — Heart Failure (active, published)
3. Primary determinant of myocardial oxygen demand — Cardiovascular Physiology (draft, unpublished)

These questions were selected to reflect the real structure of USMLE-style exam questions: clinical vignettes, physiological mechanisms, and treatment questions — each with full per-option explanations and educational objectives.

---

### 8. The Dependency Injection System

All 19 endpoints in Phase 2 share a common infrastructure for verifying identity and injecting database connections. This infrastructure — called dependency injection — ensures that every endpoint gets the same guarantees without repeating code:

- Every request gets a fresh, properly managed database session
- Every authenticated endpoint receives a verified `CurrentUser` object containing the user's ID, role, institution ID, and session ID
- Role requirements are expressed declaratively: `require_role(Role.INSTRUCTOR)` — a single function call that enforces the role check, handles the error case, and returns the verified user
- The system never proceeds if the database session is not valid, the JWT is forged or expired, the session has been revoked, or the user's account is deactivated

---

## Technical Challenges Encountered and Resolved

| Challenge | Root Cause | Resolution |
|-----------|-----------|------------|
| Backend crash on startup | `pydantic[email]` dependency missing for `EmailStr` validation | Added `email-validator` via the `pydantic[email]` extras flag in `pyproject.toml` |
| Seed script not found in container | Docker image copied only `src/`; the `scripts/` directory was not included | Added `COPY scripts /home/app/scripts` to Dockerfile; added volume mount for live updates |
| Ambiguous foreign key on `User.memberships` | `memberships` table has two foreign keys to `users` (`user_id` and `invited_by_id`); SQLAlchemy could not determine which to use | Explicitly specified `foreign_keys="[Membership.user_id]"` on the relationship |
| `passlib` incompatibility with `bcrypt 4.x` | `passlib` is unmaintained; its internal `detect_wrap_bug` function is broken against current `bcrypt` releases | Removed `passlib` entirely; replaced with direct `bcrypt` library usage |
| Topic tree endpoint returning empty response | `TopicTree.model_validate(topic)` triggered lazy-load of `Topic.children` ORM relationship outside async context (MissingGreenlet error) | Changed tree builder to validate via `TopicOut.model_validate(topic)` first (no `children` field), then wrap as `TopicTree(**out.model_dump())` |
| Circular foreign key at runtime | `items.current_version_id` ↔ `item_versions.item_id` — neither record can exist without the other | Enforced strict sequential flush order: insert item (no version yet) → flush → insert version → flush → insert options → flush → update item.current_version_id → commit |
| Global topics invisible to institutions | Topic service filtered strictly by `institution_id == X`, which excluded global topics (`institution_id = NULL`) | Updated all three topic query functions to use `OR (institution_id = X OR institution_id IS NULL)` |

---

## Smoke Test Results

Before Phase 2 was declared complete, seven end-to-end tests were run against the live running system. All seven passed.

| # | Test | Endpoint | Expected | Result |
|---|------|----------|----------|--------|
| 1 | Server liveness | `GET /api/v1/health` | `{"status": "ok"}` | ✅ Passed |
| 2 | New institution registration | `POST /api/v1/auth/register` | User + membership returned, cookies set | ✅ Passed |
| 3 | Login with seeded admin | `POST /api/v1/auth/login` | User returned, auth cookies set | ✅ Passed |
| 4 | Cookie-authenticated identity | `GET /api/v1/auth/me` | Admin profile with institution membership | ✅ Passed |
| 5 | Topic flat list | `GET /api/v1/topics/` | All 8 seeded topics in path order | ✅ Passed |
| 6 | Topic nested tree | `GET /api/v1/topics/tree` | 2 root nodes, correct 3-level nesting | ✅ Passed |
| 7 | Item list with full content | `GET /api/v1/items/` | 3 items with versions, options, and metadata | ✅ Passed |

---

## Code Inventory

### New Files Created (20)

| File | Purpose |
|------|---------|
| `backend/src/app/core/database.py` | Async engine, session factory, `get_db` generator |
| `backend/src/app/core/security.py` | Password hashing, JWT creation/decoding, cookie helpers |
| `backend/src/app/core/exceptions.py` | 7 custom exception classes + FastAPI exception handler |
| `backend/src/app/core/roles.py` | 6-level role hierarchy, `role_gte()` comparison function |
| `backend/src/app/schemas/auth.py` | Register/login request schemas, user output schemas |
| `backend/src/app/schemas/topics.py` | Topic create/update/output/tree schemas |
| `backend/src/app/schemas/items.py` | Option, version, item, and paginated output schemas |
| `backend/src/app/api/deps.py` | `CurrentUser` dataclass, auth dependency, `require_role` factory |
| `backend/src/app/services/auth_service.py` | Register, login, logout, refresh, me — all business logic |
| `backend/src/app/services/topic_service.py` | Topic CRUD + tree builder |
| `backend/src/app/services/item_service.py` | Item CRUD + version management + circular-FK flush sequence |
| `backend/src/app/api/v1/endpoints/auth.py` | 5 authentication endpoints |
| `backend/src/app/api/v1/endpoints/topics.py` | 6 topic endpoints |
| `backend/src/app/api/v1/endpoints/items.py` | 8 item endpoints |
| `backend/src/app/api/v1/router.py` | Combines all endpoint routers under `/api/v1` |
| `backend/src/app/api/__init__.py` | Exports v1 router |
| `backend/src/app/api/v1/endpoints/__init__.py` | Package file |
| `backend/src/app/schemas/__init__.py` | Re-exports all schema classes |
| `backend/scripts/seed.py` | Idempotent demo data seed script |
| `backend/scripts/__init__.py` | Package file |

### Files Modified

| File | What Changed |
|------|-------------|
| `backend/src/app/core/config.py` | Added `REFRESH_TOKEN_EXPIRE_DAYS`; changed access token lifetime to 15 minutes |
| `backend/src/app/main.py` | Registered exception handler; included v1 router; added structlog; fixed readiness probe to use shared engine |
| `backend/src/app/models/user.py` | Added `foreign_keys` to `User.memberships` relationship to resolve ambiguity |
| `backend/src/app/models/item.py` | Added `exam_type` column (indexed, nullable) |
| `backend/pyproject.toml` | Changed `pydantic` to `pydantic[email]`; replaced `passlib[bcrypt]` with direct `bcrypt>=4.0` |
| `backend/Dockerfile` | Added `COPY scripts /home/app/scripts` |
| `docker-compose.yml` | Added `./backend/scripts:/home/app/scripts` volume mount |
| `Makefile` | Added `make seed` target |

### Database Migrations Applied

| Migration ID | Description |
|-------------|-------------|
| `e48ce4433ba3` | Add `exam_type` column and index to `items` table |

---

## API Reference Summary

### Authentication (`/api/v1/auth/`)

| Method | Path | Auth Required | Min Role | Description |
|--------|------|---------------|----------|-------------|
| POST | `/register` | No | — | Create institution + admin account |
| POST | `/login` | No | — | Authenticate and receive tokens |
| POST | `/logout` | Yes | Student | Revoke session and clear cookies |
| POST | `/refresh` | Refresh cookie | — | Rotate tokens |
| GET | `/me` | Yes | Student | Get current user profile |

### Topics (`/api/v1/topics/`)

| Method | Path | Auth Required | Min Role | Description |
|--------|------|---------------|----------|-------------|
| GET | `/` | Yes | Student | List topics (flat, paginated) |
| GET | `/tree` | Yes | Student | Full nested topic tree |
| POST | `/` | Yes | Instructor | Create a topic |
| GET | `/{id}` | Yes | Student | Get single topic |
| PATCH | `/{id}` | Yes | Instructor | Update topic metadata |
| DELETE | `/{id}` | Yes | Institution Admin | Soft-deactivate topic |

### Items (`/api/v1/items/`)

| Method | Path | Auth Required | Min Role | Description |
|--------|------|---------------|----------|-------------|
| POST | `/` | Yes | Instructor | Create item + version + options atomically |
| GET | `/` | Yes | Student | List items (paginated, filterable) |
| GET | `/{id}` | Yes | Student | Get item with full current version |
| PATCH | `/{id}` | Yes | Instructor | Update status or topic associations |
| DELETE | `/{id}` | Yes | Instructor | Soft-delete item |
| POST | `/{id}/versions` | Yes | Instructor | Create new version |
| GET | `/{id}/versions` | Yes | Student | List all versions |

---

## Architecture Decisions That Will Matter Later

**Session-DB Validation on Every Request**
The decision to validate session records in the database on every authenticated request adds two small queries per call, but it gives the platform a capability most systems lack: the ability to revoke access instantly. When a student is expelled, an employee is terminated, or a suspicious login is detected, their access ends in real time — not after their JWT expires in 15 minutes. This was chosen deliberately despite the cost because it is the right design for an institution-regulated platform.

**Refresh Token Path Scoping**
The refresh token cookie is scoped to `path="/api/v1/auth"`. This means the browser will only send the refresh token when calling the authentication endpoints — never when calling the topics, items, or any other API. This prevents the refresh token from leaking into server logs, request traces, or intermediary systems that see other API traffic. It is a small configuration detail with significant security consequences.

**Exam Type as a First-Class Field**
Adding `exam_type` directly to the `Item` model (rather than as a tag or a topic property) was a deliberate architectural choice. It allows students to filter their practice sessions by exam target (`GET /items/?exam_type=usmle_step1`) without requiring knowledge of the topic tree structure. It also allows a single question to belong to one exam type while being tagged to one specific sub-topic — these are independent dimensions of categorization that should not be conflated.

**Global Topic Taxonomy**
The USMLE and TUS subject hierarchies are standardized across all institutions. Storing them as global topics (`institution_id = NULL`) means they are created once on the platform and are visible everywhere, without each institution needing its own copy. Institution-specific topics sit alongside the shared taxonomy without conflict. This design makes the global taxonomy easy to maintain (change it in one place, every institution benefits) and easy to extend (institutions can add local sub-topics beneath the global structure).

**Idempotent Seeding**
The seed script checks for existence before inserting — by email for users, by slug for institutions and topics, by content prefix for questions. This means `make seed` can be run any number of times in any environment without creating duplicate data or causing errors. Idempotency in seed scripts eliminates a common class of developer friction in teams: the "database is in an unknown state" problem.

---

## What Was Not Built in Phase 2

The following capabilities are out of scope for Phase 2 and are planned for subsequent phases:

- **Practice Sessions** — The core loop of the platform: starting a session, receiving a question, submitting an answer, updating ability scores. This is Phase 3.
- **Adaptive Question Selection** — The IRT algorithm that selects the optimal next question based on the student's current estimated ability. Phase 3.
- **Spaced Repetition Scheduling** — The FSRS-5 algorithm that determines when to show a question again for long-term retention. Phase 3.
- **Admin Panel for Question Entry** — The client has requested a frontend interface for entering questions and assigning them to topics. Phase 4.
- **Full USMLE/TUS Taxonomy** — The complete, official subject hierarchy for each exam type, seeded as global topics. Phase 4 (pending documentation from the client).
- **Educational Objective Field** — A dedicated field on item versions for the structured "Educational Objective" section common in USMLE-style questions. Currently stored in the general explanation text; will be separated in Phase 4 when the admin panel is built.
- **Automated Test Suite** — Unit and integration tests for the authentication and API layer. To be written in Phase 3 alongside the more complex learning engine logic.

---

## Platform State at Phase 2 Completion

```
33 database tables — all from Phase 1, unchanged
 1 new database column — exam_type on items (migration e48ce4433ba3)
20 new/modified source files
19 live API endpoints across 3 resource groups
 5 Alembic migrations applied (4 from Phase 1 + 1 from Phase 2)
 0 pending migrations
 7 smoke tests — all passing
 3 demo users across 2 institutions (admin, instructor, student)
 8 demo topics in a 3-level hierarchy
 3 demo questions with full content and options
```

---

## Phase 3 Preview

Phase 3 will implement the adaptive learning engine — the algorithms that make Synapse different from a simple flashcard application.

By the end of Phase 3, a student will be able to:

1. Start a practice session for a specific topic or exam type
2. Receive a question chosen by the IRT algorithm based on their current estimated ability
3. Submit an answer and receive immediate feedback
4. Have their ability score (theta) updated in real time
5. Have the question's spaced repetition schedule updated for future review
6. End the session and see a summary of their performance

Phase 3 is the most algorithmically complex phase in the project. It will require careful implementation and testing of the IRT 2-Parameter Logistic model for question selection, and the FSRS-5 model for spaced repetition scheduling.

---

*This report was prepared at Phase 2 completion. For technical specifications of any individual component, refer to the source code in `backend/src/app/`.*
