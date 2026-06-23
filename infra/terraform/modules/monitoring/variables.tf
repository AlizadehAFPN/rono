variable "project" {
  description = "Project name"
  type        = string
}

variable "aws_region" {
  description = "AWS region for CloudWatch dashboard widgets"
  type        = string
  default     = "eu-north-1"
}

variable "env" {
  description = "Deployment environment"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix (for CloudWatch metrics)"
  type        = string
}

variable "backend_target_group_arn_suffix" {
  description = "Backend target group ARN suffix"
  type        = string
}

variable "frontend_target_group_arn_suffix" {
  description = "Frontend target group ARN suffix"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarm notifications (optional)"
  type        = string
  default     = ""
}
