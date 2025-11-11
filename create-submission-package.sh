#!/bin/bash

# Submission Package Creation Script for SWE 645 Homework Assignment 3
# Automates the creation of a zip file with all required submission files

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TEMP_DIR="submission-package-temp"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TEAM_NAME="Team"  # Default, should be updated
ZIP_NAME="SWE645-HW3-${TEAM_NAME}-${TIMESTAMP}.zip"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_step() {
    echo -e "\n${CYAN}▶${NC} $1"
}

# Check if we're in the project root
if [ ! -f "README.md" ] || [ ! -f "Jenkinsfile" ]; then
    print_error "This script must be run from the project root directory!"
    exit 1
fi

echo "=========================================="
echo -e "${CYAN}Submission Package Creator${NC}"
echo "=========================================="
echo ""

# Ask for team name
read -p "Enter team name (or press Enter for 'Team'): " input_team
if [ ! -z "$input_team" ]; then
    TEAM_NAME="$input_team"
    ZIP_NAME="SWE645-HW3-${TEAM_NAME}-${TIMESTAMP}.zip"
fi

print_info "Package will be named: ${ZIP_NAME}"
echo ""

# Clean up any existing temp directory
if [ -d "$TEMP_DIR" ]; then
    print_warning "Removing existing temporary directory..."
    rm -rf "$TEMP_DIR"
fi

# Create temporary directory
print_step "Creating temporary directory..."
mkdir -p "$TEMP_DIR"
if [ $? -eq 0 ]; then
    print_success "Temporary directory created: $TEMP_DIR"
else
    print_error "Failed to create temporary directory!"
    exit 1
fi

