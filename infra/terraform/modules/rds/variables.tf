variable "project" {
  description = "Project name"
  type        = string
}

variable "env" {
  description = "Deployment environment"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "multi_az" {
  description = "Enable Multi-AZ for high availability"
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  description = "Days to retain automated backups"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Prevent accidental deletion"
  type        = bool
  default     = true
}
