# Rono AWS Infrastructure — Setup Guide

## Architecture Overview

```
Internet
    │
    ▼
 AWS ALB (Public)
    │
    ├── /api/*  ──────────────► ECS Fargate: Backend (FastAPI)
    │                                │
    └── /*  ───────────────────► ECS Fargate: Frontend (Next.js)
                                     │
                                (proxies /api/* internally via
                                 ECS Service Connect → backend:8000)

ECS Tasks (private subnets)
    ├── Backend → RDS PostgreSQL (private)
    └── Backend → ElastiCache Redis (private)
```

**Key decisions:**
- **ECS Fargate**: serverless containers, no EC2 to manage
- **ECS Service Connect**: frontend reaches backend at `http://backend:8000` internally
- **GitHub OIDC**: no static AWS keys ever stored in GitHub
- **Secrets Manager**: DB URL, Redis URL, JWT secret — all injected at runtime
- **ECS circuit breaker**: bad deploys auto-rollback before serving traffic
- **Auto-scaling**: CPU/memory-based scaling, 70% CPU target

---

## One-Time Setup

### Step 1 — Configure AWS Profile

You need access keys for the Rono account (646167485518):

1. In the AWS Console, go to **IAM → Users → alizadeh_Rono → Security credentials**
2. Click **Create access key** → CLI → copy both keys
3. Configure the profile locally:

```bash
aws configure --profile rono
# AWS Access Key ID: <your key>
# AWS Secret Access Key: <your secret>
# Default region: eu-north-1
# Default output: json
```

Verify:
```bash
aws sts get-caller-identity --profile rono
# Should show Account: "646167485518"
```

### Step 2 — Bootstrap Terraform State

This creates the S3 bucket and DynamoDB table that store Terraform state:

```bash
make aws-bootstrap
```

### Step 3 — Update GitHub Config

Edit `infra/terraform/environments/shared/terraform.tfvars`:

```hcl
github_org  = "YOUR_GITHUB_USERNAME"   # e.g. "farzad-alizadeh"
github_repo = "Rono"
```

### Step 4 — Apply Shared Infrastructure (ECR + GitHub OIDC)

```bash
make tf-init env=shared
make tf-apply env=shared
```

This creates:
- ECR repos: `rono/backend` and `rono/frontend`
- IAM roles for GitHub Actions (OIDC, no static keys)

Note the outputs — you'll need the role ARNs for GitHub.

### Step 5 — Apply Staging

```bash
make tf-init env=staging
make tf-apply env=staging
```

Takes ~10 minutes (RDS, ElastiCache take the longest).

The output will show: `alb_url = "http://rono-staging-alb-XXXX.eu-north-1.elb.amazonaws.com"`

### Step 6 — Apply Production

```bash
make tf-init env=prod
make tf-apply env=prod
```

### Step 7 — Configure GitHub Repository

#### 7a. Push your repo to GitHub

```bash
git remote add origin https://github.com/YOUR_ORG/Rono.git
git push -u origin main
```

Create a `staging` branch:
```bash
git checkout -b staging
git push -u origin staging
```

#### 7b. Configure GitHub Environments

Go to **GitHub → Settings → Environments**:

1. Create environment: **`staging`**
   - No protection rules (auto-deploy on push to `staging` branch)

2. Create environment: **`production`**
   - Add protection rule: **Required reviewers** (add yourself)
   - This means prod deploys require manual approval

#### 7c. No secrets needed!

Because we use OIDC, GitHub Actions authenticates via IAM roles — no AWS keys to store.
The role ARNs are hardcoded in the workflow files (they're not sensitive).

---

## Daily Workflow

### Push to staging

```bash
git checkout staging
git merge main   # or your feature branch
git push origin staging
# GitHub Actions auto-builds and deploys to staging
# Takes ~5-8 minutes
```

### Push to production

```bash
git checkout main
git merge staging
git push origin main
# GitHub Actions builds → waits for approval in GitHub UI → deploys
```

### Create and run a migration locally

```bash
make migration msg="add_new_column_to_users"
# Edit the generated file in backend/alembic/versions/
make migrate
```

### Run migration on AWS (emergency manual run)

```bash
make aws-migrate env=staging
make aws-migrate env=prod
```

### View live logs

```bash
make aws-logs env=staging svc=backend
make aws-logs env=prod svc=frontend
```

### Open a shell inside a running container

```bash
make aws-exec env=staging svc=backend
# Opens /bin/sh inside the backend container
```

---

## Environment Summary

| | Staging | Production |
|---|---|---|
| Backend CPU | 0.25 vCPU | 0.5 vCPU |
| Backend Memory | 512 MB | 1 GB |
| Backend Tasks | 1 (min 1, max 3) | 2 (min 2, max 10) |
| Frontend CPU | 0.25 vCPU | 0.5 vCPU |
| RDS | db.t3.micro | db.t3.small (Multi-AZ) |
| Redis | cache.t3.micro | cache.t3.small |
| DB Backups | 3 days | 14 days |
| Deletion Protection | No | Yes |
| Log Level | DEBUG | INFO |

---

## Cost Estimate (eu-north-1, monthly)

| Service | Staging | Production |
|---|---|---|
| ECS Fargate (2 services) | ~$12 | ~$35 |
| ALB | ~$18 | ~$18 |
| RDS PostgreSQL | ~$15 | ~$50 |
| ElastiCache Redis | ~$12 | ~$25 |
| NAT Gateway | ~$35 | ~$35 |
| ECR storage | ~$1 | ~$1 |
| Secrets Manager | ~$1 | ~$1 |
| **Total** | **~$94/mo** | **~$165/mo** |

---

## Troubleshooting

### Migration failed in CI

View migration logs:
```bash
aws logs tail /ecs/rono-staging/migration --region eu-north-1 --profile rono
```

### Service unhealthy after deploy

ECS circuit breaker will auto-rollback. Check logs:
```bash
make aws-logs env=staging svc=backend
```

### "No space left" on ECS

Scale up task size in `infra/terraform/environments/staging/main.tf` → `backend_memory`.

### Connect to RDS directly (emergency)

ECS Exec into backend container, then use psql:
```bash
make aws-exec env=staging svc=backend
# Inside container:
# python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
```

---

## Adding a Custom Domain (when ready)

1. Register domain in Route 53 (or transfer existing)
2. Request ACM certificate (must be in same region)
3. Add HTTPS listener to ALB (modify `modules/alb/main.tf`)
4. Add Route 53 alias record pointing to ALB
5. Update `cors_origins` in environment `main.tf`
