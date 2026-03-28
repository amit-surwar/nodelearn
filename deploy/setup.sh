#!/bin/bash
# ==============================================
# VPS Server Setup Script
# Run this on a fresh Ubuntu 22.04+ server
# Usage: bash setup.sh
# ==============================================

set -e

echo "=== Updating system packages ==="
sudo apt update && sudo apt upgrade -y

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing Nginx ==="
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "=== Installing Certbot (SSL) ==="
sudo apt install -y certbot python3-certbot-nginx

echo "=== Creating app directory ==="
sudo mkdir -p /var/www/nodelearn
sudo chown $USER:$USER /var/www/nodelearn

echo "=== Cloning repository ==="
cd /var/www/nodelearn
git clone https://github.com/amit-surwar/nodelearn.git .
npm ci --only=production

echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "1. Create .env file:  nano /var/www/nodelearn/.env"
echo "2. Add your environment variables (MONGODB_URI, JWT_SECRET, etc.)"
echo "3. Start with PM2:    pm2 start ecosystem.config.js --env production"
echo "4. Save PM2 config:   pm2 save && pm2 startup"
echo "5. Setup Nginx:       sudo cp deploy/nginx.conf /etc/nginx/sites-available/nodelearn"
echo "6. Enable site:       sudo ln -s /etc/nginx/sites-available/nodelearn /etc/nginx/sites-enabled/"
echo "7. Get SSL cert:      sudo certbot --nginx -d your-domain.com"
echo "8. Test Nginx:        sudo nginx -t && sudo systemctl reload nginx"
