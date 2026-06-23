output "alb_dns_name" {
  description = "ALB public DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_arn_suffix" {
  description = "ALB ARN suffix (for CloudWatch)"
  value       = aws_lb.main.arn_suffix
}

output "backend_target_group_arn" {
  description = "Backend target group ARN"
  value       = aws_lb_target_group.backend.arn
}

output "frontend_target_group_arn" {
  description = "Frontend target group ARN"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn_suffix" {
  description = "Backend target group ARN suffix"
  value       = aws_lb_target_group.backend.arn_suffix
}

output "frontend_target_group_arn_suffix" {
  description = "Frontend target group ARN suffix"
  value       = aws_lb_target_group.frontend.arn_suffix
}
