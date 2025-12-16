#!/bin/bash
# ============================================
# TaiLocShop - Complete VPS Deploy Script
# Includes PostgreSQL installation on VPS
# ============================================

set -e
echo "🚀 TaiLocShop Complete Deploy Script"
echo "====================================="

# Configuration
DOMAIN="api.minhminh24x.me"
FRONTEND_URL="https://shop.minhminh24x.me"
DB_NAME="tailocshop"
DB_USER="tailocshop_user"
DB_PASS="TaiLocShop2024SecureDB!"
JWT_SECRET=$(openssl rand -hex 64)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# Step 1: Cleanup
# ============================================
echo -e "${YELLOW}[1/9] Cleaning up old applications...${NC}"
pkill -f "node" 2>/dev/null || true
pkill -f "python" 2>/dev/null || true
pkill -f "gunicorn" 2>/dev/null || true
pm2 kill 2>/dev/null || true
rm -rf /var/www/tailocshop-backend 2>/dev/null || true
rm -rf /root/bot* /root/python* 2>/dev/null || true
crontab -r 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup done${NC}"

# ============================================
# Step 2: Update system & install dependencies
# ============================================
echo -e "${YELLOW}[2/9] Installing system dependencies...${NC}"
apt update
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 20
if ! command -v node &> /dev/null || [[ $(node -v) != v20* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# Install PM2
npm install -g pm2

echo "Node: $(node -v), NPM: $(npm -v)"
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================
# Step 3: Install PostgreSQL
# ============================================
echo -e "${YELLOW}[3/9] Installing PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
fi

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
-- Drop existing if any
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user and database
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Allow connections
ALTER USER $DB_USER CREATEDB;
\q
EOF

echo -e "${GREEN}✓ PostgreSQL installed and configured${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# ============================================
# Step 4: Clone repository
# ============================================
echo -e "${YELLOW}[4/9] Cloning repository...${NC}"
mkdir -p /var/www/tailocshop-backend
cd /var/www/tailocshop-backend
git clone https://github.com/minhminh24x/tailocshop.git .

echo -e "${GREEN}✓ Repository cloned${NC}"

# ============================================
# Step 5: Setup backend
# ============================================
echo -e "${YELLOW}[5/9] Setting up backend...${NC}"
cd /var/www/tailocshop-backend/backend
npm install --production

echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================
# Step 6: Create production .env
# ============================================
echo -e "${YELLOW}[6/9] Creating environment file...${NC}"

cat > .env << EOF
# =====================================
# PRODUCTION ENVIRONMENT
# Auto-generated: $(date)
# =====================================
NODE_ENV=production

# PostgreSQL on VPS
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# JWT Secret (auto-generated, 64 bytes hex)
JWT_SECRET_KEY="${JWT_SECRET}"

# Email Configuration
EMAIL_SERVICE="Gmail"
EMAIL_USERNAME=loclm112.noreply@gmail.com
EMAIL_PASSWORD=kolo pzhk uwcw ralv

# Frontend URL for CORS
FRONTEND_URL=${FRONTEND_URL}
EOF

echo -e "${GREEN}✓ Environment file created${NC}"

# ============================================
# Step 7: Run Prisma migrations
# ============================================
echo -e "${YELLOW}[7/9] Setting up database schema...${NC}"
npx prisma generate
npx prisma db push --accept-data-loss

# Run seed to populate initial data
echo -e "${YELLOW}[7b/9] Seeding database with initial data...${NC}"
npx prisma db seed

echo -e "${GREEN}✓ Database schema created and seeded${NC}"

# ============================================
# Step 8: Configure Nginx
# ============================================
echo -e "${YELLOW}[8/9] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/tailocshop << EOF
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tailocshop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# ============================================
# Step 9: Start with PM2
# ============================================
echo -e "${YELLOW}[9/9] Starting application...${NC}"

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tailocshop-backend',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}✓ Application started${NC}"

# ============================================
# Setup Firewall
# ============================================
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# ============================================
# DONE!
# ============================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "📍 API URL: http://$DOMAIN"
echo ""
echo "📊 Database Info:"
echo "   Host: localhost:5432"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""
echo "🔐 JWT Secret has been auto-generated"
echo ""
echo "📋 Next Steps:"
echo "   1. Setup SSL: certbot --nginx -d $DOMAIN"
echo "   2. Redeploy frontend on Vercel"
echo ""
echo "🛠️ Useful Commands:"
echo "   pm2 status              - Check status"
echo "   pm2 logs                - View logs"
echo "   pm2 restart all         - Restart app"
echo "   sudo -u postgres psql   - Access database"
echo ""
