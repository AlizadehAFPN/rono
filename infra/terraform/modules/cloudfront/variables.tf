variable "project" {
  type        = string
  description = "Project name"
}

variable "env" {
  type        = string
  description = "Environment name (e.g. staging, prod)"
}

variable "alb_dns_name" {
  type        = string
  description = "Public DNS name of the origin ALB (HTTP-only)"
}

variable "price_class" {
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe — cheapest
  description = "CloudFront price class"
}
