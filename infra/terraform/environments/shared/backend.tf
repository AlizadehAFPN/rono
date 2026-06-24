terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "rono-tf-state-646167485518"
    key          = "shared/terraform.tfstate"
    region       = "eu-north-1"
    profile      = "rono"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region  = "eu-north-1"
  profile = "rono"

  default_tags {
    tags = {
      Project   = "rono"
      ManagedBy = "terraform"
    }
  }
}
