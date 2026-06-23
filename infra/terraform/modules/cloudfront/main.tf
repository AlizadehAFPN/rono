locals {
  name      = "${var.project}-${var.env}"
  origin_id = "alb-origin"
  tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

# ── AWS-managed policies ─────────────────────────────────────────────────────────
# CachingDisabled: app is fully dynamic — CloudFront is used purely as a TLS edge.
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

# AllViewer: forward all headers, cookies, and query strings to the origin.
data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

# Cache static Next.js assets at the edge for speed.
data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

# ── Distribution ─────────────────────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${local.name} — HTTPS edge in front of the ALB"
  price_class     = var.price_class
  http_version    = "http2and3"

  origin {
    domain_name = var.alb_dns_name
    origin_id   = local.origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # ALB only listens on HTTP/80
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default: everything is dynamic → no caching, forward the whole request.
  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  # Static Next.js build assets are immutable → safe to cache at the edge.
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = data.aws_cloudfront_cache_policy.optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Free, auto-renewed certificate for the *.cloudfront.net domain.
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(local.tags, { Name = "${local.name}-cloudfront" })
}
