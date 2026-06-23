output "ecr_backend_url" {
  description = "ECR URL for the backend repository"
  value       = module.ecr.repository_urls["backend"]
}

output "ecr_frontend_url" {
  description = "ECR URL for the frontend repository"
  value       = module.ecr.repository_urls["frontend"]
}

output "github_staging_role_arn" {
  description = "IAM role ARN for GitHub Actions staging deploys"
  value       = aws_iam_role.github_staging.arn
}

output "github_prod_role_arn" {
  description = "IAM role ARN for GitHub Actions prod deploys"
  value       = aws_iam_role.github_prod.arn
}

output "ecr_registry" {
  description = "ECR registry hostname"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-north-1.amazonaws.com"
}
