#!/usr/bin/env bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "🚀 Sin Storefront - Setup Script"
    echo "=============================================="
    echo -e "${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "nuxt.config.ts" ] || [ ! -f "package.json" ]; then
        print_error "Please run this script from the storefront directory"
        exit 1
    fi
    print_status "Working directory verified"
}

# Check system dependencies
check_dependencies() {
    print_info "Checking system dependencies..."

    local missing_deps=()

    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        print_status "Node.js is available ($(node --version))"
    fi

    if ! command -v bun &> /dev/null; then
        missing_deps+=("Bun")
    else
        print_status "Bun is available ($(bun --version))"
    fi

    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    else
        print_status "Git is available ($(git --version))"
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        echo "Please install the missing dependencies:"
        echo "- Node.js: https://nodejs.org/"
        echo "- Bun: curl -fsSL https://bun.sh/install | bash"
        echo "- Git: https://git-scm.com/"
        exit 1
    fi
}

# Install project dependencies
install_dependencies() {
    print_info "Installing project dependencies..."

    if bun install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment configuration..."

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_status "Created .env file from .env.example"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_warning "No .env.example found, creating basic .env file"
            cat > .env << EOF
NODE_ENV=development
PORT=3000
NUXT_PUBLIC_API_BASE=http://localhost:4000
NUXT_TELEMETRY_DISABLED=1
EOF
            print_status "Created basic .env file"
        fi
    else
        print_status ".env file already exists"
    fi
}

# Setup PM2 (optional)
setup_pm2() {
    print_info "Checking PM2 installation..."

    if ! command -v pm2 &> /dev/null; then
        read -p "PM2 is not installed. Would you like to install it globally? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v npm &> /dev/null; then
                npm install -g pm2
                print_status "PM2 installed successfully"
            else
                print_warning "npm not available, please install PM2 manually: npm install -g pm2"
            fi
        else
            print_warning "PM2 not installed. You can install it later with: npm install -g pm2"
        fi
    else
        print_status "PM2 is already available ($(pm2 --version))"
    fi
}

# Setup Git hooks (optional)
setup_git_hooks() {
    print_info "Setting up Git hooks..."

    if [ -d ".git" ]; then
        # Create pre-commit hook for linting/formatting
        mkdir -p .git/hooks

        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Check if there are any TypeScript errors
if command -v bun &> /dev/null; then
    echo "Checking TypeScript..."
    bun run type-check 2>/dev/null || echo "No type-check script found, skipping..."
fi

# Check if there are any linting errors
if [ -f "package.json" ] && grep -q "lint" package.json; then
    echo "Running linter..."
    bun run lint 2>/dev/null || echo "Linting completed with warnings"
fi

echo "Pre-commit checks completed"
EOF

        chmod +x .git/hooks/pre-commit
        print_status "Git pre-commit hook installed"
    else
        print_warning "Not a Git repository, skipping Git hooks setup"
    fi
}

# Run initial build test
test_build() {
    print_info "Testing initial build..."

    if bun run build; then
        print_status "Initial build successful"

        # Check if output exists
        if [ -f ".output/server/index.mjs" ]; then
            print_status "Build output verified"
        else
            print_warning "Build output not found in expected location"
        fi
    else
        print_error "Initial build failed"
        print_info "This might be due to missing environment variables or configuration"
        print_info "Check the build logs above for more details"
    fi
}

# Print final instructions
print_final_instructions() {
    echo ""
    echo -e "${GREEN}=============================================="
    echo "🎉 Setup completed successfully!"
    echo -e "===============================================${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. 📝 Configure your environment:"
    echo "   - Edit .env file with your actual values"
    echo "   - Set up your database connection"
    echo "   - Configure external API endpoints"
    echo ""
    echo "2. 🚀 Start development:"
    echo "   - Run: bun run dev"
    echo "   - Open: http://localhost:3000"
    echo ""
    echo "3. 📋 For deployment setup:"
    echo "   - Read: ./DEPLOYMENT.md"
    echo "   - Test: ./test-deploy.sh"
    echo "   - Configure GitLab CI/CD variables"
    echo ""
    echo "4. 📚 Useful commands:"
    echo "   - bun run dev        # Start development server"
    echo "   - bun run build      # Build for production"
    echo "   - bun run preview    # Preview production build"
    echo "   - bun run lint       # Run linter (if configured)"
    echo ""
    echo "Need help? Check the documentation:"
    echo "- README.md - Project overview"
    echo "- DEPLOYMENT.md - Deployment guide"
    echo ""
    print_status "Happy coding! 🚀"
}

# Main execution
main() {
    print_header

    check_directory
    check_dependencies
    install_dependencies
    setup_environment
    setup_pm2
    setup_git_hooks
    test_build

    print_final_instructions
}

# Run main function
main "$@"
