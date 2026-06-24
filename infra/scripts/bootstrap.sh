#!/usr/bin/env bash
# =============================================================================
# bootstrap.sh — ONE-TIME SETUP for Terraform remote state
#
# Run this ONCE before any `terraform init`. It creates:
#   • S3 bucket for Terraform state (versioned + encrypted)
#   • DynamoDB table for state locking
#
# Usage:
#   AWS_PROFILE=rono bash infra/scripts/bootstrap.sh
# =============================================================================
set -euo pipefail

ACCOUNT_ID="646167485518"
REGION="eu-north-1"
BUCKET="rono-tf-state-${ACCOUNT_ID}"
DYNAMO_TABLE="rono-tf-locks"
PROFILE="${AWS_PROFILE:-rono}"

echo "==> Bootstrapping Terraform state backend"
echo "    Account : $ACCOUNT_ID"
echo "    Region  : $REGION"
echo "    Bucket  : $BUCKET"
echo "    DynamoDB: $DYNAMO_TABLE"
echo ""

# ── Verify we're talking to the right account ──────────────────────────────────
ACTUAL_ACCOUNT=$(aws sts get-caller-identity \
  --profile "$PROFILE" \
  --query 'Account' \
  --output text 2>/dev/null)

if [ "$ACTUAL_ACCOUNT" != "$ACCOUNT_ID" ]; then
  echo "ERROR: AWS profile '$PROFILE' resolves to account $ACTUAL_ACCOUNT, expected $ACCOUNT_ID"
  echo "       Make sure you configured the 'rono' AWS profile correctly."
  exit 1
fi

echo "✓ Verified account: $ACTUAL_ACCOUNT"

# ── Create S3 bucket ───────────────────────────────────────────────────────────
if aws s3api head-bucket --bucket "$BUCKET" --profile "$PROFILE" 2>/dev/null; then
  echo "✓ S3 bucket already exists: $BUCKET"
else
  echo "==> Creating S3 bucket: $BUCKET"
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" \
    --profile "$PROFILE"

  # Enable versioning (allows state recovery)
  aws s3api put-bucket-versioning \
    --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled \
    --profile "$PROFILE"

  # Enable server-side encryption
  aws s3api put-bucket-encryption \
    --bucket "$BUCKET" \
    --server-side-encryption-configuration '{
      "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }]
    }' \
    --profile "$PROFILE"

  # Block all public access
  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --profile "$PROFILE"

  # Lifecycle: expire old state versions after 90 days
  aws s3api put-bucket-lifecycle-configuration \
    --bucket "$BUCKET" \
    --lifecycle-configuration '{
      "Rules": [{
        "ID": "expire-old-versions",
        "Status": "Enabled",
        "NoncurrentVersionExpiration": { "NoncurrentDays": 90 },
        "Filter": {}
      }]
    }' \
    --profile "$PROFILE"

  echo "✓ S3 bucket created and hardened"
fi

# ── Create DynamoDB table for state locking ────────────────────────────────────
if aws dynamodb describe-table \
  --table-name "$DYNAMO_TABLE" \
  --region "$REGION" \
  --profile "$PROFILE" &>/dev/null; then
  echo "✓ DynamoDB table already exists: $DYNAMO_TABLE"
else
  echo "==> Creating DynamoDB table: $DYNAMO_TABLE"
  aws dynamodb create-table \
    --table-name "$DYNAMO_TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --profile "$PROFILE"

  aws dynamodb wait table-exists \
    --table-name "$DYNAMO_TABLE" \
    --region "$REGION" \
    --profile "$PROFILE"

  echo "✓ DynamoDB table created"
fi

echo ""
echo "============================================================"
echo "  Bootstrap complete! Next steps:"
echo ""
echo "  1. Update infra/terraform/environments/shared/terraform.tfvars"
echo "     with your GitHub org/username and repo name"
echo ""
echo "  2. Apply shared infrastructure (ECR + OIDC):"
echo "     cd infra/terraform/environments/shared"
echo "     terraform init && terraform apply"
echo ""
echo "  3. Apply staging:"
echo "     cd infra/terraform/environments/staging"
echo "     terraform init && terraform apply"
echo ""
echo "  4. Apply prod:"
echo "     cd infra/terraform/environments/prod"
echo "     terraform init && terraform apply"
echo ""
echo "  5. Add GitHub secrets (see infra/SETUP.md)"
echo "============================================================"
