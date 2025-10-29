---
name: health-check
description: Run comprehensive project health checks including code quality, documentation, git status, and project structure
type: runbook
author: docent
version: 1.0.0
tags: [health, quality, validation, pre-release]
---

# Health Check Runbook

This runbook performs comprehensive project health checks, validating code quality, documentation completeness, git status, and overall project hygiene. Especially useful before releases or major commits.

## Purpose

Identify potential issues across multiple dimensions:

- **Code Quality**: Debug code, test markers, temporary code
- **Documentation**: Missing or outdated documentation
- **Git Hygiene**: Uncommitted changes, untracked files
- **File System**: Temporary files, backup files
- **Structure**: Documented vs actual structure alignment

## Prerequisites

- Project directory with source code and documentation
- Git repository (for git-related checks)
- Read access to project files

## Health Check Dimensions

### 1. Check for Debug Code

**Purpose:** Find console.log, debugger statements, and debug comments that shouldn't be in production

**Actions:**

```bash
# Search for common debug patterns in source files
rg "console\.(log|debug|info|warn|error)" --type js --type ts --type jsx --type tsx src/

# Search for debugger statements
rg "debugger" --type js --type ts --type jsx --type tsx src/

# Search for TODO/FIXME comments that should be issues
rg "TODO.*remove|FIXME.*before.*release|XXX" src/
```

**Red Flags:**

- `console.log()` in production code
- `debugger` statements
- `TODO: remove before release`
- `FIXME: before shipping`
- `XXX` markers

**Severity:** WARNING (may be intentional logging) → ERROR (if found in critical paths)

**Fix:** Remove debug code or convert TODO comments to GitHub issues

---

### 2. Check for Test Markers

**Purpose:** Find .only() and .skip() calls that prevent full test suite from running

**Actions:**

```bash
# Find test files with .only()
rg "\.only\(" --type js --type ts test/ src/

# Find test files with .skip()
rg "\.skip\(" --type js --type ts test/ src/

# Find xdescribe, xit (Jasmine/Jest)
rg "xdescribe|xit\(" --type js --type ts test/ src/
```

**Red Flags:**

- `.only()` - Runs only that test, skips others
- `.skip()` - Skips test entirely
- `xdescribe`, `xit` - Disabled tests

**Severity:** ERROR (prevents full test coverage validation)

**Fix:** Remove .only()/.skip() or document why test is disabled

---

### 3. Check for Broken Links

**Purpose:** Find broken internal links in markdown documentation

**Actions:**

```bash
# Find all markdown files
find .docent/ docs/ -name "*.md" -type f 2>/dev/null

# For each markdown file:
# - Extract markdown links: [text](path)
# - Extract relative file paths
# - Verify each referenced file exists

# Example pattern for link extraction:
rg '\[.*?\]\((.*?)\)' --only-matching --no-filename .docent/ docs/ 2>/dev/null | sort -u
```

**Check:**

- Relative links to files that don't exist
- Absolute links to project files that moved
- Links to documentation sections that were removed

**Severity:** WARNING (broken docs links)

**Fix:** Update links to correct paths or remove broken references

---

### 4. Check Documentation Quality

**Purpose:** Assess if documentation is complete and current

**Dimensions:**

- **Coverage:** Are all public APIs documented?
- **Accuracy:** Does documentation match current code?
- **Structure:** Is documentation well-organized?
- **Examples:** Do code examples still work?

**Actions:**

```bash
# Check for documented features that exist
ls -1 .docent/ docs/ 2>/dev/null

# Look for common documentation patterns
find .docent/ docs/ -name "*.md" -type f -exec wc -l {} + 2>/dev/null

# Check for empty or stub documentation
find .docent/ docs/ -name "*.md" -type f -size -100c 2>/dev/null
```

**Indicators of issues:**

- Empty documentation files (< 100 bytes)
- No README in major directories
- Documentation folders with no .md files
- API docs missing for exported functions

**Severity:** WARNING (incomplete docs) → INFO (documentation suggestions)

**Fix:** Create missing documentation, update outdated content

---

### 5. Check for Uncommitted Changes

**Purpose:** Ensure working directory is clean before releases

**Actions:**

```bash
# Check git status
git status --porcelain

# Check for staged but uncommitted
git diff --cached --stat

# Check for unstaged changes
git diff --stat

# Check for untracked files (excluding .gitignore patterns)
git ls-files --others --exclude-standard
```

**Red Flags:**

- Modified files (M) not staged
- Staged files (A) not committed
- Untracked files that should be committed or gitignored

**Severity:** ERROR (before release) → WARNING (during development)

**Fix:** Commit changes, add to .gitignore, or document why files are uncommitted

---

### 6. Check for Temporary Files

**Purpose:** Find temporary, backup, or generated files that shouldn't be committed

**Actions:**

