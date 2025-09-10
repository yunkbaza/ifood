#!/bin/bash
set -euo pipefail

# Run schema and seed scripts against the configured DATABASE_URL
# Usage: DATABASE_URL=postgresql://user:pass@host:port/dbname ./setup_db.sh

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql "$DATABASE_URL" -f "$SCRIPT_DIR/01_schema.sql"
psql "$DATABASE_URL" -f "$SCRIPT_DIR/02_bulk_seeds.sql"
