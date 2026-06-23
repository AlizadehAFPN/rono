# Synapse — Adaptive Learning Platform
## Phase 1 Completion Report: Data Architecture & Database Foundation

**Project:** Synapse — AI-Powered Adaptive Learning for Medical Education
**Phase:** 1 of 6 — Data Architecture & Database Foundation
**Status:** Complete
**Date Completed:** May 16, 2026
**Prepared by:** Engineering Team

---

## Executive Summary

Phase 1 established the permanent data foundation for the Synapse platform. Every piece of information the platform will ever store — from user accounts and exam questions, to how students perform, how questions are scheduled for review, and how administrators monitor outcomes — has been precisely designed, implemented, and deployed to the database.

This phase is analogous to pouring and inspecting the concrete foundation of a building. No walls go up, no windows go in, and no tenants move in during this phase. But everything that comes next depends entirely on the quality of what was built here. We are satisfied that the foundation is sound, scalable, and professional.

At the conclusion of Phase 1, the Synapse database contains **33 production-ready tables**, organized into **5 logical domains**, with full support for multi-institutional deployment from day one.

---

## What Was Built

### Overview: 33 Tables Across 5 Domains

| Domain | Purpose | Tables |
|--------|---------|--------|
| Domain 1 — Auth & Identity | Who people are, where they belong, what they can do | 6 |
| Domain 2 — Content | Questions, answers, topics, and media | 9 |
| Domain 3 — Learning Engine | Practice sessions, student performance, spaced repetition | 9 |
| Domain 4 — Analytics | Mastery tracking, item quality metrics, cohort reporting | 4 |
| Domain 5 — System & Operations | Platform health, notifications, jobs, audit trails | 5 |
| **Total** | | **33** |

---

### Domain 1 — Authentication & Identity (6 Tables)

This domain answers: *Who is using the platform, and what are they allowed to do?*

**Institutions** — The top-level container for everything on the platform. Each university, medical school, or training provider is one institution. Institutions have their own subscription tier, branding settings, and their own isolated data. This is the foundation of the platform's multi-tenancy: a student at one institution cannot see anything from another.

**Users** — Every person on the platform has a user record. It stores their name, email, login credentials (stored securely as a one-way cryptographic hash, never in plain text), language preference, time zone, and account status. Users can belong to multiple institutions simultaneously, which supports students who are enrolled in two programs at once, or instructors who teach at multiple schools.

**Memberships** — The bridge between a user and an institution. Each membership defines the role a person plays within that institution: student, instructor, content author, coordinator, or administrator. A user has one membership per institution, and their role determines what they can see and do.

**Permissions** — Fine-grained access controls that sit on top of roles. While roles provide broad access ("this person is an instructor"), permissions provide specific overrides ("this instructor can also publish content to the live question bank"). This allows precise, auditable control over sensitive operations.

**Authentication Sessions** — Every time a user logs in, a secure session is created. The session tracks when it was created, when it expires, the device used, and whether it has been revoked. This is what allows the platform to safely log users out remotely, enforce session timeouts, and detect suspicious concurrent logins.

**Password Reset Tokens** — When a user forgets their password, a secure, time-limited, one-use token is generated. This table records those tokens (stored only as a cryptographic hash for security), preventing them from being reused or guessed.

---

### Domain 2 — Content (9 Tables)

This domain answers: *What questions exist, and how are they organized?*

**Topics** — The subject matter hierarchy. Topics are organized as a tree: a root topic like "Cardiology" contains subtopics like "Heart Failure," which contains further subtopics like "Acute Decompensated Heart Failure." This structure allows questions to be tagged at any level of specificity, and allows the platform to reason about a student's mastery of broad areas as well as narrow ones.

**Items** — A question. Each item is the permanent, canonical record of a question's existence on the platform. The item itself stores metadata about the question — its type, its difficulty parameters as calculated by the IRT algorithm, how many times it has been answered, and its current publication status. Crucially, the item does not store the question text itself; that lives in Item Versions.

**Item Versions** — The actual content of a question: the question text, the explanation, and any attached media. Every time a content author makes a meaningful edit to a question, a new version is created rather than overwriting the old one. This means that a student's historical responses are always linked to the exact version of the question they answered, preserving accuracy in historical records even as questions are improved over time.

**Options** — The multiple-choice answer options for each question. Options belong to a specific version of a question (not to the question itself), which maintains consistency with the versioning model. Each option records its text, whether it is correct, and an optional explanation shown after the student answers.

**Item Tags** — A flexible labeling system for questions. Tags are free-form key-value pairs (e.g., "source: USMLE Step 1", "difficulty: hard", "year: 2024") that can be added by content authors without changing the formal data structure. Tags support filtering and organization without requiring schema changes.

