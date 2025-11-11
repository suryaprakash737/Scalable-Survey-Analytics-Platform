#!/bin/bash

# Pre-submission validation script for SWE 645 Homework Assignment 3
# Validates all required files, sections, and configurations

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
TOTAL=0

echo "=========================================="
echo "Checking Submission Package..."
echo "=========================================="
echo ""

# Function to check file exists
check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 found"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $1 not found"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check text in file
check_text_in_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ] && grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $3 found in $1"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $3 not found in $1"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check replicas count
check_replicas() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        REPLICAS=$(grep -E "^\s*replicas:" "$1" | head -1 | awk '{print $2}' | tr -d ' ')
        if [ "$REPLICAS" = "1" ]; then
            echo -e "${GREEN}✅${NC} $1 has replicas: 1"
            PASSED=$((PASSED + 1))
            return 0
        else
            echo -e "${RED}❌${NC} $1 has replicas: $REPLICAS (expected: 1)"
            FAILED=$((FAILED + 1))
            return 1
        fi
    else
        echo -e "${RED}❌${NC} $1 not found"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check file is not empty
check_file_not_empty() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ] && [ -s "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 is not empty"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $1 is empty or not found"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to count files with pattern
count_files_with_pattern() {
    local pattern="$1"
    local file_ext="$2"
    local count=0
    
    if [ "$file_ext" = "py" ]; then
        count=$(find . -name "*.py" -type f | while read file; do
            head -1 "$file" | grep -q '^"""' && echo "1"
        done | wc -l | tr -d ' ')
    elif [ "$file_ext" = "js" ] || [ "$file_ext" = "jsx" ]; then
        count=$(find . -name "*.js" -o -name "*.jsx" | while read file; do
            head -1 "$file" | grep -q '^/\*' && echo "1"
        done | wc -l | tr -d ' ')
    fi
    
    echo "$count"
}

echo "=== 1. Required Files Check ==="
echo ""

# Core files
check_file "README.md"
check_file "Jenkinsfile"

# Backend files
check_file "backend/Dockerfile"
check_file "backend/requirements.txt"

# Frontend files
check_file "frontend/Dockerfile"
check_file "frontend/package.json"

# Kubernetes files
echo ""
echo "Checking Kubernetes YAML files..."
K8S_FILES=0
K8S_MISSING=0
for file in k8s/*.yaml; do
    if [ -f "$file" ]; then
        K8S_FILES=$((K8S_FILES + 1))
        check_file "$file"
    else
        K8S_MISSING=$((K8S_MISSING + 1))
    fi
done

if [ $K8S_MISSING -gt 0 ] && [ $K8S_FILES -eq 0 ]; then
    TOTAL=$((TOTAL + 1))
    echo -e "${RED}❌${NC} No k8s/*.yaml files found"
    FAILED=$((FAILED + 1))
fi

# Postman collection
echo ""
echo "Checking Postman collection..."
POSTMAN_FILES=0
for file in postman/*.json; do
    if [ -f "$file" ]; then
        POSTMAN_FILES=$((POSTMAN_FILES + 1))
        check_file "$file"
    fi
done

if [ $POSTMAN_FILES -eq 0 ]; then
    TOTAL=$((TOTAL + 1))
    echo -e "${RED}❌${NC} No postman/*.json files found"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "=== 2. README Content Check ==="
echo ""

if [ -f "README.md" ]; then
    check_text_in_file "README.md" "## Team Members" "Team Members section"
    check_text_in_file "README.md" "Kubernetes Deployment URL" "Kubernetes Deployment URL section"
else
    TOTAL=$((TOTAL + 2))
    echo -e "${RED}❌${NC} README.md not found, skipping content checks"
    FAILED=$((FAILED + 2))
fi

echo ""
echo "=== 3. Header Comments Check ==="
echo ""

# Check Python files with header comments
PYTHON_COUNT=$(count_files_with_pattern '^"""' "py")
TOTAL=$((TOTAL + 1))
if [ "$PYTHON_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✅${NC} Found $PYTHON_COUNT Python files with header comments (required: 5+)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌${NC} Found only $PYTHON_COUNT Python files with header comments (required: 5+)"
    FAILED=$((FAILED + 1))
fi

# Check JS/JSX files with header comments
JS_COUNT=$(count_files_with_pattern '^/\*' "js")
TOTAL=$((TOTAL + 1))
if [ "$JS_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✅${NC} Found $JS_COUNT JS/JSX files with header comments (required: 5+)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌${NC} Found only $JS_COUNT JS/JSX files with header comments (required: 5+)"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "=== 4. Configuration Validation ==="
echo ""

# Check Kubernetes deployments have replicas: 1
if [ -f "k8s/backend-deployment.yaml" ]; then
    check_replicas "k8s/backend-deployment.yaml"
fi

if [ -f "k8s/frontend-deployment.yaml" ]; then
    check_replicas "k8s/frontend-deployment.yaml"
fi

if [ -f "k8s/mysql-deployment.yaml" ]; then
    check_replicas "k8s/mysql-deployment.yaml"
fi

# Check Jenkinsfile is not empty
check_file_not_empty "Jenkinsfile"

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${GREEN}Total: $PASSED/$TOTAL checks passed${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    echo -e "${YELLOW}Total: $PASSED/$TOTAL checks passed${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the failed checks before submission.${NC}"
    exit 1
fi

