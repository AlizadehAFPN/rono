#!/usr/bin/env bash
# =============================================================================
# migrate.sh — Run Alembic migrations on a live ECS environment
#
# Usage:
#   AWS_PROFILE=synapse bash infra/scripts/migrate.sh staging
#   AWS_PROFILE=synapse bash infra/scripts/migrate.sh prod
# =============================================================================
set -euo pipefail

ENV="${1:-staging}"
PROFILE="${AWS_PROFILE:-synapse}"
REGION="eu-north-1"
CLUSTER="synapse-${ENV}"
BACKEND_SERVICE="synapse-${ENV}-backend"
TASK_DEF="synapse-${ENV}-migration"

echo "==> Running Alembic migrations on: $ENV"

# Get migration task definition ARN
TASK_DEF_ARN=$(aws ecs describe-task-definition \
  --task-definition "$TASK_DEF" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "    Task definition: $TASK_DEF_ARN"

# Get network config from the running backend service
NETWORK_CONFIG=$(aws ecs describe-services \
  --cluster "$CLUSTER" \
  --services "$BACKEND_SERVICE" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --query 'services[0].networkConfiguration' \
  --output json)

echo "==> Starting migration task..."
TASK_ARN=$(aws ecs run-task \
  --cluster "$CLUSTER" \
  --task-definition "$TASK_DEF_ARN" \
  --launch-type FARGATE \
  --network-configuration "$NETWORK_CONFIG" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --query 'tasks[0].taskArn' \
  --output text)

echo "    Task ARN: $TASK_ARN"
echo "==> Waiting for migration task to complete..."

aws ecs wait tasks-stopped \
  --cluster "$CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$REGION" \
  --profile "$PROFILE"

EXIT_CODE=$(aws ecs describe-tasks \
  --cluster "$CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --query 'tasks[0].containers[0].exitCode' \
  --output text)

STOP_REASON=$(aws ecs describe-tasks \
  --cluster "$CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$REGION" \
  --profile "$PROFILE" \
  --query 'tasks[0].stoppedReason' \
  --output text)

echo "    Exit code   : $EXIT_CODE"
echo "    Stop reason : $STOP_REASON"

if [ "$EXIT_CODE" != "0" ]; then
  echo ""
  echo "❌ Migration FAILED"
  echo "   View logs: aws logs tail /ecs/${CLUSTER}/migration --profile $PROFILE"
  exit 1
fi

echo ""
echo "✅ Migration completed successfully on $ENV"
