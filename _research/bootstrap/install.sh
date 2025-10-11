#!/bin/bash
#
# Project Documentation Template Installer
#
# Install comprehensive project documentation with a single command:
#   curl -fsSL https://raw.githubusercontent.com/user/project-docs-template/main/install.sh | bash
#
# Or download and run locally:
#   ./install.sh
#
# Non-interactive mode:
#   ./install.sh --name "my-project" --type library --lang rust --non-interactive --yes
#
# Version: 1.0.0
# Documentation: https://github.com/user/project-docs-template

set -eo pipefail  # Exit on error, pipe failure (but not undefined vars for now)

#===============================================================================
# CONFIGURATION
#===============================================================================

# Script version
VERSION="1.0.0"

# Template source (can be overridden with TEMPLATE_SOURCE env var)
TEMPLATE_SOURCE="${TEMPLATE_SOURCE:-https://raw.githubusercontent.com/user/project-docs-template/main}"
TEMPLATE_VERSION="${TEMPLATE_VERSION:-main}"

# Installation directory
DOCS_DIR="${DOCS_DIR:-docs}"

# Temporary directory for downloads
TEMP_DIR="$(mktemp -d)"

# Transaction log for rollback
TRANSACTION_LOG="$TEMP_DIR/install.log"

# Configuration defaults
NON_INTERACTIVE=false
DRY_RUN=false
FORCE=false
BACKUP=false
MERGE=false
VERBOSE=false
QUIET=false
AUTO_YES=false

# Detected/configured values
PROJECT_NAME=""
PROJECT_TYPE=""
PRIMARY_LANGUAGE=""
FRAMEWORK=""
PROJECT_DESCRIPTION=""
REPOSITORY_URL=""
TEAM_NAME="Team"
INSTALL_EXAMPLES=true
INSTALL_CI=true
INSTALL_CLAUDE=true
INSTALL_VALE=false
INSTALL_API_REF=false

# Platform detection
PLATFORM="$(uname -s)"
case "$PLATFORM" in
  Darwin*)  OS="macos" ;;
  Linux*)   OS="linux" ;;
  CYGWIN*|MINGW*|MSYS*)
    echo "Error: Native Windows not supported. Please use WSL (Windows Subsystem for Linux)."
    exit 1
    ;;
  *)        OS="unknown" ;;
esac

#===============================================================================
# COLORS AND FORMATTING
#===============================================================================

# Check if terminal supports colors
if [ -t 1 ]; then
  NCOLORS=$(tput colors 2>/dev/null || echo 0)
  if [ "$NCOLORS" -ge 8 ]; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    MAGENTA=$(tput setaf 5)
    CYAN=$(tput setaf 6)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
  fi
fi

# Fallback to no colors if not set
RED="${RED:-}"
GREEN="${GREEN:-}"
YELLOW="${YELLOW:-}"
BLUE="${BLUE:-}"
MAGENTA="${MAGENTA:-}"
CYAN="${CYAN:-}"
BOLD="${BOLD:-}"
RESET="${RESET:-}"

#===============================================================================
# LOGGING FUNCTIONS
#===============================================================================

# Log a message with timestamp
log() {
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> "$TRANSACTION_LOG"
}

# Print info message
info() {
  if [ "$QUIET" = false ]; then
    echo "${CYAN}$*${RESET}"
  fi
}

# Print success message
success() {
  if [ "$QUIET" = false ]; then
    echo "${GREEN}✓${RESET} $*"
  fi
}

# Print warning message
warning() {
  if [ "$QUIET" = false ]; then
    echo "${YELLOW}⚠${RESET} $*" >&2
  fi
}

# Print error message
error() {
  echo "${RED}✗${RESET} $*" >&2
}

# Print verbose message (only if --verbose)
verbose() {
  if [ "$VERBOSE" = true ]; then
    echo "${BLUE}[DEBUG]${RESET} $*"
  fi
}

# Print section header
section() {
  if [ "$QUIET" = false ]; then
    echo ""
    echo "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo "${BOLD}$*${RESET}"
    echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
  fi
}

#===============================================================================
# UTILITY FUNCTIONS
#===============================================================================

# Prompt yes/no question (returns 0 for yes, 1 for no)
prompt_yes_no() {
  local prompt="$1"
  local default="${2:-y}"

  if [ "$AUTO_YES" = true ]; then
    verbose "Auto-answering yes to: $prompt"
    return 0
  fi

  if [ "$NON_INTERACTIVE" = true ]; then
    verbose "Non-interactive mode, using default for: $prompt"
    [ "$default" = "y" ] && return 0 || return 1
  fi

  local yn
  while true; do
    if [ "$default" = "y" ]; then
      read -p "${prompt} (Y/n): " yn
      yn="${yn:-y}"
    else
      read -p "${prompt} (y/N): " yn
      yn="${yn:-n}"
    fi

    case "$yn" in
      [Yy]*) return 0 ;;
      [Nn]*) return 1 ;;
      *) echo "Please answer yes or no." ;;
    esac
  done
}

