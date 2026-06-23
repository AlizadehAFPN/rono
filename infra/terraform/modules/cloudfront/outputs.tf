output "domain_name" {
  description = "CloudFront distribution domain (e.g. dxxxx.cloudfront.net)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "url" {
  description = "Public HTTPS URL served by CloudFront"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "distribution_id" {
  description = "CloudFront distribution ID (use for cache invalidations)"
  value       = aws_cloudfront_distribution.main.id
}