# Function to copy directory with exclusions
copy_directory() {
    local source_dir=$1
    local dest_dir=$2
    
    if [ ! -d "$source_dir" ]; then
        print_warning "Directory $source_dir not found, skipping..."
        return 1
    fi
    
    print_info "Copying $source_dir..."
    
    # Use rsync if available, otherwise use cp with find
    if command -v rsync &> /dev/null; then
        rsync -av --exclude='node_modules' \
              --exclude='venv' \
              --exclude='.venv' \
              --exclude='__pycache__' \
              --exclude='*.pyc' \
              --exclude='.git' \
              --exclude='.env' \
              --exclude='.DS_Store' \
              --exclude='.vscode' \
              --exclude='.idea' \
              "$source_dir" "$dest_dir/" 2>/dev/null
    else
        # Fallback: use find and cp
        mkdir -p "$dest_dir/$source_dir"
        find "$source_dir" -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/venv/*" \
            ! -path "*/.venv/*" \
            ! -path "*/__pycache__/*" \
            ! -name "*.pyc" \
            ! -path "*/.git/*" \
            ! -name ".env" \
            ! -name ".DS_Store" \
            ! -path "*/.vscode/*" \
            ! -path "*/.idea/*" \
            -exec cp --parents {} "$dest_dir/" \; 2>/dev/null
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Copied $source_dir"
    else
        print_warning "Some files from $source_dir may not have been copied"
    fi
}

# Copy required files and directories
print_step "Copying files to temporary directory..."

# Copy source code directories
copy_directory "backend" "$TEMP_DIR"
copy_directory "frontend" "$TEMP_DIR"

# Copy configuration directories
copy_directory "k8s" "$TEMP_DIR"
copy_directory "postman" "$TEMP_DIR"
copy_directory "docs" "$TEMP_DIR"

# Copy individual files
print_info "Copying individual files..."

FILES_TO_COPY=(
    "README.md"
    "Jenkinsfile"
    "pre-submission-check.sh"
    "NEXT_STEPS.md"
    "ASSIGNMENT_STATUS.md"
    "HEADER_COMMENTS_SUMMARY.md"
)

for file in "${FILES_TO_COPY[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$TEMP_DIR/" 2>/dev/null
        if [ $? -eq 0 ]; then
            print_success "Copied $file"
        else
            print_warning "Failed to copy $file"
        fi
    else
        print_warning "$file not found, skipping..."
    fi
done

# Copy Dockerfiles explicitly
if [ -f "backend/Dockerfile" ]; then
    cp "backend/Dockerfile" "$TEMP_DIR/backend/" 2>/dev/null && print_success "Copied backend/Dockerfile"
fi

if [ -f "frontend/Dockerfile" ]; then
    cp "frontend/Dockerfile" "$TEMP_DIR/frontend/" 2>/dev/null && print_success "Copied frontend/Dockerfile"
fi

# Count files
print_step "Counting files..."
TOTAL_FILES=$(find "$TEMP_DIR" -type f | wc -l | tr -d ' ')
print_success "Total files to package: $TOTAL_FILES"

# Calculate size
print_step "Calculating package size..."
if command -v du &> /dev/null; then
    PACKAGE_SIZE=$(du -sh "$TEMP_DIR" | cut -f1)
    print_info "Package size: $PACKAGE_SIZE"
else
    print_warning "Could not calculate package size (du command not available)"
fi

# Create zip file
print_step "Creating zip file..."
if command -v zip &> /dev/null; then
    cd "$TEMP_DIR"
    zip -r "../${ZIP_NAME}" . -q > /dev/null 2>&1
    cd ..
    
    if [ $? -eq 0 ]; then
        print_success "Zip file created successfully!"
    else
        print_error "Failed to create zip file!"
        exit 1
    fi
elif command -v tar &> /dev/null; then
    # Fallback to tar if zip is not available
    print_warning "zip command not found, using tar instead..."
    tar -czf "${ZIP_NAME}.tar.gz" -C "$TEMP_DIR" .
    ZIP_NAME="${ZIP_NAME}.tar.gz"
    print_success "Archive created: ${ZIP_NAME}"
else
    print_error "Neither zip nor tar command found. Cannot create archive!"
    exit 1
fi

# Get zip file size
if [ -f "$ZIP_NAME" ]; then
    if command -v du &> /dev/null; then
        ZIP_SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
    else
        ZIP_SIZE="unknown"
    fi
fi

# Clean up temporary directory
print_step "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
print_success "Temporary directory removed"

# Display summary
echo ""
echo "=========================================="
echo -e "${GREEN}Package Created Successfully!${NC}"
echo "=========================================="
echo ""
echo -e "${CYAN}File Name:${NC} ${ZIP_NAME}"
echo -e "${CYAN}Location:${NC} $(pwd)/${ZIP_NAME}"
echo -e "${CYAN}Size:${NC} ${ZIP_SIZE}"
echo -e "${CYAN}Total Files:${NC} ${TOTAL_FILES}"
echo ""

# Display directory structure
print_step "Package Contents:"
echo ""
echo "Package Structure:"
tree -L 2 "$(dirname "$ZIP_NAME")" 2>/dev/null || find . -maxdepth 2 -name "$ZIP_NAME" -o -type d | head -20

echo ""
echo "=========================================="
echo -e "${YELLOW}⚠ IMPORTANT REMINDERS ⚠${NC}"
echo "=========================================="
echo ""

# Check if video file exists
if [ -f "VIDEO-LINK.txt" ] || [ -f "video.mp4" ] || [ -f "video.mov" ] || [ -f "video.avi" ]; then
    print_success "Video file or VIDEO-LINK.txt found"
else
    print_warning "Video file not found! Remember to:"
    echo "   - Add your video file to the package, OR"
    echo "   - Create VIDEO-LINK.txt with video link if file is too large"
fi

# Check README for team names
if grep -q "Team Members" README.md 2>/dev/null; then
    if grep -q "Add your name\|Add additional team member" README.md 2>/dev/null; then
        print_warning "README.md found but team members may not be filled in!"
        echo "   - Verify team member names are in README.md"
    else
        print_success "Team Members section found in README.md"
    fi
else
    print_warning "Team Members section not found in README.md!"
fi

# Check README for Kubernetes URL
if grep -qi "Kubernetes Deployment URL" README.md 2>/dev/null; then
    if grep -qi "Your Application URL will go here\|Add your Kubernetes" README.md 2>/dev/null; then
        print_warning "Kubernetes Deployment URL section found but may not be filled in!"
        echo "   - Add your Kubernetes application URL to README.md"
    else
        print_success "Kubernetes Deployment URL section found in README.md"
    fi
else
    print_warning "Kubernetes Deployment URL section not found in README.md!"
fi

echo ""
print_info "Next Steps:"
echo ""
echo "1. ${GREEN}Run validation script:${NC}"
echo "   bash pre-submission-check.sh"
echo ""
echo "2. ${GREEN}Add video file:${NC}"
echo "   - If video < 500MB: Add to zip manually"
echo "   - If video > 500MB: Create VIDEO-LINK.txt and add to zip"
echo ""
echo "3. ${GREEN}Verify package contents:${NC}"
echo "   - Unzip and check all files are present"
echo "   - Verify README.md has team names and URL"
echo ""
echo "4. ${GREEN}Final checks:${NC}"
echo "   - All source files included"
echo "   - All configuration files included"
echo "   - Documentation complete"
echo "   - Video included or linked"
echo ""

print_success "Package creation complete!"
print_info "Zip file: ${CYAN}${ZIP_NAME}${NC}"
echo ""

