#!/bin/bash

# LifeMtrics Deployment Script
# Automated deployment for various platforms

set -e

# Configuration
LOG_DIR="logs"
DEPLOY_LOG="${LOG_DIR}/deploy_$(date '+%Y%m%d_%H%M%S').log"
BUILD_DIR="build"
DIST_DIR="dist"

# Create directories
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DEPLOY_LOG"
}

# Deploy application
deploy_app() {
    local target="${1:-production}"
    local project_type="${2:-auto}"
    
    log "🚀 Starting deployment to: $target"
    log "📦 Project type: $project_type"
    
    # Pre-deployment checks
    if ! pre_deploy_checks "$project_type"; then
        log "❌ Pre-deployment checks failed"
        return 1
    fi
    
    case "$target" in
        "production"|"prod")
            deploy_to_production "$project_type"
            ;;
        "staging"|"stage")
            deploy_to_staging "$project_type"
            ;;
        "docker")
            deploy_to_docker "$project_type"
            ;;
        "github-pages")
            deploy_to_github_pages
            ;;
        *)
            log "❓ Unknown deployment target: $target"
            log "📝 Available targets: production, staging, docker, github-pages"
            return 1
            ;;
    esac
}

# Pre-deployment checks
pre_deploy_checks() {
    local project_type="$1"
    
    log "🔍 Running pre-deployment checks..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "⚠️ Not in a git repository"
    else
        # Check for uncommitted changes
        if ! git diff-index --quiet HEAD --; then
            log "⚠️ Uncommitted changes detected"
            git status --porcelain | tee -a "$DEPLOY_LOG"
        fi
        
        # Log current commit
        log "📍 Current commit: $(git rev-parse --short HEAD)"
        log "🌿 Current branch: $(git branch --show-current)"
    fi
    
    # Run tests if available
    log "🧪 Running tests before deployment..."
    if [ -f "scripts/test.sh" ]; then
        if bash scripts/test.sh "$project_type"; then
            log "✅ Tests passed"
        else
            log "❌ Tests failed, aborting deployment"
            return 1
        fi
    else
        log "⚠️ No test script found, skipping tests"
    fi
    
    # Build project if needed
    log "🔨 Building project..."
    if [ -f "scripts/build.sh" ]; then
        if bash scripts/build.sh "$project_type"; then
            log "✅ Build successful"
        else
            log "❌ Build failed, aborting deployment"
            return 1
        fi
    else
        log "⚠️ No build script found"
    fi
    
    return 0
}

# Deploy to production
deploy_to_production() {
    local project_type="$1"
    
    log "🌟 Deploying to production..."
    
    case "$project_type" in
        "node"|"npm"|"js")
            deploy_node_production
            ;;
        "python"|"py")
            deploy_python_production
            ;;
        *)
            auto_detect_and_deploy_production
            ;;
    esac
}

# Deploy to staging
deploy_to_staging() {
    local project_type="$1"
    
    log "🎭 Deploying to staging..."
    
    # Similar to production but with staging-specific configurations
    log "⚙️ Using staging configurations..."
    
    case "$project_type" in
        "node"|"npm"|"js")
            deploy_node_staging
            ;;
        "python"|"py")
            deploy_python_staging
            ;;
        *)
            log "🔄 Using production deployment with staging configs"
            deploy_to_production "$project_type"
            ;;
    esac
}

# Node.js production deployment
deploy_node_production() {
    log "📦 Deploying Node.js application to production..."
    
    if [ -f "package.json" ]; then
        # Install production dependencies
        log "📥 Installing production dependencies..."
        if command -v pnpm &> /dev/null; then
            pnpm install --production
        else
            npm ci --production
        fi
        
        # Create deployment package
        log "📦 Creating deployment package..."
        tar -czf "deploy_$(date '+%Y%m%d_%H%M%S').tar.gz" \
            --exclude=node_modules/*/test \
            --exclude=node_modules/*/tests \
            --exclude='*.log' \
            --exclude='.git' \
            . || log "⚠️ Packaging with warnings"
        
        log "✅ Node.js production deployment prepared"
    else
        log "❌ No package.json found"
        return 1
    fi
}

