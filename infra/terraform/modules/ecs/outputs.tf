output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "backend_service_name" {
  description = "ECS backend service name"
  value       = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  description = "ECS frontend service name"
  value       = aws_ecs_service.frontend.name
}

output "migration_task_definition_arn" {
  description = "Migration task definition ARN"
  value       = aws_ecs_task_definition.migration.arn
}

output "backend_task_definition_family" {
  description = "Backend task definition family"
  value       = aws_ecs_task_definition.backend.family
}

output "frontend_task_definition_family" {
  description = "Frontend task definition family"
  value       = aws_ecs_task_definition.frontend.family
}

output "ecs_security_group_id" {
  description = "ECS security group ID"
  value       = var.ecs_security_group_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs used by ECS"
  value       = var.private_subnet_ids
}

output "jwt_secret_arn" {
  description = "Secrets Manager ARN for JWT_SECRET"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}
