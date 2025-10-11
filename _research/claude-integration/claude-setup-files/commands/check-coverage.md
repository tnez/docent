# Slash Command: /check-coverage

## Description

Identifies features, APIs, and code that lack documentation, measuring documentation coverage and highlighting gaps.

## When to Use

- **Before releases**: Ensure all features documented
- **After adding features**: Verify documentation exists
- **Quarterly**: Strategic documentation planning
- **During reviews**: Find documentation gaps
- **Sprint planning**: Prioritize documentation work

## What It Does

1. **Scans codebase for documentable items**
   - Public APIs and functions
   - Exported classes and types
   - CLI commands
   - Configuration options
   - Features and modules

2. **Checks if each item is documented**
   - Searches documentation for references
   - Verifies completeness of coverage
   - Identifies orphaned documentation
   - Maps code to docs bidirectionally

3. **Calculates coverage metrics**
   - Overall coverage percentage
   - Coverage by category (API, features, etc.)
   - Trend over time
   - Comparison to targets

4. **Identifies high-priority gaps**
   - Public APIs without docs
   - New features undocumented
   - Commonly used code undocumented
   - User-facing items without docs

5. **Generates action plan**
   - What needs documentation
   - Priority order
   - Estimated effort
   - Documentation type needed

## Command Prompt

```markdown
---
description: Check documentation coverage and identify gaps
---

You are measuring documentation coverage across the codebase and identifying gaps.

## Context

Working directory: (auto-detected)
Code directories: ${CODE_DIRS:-"src/ lib/"}
Documentation: docs/
Coverage target: ${TARGET:-80}% (desired coverage level)
Diff mode: ${DIFF:-false} (check only changed code)

## Task

1. **Identify documentable items in codebase:**

   **Public APIs (JavaScript/TypeScript):**
   ```bash
   # Find exported functions, classes, types
   grep -r "export (function|class|interface|type|const)" src/ lib/ \
     --include="*.ts" --include="*.js"

   # Extract names
   # export function createUser(...) → createUser
   # export class UserService → UserService
   ```

   **CLI Commands:**
   ```bash
   # Find CLI command definitions
   grep -r "program\.command\|\.addCommand\|commander" src/

   # Or parse CLI help
   ./bin/cli --help | parse_commands
   ```

   **Configuration Options:**
   ```bash
   # Find config schema
   find . -name "*.config.*" -o -name "*schema*"

   # Parse schema files for options
   # config.schema.ts → extract all keys
   ```

   **Features/Modules:**
   ```bash
   # Identify feature modules
   ls src/features/ src/modules/

   # Or look for @feature tags in code
   grep -r "@feature" src/
   ```

2. **Check if each item is documented:**

   **For APIs:**
   ```bash
   api_name="createUser"

   # Search documentation
   if grep -r "$api_name" docs/reference/ >/dev/null; then
     # Found - check if it's substantial (not just mentioned)
     matches=$(grep -r "$api_name" docs/reference/ | wc -l)
     if [ $matches -gt 3 ]; then
       echo "DOCUMENTED: $api_name"
     else
       echo "MENTIONED_ONLY: $api_name"
     fi
   else
     echo "UNDOCUMENTED: $api_name"
   fi
   ```

   **For Features:**
   ```bash
   feature="batch-operations"

   # Check multiple doc locations
   documented=false
   if grep -r "$feature" docs/guides/ >/dev/null ||
      grep -r "$feature" docs/tutorials/ >/dev/null ||
      grep -r "$feature" docs/features/ >/dev/null; then
     documented=true
   fi

   if [ "$documented" = false ]; then
     echo "UNDOCUMENTED FEATURE: $feature"
   fi
   ```

   **For CLI Commands:**
   ```bash
   command="migrate"

   # Check CLI documentation
   if grep -r "$ cli $command\|cli $command" docs/reference/cli/ >/dev/null; then
     echo "DOCUMENTED: cli $command"
   else
     echo "UNDOCUMENTED: cli $command"
   fi
   ```

3. **Calculate coverage metrics:**

   ```javascript
   coverage = {
     apis: {
       total: 45,
       documented: 38,
       coverage: 84.4%
     },
     features: {
       total: 12,
       documented: 10,
       coverage: 83.3%
     },
     cli_commands: {
       total: 8,
       documented: 8,
       coverage: 100%
     },
     config_options: {
       total: 23,
       documented: 20,
       coverage: 87.0%
     },
     overall: {
       total: 88,
       documented: 76,
       coverage: 86.4%
     }
   }
   ```

4. **Identify high-priority gaps:**

   **Priority 1: Public User-Facing APIs**
   - APIs exported in main entry point
   - Most commonly used (if usage data available)
   - Breaking changes in recent releases

   **Priority 2: New Features**
   - Added in last 3 months
   - Mentioned in changelog
   - User-facing functionality

   **Priority 3: Configuration**
   - Required configuration options
   - Security-related config
   - Performance-critical settings

   **Priority 4: Internal APIs**
   - Internal/private APIs
   - Utility functions
   - Implementation details

5. **Find orphaned documentation:**
   - Documentation for code that no longer exists
   - Old feature documentation
   - Deprecated API documentation still present

6. **Compare to targets and trends:**
   ```bash
   # Load historical coverage from .docs-coverage-history.json
   previous_coverage=78%
   current_coverage=86.4%
   target_coverage=80%

   if [ $current_coverage > $target_coverage ]; then
     status="✅ Above target"
   else
     status="❌ Below target"
   fi

   trend="↑ +8.4% (vs last month)"
   ```

7. **Generate prioritized action plan:**
   ```markdown
   ## Documentation Needed (Priority Order)

   ### High Priority (User-Facing, Public APIs)
   1. Feature: batch-operations
      Location: src/features/batch/
      Type: Guide + API reference
      Effort: 4 hours
      Users affected: High

   2. API: UserService.bulkUpdate()
      Location: src/services/user.ts:145
      Type: API reference
      Effort: 1 hour
      Users affected: Medium

   ### Medium Priority (New Features, Config)
   [...]

   ### Low Priority (Internal, Nice-to-Have)
   [...]
   ```

8. **Generate report using doc-coverage-report style:**
   - Executive summary
   - Coverage metrics
   - Coverage by category
   - Trend visualization
   - High-priority gaps
   - Orphaned documentation
   - Action plan
   - Commands to run next

## Coverage Calculation Methods

**Method 1: Presence (Simple)**
```
Is item mentioned in docs at all?
→ Yes = documented
→ No = undocumented

