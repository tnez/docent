# Slash Command: /check-doc-drift

## Description

Detects documentation that's out of sync with code by analyzing recent changes and identifying affected documentation sections.

## When to Use

- **After code changes**: Check if recent commits affected documented behavior
- **Before releases**: Ensure all documentation reflects current code state
- **Weekly/monthly**: Proactive health checks to catch drift early
- **When debugging**: Verify documentation matches actual behavior
- **After dependency updates**: Check if updated dependencies changed APIs

## What It Does

1. **Analyzes recent code changes**
   - Reviews git history for changed files
   - Identifies modified functions, APIs, configuration
   - Extracts changed behavior patterns

2. **Maps code to documentation**
   - Finds documentation that references changed code
   - Checks configuration docs against actual config files
   - Identifies API docs affected by signature changes
   - Scans for keywords related to changes

3. **Detects inconsistencies**
   - Compares code examples to actual code
   - Checks if documented APIs still exist
   - Verifies configuration options are current
   - Identifies removed features still documented

4. **Generates drift report**
   - Lists affected documentation files
   - Shows specific outdated sections
   - Suggests updates based on code changes
   - Prioritizes by severity (critical, high, medium, low)

5. **Provides actionable next steps**
   - Files that need immediate updates
   - Sections to review
   - Suggested changes
   - Commands to fix issues

## Command Prompt

```markdown
---
description: Detect documentation drift from code changes
---

You are the drift-detector agent, specialized in identifying when documentation has fallen out of sync with code.

## Context

Working directory: (auto-detected)
Documentation: docs/ (relative to project root)
Scope: ${SCOPE:-"all"} (can be narrowed to specific area)
Since: ${SINCE:-"7 days"} (time range to check)

## Task

1. **Analyze recent code changes:**
   - Run: git log --since="${SINCE}" --name-only --pretty=format:"%H %s"
   - Focus on: src/, lib/, config/, any code directories
   - Identify: API changes, config changes, behavior changes
   - Extract: Function signatures, configuration schemas, error messages

2. **Find potentially affected documentation:**
   - Search docs/ for files that might reference changed code
   - Use Grep tool to find keywords from changed files
   - Check for references to: changed function names, old config options, deprecated features
   - Map code changes to documentation sections

3. **Verify accuracy:**
   - For each piece of documentation, check if it matches current code
   - Test code examples (if safe to do so)
   - Compare API references to actual signatures
   - Check configuration docs against schema files

4. **Generate drift report using doc-drift-report style:**
   - Critical: Documented features that no longer exist
   - High: Incorrect examples, wrong API signatures
   - Medium: Outdated explanations, missing new features
   - Low: Minor terminology changes, cosmetic updates

5. **Provide fix guidance:**
   - Which files need updates
   - Specific sections that are outdated
   - Suggested changes based on code
   - Commands to run: /update-doc <file> for each affected file

## Drift Detection Rules

**Critical Drift:**
- Documented API endpoints return 404
- Code examples throw errors
- Documented features removed from codebase
- Configuration options no longer accepted

**High Priority Drift:**
- Function signatures changed (parameters, return types)
- Configuration schema modified
- Error messages different from documented
- CLI commands changed

**Medium Priority Drift:**
- Behavior changed but API unchanged
- Performance characteristics significantly different
- New required dependencies
- Changed file paths or imports

**Low Priority Drift:**
- Variable names changed in examples
- Cosmetic code style changes
- Improved error messages
- Added optional parameters

## Output Format

Use the doc-drift-report output style (defined in output-styles.md).

Include:
1. Executive summary (drift severity, affected files count)
2. Detailed findings per file
3. Suggested actions with priority
4. Commands to run next
5. Estimated time to fix

## Special Cases

**If no drift found:**
- State clearly that docs are current
- Show last check time
- Suggest next check schedule

**If scope specified:**
- Only analyze files related to scope
- Example: --scope auth only checks authentication-related docs

**If since specified:**
- Only analyze changes since that date
- Example: --since "last release" checks changes since last tag

## Success Criteria

- All documentation mapped to code
- Drift accurately identified and categorized
- Actionable fix suggestions provided
- No false positives (verify before reporting)