# Prompt for input with default
prompt_input() {
  local prompt="$1"
  local default="$2"
  local varname="$3"

  if [ "$NON_INTERACTIVE" = true ]; then
    verbose "Non-interactive mode, using default: $default"
    eval "$varname='$default'"
    return
  fi

  local input
  read -p "${prompt} ${CYAN}($default)${RESET}: " input
  input="${input:-$default}"
  eval "$varname='$input'"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Download file (curl or wget)
download_file() {
  local url="$1"
  local dest="$2"

  verbose "Downloading: $url -> $dest"

  if command_exists curl; then
    curl -fsSL "$url" -o "$dest" 2>/dev/null || return 1
  elif command_exists wget; then
    wget -q -O "$dest" "$url" 2>/dev/null || return 1
  else
    error "Neither curl nor wget found. Please install one of them."
    return 1
  fi

  return 0
}

# Validate project name
validate_project_name() {
  local name="$1"

  # Check length
  if [ ${#name} -lt 1 ] || [ ${#name} -gt 100 ]; then
    return 1
  fi

  # Check characters (alphanumeric, dash, underscore, space)
  if ! echo "$name" | grep -qE '^[a-zA-Z0-9_. -]+$'; then
    return 1
  fi

  return 0
}

# Cleanup temporary files
cleanup() {
  if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
    verbose "Cleaned up temporary directory"
  fi
}

# Trap for cleanup on exit
trap cleanup EXIT

# Trap for rollback on interrupt
trap 'error "Installation interrupted"; rollback_installation; exit 130' INT TERM

#===============================================================================
# ROLLBACK MECHANISM
#===============================================================================

rollback_installation() {
  warning "Rolling back installation..."

  if [ ! -f "$TRANSACTION_LOG" ]; then
    verbose "No transaction log found, nothing to rollback"
    return
  fi

  # Read transaction log in reverse and undo operations
  tac "$TRANSACTION_LOG" 2>/dev/null | while IFS=' ' read -r timestamp op target rest; do
    case "$op" in
      CREATE_DIR)
        if [ -d "$target" ]; then
          rm -rf "$target"
          verbose "Removed directory: $target"
        fi
        ;;
      CREATE_FILE)
        if [ -f "$target" ]; then
          rm -f "$target"
          verbose "Removed file: $target"
        fi
        ;;
      MODIFY_FILE)
        if [ -f "$target.pre-install" ]; then
          mv "$target.pre-install" "$target"
          verbose "Restored: $target"
        fi
        ;;
    esac
  done

  success "Rollback complete"
}

#===============================================================================
# PRE-FLIGHT CHECKS
#===============================================================================

preflight_checks() {
  section "Pre-Flight Checks"

  local errors=0

  # Check bash version
  if [ -n "$BASH_VERSION" ]; then
    BASH_MAJOR=$(echo "$BASH_VERSION" | cut -d. -f1)
    BASH_MINOR=$(echo "$BASH_VERSION" | cut -d. -f2)

    if [ "$BASH_MAJOR" -lt 3 ] || \
       ([ "$BASH_MAJOR" -eq 3 ] && [ "$BASH_MINOR" -lt 2 ]); then
      error "Bash 3.2+ required (found $BASH_VERSION)"
      errors=$((errors + 1))
    else
      success "Bash version: $BASH_VERSION"
    fi
  fi

  # Check for curl or wget
  if command_exists curl; then
    success "curl: $(command -v curl)"
  elif command_exists wget; then
    success "wget: $(command -v wget)"
  else
    error "Neither curl nor wget found"
    echo "  Install curl:"
    echo "    macOS: brew install curl"
    echo "    Ubuntu/Debian: apt-get install curl"
    errors=$((errors + 1))
  fi

  # Check for git (optional but recommended)
  if command_exists git; then
    success "git: $(command -v git)"
  else
    warning "git not found (optional)"
    echo "  Git integration will be disabled"
  fi

  # Check write permission
  if [ -w "." ]; then
    success "Write permission: OK"
  else
    error "No write permission in current directory"
    errors=$((errors + 1))
  fi

  # Check if docs/ exists
  if [ -d "$DOCS_DIR" ]; then
    local file_count=$(find "$DOCS_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$file_count" -gt 0 ]; then
      warning "Documentation directory exists: $DOCS_DIR/ ($file_count files)"

      if [ "$FORCE" = true ]; then
        info "Force mode: will overwrite"
      elif [ "$BACKUP" = true ]; then
        info "Backup mode: will backup first"
      elif [ "$MERGE" = true ]; then
        info "Merge mode: will merge with existing"
      elif [ "$NON_INTERACTIVE" = false ]; then
        info "Will prompt for action"
      else
        error "Cannot proceed in non-interactive mode without --force, --backup, or --merge"
        errors=$((errors + 1))
      fi
    else
      success "Documentation directory exists but empty"
    fi
  else
    success "Documentation directory: $DOCS_DIR/ (will be created)"
  fi

  # Check for partial installation
  if [ -f ".docs-install-incomplete" ]; then
    warning "Found incomplete installation marker"
    if [ "$NON_INTERACTIVE" = false ]; then
      if prompt_yes_no "Clean up and start fresh?"; then
        rm -f ".docs-install-incomplete"
        if [ -d "$DOCS_DIR" ]; then
          rm -rf "$DOCS_DIR"
        fi
        success "Cleaned up incomplete installation"
      fi
    fi
  fi

  if [ $errors -gt 0 ]; then
    error "Pre-flight checks failed: $errors error(s)"
    return 1
  fi

  success "All pre-flight checks passed"
  return 0
}

