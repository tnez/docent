# Documentation Validation Scripts

## Overview

These scripts provide automated validation of documentation that can run in CI/CD pipelines or manually. They complement Claude Code commands by providing fast, scriptable checks.

## Design Principles

1. **Fast**: Run in seconds, suitable for pre-commit hooks
2. **Scriptable**: Exit codes, machine-readable output
3. **Incremental**: Can check only changed files
4. **Configurable**: Project-specific rules
5. **Standalone**: Work without Claude Code (bash/node/python)

---

## Script 1: check-links.sh

### Purpose
Find and report broken links (internal and external) in markdown files.

### Usage
```bash
# Check all links
./scripts/check-links.sh

# Check specific files
./scripts/check-links.sh docs/guides/*.md

# Check only internal links (fast)
./scripts/check-links.sh --internal-only

# Check only changed files
git diff --name-only | grep '\.md$' | xargs ./scripts/check-links.sh

# Output JSON for parsing
./scripts/check-links.sh --format json
```

### Implementation

```bash
#!/bin/bash
set -euo pipefail

# Configuration
DOCS_DIR="${DOCS_DIR:-docs}"
CHECK_EXTERNAL="${CHECK_EXTERNAL:-true}"
TIMEOUT="${TIMEOUT:-5}"
FORMAT="${FORMAT:-text}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_links=0
broken_links=0
valid_links=0

# Parse arguments
INTERNAL_ONLY=false
FILES=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --internal-only)
      INTERNAL_ONLY=true
      shift
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    *)
      FILES+=("$1")
      shift
      ;;
  esac
done

# If no files specified, check all markdown files
if [ ${#FILES[@]} -eq 0 ]; then
  mapfile -t FILES < <(find "$DOCS_DIR" -name "*.md")
fi

# Function to check internal link
check_internal_link() {
  local source_file="$1"
  local link="$2"
  local source_dir=$(dirname "$source_file")

  # Handle anchor links
  if [[ $link == \#* ]]; then
    local anchor="${link#\#}"
    # Check if heading exists in same file
    if ! grep -q "^#.* $(echo "$anchor" | tr '-' ' ')" "$source_file" 2>/dev/null; then
      echo "BROKEN: $source_file: Anchor $link not found"
      return 1
    fi
    return 0
  fi

  # Handle file links with anchors
  if [[ $link == *\#* ]]; then
    local file_part="${link%%\#*}"
    local anchor_part="${link##*\#}"
    # Resolve file path
    local target_file="$source_dir/$file_part"
    if [ ! -f "$target_file" ]; then
      echo "BROKEN: $source_file: $link (file not found)"
      return 1
    fi
    # Check anchor in target file
    if ! grep -q "^#.* $(echo "$anchor_part" | tr '-' ' ')" "$target_file" 2>/dev/null; then
      echo "BROKEN: $source_file: $link (anchor not found)"
      return 1
    fi
    return 0
  fi

  # Handle regular file links
  local target_file="$source_dir/$link"
  if [ ! -f "$target_file" ]; then
    echo "BROKEN: $source_file: $link (file not found)"
    return 1
  fi

  return 0
}

# Function to check external link
check_external_link() {
  local source_file="$1"
  local url="$2"

  # Use HEAD request to avoid downloading content
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time "$TIMEOUT" \
    -L "$url" 2>/dev/null || echo "000")

  case $http_code in
    200|301|302)
      return 0
      ;;
    *)
      echo "BROKEN: $source_file: $url (HTTP $http_code)"
      return 1
      ;;
  esac
}

# Extract and check links from each file
for file in "${FILES[@]}"; do
  # Skip if file doesn't exist
  [ -f "$file" ] || continue

  # Extract markdown links: [text](url)
  while IFS= read -r line; do
    # Parse link
    if [[ $line =~ \[([^\]]+)\]\(([^)]+)\) ]]; then
      link="${BASH_REMATCH[2]}"
      total_links=$((total_links + 1))

      # Determine link type
      if [[ $link == http://* ]] || [[ $link == https://* ]]; then
        # External link
        if [ "$INTERNAL_ONLY" = false ]; then
          if check_external_link "$file" "$link"; then
            valid_links=$((valid_links + 1))
          else
            broken_links=$((broken_links + 1))
          fi
        fi
      else
        # Internal link
        if check_internal_link "$file" "$link"; then
          valid_links=$((valid_links + 1))
        else
          broken_links=$((broken_links + 1))
        fi
      fi
    fi
  done < "$file"
done

# Output results
if [ "$FORMAT" = "json" ]; then
  cat <<EOF
{
  "total_links": $total_links,
  "valid_links": $valid_links,
  "broken_links": $broken_links,
  "success": $([ $broken_links -eq 0 ] && echo "true" || echo "false")
}
EOF
else
  echo ""
  echo "Link Validation Results:"
  echo "  Total links: $total_links"
  echo -e "  Valid: ${GREEN}$valid_links${NC}"
  if [ $broken_links -gt 0 ]; then
    echo -e "  Broken: ${RED}$broken_links${NC}"
  else
    echo -e "  Broken: ${GREEN}0${NC}"
  fi
fi

# Exit with error if broken links found
if [ $broken_links -gt 0 ]; then
  exit 1
fi

exit 0
```

