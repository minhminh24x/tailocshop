#!/bin/bash
# ============================================
# TaiLocShop - Update Deployment Script
# Chạy khi có thay đổi code, KHÔNG cài lại từ đầu
# ============================================

set -e
echo "🔄 TaiLocShop Update Script"
echo "============================"

cd /var/www/tailocshop-backend

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin master

# Install any new dependencies
echo "📦 Installing dependencies..."
cd backend
npm install --production

# Regenerate Prisma client
echo "🗄️ Updating database schema..."
npx prisma generate
npx prisma db push --accept-data-loss

# Restart app
echo "🚀 Restarting application..."
pm2 restart tailocshop-backend

echo ""
echo "✅ UPDATE COMPLETE!"
echo "Check logs: pm2 logs"