#===============================================================================
# PROJECT DETECTION
#===============================================================================

detect_project() {
  section "Project Detection"

  # Detect project name from directory
  PROJECT_NAME=$(basename "$(pwd)")
  verbose "Detected project name: $PROJECT_NAME"

  # Detect language and type from project files
  if [ -f "package.json" ]; then
    PRIMARY_LANGUAGE="JavaScript/TypeScript"
    # Try to determine if library or application
    if grep -q '"type".*"library"' package.json 2>/dev/null; then
      PROJECT_TYPE="library"
    else
      PROJECT_TYPE="application"
    fi
    # Try to detect framework
    if grep -q '"react"' package.json 2>/dev/null; then
      FRAMEWORK="React"
    elif grep -q '"vue"' package.json 2>/dev/null; then
      FRAMEWORK="Vue"
    elif grep -q '"next"' package.json 2>/dev/null; then
      FRAMEWORK="Next.js"
    elif grep -q '"express"' package.json 2>/dev/null; then
      FRAMEWORK="Express"
    fi
    success "Detected: JavaScript/TypeScript project"

  elif [ -f "Cargo.toml" ]; then
    PRIMARY_LANGUAGE="Rust"
    if grep -q '\[\[bin\]\]' Cargo.toml 2>/dev/null; then
      PROJECT_TYPE="cli"
    else
      PROJECT_TYPE="library"
    fi
    success "Detected: Rust project"

  elif [ -f "go.mod" ]; then
    PRIMARY_LANGUAGE="Go"
    if [ -f "main.go" ]; then
      PROJECT_TYPE="application"
    else
      PROJECT_TYPE="library"
    fi
    success "Detected: Go project"

  elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    PRIMARY_LANGUAGE="Python"
    PROJECT_TYPE="library"
    success "Detected: Python project"

  elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
    PRIMARY_LANGUAGE="Java"
    PROJECT_TYPE="application"
    success "Detected: Java project"

  elif [ -f "Gemfile" ]; then
    PRIMARY_LANGUAGE="Ruby"
    PROJECT_TYPE="application"
    if grep -q 'rails' Gemfile 2>/dev/null; then
      FRAMEWORK="Rails"
    fi
    success "Detected: Ruby project"

  elif [ -f "composer.json" ]; then
    PRIMARY_LANGUAGE="PHP"
    PROJECT_TYPE="application"
    success "Detected: PHP project"

  else
    warning "Could not detect project type"
    PRIMARY_LANGUAGE="Unknown"
    PROJECT_TYPE="application"
  fi

  # Detect git repository
  if [ -d ".git" ]; then
    success "Git repository detected"
    if command_exists git; then
      REPOSITORY_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
      # Remove credentials from URL if present
      REPOSITORY_URL=$(echo "$REPOSITORY_URL" | sed 's|://[^@]*@|://|')
      if [ -n "$REPOSITORY_URL" ]; then
        verbose "Repository URL: $REPOSITORY_URL"
      fi
    fi
  else
    info "Not a git repository"
  fi
}

#===============================================================================
# INTERACTIVE CONFIGURATION
#===============================================================================

