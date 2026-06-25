# Rono — سامانه مرور سؤالات آزمون استخدامی

A bilingual (Persian/English, RTL) review system for Iran's employment exams
(آزمون استخدامی): a question bank of past-exam questions with smart, timed
review until everything sticks. The smart engine stays behind the scenes — the
user only sees the simple benefit (no technical jargon in any user-facing copy).

> See [RONO_EXAM_CONVERSION_PLAN.md](RONO_EXAM_CONVERSION_PLAN.md),
> [RONO_EXAM_TAXONOMY.md](RONO_EXAM_TAXONOMY.md), and the market report
> [RONO_EMPLOYMENT_EXAM_REPORT.html](RONO_EMPLOYMENT_EXAM_REPORT.html).

## Quick Start

```bash
cp .env.example .env
make up
make migrate
make seed          # demo institution + admin/student + a few questions
make seed-topics   # national subject taxonomy (7 general subjects + specialized)
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

Import a question set (past-paper JSON → question bank):

```bash
docker compose exec backend sh -c "PYTHONPATH=src uv run python scripts/import_questions.py scripts/data/estekhdami_general_starter.json"
```

## Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | View logs |
| `make seed` | Seed demo institution + users + sample questions |
| `make seed-topics` | Seed the employment-exam subject taxonomy |
| `make test` | Run tests |
| `make lint` | Lint code |

## Stack

- **Backend**: Python 3.13, FastAPI, PostgreSQL 16, Redis 7
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui (RTL, Vazirmatn)
- **Exams**: دستگاه‌های اجرایی · آموزش و پرورش · بانک‌ها · تأمین اجتماعی
