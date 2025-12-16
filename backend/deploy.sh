#!/bin/bash
# ============================================
# TaiLocShop Backend - VPS Deployment Script
# For Ubuntu 24.04 LTS
# Domain: api.minhminh24x.me
# ============================================

set -e  # Exit on error

echo "🚀 TaiLocShop Backend Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="tailocshop-backend"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="api.minhminh24x.me"
FRONTEND_URL="https://shop.minhminh24x.me"
NODE_VERSION="20"

# ============================================
# Step 1: Clean up old applications
# ============================================
echo -e "${YELLOW}[1/8] Cleaning up old applications...${NC}"

# Stop any existing Node/Python processes
pkill -f "node" || true
pkill -f "python" || true
pkill -f "gunicorn" || true

# Remove old PM2 processes if exists
pm2 kill 2>/dev/null || true

# Clean up old project directories
rm -rf /root/bot* 2>/dev/null || true
rm -rf /root/python* 2>/dev/null || true
rm -rf /var/www/* 2>/dev/null || true

# Remove old cron jobs
crontab -r 2>/dev/null || true

echo -e "${GREEN}✓ Cleanup completed${NC}"

# ============================================
# Step 2: Update system & install dependencies
# ============================================
echo -e "${YELLOW}[2/8] Updating system and installing dependencies...${NC}"

apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 20
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi

# Install PM2 globally
npm install -g pm2

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# ============================================
# Step 3: Setup Firewall
# ============================================
echo -e "${YELLOW}[3/8] Configuring firewall...${NC}"

ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

# ============================================
# Step 4: Clone repository & install dependencies
# ============================================
echo -e "${YELLOW}[4/8] Setting up application...${NC}"

mkdir -p $APP_DIR
cd $APP_DIR

# Clone the repository (you need to replace with your actual repo URL)
if [ ! -d ".git" ]; then
    echo "Please run: git clone YOUR_REPO_URL ."
    echo "Or copy your backend folder to $APP_DIR"
    read -p "Press Enter after copying files..."
fi

# Install npm dependencies
cd $APP_DIR/backend 2>/dev/null || cd $APP_DIR
npm install --production

echo -e "${GREEN}✓ Application setup completed${NC}"

# ============================================
# Step 5: Create environment file
# ============================================
echo -e "${YELLOW}[5/8] Creating production environment file...${NC}"

# Check if .env.production exists
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# =====================================
# PRODUCTION ENVIRONMENT
# =====================================
NODE_ENV=production

# PostgreSQL Database (UPDATE THIS!)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT Secret (CHANGE THIS TO A STRONG RANDOM STRING!)
JWT_SECRET_KEY="GENERATE_A_STRONG_64_CHAR_SECRET_HERE"

# Email Configuration
EMAIL_SERVICE="Gmail"
EMAIL_USERNAME=loclm112.noreply@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Frontend URL for CORS
FRONTEND_URL=https://shop.minhminh24x.me
EOF
    
    echo -e "${RED}⚠️  IMPORTANT: Please edit .env file with your actual credentials!${NC}"
    echo "Run: nano .env"
    read -p "Press Enter after editing .env file..."
fi

echo -e "${GREEN}✓ Environment file created${NC}"

# ============================================
# Step 6: Run Prisma migrations
# ============================================
echo -e "${YELLOW}[6/8] Running database migrations...${NC}"

npx prisma generate
npx prisma db push

echo -e "${GREEN}✓ Database migrations completed${NC}"

# ============================================
# Step 7: Configure Nginx as reverse proxy
# ============================================
echo -e "${YELLOW}[7/8] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# ============================================
# Step 8: Setup PM2 and start application
# ============================================
echo -e "${YELLOW}[8/8] Starting application with PM2...${NC}"

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME-combined.log',
    time: true
  }]
};
EOF

# Create log directory
mkdir -p /var/log/pm2

# Start with PM2
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}✓ Application started with PM2${NC}"

# ============================================
# Setup SSL with Let's Encrypt
# ============================================
echo -e "${YELLOW}[OPTIONAL] Setting up SSL...${NC}"
echo "Run this command to enable HTTPS:"
echo "certbot --nginx -d $DOMAIN"

# ============================================
# Done!
# ============================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Your API should be available at:"
echo "  http://$DOMAIN"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your actual DATABASE_URL and secrets"
echo "  2. Run: certbot --nginx -d $DOMAIN (for HTTPS)"
echo "  3. Update frontend to use https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  pm2 status         - Check app status"
echo "  pm2 logs           - View logs"
echo "  pm2 restart all    - Restart app"
echo ""