**Item Topic Links** — The many-to-many relationship between questions and topics. A single question can test knowledge across multiple topics (e.g., a pharmacology question might be linked to both "Drug Mechanisms" and "Renal Physiology"). One topic is always designated as the primary topic for IRT scoring purposes.

**Media Assets** — Images, diagrams, audio clips, and videos that accompany questions. Each asset is stored with its file reference, content type, size, and the user who uploaded it. The platform stores files in object storage (e.g., S3); this table stores the metadata needed to retrieve and display them.

**Item Flags** — When a student believes a question has an error (wrong answer key, ambiguous wording, outdated information), they can flag it. This table records those flags, tracks their review status, and captures the resolution notes from the content reviewer who investigated.

**IRT Calibration Runs** — The Item Response Theory algorithm requires periodic recalibration as more student response data accumulates. This table records every time the calibration process ran, how many questions and responses were included, whether it succeeded, and the parameters it used. This provides a complete, auditable history of how the platform's intelligence has evolved.

---

### Domain 3 — Learning Engine (9 Tables)

This domain answers: *How do students practice, and how does the platform remember what they know?*

**Curricula** — A structured collection of content organized for a specific learning goal (e.g., "USMLE Step 2 CK Prep 2026"). Curricula are created by instructors and contain assignments. Students enroll in curricula, and their progress through the curriculum is tracked end-to-end.

**Curriculum Enrollments** — Records which students are enrolled in which curricula, when they enrolled, their current enrollment status, and who enrolled them (self-enrollment vs. instructor-assigned).

**Assignments** — A discrete study task within a curriculum. An assignment can be a timed exam, an adaptive practice session, or a scheduled review block. Each assignment specifies how many questions to deliver, any time limits, when it becomes available, and whether correct answers are revealed immediately or after submission.

**Practice Sessions** — Every time a student sits down and answers questions, a session is recorded. The session tracks how many questions were answered, how many were correct, the student's ability score at the start and end of the session, and how long they spent. Sessions are the fundamental unit of engagement analytics.

**Responses** — Every individual answer a student gives to every question is permanently recorded here. This is the richest raw data table in the platform. Each response captures: which question was answered, which version of the question was shown, which option was selected, whether it was correct, how long the student took, the student's ability score at the moment of answering, and whether the question was flagged, skipped, or timed out. This table grows continuously and is designed for high-volume write performance.

**User Theta** — Each student's current estimated ability score (theta), per subject area. Theta is the core number the IRT algorithm uses to decide which question to serve next. A theta of 0 represents average ability for the cohort; positive values indicate above-average ability; negative values indicate below-average. Each student has one theta per topic domain (plus one global theta), and these values are continuously updated as the student answers questions.

**Theta History** — An immutable log of every time a student's ability score changed. While User Theta always holds the current value, Theta History preserves the complete trajectory — allowing the platform to show students a graph of their learning progress over time, and allowing researchers to study how ability develops.

**Card States** — The spaced repetition (FSRS-5) state of every question for every student. When the algorithm schedules a question for review, it consults this table. The state includes when the question is due for review, how difficult it has been for this particular student, how stable the memory is (how unlikely it is to be forgotten), and how many times it has lapsed. This table drives the "smart review" feature.

**Review Logs** — Every time the spaced repetition algorithm makes a scheduling decision, the before-and-after state is logged here. This provides full auditability of the spaced repetition system's decisions and enables retrospective analysis of scheduling quality.

---

### Domain 4 — Analytics (4 Tables)

This domain answers: *How is this student doing, how good are these questions, and how is this cohort performing?*

**User Topic Mastery** — A denormalized, always-current summary of each student's mastery of each subject area. Where User Theta represents raw statistical ability, mastery provides a human-readable label (Not Started / Learning / Proficient / Mastered) alongside supporting statistics: total questions answered, accuracy rate, average response time, retention rate, and how many questions are currently due for review. This is the primary table powering student-facing dashboards.

**Item Analytics** — A per-institution summary of each question's performance. Tracks how many times the question has been answered, what percentage of students answered correctly (facility index), how well the question distinguishes high-ability from low-ability students (point-biserial correlation), how many times it was flagged or skipped, and its calibrated IRT difficulty and discrimination parameters. Content authors use this data to identify poorly performing questions.

**Cohort Snapshots** — Periodic statistical snapshots of an entire group of students (e.g., all students enrolled in a particular curriculum) at a point in time. Each snapshot captures average and median ability scores, their distribution, overall accuracy, retention, and a breakdown of mastery levels across the cohort. These snapshots enable historical trend analysis without requiring expensive real-time aggregations over the full response history.

