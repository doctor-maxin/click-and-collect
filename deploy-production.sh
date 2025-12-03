#!/usr/bin/env bash

set -euo pipefail

echo "🚀 Starting production deployment..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
export PATH=$PATH:$HOME/.bun/bin;

echo "📍 Current PATH: $PATH"

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if PM2 is running and get current processes
echo "🔍 Checking current PM2 processes..."
pm2 list

# Simple backup of current deployment
if [ -d ".output" ]; then
    echo "💾 Creating backup..."
    cp -r .output .output.backup || echo "⚠️  Backup failed, continuing..."
fi

# Start or reload the application
echo "🔄 Starting/Reloading application..."
pm2 startOrReload ecosystem.production.config.cjs --update-env

# Save PM2 configuration and show status
echo "💾 Saving PM2 configuration..."
pm2 save
pm2 list

# Simple health check
sleep 3
if pm2 describe sin-storefront-prod | grep -q "online"; then
    echo "✅ Production deployment successful!"
else
    echo "❌ Deployment failed! Check logs: pm2 logs sin-storefront-prod"
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
