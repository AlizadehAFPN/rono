.PHONY: help up down logs test lint clean migrate migration shell-db seed \
        aws-bootstrap aws-profile tf-init tf-plan tf-apply \
        deploy-staging deploy-prod aws-migrate aws-logs aws-exec

AWS_PROFILE ?= rono

help:
	@echo ""
	@echo "── Local Development ──────────────────────────────────────────"
	@echo "  make up                    Start all services locally"
	@echo "  make down                  Stop all services"
	@echo "  make logs                  View logs"
	@echo "  make test                  Run all tests"
	@echo "  make lint                  Lint all code"
	@echo "  make clean                 Remove containers and volumes"
	@echo "  make migrate               Apply Alembic migrations (local)"
	@echo "  make migration msg=<name>  Create a new migration"
	@echo "  make seed                  Seed the database with demo data"
	@echo "  make shell-db              Open a Postgres shell"
	@echo ""
	@echo "── AWS Setup (run once) ───────────────────────────────────────"
	@echo "  make aws-bootstrap         Create S3 + DynamoDB for TF state"
	@echo "  make tf-init env=<env>     terraform init for environment"
	@echo "  make tf-plan env=<env>     terraform plan for environment"
	@echo "  make tf-apply env=<env>    terraform apply for environment"
	@echo ""
	@echo "── AWS Operations ─────────────────────────────────────────────"
	@echo "  make aws-migrate env=<env> Run Alembic migrations on ECS"
	@echo "  make aws-logs env=<env> svc=<backend|frontend>"
	@echo "  make aws-exec env=<env> svc=<backend|frontend>"
	@echo ""

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

test:
	cd backend && PYTHONPATH=src uv run pytest tests/unit
	cd frontend && npm test

lint:
	cd backend && uv run ruff check src
	cd frontend && npm run lint

clean:
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true

migrate:
	docker compose exec backend sh -c "PYTHONPATH=src uv run alembic upgrade head"

migration:
	@if [ -z "$(msg)" ]; then echo "Usage: make migration msg=\"your message\""; exit 1; fi
	docker compose exec backend sh -c "PYTHONPATH=src uv run alembic revision --autogenerate -m '$(msg)'"

seed:
	docker compose exec backend sh -c "PYTHONPATH=src uv run python scripts/seed.py"

shell-db:
	docker compose exec postgres psql -U app -d adaptive_learn

# ── AWS Infrastructure ──────────────────────────────────────────────────────────

aws-bootstrap:
	AWS_PROFILE=$(AWS_PROFILE) bash infra/scripts/bootstrap.sh

tf-init:
	@if [ -z "$(env)" ]; then echo "Usage: make tf-init env=<shared|staging|prod>"; exit 1; fi
	cd infra/terraform/environments/$(env) && terraform init

tf-plan:
	@if [ -z "$(env)" ]; then echo "Usage: make tf-plan env=<shared|staging|prod>"; exit 1; fi
	cd infra/terraform/environments/$(env) && AWS_PROFILE=$(AWS_PROFILE) terraform plan

tf-apply:
	@if [ -z "$(env)" ]; then echo "Usage: make tf-apply env=<shared|staging|prod>"; exit 1; fi
	cd infra/terraform/environments/$(env) && AWS_PROFILE=$(AWS_PROFILE) terraform apply

tf-destroy:
	@if [ -z "$(env)" ]; then echo "Usage: make tf-destroy env=<shared|staging|prod>"; exit 1; fi
	@echo "WARNING: This will DESTROY all $(env) infrastructure. Confirm: make tf-destroy env=$(env) confirm=yes"
	@if [ "$(confirm)" != "yes" ]; then exit 1; fi
	cd infra/terraform/environments/$(env) && AWS_PROFILE=$(AWS_PROFILE) terraform destroy

aws-migrate:
	@if [ -z "$(env)" ]; then echo "Usage: make aws-migrate env=<staging|prod>"; exit 1; fi
	AWS_PROFILE=$(AWS_PROFILE) bash infra/scripts/migrate.sh $(env)

aws-logs:
	@if [ -z "$(env)" ] || [ -z "$(svc)" ]; then echo "Usage: make aws-logs env=<staging|prod> svc=<backend|frontend>"; exit 1; fi
	AWS_PROFILE=$(AWS_PROFILE) aws logs tail /ecs/rono-$(env)/$(svc) \
	  --region eu-north-1 --follow --profile $(AWS_PROFILE)

aws-exec:
	@if [ -z "$(env)" ] || [ -z "$(svc)" ]; then echo "Usage: make aws-exec env=<staging|prod> svc=<backend|frontend>"; exit 1; fi
	AWS_PROFILE=$(AWS_PROFILE) bash infra/scripts/exec.sh $(env) $(svc)