interactive_configuration() {
  if [ "$NON_INTERACTIVE" = true ]; then
    verbose "Skipping interactive configuration"
    return 0
  fi

  section "Project Configuration"

  # Show detected values
  echo "Detected project details:"
  echo "  Name: ${CYAN}$PROJECT_NAME${RESET}"
  echo "  Type: ${CYAN}$PROJECT_TYPE${RESET}"
  echo "  Language: ${CYAN}$PRIMARY_LANGUAGE${RESET}"
  if [ -n "$FRAMEWORK" ]; then
    echo "  Framework: ${CYAN}$FRAMEWORK${RESET}"
  fi
  echo ""

  # Prompt for project name
  prompt_input "Project name" "$PROJECT_NAME" PROJECT_NAME

  # Validate project name
  if ! validate_project_name "$PROJECT_NAME"; then
    error "Invalid project name. Use alphanumeric characters, dash, underscore, or space."
    return 1
  fi

  # Prompt for project type
  echo "Project type:"
  echo "  1) Application (web app, mobile app, desktop app)"
  echo "  2) Library/Package (reusable code)"
  echo "  3) Framework (platform for other developers)"
  echo "  4) CLI Tool (command-line utility)"
  echo "  5) Other"
  echo ""

  local type_choice
  read -p "Choose project type (1-5) [1]: " type_choice
  type_choice="${type_choice:-1}"

  case "$type_choice" in
    1) PROJECT_TYPE="application" ;;
    2) PROJECT_TYPE="library" ;;
    3) PROJECT_TYPE="framework" ;;
    4) PROJECT_TYPE="cli" ;;
    5) PROJECT_TYPE="other" ;;
    *) PROJECT_TYPE="application" ;;
  esac

  # Prompt for language
  prompt_input "Primary language" "$PRIMARY_LANGUAGE" PRIMARY_LANGUAGE

  # Prompt for framework (optional)
  prompt_input "Framework (optional)" "$FRAMEWORK" FRAMEWORK

  # Prompt for optional components
  echo ""
  echo "Optional components:"
  echo ""

  if prompt_yes_no "Install examples directory?" "y"; then
    INSTALL_EXAMPLES=true
  else
    INSTALL_EXAMPLES=false
  fi

  if prompt_yes_no "Install CI/CD workflow templates?" "y"; then
    INSTALL_CI=true
  else
    INSTALL_CI=false
  fi

  if prompt_yes_no "Install Claude Code integration?" "y"; then
    INSTALL_CLAUDE=true
  else
    INSTALL_CLAUDE=false
  fi

  success "Configuration complete"
}

#===============================================================================
# CONFIRMATION & PREVIEW
#===============================================================================

show_preview() {
  section "Installation Preview"

  echo "${BOLD}Project Configuration:${RESET}"
  echo "  Name:      $PROJECT_NAME"
  echo "  Type:      $PROJECT_TYPE"
  echo "  Language:  $PRIMARY_LANGUAGE"
  if [ -n "$FRAMEWORK" ]; then
    echo "  Framework: $FRAMEWORK"
  fi
  echo ""

  echo "${BOLD}Will create:${RESET}"
  echo "  📁 $DOCS_DIR/"
  echo "  ├── README.md"
  echo "  ├── quickstart.md"
  echo "  ├── writing-software.md"
  echo "  ├── patterns.md"
  echo "  ├── standards.md"
  echo "  ├── code-review.md"
  echo "  ├── testing.md"
  echo "  ├── onboarding.md"
  echo "  ├── doc-health.md"
  echo "  ├── 📁 tutorials/"
  echo "  ├── 📁 guides/"
  echo "  ├── 📁 reference/"
  echo "  ├── 📁 concepts/"
  if [ "$INSTALL_EXAMPLES" = true ]; then
    echo "  ├── 📁 examples/"
  fi
  echo "  └── 📁 contributing/"
  echo ""

  if [ "$INSTALL_CI" = true ]; then
    echo "  📁 .github/workflows/"
    echo "  └── docs.yml"
    echo ""
  fi

  if [ "$INSTALL_CLAUDE" = true ]; then
    echo "  📁 .claude/"
    echo "  ├── 📁 commands/"
    echo "  └── 📁 agents/"
    echo ""
  fi

  echo "${BOLD}Optional components:${RESET}"
  echo "  Examples directory:    $([ "$INSTALL_EXAMPLES" = true ] && echo "✓ Yes" || echo "✗ No")"
  echo "  CI/CD workflows:       $([ "$INSTALL_CI" = true ] && echo "✓ Yes" || echo "✗ No")"
  echo "  Claude Code:           $([ "$INSTALL_CLAUDE" = true ] && echo "✓ Yes" || echo "✗ No")"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    info "Dry run mode: No files will be created"
    return 0
  fi

  if [ "$NON_INTERACTIVE" = false ]; then
    if ! prompt_yes_no "Proceed with installation?" "y"; then
      info "Installation cancelled"
      exit 0
    fi
  fi
}

#===============================================================================
# HANDLE EXISTING DOCS
#===============================================================================

