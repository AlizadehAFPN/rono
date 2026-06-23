locals {
  # Placeholder image — replaced on first deploy by GitHub Actions
  placeholder_image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/synapse/backend:latest"
}

data "aws_caller_identity" "current" {}

# ── Networking ──────────────────────────────────────────────────────────────────
module "networking" {
  source = "../../modules/networking"

  project = var.project
  env     = var.env

  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

# ── ALB ─────────────────────────────────────────────────────────────────────────
module "alb" {
  source = "../../modules/alb"

  project               = var.project
  env                   = var.env
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
}

# ── CloudFront (HTTPS edge in front of the HTTP-only ALB) ────────────────────────
module "cloudfront" {
  source = "../../modules/cloudfront"

  project      = var.project
  env          = var.env
  alb_dns_name = module.alb.alb_dns_name
}

# ── RDS ─────────────────────────────────────────────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  project               = var.project
  env                   = var.env
  private_subnet_ids    = module.networking.private_subnet_ids
  rds_security_group_id = module.networking.rds_security_group_id

  instance_class       = "db.t3.micro"
  multi_az             = false
  backup_retention_days = 0
  deletion_protection  = false
}

# ── Redis secret (sidecar runs at localhost:6379 — no ElastiCache needed for staging) ──
resource "aws_secretsmanager_secret" "redis_url" {
  name                    = "${var.project}-${var.env}/redis-url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = "redis://localhost:6379/0"
}

# ── ECS ─────────────────────────────────────────────────────────────────────────
module "ecs" {
  source = "../../modules/ecs"

  project        = var.project
  env            = var.env
  aws_region     = var.aws_region
  aws_account_id = var.aws_account_id

  vpc_id                   = module.networking.vpc_id
  private_subnet_ids       = module.networking.private_subnet_ids
  ecs_security_group_id    = module.networking.ecs_security_group_id
  backend_target_group_arn  = module.alb.backend_target_group_arn
  frontend_target_group_arn = module.alb.frontend_target_group_arn

  backend_image  = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/synapse/backend:latest"
  frontend_image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/synapse/frontend:latest"

  backend_cpu    = 256
  backend_memory = 512
  frontend_cpu   = 256
  frontend_memory = 512

  backend_desired_count  = 1
  frontend_desired_count = 1
  backend_min_capacity   = 1
  backend_max_capacity   = 3
  frontend_min_capacity  = 1
  frontend_max_capacity  = 3

  db_secret_arn    = module.rds.db_secret_arn
  redis_secret_arn = aws_secretsmanager_secret.redis_url.arn
  redis_sidecar    = true

  cors_origins  = "https://${module.cloudfront.domain_name}"
  log_level     = "DEBUG"
  cookie_secure = true  # served over HTTPS via CloudFront — cookies must be Secure
}

# ── Monitoring ──────────────────────────────────────────────────────────────────
module "monitoring" {
  source = "../../modules/monitoring"

  project                          = var.project
  env                              = var.env
  alb_arn_suffix                   = module.alb.alb_arn_suffix
  backend_target_group_arn_suffix  = module.alb.backend_target_group_arn_suffix
  frontend_target_group_arn_suffix = module.alb.frontend_target_group_arn_suffix
  ecs_cluster_name                 = module.ecs.cluster_name
  alarm_email                      = var.alarm_email
}
