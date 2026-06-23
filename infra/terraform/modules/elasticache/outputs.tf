output "redis_secret_arn" {
  description = "Secrets Manager ARN for REDIS_URL"
  value       = aws_secretsmanager_secret.redis_url.arn
}

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}