**Report Definitions** — A flexible engine for scheduled and on-demand reports. Administrators and instructors can define custom report templates — specifying what type of report they want, the parameters (date ranges, topics, cohort filters), and optionally a schedule (e.g., "email this report every Monday morning"). This table stores those configurations.

---

### Domain 5 — System & Operations (5 Tables)

This domain answers: *How does the platform govern itself, communicate, and stay healthy?*

**Audit Logs** — An immutable ledger of every significant action that occurs on the platform: logins, content publications, permission changes, enrollments, and administrative overrides. Each record captures who did what, to which resource, from which IP address, and when. This table is append-only and critical for security compliance, accreditation audits, and incident investigation.

**Feature Flags** — A configuration system that allows the engineering team to turn features on or off without deploying new code, and to roll features out gradually to specific institutions or percentages of users. This enables safe, controlled releases of new capabilities and the ability to instantly disable a feature if issues arise in production.

**Notification Templates** — Pre-built message templates for every type of system communication: welcome emails, password reset instructions, assignment reminders, score reports, and so on. Templates support multiple delivery channels (email, push notification, in-app) and can be customized per institution without code changes.

**Notifications** — Every message sent to every user, with its delivery status tracked end-to-end. The platform knows whether a notification was sent, delivered, and read. Failed notifications are retained for retry and investigation.

**Background Jobs** — Many platform operations are too slow to run in real time: IRT recalibration, cohort snapshot generation, report exports, and bulk email dispatches. This table manages the queuing and tracking of those asynchronous tasks, including how many times each job was attempted, whether it succeeded, and what error occurred if it failed.

---

## Technical Quality Review

### Architecture Decisions That Will Matter Later

**Multi-tenancy by Design**
Every table that holds user or institution-scoped data carries an `institution_id` field. This was a deliberate architectural choice made at the start of Phase 1. It means the platform was designed for multiple organizations from the beginning, not retrofitted later — a common and costly mistake in SaaS systems.

**Immutable History**
The highest-volume tables in the system — Responses, Theta History, Review Logs, and Audit Logs — are designed as append-only ledgers. Data is written once and never updated. This is a standard practice in high-integrity systems: it eliminates entire classes of data corruption bugs, simplifies compliance, and makes analytics queries straightforward.

**Content Versioning**
Questions can be edited without erasing history. When a content author improves a question, a new version is created and the old version is retained. Every student response is linked to the exact version of the question they answered. This means the platform can accurately report how a student performed, even if the question has been updated since.

**Circular Dependency Resolution**
An Item points to its current version, and a Version points back to its Item. This is a circular relationship that most database systems cannot handle naively. A careful technical mechanism (`use_alter`) was used to allow both tables to be created cleanly without either needing to exist before the other.

**Timezone Correctness**
All timestamps across all 33 tables store timezone-aware values in UTC. The deprecated Python `datetime.utcnow()` function (which returns a value that looks like UTC but carries no timezone information, causing subtle bugs) was audited across every model and replaced with the modern, correct `datetime.now(timezone.utc)`. This prevents an entire class of bugs that often only surface in production, months after launch.

**UUID Primary Keys**
All entity tables use UUID (Universally Unique Identifier) primary keys rather than sequential integers. This is the right choice for a multi-tenant SaaS platform for several reasons: IDs cannot be guessed by external parties, records can be safely merged across databases, and new records can be created in application memory before they are written to the database without risk of collision.

**High-Volume Table Optimization**
The five highest-volume tables (Responses, Review Logs, Theta History, Audit Logs, Notifications) use 64-bit integer primary keys rather than UUIDs. These tables can accumulate tens of millions of rows; sequential integer keys are substantially more efficient for database indexing at that scale.

---

## Issues Encountered and Resolved

| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| Migration tool could not find the database | Local machine also runs a database on the same port; the migration tool was connecting to the wrong one | All database operations now run inside the Docker container, which always reaches the correct database |
| Python package `py-fsrs` not found | Incorrect package name for the spaced repetition library | Corrected to `fsrs`, the actual PyPI package name |
| Circular reference between Items and Item Versions | Each table needed the other to exist first before it could be created | Resolved using SQLAlchemy's `use_alter` mechanism, which creates both tables first and then adds the cross-reference afterward |
| `card_state.state` stored as a number instead of text | Copy-paste error: used `Numeric(20)` (number type) instead of `String(20)` (text type) | Caught during review, corrected before any data was written |
| UUID inconsistency across Domain 3 models | Some foreign key columns used string UUID representation instead of native UUID | Standardized all 33 models to use native UUID objects throughout |
| Deprecated timestamp function | `datetime.utcnow()` is deprecated in Python 3.12 and later | Replaced in all 33 models with `datetime.now(timezone.utc)` |
| Three unused imports across two files | Minor cleanup missed during initial authoring | Removed (`BigInteger` in item_analytics, `String` in cohort_snapshot) |
| Missing explicit Boolean type in topic model | `is_active` field omitted the `Boolean` type annotation | Added for clarity and consistency with all other boolean fields |

