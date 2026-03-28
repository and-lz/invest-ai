#!/usr/bin/env bash
# Resilient dev server — auto-restarts on crash, exits cleanly on Ctrl+C

RESTART_DELAY=2
user_interrupted=false

# Always start fresh — stale .next cache causes hydration mismatches
rm -rf .next

# Track when user presses Ctrl+C
trap 'user_interrupted=true' SIGINT SIGTERM

while true; do
  user_interrupted=false

  # Run in foreground — bash won't die on SIGINT because we trapped it
  npm run dev:raw
  exit_code=$?

  # User pressed Ctrl+C → exit cleanly
  if $user_interrupted; then
    echo ""
    echo "Dev server stopped by user."
    exit 0
  fi

  # Clean exit → stop
  if [ $exit_code -eq 0 ]; then
    exit 0
  fi

  # Crash → clean .next cache and restart
  echo ""
  echo "⚠ Dev server crashed (exit code $exit_code). Cleaning .next cache and restarting in ${RESTART_DELAY}s..."
  echo ""
  rm -rf .next
  sleep $RESTART_DELAY
done
