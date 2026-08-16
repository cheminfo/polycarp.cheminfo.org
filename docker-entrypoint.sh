#!/bin/sh
# Populate the writable site directories from the read-only image, then inject
# the analytics snippet (see rules/analytics.md — TRACKING_SCRIPT is deployment
# configuration, never baked into the build).
set -e

SITE_ROOT=/usr/share/nginx/html
VIEW_ROOT=/usr/share/nginx/view

mkdir -p "$SITE_ROOT" "$VIEW_ROOT"
cp -a /app/site/. "$SITE_ROOT/"
cp -a /app/site-view/. "$VIEW_ROOT/"

if [ -n "$TRACKING_SCRIPT" ]; then
  export TRACKING_SCRIPT
  # Every prerendered route is its own file, and every one of them is counted.
  find "$SITE_ROOT" -name 'index.html' -type f | while read -r page; do
    awk '
      index($0, ENVIRON["TRACKING_SCRIPT"]) { seen = 1 }
      /<\/head>/ && !seen && !injected { print ENVIRON["TRACKING_SCRIPT"]; injected = 1 }
      { print }
    ' "$page" >"$page.tmp"
    mv "$page.tmp" "$page"
  done
fi