Fast but imprecise.
```

**Method 2: Substantial Coverage (Better)**
```
Is item documented with:
- Description of what it does
- Parameters/options
- Examples
- Return values/behavior

→ All present = documented
→ Some missing = partially documented
→ Just mentioned = undocumented

More accurate, slower.
```

**Method 3: Quality-Weighted (Best)**
```
Score each documentation:
- Mentioned only: 0.2
- Basic description: 0.5
- With examples: 0.8
- Complete reference: 1.0

Average scores for coverage.

Most accurate, slowest.
```

## Diff Mode

When `--diff` flag set, only check coverage for changed code:

```bash
# Get changed files since branch point
git diff main...HEAD --name-only

# Or since last release
git diff v1.0.0...HEAD --name-only

# Extract documentable items from only those files
# Check if those specific items are documented
```

Useful for:
- PR reviews (did you document your changes?)
- Pre-release checks (new features documented?)
- Incremental improvements (focus on gaps)

## Output Format

Use doc-coverage-report style.

Example:
```markdown
# Documentation Coverage Report

## Summary
Overall Coverage: 86.4% (76/88 items)
Target: 80% ✅ Exceeded
Trend: ↑ +8.4% vs last month
Status: Good

## Coverage by Category

APIs:           ████████████████░░░░  84.4% (38/45)
Features:       ████████████████░░░  83.3% (10/12)
CLI Commands:   █████████████████████ 100% (8/8)
Configuration:  █████████████████░░░  87.0% (20/23)

## High-Priority Gaps (12 items)

### APIs (7 undocumented)
1. UserService.bulkUpdate()
   - File: src/services/user.ts:145
   - Added: 2 months ago
   - Public: Yes
   - Usage: High (17 references)
   - Effort: 1 hour → API reference

2. PaymentService.refund()
   [...]

### Features (3 undocumented)
1. Batch Operations
   - Directory: src/features/batch/
   - Added: Last sprint
   - User-facing: Yes
   - Effort: 4 hours → Guide + examples

[...]

## Orphaned Documentation (2 items)

1. docs/reference/api/old-api.md
   - Documents API removed in v2.0
   - Action: Archive or delete

2. docs/guides/legacy-auth.md
   - Legacy auth method deprecated
   - Action: Mark as deprecated, link to new auth

## Action Plan

To reach 95% coverage:
1. Document batch operations feature (4h)
2. Add 7 missing API references (7h)
3. Document 2 new config options (1h)
4. Archive 2 orphaned docs (0.5h)

Total effort: ~12.5 hours
Expected coverage: 95%

## Next Steps

# Document highest priority items
/update-doc docs/guides/batch-operations.md
/docs-from-code src/services/user.ts --function bulkUpdate

# Quarterly: Review and improve
/check-coverage --type comprehensive
```

## Integration with CI/CD

**Enforce Coverage in CI:**
```yaml
- name: Check documentation coverage
  run: |
    coverage=$(./scripts/check-coverage.sh --json | jq '.overall.coverage')
    target=80

    if [ "$coverage" -lt "$target" ]; then
      echo "Documentation coverage $coverage% below target $target%"
      exit 1
    fi
```

**Track Coverage Over Time:**
```yaml
- name: Record coverage metrics
  run: |
    ./scripts/check-coverage.sh --json > coverage.json
    # Send to metrics dashboard
    curl -X POST $METRICS_API -d @coverage.json
```

**Block PRs with Low Coverage:**
```yaml
- name: Check PR coverage
  run: |
    # Check if PR adds code without docs
    new_coverage=$(./scripts/check-coverage.sh --diff --json | jq '.coverage')

    if [ "$new_coverage" -lt 80 ]; then
      echo "New code not adequately documented"
      exit 1
    fi
```

## Success Criteria

- All documentable items identified
- Coverage accurately calculated
- Gaps prioritized by impact
- Actionable plan provided
- Historical trends tracked
- Integration with CI/CD possible
