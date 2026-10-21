#!/usr/bin/env bash
#
# curl-tests.sh - Manual integration tests for the locked n8n webhook contract.
#
# Usage:
#   Set credentials via environment variables (preferred):
#     export N8N_WEBHOOK_USERNAME="your_username"
#     export N8N_WEBHOOK_PASSWORD="your_password"
#     ./curl-tests.sh
#
#   Or run the script and enter credentials at the prompts. Credentials are
#   never written to disk.
#
# What it does:
#   - Sends POST requests for modes jobs, clients, and both.
#   - Captures HTTP status, total latency, and response body.
#   - Performs basic JSON schema validation using jq.
#   - Reports mismatches or failures.
#

set -euo pipefail

WEBHOOK_URL="${N8N_WEBHOOK_URL:-https://deskbound-octopus-modulator.ngrok-free.dev/webhook/stryde}"
REQUEST_TIMEOUT="${REQUEST_TIMEOUT:-60}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# Read credentials securely if not provided via environment.
if [[ -z "${N8N_WEBHOOK_USERNAME:-}" ]]; then
  printf 'n8n webhook username: '
  read -r N8N_WEBHOOK_USERNAME
fi
if [[ -z "${N8N_WEBHOOK_PASSWORD:-}" ]]; then
  printf 'n8n webhook password: '
  read -rs N8N_WEBHOOK_PASSWORD
  printf '\n'
fi

if [[ -z "$N8N_WEBHOOK_USERNAME" || -z "$N8N_WEBHOOK_PASSWORD" ]]; then
  echo "ERROR: username and password are required." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required but not installed. Please install jq and try again." >&2
  exit 1
fi

PASSES=0
FAILURES=0

run_test() {
  local mode="$1"
  local query="$2"
  local max_results="$3"
  local out="$TMP_DIR/${mode}.json"
  local meta="$TMP_DIR/${mode}.meta"

  echo "---"
  echo "Mode: $mode | maxResults: $max_results"
  echo "Query: $query"

  local http_code
  local total_time
  curl -sS -o "$out" -w 'HTTP_CODE:%{http_code}\nTIME_TOTAL:%{time_total}\n' \
    --max-time "$REQUEST_TIMEOUT" \
    -u "$N8N_WEBHOOK_USERNAME:$N8N_WEBHOOK_PASSWORD" \
    -H 'Content-Type: application/json' \
    -d "{\"mode\":\"$mode\",\"query\":\"$query\",\"maxResults\":$max_results}" \
    "$WEBHOOK_URL" >"$meta" 2>&1 || true

  http_code=$(grep -o 'HTTP_CODE:[0-9]*' "$meta" 2>/dev/null | cut -d: -f2 || echo "000")
  total_time=$(grep -o 'TIME_TOTAL:[0-9.]*' "$meta" 2>/dev/null | cut -d: -f2 || echo "n/a")

  echo "HTTP status: $http_code"
  echo "Latency: ${total_time}s"

  if [[ "$http_code" != "200" ]]; then
    echo "FAIL: expected 200 OK, got $http_code"
    if [[ -s "$out" ]]; then
      echo "Response body:"
      cat "$out"
    fi
    ((FAILURES++)) || true
    return
  fi

  if ! jq empty "$out" 2>/dev/null; then
    echo "FAIL: response is not valid JSON"
    cat "$out"
    ((FAILURES++)) || true
    return
  fi

  # Basic contract field checks
  local missing=()
  for field in mode intent_summary assumptions leads notes; do
    if ! jq -e ".${field}" "$out" >/dev/null 2>&1; then
      missing+=("$field")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "FAIL: missing top-level fields: ${missing[*]}"
    ((FAILURES++)) || true
    return
  fi

  local resp_mode
  resp_mode=$(jq -r '.mode' "$out")
  if [[ "$resp_mode" != "$mode" ]]; then
    echo "FAIL: response mode '$resp_mode' does not match request mode '$mode'"
    ((FAILURES++)) || true
    return
  fi

  local lead_count
  lead_count=$(jq '.leads | length' "$out")
  echo "Leads returned: $lead_count"

  if [[ "$lead_count" -gt 15 ]]; then
    echo "FAIL: lead count ($lead_count) exceeds contract maximum of 15"
    ((FAILURES++)) || true
    return
  fi

  echo "PASS: status 200, valid JSON, schema OK, lead count within limit"
  ((PASSES++)) || true
}

echo "n8n webhook contract test"
echo "URL: $WEBHOOK_URL"
echo "Timeout: ${REQUEST_TIMEOUT}s"
echo ""

run_test "jobs" "Remote senior React engineering roles at US companies" 5
run_test "clients" "SaaS fintech startups in Europe hiring sales reps" 5
run_test "both" "n8n workflow automation opportunities in Berlin" 10

echo ""
echo "=============================="
echo "Tests passed: $PASSES"
echo "Tests failed: $FAILURES"
echo "=============================="

if [[ "$FAILURES" -gt 0 ]]; then
  exit 1
fi
exit 0
