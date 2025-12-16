#!/bin/bash
# ============================================
# TaiLocShop - Quick Deploy Script
# Chạy lệnh này trên VPS: bash <(curl -s https://raw.githubusercontent.com/minhminh24x/tailocshop/master/backend/quick-deploy.sh)
# ============================================

set -e
echo "🚀 TaiLocShop Quick Deploy"

# Cleanup
echo "🧹 Cleaning up..."
pkill -f "node" 2>/dev/null || true
pkill -f "python" 2>/dev/null || true
pm2 kill 2>/dev/null || true
rm -rf /var/www/tailocshop-backend 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
apt update -qq
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
apt install -y nodejs nginx >/dev/null 2>&1
npm install -g pm2 >/dev/null 2>&1

# Clone repo
echo "📥 Cloning repository..."
mkdir -p /var/www/tailocshop-backend
cd /var/www/tailocshop-backend
git clone https://github.com/minhminh24x/tailocshop.git . 2>/dev/null

# Setup backend
echo "⚙️ Setting up backend..."
cd backend
npm install --production --silent

# Create .env
cat > .env << 'ENVFILE'
NODE_ENV=production
DATABASE_URL="postgresql://tailocshopdb_user:VvxevradKIj8kXKyFPzMMPL3V0oxmmyw@dpg-d45hjrfdiees7389d8o0-a.singapore-postgres.render.com/tailocshopdb"
JWT_SECRET_KEY="TaiLocShopSuperSecretKeyForProductionEnvironment2024VerySecure"
EMAIL_SERVICE="Gmail"
EMAIL_USERNAME=loclm112.noreply@gmail.com
EMAIL_PASSWORD=kolo pzhk uwcw ralv
FRONTEND_URL=https://shop.minhminh24x.me
ENVFILE

# Prisma
echo "🗄️ Setting up database..."
npx prisma generate >/dev/null 2>&1
npx prisma db push --accept-data-loss >/dev/null 2>&1

# Nginx config
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/tailocshop << 'NGINX'
server {
    listen 80;
    server_name api.minhminh24x.me;
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/tailocshop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# Start with PM2
echo "🚀 Starting application..."
pm2 start server/index.js --name tailocshop-backend -i 1
pm2 save
pm2 startup >/dev/null 2>&1

# Firewall
ufw allow 22 >/dev/null 2>&1
ufw allow 80 >/dev/null 2>&1
ufw allow 443 >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo "API: http://api.minhminh24x.me"
echo ""
echo "Next: Run this for HTTPS:"
echo "  apt install -y certbot python3-certbot-nginx"
echo "  certbot --nginx -d api.minhminh24x.me"
echo ""
echo "Commands:"
echo "  pm2 logs    - View logs"
echo "  pm2 restart tailocshop-backend - Restart"
