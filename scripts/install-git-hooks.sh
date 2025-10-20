#!/bin/sh
#
# Install git hooks for the docent project
#
# This script copies git hooks from scripts/hooks/ to .git/hooks/
# making them active for this repository.
#
# Usage:
#   scripts/install-git-hooks.sh
#

set -e

HOOKS_DIR=".git/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_SOURCE="$SCRIPT_DIR/hooks/pre-commit"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "Error: Not in a git repository root directory" >&2
    exit 1
fi

# Create pre-commit hook
echo "Installing pre-commit hook..."
cp "$HOOK_SOURCE" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✓ Git hooks installed successfully"
echo ""
echo "The pre-commit hook will now run markdown linting on staged .md files."
echo "To bypass the hook, use: git commit --no-verify"
echo ""
echo "To uninstall, run: rm .git/hooks/pre-commit"
