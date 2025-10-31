# Deployment Guide

This guide covers deploying the Tour Operator CRM to production.

## Production Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Nginx      │────▶│   Next.js    │
│   Browser    │     │   (SSL/CDN)  │     │   Frontend   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   NestJS     │
                     │   Backend    │
                     └──────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
         ┌─────────────┐         ┌──────────┐
         │   MySQL     │         │  Redis   │
         │  (Primary)  │         │  Cache   │
         └─────────────┘         └──────────┘
```

## Prerequisites

- **Ubuntu 22.04** or similar Linux server
- **Min specs**: 2 CPU, 4GB RAM, 20GB SSD
- **Domain** with DNS configured
- **SSL Certificate** (Let's Encrypt recommended)

## 1. Server Setup

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v18.x.x
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Install MySQL 8

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Create database and user:

```sql
CREATE DATABASE tour_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tourcrm'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON tour_crm.* TO 'tourcrm'@'localhost';
FLUSH PRIVILEGES;
```

### Install Redis (Optional but Recommended)

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

## 2. Application Deployment

### Create Application User

```bash
sudo adduser --system --group tourcrm
sudo mkdir -p /var/www/tourcrm
sudo chown tourcrm:tourcrm /var/www/tourcrm
```

### Clone and Build

```bash
# Switch to app user
sudo -u tourcrm bash

# Clone repository
cd /var/www/tourcrm
git clone <your-repo-url> .

# Install dependencies
npm install --production=false

# Build all workspaces
npm run build
```

### Environment Configuration

Create production `.env`:

```bash
sudo -u tourcrm nano /var/www/tourcrm/.env
```

```env
# Database
DATABASE_URL="mysql://tourcrm:strong_password@localhost:3306/tour_crm"

# API
NODE_ENV="production"
PORT=3001
API_PREFIX="api/v1"

# JWT - CHANGE THESE!
JWT_SECRET="your-production-secret-min-32-chars"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="https://yourapp.com"

# Frontend
NEXT_PUBLIC_API_URL="https://api.yourapp.com/api/v1"

# Redis
REDIS_URL="redis://localhost:6379"

# Storage
UPLOAD_DIR="/var/www/tourcrm/storage/uploads"
PDF_STORAGE_PATH="/var/www/tourcrm/storage/invoices"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Run Database Migrations

```bash
cd /var/www/tourcrm
npm run prisma:generate
npm run prisma:migrate
npm run seed  # Create initial super admin
```

## 3. PM2 Setup

### Backend (API) Process

```bash
# Start backend
pm2 start apps/api/dist/main.js \
  --name "tourcrm-api" \
  --cwd /var/www/tourcrm \
  -i 2 \
  --env production

# Start frontend
pm2 start npm \
  --name "tourcrm-web" \
  --cwd /var/www/tourcrm/apps/web \
  -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

### PM2 Configuration File (Optional)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'tourcrm-api',
      cwd: '/var/www/tourcrm',
      script: 'apps/api/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'tourcrm-web',
      cwd: '/var/www/tourcrm/apps/web',
      script: 'npm',
      args: 'start',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

Then:

```bash
pm2 start ecosystem.config.js
```

## 4. Nginx Configuration

### API Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/tourcrm-api
```

```nginx
server {
    listen 80;
    server_name api.yourapp.com;

    location / {
        proxy_pass http://localhost:3001;
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

### Frontend Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/tourcrm-web
```

```nginx
server {
    listen 80;
    server_name yourapp.com www.yourapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable sites:

```bash
sudo ln -s /etc/nginx/sites-available/tourcrm-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tourcrm-web /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourapp.com -d www.yourapp.com
sudo certbot --nginx -d api.yourapp.com

# Auto-renewal (should be automatic)
sudo certbot renew --dry-run
```

## 6. Firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

## 7. Monitoring & Logs

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs tourcrm-api
pm2 logs tourcrm-web

# Monitor resources
pm2 monit
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
```

### Application Logs

```bash
# API logs
tail -f /var/www/tourcrm/apps/api/logs/app.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 8. Database Backup

### Automated Daily Backups

Create backup script:

```bash
sudo nano /usr/local/bin/backup-tourcrm-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/tourcrm"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tour_crm_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

mysqldump -u tourcrm -p'strong_password' tour_crm | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/backup-tourcrm-db.sh
```

Add to crontab:

```bash
sudo crontab -e
```

```cron
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-tourcrm-db.sh >> /var/log/tourcrm-backup.log 2>&1
```

## 9. Updates & Maintenance

### Deploying Updates

```bash
cd /var/www/tourcrm

# Pull latest changes
git pull

# Install new dependencies
npm install

# Run migrations
npm run prisma:migrate

# Rebuild
npm run build

# Restart services
pm2 restart all
```

### Zero-Downtime Deployment (Advanced)

Use PM2 cluster mode with reload:

```bash
pm2 reload tourcrm-api
```

## 10. Security Checklist

- [ ] Strong database passwords
- [ ] JWT secrets changed from defaults
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (ufw)
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Database backups automated
- [ ] Rate limiting enabled (API)
- [ ] CORS properly configured
- [ ] Environment variables secured (not in git)
- [ ] PM2 logs rotated
- [ ] MySQL external access disabled
- [ ] Redis password protected (if exposed)

## 11. Performance Optimization

### MySQL Tuning

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
query_cache_size = 256M
```

### Redis Tuning

```bash
sudo nano /etc/redis/redis.conf
```

```conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### Nginx Caching

Add to nginx config:

```nginx
location /_next/static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, immutable";
}
```

## 12. Monitoring (Optional)

### Setup Prometheus + Grafana

```bash
# Install Prometheus
sudo apt install -y prometheus

# Install Grafana
sudo apt-get install -y apt-transport-https software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt update && sudo apt install -y grafana
```

## Troubleshooting

### API not starting

```bash
pm2 logs tourcrm-api --lines 100
```

Common issues:
- Database connection failed → Check DATABASE_URL in `.env`
- Port already in use → `lsof -i :3001`
- Permissions → `chown -R tourcrm:tourcrm /var/www/tourcrm`

### Frontend not loading

```bash
pm2 logs tourcrm-web --lines 100
```

Common issues:
- API URL wrong → Check `NEXT_PUBLIC_API_URL`
- Build failed → `npm run build` in apps/web

### Database connection issues

```bash
mysql -u tourcrm -p
```

## Support

For deployment issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `/var/log/nginx/error.log`
3. System logs: `journalctl -xe`

---

**Production Checklist Complete!** Your Tour CRM should now be live and secure.