handle_existing_docs() {
  if [ ! -d "$DOCS_DIR" ]; then
    return 0  # No existing docs
  fi

  local file_count=$(find "$DOCS_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "$file_count" -eq 0 ]; then
    return 0  # Empty directory
  fi

  # Force mode: overwrite
  if [ "$FORCE" = true ]; then
    warning "Force mode: Removing existing $DOCS_DIR/"
    rm -rf "$DOCS_DIR"
    return 0
  fi

  # Backup mode: backup and continue
  if [ "$BACKUP" = true ]; then
    local backup_dir="${DOCS_DIR}.backup.$(date +%s)"
    info "Backing up existing $DOCS_DIR/ to $backup_dir/"
    mv "$DOCS_DIR" "$backup_dir"
    log "BACKUP_DIR" "$backup_dir"
    success "Backup created: $backup_dir/"
    return 0
  fi

  # Merge mode: keep existing, add missing
  if [ "$MERGE" = true ]; then
    info "Merge mode: Will preserve existing files"
    return 0
  fi

  # Interactive mode: ask user
  if [ "$NON_INTERACTIVE" = false ]; then
    echo ""
    echo "${YELLOW}⚠ Documentation directory already exists${RESET}"
    echo ""
    echo "Found: ./$DOCS_DIR/ ($file_count files)"
    echo ""
    echo "How would you like to proceed?"
    echo "  1) Backup existing and install fresh"
    echo "  2) Merge with existing (preserve your files, add missing)"
    echo "  3) Overwrite everything (DESTRUCTIVE)"
    echo "  4) Abort installation"
    echo ""

    local choice
    read -p "Choose option (1-4): " choice

    case "$choice" in
      1)
        local backup_dir="${DOCS_DIR}.backup.$(date +%s)"
        mv "$DOCS_DIR" "$backup_dir"
        log "BACKUP_DIR" "$backup_dir"
        success "Backup created: $backup_dir/"
        ;;
      2)
        MERGE=true
        info "Will merge with existing files"
        ;;
      3)
        if prompt_yes_no "Are you sure? This will DELETE all existing documentation" "n"; then
          rm -rf "$DOCS_DIR"
          success "Removed existing $DOCS_DIR/"
        else
          info "Installation cancelled"
          exit 0
        fi
        ;;
      4|*)
        info "Installation cancelled"
        exit 0
        ;;
    esac
  else
    error "Existing documentation found in non-interactive mode"
    echo "Use one of: --force, --backup, or --merge"
    return 1
  fi

  return 0
}

#===============================================================================
# TEMPLATE INSTALLATION
#===============================================================================

create_directory_structure() {
  section "Creating Directory Structure"

  # Create main docs directory
  if [ ! -d "$DOCS_DIR" ]; then
    mkdir -p "$DOCS_DIR"
    log "CREATE_DIR" "$DOCS_DIR"
    success "Created: $DOCS_DIR/"
  fi

  # Create subdirectories
  local dirs=(
    "$DOCS_DIR/tutorials"
    "$DOCS_DIR/guides"
    "$DOCS_DIR/reference/api"
    "$DOCS_DIR/reference/cli"
    "$DOCS_DIR/reference/configuration"
    "$DOCS_DIR/concepts"
    "$DOCS_DIR/contributing"
  )

  if [ "$INSTALL_EXAMPLES" = true ]; then
    dirs+=("$DOCS_DIR/examples")
  fi

  for dir in "${dirs[@]}"; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir"
      log "CREATE_DIR" "$dir"
      verbose "Created: $dir/"
    fi
  done

  # Create .gitkeep files in empty directories
  find "$DOCS_DIR" -type d -empty -exec touch {}/.gitkeep \; 2>/dev/null

  success "Directory structure created"
}

install_template_files() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  section "Installing Template Files"

  # Note: In production, these would be downloaded from GitHub
  # For this demonstration, we'll create placeholder files

  # Core documentation files
  local core_files=(
    "README.md"
    "quickstart.md"
    "writing-software.md"
    "patterns.md"
    "standards.md"
    "code-review.md"
    "testing.md"
    "onboarding.md"
    "doc-health.md"
  )

  for file in "${core_files[@]}"; do
    local target="$DOCS_DIR/$file"
    if [ "$MERGE" = true ] && [ -f "$target" ]; then
      verbose "Skipping existing: $file"
      continue
    fi

    # Create minimal template (in production, download from GitHub)
    create_template_file "$target" "$file"
    log "CREATE_FILE" "$target"
    success "Installed: $file"
  done

  # Section README files
  local section_readmes=(
    "tutorials/README.md"
    "guides/README.md"
    "reference/README.md"
    "concepts/README.md"
    "contributing/README.md"
  )

  if [ "$INSTALL_EXAMPLES" = true ]; then
    section_readmes+=("examples/README.md")
  fi

  for readme in "${section_readmes[@]}"; do
    local target="$DOCS_DIR/$readme"
    if [ "$MERGE" = true ] && [ -f "$target" ]; then
      verbose "Skipping existing: $readme"
      continue
    fi

    create_section_readme "$target" "$(dirname "$readme")"
    log "CREATE_FILE" "$target"
    verbose "Created: $readme"
  done

  success "Template files installed"
}

# Create a template file (minimal version for demonstration)
create_template_file() {
  local target="$1"
  local filename="$2"

  case "$filename" in
    "README.md")
      cat > "$target" <<'EOF'
# {{PROJECT_NAME}} Documentation

Welcome to the {{PROJECT_NAME}} documentation.

## Getting Started

- [Quick Start](quickstart.md) - Get up and running in 5 minutes
- [Tutorials](tutorials/) - Step-by-step learning guides
- [Guides](guides/) - Task-oriented how-to guides

## Development

- [How We Write Software](writing-software.md) - Development philosophy
- [High-Level Patterns](patterns.md) - Architectural patterns
- [Code Standards](standards.md) - Coding conventions
- [Code Review](code-review.md) - Review practices
- [Testing](testing.md) - Testing approach

