#!/bin/bash
set -euo pipefail

echo "Running backend tests"
cd ifood-dashboard/backend
pytest

echo "Running frontend test script"
cd ../frontend
npm test
