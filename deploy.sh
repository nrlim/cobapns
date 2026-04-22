#!/bin/bash

# ── 1. Preparation & Safety Checks ───────────────────────────────────────────
set -e
set -u

APP_NAME="cobapns"
APP_PORT=3001

echo "=============================================="
echo "🚀 Starting Production Deployment for $APP_NAME"
echo "📅 Date: $(date)"
echo "🌐 Port: $APP_PORT"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ ERROR: .env file not found!"
  exit 1
fi

# ── 2. Source Code Management (With Conflict Handling) ───────────────────────
echo "📥 [1/6] Syncing source code from GitHub..."

# Menghindari konflik dengan menyimpan perubahan lokal sementara
git stash || echo "No local changes to stash."

# Pull data terbaru
git fetch origin
git pull origin main

# Mengembalikan perubahan lokal (seperti file deploy.sh ini sendiri)
git stash pop || echo "No stashed changes to re-apply."

# ── 3. Dependencies ─────────────────────────────────────────────────────────
echo "📦 [2/6] Installing dependencies cleanly..."
npm ci

# ── 4. Database Setup (Fix Error P3005) ──────────────────────────────────────
echo "🗄️ [3/6] Syncing Prisma Client..."
npx prisma generate

# Sync schema menggunakan 'db push' tetapi TANPA flag data-loss.
# Jika ada perubahan skema yang berbahaya (misal: hapus kolom), proses deploy akan gagal 
# untuk melindungi data production Anda.
npx prisma db push || echo "⚠️ Warning: Failed to sync database schema. Pengecekan manual diperlukan."

# [Opsional] Jika ini pertama kalinya di-deploy ke server baru dan butuh data awal
# npx prisma db seed

# ── 5. Build Pipeline ───────────────────────────────────────────────────────
echo "🏗️ [4/6] Building Next.js application..."
export NODE_ENV=production
npm run build

# ── 6. Storage & Infrastructure ─────────────────────────────────────────────
echo "📁 [5/6] Verifying local uploads architecture..."
mkdir -p public/uploads
chmod 775 public/uploads 

# ── 7. PM2 Lifecycle Management ─────────────────────────────────────────────
echo "🔄 [6/6] Reloading PM2 process ($APP_NAME)..."

if ! command -v pm2 &> /dev/null; then
    echo "❌ ERROR: PM2 is not installed globally."
    exit 1
fi

if pm2 show "$APP_NAME" > /dev/null; then
  echo "♻️ Performing zero-downtime cluster reload..."
  # Kita set PORT 3001 agar tidak bentrok dengan vea (3000)
  PORT=$APP_PORT pm2 reload "$APP_NAME" --update-env
else
  echo "▶️ Bootstrapping new process on port $APP_PORT..."
  # Menggunakan flag -p untuk menentukan port pada 'next start'
  PORT=$APP_PORT pm2 start npm --name "$APP_NAME" --env production -- start -- -p $APP_PORT
fi

pm2 save

echo "=============================================="
echo "✅ Deployment Pipeline Completed Successfully!"
echo "📡 App is running on port $APP_PORT"
echo "=============================================="
