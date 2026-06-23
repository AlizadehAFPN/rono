variable "project" {
  description = "Project name"
  type        = string
}

variable "env" {
  description = "Deployment environment"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "backend_target_group_arn" {
  description = "ALB target group ARN for the backend"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "ALB target group ARN for the frontend"
  type        = string
}

variable "backend_image" {
  description = "Backend Docker image URI (ECR)"
  type        = string
}

variable "frontend_image" {
  description = "Frontend Docker image URI (ECR)"
  type        = string
}

variable "backend_cpu" {
  description = "CPU units for backend task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory (MB) for backend task"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory (MB) for frontend task"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
}

variable "backend_min_capacity" {
  description = "Minimum backend task count for auto-scaling"
  type        = number
  default     = 1
}

variable "backend_max_capacity" {
  description = "Maximum backend task count for auto-scaling"
  type        = number
  default     = 3
}

variable "frontend_min_capacity" {
  description = "Minimum frontend task count for auto-scaling"
  type        = number
  default     = 1
}

variable "frontend_max_capacity" {
  description = "Maximum frontend task count for auto-scaling"
  type        = number
  default     = 3
}

variable "db_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  type        = string
}

variable "redis_secret_arn" {
  description = "Secrets Manager ARN for REDIS_URL"
  type        = string
}


variable "cors_origins" {
  description = "Comma-separated CORS origins (ALB URL)"
  type        = string
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "INFO"
}

variable "redis_sidecar" {
  description = "Run Redis as a sidecar container instead of using ElastiCache (for staging)"
  type        = bool
  default     = false
}

variable "cookie_secure" {
  description = "Set Secure flag on auth cookies. Must be false when ALB serves plain HTTP."
  type        = bool
  default     = true
}
