output "app_url" {
  description = "Public HTTPS app URL (use this — works on mobile)"
  value       = module.cloudfront.url
}

output "alb_url" {
  description = "Direct ALB URL (HTTP, origin only — prefer app_url)"
  value       = "http://${module.alb.alb_dns_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidations)"
  value       = module.cloudfront.distribution_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "backend_service_name" {
  description = "ECS backend service name"
  value       = module.ecs.backend_service_name
}

output "frontend_service_name" {
  description = "ECS frontend service name"
  value       = module.ecs.frontend_service_name
}

output "migration_task_definition_arn" {
  description = "Migration task definition ARN"
  value       = module.ecs.migration_task_definition_arn
}

output "ecs_security_group_id" {
  description = "ECS security group ID (for migration tasks)"
  value       = module.ecs.ecs_security_group_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.ecs.private_subnet_ids
}
