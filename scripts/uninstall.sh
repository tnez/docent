#!/usr/bin/env bash
#
# docent - Documentation Template Uninstaller
# Remove installed documentation templates
#
# Usage:
#   ./scripts/uninstall.sh
#
# Version: 0.2.0
# Author: tnezdev
# License: MIT

set -eo pipefail

#===============================================================================
# CONFIGURATION
#===============================================================================

VERSION="0.2.0"
TARGET_DIR="${TARGET_DIR:-docs}"

# Templates that might be installed
TEMPLATES=(
  "adr-template.md"
  "rfc-template.md"
  "runbook-template.md"
  "troubleshooting-template.md"
  "api-documentation-template.md"
  "architecture-overview-template.md"
)

DRY_RUN=false
FORCE=false
INTERACTIVE=true

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
# UTILITY FUNCTIONS
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

section() {
  echo ""
  echo "${BOLD}$*${RESET}"
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

prompt_yes_no() {
  local prompt="$1"
  local default="${2:-n}"

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

#===============================================================================
# DETECTION
#===============================================================================

detect_templates() {
  section "Detecting Installed Templates"

  if [ ! -d "$TARGET_DIR" ]; then
    warning "Target directory not found: $TARGET_DIR/"
    return 1
  fi

  local found=()
  for template in "${TEMPLATES[@]}"; do
    if [ -f "$TARGET_DIR/$template" ]; then
      found+=("$template")
    fi
  done

  if [ ${#found[@]} -eq 0 ]; then
    info "No docent templates found in $TARGET_DIR/"
    return 1
  fi

  echo "Found ${#found[@]} template(s):"
  for template in "${found[@]}"; do
    echo "  • $template"
  done
  echo ""

  INSTALLED_TEMPLATES=("${found[@]}")
  return 0
}

#===============================================================================
# UNINSTALLATION
#===============================================================================

confirm_uninstall() {
  if [ "$FORCE" = true ]; then
    return 0
  fi

  warning "This will remove ${#INSTALLED_TEMPLATES[@]} template file(s) from $TARGET_DIR/"
  echo ""

  if ! prompt_yes_no "Are you sure you want to uninstall?" "n"; then
    info "Uninstall cancelled"
    exit 0
  fi
}

uninstall_templates() {
  if [ "$DRY_RUN" = true ]; then
    section "Dry Run - Would Remove"
    for template in "${INSTALLED_TEMPLATES[@]}"; do
      echo "  Would remove: $TARGET_DIR/$template"
    done
    return 0
  fi

  section "Removing Templates"

  local removed=0
  for template in "${INSTALLED_TEMPLATES[@]}"; do
    local target="$TARGET_DIR/$template"
    if [ -f "$target" ]; then
      rm -f "$target"
      success "Removed: $template"
      removed=$((removed + 1))
    fi
  done

  echo ""
  success "Uninstalled $removed template(s)"

  # Check if directory is empty and offer to remove it
  if [ -d "$TARGET_DIR" ]; then
    local remaining=$(find "$TARGET_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$remaining" -eq 0 ]; then
      if [ "$INTERACTIVE" = true ]; then
        if prompt_yes_no "Directory is empty. Remove $TARGET_DIR/?" "y"; then
          rmdir "$TARGET_DIR"
          success "Removed directory: $TARGET_DIR/"
        fi
      fi
    else
      info "$remaining other file(s) remain in $TARGET_DIR/"
    fi
  fi
}

#===============================================================================
# COMMAND-LINE ARGUMENT PARSING
#===============================================================================

show_help() {
  cat <<EOF
docent - Documentation Template Uninstaller v$VERSION

USAGE:
  $0 [OPTIONS]

OPTIONS:
  --target-dir DIR      Target directory with templates (default: docs)
  --dry-run             Show what would be removed without removing
  --force               Don't ask for confirmation
  --non-interactive     Don't prompt for input
  --help, -h            Show this help message
  --version             Show version information

EXAMPLES:
  # Interactive uninstall (prompts for confirmation)
  $0

  # Dry run to preview
  $0 --dry-run

  # Force uninstall without confirmation
  $0 --force

  # Uninstall from custom directory
  $0 --target-dir=documentation

DOCUMENTATION:
  https://github.com/tnez/docent

EOF
}

show_version() {
  echo "docent uninstaller v$VERSION"
  echo "https://github.com/tnez/docent"
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

  echo ""
  echo "${BOLD}${CYAN}╔═══════════════════════════════════════════╗${RESET}"
  echo "${BOLD}${CYAN}║                                           ║${RESET}"
  echo "${BOLD}${CYAN}║        docent - Template Uninstaller     ║${RESET}"
  echo "${BOLD}${CYAN}║               Version $VERSION              ║${RESET}"
  echo "${BOLD}${CYAN}║                                           ║${RESET}"
  echo "${BOLD}${CYAN}╚═══════════════════════════════════════════╝${RESET}"
  echo ""

  if ! detect_templates; then
    exit 0
  fi

  confirm_uninstall

  uninstall_templates

  if [ "$DRY_RUN" = false ]; then
    echo ""
    success "Uninstall complete"
  else
    info "Dry run complete - no files were removed"
  fi
}

main "$@"