## Reference

- [API Reference](reference/api/) - API documentation
- [CLI Reference](reference/cli/) - Command-line interface
- [Configuration](reference/configuration/) - Configuration options

## Understanding

- [Concepts](concepts/) - Architectural concepts
- [Examples](examples/) - Working code examples

## Contributing

- [Developer Onboarding](onboarding.md) - New developer guide
- [Contributing Guide](contributing/) - How to contribute
- [Documentation Health](doc-health.md) - Maintaining these docs

---

*Last updated: {{DATE}}*
EOF
      ;;
    "quickstart.md")
      cat > "$target" <<'EOF'
# Quick Start

Get up and running with {{PROJECT_NAME}} in under 5 minutes.

## Prerequisites

[TODO: List prerequisites]

- Prerequisite 1
- Prerequisite 2

## Installation

[TODO: Provide installation instructions]

```bash
# Installation command
```

## Your First {{PROJECT_NAME}} Project

[TODO: Provide a minimal working example]

```{{PRIMARY_LANGUAGE}}
// Minimal working example
```

## What's Next?

- [Tutorial](tutorials/) - Learn {{PROJECT_NAME}} step-by-step
- [Guides](guides/) - Solve specific problems
- [Examples](examples/) - See real-world code

---

*Last updated: {{DATE}}*
EOF
      ;;
    *)
      # Generic template
      cat > "$target" <<EOF
# $(basename "$filename" .md | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')

[TODO: Add content for this section]

---

*Last updated: {{DATE}}*
EOF
      ;;
  esac
}

create_section_readme() {
  local target="$1"
  local section="$2"

  cat > "$target" <<EOF
# $(basename "$section" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

[TODO: Add overview of this section]

---

*Last updated: {{DATE}}*
EOF
}

install_optional_components() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  section "Installing Optional Components"

  # CI/CD workflows
  if [ "$INSTALL_CI" = true ]; then
    info "Installing CI/CD workflows..."
    mkdir -p .github/workflows
    cat > .github/workflows/docs.yml <<'EOF'
name: Documentation

on:
  push:
    branches: [main]
    paths: ['docs/**']
  pull_request:
    paths: ['docs/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check links
        run: |
          # Add link checking here
          echo "Link checking..."
      - name: Lint docs
        run: |
          # Add linting here
          echo "Linting..."

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: |
          # Add deployment here
          echo "Deploying..."
EOF
    log "CREATE_FILE" ".github/workflows/docs.yml"
    success "Installed CI/CD workflow"
  fi

  # Claude Code integration
  if [ "$INSTALL_CLAUDE" = true ]; then
    info "Installing Claude Code integration..."
    mkdir -p .claude/commands .claude/agents

    cat > .claude/commands/review-docs.md <<'EOF'
Review the project documentation for quality, completeness, and accuracy.

Check:
- All TODO markers are addressed or have clear next steps
- Code examples are accurate and tested
- Links are valid (internal and external)
- Tone and voice are consistent
- Information is up-to-date with code

Provide specific feedback on improvements.
EOF

    log "CREATE_FILE" ".claude/commands/review-docs.md"
    success "Installed Claude Code integration"
  fi
}

#===============================================================================
# POST-INSTALL CONFIGURATION
#===============================================================================

replace_placeholders() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  section "Customizing Templates"

  local current_date=$(date +%Y-%m-%d)
  local current_year=$(date +%Y)

  # Find all .md files and replace placeholders
  find "$DOCS_DIR" -type f -name "*.md" | while read -r file; do
    if [ -f "$file" ]; then
      # Create backup for rollback
      cp "$file" "$file.pre-customize" 2>/dev/null

      # Perform replacements
      if [ "$OS" = "macos" ]; then
        sed -i '' \
          -e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
          -e "s|{{PROJECT_TYPE}}|$PROJECT_TYPE|g" \
          -e "s|{{PRIMARY_LANGUAGE}}|$PRIMARY_LANGUAGE|g" \
          -e "s|{{FRAMEWORK}}|${FRAMEWORK:-N/A}|g" \
          -e "s|{{DATE}}|$current_date|g" \
          -e "s|{{YEAR}}|$current_year|g" \
          "$file"
      else
        sed -i \
          -e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
          -e "s|{{PROJECT_TYPE}}|$PROJECT_TYPE|g" \
          -e "s|{{PRIMARY_LANGUAGE}}|$PRIMARY_LANGUAGE|g" \
          -e "s|{{FRAMEWORK}}|${FRAMEWORK:-N/A}|g" \
          -e "s|{{DATE}}|$current_date|g" \
          -e "s|{{YEAR}}|$current_year|g" \
          "$file"
      fi

      # Remove backup
      rm -f "$file.pre-customize"

      log "MODIFY_FILE" "$file"
      verbose "Customized: $file"
    fi
  done

  success "Templates customized"
}