```bash
# Find common temporary file patterns
find . -name "*.tmp" -o -name "*.bak" -o -name "*~" -o -name ".DS_Store" 2>/dev/null

# Find editor backup files
find . -name "*.swp" -o -name "*.swo" -o -name "*~" 2>/dev/null

# Find common cache directories not in .gitignore
find . -type d -name "__pycache__" -o -name ".pytest_cache" -o -name "node_modules" 2>/dev/null | head -5
```

**Red Flags:**

- `.tmp`, `.bak`, `~` backup files
- Editor swap files (`.swp`, `.swo`)
- OS metadata files (`.DS_Store`)
- Cache directories in git

**Severity:** WARNING (cleanup recommended)

**Fix:** Remove temporary files, add patterns to .gitignore

---

### 7. Check Structure Reconciliation

**Purpose:** Verify that documented project structure matches actual structure

**Actions:**

```bash
# Compare documented structure with actual
# 1. Look for ARCHITECTURE.md or similar docs describing structure
find .docent/ docs/ -name "*ARCHITECTURE*" -o -name "*STRUCTURE*" -type f 2>/dev/null

# 2. List actual directory structure
find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | head -20

# 3. Identify discrepancies (requires semantic analysis)
```

**Check:**

- Directories mentioned in docs that don't exist
- New directories not documented
- Files in unexpected locations

**Severity:** INFO (documentation update suggestion)

**Fix:** Update documentation to reflect current structure

---

## Health Score Calculation

Calculate overall health score (0-100):

```
Base score: 100

Deductions:
- ERROR findings: -10 points each
- WARNING findings: -5 points each
- INFO findings: -1 point each

Minimum score: 0
Maximum score: 100
```

**Interpretation:**

- 90-100: Excellent health ✅
- 70-89: Good health, minor issues ⚠️
- 50-69: Fair health, notable issues 🔶
- 0-49: Poor health, significant issues ❌

## Output Format

### Concise Mode (Default)

Show only issues found:

```
🏥 Project Health Check

❌ 2 errors found
⚠️  3 warnings found
ℹ️  1 info

Errors:
  - [debug-code] console.log found in src/api/handler.ts:45
  - [test-markers] .only() found in test/api.test.ts:12

Warnings:
  - [broken-links] Link to missing file in docs/guide.md:23
  - [uncommitted] 3 modified files not committed
  - [temp-files] 2 .tmp files found in src/

Info:
  - [structure] New directory src/utils/ not documented

Health Score: 65/100 (Fair)

Run with --verbose for detailed output and fixes.
```

### Verbose Mode (--verbose flag)

Show detailed information with context and fix suggestions:

```
🏥 Project Health Check (Verbose)

## Check: Debug Code
❌ ERROR: console.log statements found

Found in src/api/handler.ts:
  Line 45: console.log('Processing request:', req)
  Line 67: console.log('Response:', response)

Fix: Remove console.log or use proper logging library:
  import {logger} from './logger'
  logger.debug('Processing request:', req)

## Check: Test Markers
❌ ERROR: .only() restricts test execution

Found in test/api.test.ts:
  Line 12: describe.only('API tests', () => {

Fix: Remove .only() to run full test suite:
  describe('API tests', () => {

[... detailed output for all checks ...]

Health Score: 65/100 (Fair)
Total Checks: 7
Passed: 4
Failed: 3
```

## Quick Mode (--quick flag)

Run only fast mechanical checks, skip semantic analysis:

- Debug code ✓
- Test markers ✓
- Broken links ✓
- Uncommitted changes ✓
- Temporary files ✓
- Skip: Documentation quality (requires semantic analysis)
- Skip: Structure reconciliation (requires semantic analysis)

Completes in < 5 seconds

## Error Handling

### Permission Denied

**If:** Cannot read certain files/directories
**Action:** Report skipped checks, continue with accessible files

### Git Not Available

**If:** Git commands fail (not a git repo)
**Action:** Skip git-related checks, note in output

### Large Project Performance

**If:** Searches take too long (> 30 seconds)
**Action:** Use --quick mode or limit search scope to specific directories

## Validation

After completion, health check should report:

- Total checks run
- Number of issues by severity
- Health score (0-100)
- Actionable fix suggestions
- Overall pass/fail status

## Common Issues and Fixes

### Issue: Low Health Score

**Fix:** Address ERROR findings first, then WARNINGs, then INFOs

### Issue: Many False Positives

**Fix:** Configure check exceptions in `.docent/config.yaml`:

```yaml
health-check:
  ignore-patterns:
    debug-code:
      - src/debug-utils.ts  # Intentional debug utilities
    test-markers:
      - test/manual/  # Manual test suite
```

### Issue: Slow Execution

**Fix:** Use `--quick` mode or specify `--checks` to run only specific checks

## Notes

- Health checks are non-destructive (read-only)
- Suitable for CI/CD pipelines (exit code 0 = healthy, 1 = issues)
- Use before releases to catch common issues
- Verbose mode is useful for understanding issues, concise for automation
- Quick mode trades completeness for speed (~5s vs ~30s)
