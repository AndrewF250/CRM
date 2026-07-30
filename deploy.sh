#!/bin/bash
# CRM Deployment Script

SERVER="root@78.17.100.31"
REMOTE_DIR="/var/www/crm-app"

echo "=== Deploying CRM ==="

# 1. Create remote directory
echo "1. Creating directory on server..."
ssh -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $REMOTE_DIR/uploads"

# 2. Upload server files
echo "2. Uploading server files..."
scp -o StrictHostKeyChecking=no -r ./server/* "$SERVER:$REMOTE_DIR/"

# 3. Install Node.js if not installed
echo "3. Installing Node.js..."
ssh -o StrictHostKeyChecking=no "$SERVER" "which node || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)"

# 4. Install dependencies and seed
echo "4. Installing npm dependencies..."
ssh -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && npm install && node seed.js"

# 5. Install PM2
echo "5. Installing PM2..."
ssh -o StrictHostKeyChecking=no "$SERVER" "which pm2 || npm install -g pm2"

# 6. Stop existing PM2 process
echo "6. Stopping existing processes..."
ssh -o StrictHostKeyChecking=no "$SERVER" "pm2 stop crm 2>/dev/null || true"

# 7. Start with PM2
echo "7. Starting CRM application..."
ssh -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && pm2 start server.js --name crm && pm2 save"

# 8. Restart nginx
echo "8. Restarting nginx..."
ssh -o StrictHostKeyChecking=no "$SERVER" "nginx -t && systemctl restart nginx"

# 9. PM2 startup
echo "9. Setting up PM2 startup..."
ssh -o StrictHostKeyChecking=no "$SERVER" "pm2 startup && pm2 save"

echo ""
echo "=== Deployment Complete ==="
echo "CRM is available at: http://78.17.100.31/"
