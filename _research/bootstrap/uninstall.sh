#!/bin/bash
#
# Project Documentation Template Uninstaller
#
# Safely remove documentation installed by the project-docs-template installer.
#
# Usage:
#   ./uninstall.sh                    # Interactive removal
#   ./uninstall.sh --yes              # Non-interactive removal
#   ./uninstall.sh --preserve-custom  # Keep customized files
#
# Version: 1.0.0

set -eo pipefail

#===============================================================================
# CONFIGURATION
#===============================================================================

VERSION="1.0.0"

# Installation directory
DOCS_DIR="${DOCS_DIR:-docs}"

# Uninstall options
NON_INTERACTIVE=false
AUTO_YES=false
PRESERVE_CUSTOM=false
DRY_RUN=false
VERBOSE=false

# Files/directories to remove (installed by template)
TEMPLATE_FILES=(
  "docs/README.md"
  "docs/quickstart.md"
  "docs/writing-software.md"
  "docs/patterns.md"
  "docs/standards.md"
  "docs/code-review.md"
  "docs/testing.md"
  "docs/onboarding.md"
  "docs/doc-health.md"
  "docs/tutorials/README.md"
  "docs/guides/README.md"
  "docs/reference/README.md"
  "docs/concepts/README.md"
  "docs/examples/README.md"
  "docs/contributing/README.md"
  ".github/workflows/docs.yml"
  ".claude/commands/review-docs.md"
  ".docs-config.json"
)

TEMPLATE_DIRS=(
  "docs/tutorials"
  "docs/guides"
  "docs/reference/api"
  "docs/reference/cli"
  "docs/reference/configuration"
  "docs/reference"
  "docs/concepts"
  "docs/examples"
  "docs/contributing"
  "docs"
  ".claude/commands"
  ".claude/agents"
  ".claude"
)

#===============================================================================
# COLORS AND FORMATTING
#===============================================================================

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

info() {
  echo "${CYAN}$*${RESET}"
}

success() {
  echo "${GREEN}✓${RESET} $*"
}

warning() {
  echo "${YELLOW}⚠${RESET} $*" >&2
}

error() {
  echo "${RED}✗${RESET} $*" >&2
}

verbose() {
  if [ "$VERBOSE" = true ]; then
    echo "${BLUE}[DEBUG]${RESET} $*"
  fi
}

section() {
  echo ""
  echo "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo "${BOLD}$*${RESET}"
  echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
}

#===============================================================================
# UTILITY FUNCTIONS
#===============================================================================

