#!/usr/bin/env bash
set -euo pipefail
curl --fail --silent --show-error --max-time 20 https://rewards.turkscan.com/api/health
