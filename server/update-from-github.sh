#!/bin/bash
# Safe CRM update from GitHub — keeps existing DB, applies schema migrations on start.
# Does NOT run seed.js. Does NOT overwrite crm.db.

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/crm-app}"
REPO_URL="${REPO_URL:-https://github.com/AndrewF250/CRM.git}"
BRANCH="${BRANCH:-main}"
BACKUP_DIR="$APP_DIR/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"

echo "=== CRM update from GitHub ($BRANCH) ==="
echo "App dir: $APP_DIR"

mkdir -p "$BACKUP_DIR" "$APP_DIR"

# Find SQLite DB (common locations)
find_db() {
  for p in \
    "$APP_DIR/crm.db" \
    "$APP_DIR/server/crm.db" \
    "$APP_DIR/data/crm.db" \
    /var/www/crm/crm.db \
    /var/www/crm/server/crm.db
  do
    if [ -f "$p" ]; then echo "$p"; return 0; fi
  done
  # fallback search
  find /var/www -name 'crm.db' -type f 2>/dev/null | head -1 || true
}

DB_PATH="$(find_db)"
if [ -n "${DB_PATH:-}" ]; then
  echo "Found DB: $DB_PATH"
  cp -a "$DB_PATH" "$BACKUP_DIR/crm_${STAMP}.db"
  echo "Backup: $BACKUP_DIR/crm_${STAMP}.db"
else
  echo "WARNING: crm.db not found yet — will be created on first start (migrations only)."
fi

# Sync code without touching DB / uploads / node_modules
WORKDIR="/tmp/crm-update-$STAMP"
rm -rf "$WORKDIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$WORKDIR"

# Prefer contents of server/ if repo layout has it
SRC="$WORKDIR/server"
if [ ! -d "$SRC" ]; then SRC="$WORKDIR"; fi

echo "Syncing code from $SRC -> $APP_DIR (preserving DB & uploads)..."
rsync -a \
  --exclude 'crm.db' \
  --exclude 'crm.db-*' \
  --exclude '*.db' \
  --exclude '*.db-wal' \
  --exclude '*.db-shm' \
  --exclude 'uploads/' \
  --exclude 'backups/' \
  --exclude 'node_modules/' \
  --exclude '.git/' \
  "$SRC/" "$APP_DIR/"

# Ensure DB stays where the app expects it (APP_DIR/crm.db)
if [ -n "${DB_PATH:-}" ] && [ "$DB_PATH" != "$APP_DIR/crm.db" ]; then
  if [ ! -f "$APP_DIR/crm.db" ]; then
    echo "Linking/copying DB to $APP_DIR/crm.db"
    cp -a "$DB_PATH" "$APP_DIR/crm.db"
  fi
fi

cd "$APP_DIR"
echo "npm install..."
npm install --omit=dev

# Restart process — database.js migrations add columns/tables, keep old rows
if command -v pm2 >/dev/null 2>&1; then
  echo "Restarting PM2 app 'crm'..."
  if pm2 describe crm >/dev/null 2>&1; then
    pm2 restart crm --update-env
  else
    pm2 start server.js --name crm
  fi
  pm2 save || true
else
  echo "PM2 not found — start manually: cd $APP_DIR && node server.js"
fi

rm -rf "$WORKDIR"
echo "=== Update complete ==="
echo "Old data kept. New schema applied on process start (ALTER / CREATE IF NOT EXISTS)."
if [ -n "${DB_PATH:-}" ]; then
  echo "Backup at: $BACKUP_DIR/crm_${STAMP}.db"
fi
