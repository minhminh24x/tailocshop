# TaiLocShop Backend - VPS Deployment Guide

## 📋 Thông tin VPS
- **IP:** 152.42.197.146
- **Domain API:** api.minhminh24x.me
- **Frontend:** shop.minhminh24x.me (Vercel)

---

## 🚀 Hướng dẫn Deploy (Step-by-step)

### Bước 1: SSH vào VPS
```bash
ssh root@152.42.197.146
# Password: LocLM112@a
```

### Bước 2: Dọn dẹp hệ thống cũ
```bash
# Dừng tất cả processes
pkill -f "node" || true
pkill -f "python" || true
pm2 kill 2>/dev/null || true

# Xóa thư mục cũ
rm -rf /root/bot* /root/python* /var/www/* 2>/dev/null || true
```

### Bước 3: Cài đặt dependencies
```bash
# Update system
apt update && apt upgrade -y

# Cài đặt Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx git

# Cài PM2
npm install -g pm2

# Verify
node -v  # Should show v20.x.x
```

### Bước 4: Clone repository
```bash
mkdir -p /var/www/tailocshop-backend
cd /var/www/tailocshop-backend

# Nếu repo ở GitHub:
git clone https://github.com/YOUR_USERNAME/tailocshop.git .

# Hoặc upload bằng SCP từ máy local:
# scp -r ./backend root@152.42.197.146:/var/www/tailocshop-backend/
```

### Bước 5: Cấu hình môi trường
```bash
cd /var/www/tailocshop-backend/backend
npm install --production

# Tạo file .env
nano .env
```

**Nội dung .env:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://tailocshopdb_user:VvxevradKIj8kXKyFPzMMPL3V0oxmmyw@dpg-d45hjrfdiees7389d8o0-a.singapore-postgres.render.com/tailocshopdb"
JWT_SECRET_KEY="GENERATE_STRONG_SECRET_HERE"
EMAIL_SERVICE="Gmail"
EMAIL_USERNAME=loclm112.noreply@gmail.com
EMAIL_PASSWORD=kolo pzhk uwcw ralv
FRONTEND_URL=https://shop.minhminh24x.me
```

### Bước 6: Setup Database
```bash
npx prisma generate
npx prisma db push
```

### Bước 7: Cấu hình Nginx
```bash
nano /etc/nginx/sites-available/tailocshop-backend
```

**Nội dung:**
```nginx
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
```

```bash
# Enable site
ln -sf /etc/nginx/sites-available/tailocshop-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### Bước 8: Khởi động với PM2
```bash
cd /var/www/tailocshop-backend/backend

# Tạo ecosystem config
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
```

### Bước 9: Cài SSL (HTTPS)
```bash
certbot --nginx -d api.minhminh24x.me
```

---

## ✅ Kiểm tra

1. **Test API:**
   ```bash
   curl https://api.minhminh24x.me/api/items
   ```

2. **Xem logs:**
   ```bash
   pm2 logs
   ```

3. **Restart app:**
   ```bash
   pm2 restart tailocshop-backend
   ```

---

## 🔧 Troubleshooting

### Lỗi CORS
Đảm bảo `FRONTEND_URL` trong `.env` đúng:
```
FRONTEND_URL=https://shop.minhminh24x.me
```

### Lỗi Database
Check connection:
```bash
cd /var/www/tailocshop-backend/backend
npx prisma db pull
```

### Lỗi PM2
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 logs --lines 100
```