### CI/CD Integration

```yaml
# .github/workflows/docs-validation.yml
- name: Check documentation links
  run: |
    ./scripts/check-links.sh --internal-only
```

---

## Script 2: test-examples.sh

### Purpose
Extract and test code examples from documentation.

### Usage
```bash
# Test all examples
./scripts/test-examples.sh

# Test specific file
./scripts/test-examples.sh docs/guides/api.md

# Test specific language
./scripts/test-examples.sh --language javascript

# Skip slow tests
./scripts/test-examples.sh --timeout 10
```

### Implementation Approach

```bash
#!/bin/bash
set -euo pipefail

# Extract code blocks from markdown
extract_examples() {
  local file="$1"
  local lang="${2:-}"

  # Use awk to extract code blocks
  awk '
  /^```[a-z]+/ {
    lang=$1;
    gsub("```", "", lang);
    in_block=1;
    code="";
    next;
  }
  /^```/ && in_block {
    if (lang_filter == "" || lang == lang_filter) {
      print "FILE:" FILENAME;
      print "LANG:" lang;
      print "CODE:" code;
      print "---";
    }
    in_block=0;
    next;
  }
  in_block {
    code = code $0 "\\n";
  }
  ' lang_filter="$lang" "$file"
}

# Test JavaScript example
test_javascript() {
  local code="$1"
  local tmpfile=$(mktemp /tmp/example-XXXXX.js)
  echo -e "$code" > "$tmpfile"

  if timeout 30s node "$tmpfile" >/dev/null 2>&1; then
    rm "$tmpfile"
    return 0
  else
    rm "$tmpfile"
    return 1
  fi
}

# Similar functions for other languages...

# Main logic
# [Implementation details]
```

---

## Script 3: validate-frontmatter.sh

### Purpose
Ensure all documentation files have required frontmatter fields.

### Usage
```bash
./scripts/validate-frontmatter.sh

# Check specific fields
./scripts/validate-frontmatter.sh --required "title,description,date"

# Auto-fix missing frontmatter
./scripts/validate-frontmatter.sh --fix
```

### Implementation

```bash
#!/bin/bash
set -euo pipefail

# Required fields (configurable)
REQUIRED_FIELDS="${REQUIRED_FIELDS:-title description}"
FIX_MODE=false

# Parse frontmatter from file
parse_frontmatter() {
  local file="$1"

  # Check if file starts with ---
  if ! head -1 "$file" | grep -q "^---$"; then
    echo "MISSING: $file has no frontmatter"
    return 1
  fi

  # Extract frontmatter (between first two ---)
  frontmatter=$(awk '/^---$/{i++;next}i==1' "$file")

  # Check each required field
  for field in $REQUIRED_FIELDS; do
    if ! echo "$frontmatter" | grep -q "^$field:"; then
      echo "MISSING: $file lacks field '$field'"
      return 1
    fi
  done

  return 0
}

# Scan all markdown files
find docs/ -name "*.md" | while read file; do
  parse_frontmatter "$file" || true
done
```

---

## Script 4: detect-drift.sh

### Purpose
Quick drift detection by comparing code timestamps to doc timestamps.

### Usage
```bash
# Check all documentation
./scripts/detect-drift.sh

# Check specific area
./scripts/detect-drift.sh --scope src/api docs/reference/api

# More sensitive detection
./scripts/detect-drift.sh --threshold 7  # 7 days
```

### Implementation Approach

