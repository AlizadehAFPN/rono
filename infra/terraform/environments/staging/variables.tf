variable "project" {
  type    = string
  default = "rono"
}

variable "env" {
  type    = string
  default = "staging"
}

variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "aws_account_id" {
  type    = string
  default = "646167485518"
}

variable "alarm_email" {
  description = "Email to receive CloudWatch alarm notifications"
  type        = string
  default     = "farzad@touchzenmedia.com"
}