setup_git_integration() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  if ! command_exists git; then
    verbose "Git not available, skipping git integration"
    return 0
  fi

  section "Git Integration"

  # Initialize git if not already initialized
  if [ ! -d ".git" ]; then
    if [ "$NON_INTERACTIVE" = false ]; then
      if prompt_yes_no "Initialize git repository?" "y"; then
        git init
        success "Initialized git repository"
      fi
    fi
  fi

  # Add docs to git
  if [ -d ".git" ]; then
    git add "$DOCS_DIR/" 2>/dev/null || true

    # Optionally create initial commit
    if [ "$NON_INTERACTIVE" = false ]; then
      if prompt_yes_no "Create initial commit?" "y"; then
        git commit -m "docs: Add project documentation structure

Generated with project-docs-template installer.

Includes:
- Core documentation files
- Diataxis-based structure
- Developer onboarding guide
- Testing documentation
- Code review practices" 2>/dev/null || warning "Failed to create commit"
        success "Created initial commit"
      fi
    fi
  fi
}

save_configuration() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  section "Saving Configuration"

  cat > .docs-config.json <<EOF
{
  "version": "$VERSION",
  "installedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "config": {
    "projectName": "$PROJECT_NAME",
    "projectType": "$PROJECT_TYPE",
    "primaryLanguage": "$PRIMARY_LANGUAGE",
    "framework": "$FRAMEWORK",
    "components": {
      "examples": $INSTALL_EXAMPLES,
      "ci": $INSTALL_CI,
      "claude": $INSTALL_CLAUDE,
      "vale": $INSTALL_VALE,
      "apiReference": $INSTALL_API_REF
    }
  }
}
EOF

  log "CREATE_FILE" ".docs-config.json"
  success "Configuration saved to .docs-config.json"
}

#===============================================================================
# VALIDATION
#===============================================================================

validate_installation() {
  section "Validating Installation"

  local errors=0

  # Check required directories
  local required_dirs=(
    "$DOCS_DIR"
    "$DOCS_DIR/tutorials"
    "$DOCS_DIR/guides"
    "$DOCS_DIR/reference"
    "$DOCS_DIR/concepts"
  )

  for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
      verbose "✓ Directory exists: $dir"
    else
      error "✗ Missing directory: $dir"
      errors=$((errors + 1))
    fi
  done

  # Check required files
  local required_files=(
    "$DOCS_DIR/README.md"
    "$DOCS_DIR/quickstart.md"
  )

  for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
      verbose "✓ File exists: $file"
    else
      error "✗ Missing file: $file"
      errors=$((errors + 1))
    fi
  done

  # Check if placeholders were replaced
  if grep -r "{{PROJECT_NAME}}" "$DOCS_DIR/" >/dev/null 2>&1; then
    warning "Some placeholders may not have been replaced"
  fi

  # Check file permissions
  if [ -w "$DOCS_DIR/README.md" ]; then
    verbose "✓ Files are writable"
  else
    warning "Files may not be writable"
  fi

  if [ $errors -eq 0 ]; then
    success "Installation validated successfully"
    return 0
  else
    error "Validation failed: $errors error(s)"
    return 1
  fi
}

#===============================================================================
# SUCCESS MESSAGE
#===============================================================================

show_success_message() {
  section "Installation Complete"

  cat <<EOF
${GREEN}✓${RESET} Documentation structure created at: ${BOLD}./$DOCS_DIR/${RESET}

${BOLD}📚 Next Steps:${RESET}

  1. Review the documentation index
     👉 ${CYAN}$DOCS_DIR/README.md${RESET}

  2. Customize your project's philosophy
     👉 ${CYAN}$DOCS_DIR/writing-software.md${RESET}
     (Look for TODO markers)

  3. Write your quick start guide
     👉 ${CYAN}$DOCS_DIR/quickstart.md${RESET}

  4. Document your code standards
     👉 ${CYAN}$DOCS_DIR/standards.md${RESET}

  5. Add your first tutorial
     👉 ${CYAN}$DOCS_DIR/tutorials/${RESET}

${BOLD}📖 Documentation Guide:${RESET}
   https://github.com/user/project-docs-template#usage

${BOLD}💡 Tips:${RESET}
   • Find TODO markers: ${CYAN}grep -r "TODO:" $DOCS_DIR/${RESET}
   • Commit often: Document as you build
   • Keep docs in sync with code

EOF

  if [ "$INSTALL_CLAUDE" = true ]; then
    echo "${BOLD}🤖 Claude Code Integration:${RESET}"
    echo "   Use ${CYAN}/review-docs${RESET} to check documentation quality"
    echo ""
  fi

  if [ -f ".docs-config.json" ]; then
    echo "Configuration saved to ${CYAN}.docs-config.json${RESET}"
    echo ""
  fi
}

#===============================================================================
# COMMAND-LINE ARGUMENT PARSING
#===============================================================================

