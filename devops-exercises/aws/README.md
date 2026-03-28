# AWS EC2 Deployment — Hands-On Guide

Deploy the nodelearn API to a real AWS server you control.

## Prerequisites
- AWS Account (free tier): https://aws.amazon.com/free/
- Your nodelearn repo on GitHub

---

## Step 1: Launch an EC2 Instance

1. Go to AWS Console > EC2 > Launch Instance
2. Settings:
   - **Name**: nodelearn-server
   - **AMI**: Ubuntu Server 24.04 LTS (free tier eligible)
   - **Instance type**: t2.micro (free tier)
   - **Key pair**: Create new > name it `nodelearn-key` > Download the .pem file
   - **Network**: Allow SSH (port 22), HTTP (port 80), HTTPS (port 443)
   - Also add Custom TCP rule for port 3000
3. Click Launch Instance
4. Wait 1-2 minutes for it to start

---

## Step 2: Connect to Your Server via SSH

```bash
# Make your key file secure (required by SSH)
chmod 400 ~/Downloads/nodelearn-key.pem

# Connect to the server (replace with your Public IP from EC2 dashboard)
ssh -i ~/Downloads/nodelearn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# You're now logged into your AWS server!
```

---

## Step 3: Run the Setup Script

Once connected to your server:

```bash
# Download and run the setup script from your repo
curl -fsSL https://raw.githubusercontent.com/amit-surwar/nodelearn/main/deploy/setup.sh | bash
```

This automatically installs:
- Node.js 20
- PM2 (process manager)
- Nginx (reverse proxy)
- Certbot (SSL certificates)

---

## Step 4: Configure Environment Variables

```bash
cd /var/www/nodelearn

# Create the .env file
nano .env
```

Add these (paste and save with Ctrl+X, Y, Enter):

```
PORT=3000
MONGODB_URI=mongodb+srv://nodelearn:Nodelearn123@nodelearn.5ggzxvn.mongodb.net/users_db?retryWrites=true&w=majority&appName=nodelearn
JWT_SECRET=aws_production_secret_change_this
NODE_ENV=production
```

---

## Step 5: Start the App with PM2

```bash
# Start the app
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs nodelearn

# Save PM2 config (auto-restart on server reboot)
pm2 save
pm2 startup
# Copy and run the command it gives you
```

### Test it:
```bash
curl http://localhost:3000/api/v1/health
```

---

## Step 6: Set Up Nginx Reverse Proxy

```bash
# Copy nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/nodelearn

# For now, edit it to use your EC2 IP instead of a domain
sudo nano /etc/nginx/sites-available/nodelearn
```

Replace the content with this (simpler version without SSL for now):

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nodelearn /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Test from anywhere:
```
GET http://YOUR_EC2_PUBLIC_IP/api/v1/health
```

---

## Step 7: Set Up CloudWatch Monitoring

1. Go to AWS Console > CloudWatch
2. Click Dashboards > Create Dashboard > name it "nodelearn"
3. Add widgets for:
   - **EC2 CPU Utilization** — how busy your server is
   - **EC2 Network In/Out** — traffic to your server
   - **EC2 Status Checks** — is the server healthy

### Set up an alarm:
1. CloudWatch > Alarms > Create Alarm
2. Select metric: EC2 > Per-Instance > CPUUtilization
3. Threshold: Greater than 80% for 5 minutes
4. Notification: Add your email
5. Now you get emailed if your server is overloaded!

---

## Step 8: Deploy Updates (Manual)

When you push new code to GitHub:

```bash
# SSH into your server
ssh -i ~/Downloads/nodelearn-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Pull latest code
cd /var/www/nodelearn
git pull origin main

# Install any new dependencies
npm ci --only=production

# Restart the app
pm2 restart nodelearn
```

---

## Step 9: Auto-Deploy with GitHub Actions (CI/CD)

Edit `.github/workflows/deploy.yml` and uncomment the VPS deploy section:

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      cd /var/www/nodelearn
      git pull origin main
      npm ci --only=production
      pm2 restart nodelearn
```

Then in GitHub repo Settings > Secrets, add:
- `VPS_HOST`: Your EC2 public IP
- `VPS_USER`: ubuntu
- `VPS_SSH_KEY`: Contents of your .pem file

Now every `git push` to main auto-deploys to your EC2 server!

---

## AWS Services You Learned

| Service | What it does |
|---------|-------------|
| **EC2** | Virtual server in the cloud |
| **Security Groups** | Firewall rules (which ports are open) |
| **Key Pairs** | SSH keys for secure server access |
| **CloudWatch** | Monitoring, dashboards, alarms |
| **IAM** (next) | User permissions and roles |

---

## Cost Warning

- t2.micro is FREE for 12 months (750 hours/month)
- After free tier: ~$8.50/month
- **ALWAYS stop your instance when not using it** (EC2 > right-click > Stop)
- Stopped instances don't charge for compute (only storage ~$0.80/month)

---

## Cheat Sheet

| Command | What it does |
|---------|-------------|
| `ssh -i key.pem ubuntu@IP` | Connect to server |
| `pm2 start ecosystem.config.js` | Start app |
| `pm2 status` | Check app status |
| `pm2 logs` | View app logs |
| `pm2 restart nodelearn` | Restart app |
| `sudo nginx -t` | Test nginx config |
| `sudo systemctl reload nginx` | Apply nginx changes |
| `sudo certbot --nginx` | Get SSL certificate |
