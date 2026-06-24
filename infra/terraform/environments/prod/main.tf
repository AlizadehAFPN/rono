data "aws_caller_identity" "current" {}

# ── Networking ──────────────────────────────────────────────────────────────────
module "networking" {
  source = "../../modules/networking"

  project = var.project
  env     = var.env

  vpc_cidr             = "10.1.0.0/16"
  availability_zones   = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
  public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24", "10.1.12.0/24"]
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

# ── RDS ─────────────────────────────────────────────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  project               = var.project
  env                   = var.env
  private_subnet_ids    = module.networking.private_subnet_ids
  rds_security_group_id = module.networking.rds_security_group_id

  instance_class        = "db.t3.small"
  multi_az              = true
  backup_retention_days = 14
  deletion_protection   = true
}

# ── ElastiCache ─────────────────────────────────────────────────────────────────
module "elasticache" {
  source = "../../modules/elasticache"

  project                 = var.project
  env                     = var.env
  private_subnet_ids      = module.networking.private_subnet_ids
  redis_security_group_id = module.networking.redis_security_group_id

  node_type = "cache.t3.small"
}

# ── ECS ─────────────────────────────────────────────────────────────────────────
module "ecs" {
  source = "../../modules/ecs"

  project        = var.project
  env            = var.env
  aws_region     = var.aws_region
  aws_account_id = var.aws_account_id

  vpc_id                    = module.networking.vpc_id
  private_subnet_ids        = module.networking.private_subnet_ids
  ecs_security_group_id     = module.networking.ecs_security_group_id
  backend_target_group_arn  = module.alb.backend_target_group_arn
  frontend_target_group_arn = module.alb.frontend_target_group_arn

  backend_image  = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/rono/backend:latest"
  frontend_image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/rono/frontend:latest"

  backend_cpu     = 512
  backend_memory  = 1024
  frontend_cpu    = 512
  frontend_memory = 1024

  backend_desired_count  = 2
  frontend_desired_count = 2
  backend_min_capacity   = 2
  backend_max_capacity   = 10
  frontend_min_capacity  = 2
  frontend_max_capacity  = 10

  db_secret_arn    = module.rds.db_secret_arn
  redis_secret_arn = module.elasticache.redis_secret_arn

  cors_origins = "http://${module.alb.alb_dns_name}"
  log_level    = "INFO"
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
