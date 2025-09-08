#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=${1:-dev}

if [ "$ENVIRONMENT" = "dev" ]; then
  docker compose up -d --build
elif [ "$ENVIRONMENT" = "prod" ]; then
  docker compose -f docker-compose.prod.yml up -d --build
else
  echo "Unknown environment: $ENVIRONMENT (use dev|prod)"
  exit 1
fi

