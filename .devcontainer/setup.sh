#!/bin/bash

# LifeMtrics Build Setup - Codespace Initialization Script

set -e

echo "🚀 Setting up LifeMtrics build environment..."

# Update package lists
sudo apt-get update

# Install build essentials
sudo apt-get install -y \
    build-essential \
    curl \
    wget \
    git \
    vim \
    jq \
    unzip

# Install additional development tools
echo "📦 Installing development tools..."

# Install pnpm for faster package management
npm install -g pnpm

# Install common build tools
npm install -g \
    typescript \
    @types/node \
    nodemon \
    concurrently \
    cross-env

# Install Python development tools
pip install --user \
    build \
    setuptools \
    wheel \
    pytest \
    black \
    flake8 \
    mypy

# Create common project directories
mkdir -p ~/workspace/projects
mkdir -p ~/workspace/builds
mkdir -p ~/workspace/logs

# Set up git configuration helpers
echo "⚙️ Configuring development environment..."

# Create build scripts directory
mkdir -p ~/.local/bin

# Add local bin to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

# Set up aliases for common build commands
cat >> ~/.bashrc << 'EOF'

# LifeMtrics Build Aliases
alias ll='ls -la'
alias build='bash scripts/build.sh'
alias dev='bash scripts/dev.sh'
alias test='bash scripts/test.sh'
alias deploy='bash scripts/deploy.sh'
alias logs='tail -f ~/workspace/logs/build.log'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline'

EOF

# Create default gitignore for common patterns
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tgz
*.tar.gz

# Environment files
.env
.env.local
.env.production
.env.staging

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
pip-log.txt

# Temporary files
tmp/
temp/
*.tmp

EOF

echo "✅ LifeMtrics build environment setup complete!"
echo "🔧 Available commands: build, dev, test, deploy, logs"
echo "📝 Check scripts/ directory for build automation"