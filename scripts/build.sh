#!/bin/bash

# LifeMtrics Build Script
# Automated build process for applications

set -e

# Configuration
BUILD_DIR="build"
LOG_DIR="logs"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="${LOG_DIR}/build_${TIMESTAMP}.log"

# Create directories if they don't exist
mkdir -p "$BUILD_DIR" "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Build function
build_project() {
    local project_type="$1"
    
    log "🔨 Starting build for project type: $project_type"
    
    case "$project_type" in
        "node"|"npm"|"js")
            build_node_project
            ;;
        "python"|"py")
            build_python_project
            ;;
        "docker")
            build_docker_project
            ;;
        *)
            auto_detect_and_build
            ;;
    esac
}

# Node.js build
build_node_project() {
    log "📦 Building Node.js project..."
    
    if [ -f "package.json" ]; then
        log "Installing dependencies..."
        if command -v pnpm &> /dev/null; then
            pnpm install
        else
            npm install
        fi
        
        log "Running build script..."
        if grep -q '"build"' package.json; then
            npm run build
        else
            log "⚠️ No build script found in package.json"
        fi
        
        log "✅ Node.js build completed"
    else
        log "❌ No package.json found"
        return 1
    fi
}

# Python build
build_python_project() {
    log "🐍 Building Python project..."
    
    if [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        log "Creating virtual environment..."
        python -m venv venv
        source venv/bin/activate
        
        log "Installing dependencies..."
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
        fi
        
        log "Building package..."
        python -m build
        
        log "✅ Python build completed"
    else
        log "❌ No setup.py or pyproject.toml found"
        return 1
    fi
}

# Docker build
build_docker_project() {
    log "🐳 Building Docker project..."
    
    if [ -f "Dockerfile" ]; then
        local image_name=$(basename "$PWD" | tr '[:upper:]' '[:lower:]')
        log "Building Docker image: $image_name"
        docker build -t "$image_name:latest" .
        log "✅ Docker build completed"
    else
        log "❌ No Dockerfile found"
        return 1
    fi
}

# Auto-detect project type and build
auto_detect_and_build() {
    log "🔍 Auto-detecting project type..."
    
    if [ -f "package.json" ]; then
        build_node_project
    elif [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        build_python_project
    elif [ -f "Dockerfile" ]; then
        build_docker_project
    elif [ -f "Makefile" ]; then
        log "🔨 Running make..."
        make
        log "✅ Make build completed"
    else
        log "❓ Unknown project type. Please specify: node, python, or docker"
        log "📁 Current directory contents:"
        ls -la | tee -a "$LOG_FILE"
        return 1
    fi
}

# Main execution
main() {
    log "🚀 LifeMtrics Build Started"
    log "📂 Working directory: $(pwd)"
    
    PROJECT_TYPE="${1:-auto}"
    
    if build_project "$PROJECT_TYPE"; then
        log "🎉 Build completed successfully!"
        log "📊 Build artifacts saved in: $BUILD_DIR"
        log "📋 Build log: $LOG_FILE"
    else
        log "💥 Build failed!"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"