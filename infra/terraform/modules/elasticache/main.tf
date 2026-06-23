locals {
  name = "${var.project}-${var.env}"
  tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

# ── Subnet Group ────────────────────────────────────────────────────────────────
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = merge(local.tags, { Name = "${local.name}-redis-subnet-group" })
}

# ── Parameter Group ─────────────────────────────────────────────────────────────
resource "aws_elasticache_parameter_group" "main" {
  name   = "${local.name}-redis7"
  family = "redis7"

  tags = merge(local.tags, { Name = "${local.name}-redis7" })
}

# ── Redis Cluster ───────────────────────────────────────────────────────────────
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${local.name}-redis"
  description          = "Redis for ${local.name}"

  node_type            = var.node_type
  num_cache_clusters   = 1
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [var.redis_security_group_id]
  parameter_group_name = aws_elasticache_parameter_group.main.name

  engine_version           = "7.1"
  at_rest_encryption_enabled = true
  transit_encryption_enabled = false

  automatic_failover_enabled = false

  snapshot_retention_limit = 1
  snapshot_window          = "02:00-03:00"
  maintenance_window       = "sun:03:00-sun:04:00"

  tags = merge(local.tags, { Name = "${local.name}-redis" })
}

# ── Secrets Manager ─────────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "redis_url" {
  name                    = "${local.name}/redis-url"
  recovery_window_in_days = 0

  tags = merge(local.tags, { Name = "${local.name}/redis-url" })
}

resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379/0"
}
