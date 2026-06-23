locals {
  name = "${var.project}-${var.env}"
  tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "terraform"
  }

  redis_sidecar_container = var.redis_sidecar ? [{
    name      = "redis"
    image     = "public.ecr.aws/docker/library/redis:7-alpine"
    essential = false
    portMappings = [{
      containerPort = 6379
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${local.name}/backend"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "redis"
      }
    }
  }] : []
}

# ── JWT Secret ──────────────────────────────────────────────────────────────────
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${local.name}/jwt-secret"
  recovery_window_in_days = 0

  tags = merge(local.tags, { Name = "${local.name}/jwt-secret" })
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# ── CloudWatch Log Groups ───────────────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name}/backend"
  retention_in_days = 30

  tags = merge(local.tags, { Name = "${local.name}-backend-logs" })
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${local.name}/frontend"
  retention_in_days = 30

  tags = merge(local.tags, { Name = "${local.name}-frontend-logs" })
}

resource "aws_cloudwatch_log_group" "migration" {
  name              = "/ecs/${local.name}/migration"
  retention_in_days = 14

  tags = merge(local.tags, { Name = "${local.name}-migration-logs" })
}

# ── IAM: ECS Task Execution Role ────────────────────────────────────────────────
# Pulls images from ECR, reads secrets, writes CloudWatch logs
resource "aws_iam_role" "execution" {
  name = "${local.name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = merge(local.tags, { Name = "${local.name}-ecs-execution-role" })
}

resource "aws_iam_role_policy_attachment" "execution_managed" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execution_secrets" {
  name = "${local.name}-secrets-access"
  role = aws_iam_role.execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
        "kms:Decrypt"
      ]
      Resource = [
        var.db_secret_arn,
        var.redis_secret_arn,
        aws_secretsmanager_secret.jwt_secret.arn
      ]
    }]
  })
}

# ── IAM: ECS Task Role ──────────────────────────────────────────────────────────
# Runtime permissions for the application itself
resource "aws_iam_role" "task" {
  name = "${local.name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = merge(local.tags, { Name = "${local.name}-ecs-task-role" })
}

resource "aws_iam_role_policy" "task_ssm" {
  name = "${local.name}-ssm-messages"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ]
      Resource = "*"
    }]
  })
}

# ── ECS Cluster ─────────────────────────────────────────────────────────────────
resource "aws_ecs_cluster" "main" {
  name = local.name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(local.tags, { Name = local.name })
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

# ── Service Connect Namespace ───────────────────────────────────────────────────
resource "aws_service_discovery_http_namespace" "main" {
  name        = local.name
  description = "ECS Service Connect namespace for ${local.name}"

  tags = merge(local.tags, { Name = local.name })
}

# ── Backend Task Definition ─────────────────────────────────────────────────────
resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode(concat(
    [{
      name      = "backend"
      image     = var.backend_image
      essential = true

      portMappings = [{
        name          = "backend-http"
        containerPort = 8000
        protocol      = "tcp"
        appProtocol   = "http"
      }]

      environment = [
        { name = "ENVIRONMENT",                    value = var.env },
        { name = "LOG_LEVEL",                      value = var.log_level },
        { name = "JWT_ALGORITHM",                  value = "HS256" },
        { name = "ACCESS_TOKEN_EXPIRE_MINUTES",    value = "15" },
        { name = "REFRESH_TOKEN_EXPIRE_DAYS",      value = "7" },
        { name = "CORS_ORIGINS",                   value = var.cors_origins },
        { name = "COOKIE_SECURE",                  value = tostring(var.cookie_secure) },
        { name = "PYTHONPATH",                     value = "src" },
      ]

      secrets = [
        { name = "DATABASE_URL", valueFrom = var.db_secret_arn },
        { name = "REDIS_URL",    valueFrom = var.redis_secret_arn },
        { name = "JWT_SECRET",   valueFrom = aws_secretsmanager_secret.jwt_secret.arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }

      readonlyRootFilesystem = false
      user                   = "app"
    }],
    local.redis_sidecar_container
  ))

  tags = merge(local.tags, { Name = "${local.name}-backend" })
}

# ── Migration Task Definition ───────────────────────────────────────────────────
resource "aws_ecs_task_definition" "migration" {
  family                   = "${local.name}-migration"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "migration"
      image     = var.backend_image
      essential = true
      command   = ["uv", "run", "alembic", "upgrade", "head"]

      environment = [
        { name = "ENVIRONMENT", value = var.env },
        { name = "LOG_LEVEL",   value = "INFO" },
        { name = "PYTHONPATH",  value = "src" },
      ]

      secrets = [
        { name = "DATABASE_URL", valueFrom = var.db_secret_arn },
        { name = "REDIS_URL",    valueFrom = var.redis_secret_arn },
        { name = "JWT_SECRET",   valueFrom = aws_secretsmanager_secret.jwt_secret.arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.migration.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "migration"
        }
      }
    }
  ])

  tags = merge(local.tags, { Name = "${local.name}-migration" })
}

# ── Frontend Task Definition ────────────────────────────────────────────────────
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${local.name}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = var.frontend_image
      essential = true

      portMappings = [{
        containerPort = 3000
        protocol      = "tcp"
      }]

      environment = [
        { name = "NODE_ENV",           value = "production" },
        { name = "INTERNAL_API_URL",   value = "http://backend:8000" },
        { name = "HOSTNAME",           value = "0.0.0.0" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:3000/ | head -1 || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }

      readonlyRootFilesystem = false
      user                   = "nextjs"
    }
  ])

  tags = merge(local.tags, { Name = "${local.name}-frontend" })
}

# ── Backend ECS Service ─────────────────────────────────────────────────────────
resource "aws_ecs_service" "backend" {
  name            = "${local.name}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  enable_execute_command = true

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 8000
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.main.arn

    service {
      port_name      = "backend-http"
      discovery_name = "backend"

      client_alias {
        port     = 8000
        dns_name = "backend"
      }
    }

    log_configuration {
      log_driver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "sc-backend"
      }
    }
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  tags = merge(local.tags, { Name = "${local.name}-backend" })
}

# ── Frontend ECS Service ────────────────────────────────────────────────────────
resource "aws_ecs_service" "frontend" {
  name            = "${local.name}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  enable_execute_command = true

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 3000
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.main.arn

    log_configuration {
      log_driver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "sc-frontend"
      }
    }
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  tags = merge(local.tags, { Name = "${local.name}-frontend" })
}

# ── Auto-Scaling: Backend ───────────────────────────────────────────────────────
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.backend_max_capacity
  min_capacity       = var.backend_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${local.name}-backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "backend_memory" {
  name               = "${local.name}-backend-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}

# ── Auto-Scaling: Frontend ──────────────────────────────────────────────────────
resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = var.frontend_max_capacity
  min_capacity       = var.frontend_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${local.name}-frontend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
