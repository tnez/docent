#!/usr/bin/env bash
#
# docket - Documentation Template Installer
# Install documentation templates with a single command
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/tnez/docket/main/scripts/install.sh | bash
#
# Or download and run locally:
#   ./scripts/install.sh
#
# Version: 0.2.0
# Author: tnezdev
# License: MIT

set -eo pipefail

#===============================================================================
# CONFIGURATION
#===============================================================================

VERSION="0.2.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default installation directory
TARGET_DIR="${TARGET_DIR:-docs}"

# Available templates
AVAILABLE_TEMPLATES=(
  "adr-template.md"
  "rfc-template.md"
  "runbook-template.md"
  "troubleshooting-template.md"
  "api-documentation-template.md"
  "architecture-overview-template.md"
  "onboarding-template.md"
  "patterns-template.md"
  "standards-template.md"
  "testing-template.md"
  "writing-software-template.md"
)

# Installation options
DRY_RUN=false
FORCE=false
BACKUP=false
INTERACTIVE=true
SELECTED_TEMPLATES=()
TRANSACTION_LOG=$(mktemp)

# Platform detection
case "$(uname -s)" in
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

if [ -t 1 ]; then
  NCOLORS=$(tput colors 2>/dev/null || echo 0)
  if [ "$NCOLORS" -ge 8 ]; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    CYAN=$(tput setaf 6)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
  fi
fi

RED="${RED:-}"
GREEN="${GREEN:-}"
YELLOW="${YELLOW:-}"
CYAN="${CYAN:-}"
BOLD="${BOLD:-}"
RESET="${RESET:-}"

#===============================================================================
# LOGGING FUNCTIONS
#===============================================================================

log_transaction() {
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> "$TRANSACTION_LOG"
}

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

section() {
  echo ""
  echo "${BOLD}$*${RESET}"
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

#===============================================================================
# UTILITY FUNCTIONS
#===============================================================================

prompt_yes_no() {
  local prompt="$1"
  local default="${2:-y}"

  if [ "$INTERACTIVE" = false ]; then
    [ "$default" = "y" ] && return 0 || return 1
  fi

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

cleanup() {
  rm -f "$TRANSACTION_LOG"
}

trap cleanup EXIT
trap 'error "Installation interrupted"; rollback; exit 130' INT TERM

#===============================================================================
# ROLLBACK MECHANISM
#===============================================================================

rollback() {
  warning "Rolling back installation..."

  if [ ! -f "$TRANSACTION_LOG" ]; then
    return
  fi

  tac "$TRANSACTION_LOG" 2>/dev/null | while IFS=' ' read -r timestamp action target _; do
    case "$action" in
      CREATE_DIR)
        [ -d "$target" ] && rm -rf "$target" && echo "  Removed: $target"
        ;;
      CREATE_FILE)
        [ -f "$target" ] && rm -f "$target" && echo "  Removed: $target"
        ;;
      BACKUP_FILE)
        [ -f "$target.backup" ] && mv "$target.backup" "$target" && echo "  Restored: $target"
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
    if [ "$BASH_MAJOR" -lt 3 ]; then
      error "Bash 3.0+ required (found $BASH_VERSION)"
      errors=$((errors + 1))
    else
      success "Bash version: $BASH_VERSION"
    fi
  fi

  # Check write permission
  if [ -w "." ]; then
    success "Write permission: OK"
  else
    error "No write permission in current directory"
    errors=$((errors + 1))
  fi

  # Check if target directory exists
  if [ -d "$TARGET_DIR" ]; then
    local file_count=$(find "$TARGET_DIR" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$file_count" -gt 0 ]; then
      warning "Target directory exists: $TARGET_DIR/ ($file_count files)"
      if [ "$FORCE" = false ] && [ "$BACKUP" = false ] && [ "$INTERACTIVE" = true ]; then
        info "Use --force to overwrite, --backup to backup first"
      fi
    else
      success "Target directory exists but empty"
    fi
  else
    success "Target directory: $TARGET_DIR/ (will be created)"
  fi

  if [ $errors -gt 0 ]; then
    error "Pre-flight checks failed: $errors error(s)"
    return 1
  fi

  success "All pre-flight checks passed"
  return 0
}

#===============================================================================
# TEMPLATE SELECTION
#===============================================================================

