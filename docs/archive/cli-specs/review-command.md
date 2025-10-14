# Spec: Review Command

## Metadata
- **Status:** draft
- **Created:** 2025-10-13
- **Updated:** 2025-10-13
- **Related:**
  - Implementation: `/Users/tnez/Code/tnez/docent/src/commands/review.ts`
  - Core logic: `/Users/tnez/Code/tnez/docent/src/lib/reviewer.ts`
  - Depends on: analyze command for project analysis

## Context

The `review` command checks documentation health by detecting staleness (age-based) and drift (documentation doesn't match current codebase). It provides a health score (0-100), identifies stale documents, detects discrepancies between documented and actual technology stacks, and flags when significant code changes happen without documentation updates.

The command is **git-aware**: when running in a git repository, it uses commit history for accurate staleness detection and can identify recent code activity that wasn't reflected in documentation updates. For non-git projects, it falls back to filesystem modification times.

This command helps maintain documentation quality over time by catching docs that become outdated or misaligned with the evolving codebase.

## Behaviors

### Scenario: Healthy Documentation
**Given:** A project with recently updated documentation aligned with current code
**When:** User runs `docent review`
**Then:**
- Command analyzes project and checks documentation freshness
- Displays health score of 80-100 (green)
- Reports "All documentation is relatively fresh"
- Reports "No drift detected between code and documentation"
- Displays positive summary: "Documentation is healthy and up to date!"
- Exit code 0

#### Example:
```bash
docent review
```

```
🔍 Reviewing documentation...

💚 Documentation Health
  100/100 ████████████████████

✓ All documentation is relatively fresh

✓ No drift detected between code and documentation

💡 Recommendations
  • Documentation is fresh and aligned with code!

🎉 Documentation is healthy and up to date!

Review completed at 10/13/2025, 3:45:00 PM
```

### Scenario: Stale Documentation Detected
**Given:** A project with documentation that hasn't been updated in months
**When:** User runs `docent review`
**Then:**
- Detects documents not updated recently (using git commit dates or filesystem mtime)
- Groups stale docs by severity:
  - High (🔴): 180+ days (6+ months)
  - Medium (🟡): 90-180 days (3-6 months)
  - Low (⚪): 30-90 days (1-3 months)
- Shows up to 5 files per severity level (with "... and N more" if truncated)
- Displays time since last update (formatted as "X days/months/years ago")
- Deducts from health score based on severity
- Provides recommendations to review and update old docs

#### Example:
```bash
docent review
```

```
🔍 Reviewing documentation...

💚 Documentation Health
  65/100 █████████████░░░░░░░

📅 Stale Documentation

  🔴 Not updated in 6+ months:
    • architecture-overview.md (8 months ago)
    • api-reference.md (1 year ago)

  🟡 Not updated in 3-6 months:
    • standards.md (4 months ago)
    • testing-guide.md (5 months ago)

  ⚪ Not updated in 1-3 months:
    • troubleshooting.md (2 months ago)

✓ No drift detected between code and documentation

💡 Recommendations
  • Review and update 2 documents that haven't been updated in 6+ months

Found 5 issue(s) - review recommendations above

Review completed at 10/13/2025, 3:45:00 PM
```

### Scenario: Framework Drift Detected
**Given:** A project using React and Express, but architecture docs only mention an old framework (Angular)
**When:** User runs `docent review`
**Then:**
- Analyzes project to detect current frameworks (React, Express)
- Scans architecture/overview docs for mentions of these frameworks
- If frameworks aren't mentioned, reports medium-severity drift issue
- Provides category "Framework" with description and suggestion
- Lists affected architecture files
- Recommends updating architecture docs

#### Example output snippet:
```
⚠️  Drift Issues

  🟡 MEDIUM Priority:
    • Framework: Detected frameworks (react, express) are not mentioned in architecture docs
      → Update architecture documentation to reflect current technology stack
      Files: architecture-overview.md
```

### Scenario: Recent Code Changes Without Doc Updates
**Given:** A git repository where 15 source files changed in last 30 days, but 0 documentation files changed
**When:** User runs `docent review`
**Then:**
- Uses git to find files changed in last 30 days
- Filters to source code files (.ts, .js, .py, .rs, .go, .java)
- Excludes docs/, test files, .md files, package.json
- If 10+ code files changed but 0 doc files changed, reports medium-severity drift
- Lists first 5 changed code files
- Suggests reviewing recent changes and updating relevant docs

#### Example output snippet:
```
⚠️  Drift Issues

  🟡 MEDIUM Priority:
    • Drift: 15 code files changed recently but no documentation updates
      → Review recent code changes and update relevant documentation
      Files: src/commands/new.ts, src/lib/installer.ts, src/lib/detector.ts, src/commands/analyze.ts, src/commands/audit.ts
```

### Scenario: Testing Framework Not Documented
**Given:** A project using Jest and Vitest, but testing docs don't mention them
**When:** User runs `docent review`
**Then:**
- Detects testing frameworks from analysis
- Checks if testing documentation mentions these frameworks
- Reports low-severity drift if frameworks not mentioned
- Lists affected testing documentation files

#### Example output snippet:
```
⚠️  Drift Issues

  ⚪ LOW Priority:
    • Testing: Testing frameworks (jest, vitest) not documented in testing docs
      → Update testing documentation to include actual testing frameworks used
      Files: testing-guide.md
```

### Scenario: No Documentation Directory
**Given:** A project that has never run `docent init`
**When:** User runs `docent review`
**Then:**
- Detects docs/ directory doesn't exist
- Returns health score of 0
- Reports high-severity drift issue: "No documentation directory found"
- No stale documents (empty array)
- Suggests running `docent init`

#### Example:
```bash
docent review
```

```
🔍 Reviewing documentation...

💚 Documentation Health
  0/100 ░░░░░░░░░░░░░░░░░░░░

⚠️  Drift Issues

  🔴 HIGH Priority:
    • Setup: No documentation directory found
      → Run 'docent init' to set up documentation

💡 Recommendations
  • Initialize documentation

Found 1 issue(s) - review recommendations above

Review completed at 10/13/2025, 3:45:00 PM
```

### Scenario: Git Repository with Accurate Staleness Detection
**Given:** A git repository where docs were updated 200 days ago
**When:** User runs `docent review`
**Then:**
- Detects .git directory exists
- For each doc file, runs `git log -1 --format=%ct "filepath"` to get last commit timestamp
- Uses commit date (more accurate than filesystem mtime)
- Calculates days since update based on commit date
- Reports staleness with correct timeframe

### Scenario: Non-Git Project with Filesystem Fallback
**Given:** A project without git (no .git directory)
**When:** User runs `docent review`
**Then:**
- Detects no .git directory
- Falls back to filesystem mtime for staleness detection
- Reads file stats with `fs.statSync()`
- Calculates days since update based on mtime
- Reports staleness (may be less accurate if files copied/moved)

### Scenario: Git Command Fails (Graceful Fallback)
**Given:** A git repository where git command fails (permissions, corrupted repo)
**When:** User runs `docent review` and git command throws error
**Then:**
- Catches error from `execSync('git log ...')`
- Falls back to filesystem mtime for that file
- Continues processing remaining files
- Completes review successfully (no crash)

### Scenario: JSON Output for Agent Integration
**Given:** Any project
**When:** User runs `docent review --output json`
**Then:**
- Outputs valid JSON to stdout (no progress messages, no colors)
- JSON structure matches `ReviewResult` interface:
  - `staleDocuments[]`: Array with file, lastModified, daysSinceUpdate, severity, relatedCode (optional)
  - `driftIssues[]`: Array with category, description, severity, files, suggestion
  - `healthScore`: Number 0-100
  - `lastReviewDate`: ISO 8601 date string
  - `recommendations[]`: Array of strings
  - `timestamp`: ISO 8601 date string
- Exit code 0

#### Example:
```bash
docent review --output json
```

```json
{
  "staleDocuments": [
    {
      "file": "architecture-overview.md",
      "lastModified": "2024-02-13T19:45:00.000Z",
      "daysSinceUpdate": 243,
      "severity": "high"
    },
    {
      "file": "standards.md",
      "lastModified": "2024-06-13T19:45:00.000Z",
      "daysSinceUpdate": 122,
      "severity": "medium"
    }
  ],
  "driftIssues": [
    {
      "category": "Framework",
      "description": "Detected frameworks (react, express) are not mentioned in architecture docs",
      "severity": "medium",
      "files": ["architecture-overview.md"],
      "suggestion": "Update architecture documentation to reflect current technology stack"
    }
  ],
  "healthScore": 60,
  "lastReviewDate": "2025-10-13T19:45:00.000Z",
  "recommendations": [
    "Review and update 1 documents that haven't been updated in 6+ months",
    "Update architecture and framework documentation to match current implementation"
  ],
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Custom Documentation Directory
**Given:** A project using a non-standard docs directory (e.g., "documentation")
**When:** User runs `docent review --docs-dir documentation`
**Then:**
- Scans "documentation/" instead of "docs/"
- All other behavior remains the same

#### Example:
```bash
docent review --docs-dir documentation --output json
```

### Scenario: Analyze Non-Current Directory
**Given:** User wants to review a different project
**When:** User runs `docent review --path /path/to/other/project`
**Then:**
- Reviews specified directory instead of current directory
- Git commands run in specified directory context

#### Example:
```bash
docent review --path ~/projects/my-app
```

### Scenario: Many Stale Documents with Truncation
**Given:** A project with 10 high-severity stale documents
**When:** User runs `docent review`
**Then:**
- Shows first 5 stale documents in that severity level
- Appends "... and 5 more" to indicate truncation
- Prevents overwhelming output
- Full list available in JSON output

#### Example output snippet:
```
  🔴 Not updated in 6+ months:
    • doc1.md (7 months ago)
    • doc2.md (8 months ago)
    • doc3.md (9 months ago)
    • doc4.md (10 months ago)
    • doc5.md (11 months ago)
    ... and 5 more
```

### Scenario: Time Formatting
**Given:** Documents with various ages
**When:** Displayed in human output
**Then:**
- Days < 30: "X days ago" (e.g., "15 days ago")
- Days 30-59: "1 month ago"
- Days 60-364: "X months ago" (e.g., "3 months ago")
- Days 365+: "X year(s) ago" (e.g., "1 year ago", "2 years ago")

### Scenario: Health Score Calculation Example
**Given:** A project with:
- 2 high-severity stale docs (lose 10 points each = 20)
- 3 medium-severity stale docs (lose 5 points each = 15)
- 1 medium-severity drift issue (lose 10 points = 10)
- 1 low-severity drift issue (lose 5 points = 5)

**When:** Score is calculated
**Then:**
- Base: 100
- Stale deductions: 20 + 15 = 35
- Drift deductions: 10 + 5 = 15
- Final: 100 - 35 - 15 = 50
- Score: 50/100 (yellow, needs attention)

## Acceptance Criteria
- [ ] Command runs without errors on typical projects
- [ ] Both human and JSON output modes work correctly
- [ ] Health score calculated correctly (0-100, properly weighted)
- [ ] Staleness detection uses git commit dates when available
- [ ] Staleness detection falls back to filesystem mtime in non-git projects
- [ ] Staleness severity levels correct (180+ high, 90-180 medium, 30-90 low)
- [ ] Framework drift detection compares documented vs actual frameworks
- [ ] Testing framework drift detection checks testing docs
- [ ] Recent change drift detection uses git log for last 30 days
- [ ] Recent change drift filters correctly (code files only, excludes docs/tests)
- [ ] Drift issues correctly categorized by severity
- [ ] Stale documents displayed with formatted time ("X months ago")
- [ ] Stale documents truncated to 5 per severity level with "... and N more"
- [ ] Recommendations are relevant and actionable
- [ ] Human output uses color coding and proper formatting
- [ ] --docs-dir flag allows custom documentation directories
- [ ] --path flag allows reviewing non-current directories
- [ ] JSON output is valid and parseable by agents
- [ ] Handles missing docs directory gracefully (health score 0)
- [ ] Git command failures handled gracefully (fallback to filesystem)
- [ ] Exit code 0 on success
- [ ] Timestamp included in results (ISO 8601 format)

## Technical Notes

**Staleness Detection Algorithm:**
- **Git repos:** Uses `git log -1 --format=%ct "filepath"` to get last commit Unix timestamp
  - Converts to Date object: `new Date(parseInt(timestamp) * 1000)`
  - Falls back to filesystem mtime if git command fails or file not in git
- **Non-git:** Uses `fs.statSync(filePath).mtime`
- **Calculation:** `Math.floor((now - lastModified) / (1000 * 60 * 60 * 24))` days
- **Severity thresholds:**
  - High: >= 180 days
  - Medium: >= 90 days
  - Low: >= 30 days

**Framework Drift Detection:**
- Gets frameworks from `analysis.frameworks`
- Searches for architecture/overview files
- Reads file content and checks if framework names mentioned (case-insensitive)
- If 0 frameworks mentioned but frameworks detected: medium severity

**Testing Drift Detection:**
- Filters frameworks to `type === 'testing'`
- Searches for files containing "test" in name
- Checks if testing framework names mentioned in content
- Low severity (less critical than framework drift)

**Recent Change Drift Detection (Git Only):**
- Command: `git log --since="30 days ago" --name-only --pretty=format: | sort -u`
- Filters to code files: `.ts`, `.js`, `.py`, `.rs`, `.go`, `.java`
- Excludes: `docs/`, files with "test", `.md`, `package.json`
- Checks if any docs/ files also changed
- If 10+ code changes and 0 doc changes: medium severity

**Health Score Weights:**
- **Stale documents:**
  - High: -10 points per doc
  - Medium: -5 points per doc
  - Low: -2 points per doc
- **Drift issues:**
  - High: -15 points per issue (more important than staleness)
  - Medium: -10 points per issue
  - Low: -5 points per issue
- Clamped to 0-100 range

**Git Command Error Handling:**
- All `execSync` calls wrapped in try-catch
- Silent fallback to filesystem or skip check
- Ensures review completes even if git fails

**Time Formatting Logic:**
```
< 30 days: "X days ago"
30-59 days: "1 month ago"
60-364 days: "X months ago" (rounded down)
365+ days: "X year(s) ago" (rounded down)
```

**Performance Considerations:**
- Git commands run per-file for staleness (can be slow on large repos)
- Framework drift only scans architecture files (not all docs)
- Recent change drift runs single git log command (fast)
- Content scanning for drift uses simple string matching (fast)

**Integration with Other Commands:**
- Uses `analyzeProject()` from analyze command
- Complements `audit` command (audit = what's missing, review = what's stale/wrong)

## Test Hints

**Unit Tests:**
- Test staleness calculation with known timestamps
- Test severity thresholds (30, 90, 180 days)
- Test time formatting for various day ranges
- Test framework drift detection with mock docs/frameworks
- Test testing drift detection logic
- Test recent change drift filtering logic
- Test health score calculation with known inputs
- Mock git commands for predictable testing

**Integration Tests:**
- Test against real git repository with known commit history
- Test against non-git project (filesystem mtime fallback)
- Verify JSON output matches schema
- Test --docs-dir flag with non-standard directories
- Test --path flag with absolute and relative paths
- Test git command failure handling (corrupted repo, no git installed)

**Edge Cases:**
- Empty docs directory (no markdown files)
- Git repository with no commit history for docs
- Very recently created files (0 days since update)
- Files exactly at threshold boundaries (30, 90, 180 days)
- Git command permissions errors
- Malformed git timestamps
- Files modified in the future (clock skew)
- Unicode filenames
- Very large repositories (thousands of docs)
- Symlinks in docs directory
- Framework names that are substrings of other words (false positives)