show_help() {
  cat <<EOF
Project Documentation Template Installer v$VERSION

USAGE:
  $0 [OPTIONS]

OPTIONS:
  Installation modes:
    --non-interactive       Non-interactive mode (use with config or flags)
    --dry-run              Show what would be done without making changes
    --config FILE          Load configuration from JSON file

  Project configuration:
    --name NAME            Project name
    --type TYPE            Project type (application, library, framework, cli)
    --lang LANGUAGE        Primary programming language
    --framework NAME       Framework name

  Optional components:
    --examples             Install examples directory (default: yes)
    --no-examples          Skip examples directory
    --ci                   Install CI/CD workflow templates (default: yes)
    --no-ci                Skip CI/CD templates
    --claude               Install Claude Code integration (default: yes)
    --no-claude            Skip Claude Code integration

  Existing documentation handling:
    --force                Overwrite existing documentation
    --backup               Backup existing documentation before installing
    --merge                Merge with existing documentation

  Behavior:
    --yes, -y              Answer yes to all prompts
    --verbose              Verbose output
    --quiet                Minimal output

  Information:
    --version              Show version information
    --help, -h             Show this help message

EXAMPLES:
  # Interactive installation
  $0

  # Non-interactive with flags
  $0 --name "my-project" --type library --lang rust --non-interactive --yes

  # With configuration file
  $0 --config .docs-config.json --non-interactive

  # Dry run
  $0 --dry-run

  # Update existing installation
  $0 --config .docs-config.json --merge

DOCUMENTATION:
  https://github.com/user/project-docs-template

EOF
}

show_version() {
  echo "project-docs-template installer v$VERSION"
  echo "Template source: $TEMPLATE_SOURCE"
  echo "Template version: $TEMPLATE_VERSION"
}

parse_arguments() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --help|-h)
        show_help
        exit 0
        ;;
      --version)
        show_version
        exit 0
        ;;
      --non-interactive)
        NON_INTERACTIVE=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --force)
        FORCE=true
        shift
        ;;
      --backup)
        BACKUP=true
        shift
        ;;
      --merge)
        MERGE=true
        shift
        ;;
      --yes|-y)
        AUTO_YES=true
        shift
        ;;
      --verbose)
        VERBOSE=true
        shift
        ;;
      --quiet)
        QUIET=true
        shift
        ;;
      --name)
        PROJECT_NAME="$2"
        shift 2
        ;;
      --type)
        PROJECT_TYPE="$2"
        shift 2
        ;;
      --lang|--language)
        PRIMARY_LANGUAGE="$2"
        shift 2
        ;;
      --framework)
        FRAMEWORK="$2"
        shift 2
        ;;
      --examples)
        INSTALL_EXAMPLES=true
        shift
        ;;
      --no-examples)
        INSTALL_EXAMPLES=false
        shift
        ;;
      --ci)
        INSTALL_CI=true
        shift
        ;;
      --no-ci)
        INSTALL_CI=false
        shift
        ;;
      --claude)
        INSTALL_CLAUDE=true
        shift
        ;;
      --no-claude)
        INSTALL_CLAUDE=false
        shift
        ;;
      --config)
        CONFIG_FILE="$2"
        if [ -f "$CONFIG_FILE" ]; then
          load_config_file "$CONFIG_FILE"
        else
          error "Config file not found: $CONFIG_FILE"
          exit 1
        fi
        shift 2
        ;;
      *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  done
}

load_config_file() {
  local config_file="$1"
  verbose "Loading configuration from: $config_file"

  # Simple JSON parsing (requires jq in production)
  # For this demo, we'll show the structure
  warning "Config file loading requires 'jq' - not implemented in demo"
}

#===============================================================================
# MAIN
#===============================================================================

main() {
  # Mark installation as incomplete (for rollback detection)
  touch .docs-install-incomplete

  # Parse command-line arguments
  parse_arguments "$@"

  # Show banner
  if [ "$QUIET" = false ]; then
    echo ""
    echo "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════╗${RESET}"
    echo "${BOLD}${CYAN}║                                                       ║${RESET}"
    echo "${BOLD}${CYAN}║     Project Documentation Template Installer         ║${RESET}"
    echo "${BOLD}${CYAN}║                   Version $VERSION                       ║${RESET}"
    echo "${BOLD}${CYAN}║                                                       ║${RESET}"
    echo "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════╝${RESET}"
    echo ""
  fi

  # Run installation steps
  preflight_checks || exit 2

  detect_project

  interactive_configuration || exit 6

  show_preview

  handle_existing_docs || exit 4

  create_directory_structure

  install_template_files

  install_optional_components

  replace_placeholders

  setup_git_integration

  save_configuration

  validate_installation || { rollback_installation; exit 5; }

  # Remove incomplete marker
  rm -f .docs-install-incomplete

  show_success_message

  if [ "$DRY_RUN" = true ]; then
    info "Dry run complete - no files were created"
  fi
}

# Run main function
main "$@"
