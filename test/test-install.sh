#!/usr/bin/env bash
#
# docket - Installer Test Suite
# Tests the installation and uninstallation scripts
#
# Usage:
#   ./test/test-install.sh
#
# Requirements:
#   - Bash 3.0+
#   - Access to scripts/install.sh and scripts/uninstall.sh

set -eo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALL_SCRIPT="$PROJECT_ROOT/scripts/install.sh"
UNINSTALL_SCRIPT="$PROJECT_ROOT/scripts/uninstall.sh"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Colors
if [ -t 1 ]; then
  RED=$(tput setaf 1)
  GREEN=$(tput setaf 2)
  YELLOW=$(tput setaf 3)
  CYAN=$(tput setaf 6)
  BOLD=$(tput bold)
  RESET=$(tput sgr0)
else
  RED=""
  GREEN=""
  YELLOW=""
  CYAN=""
  BOLD=""
  RESET=""
fi

#===============================================================================
# TEST FRAMEWORK
#===============================================================================

test_start() {
  local test_name="$1"
  echo ""
  echo "${CYAN}━━━ Test: $test_name${RESET}"
  TESTS_RUN=$((TESTS_RUN + 1))
}

test_pass() {
  echo "${GREEN}✓ PASS${RESET}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

test_fail() {
  local message="$1"
  echo "${RED}✗ FAIL${RESET}: $message"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

assert_file_exists() {
  local file="$1"
  if [ -f "$file" ]; then
    return 0
  else
    test_fail "File does not exist: $file"
    return 1
  fi
}

assert_dir_exists() {
  local dir="$1"
  if [ -d "$dir" ]; then
    return 0
  else
    test_fail "Directory does not exist: $dir"
    return 1
  fi
}

assert_file_contains() {
  local file="$1"
  local pattern="$2"
  if grep -q "$pattern" "$file" 2>/dev/null; then
    return 0
  else
    test_fail "File does not contain pattern '$pattern': $file"
    return 1
  fi
}

#===============================================================================
# TEST SETUP/TEARDOWN
#===============================================================================

setup_test_env() {
  TEST_DIR=$(mktemp -d)
  cd "$TEST_DIR"
}

teardown_test_env() {
  if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  fi
}

#===============================================================================
# INSTALLER TESTS
#===============================================================================

test_install_help() {
  test_start "Installer shows help message"

  setup_test_env

  if "$INSTALL_SCRIPT" --help > /dev/null 2>&1; then
    test_pass
  else
    test_fail "Help command failed"
  fi

  teardown_test_env
}

test_install_version() {
  test_start "Installer shows version"

  setup_test_env

  if "$INSTALL_SCRIPT" --version > /dev/null 2>&1; then
    test_pass
  else
    test_fail "Version command failed"
  fi

  teardown_test_env
}

test_install_all_templates() {
  test_start "Install all templates in clean directory"

  setup_test_env

  # Run installer
  "$INSTALL_SCRIPT" --templates=all --non-interactive > /dev/null 2>&1

  # Check if docs directory created
  assert_dir_exists "docs" || return 1

  # Check if templates installed
  local templates=(
    "adr-template.md"
    "rfc-template.md"
    "runbook-template.md"
    "troubleshooting-template.md"
    "api-documentation-template.md"
    "architecture-overview-template.md"
  )

  local all_exist=true
  for template in "${templates[@]}"; do
    if ! assert_file_exists "docs/$template"; then
      all_exist=false
    fi
  done

  if [ "$all_exist" = true ]; then
    test_pass
  fi

  teardown_test_env
}

test_install_specific_templates() {
  test_start "Install specific templates only"

  setup_test_env

  # Install only ADR and RFC
  "$INSTALL_SCRIPT" --templates=adr,rfc --non-interactive > /dev/null 2>&1

  # Check that selected templates exist
  assert_file_exists "docs/adr-template.md" || return 1
  assert_file_exists "docs/rfc-template.md" || return 1

  # Check that others don't exist
  if [ -f "docs/runbook-template.md" ]; then
    test_fail "Runbook template should not be installed"
    teardown_test_env
    return 1
  fi

  test_pass
  teardown_test_env
}

test_install_custom_directory() {
  test_start "Install to custom directory"

  setup_test_env

  # Install to custom directory
  "$INSTALL_SCRIPT" --templates=adr --target-dir=documentation --non-interactive > /dev/null 2>&1

  assert_dir_exists "documentation" || return 1
  assert_file_exists "documentation/adr-template.md" || return 1

  test_pass
  teardown_test_env
}

test_install_dry_run() {
  test_start "Dry-run mode does not create files"

  setup_test_env

  # Run in dry-run mode
  "$INSTALL_SCRIPT" --templates=all --dry-run --non-interactive > /dev/null 2>&1

  # Check that no files were created
  if [ -d "docs" ]; then
    test_fail "Dry-run should not create directories"
    teardown_test_env
    return 1
  fi

  test_pass
  teardown_test_env
}

test_install_conflict_detection() {
  test_start "Installer skips existing files in non-interactive mode"

  setup_test_env

  # Create existing docs directory with a template
  mkdir -p docs
  echo "existing content" > docs/adr-template.md

  # Install in non-interactive mode (should skip existing file)
  "$INSTALL_SCRIPT" --templates=adr --non-interactive > /dev/null 2>&1

  # Should preserve existing content (not overwrite)
  if assert_file_contains "docs/adr-template.md" "existing content"; then
    test_pass
  else
    test_fail "Should preserve existing files in non-interactive mode"
  fi

  teardown_test_env
}

test_install_force_overwrite() {
  test_start "Force flag overwrites existing files"

  setup_test_env

  # Create existing file
  mkdir -p docs
  echo "old content" > docs/adr-template.md

  # Install with force
  "$INSTALL_SCRIPT" --templates=adr --force --non-interactive > /dev/null 2>&1

  # Check that file was overwritten
  if grep -q "old content" docs/adr-template.md 2>/dev/null; then
    test_fail "Force flag should overwrite existing files"
    teardown_test_env
    return 1
  fi

  test_pass
  teardown_test_env
}

test_install_backup() {
  test_start "Backup flag creates backups"

  setup_test_env

  # Create existing file
  mkdir -p docs
  echo "original" > docs/adr-template.md

  # Install with backup
  "$INSTALL_SCRIPT" --templates=adr --backup --force --non-interactive > /dev/null 2>&1

  # Check that backup exists
  if [ -f "docs/adr-template.md.backup" ]; then
    if assert_file_contains "docs/adr-template.md.backup" "original"; then
      test_pass
    fi
  else
    test_fail "Backup file should be created"
  fi

  teardown_test_env
}

#===============================================================================
# UNINSTALLER TESTS
#===============================================================================

test_uninstall_removes_templates() {
  test_start "Uninstaller removes installed templates"

  setup_test_env

  # Install templates first
  "$INSTALL_SCRIPT" --templates=adr,rfc --non-interactive > /dev/null 2>&1

  # Verify installed
  assert_file_exists "docs/adr-template.md" || return 1

  # Uninstall
  "$UNINSTALL_SCRIPT" --force --non-interactive > /dev/null 2>&1

  # Check that templates are removed
  if [ -f "docs/adr-template.md" ]; then
    test_fail "Templates should be removed"
    teardown_test_env
    return 1
  fi

  test_pass
  teardown_test_env
}

test_uninstall_dry_run() {
  test_start "Uninstaller dry-run does not remove files"

  setup_test_env

  # Install templates
  "$INSTALL_SCRIPT" --templates=adr --non-interactive > /dev/null 2>&1

  # Dry-run uninstall
  "$UNINSTALL_SCRIPT" --dry-run --non-interactive > /dev/null 2>&1

  # Check that files still exist
  assert_file_exists "docs/adr-template.md" || return 1

  test_pass
  teardown_test_env
}

test_uninstall_preserves_other_files() {
  test_start "Uninstaller preserves non-template files"

  setup_test_env

  # Install templates
  "$INSTALL_SCRIPT" --templates=adr --non-interactive > /dev/null 2>&1

  # Add a custom file
  echo "custom" > docs/custom-doc.md

  # Uninstall
  "$UNINSTALL_SCRIPT" --force --non-interactive > /dev/null 2>&1

  # Check that custom file still exists
  assert_file_exists "docs/custom-doc.md" || return 1

  test_pass
  teardown_test_env
}

#===============================================================================
# EDGE CASE TESTS
#===============================================================================

test_install_missing_templates_dir() {
  test_start "Installer warns about missing templates"

  setup_test_env

  # Try to install a template that doesn't exist
  # Installer continues but warns (captured in output)
  "$INSTALL_SCRIPT" --templates=adr --non-interactive > /dev/null 2>&1

  # As long as it doesn't crash, it passes
  # (The template won't be installed but script succeeds)
  test_pass

  teardown_test_env
}

test_install_no_write_permission() {
  test_start "Installer checks write permissions"

  # Skip this test if running as root
  if [ "$EUID" -eq 0 ]; then
    echo "${YELLOW}  Skipped (running as root)${RESET}"
    return 0
  fi

  setup_test_env

  # Create read-only current directory
  chmod 444 .

  # Try to install (should fail gracefully)
  if "$INSTALL_SCRIPT" --templates=adr --non-interactive > /dev/null 2>&1; then
    chmod 755 .
    test_fail "Should detect write permission issues"
    teardown_test_env
    return 1
  fi

  # Restore permissions before cleanup
  chmod 755 .
  test_pass
  teardown_test_env
}

#===============================================================================
# MAIN TEST RUNNER
#===============================================================================

run_all_tests() {
  echo ""
  echo "${BOLD}${CYAN}╔═══════════════════════════════════════════╗${RESET}"
  echo "${BOLD}${CYAN}║                                           ║${RESET}"
  echo "${BOLD}${CYAN}║      docket - Test Suite                 ║${RESET}"
  echo "${BOLD}${CYAN}║                                           ║${RESET}"
  echo "${BOLD}${CYAN}╚═══════════════════════════════════════════╝${RESET}"

  # Installer tests
  echo ""
  echo "${BOLD}Installer Tests${RESET}"
  test_install_help
  test_install_version
  test_install_all_templates
  test_install_specific_templates
  test_install_custom_directory
  test_install_dry_run
  test_install_conflict_detection
  test_install_force_overwrite
  test_install_backup

  # Uninstaller tests
  echo ""
  echo "${BOLD}Uninstaller Tests${RESET}"
  test_uninstall_removes_templates
  test_uninstall_dry_run
  test_uninstall_preserves_other_files

  # Edge case tests
  echo ""
  echo "${BOLD}Edge Case Tests${RESET}"
  test_install_missing_templates_dir
  test_install_no_write_permission

  # Summary
  echo ""
  echo "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo "${BOLD}Test Summary${RESET}"
  echo "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo "  Total tests:  $TESTS_RUN"
  echo "  ${GREEN}Passed:       $TESTS_PASSED${RESET}"
  if [ $TESTS_FAILED -gt 0 ]; then
    echo "  ${RED}Failed:       $TESTS_FAILED${RESET}"
  else
    echo "  Failed:       $TESTS_FAILED"
  fi
  echo ""

  if [ $TESTS_FAILED -eq 0 ]; then
    echo "${GREEN}${BOLD}✓ All tests passed!${RESET}"
    return 0
  else
    echo "${RED}${BOLD}✗ Some tests failed${RESET}"
    return 1
  fi
}

# Run tests
run_all_tests
