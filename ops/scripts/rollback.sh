#!/usr/bin/env bash
set -euo pipefail

# Simple rollback: restart previous image if tagged, or docker compose down/up
ENVIRONMENT=${1:-prod}

if [ "$ENVIRONMENT" = "prod" ]; then
  echo "Rolling back prod stack by restarting services"
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up -d
else
  echo "Rolling back dev stack by restarting services"
  docker compose down
  docker compose up -d
fi

