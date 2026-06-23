#!/usr/bin/env bash
# One-shot deploy of Rono to a Hetzner Ubuntu server.
# Isolated from Synapse: own dir (/opt/rono), own compose project (-p rono),
# own DB/Redis/volumes, own host port (3200). Safe to run alongside Synapse.
# Run from the repo root on your Mac:  bash infra/hetzner/deploy.sh <SERVER_IP> [DOMAIN]
# If DOMAIN is omitted, uses <ip>.sslip.io so you get HTTPS instantly without DNS.
set -euo pipefail

IP="${1:?usage: deploy.sh SERVER_IP [DOMAIN]}"
DOMAIN="${2:-${IP//./-}.sslip.io}"
SSH_OPTS="-o StrictHostKeyChecking=accept-new"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="/opt/rono"
PROJECT="rono"

echo "==> Provisioning $IP (swap + docker)"
ssh $SSH_OPTS root@"$IP" bash -s <<EOS
set -e
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh
mkdir -p $APP_DIR
EOS

echo "==> Uploading code to $APP_DIR (Synapse at /opt/synapse is untouched)"
rsync -az --delete -e "ssh $SSH_OPTS" \
  --exclude '.git' --exclude 'node_modules' --exclude '.next' \
  --exclude '.venv' --exclude '__pycache__' --exclude '.ruff_cache' \
  --exclude '.env' --exclude 'backups' \
  "$REPO_ROOT/" root@"$IP":"$APP_DIR"/

echo "==> Writing env (only if it doesn't exist — never rotates live secrets)"
ssh $SSH_OPTS root@"$IP" "test -f $APP_DIR/infra/hetzner/.env || cat > $APP_DIR/infra/hetzner/.env" <<EOF
POSTGRES_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
DOMAIN=$DOMAIN
PUBLIC_URL=https://$DOMAIN
EOF

echo "==> Building + starting containers as project '$PROJECT' (first build ~5-10 min)"
ssh $SSH_OPTS root@"$IP" "cd $APP_DIR/infra/hetzner && docker compose -p $PROJECT -f docker-compose.prod.yml --env-file .env up -d --build"

echo "==> Done. App: https://$DOMAIN  (host port 127.0.0.1:3200)"
