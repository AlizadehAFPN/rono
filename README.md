# Synapse — Adaptive Learning Platform

Medical education platform using IRT (Item Response Theory) + FSRS-5 spaced repetition.

## Quick Start

```bash
cp .env.example .env
make up
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | View logs |
| `make test` | Run tests |
| `make lint` | Lint code |

## Stack

- **Backend**: Python 3.13, FastAPI, PostgreSQL 16, Redis 7
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Algorithms**: IRT (ability estimation) + FSRS-5 (spaced repetition)
