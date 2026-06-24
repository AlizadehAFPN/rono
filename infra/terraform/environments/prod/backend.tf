terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "s3" {
    bucket       = "rono-tf-state-646167485518"
    key          = "prod/terraform.tfstate"
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
      Project     = "rono"
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

provider "random" {}
