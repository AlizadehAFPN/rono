#!/usr/bin/env bash
# Weekly IRT item calibration for the Synapse stack on Argus.
# Fits per-item 2PL parameters (a, b) from accumulated graded responses so the
# adaptive selector can genuinely match question difficulty to each learner's
# ability. Until an item is calibrated it carries neutral params (a=1, b=0) and
# selection among such items is effectively random — this job is what makes
# "best question at the best time" real. Installed via cron (see README.md).
set -euo pipefail

CONTAINER=synapse-backend-1

docker exec "$CONTAINER" sh -c \
  'cd /home/app && PYTHONPATH=src uv run python scripts/calibrate_items.py'
echo "$(date -Is) calibration run complete"