prompt_yes_no() {
  local prompt="$1"
  local default="${2:-n}"

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

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if file was customized by user
is_customized() {
  local file="$1"

  if [ ! -f "$file" ]; then
    return 1
  fi

  # Check if file still has many TODO markers (likely not customized)
  local todo_count=$(grep -c "{{TODO:" "$file" 2>/dev/null || echo 0)
  if [ "$todo_count" -gt 5 ]; then
    return 1  # Not customized
  fi

  # Check git history if available
  if command_exists git && [ -d ".git" ]; then
    local commit_count=$(git log --oneline -- "$file" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$commit_count" -gt 1 ]; then
      return 0  # Customized (multiple commits)
    fi
  fi

  # If TODO markers removed or multiple commits, consider it customized
  if [ "$todo_count" -eq 0 ]; then
    return 0  # Customized (all TODOs removed)
  fi

  return 1  # Not customized
}

#===============================================================================
# DETECTION
#===============================================================================

detect_installation() {
  section "Detecting Installation"

  # Check if config file exists
  if [ -f ".docs-config.json" ]; then
    success "Found installation config: .docs-config.json"

    # Try to read version (requires jq in production)
    if command_exists jq; then
      local installed_version=$(jq -r '.version' .docs-config.json 2>/dev/null || echo "unknown")
      info "Installed version: $installed_version"
    fi
  else
    warning "No installation config found"
    info "Will attempt to detect installed files"
  fi

  # Check if docs directory exists
  if [ -d "$DOCS_DIR" ]; then
    local file_count=$(find "$DOCS_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
    success "Found documentation directory: $DOCS_DIR/ ($file_count files)"
  else
    error "Documentation directory not found: $DOCS_DIR/"
    echo "Nothing to uninstall."
    exit 0
  fi

  # Check for template files
  local template_files_found=0
  for file in "${TEMPLATE_FILES[@]}"; do
    if [ -f "$file" ]; then
      template_files_found=$((template_files_found + 1))
    fi
  done

  if [ $template_files_found -eq 0 ]; then
    warning "No template files found"
    echo "The documentation may have been heavily customized or not installed by this template."
    if ! prompt_yes_no "Continue anyway?" "n"; then
      exit 0
    fi
  else
    info "Found $template_files_found template files"
  fi

  # Detect customized files
  if [ "$PRESERVE_CUSTOM" = true ]; then
    section "Analyzing Customizations"

    local customized_count=0
    for file in "${TEMPLATE_FILES[@]}"; do
      if [ -f "$file" ] && is_customized "$file"; then
        verbose "Customized: $file"
        customized_count=$((customized_count + 1))
      fi
    done

    if [ $customized_count -gt 0 ]; then
      info "Found $customized_count customized files (will be preserved)"
    else
      info "No customized files detected"
    fi
  fi
}

#===============================================================================
# PREVIEW
#===============================================================================

show_removal_preview() {
  section "Removal Preview"

  echo "${BOLD}Will remove:${RESET}"
  echo ""

  # Files
  local files_to_remove=()
  for file in "${TEMPLATE_FILES[@]}"; do
    if [ -f "$file" ]; then
      if [ "$PRESERVE_CUSTOM" = true ] && is_customized "$file"; then
        echo "  ${YELLOW}[PRESERVE]${RESET} $file ${YELLOW}(customized)${RESET}"
      else
        echo "  ${RED}[REMOVE]${RESET}    $file"
        files_to_remove+=("$file")
      fi
    fi
  done

  echo ""

  # Directories (only if empty after file removal)
  echo "${BOLD}Will remove (if empty):${RESET}"
  for dir in "${TEMPLATE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      echo "  ${CYAN}[CHECK]${RESET}     $dir/"
    fi
  done

  echo ""
  echo "${BOLD}Statistics:${RESET}"
  echo "  Files to remove:      ${#files_to_remove[@]}"
  if [ "$PRESERVE_CUSTOM" = true ]; then
    echo "  Customized files:     Will be preserved"
  fi

  if [ "$DRY_RUN" = true ]; then
    echo ""
    warning "Dry run mode: No files will be removed"
    return 0
  fi

  echo ""
  if [ ${#files_to_remove[@]} -eq 0 ]; then
    info "Nothing to remove"
    return 1
  fi

  return 0
}

#===============================================================================
# CONFIRMATION
#===============================================================================

confirm_removal() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  section "Confirmation"

  echo "${BOLD}${RED}WARNING: This will remove documentation files!${RESET}"
  echo ""
  echo "This action cannot be undone (unless you have git history)."
  echo ""

  if [ "$PRESERVE_CUSTOM" = true ]; then
    echo "${YELLOW}Note: Customized files will be preserved.${RESET}"
    echo ""
  fi

  if ! prompt_yes_no "Are you sure you want to proceed?" "n"; then
    info "Uninstallation cancelled"
    exit 0
  fi

  # Double confirmation for destructive action
  if [ "$PRESERVE_CUSTOM" = false ]; then
    echo ""
    echo "${BOLD}${RED}FINAL CONFIRMATION${RESET}"
    echo "You are about to delete ALL documentation files, including customizations."
    echo ""
    if ! prompt_yes_no "Type YES to confirm" "n"; then
      info "Uninstallation cancelled"
      exit 0
    fi
  fi
}

#===============================================================================
# BACKUP
#===============================================================================

create_backup() {
  section "Creating Backup"

  local backup_dir="docs.backup.$(date +%Y%m%d_%H%M%S)"

  info "Creating backup: $backup_dir/"

  if [ "$DRY_RUN" = false ]; then
    if [ -d "$DOCS_DIR" ]; then
      cp -r "$DOCS_DIR" "$backup_dir"
      success "Backup created: $backup_dir/"

      # Also backup config if exists
      if [ -f ".docs-config.json" ]; then
        cp ".docs-config.json" "$backup_dir/.docs-config.json"
      fi

      echo ""
      echo "To restore: mv $backup_dir $DOCS_DIR"
    fi
  else
    verbose "Dry run: Would create backup at $backup_dir/"
  fi
}

#===============================================================================
# REMOVAL
#===============================================================================

remove_files() {
  section "Removing Files"

  local removed_count=0
  local preserved_count=0
  local skipped_count=0

  for file in "${TEMPLATE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
      verbose "Skipping (not found): $file"
      skipped_count=$((skipped_count + 1))
      continue
    fi

    # Check if should be preserved
    if [ "$PRESERVE_CUSTOM" = true ] && is_customized "$file"; then
      info "Preserving: $file"
      preserved_count=$((preserved_count + 1))
      continue
    fi

    # Remove file
    if [ "$DRY_RUN" = false ]; then
      rm -f "$file"
      success "Removed: $file"
    else
      verbose "Would remove: $file"
    fi
    removed_count=$((removed_count + 1))
  done

  echo ""
  echo "${BOLD}Summary:${RESET}"
  echo "  Files removed:     $removed_count"
  if [ "$PRESERVE_CUSTOM" = true ]; then
    echo "  Files preserved:   $preserved_count"
  fi
  echo "  Files not found:   $skipped_count"
}

remove_empty_directories() {
  section "Removing Empty Directories"

  local removed_count=0

  # Remove directories in reverse order (deepest first)
  for (( idx=${#TEMPLATE_DIRS[@]}-1 ; idx>=0 ; idx-- )); do
    local dir="${TEMPLATE_DIRS[idx]}"

    if [ ! -d "$dir" ]; then
      verbose "Skipping (not found): $dir/"
      continue
    fi

    # Check if directory is empty
    if [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
      if [ "$DRY_RUN" = false ]; then
        rmdir "$dir"
        success "Removed empty directory: $dir/"
      else
        verbose "Would remove: $dir/"
      fi
      removed_count=$((removed_count + 1))
    else
      info "Keeping non-empty directory: $dir/"
    fi
  done

  echo ""
  echo "Removed $removed_count empty directories"
}

remove_config_file() {
  if [ -f ".docs-config.json" ]; then
    section "Removing Configuration"

    if prompt_yes_no "Remove installation config (.docs-config.json)?" "y"; then
      if [ "$DRY_RUN" = false ]; then
        rm -f ".docs-config.json"
        success "Removed: .docs-config.json"
      else
        verbose "Would remove: .docs-config.json"
      fi
    else
      info "Keeping: .docs-config.json"
    fi
  fi
}

#===============================================================================
# GIT INTEGRATION
#===============================================================================

offer_git_commit() {
  if ! command_exists git || [ ! -d ".git" ]; then
    return 0
  fi

  section "Git Integration"

  # Check if there are changes
  if git diff --quiet && git diff --cached --quiet; then
    verbose "No git changes to commit"
    return 0
  fi

  if [ "$NON_INTERACTIVE" = false ]; then
    if prompt_yes_no "Create git commit for removal?" "y"; then
      if [ "$DRY_RUN" = false ]; then
        git add -A

        local commit_message
        if [ "$PRESERVE_CUSTOM" = true ]; then
          commit_message="docs: Remove documentation template files

Removed template files installed by project-docs-template.
Preserved customized documentation files."
        else
          commit_message="docs: Remove documentation structure

Removed all documentation files installed by project-docs-template."
        fi

        git commit -m "$commit_message" 2>/dev/null || warning "Failed to create commit"
        success "Created git commit"
      else
        verbose "Would create git commit"
      fi
    fi
  fi
}

#===============================================================================
# SUCCESS MESSAGE
#===============================================================================

show_success_message() {
  section "Uninstallation Complete"

  echo "${GREEN}✓${RESET} Documentation template has been uninstalled"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    echo "${YELLOW}This was a dry run - no files were actually removed${RESET}"
    echo ""
  fi

  if [ "$PRESERVE_CUSTOM" = true ]; then
    echo "${BOLD}Preserved Files:${RESET}"
    echo "  Your customized documentation files have been preserved."
    echo ""
  fi

  if [ -d "$DOCS_DIR" ]; then
    echo "${BOLD}Remaining Documentation:${RESET}"
    local remaining_count=$(find "$DOCS_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "  $remaining_count files remain in $DOCS_DIR/"
    echo ""
  fi

  echo "${BOLD}To reinstall:${RESET}"
  echo "  curl -fsSL https://raw.githubusercontent.com/user/project-docs-template/main/install.sh | bash"
  echo ""
}

#===============================================================================
# COMMAND-LINE ARGUMENT PARSING
#===============================================================================

show_help() {
  cat <<EOF
Project Documentation Template Uninstaller v$VERSION

USAGE:
  $0 [OPTIONS]

OPTIONS:
  Removal options:
    --preserve-custom       Keep files that have been customized
    --yes, -y               Answer yes to all prompts
    --non-interactive       Non-interactive mode

  Safety:
    --backup                Create backup before removal
    --dry-run               Show what would be removed without doing it

  Behavior:
    --verbose               Verbose output
    --help, -h              Show this help message

EXAMPLES:
  # Interactive removal (safe, asks for confirmation)
  $0

  # Remove with backup
  $0 --backup --yes

  # Preview what would be removed
  $0 --dry-run

  # Keep customized files
  $0 --preserve-custom

  # Non-interactive removal
  $0 --yes --non-interactive

DOCUMENTATION:
  https://github.com/user/project-docs-template

EOF
}

parse_arguments() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --help|-h)
        show_help
        exit 0
        ;;
      --yes|-y)
        AUTO_YES=true
        shift
        ;;
      --non-interactive)
        NON_INTERACTIVE=true
        shift
        ;;
      --preserve-custom)
        PRESERVE_CUSTOM=true
        shift
        ;;
      --backup)
        CREATE_BACKUP=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --verbose)
        VERBOSE=true
        shift
        ;;
      *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  done
}

#===============================================================================
# MAIN
#===============================================================================

main() {
  # Parse arguments
  parse_arguments "$@"

  # Show banner
  echo ""
  echo "${BOLD}${RED}╔═══════════════════════════════════════════════════════╗${RESET}"
  echo "${BOLD}${RED}║                                                       ║${RESET}"
  echo "${BOLD}${RED}║   Project Documentation Template Uninstaller         ║${RESET}"
  echo "${BOLD}${RED}║                   Version $VERSION                       ║${RESET}"
  echo "${BOLD}${RED}║                                                       ║${RESET}"
  echo "${BOLD}${RED}╚═══════════════════════════════════════════════════════╝${RESET}"
  echo ""

  # Run uninstallation steps
  detect_installation

  show_removal_preview || {
    info "Nothing to remove"
    exit 0
  }

  confirm_removal

  if [ "${CREATE_BACKUP:-false}" = true ]; then
    create_backup
  fi

  remove_files

  remove_empty_directories

  remove_config_file

  offer_git_commit

  show_success_message
}

# Run main function
main "$@"
