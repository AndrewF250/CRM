#!/bin/bash
# CRM Deployment Script for Finland Server

SERVER="root@78.17.100.31"
SSH_KEY="C:\Users\Максим\.ssh\finland_key"
REMOTE_DIR="/var/www/crm-app"

echo "=== Deploying CRM to Finland Server ==="

# 1. Create remote directory
echo "1. Creating directory on server..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "mkdir -p $REMOTE_DIR/uploads"

# 2. Upload server files
echo "2. Uploading server files..."
scp -o StrictHostKeyChecking=no -i "$SSH_KEY" -r "C:\Users\Максим\Desktop\crm-template\server\*" "$SERVER:$REMOTE_DIR/"

# 3. Install Node.js if not installed
echo "3. Installing Node.js..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "which node || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)"

# 4. Install dependencies
echo "4. Installing npm dependencies..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && npm install"

# 5. Install PM2 for process management
echo "5. Installing PM2..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "which pm2 || npm install -g pm2"

# 6. Stop existing PM2 process if running
echo "6. Stopping existing processes..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "pm2 stop crm 2>/dev/null || true"

# 7. Start the application with PM2
echo "7. Starting CRM application..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && pm2 start server.js --name crm && pm2 save"

# 8. Update nginx config
echo "8. Updating nginx configuration..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "cat > /etc/nginx/sites-available/crm << 'NGINX'
server {
    listen 80 default_server;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
    }
}
NGINX"

# 9. Restart nginx
echo "9. Restarting nginx..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "nginx -t && systemctl restart nginx"

# 10. Set up PM2 to start on boot
echo "10. Setting up PM2 startup..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "pm2 startup && pm2 save"

echo ""
echo "=== Deployment Complete ==="
echo "CRM is available at: http://78.17.100.31/"
echo ""
echo "To check status: ssh -i $SSH_KEY $SERVER 'pm2 status'"
echo "To view logs: ssh -i $SSH_KEY $SERVER 'pm2 logs crm'"
