#!/bin/bash

# LifeMtrics Development Server Script
# Start development servers with hot reload

set -e

# Configuration
LOG_DIR="logs"
DEV_LOG="${LOG_DIR}/dev.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DEV_LOG"
}

# Start development server
start_dev_server() {
    local project_type="$1"
    
    log "🚀 Starting development server for: $project_type"
    
    case "$project_type" in
        "node"|"npm"|"js")
            start_node_dev
            ;;
        "python"|"py")
            start_python_dev
            ;;
        *)
            auto_detect_and_dev
            ;;
    esac
}

# Node.js development server
start_node_dev() {
    log "📦 Starting Node.js development server..."
    
    if [ -f "package.json" ]; then
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            log "Installing dependencies..."
            if command -v pnpm &> /dev/null; then
                pnpm install
            else
                npm install
            fi
        fi
        
        # Start dev server
        if grep -q '"dev"' package.json; then
            log "🔥 Starting dev server with hot reload..."
            npm run dev
        elif grep -q '"start"' package.json; then
            log "▶️ Starting application..."
            npm start
        else
            log "⚠️ No dev or start script found, starting with nodemon..."
            if [ -f "index.js" ]; then
                npx nodemon index.js
            elif [ -f "app.js" ]; then
                npx nodemon app.js
            elif [ -f "server.js" ]; then
                npx nodemon server.js
            else
                log "❌ No main file found (index.js, app.js, server.js)"
                return 1
            fi
        fi
    else
        log "❌ No package.json found"
        return 1
    fi
}

# Python development server
start_python_dev() {
    log "🐍 Starting Python development server..."
    
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
        log "✅ Virtual environment activated"
    fi
    
    # Start development server based on framework
    if [ -f "manage.py" ]; then
        log "🎯 Django project detected"
        python manage.py runserver
    elif [ -f "app.py" ] && grep -q "flask\|Flask" app.py; then
        log "🌶️ Flask project detected"
        export FLASK_ENV=development
        export FLASK_DEBUG=1
        python app.py
    elif [ -f "main.py" ]; then
        log "🐍 Running main.py..."
        python main.py
    elif [ -f "app.py" ]; then
        log "🐍 Running app.py..."
        python app.py
    else
        log "❓ No recognizable Python web framework found"
        log "📁 Available Python files:"
        find . -name "*.py" -maxdepth 2 | tee -a "$DEV_LOG"
        return 1
    fi
}

# Auto-detect and start development server
auto_detect_and_dev() {
    log "🔍 Auto-detecting project type..."
    
    if [ -f "package.json" ]; then
        start_node_dev
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        start_python_dev
    elif [ -f "docker-compose.yml" ]; then
        log "🐳 Docker Compose detected"
        docker-compose up --build
    else
        log "❓ Unknown project type"
        log "📁 Current directory contents:"
        ls -la | tee -a "$DEV_LOG"
        return 1
    fi
}

# Cleanup function
cleanup() {
    log "🛑 Development server stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log "🚀 LifeMtrics Development Server Starting"
    log "📂 Working directory: $(pwd)"
    log "🔄 Use Ctrl+C to stop the server"
    
    PROJECT_TYPE="${1:-auto}"
    
    start_dev_server "$PROJECT_TYPE"
}

# Run main function with all arguments
main "$@"