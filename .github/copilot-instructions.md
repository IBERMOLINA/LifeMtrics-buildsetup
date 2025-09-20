# LifeMtrics Build Setup

🚀 **Automation for app building with GitHub Codespace and Copilot integration**

A comprehensive build automation toolkit designed for modern development workflows with GitHub Codespaces and AI-powered development assistance.

## ✨ Features

- 🏗️ **Automated Build System** - Universal build scripts for Node.js, Python, and Docker projects
- 🔧 **Development Environment** - Pre-configured GitHub Codespace with all essential tools
- 🤖 **GitHub Copilot Integration** - AI-powered coding assistance enabled by default
- 🧪 **Testing Automation** - Comprehensive test runners with coverage reporting
- 🚀 **Deployment Pipeline** - Multi-stage deployment to staging and production
- 📊 **Logging & Monitoring** - Detailed build logs and reporting
- 🔄 **CI/CD Workflows** - GitHub Actions for continuous integration

## 🚀 Quick Start

### Using GitHub Codespace (Recommended)

1. **Open in Codespace**: Click the "Code" button → "Codespaces" → "Create codespace on main"
2. **Wait for setup**: The environment will automatically configure with all tools
3. **Start building**: Use the provided commands to build, test, and deploy

### Local Development

```bash
# Clone the repository
git clone https://github.com/IBERMOLINA/LifeMtrics-buildsetup.git
cd LifeMtrics-buildsetup

# Run setup (optional, mainly for codespaces)
bash .devcontainer/setup.sh

# Install dependencies
npm install
```

## 🛠️ Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `build` | Build your project | `npm run build` or `bash scripts/build.sh` |
| `dev` | Start development server | `npm run dev` or `bash scripts/dev.sh` |
| `test` | Run tests | `npm test` or `bash scripts/test.sh` |
| `deploy` | Deploy to production | `npm run deploy` or `bash scripts/deploy.sh` |
| `logs` | View build logs | `npm run logs` |
| `clean` | Clean build artifacts | `npm run clean` |

### Project Type Detection

The build system automatically detects your project type:
- **Node.js**: Looks for `package.json`
- **Python**: Looks for `requirements.txt`, `setup.py`, or `pyproject.toml`
- **Docker**: Looks for `Dockerfile`

You can also specify the project type explicitly:
```bash
bash scripts/build.sh node     # Force Node.js build
bash scripts/build.sh python   # Force Python build  
bash scripts/build.sh docker   # Force Docker build
```

## 📁 Project Structure

```
LifeMtrics-buildsetup/
├── .devcontainer/
│   ├── devcontainer.json      # Codespace configuration
│   └── setup.sh               # Environment setup script
├── .github/
│   └── workflows/
│       ├── ci-cd.yml          # Main CI/CD pipeline
│       └── codespace.yml      # Codespace setup workflow
├── scripts/
│   ├── build.sh               # Universal build script
│   ├── dev.sh                 # Development server script
│   ├── test.sh                # Test runner script
│   └── deploy.sh              # Deployment script
├── package.json               # Node.js project configuration
└── README.md                  # This file
```

## 🤖 GitHub Copilot Integration

This repository is optimized for GitHub Copilot:

- ✅ **Pre-enabled** in Codespace configuration
- ✅ **Context-aware** suggestions for build scripts
- ✅ **Multi-language support** (JavaScript, Python, Bash, YAML)
- ✅ **Documentation assistance** for README and comments

### Copilot Tips
- Use comments to describe what you want to build
- Ask Copilot Chat for deployment strategies
- Get help with debugging build issues
- Generate test cases automatically

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Detects** project type (Node.js, Python, Docker)
2. **Builds** the project with multiple versions
3. **Tests** with coverage reporting
4. **Deploys** to staging on PR merge
5. **Deploys** to production on main branch push

### Deployment Targets

- `staging` - Development/testing environment
- `production` - Live production environment  
- `docker` - Containerized deployment
- `github-pages` - Static site deployment

## 📊 Logging & Monitoring

All operations are logged with timestamps:
- Build logs: `logs/build_YYYYMMDD_HHMMSS.log`
- Test logs: `logs/test_YYYYMMDD_HHMMSS.log`
- Deploy logs: `logs/deploy_YYYYMMDD_HHMMSS.log`

View real-time logs:
```bash
npm run logs
# or
tail -f logs/build.log
```

## 🧪 Testing

Supports multiple testing frameworks:
- **Node.js**: Jest, Mocha, npm test
- **Python**: pytest, unittest, Django tests
- **Coverage**: Automatic coverage reporting

Run tests with coverage:
```bash
npm run test:coverage
```

## 🚀 Deployment

Deploy to different environments:
```bash
npm run deploy:staging     # Deploy to staging
npm run deploy:production  # Deploy to production
bash scripts/deploy.sh docker  # Docker deployment
```

## ⚙️ Configuration

### Environment Variables
- `NODE_ENV` - Environment mode (development/production)
- `BUILD_DIR` - Build output directory (default: build)
- `LOG_DIR` - Log directory (default: logs)

### Customization
- Edit `scripts/` files to customize build processes
- Modify `.devcontainer/devcontainer.json` for Codespace settings
- Update `.github/workflows/` for CI/CD customization

## 🤝 Contributing

1. Open in GitHub Codespace for instant development environment
2. Make your changes with Copilot assistance
3. Test locally: `npm test`
4. Build to verify: `npm run build`
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- 📚 [Documentation](https://github.com/IBERMOLINA/LifeMtrics-buildsetup/wiki)
- 🐛 [Issues](https://github.com/IBERMOLINA/LifeMtrics-buildsetup/issues)
- 💬 [Discussions](https://github.com/IBERMOLINA/LifeMtrics-buildsetup/discussions)

---

**Made with ❤️ for developers using GitHub Codespaces and Copilot**
