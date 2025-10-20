#!/bin/sh
#
# Lint markdown files using markdownlint-cli2
#
# Usage:
#   scripts/lint-markdown.sh                    # Lint all markdown files
#   scripts/lint-markdown.sh file1.md file2.md  # Lint specific files
#   scripts/lint-markdown.sh --fix              # Auto-fix all files
#   scripts/lint-markdown.sh --fix file1.md     # Auto-fix specific file
#

set -e

# Check if markdownlint-cli2 is available
if ! command -v npx >/dev/null 2>&1; then
    echo "Error: npx not found. Please install Node.js and npm." >&2
    exit 1
fi

# Parse arguments
FIX_FLAG=""
FILES=""

for arg in "$@"; do
    case "$arg" in
        --fix)
            FIX_FLAG="--fix"
            ;;
        *)
            FILES="$FILES $arg"
            ;;
    esac
done

# If no files specified, lint all markdown files (using npm script pattern)
if [ -z "$FILES" ]; then
    echo "Linting all markdown files..."
    npx markdownlint-cli2 '**/*.md' '!node_modules' '!lib' $FIX_FLAG
else
    echo "Linting specified markdown files..."
    # shellcheck disable=SC2086
    npx markdownlint-cli2 $FIX_FLAG $FILES
fi

exit $?
