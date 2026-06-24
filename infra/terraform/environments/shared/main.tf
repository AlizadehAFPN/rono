data "aws_caller_identity" "current" {}

# ── ECR Repositories (shared across all environments) ──────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  project              = "rono"
  repositories         = ["backend", "frontend"]
  image_retention_count = 15
}

# ── GitHub OIDC Provider ────────────────────────────────────────────────────────
# Allows GitHub Actions to assume IAM roles without static credentials
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]
}

# ── IAM Role: GitHub Actions → Staging Deploy ──────────────────────────────────
resource "aws_iam_role" "github_staging" {
  name = "rono-github-staging-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
        }
      }
    }]
  })

  tags = {
    Name    = "rono-github-staging-deploy"
    Purpose = "GitHub Actions OIDC for staging deploys"
  }
}

resource "aws_iam_role_policy" "github_staging" {
  name = "rono-github-staging-policy"
  role = aws_iam_role.github_staging.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

# ── IAM Role: GitHub Actions → Prod Deploy ─────────────────────────────────────
resource "aws_iam_role" "github_prod" {
  name = "rono-github-prod-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
        }
      }
    }]
  })

  tags = {
    Name    = "rono-github-prod-deploy"
    Purpose = "GitHub Actions OIDC for prod deploys"
  }
}

resource "aws_iam_role_policy" "github_prod" {
  name = "rono-github-prod-policy"
  role = aws_iam_role.github_prod.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

# ── IAM Policy: what the deploy role can do ─────────────────────────────────────
data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid    = "ECRAuth"
    effect = "Allow"
    actions = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "ECRPushByArn"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
      "ecr:ListImages",
    ]
    resources = [
      "arn:aws:ecr:eu-north-1:${data.aws_caller_identity.current.account_id}:repository/rono/*"
    ]
  }

  statement {
    sid    = "ECSDeployAll"
    effect = "Allow"
    actions = [
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:DescribeTasks",
      "ecs:ListTasks",
      "ecs:RegisterTaskDefinition",
      "ecs:TagResource",
      "ecs:UpdateService",
      "ecs:RunTask",
      "ecs:StopTask",
      "ecs:WaitUntilServicesStable",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "PassRoleForECS"
    effect = "Allow"
    actions = ["iam:PassRole"]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/rono-*-ecs-*"
    ]
  }

  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "SecretsManagerRead"
    effect = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:eu-north-1:${data.aws_caller_identity.current.account_id}:secret:rono-*"
    ]
  }
}
