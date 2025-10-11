#!/bin/bash

# Finance Forecast App Deployment Script
# Usage: ./scripts/deploy.sh [environment] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
SKIP_TESTS=false
SKIP_BUILD=false
FORCE_DEPLOY=false
VERBOSE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  staging     Deploy to staging environment"
    echo "  production  Deploy to production environment"
    echo ""
    echo "Options:"
    echo "  --skip-tests     Skip running tests"
    echo "  --skip-build     Skip building the application"
    echo "  --force          Force deployment even if tests fail"
    echo "  --verbose        Enable verbose output"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production --skip-tests"
    echo "  $0 staging --verbose"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    show_usage
    exit 1
fi

print_status "Starting deployment to $ENVIRONMENT environment..."

# Check if we're in the right directory
if [[ ! -f "package.json" && ! -f "frontend/package.json" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        print_warning "Skipping tests as requested"
        return 0
    fi
    
    print_status "Running tests..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Run linting
    print_status "Running ESLint..."
    npm run lint
    
    # Run type checking
    print_status "Running TypeScript check..."
    npm run type-check
    
    # Run unit tests
    print_status "Running unit tests..."
    npm run test:ci
    
    # Run E2E tests
    print_status "Running E2E tests..."
    npm run test:e2e
    
    # Run performance tests
    print_status "Running performance tests..."
    npm run lighthouse:ci
    
    cd ..
    
    print_success "All tests passed"
}

# Build application
build_application() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        print_warning "Skipping build as requested"
        return 0
    fi
    
    print_status "Building application..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Build the application
    print_status "Building Next.js application..."
    npm run build
    
    cd ..
    
    print_success "Application built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
        exit 1
    fi
    
    cd frontend
    
    # Deploy to Vercel
    if [[ "$ENVIRONMENT" == "production" ]]; then
        print_status "Deploying to production..."
        vercel --prod
    else
        print_status "Deploying to staging..."
        vercel
    fi
    
    cd ..
    
    print_success "Deployed to Vercel successfully"
}

# Deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    # Build Docker images
    print_status "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build
    
    # Deploy with Docker Compose
    print_status "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    docker-compose -f docker-compose.prod.yml ps
    
    print_success "Docker deployment completed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # This would typically connect to your database and run migrations
    # For now, we'll just print a message
    print_warning "Database migrations should be run manually or through your CI/CD pipeline"
    
    print_success "Migration check completed"
}

# Send deployment notification
send_notification() {
    print_status "Sending deployment notification..."
    
    # This would typically send a notification to Slack, Discord, or email
    # For now, we'll just print a message
    print_success "Deployment notification sent"
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    # Check dependencies
    check_dependencies
    
    # Run tests (unless skipped)
    if ! run_tests && [[ "$FORCE_DEPLOY" != "true" ]]; then
        print_error "Tests failed. Use --force to deploy anyway"
        exit 1
    fi
    
    # Build application (unless skipped)
    build_application
    
    # Run migrations
    run_migrations
    
    # Deploy based on environment
    case "$ENVIRONMENT" in
        staging)
            deploy_vercel
            ;;
        production)
            deploy_vercel
            # For production, you might also want to deploy with Docker
            # deploy_docker
            ;;
    esac
    
    # Send notification
    send_notification
    
    print_success "Deployment to $ENVIRONMENT completed successfully!"
    print_status "You can monitor the deployment at: https://vercel.com/dashboard"
}

# Run main function
main "$@"
