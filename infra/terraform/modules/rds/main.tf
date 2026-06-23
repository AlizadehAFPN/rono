locals {
  name = "${var.project}-${var.env}"
  tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "random_password" "db" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}:?"
}

# ── Secrets Manager ─────────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "db_url" {
  name                    = "${local.name}/database-url"
  recovery_window_in_days = 0

  tags = merge(local.tags, { Name = "${local.name}/database-url" })
}

resource "aws_secretsmanager_secret_version" "db_url" {
  secret_id = aws_secretsmanager_secret.db_url.id
  secret_string = "postgresql+asyncpg://synapse:${random_password.db.result}@${aws_db_instance.main.endpoint}/${replace(local.name, "-", "_")}"
}

# ── DB Subnet Group ─────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = merge(local.tags, { Name = "${local.name}-db-subnet-group" })
}

# ── Parameter Group ─────────────────────────────────────────────────────────────
resource "aws_db_parameter_group" "main" {
  name   = "${local.name}-pg16"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = merge(local.tags, { Name = "${local.name}-pg16" })
}

# ── RDS Instance ────────────────────────────────────────────────────────────────
resource "aws_db_instance" "main" {
  identifier = "${local.name}-postgres"

  engine               = "postgres"
  engine_version       = "16"
  instance_class       = var.instance_class
  allocated_storage    = 20
  max_allocated_storage = 100
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = replace(local.name, "-", "_")
  username = "synapse"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  parameter_group_name   = aws_db_parameter_group.main.name

  multi_az               = var.multi_az
  publicly_accessible    = false
  deletion_protection    = var.deletion_protection
  skip_final_snapshot    = var.deletion_protection == false ? true : false
  final_snapshot_identifier = var.deletion_protection ? "${local.name}-final-snapshot" : null

  backup_retention_period = var.backup_retention_days
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  auto_minor_version_upgrade = true
  copy_tags_to_snapshot      = true

  performance_insights_enabled = true

  tags = merge(local.tags, { Name = "${local.name}-postgres" })

  lifecycle {
    ignore_changes = [password]
  }
}
