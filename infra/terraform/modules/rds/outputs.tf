output "db_secret_arn" {
  description = "Secrets Manager ARN for the DATABASE_URL"
  value       = aws_secretsmanager_secret.db_url.arn
}

output "db_endpoint" {
  description = "RDS endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}
