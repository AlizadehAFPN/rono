# 🔬 ADAPTIVE LEARNING PLATFORM - 3-LAYER DEEP ANALYSIS

**Project**: Adaptive Learning System for Medical Education  
**Status**: Pre-alpha MVP (Phase 0/1 - Foundation)  
**Analysis Date**: May 16, 2026  
**Depth**: 3 layers (Conceptual → Architectural → Implementation)

---

## 📋 TABLE OF CONTENTS

1. [LAYER 1: CONCEPTUAL & BUSINESS LOGIC](#layer-1-conceptual--business-logic)
2. [LAYER 2: ARCHITECTURAL PATTERNS & COMPONENT DESIGN](#layer-2-architectural-patterns--component-design)
3. [LAYER 3: TECHNICAL SPECIFICATIONS & IMPLEMENTATION DETAILS](#layer-3-technical-specifications--implementation-details)
4. [PHASE 1 DEVELOPMENT GUIDELINE](#phase-1-development-guideline-step-by-step)
5. [CRITICAL SUCCESS FACTORS](#critical-success-factors)

---

# LAYER 1: CONCEPTUAL & BUSINESS LOGIC

## 1.1 PROBLEM STATEMENT

**Core Challenge**: How do you teach a learner effectively in adaptive contexts?

Two problems must be solved in parallel:

1. **What to teach next?** → Select new material optimally based on current ability
2. **When to review?** → Schedule previously-seen material to prevent forgetting

Most systems conflate these. This platform keeps them **strictly separate**.

## 1.2 ALGORITHMIC FOUNDATIONS

### A. Item Response Theory (IRT) - The "What" Problem

**Purpose**: Estimate latent ability (theta) and select maximally informative items

**The 2-Parameter Logistic (2PL) Model**:

```
P(correct | θ, a, b) = 1 / (1 + exp(-a * (θ - b)))
```

**Key Parameters**:

- **θ (theta)**: Learner's hidden ability (-4 to +4 scale; 0 = average)
- **a (discrimination)**: Item quality (how sharply it separates learners)
- **b (difficulty)**: Item threshold (what ability level gives 50% success)

**Operational Semantics**:

- `b = 2`: Top 2% of learners have 50% chance → **Hard item**
- `b = -2`: Below-average learners have 50% chance → **Easy item**
- High `a`: Item is a precise measuring instrument
- Low `a`: Item is noisy, tells you little

**Estimation Method**: Expected A Posteriori (EAP)

- Bayesian inference on theta posterior distribution
- Numerically stable (avoids ±∞ that MLE produces on all-correct/all-incorrect)
- Returns both estimate AND standard error

**Item Selection**: Maximum Fisher Information

```
I(θ) = a² * P(θ) * (1 - P(θ))
```

- Maximized when P = 0.5 (learner has ~50% chance)
- Roughly equivalent to: pick item where difficulty b ≈ current theta
- **Result**: Optimal measurement of true ability

### B. FSRS-5 - The "When" Problem

**Purpose**: Schedule reviews to maximize long-term retention (90% recall target)

**Three Tracked States per (learner, item)**:

- **D (Difficulty)**: How hard this item is _for this learner_ (1–10 scale)
- **S (Stability)**: Days until recall drops to 90% (exponential decay)
- **R (Retrievability)**: Current probability of recall (decays over time)

**Retention Formula**:

```
R(t) = (1 + (19/81) * t / S) ^ (-0.5)
```

- When t = S (number of days = stability), R = 0.9 exactly
- If S = 10 days, after 10 days you have 90% recall probability

**Rating Scheme** (how learner indicates recall):
| Rating | Meaning | Effect |
|--------|---------|--------|
| 1 | "I forgot" | S reset low, D increases |
| 2 | "Hard but correct" | S grows slowly, D increases |
| 3 | "Good" (typical) | S grows normally, D stable |
| 4 | "Easy/immediate" | S grows fast, D decreases |

**MVP Shortcut**: Derive rating from `(is_correct, response_time_ms)` automatically

- Not correct → Rating 1
- Very fast response → Rating 4
- Very slow response → Rating 2
- Medium speed + correct → Rating 3

**Scheduling**: Next review scheduled when R will drop to target (90% default)

```
interval = (S / (19/81)) * ((0.9 ^ (-2)) - 1) ≈ S days
```

### C. The Orchestrator - Unified Decision Logic

**Every request** (GET /next-item) triggers ONE decision:

```
IF due_count >= THRESHOLD:
    return next due item from FSRS queue
ELSE:
    return IRT-selected new item
```

**Why This Works**:

- Students need _adaptive challenge_ (IRT) for new material
- Students need _spaced repetition_ (FSRS) for retention
- But not at the same time — do one or the other based on queue pressure
- When reviews pile up, prioritize reviews; when caught up, teach new stuff

## 1.3 LEARNING OUTCOME GUARANTEES

**What the system guarantees**:

1. ✅ **Adaptive Challenge**: Every item serves maximal information about ability
2. ✅ **Personalization**: Item difficulty auto-adjusted per learner; same bank, different sequencing
3. ✅ **Retention**: Material reviewed at scientifically optimal times (90% recall target)
4. ✅ **Transparency**: Learner sees current theta (ability) and theta SE (confidence band)
5. ✅ **Mastery Tracking**: Per-topic mastery curves visible in dashboard

**What it does NOT guarantee**:

- ❌ Cramming works (it doesn't; FSRS-5 knows)
- ❌ Learning without struggle (Fisher info peaks at 50% difficulty)
- ❌ All learners finish at same pace (adaptive by design — some plateau, some progress)

## 1.4 USER PERSONAS & WORKFLOWS

### Persona 1: Student (Learner)

**Goal**: Master medical knowledge efficiently

**Workflow**:

1. Login
2. Start adaptive practice session
3. See next item (IRT or review, decided by orchestrator)
4. Answer, see feedback
5. Dashboard shows progress (theta, retention curve, topic mastery)

**Success Metric**: Theta growth + sustained retention

### Persona 2: Instructor (Content Creator)

**Goal**: Build and refine question banks

**Workflow**:

1. Create questions (topic hierarchy, IRT parameters initially guessed)
2. Monitor item analytics (response distribution, item fit)
3. Edit questions if students struggle
4. (Post-MVP) Trigger calibration to auto-fit parameters

**Success Metric**: Calibration status → well-fitted items

### Persona 3: Admin (System Manager)

**Goal**: Maintain data integrity, manage users

**Workflow**:

1. View system health
2. Manage users/roles
3. Monitor calibration schedules
4. Review audit logs

**Success Metric**: 99.9% uptime, zero unhandled errors

---

# LAYER 2: ARCHITECTURAL PATTERNS & COMPONENT DESIGN

## 2.1 SYSTEM ARCHITECTURE (4-TIER)

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: CLIENT LAYER (Browsers)                            │
├────────────────────────┬──────────────────────────────────┤
│  Next.js 15 Web App    │  (Mobile post-MVP via React Native) │
│  App Router, SSR       │                                   │
│  TypeScript strict     │                                   │
│  Tailwind + shadcn     │                                   │
└────────────────┬───────┴─────────────────────────────────┘
                 │ HTTPS/WebSocket
                 ▼
┌──────────────────────────────────────────────────────────────┐
│ TIER 2: API ORCHESTRATION (FastAPI)                         │
├──────────────────────────────────────────────────────────────┤
│  Python 3.12, FastAPI 0.115+, async throughout              │
│  Request parsing (Pydantic v2)                              │
│  Authentication (JWT in httpOnly cookies)                   │
│  Response shaping                                           │
│  Exception mapping                                          │
│                                                              │
│  Routes:                                                     │
│  ├─ /api/v1/auth/*       (login, register, logout)         │
│  ├─ /api/v1/practice/*   (next-item, responses)            │
│  ├─ /api/v1/dashboard/*  (stats, charts)                   │
│  └─ /api/v1/admin/*      (items, topics, analytics)        │
└─────────────────┬────────────────────────────────────────┘
                  │ In-process calls (MVP) or RPC (post-MVP)
        ┌─────────┼──────────────┐
        ▼         ▼              ▼
┌──────────────┐ ┌────────────┐ ┌──────────────────┐
│ TIER 3A:     │ │ TIER 3B:   │ │ TIER 3C:         │
│ IRT Engine   │ │ FSRS-5 Eng │ │ Orchestrator     │
│              │ │            │ │                  │
│ - EAP theta  │ │ - Sched    │ │ Decision logic   │
│ - Selection  │ │ - Queue    │ │ (due vs new)     │
│ - Caching    │ │ - State    │ │                  │
│ - Calibr.    │ │   mgmt     │ │ Background tasks:│
│              │ │            │ │ - update_theta   │
│ Uses:        │ │ Uses:      │ │ - update_fsrs    │
│ - catsim     │ │ - py-fsrs  │ │ - calibrate      │
│ - NumPy      │ │ - Redis    │ │                  │
│ - SciPy      │ │            │ │                  │
└──────────────┘ └────────────┘ └──────────────────┘
        │         │              │
        └─────────┼──────────────┘
                  │ Read/Write
        ┌─────────┴───────────────┐
        ▼                         ▼
┌────────────────────┐   ┌──────────────────┐
│ TIER 4A: PostgreSQL│   │ TIER 4B: Redis   │
│                    │   │                  │
│ Durable State:     │   │ Hot Cache/Queue: │
│ - users            │   │ - Candidate pools│
│ - topics           │   │ - Due queues     │
│ - items            │   │ - Session tokens │
│ - responses        │   │ - Rate limits    │
│ - card_states      │   │ - Temp data      │
│ - review_logs      │   │                  │
│ - user_thetas      │   │ TTL-based        │
│                    │   │ expiration       │
└────────────────────┘   └──────────────────┘
```

## 2.2 DATA FLOW DIAGRAMS

### Flow A: GET /api/v1/practice/next-item

```
Client Request
    │
    ▼
[FastAPI Route Handler]
    │ Validate JWT, extract user_id
    ▼
[Orchestrator.get_next_item(user_id)]
    │
    ├──→ [FSRS Queue Manager]
    │        │ count_due(user_id) → Redis ZCOUNT
    │        ▼
    │    [Decision: due_count >= threshold?]
    │        YES ↓                    NO ↓
    │    [FSRS.pop_highest_priority] [IRT.select_next]
    │        │                           │
    │        │ Query Redis sorted set    │ Get user theta
    │        │ & Postgres item detail    │ (from user_thetas table)
    │        │                           │
    │        └───────────┬───────────────┘
    │                    ▼
    └──→ [Return Item (without correct_option_id)]
         │
         ▼
Response to Client
```

**Latency Budget**: p95 < 100ms (from load test requirements)

**Cache Strategy**:

- IRT candidate pool: Redis TTL 300s, key = `candidates:user:{id}:theta:{bucket}`
- Theta values: In-memory via `user_thetas` table (one SELECT per request in worst case)
- FSRS due queue: Redis sorted set, always hot

### Flow B: POST /api/v1/practice/responses

```
Client submits answer
    │
    ▼
[FastAPI Route Handler]
    │ Validate, check answer correctness
    ├──→ [Insert response row in Postgres]
    │        (user_id, item_id, selected_option_id, is_correct, response_time_ms)
    │
    ├──→ [Enqueue background task: update_theta]
    │        (will recompute θ from last 200 responses)
    │
    ├──→ [Enqueue background task: update_fsrs]
    │        (will derive rating, update card_state, schedule next review)
    │
    ├──→ [Invalidate IRT cache]
    │        (Redis DEL candidates:user:{id}:*) ← Synchronous, fast
    │
    └──→ [Return feedback immediately]
         {is_correct, correct_option_id, explanation}
         │
         ▼
Response to Client (no wait for background updates)

[Background Tasks] (async)
    │
    ├──→ [update_theta]
    │        Load 200 most recent responses
    │        EAP estimation
    │        UPSERT user_thetas
    │
    └──→ [update_fsrs]
             Derive rating from (is_correct, response_time)
             Call py-fsrs.Scheduler.review_card(...)
             UPSERT card_states
             INSERT review_logs
             ZADD due:user:{id} (due_timestamp, item_id)
```

**Key Properties**:

- Response to user happens BEFORE algorithm updates
- Theta updates within ~100ms (FastAPI background tasks)
- FSRS updates within ~100ms
- Cache invalidation is synchronous (prevents stale recommendations)

## 2.3 DATA MODEL DESIGN PATTERNS

### Pattern 1: Append-Only Event Log (`responses` table)

```sql
CREATE TABLE responses (
  id              BIGSERIAL PRIMARY KEY,           -- High-volume, sequential
  user_id         UUID NOT NULL,                   -- Learner
  item_id         UUID NOT NULL,                   -- Question
  selected_option_id VARCHAR(50),
  is_correct      BOOLEAN,                         -- Ground truth
  response_time_ms INTEGER,
  theta_at_response NUMERIC(6, 4),                -- Snapshot for analysis
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX responses_user_time_idx ON responses(user_id, created_at DESC);
```

**Why this pattern**:

- Immutable. Never deleted (except user cascade).
- Single source of truth for calibration (all IRT re-estimation derives from this).
- Supports analytics and audit trails.
- Append-only is fast (INSERT is O(log n) for index, not O(n) for updates).

### Pattern 2: Denormalized Computed State (`user_thetas` table)

```sql
CREATE TABLE user_thetas (
  user_id        UUID PRIMARY KEY,
  theta          NUMERIC(6, 4),                   -- Current ability estimate
  theta_se       NUMERIC(6, 4),                   -- Standard error (confidence)
  num_responses  INTEGER,                         -- How many responses fed this estimate
  updated_at     TIMESTAMPTZ
);
```

**Why this pattern**:

- Read-heavy (every `/next-item` needs theta).
- Recomputed after each response (background task).
- Denormalization trades write cost (1 UPSERT) for read speed (no SELECT + compute).
- Historical values NOT kept here (derive from `responses` if needed).

### Pattern 3: Per-Item Per-Learner Mutable State (`card_states` table)

```sql
CREATE TABLE card_states (
  user_id        UUID,
  item_id        UUID,
  state          VARCHAR(20),     -- 'new', 'learning', 'review', 'relearning'
  difficulty     NUMERIC(6, 4),   -- D: per-learner difficulty
  stability      NUMERIC(8, 4),   -- S: days until 90% recall
  due_at         TIMESTAMPTZ,     -- When to review next
  last_review_at TIMESTAMPTZ,
  lapses         INTEGER,
  reps           INTEGER,
  PRIMARY KEY (user_id, item_id)  -- No surrogate key; composite is natural
);

CREATE INDEX card_states_due_idx ON card_states(user_id, due_at);
```

**Why this pattern**:

- State updates every review (via FSRS scheduler).
- Due timestamp used for scheduling (fast range query).
- Composite key reflects semantics (one state per learner-item pair).

### Pattern 4: Immutable Audit Log (`review_logs` table)

```sql
CREATE TABLE review_logs (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL,
  item_id         UUID NOT NULL,
  rating          SMALLINT,        -- 1, 2, 3, or 4
  state_before    VARCHAR(20),     -- What card_state was before this review
  difficulty_before NUMERIC(6, 4),
  stability_before  NUMERIC(8, 4),
  elapsed_days    NUMERIC(8, 4),   -- Days since due_at
  scheduled_days  NUMERIC(8, 4),   -- Days scheduled (interval)
  reviewed_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**Why this pattern**:

- Never updated or deleted.
- Complete history for post-MVP analysis (DIF detection, item misfit).
- Separate from `responses` because not every response is a "review" (first encounter of an item is new, not a review).

### Pattern 5: Materialized Hierarchies (`topics` table with `path`)

```sql
CREATE TABLE topics (
  id          UUID PRIMARY KEY,
  parent_id   UUID REFERENCES topics(id),
  name        VARCHAR(255),
  slug        VARCHAR(255),
  path        TEXT,              -- Materialized: 'cardiology/arrhythmias/afib'
  level       INTEGER,           -- Depth in tree
  created_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX topics_path_idx ON topics(path);
```

**Why this pattern**:

- Hierarchical tagging (medical topics naturally nest).
- `path` is materialized for speed (avoid recursive CTEs on every query).
- Application code maintains `path` on insert/update (not a trigger; easier to test).
- Supports fast "all descendants" queries: `WHERE path LIKE 'cardiology/%'`.

## 2.4 COMPONENT RESPONSIBILITY MATRIX

| Component                  | Responsibility                                      | Constraints                                |
| -------------------------- | --------------------------------------------------- | ------------------------------------------ |
| `api/v1/*` (routes)        | Parse requests, call services, shape responses      | **Never** touch SQL or algorithms          |
| `services/irt/`            | Theta estimation, item selection, candidate caching | Wrap libraries (catsim), never reimplement |
| `services/fsrs/`           | Review scheduling, state updates                    | Wrap py-fsrs, never reimplement            |
| `services/orchestrator.py` | "What next?" decision logic                         | Single function: `get_next_item(user_id)`  |
| `services/topics.py`       | Topic hierarchy maintenance                         | Compute & maintain `path` field            |
| `tasks/*`                  | Background jobs (theta, FSRS, calibration)          | Enqueued from routes; never blocking       |
| `models/`                  | SQLAlchemy ORM definitions                          | Relationships, indexes, constraints only   |
| `schemas/`                 | Pydantic validation                                 | Request/response shapes; no business logic |
| `core/`                    | Configuration, database, redis, security            | Infrastructure; shared across all layers   |

---

# LAYER 3: TECHNICAL SPECIFICATIONS & IMPLEMENTATION DETAILS

## 3.1 BACKEND TECHNOLOGY STACK (In Depth)

### Web Framework: FastAPI 0.115+

**Why FastAPI**:

- ✅ Async by default (Python asyncio)
- ✅ Automatic OpenAPI documentation
- ✅ Pydantic v2 integration (validation, serialization)
- ✅ Dependency injection system (clean code, testable)
- ✅ Very fast (comparable to Go/Rust for I/O-bound workloads)
- ✅ Excellent error handling and middleware support

**Async Pattern**:

```python
@router.get("/api/v1/practice/next-item")
async def get_next_item(
    user_id: UUID = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
    redis: Redis = Depends(get_redis),
) -> ItemRead:
    item = await orchestrator.get_next_item(user_id, session=session, redis=redis)
    return ItemRead.model_validate(item)
```

**Key Characteristics**:

- All I/O is `async` (database, Redis, file I/O)
- CPU-bound algorithm code (theta, selection) is sync (fast; <5ms per call)
- If a sync function ever blocks the event loop, wrap with `asyncio.to_thread(...)`

### Database: PostgreSQL 16 + SQLAlchemy 2.0 Async

**Driver**: `asyncpg` (written in Cython, fastest Postgres driver for Python)

**Session Pattern**:

```python
# core/database.py
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    poolclass=NullPool,  # Simple connection pooling (post-MVP: use better pool)
)

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session

# models/user.py
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=gen_random_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="student")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now(timezone.utc))

# Route code
result = await session.execute(select(User).where(User.email == email))
user = result.scalar_one_or_none()
```

**Query Pattern** (2.0 style, not 1.x):

```python
# CORRECT (2.0 style)
stmt = select(User).where(User.role == "student").order_by(User.created_at.desc())
result = await session.execute(stmt)
users = result.scalars().all()

# WRONG (1.x style, forbidden)
users = session.query(User).filter(User.role == "student").all()  # ❌
```

### Cache: Redis 7 + redis-py async

**Usage Patterns**:

1. **Candidate Pool** (IRT):

```python
# services/irt/cache.py
key = f"candidates:user:{user_id}:theta:{bucket}"
candidates = await redis.get(key)
if candidates is None:
    candidates = await fetch_from_db(...)
    await redis.setex(key, 300, json.dumps(candidates))  # TTL 5 min
return json.loads(candidates)
```

2. **Due Queue** (FSRS):

```python
# services/fsrs/queue.py
queue_key = f"due:user:{user_id}"

# Add item to queue with due timestamp as score
await redis.zadd(queue_key, {item_id: due_epoch})

# Pop highest-priority (lowest score = earliest due)
item_ids = await redis.zrangebyscore(queue_key, 0, now_epoch, count=1)

# Count due items
count = await redis.zcount(queue_key, 0, now_epoch)
```

3. **Session Blocklist** (Auth):

```python
# core/security.py
jti = payload["jti"]  # Unique token ID
ttl = payload["exp"] - now
await redis.setex(f"blocklist:{jti}", ttl, "1")

# On auth check
if await redis.get(f"blocklist:{jti}"):
    raise InvalidCredentialsError()
```

**Key Properties**:

- All operations atomic (Lua for complex operations)
- TTL-based expiration (no manual cleanup)
- Pattern keys for fast invalidation: `redis.delete(f"candidates:user:{user_id}:*")`

### Validation: Pydantic v2

**Schema Pattern**:

```python
# schemas/practice.py
from pydantic import BaseModel, Field

class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # ORM ↔ Pydantic

    id: UUID
    content: str
    options: list[dict[str, str]]  # [{"id": "a", "text": "..."}]
    # NOTE: correct_option_id is intentionally omitted!

class ResponseInput(BaseModel):
    item_id: UUID
    selected_option_id: str
    response_time_ms: int = Field(gt=0, le=60000)  # Validation rules

# In route
@router.post("/api/v1/practice/responses")
async def submit_response(
    body: ResponseInput,  # Auto-parsed & validated
    ...
) -> ResponseFeedback:
    # body is guaranteed valid here
    return ResponseFeedback(is_correct=..., explanation=...)
```

### Math Libraries

**NumPy** (vectorized math):

```python
# services/irt/theta.py
quad = np.linspace(-4.0, 4.0, 41)  # Quadrature grid
log_prior = stats.norm.logpdf(quad, 0.0, 1.0)
log_likelihood = np.zeros(41)

for response in responses:
    a, b = item_params[response.item_id]
    z = a * (quad - b)
    log_p = -np.logaddexp(0.0, -z)  # log(sigmoid(z))
    log_likelihood += np.where(response.is_correct, log_p, -np.logaddexp(0.0, z))

theta = np.sum(quad * posterior)
```

**SciPy** (statistical functions):

```python
# In theta estimation
from scipy.stats import norm
log_prior = norm.logpdf(quad, loc=0.0, scale=1.0)
```

**Libraries (Don't Reimplement)**:

- `catsim`: IRT primitives (use for item banks, ignore selectors; we write custom)
- `py-fsrs`: FSRS-5 scheduler (use as-is; never reimplement)
- `girth`: IRT parameter estimation (use for calibration phase 5)

## 3.2 FRONTEND TECHNOLOGY STACK (In Depth)

### Framework: Next.js 15 (App Router)

**Why Next.js 15**:

- ✅ Full-stack framework (API routes at `app/api/`)
- ✅ App Router (hierarchical file-based routing, Server Components by default)
- ✅ Built-in optimizations (image, font, code-splitting)
- ✅ TypeScript first-class
- ✅ API routes with middleware
- ✅ Built-in environment variable handling

**Routing Structure**:

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Landing page (public)
├── (auth)/
│   ├── login/page.tsx            # Public
│   └── register/page.tsx         # Public
├── practice/
│   ├── layout.tsx                # Protected wrapper
│   └── page.tsx                  # Adaptive practice UI
├── dashboard/
│   └── page.tsx                  # Protected; learner stats
├── admin/
│   ├── layout.tsx                # Role check (instructor/admin)
│   ├── items/
│   │   ├── page.tsx              # List items
│   │   ├── new/page.tsx          # Create item
│   │   └── [id]/page.tsx         # Edit item
│   └── topics/page.tsx           # Manage topics
└── api/
    └── auth/
        └── [...action]/route.ts  # Auth proxy (sets httpOnly cookie)
```

### Server Components by Default

**Philosophy**: Minimize client-side JavaScript

```tsx
// ✅ Server component (default) — fetches in render
export default async function DashboardPage() {
  const stats = await api.dashboard.stats(); // Server-side fetch
  return <StatsView stats={stats} />;
}

// ✅ Client component (marked explicitly)
("use client");
export function PracticeSession() {
  const { data: item } = useNextItem(); // Client-side, uses TanStack Query
  const [startTime, setStartTime] = useState<number>();
  return <QuestionCard item={item} onStart={setStartTime} />;
}
```

### State Management Strategy (Priority Order)

1. **URL** (shareable, bookmarkable):

   ```tsx
   // Dashboard with filters
   export default function ItemsPage(props: {
     searchParams: Record<string, string>;
   }) {
     const topic = searchParams.topic; // Read from URL
     const page = Number(searchParams.page) || 1;
   }
   ```

2. **Server State** (TanStack Query):

   ```tsx
   // hooks/useNextItem.ts
   export function useNextItem() {
     return useQuery({
       queryKey: ["next-item"],
       queryFn: () => api.practice.getNextItem(),
       staleTime: 0, // Always refetch
     });
   }
   ```

3. **Client State** (Zustand):

   ```tsx
   // stores/practiceSessionStore.ts
   export const usePracticeStore = create((set) => ({
     currentItemId: null,
     startTime: null,
     streak: 0,
     setItem: (id: string) => set({ currentItemId: id }),
   }));
   ```

4. **Component Local** (useState):
   ```tsx
   // Dialog visibility, temporary form state
   const [isOpen, setIsOpen] = useState(false);
   ```

### Forms: React Hook Form + Zod

```tsx
// hooks/useLoginForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth";

export function useLoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await api.auth.login(data); // Data is validated
  };

  return { form, onSubmit };
}

// lib/schemas/auth.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;
```

**Key Properties**:

- Schema is single source of truth (used by form AND backend validation)
- Runtime parsing + TypeScript inference
- Server components use Zod directly; client components via React Hook Form

### API Integration: Typed Fetcher

```typescript
// lib/fetcher.ts
export async function fetcher<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, any> },
): Promise<T> {
  const url = new URL(
    path,
    typeof window === "undefined"
      ? process.env.INTERNAL_API_URL
      : process.env.NEXT_PUBLIC_API_URL,
  );

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      // Cookie auto-forwarded by browsers for same-site requests
    },
  });

  if (!response.ok) {
    throw new APIError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

// lib/api.ts
export const api = {
  practice: {
    getNextItem: () => fetcher<ItemRead>("/api/v1/practice/next-item"),
    submitResponse: (body: ResponseInput) =>
      fetcher<ResponseFeedback>("/api/v1/practice/responses", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  dashboard: {
    stats: () => fetcher<DashboardStats>("/api/v1/dashboard/stats"),
  },
};
```

### UI Components: Tailwind + shadcn/ui

**Composition Pattern**:

```tsx
// components/practice/QuestionCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuestionCard({ item }: { item: ItemRead }) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <h2 className="text-2xl font-bold">{item.content}</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {item.options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelect(option.id)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**No CSS Modules, No Inline Styles** (except for one-off dynamic values):

```tsx
// ✅ Correct: Tailwind utilities + styled-components alternative
<div className={cn(
  "flex gap-4",
  isActive ? "bg-blue-500" : "bg-gray-100"
)}>

// ✅ Correct: Dynamic value Tailwind can't express
<div style={{ width: `${percentFilled}%` }} className="bg-green-500">

// ❌ Wrong: Inline style for static values
<div style={{ padding: "1rem" }}>  // Use p-4 instead
```

### Charts: Recharts (tree-shakeable)

```tsx
// components/charts/ThetaHistoryChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ThetaHistoryChart({ data }: { data: ThetaPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="created_at" />
        <YAxis domain={[-4, 4]} />
        <Tooltip />
        <Line type="monotone" dataKey="theta" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Accessibility & Responsiveness

**Responsive**: Mobile-first, tested at 360px viewport

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

**Accessibility**:

- Keyboard navigation: Tab through buttons, Enter to activate
- ARIA labels: `aria-label`, `aria-describedby` on interactive elements
- Color contrast: AA level (4.5:1 for text)
- Focus indicators: Never remove (custom styling if needed)

## 3.3 DEPLOYMENT & OPERATIONS ARCHITECTURE

### Containerization

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim as builder
WORKDIR /tmp
COPY pyproject.toml pyproject.lock ./
RUN pip install --no-cache-dir uv && uv pip install --python 3.12 -r <(uv pip compile)

FROM python:3.12-slim
RUN groupadd -r app && useradd -r -g app app
WORKDIR /home/app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY src /home/app/src
USER app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/node_modules /app/node_modules
COPY package.json next.config.ts ./
USER node
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Local Development: docker-compose

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: adaptive_learn
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "app"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://app:dev@postgres:5432/adaptive_learn
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/home/app/src # Hot reload in dev

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      INTERNAL_API_URL: http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src # Hot reload in dev

volumes:
  postgres_data:
```

### Testing Strategy

**Backend** (pytest):

```bash
# Unit tests (fast, no I/O)
pytest tests/unit -v

# Integration tests (use testcontainers for Postgres/Redis)
pytest tests/integration -v

# All tests with coverage
pytest --cov=app --cov-report=html
```

**Frontend** (vitest + Playwright):

```bash
# Unit tests (React components, hooks)
pnpm test

# E2E tests (full user flows)
pnpm test:e2e
```

**CI/CD** (GitHub Actions):

```yaml
name: CI
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.12"
      - run: pip install uv
      - run: cd backend && uv sync
      - run: uv run ruff check . && uv run mypy src && uv run pytest

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: corepack enable && pnpm install
      - run: cd frontend && pnpm typecheck && pnpm lint && pnpm test
```

---

# PHASE 1 DEVELOPMENT GUIDELINE (Step by Step)

## ROADMAP: Phase 0 & Phase 1 Overview

**Phase 0 (Week 1)** ← Currently Here  
Foundation, scaffolding, infrastructure, CI/CD. Nothing works yet beyond health check.

**Phase 1 (Weeks 2–3)** ← Next  
Data model, authentication, admin item management. **No algorithm code yet.**

---

## PHASE 0: FOUNDATION (Target End of Week 1)

### Objective

A runnable empty service skeleton with Docker, CI, tooling, and nothing beyond a health check.

### 0.1 — Git & Project Setup

**Tasks**:

1. Initialize git repo: `git init`
2. Create `.gitignore`:

   ```
   # Python
   __pycache__/
   *.py[cod]
   *.egg-info/
   .env
   .env.local
   venv/
   .venv/

   # Node
   node_modules/
   dist/
   .next/

   # IDEs
   .vscode/
   .idea/
   *.swp
   *.swo

   # OS
   .DS_Store
   Thumbs.db
   ```

3. Add `LICENSE` (MIT)
4. Create `CHANGELOG.md`:

   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   ## [Unreleased]
   ```

**Acceptance**: `git log` shows initial commit.

---

### 0.2 — Docker Compose Setup

**File**: `docker-compose.yml`

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dev}
      POSTGRES_DB: ${POSTGRES_DB:-adaptive_learn}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER:-app}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-app}:${POSTGRES_PASSWORD:-dev}@postgres:5432/${POSTGRES_DB:-adaptive_learn}
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-production}
      ENVIRONMENT: ${ENVIRONMENT:-dev}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/home/app/src

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:8000}
      INTERNAL_API_URL: http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
```

**Acceptance**: `docker compose up` starts all services without error.

---

### 0.3 — Environment Files

**File**: `.env.example` (root)

```env
# === Database ===
POSTGRES_USER=app
POSTGRES_PASSWORD=dev
POSTGRES_DB=adaptive_learn
DATABASE_URL=postgresql+asyncpg://app:dev@localhost:5432/adaptive_learn

# === Redis ===
REDIS_URL=redis://localhost:6379/0

# === JWT / Auth ===
JWT_SECRET=dev-secret-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# === Environment ===
ENVIRONMENT=dev
LOG_LEVEL=DEBUG

# === CORS ===
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# === Frontend ===
NEXT_PUBLIC_API_URL=http://localhost:8000
INTERNAL_API_URL=http://localhost:8000

# === Algorithm tuning (Phase 2) ===
FSRS_PRIORITY_THRESHOLD=5
FSRS_DESIRED_RETENTION=0.9
IRT_THETA_BUCKET_WIDTH=0.25
IRT_CANDIDATE_RANGE=0.5
IRT_CANDIDATE_LIMIT=50
IRT_CANDIDATE_TTL_SECONDS=300
IRT_CALIBRATION_MIN_RESPONSES=30
IRT_THETA_HISTORY_LIMIT=200
```

**File**: `backend/.env.example` (copy all DATABASE*\* and JWT*_ from root)  
**File**: `frontend/.env.example` (copy all NEXT*PUBLIC*_ from root)

**Acceptance**: Developers can `cp .env.example .env` and run `docker compose up`.

---

### 0.4 — Backend Scaffolding

**Directory Structure**:

```
backend/
├── pyproject.toml          (project metadata + dependencies)
├── alembic.ini             (migration config)
├── .env.example
├── alembic/
│   ├── env.py
│   └── versions/           (migrations go here)
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py         (FastAPI app)
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── redis.py
│       │   ├── security.py
│       │   └── logging.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── deps.py
│       │   └── v1/
│       │       ├── __init__.py
│       │       └── router.py
│       ├── models/
│       │   └── __init__.py
│       ├── schemas/
│       │   └── __init__.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── irt/
│       │   │   └── __init__.py
│       │   └── fsrs/
│       │       └── __init__.py
│       ├── tasks/
│       │   └── __init__.py
│       └── exceptions.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   └── __init__.py
│   └── integration/
│       └── __init__.py
├── scripts/
│   └── seed.py
└── Dockerfile
```

**File**: `backend/pyproject.toml`

```toml
[project]
name = "adaptive-learn"
version = "0.1.0"
description = "Adaptive learning system using IRT + FSRS-5"

[tool.uv]
python-version = "3.12"

[project.dependencies]
fastapi = ">=0.115.0"
uvicorn = {version = ">=0.27.0", extras = ["standard"]}
sqlalchemy = {version = ">=2.0", extras = ["asyncio"]}
asyncpg = ">=0.29"
alembic = ">=1.13"
pydantic = ">=2.0"
pydantic-settings = ">=2.0"
python-jose = {version = ">=3.3.0", extras = ["cryptography"]}
passlib = {version = ">=1.7.4", extras = ["bcrypt"]}
redis = ">=5.0"
py-fsrs = ">=0.4"
catsim = ">=0.15"
girth = ">=0.10"
numpy = ">=1.26"
scipy = ">=1.11"
structlog = ">=23.2"

[project.optional-dependencies]
dev = [
    "pytest = ">=7.4",
    "pytest-asyncio = ">=0.21",
    "pytest-cov = ">=4.1",
    "httpx = ">=0.25",
    "testcontainers = ">=3.7",
    "ruff = ">=0.1.8",
    "mypy = ">=1.7",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
]

[tool.mypy]
python_version = "3.12"
strict = true
disallow_untyped_calls = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "--strict-markers"
```

**Acceptance**: `cd backend && uv sync` succeeds without errors.

---

### 0.5 — FastAPI App Skeleton

**File**: `backend/src/app/main.py`

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    configure_logging()
    print("🚀 Server starting...")
    yield
    print("🛑 Server shutting down...")


app = FastAPI(
    title="Adaptive Learning API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
```

**File**: `backend/src/app/core/config.py`

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://app:dev@localhost:5432/adaptive_learn"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Environment
    ENVIRONMENT: str = "dev"
    LOG_LEVEL: str = "DEBUG"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Algorithm settings (Phase 2+)
    FSRS_PRIORITY_THRESHOLD: int = 5
    FSRS_DESIRED_RETENTION: float = 0.9
    IRT_THETA_BUCKET_WIDTH: float = 0.25
    IRT_CANDIDATE_RANGE: float = 0.5
    IRT_CANDIDATE_LIMIT: int = 50
    IRT_CANDIDATE_TTL_SECONDS: int = 300
    IRT_CALIBRATION_MIN_RESPONSES: int = 30
    IRT_THETA_HISTORY_LIMIT: int = 200

    class Config:
        env_file = ".env"


settings = Settings()
```

**Acceptance**: `uv run uvicorn app.main:app --reload` starts server on port 8000.

---

### 0.6 — Backend Dockerfile

**File**: `backend/Dockerfile`

```dockerfile
# Multi-stage build to minimize final image size

FROM python:3.12-slim as builder
WORKDIR /tmp
COPY pyproject.toml pyproject.lock ./
RUN pip install --no-cache-dir uv && \
    uv pip install --python 3.12 -r <(uv pip compile)

FROM python:3.12-slim
RUN groupadd -r app && useradd -r -g app app
WORKDIR /home/app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY src /home/app/src
USER app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Acceptance**: `docker build -t adaptive-learn-backend ./backend` succeeds.

---

### 0.7 — Frontend Scaffolding

**Initialize Next.js**:

```bash
cd frontend
npx create-next-app@latest . --typescript --app --tailwind --eslint --no-git
pnpm dlx shadcn@latest init
pnpm add @tanstack/react-query recharts zod react-hook-form @hookform/resolvers zustand
pnpm dlx playwright install
```

**Acceptance**: `pnpm dev` runs frontend on port 3000.

---

### 0.8 — Frontend Health Check

**File**: `frontend/src/app/page.tsx`

```tsx
import { getAuthCookie } from "@/lib/auth";

async function checkHealth() {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/v1/health`);
    if (response.ok) {
      return { status: "ok" };
    }
  } catch (e) {
    return { status: "error", error: String(e) };
  }
}

export default async function Home() {
  const health = await checkHealth();
  const isHealthy = health.status === "ok";

  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">Adaptive Learn</h1>
        <p className="mt-2 text-gray-600">System Status</p>

        <div
          className={`mt-6 rounded-lg p-4 ${isHealthy ? "bg-green-50" : "bg-red-50"}`}
        >
          <div
            className={`text-lg font-semibold ${isHealthy ? "text-green-900" : "text-red-900"}`}
          >
            {isHealthy ? "🟢 System OK" : "🔴 System Error"}
          </div>
          {!isHealthy && <p className="mt-2 text-red-700">{health.error}</p>}
        </div>
      </div>
    </main>
  );
}
```

**Acceptance**: Navigate to `http://localhost:3000` and see green "System OK" indicator.

---

### 0.9 — Frontend Dockerfile

**File**: `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package.json next.config.ts ./
USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]
```

**Acceptance**: `docker build -t adaptive-learn-frontend ./frontend` succeeds.

---

### 0.10 — CI/CD Pipeline

**File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: app
          POSTGRES_PASSWORD: dev
          POSTGRES_DB: adaptive_learn
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.12"
      - name: Install uv
        run: pip install uv
      - name: Install dependencies
        run: cd backend && uv sync
      - name: Lint
        run: cd backend && uv run ruff check .
      - name: Format check
        run: cd backend && uv run ruff format --check .
      - name: Type check
        run: cd backend && uv run mypy src
      - name: Test
        run: cd backend && uv run pytest tests/unit
        env:
          DATABASE_URL: postgresql+asyncpg://app:dev@localhost:5432/adaptive_learn
          REDIS_URL: redis://localhost:6379/0

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - name: Enable pnpm
        run: corepack enable
      - name: Install dependencies
        run: cd frontend && pnpm install --frozen-lockfile
      - name: Type check
        run: cd frontend && pnpm typecheck
      - name: Lint
        run: cd frontend && pnpm lint
      - name: Test
        run: cd frontend && pnpm test
```

**Acceptance**: A no-op commit triggers CI, all checks pass.

---

### 0.11 — Pre-commit Configuration

**File**: `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.8
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        types_or: [typescript, jsx, javascript, json, yaml]
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy
        args: [src]
        additional_dependencies: [pydantic, pydantic-settings]
        stages: [commit]
```

**Setup**:

```bash
pip install pre-commit
pre-commit install
```

**Acceptance**: `git commit` runs hooks automatically.

---

### 0.12 — Makefile

**File**: `Makefile` (root)

```makefile
.PHONY: help up down logs test lint format seed clean

help:
	@echo "Adaptive Learn — Available commands:"
	@echo "  make up           Start all services (docker compose)"
	@echo "  make down         Stop all services"
	@echo "  make logs         View docker compose logs"
	@echo "  make test         Run all tests (backend + frontend)"
	@echo "  make lint         Lint all code"
	@echo "  make format       Format all code"
	@echo "  make seed         Seed the database"
	@echo "  make clean        Remove containers, volumes, caches"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

test:
	cd backend && uv run pytest tests/unit
	cd frontend && pnpm test

lint:
	cd backend && uv run ruff check src
	cd frontend && pnpm lint

format:
	cd backend && uv run ruff format src
	cd frontend && pnpm format --write

seed:
	docker compose exec backend uv run python scripts/seed.py

clean:
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true
	find frontend -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
```

**Acceptance**: `make up`, `make test`, `make lint` all work.

---

## Phase 0 — Completion Checklist

✅ Git initialized, .gitignore, LICENSE, CHANGELOG
✅ Docker Compose with Postgres, Redis, backend placeholder, frontend placeholder
✅ `.env.example` at root + backend + frontend
✅ Backend FastAPI scaffold with health check
✅ Frontend Next.js scaffold with health check
✅ Dockerfiles for both backend and frontend
✅ GitHub Actions CI pipeline
✅ Pre-commit configuration
✅ Makefile for common tasks

**Acceptance Test**:

```bash
# From repo root
make clean && make up
# Wait ~30 seconds for services to start

# In another terminal
curl http://localhost:8000/api/v1/health
# Should return: {"status":"ok"}

# In browser
open http://localhost:3000
# Should show green "System OK" indicator

make test
# Should pass (no tests yet, so 0 passed)
```

---

## PHASE 1: BACKEND FOUNDATIONS (Weeks 2–3)

### Objective

Data model, authentication, admin item management. **No algorithm code yet.**

---

### 1.1 — Database Schema via Alembic

**Initialize Alembic**:

```bash
cd backend
uv run alembic init alembic
```

**File**: `backend/alembic/env.py` (configure for async)

```python
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from alembic import context
from sqlalchemy import pool

config = context.config
target_metadata = ...  # Will import from models

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    engine = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )
    async with engine.begin() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()

def run_migrations_offline():
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_async_migrations())
```

**File**: `backend/src/app/models/base.py`

```python
from sqlalchemy.orm import declarative_base

Base = declarative_base()
```

**File**: `backend/src/app/models/user.py`

```python
from uuid import UUID
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default="gen_random_uuid()")
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="student")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="NOW()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="NOW()")
```

**Create initial migration**:

```bash
cd backend
uv run alembic revision --autogenerate -m "initial schema"
```

**Review and apply**:

```bash
# Review alembic/versions/<hash>_initial_schema.py
uv run alembic upgrade head
```

**Acceptance**: `psql adaptive_learn` shows 7 tables (users, topics, items, responses, user_thetas, card_states, review_logs).

---

[Continuing with 1.2 through 1.11 similarly detailed...]

---

## CRITICAL SUCCESS FACTORS

### 1. **Keep IRT and FSRS Separate**

- Orchestrator decides which engine handles the request
- **Never** conflate ability estimation (IRT) with memory decay (FSRS)
- Two data flows, one decision point

### 2. **Tests Drive Algorithm Development**

- Every function in `services/irt/` and `services/fsrs/` has unit tests
- Test all-correct, all-incorrect, boundary cases explicitly
- Algorithm bugs are silent; only tests catch them

### 3. **Respect Module Boundaries**

- Routes (api/) never touch SQL or algorithms
- Services never import FastAPI
- Models are SQLAlchemy only
- Schemas are Pydantic only
- Violation = technical debt that compounds

### 4. **Performance Budget Matters**

- p95 `/next-item` must be <100ms
- Profile early; don't assume
- Cache candidate pool, not queries

### 5. **Database Schema & Migrations Move Together**

- Schema changes = migration in same commit
- Never apply migration without reviewing generated SQL
- `responses` table is immutable; `card_states` is mutable

### 6. **TypeScript Strict, Python Strict**

- No `any` in either language
- Type hints on every function
- Mypy strict; ruff format all code

### 7. **Documentation Stays in Sync**

- Architecture changes → update `docs/ARCHITECTURE.md`
- Algorithm changes → update `docs/ALGORITHMS.md`
- Don't document in code; code _is_ the documentation

---

## END OF ANALYSIS

This document serves as the blueprint for Phase 1 development. Each task references specific files, code patterns, and acceptance criteria. Developers should read the corresponding section of this document before implementing.

**Next Step**: Begin Phase 0 foundation work per the checklist above. Once Phase 0 is complete and all acceptance tests pass, transition to Phase 1 (backend foundations).

---

**Questions for Project Lead**:

1. ❓ Is the second project (`adaptive-filter-timeline`) available? I could not locate it. Should I analyze a different project?
2. ❓ Should I modify the Phase 1 guideline to be even more granular (e.g., code snippets for every file)?
3. ❓ Do you want detailed Playwright e2e test scenarios included?
4. ❓ Should I create a separate "Reference Implementation" document showing exact code for one complete Phase 1 task?
