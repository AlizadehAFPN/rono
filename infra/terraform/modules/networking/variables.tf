variable "project" {
  description = "Project name used as a prefix for all resources"
  type        = string
}

variable "env" {
  description = "Deployment environment (staging | prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
}

variable "availability_zones" {
  description = "List of AZs to deploy subnets into"
  type        = list(string)
}
