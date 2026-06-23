variable "project" {
  description = "Project name"
  type        = string
}

variable "repositories" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["backend", "frontend"]
}

variable "image_retention_count" {
  description = "Number of images to retain per repository"
  type        = number
  default     = 10
}