```bash
#!/bin/bash
set -euo pipefail

# Compare modification times
# If code changed recently but docs haven't, flag for review

# Configuration
THRESHOLD_DAYS="${THRESHOLD_DAYS:-30}"

# Find recently changed code
recent_code_changes=$(find src/ lib/ -name "*.ts" -o -name "*.js" \
  -mtime -${THRESHOLD_DAYS} -type f)

# For each changed code file, find related docs
# Check if docs were updated around same time
# Report potential drift
```

---

## Script 5: generate-coverage-report.sh

### Purpose
Calculate and report documentation coverage metrics.

### Usage
```bash
# Generate coverage report
./scripts/generate-coverage-report.sh

# Output JSON
./scripts/generate-coverage-report.sh --format json > coverage.json

# Check coverage threshold
./scripts/generate-coverage-report.sh --min-coverage 80
```

### Implementation Approach

```bash
#!/bin/bash
set -euo pipefail

# Count documentable items
count_apis() {
  grep -r "export (function|class|const)" src/ | wc -l
}

count_documented_apis() {
  find docs/reference/api -name "*.md" | wc -l
}

# Calculate percentages
# Generate report
# Exit with error if below threshold
```

---

## Script 6: validate-standards.sh

### Purpose
Check documentation against project writing standards using Vale or similar.

### Usage
```bash
# Check all docs
./scripts/validate-standards.sh

# Check specific files
./scripts/validate-standards.sh docs/guides/*.md

# Use specific Vale config
./scripts/validate-standards.sh --config .vale-strict.ini
```

### Implementation

```bash
#!/bin/bash
set -euo pipefail

# Check if Vale is installed
if ! command -v vale &> /dev/null; then
  echo "Error: Vale not installed"
  echo "Install: brew install vale"
  exit 1
fi

# Run Vale on documentation
VALE_CONFIG="${VALE_CONFIG:-.vale.ini}"

vale --config="$VALE_CONFIG" docs/

# Vale exits with error if violations found
```

---

## Integration Patterns

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Only run if docs changed
if git diff --cached --name-only | grep -q '^docs/'; then
  echo "Validating documentation..."

  # Quick checks only
  ./scripts/check-links.sh --internal-only || exit 1
  ./scripts/validate-frontmatter.sh || exit 1

  echo "✓ Documentation validation passed"
fi
```

### GitHub Actions

```yaml
name: Documentation Validation

on: [push, pull_request]

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check links
        run: ./scripts/check-links.sh

      - name: Test examples
        run: ./scripts/test-examples.sh

      - name: Validate frontmatter
        run: ./scripts/validate-frontmatter.sh

      - name: Check coverage
        run: ./scripts/generate-coverage-report.sh --min-coverage 80
```

### Weekly Scheduled Check

```yaml
name: Weekly Documentation Health Check

on:
  schedule:
    - cron: '0 10 * * 1'  # Monday 10am

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Full validation
        run: |
          ./scripts/check-links.sh
          ./scripts/test-examples.sh
          ./scripts/detect-drift.sh
          ./scripts/generate-coverage-report.sh

      - name: Create issue if failures
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Documentation Health Check Failed',
              body: 'Weekly health check found issues. Review CI logs.',
              labels: ['documentation', 'maintenance']
            })
```

---

## Configuration Files

### .docs-validation.conf

```bash
# Documentation validation configuration

# Link checking
CHECK_EXTERNAL_LINKS=true
LINK_CHECK_TIMEOUT=5
FOLLOW_REDIRECTS=true

# Example testing
EXAMPLE_TIMEOUT=30
SKIP_SLOW_TESTS=false

# Frontmatter
REQUIRED_FRONTMATTER="title description last_updated"

# Drift detection
DRIFT_THRESHOLD_DAYS=30

# Coverage
MIN_COVERAGE_PERCENT=80

# Vale
VALE_CONFIG=".vale.ini"
```

### scripts/lib/common.sh

```bash
# Shared functions for all validation scripts

# Colors
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export NC='\033[0m'

# Logging
log_info() {
  echo -e "${GREEN}[INFO]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*"
}

# Load configuration
load_config() {
  if [ -f ".docs-validation.conf" ]; then
    source ".docs-validation.conf"
  fi
}
```

---

## Installation

```bash
# Copy scripts to project
cp -r project-docs-template/scripts ./scripts
chmod +x ./scripts/*.sh

# Install dependencies (if needed)
# Vale for prose linting
brew install vale  # macOS
# or
apt-get install vale  # Linux

# Test scripts work
./scripts/check-links.sh --internal-only
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-11