select_templates() {
  if [ ${#SELECTED_TEMPLATES[@]} -gt 0 ]; then
    return 0  # Templates already specified via flags
  fi

  if [ "$INTERACTIVE" = false ]; then
    # Non-interactive: install all templates
    SELECTED_TEMPLATES=("${AVAILABLE_TEMPLATES[@]}")
    return 0
  fi

  section "Template Selection"

  echo "Available templates:"
  echo ""
  for i in "${!AVAILABLE_TEMPLATES[@]}"; do
    local num=$((i + 1))
    local template="${AVAILABLE_TEMPLATES[$i]}"
    local name="${template%.md}"
    echo "  $num) ${name//-/ }"
  done
  echo "  a) All templates"
  echo ""

  read -p "Select templates (comma-separated numbers, or 'a' for all): " selection

  if [ "$selection" = "a" ] || [ "$selection" = "A" ]; then
    SELECTED_TEMPLATES=("${AVAILABLE_TEMPLATES[@]}")
  else
    IFS=',' read -ra NUMS <<< "$selection"
    for num in "${NUMS[@]}"; do
      num=$(echo "$num" | tr -d ' ')
      if [ "$num" -ge 1 ] && [ "$num" -le "${#AVAILABLE_TEMPLATES[@]}" ]; then
        SELECTED_TEMPLATES+=("${AVAILABLE_TEMPLATES[$((num - 1))]}")
      fi
    done
  fi

  if [ ${#SELECTED_TEMPLATES[@]} -eq 0 ]; then
    error "No templates selected"
    exit 1
  fi

  success "Selected ${#SELECTED_TEMPLATES[@]} template(s)"
}

#===============================================================================
# PREVIEW AND CONFIRMATION
#===============================================================================

show_preview() {
  section "Installation Preview"

  echo "${BOLD}Target directory:${RESET} ./$TARGET_DIR/"
  echo ""
  echo "${BOLD}Templates to install:${RESET}"
  for template in "${SELECTED_TEMPLATES[@]}"; do
    echo "  • $template"
  done
  echo ""

  if [ "$DRY_RUN" = true ]; then
    info "Dry run mode: No files will be created"
    return 0
  fi

  if [ "$INTERACTIVE" = true ]; then
    if ! prompt_yes_no "Proceed with installation?"; then
      info "Installation cancelled"
      exit 0
    fi
  fi
}

#===============================================================================
# HANDLE EXISTING FILES
#===============================================================================

handle_existing_files() {
  if [ ! -d "$TARGET_DIR" ]; then
    return 0  # No existing directory
  fi

  local conflicts=()
  for template in "${SELECTED_TEMPLATES[@]}"; do
    if [ -f "$TARGET_DIR/$template" ]; then
      conflicts+=("$template")
    fi
  done

  if [ ${#conflicts[@]} -eq 0 ]; then
    return 0  # No conflicts
  fi

  if [ "$FORCE" = true ]; then
    warning "Force mode: ${#conflicts[@]} file(s) will be overwritten"
    return 0
  fi

  if [ "$BACKUP" = true ]; then
    info "Backup mode: ${#conflicts[@]} file(s) will be backed up"
    return 0
  fi

  if [ "$INTERACTIVE" = false ]; then
    error "Conflicts detected in non-interactive mode. Use --force or --backup"
    return 1
  fi

  warning "Found ${#conflicts[@]} existing file(s):"
  for file in "${conflicts[@]}"; do
    echo "  • $file"
  done
  echo ""
  echo "How would you like to proceed?"
  echo "  1) Backup existing files (adds .backup suffix)"
  echo "  2) Overwrite existing files"
  echo "  3) Skip existing files"
  echo "  4) Abort installation"
  echo ""

  read -p "Choose option (1-4): " choice

  case "$choice" in
    1) BACKUP=true ;;
    2) FORCE=true ;;
    3) return 0 ;;  # Skip conflicts
    4|*) info "Installation cancelled"; exit 0 ;;
  esac
}

#===============================================================================
# INSTALLATION
#===============================================================================

install_templates() {
  if [ "$DRY_RUN" = true ]; then
    return 0
  fi

  section "Installing Templates"

  # Create target directory
  if [ ! -d "$TARGET_DIR" ]; then
    mkdir -p "$TARGET_DIR"
    log_transaction "CREATE_DIR" "$TARGET_DIR"
    success "Created directory: $TARGET_DIR/"
  fi

  # Install each template
  local installed=0
  local skipped=0

  for template in "${SELECTED_TEMPLATES[@]}"; do
    local source="$PROJECT_ROOT/templates/$template"
    local target="$TARGET_DIR/$template"

    # Check if source exists
    if [ ! -f "$source" ]; then
      warning "Template not found: $source"
      continue
    fi

    # Check if target exists
    if [ -f "$target" ]; then
      if [ "$FORCE" = true ]; then
        if [ "$BACKUP" = true ]; then
          cp "$target" "$target.backup"
          log_transaction "BACKUP_FILE" "$target"
        fi
        cp "$source" "$target"
        log_transaction "CREATE_FILE" "$target"
        success "Overwrote: $template"
        installed=$((installed + 1))
      else
        info "Skipped: $template (already exists)"
        skipped=$((skipped + 1))
      fi
    else
      cp "$source" "$target"
      log_transaction "CREATE_FILE" "$target"
      success "Installed: $template"
      installed=$((installed + 1))
    fi
  done

  echo ""
  success "Installation complete: $installed installed, $skipped skipped"
}

#===============================================================================
# POST-INSTALL
#===============================================================================

show_success_message() {
  section "Installation Complete"

  cat <<EOF

${GREEN}✓${RESET} Documentation templates installed in: ${BOLD}./$TARGET_DIR/${RESET}

${BOLD}📚 Next Steps:${RESET}

  1. Review installed templates
     ${CYAN}ls $TARGET_DIR/${RESET}

  2. Start documenting your project
     ${CYAN}cp $TARGET_DIR/adr-template.md $TARGET_DIR/adr-001-your-decision.md${RESET}

  3. Customize templates for your workflow
     ${CYAN}vim $TARGET_DIR/adr-template.md${RESET}

${BOLD}📖 Documentation:${RESET}
   https://github.com/tnez/docket

${BOLD}💡 Tips:${RESET}
   • Use templates as starting points
   • Commit templates to version control
   • Share templates across your team

EOF
}

#===============================================================================
# COMMAND-LINE ARGUMENT PARSING
#===============================================================================

show_help() {
  cat <<EOF
docket - Documentation Template Installer v$VERSION

USAGE:
  $0 [OPTIONS]

OPTIONS:
  --templates TEMPLATES  Comma-separated list of templates to install
                        (e.g., adr,rfc,runbook)
  --target-dir DIR      Target directory for templates (default: docs)
  --dry-run             Show what would be done without making changes
  --force               Overwrite existing files
  --backup              Backup existing files before overwriting
  --non-interactive     Don't prompt for input
  --help, -h            Show this help message
  --version             Show version information

EXAMPLES:
  # Interactive installation (prompts for templates)
  $0

  # Install specific templates
  $0 --templates=adr,rfc

  # Install all templates, overwrite existing
  $0 --templates=all --force

  # Dry run to preview
  $0 --dry-run

  # Install to custom directory
  $0 --target-dir=documentation

AVAILABLE TEMPLATES:
  • adr-template.md - Architecture Decision Records
  • rfc-template.md - Request for Comments
  • runbook-template.md - Operational procedures
  • troubleshooting-template.md - Problem diagnosis guides
  • api-documentation-template.md - API reference docs
  • architecture-overview-template.md - System design docs
  • onboarding-template.md - Developer onboarding guides
  • patterns-template.md - High-level architectural patterns
  • standards-template.md - Code standards and conventions
  • testing-template.md - Testing philosophy and practices
  • writing-software-template.md - Development philosophy

DOCUMENTATION:
  https://github.com/tnez/docket

EOF
}

show_version() {
  echo "docket installer v$VERSION"
  echo "https://github.com/tnez/docket"
}

parse_arguments() {
  while [ $# -gt 0 ]; do
    # Handle --key=value format
    if [[ "$1" == --*=* ]]; then
      KEY="${1%%=*}"
      VALUE="${1#*=}"
      set -- "$KEY" "$VALUE" "${@:2}"
    fi

    case "$1" in
      --help|-h)
        show_help
        exit 0
        ;;
      --version)
        show_version
        exit 0
        ;;
      --templates)
        IFS=',' read -ra TEMPLATES <<< "$2"
        if [ "${TEMPLATES[0]}" = "all" ]; then
          SELECTED_TEMPLATES=("${AVAILABLE_TEMPLATES[@]}")
        else
          for t in "${TEMPLATES[@]}"; do
            t=$(echo "$t" | tr -d ' ')
            # Add .md if not present
            [[ "$t" != *.md ]] && t="$t.md"
            # Add -template if not present
            [[ "$t" != *-template.md ]] && t="${t%.md}-template.md"
            SELECTED_TEMPLATES+=("$t")
          done
        fi
        shift 2
        ;;
      --target-dir)
        TARGET_DIR="$2"
        shift 2
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
      --non-interactive)
        INTERACTIVE=false
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
  parse_arguments "$@"

  # Show banner
  echo ""
  echo "${BOLD}${CYAN}╔═══════════════════════════════════════════╗${RESET}"
  echo "${BOLD}${CYAN}║                                           ║${RESET}"
  echo "${BOLD}${CYAN}║         docket - Template Installer      ║${RESET}"
  echo "${BOLD}${CYAN}║               Version $VERSION              ║${RESET}"
  echo "${BOLD}${CYAN}║                                           ║${RESET}"
  echo "${BOLD}${CYAN}╚═══════════════════════════════════════════╝${RESET}"
  echo ""

  preflight_checks || exit 2

  select_templates

  show_preview

  handle_existing_files || exit 3

  install_templates

  if [ "$DRY_RUN" = false ]; then
    show_success_message
  else
    info "Dry run complete - no files were created"
  fi
}

main "$@"
