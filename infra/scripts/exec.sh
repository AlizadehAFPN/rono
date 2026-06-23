#!/usr/bin/env bash
# =============================================================================
# exec.sh — Open an interactive shell inside a running ECS task
#            (requires ECS Exec to be enabled, which Terraform sets up)
#
# Usage:
#   bash infra/scripts/exec.sh staging backend
#   bash infra/scripts/exec.sh prod backend
# =============================================================================
set -euo pipefail

ENV="${1:-staging}"
SERVICE="${2:-backend}"
PROFILE="${AWS_PROFILE:-synapse}"
REGION="eu-north-1"
CLUSTER="synapse-${ENV}"
ECS_SERVICE="synapse-${ENV}-${SERVICE}"

echo "==> Connecting to $SERVICE in $ENV..."

TASK_ARN=$(aws ecs list-tasks \
  --cluster "$CLUSTER" \
  --service-name "$ECS_SERVICE" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --query 'taskArns[0]' \
  --output text)

if [ "$TASK_ARN" == "None" ] || [ -z "$TASK_ARN" ]; then
  echo "No running tasks found for $ECS_SERVICE in $CLUSTER"
  exit 1
fi

echo "    Task: $TASK_ARN"

aws ecs execute-command \
  --cluster "$CLUSTER" \
  --task "$TASK_ARN" \
  --container "$SERVICE" \
  --command "/bin/sh" \
  --interactive \
  --region "$REGION" \
  --profile "$PROFILE"