# Node.js staging deployment
deploy_node_staging() {
    log "📦 Deploying Node.js application to staging..."
    
    # Install all dependencies for staging
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
    
    log "✅ Node.js staging deployment prepared"
}

# Python production deployment
deploy_python_production() {
    log "🐍 Deploying Python application to production..."
    
    # Create virtual environment for deployment
    python -m venv deploy_venv
    source deploy_venv/bin/activate
    
    # Install dependencies
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    
    # Create deployment package
    log "📦 Creating Python deployment package..."
    tar -czf "python_deploy_$(date '+%Y%m%d_%H%M%S').tar.gz" \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='venv' \
        --exclude='deploy_venv' \
        --exclude='.git' \
        . || log "⚠️ Packaging with warnings"
    
    deactivate
    log "✅ Python production deployment prepared"
}

# Python staging deployment
deploy_python_staging() {
    log "🐍 Deploying Python application to staging..."
    
    if [ -f "requirements-dev.txt" ]; then
        pip install -r requirements-dev.txt
    fi
    
    log "✅ Python staging deployment prepared"
}

# Docker deployment
deploy_to_docker() {
    log "🐳 Deploying to Docker..."
    
    if [ -f "Dockerfile" ]; then
        local image_name=$(basename "$PWD" | tr '[:upper:]' '[:lower:]')
        local tag="v$(date '+%Y%m%d-%H%M%S')"
        
        log "🔨 Building Docker image: $image_name:$tag"
        docker build -t "$image_name:$tag" -t "$image_name:latest" .
        
        log "✅ Docker deployment completed"
        log "🎯 Image: $image_name:$tag"
    else
        log "❌ No Dockerfile found"
        return 1
    fi
}

# GitHub Pages deployment
deploy_to_github_pages() {
    log "📄 Deploying to GitHub Pages..."
    
    if [ -d "$BUILD_DIR" ] || [ -d "$DIST_DIR" ]; then
        local deploy_dir="${BUILD_DIR}"
        [ -d "$DIST_DIR" ] && deploy_dir="$DIST_DIR"
        
        log "📁 Deploying from: $deploy_dir"
        
        # This would typically push to gh-pages branch
        # For now, just prepare the files
        log "📦 Preparing GitHub Pages deployment..."
        mkdir -p /tmp/gh-pages
        cp -r "$deploy_dir"/* /tmp/gh-pages/
        
        log "✅ GitHub Pages deployment prepared in /tmp/gh-pages/"
    else
        log "❌ No build or dist directory found"
        return 1
    fi
}

# Auto-detect and deploy to production
auto_detect_and_deploy_production() {
    log "🔍 Auto-detecting project type for production deployment..."
    
    if [ -f "package.json" ]; then
        deploy_node_production
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        deploy_python_production
    elif [ -f "Dockerfile" ]; then
        deploy_to_docker
    else
        log "❓ Unknown project type"
        return 1
    fi
}

# Post-deployment actions
post_deploy_actions() {
    log "🎉 Deployment completed successfully!"
    log "📋 Deployment log: $DEPLOY_LOG"
    log "⏰ Deployment time: $(date)"
    
    # Cleanup
    log "🧹 Cleaning up temporary files..."
    rm -rf deploy_venv 2>/dev/null || true
    
    log "✅ Post-deployment cleanup completed"
}

# Main execution
main() {
    log "🚀 LifeMtrics Deployment Starting"
    log "📂 Working directory: $(pwd)"
    
    TARGET="${1:-production}"
    PROJECT_TYPE="${2:-auto}"
    
    if deploy_app "$TARGET" "$PROJECT_TYPE"; then
        post_deploy_actions
    else
        log "💥 Deployment failed!"
        log "📋 Check deployment log: $DEPLOY_LOG"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"