---

## Database State at Phase 1 Completion

```
33 tables deployed across 5 domains
4 Alembic migrations applied successfully
0 pending migrations
0 deprecated patterns remaining
0 unused imports
All timestamps timezone-aware (UTC)
All UUIDs consistent (native UUID type)
```

**Tables confirmed live in Postgres:**

| # | Table | Domain | Purpose |
|---|-------|--------|---------|
| 1 | `institutions` | Auth & Identity | Top-level tenant |
| 2 | `users` | Auth & Identity | Every person on the platform |
| 3 | `memberships` | Auth & Identity | User ↔ Institution role bridge |
| 4 | `permissions` | Auth & Identity | Fine-grained access grants |
| 5 | `auth_sessions` | Auth & Identity | Active login sessions (JWT) |
| 6 | `password_reset_tokens` | Auth & Identity | Secure password recovery |
| 7 | `topics` | Content | Subject matter hierarchy |
| 8 | `items` | Content | Questions (metadata + IRT) |
| 9 | `item_versions` | Content | Question content snapshots |
| 10 | `options` | Content | Multiple-choice answer choices |
| 11 | `item_tags` | Content | Flexible question labels |
| 12 | `item_topic_links` | Content | Question ↔ Topic associations |
| 13 | `media_assets` | Content | Images, diagrams, audio |
| 14 | `item_flags` | Content | Student error reports |
| 15 | `irt_calibration_runs` | Content | IRT calibration audit trail |
| 16 | `curricula` | Learning Engine | Structured study programs |
| 17 | `curriculum_enrollments` | Learning Engine | Student ↔ Curriculum |
| 18 | `assignments` | Learning Engine | Discrete study tasks |
| 19 | `practice_sessions` | Learning Engine | Study session records |
| 20 | `responses` | Learning Engine | Every answer ever given |
| 21 | `user_thetas` | Learning Engine | Current ability scores |
| 22 | `theta_history` | Learning Engine | Ability score timeline |
| 23 | `card_states` | Learning Engine | Spaced repetition state |
| 24 | `review_logs` | Learning Engine | Scheduling decision audit |
| 25 | `user_topic_mastery` | Analytics | Student mastery dashboard |
| 26 | `item_analytics` | Analytics | Question quality metrics |
| 27 | `cohort_snapshots` | Analytics | Group performance snapshots |
| 28 | `report_definitions` | Analytics | Scheduled report configs |
| 29 | `audit_logs` | System & Ops | Immutable action ledger |
| 30 | `feature_flags` | System & Ops | Feature on/off controls |
| 31 | `notification_templates` | System & Ops | Message templates |
| 32 | `notifications` | System & Ops | Outgoing message queue |
| 33 | `background_jobs` | System & Ops | Async task management |

---

## What Was Not Built in Phase 1

Phase 1 intentionally excluded everything that is not the data model. The following are explicitly out of scope for this phase and will be addressed in Phase 2 and beyond:

- No API endpoints — the database exists, but nothing can talk to it yet
- No authentication — users cannot log in yet
- No business logic — no IRT scoring, no FSRS scheduling, no question selection
- No frontend screens — the user interface is not connected to anything yet
- No seed data — the database is empty; test data will be inserted in Phase 2
- No automated tests — these will be written alongside the API layer in Phase 2

---

## Phase 2 — Status: Complete

Phase 2 built the authentication and core API layer on top of the data foundation established here. All goals were achieved and verified:

1. ✅ Register an account (institution + admin created atomically)
2. ✅ Log in securely (bcrypt + JWT, httpOnly cookies, timing-attack-safe)
3. ✅ Receive a session token (access 15 min + refresh 7 days, with rotation)
4. ✅ Make authenticated API requests (session-DB validation on every request)
5. ✅ Browse topics (flat list + nested tree via materialized path)
6. ✅ View items (full question + options + version, with paginated filtering)

Phase 2 also added one column to this phase's schema: `exam_type` on the `items` table, to distinguish USMLE Step 1, Step 2, Step 3, and TUS questions. This column was not anticipated at Phase 1 time; it was added cleanly via Alembic migration `e48ce4433ba3`.

See `PHASE_2_REPORT.md` for the full Phase 2 completion report.

---

*This report was prepared at Phase 1 completion. For technical specifications of any individual component, refer to the source code in `backend/src/app/models/`.*
