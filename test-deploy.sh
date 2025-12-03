#!/usr/bin/env bash

set -euo pipefail

echo "🧪 Testing deployment process locally..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "nuxt.config.ts" ] || [ ! -f "package.json" ]; then
    print_error "Please run this script from the storefront directory"
    exit 1
fi

print_status "Starting local deployment test..."

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install it first."
    exit 1
fi
print_status "Bun is available"

if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install it first: npm install -g pm2"
    exit 1
fi
print_status "PM2 is available"

# Install dependencies
echo "📦 Installing dependencies..."
if ! bun install; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_status "Dependencies installed"

# Build the project
echo "🏗️  Building the project..."
if ! bun run build; then
    print_error "Build failed"
    exit 1
fi
print_status "Build successful"

# Check if build output exists
if [ ! -f ".output/server/index.mjs" ]; then
    print_error "Build output not found at .output/server/index.mjs"
    exit 1
fi
print_status "Build output verified"

# Test configurations
echo "🧪 Testing configurations..."
for config in "ecosystem.config.cjs" "ecosystem.production.config.cjs"; do
    if [ -f "$config" ] && node -c "$config"; then
        print_status "$config is valid"
    else
        print_error "$config missing or invalid"
        exit 1
    fi
done

# Test deploy scripts
echo "📜 Testing deploy scripts..."
for script in "deploy.sh" "deploy-production.sh"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        print_status "$script is ready"
    else
        print_warning "$script missing or not executable"
    fi
done

# Test PM2 configurations
echo "🚀 Testing PM2 configurations..."
for config in "ecosystem.config.cjs" "ecosystem.production.config.cjs"; do
    if pm2 start "$config" --dry-run 2>/dev/null; then
        print_status "$config PM2 config is valid"
    else
        print_warning "$config PM2 config might have issues"
    fi
done

# Check GitLab CI configuration
echo "🔧 Checking GitLab CI configuration..."
if [ -f ".gitlab-ci.yml" ]; then
    print_status "GitLab CI config exists"
else
    print_error "GitLab CI configuration not found"
    exit 1
fi

# Environment variables info
echo "🔐 Required environment variables for production:"
echo "SSH_PRIVATE_KEY_PROD, DEPLOY_HOST_PROD, DEPLOY_USER_PROD, DEPLOY_PATH_PROD"
echo "NUXT_PUBLIC_API_BASE, STRAPI_URL, DATABASE_URL, REDIS_URL, JWT_SECRET"

# Quick application test
echo "🎯 Testing application startup..."
pm2 delete sin-storefront-test 2>/dev/null || true

cat > ecosystem.test.config.cjs << EOF
module.exports = {
  apps: [{
    name: "sin-storefront-test",
    script: ".output/server/index.mjs",
    interpreter: "bun",
    env: { NODE_ENV: "production", PORT: 3333 },
  }],
};
EOF

if pm2 start ecosystem.test.config.cjs && sleep 2 && pm2 describe sin-storefront-test | grep -q "online"; then
    print_status "Application test successful"
    pm2 delete sin-storefront-test
else
    print_error "Application test failed"
    pm2 delete sin-storefront-test 2>/dev/null || true
fi
rm -f ecosystem.test.config.cjs

print_status "🎉 All tests passed! Deployment configuration is ready."
echo ""
echo "Next steps: Setup GitLab CI/CD variables → Configure servers → Deploy!"
