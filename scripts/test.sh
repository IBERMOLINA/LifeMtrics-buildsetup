#!/bin/bash

# LifeMtrics Test Runner Script
# Automated testing for various project types

set -e

# Configuration
LOG_DIR="logs"
TEST_LOG="${LOG_DIR}/test_$(date '+%Y%m%d_%H%M%S').log"
COVERAGE_DIR="coverage"

# Create directories
mkdir -p "$LOG_DIR" "$COVERAGE_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$TEST_LOG"
}

# Run tests
run_tests() {
    local project_type="$1"
    local coverage="${2:-false}"
    
    log "🧪 Running tests for project type: $project_type"
    
    case "$project_type" in
        "node"|"npm"|"js")
            run_node_tests "$coverage"
            ;;
        "python"|"py")
            run_python_tests "$coverage"
            ;;
        *)
            auto_detect_and_test "$coverage"
            ;;
    esac
}

# Node.js tests
run_node_tests() {
    local coverage="$1"
    
    log "📦 Running Node.js tests..."
    
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
        
        # Run tests
        if grep -q '"test"' package.json; then
            if [ "$coverage" = "true" ]; then
                log "🔍 Running tests with coverage..."
                npm run test -- --coverage
            else
                log "▶️ Running tests..."
                npm test
            fi
        else
            log "⚠️ No test script found in package.json"
            
            # Try common test runners
            if [ -d "test" ] || [ -d "tests" ] || [ -d "__tests__" ]; then
                log "🔍 Test directory found, trying with jest..."
                npx jest
            else
                log "❌ No tests found"
                return 1
            fi
        fi
        
        log "✅ Node.js tests completed"
    else
        log "❌ No package.json found"
        return 1
    fi
}

# Python tests
run_python_tests() {
    local coverage="$1"
    
    log "🐍 Running Python tests..."
    
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
        log "✅ Virtual environment activated"
    fi
    
    # Install test dependencies if requirements-dev.txt exists
    if [ -f "requirements-dev.txt" ]; then
        pip install -r requirements-dev.txt
    fi
    
    # Run tests based on available test frameworks
    if command -v pytest &> /dev/null && ([ -d "tests" ] || find . -name "test_*.py" | grep -q .); then
        log "🧪 Running pytest..."
        if [ "$coverage" = "true" ]; then
            pytest --cov=. --cov-report=html --cov-report=term
        else
            pytest -v
        fi
    elif [ -f "manage.py" ]; then
        log "🎯 Running Django tests..."
        python manage.py test
    elif python -c "import unittest" 2>/dev/null; then
        log "🧪 Running unittest..."
        python -m unittest discover -s tests -p "test_*.py" -v 2>/dev/null || \
        python -m unittest discover -s . -p "test_*.py" -v
    else
        log "❌ No test framework found (pytest, unittest, or Django)"
        return 1
    fi
    
    log "✅ Python tests completed"
}

# Auto-detect and run tests
auto_detect_and_test() {
    local coverage="$1"
    
    log "🔍 Auto-detecting project type..."
    
    if [ -f "package.json" ]; then
        run_node_tests "$coverage"
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ] || find . -name "*.py" | grep -q .; then
        run_python_tests "$coverage"
    elif [ -f "Makefile" ] && grep -q "test" Makefile; then
        log "🔨 Running make test..."
        make test
        log "✅ Make tests completed"
    else
        log "❓ Unknown project type or no tests found"
        log "📁 Current directory contents:"
        ls -la | tee -a "$TEST_LOG"
        return 1
    fi
}

# Generate test report
generate_report() {
    log "📊 Generating test report..."
    
    local report_file="test-report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>LifeMtrics Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { color: #333; border-bottom: 2px solid #4CAF50; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .info { color: #2196F3; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1 class="header">🧪 LifeMtrics Test Report</h1>
    <p><strong>Generated:</strong> $(date)</p>
    <p><strong>Project:</strong> $(basename "$(pwd)")</p>
    <p><strong>Log File:</strong> $TEST_LOG</p>
    
    <h2>Test Results</h2>
    <pre>$(tail -20 "$TEST_LOG" 2>/dev/null || echo "No test log available")</pre>
    
    <h2>Coverage Report</h2>
    $([ -d "coverage" ] && echo "<p>Coverage report available in <code>coverage/</code> directory</p>" || echo "<p>No coverage report generated</p>")
</body>
</html>
EOF
    
    log "📄 Test report generated: $report_file"
}

# Main execution
main() {
    log "🧪 LifeMtrics Test Suite Starting"
    log "📂 Working directory: $(pwd)"
    
    PROJECT_TYPE="${1:-auto}"
    COVERAGE="${2:-false}"
    
    if [ "$3" = "--coverage" ] || [ "$2" = "--coverage" ]; then
        COVERAGE="true"
    fi
    
    if run_tests "$PROJECT_TYPE" "$COVERAGE"; then
        log "🎉 All tests passed!"
        generate_report
        log "📊 Test report and logs available in: $LOG_DIR"
    else
        log "💥 Tests failed!"
        generate_report
        exit 1
    fi
}

# Run main function with all arguments
main "$@"