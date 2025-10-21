# Spec: Review Tool (MCP)

## Metadata

- **Status:** draft (not implemented)
- **Created:** 2025-10-13
- **Updated:** 2025-10-20
- **Related:**
  - Planned implementation: `../../src/mcp/tools/review.ts` (not yet created)
  - Planned core logic: `../../src/lib/reviewer.ts` (not yet created)
  - Depends on: analyze tool for project analysis

## Context

The `review` MCP tool (future) will check documentation health by detecting staleness (age-based) and drift (documentation doesn't match current codebase). It provides a health score (0-100), identifies stale documents, detects discrepancies between documented and actual technology stacks, and flags when significant code changes happen without documentation updates.

The tool will be **git-aware**: when running in a git repository, it uses commit history for accurate staleness detection and can identify recent code activity that wasn't reflected in documentation updates. For non-git projects, it falls back to filesystem modification times.

This tool helps maintain documentation quality over time by catching docs that become outdated or misaligned with the evolving codebase.

## Behaviors

### Scenario: Healthy Documentation

**Given:** A project with recently updated documentation aligned with current code
**When:** Agent calls `review` tool
**Then:**

- Tool analyzes project and checks documentation freshness
- Returns health score of 80-100
- Reports empty or minimal staleDocuments array
- Reports empty driftIssues array
- Provides positive recommendations

#### Example:

```typescript
const result = await tools.review({
  path: "/path/to/project",
  docsDir: "docs"  // optional
});
```

```json
{
  "healthScore": 100,
  "staleDocuments": [],
  "driftIssues": [],
  "recommendations": [
    "Documentation is fresh and aligned with code!"
  ],
  "lastReviewDate": "2025-10-13T19:45:00.000Z",
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Stale Documentation Detected

**Given:** A project with documentation that hasn't been updated in months
**When:** Agent calls `review` tool
**Then:**

- Detects documents not updated recently (using git commit dates or filesystem mtime)
- Groups stale docs by severity:
  - High: 180+ days (6+ months)
  - Medium: 90-180 days (3-6 months)
  - Low: 30-90 days (1-3 months)
- Returns staleDocuments array with file, lastModified, daysSinceUpdate, severity
- Deducts from health score based on severity
- Provides recommendations to review and update old docs

#### Example:

```json
{
  "healthScore": 65,
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
    },
    {
      "file": "troubleshooting.md",
      "lastModified": "2024-08-13T19:45:00.000Z",
      "daysSinceUpdate": 61,
      "severity": "low"
    }
  ],
  "driftIssues": [],
  "recommendations": [
    "Review and update 1 documents that haven't been updated in 6+ months",
    "Consider reviewing 1 documents not updated in 3-6 months"
  ],
  "lastReviewDate": "2025-10-13T19:45:00.000Z",
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Framework Drift Detected

**Given:** A project using React and Express, but architecture docs only mention an old framework (Angular)
**When:** Agent calls `review` tool
**Then:**

- Analyzes project to detect current frameworks (React, Express)
- Scans architecture/overview docs for mentions of these frameworks
- If frameworks aren't mentioned, reports medium-severity drift issue
- Returns driftIssues array with category, description, severity, files, suggestion
- Deducts from health score
- Recommends updating architecture docs

#### Example:

```json
{
  "healthScore": 75,
  "staleDocuments": [],
  "driftIssues": [
    {
      "category": "Framework",
      "description": "Detected frameworks (react, express) are not mentioned in architecture docs",
      "severity": "medium",
      "files": ["architecture-overview.md"],
      "suggestion": "Update architecture documentation to reflect current technology stack"
    }
  ],
  "recommendations": [
    "Update architecture and framework documentation to match current implementation"
  ],
  "lastReviewDate": "2025-10-13T19:45:00.000Z",
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Recent Code Changes Without Doc Updates

**Given:** A git repository where 15 source files changed in last 30 days, but 0 documentation files changed
**When:** Agent calls `review` tool
**Then:**

- Uses git to find files changed in last 30 days
- Filters to source code files (.ts, .js, .py, .rs, .go, .java)
- Excludes docs/, test files, .md files, package.json
- If 10+ code files changed but 0 doc files changed, reports medium-severity drift
- Lists changed code files in drift issue
- Suggests reviewing recent changes and updating relevant docs

#### Example:

```json
{
  "driftIssues": [
    {
      "category": "Drift",
      "description": "15 code files changed recently but no documentation updates",
      "severity": "medium",
      "files": [
        "src/commands/new.ts",
        "src/lib/installer.ts",
        "src/lib/detector.ts",
        "src/commands/analyze.ts",
        "src/commands/audit.ts"
      ],
      "suggestion": "Review recent code changes and update relevant documentation"
    }
  ]
}
```

### Scenario: Testing Framework Not Documented

**Given:** A project using Jest and Vitest, but testing docs don't mention them
**When:** Agent calls `review` tool
**Then:**

- Detects testing frameworks from analysis
- Checks if testing documentation mentions these frameworks
- Reports low-severity drift if frameworks not mentioned
- Lists affected testing documentation files

#### Example:

```json
{
  "driftIssues": [
    {
      "category": "Testing",
      "description": "Testing frameworks (jest, vitest) not documented in testing docs",
      "severity": "low",
      "files": ["testing-guide.md"],
      "suggestion": "Update testing documentation to include actual testing frameworks used"
    }
  ]
}
```

### Scenario: No Documentation Directory

**Given:** A project that has no documentation directory
**When:** Agent calls `review` tool
**Then:**

- Detects docs/ directory doesn't exist
- Returns health score of 0
- Reports high-severity drift issue: "No documentation directory found"
- Empty staleDocuments array
- Suggests creating documentation structure

### Scenario: Git Repository with Accurate Staleness Detection

**Given:** A git repository where docs were updated 200 days ago
**When:** Agent calls `review` tool
**Then:**

- Detects .git directory exists
- For each doc file, runs `git log -1 --format=%ct "filepath"` to get last commit timestamp
- Uses commit date (more accurate than filesystem mtime)
- Calculates days since update based on commit date
- Reports staleness with correct timeframe

### Scenario: Non-Git Project with Filesystem Fallback

**Given:** A project without git (no .git directory)
**When:** Agent calls `review` tool
**Then:**

- Detects no .git directory
- Falls back to filesystem mtime for staleness detection
- Reads file stats with `fs.statSync()`
- Calculates days since update based on mtime
- Reports staleness (may be less accurate if files copied/moved)

### Scenario: Git Command Fails (Graceful Fallback)

**Given:** A git repository where git command fails (permissions, corrupted repo)
**When:** Agent calls `review` tool and git command throws error
**Then:**

- Catches error from git command
- Falls back to filesystem mtime for that file
- Continues processing remaining files
- Completes review successfully (no crash)
- Returns valid result

### Scenario: Custom Documentation Directory

**Given:** A project using a non-standard docs directory (e.g., "documentation")
**When:** Agent calls `review` with docsDir parameter
**Then:**

- Scans "documentation/" instead of "docs/"
- All other behavior remains the same

#### Example:

```typescript
const result = await tools.review({
  path: "/path/to/project",
  docsDir: "documentation"
});
```

## ReviewResult Interface

```typescript
interface ReviewResult {
  staleDocuments: Array<{
    file: string;
    lastModified: string; // ISO 8601
    daysSinceUpdate: number;
    severity: "high" | "medium" | "low";
    relatedCode?: string[]; // Optional: related code files
  }>;
  driftIssues: Array<{
    category: string; // "Framework", "Testing", "Drift", "Setup"
    description: string;
    severity: "high" | "medium" | "low";
    files: string[];
    suggestion: string;
  }>;
  healthScore: number; // 0-100
  lastReviewDate: string; // ISO 8601
  recommendations: string[];
  timestamp: string; // ISO 8601
}
```

## Acceptance Criteria

- [ ] Tool executes without errors on typical projects
- [ ] Returns structured JSON matching ReviewResult interface
- [ ] Health score calculated correctly (0-100, properly weighted)
- [ ] Staleness detection uses git commit dates when available
- [ ] Staleness detection falls back to filesystem mtime in non-git projects
- [ ] Staleness severity levels correct (180+ high, 90-180 medium, 30-90 low)
- [ ] Framework drift detection compares documented vs actual frameworks
- [ ] Testing framework drift detection checks testing docs
- [ ] Recent change drift detection uses git log for last 30 days
- [ ] Recent change drift filters correctly (code files only, excludes docs/tests)
- [ ] Drift issues correctly categorized by severity
- [ ] Recommendations are relevant and actionable
- [ ] docsDir parameter allows custom documentation directories
- [ ] path parameter allows reviewing specified directories
- [ ] Handles missing docs directory gracefully (health score 0)
- [ ] Git command failures handled gracefully (fallback to filesystem)
- [ ] Timestamp included in results (ISO 8601 format)
- [ ] Returns error for non-existent paths

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

- Gets frameworks from project analysis
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

- All git commands wrapped in try-catch
- Silent fallback to filesystem or skip check
- Ensures review completes even if git fails

**Performance Considerations:**

- Git commands run per-file for staleness (can be slow on large repos)
- Framework drift only scans architecture files (not all docs)
- Recent change drift runs single git log command (fast)
- Content scanning for drift uses simple string matching (fast)

**Integration with Other Tools:**

- Uses analyze tool to understand project context
- Complements audit tool (audit = what's missing, review = what's stale/wrong)

## Test Hints

**Unit Tests:**

- Test staleness calculation with known timestamps
- Test severity thresholds (30, 90, 180 days)
- Test framework drift detection with mock docs/frameworks
- Test testing drift detection logic
- Test recent change drift filtering logic
- Test health score calculation with known inputs
- Mock git commands for predictable testing

**Integration Tests:**

- Test against real git repository with known commit history
- Test against non-git project (filesystem mtime fallback)
- Verify JSON output matches ReviewResult interface
- Test docsDir parameter with non-standard directories
- Test path parameter with absolute and relative paths
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
