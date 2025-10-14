# Spec: Audit Command

## Metadata
- **Status:** draft
- **Created:** 2025-10-13
- **Updated:** 2025-10-13
- **Related:**
  - Implementation: `/Users/tnez/Code/tnez/docent/src/commands/audit.ts`
  - Core logic: `/Users/tnez/Code/tnez/docent/src/lib/auditor.ts`
  - Depends on: analyze command for project analysis

## Context

The `audit` command evaluates documentation completeness by analyzing what documentation exists versus what SHOULD exist given the project's technology stack and structure. It provides a score (0-100), identifies gaps with severity levels, and offers actionable recommendations.

Unlike a simple checklist, audit is **context-aware**: a backend project needs API docs but a CLI tool doesn't, a project with tests needs testing docs, and multi-language projects need architecture documentation. Gaps are determined by analyzing the project first, then checking if appropriate documentation exists.

This command helps solo developers and teams maintain documentation standards and catch missing or incomplete docs before they become problems.

## Behaviors

### Scenario: Well-Documented Project
**Given:** A project with comprehensive documentation (architecture, ADRs, testing, API docs)
**When:** User runs `docent audit`
**Then:**
- Command analyzes project structure and technology stack
- Scans docs/ directory for documentation files
- Displays score of 80-100 (green)
- Shows checkmarks (✓) for all present documentation categories
- Reports no critical gaps or few low-severity items
- Provides recommendation to keep docs up to date
- Exit code 0

#### Example:
```bash
docent audit
```

```
📋 Auditing documentation...

📊 Documentation Score
  95/100 ███████████████████░

📖 Coverage
  ✓ Architecture documentation
  ✓ Architecture Decision Records (ADRs)
  ✓ Coding standards
  ✓ Testing documentation
  ✓ API documentation
  ✓ Troubleshooting guides
  ✗ Onboarding documentation

⚠️  Documentation Gaps

  ⚪ LOW Priority:
    • Onboarding: No onboarding documentation found
      → Create onboarding.md to help new team members get started

💡 Recommendations
  • Documentation coverage is good! Focus on keeping it up to date

Run docent review to check for stale documentation

Audit completed at 10/13/2025, 3:45:00 PM
```

### Scenario: Project with Missing Critical Documentation
**Given:** A multi-language project with backend framework but no architecture or API docs
**When:** User runs `docent audit`
**Then:**
- Detects project has multiple languages and backend framework
- Identifies missing architecture and API docs as high-severity gaps
- Displays score of 30-50 (red/yellow)
- Shows red ✗ marks for missing critical documentation
- Groups gaps by severity with colored icons (🔴 high, 🟡 medium, ⚪ low)
- Provides specific suggestions for each gap
- Recommends addressing high-priority items first

#### Example:
```bash
docent audit
```

```
📋 Auditing documentation...

📊 Documentation Score
  35/100 ███████░░░░░░░░░░░░░

📖 Coverage
  ✗ Architecture documentation
  ✗ Architecture Decision Records (ADRs)
  ✗ Coding standards
  ✓ Testing documentation
  ✗ API documentation
  ✗ Troubleshooting guides
  ✗ Onboarding documentation

⚠️  Documentation Gaps

  🔴 HIGH Priority:
    • Architecture: No architecture documentation found for multi-language/framework project
      → Create architecture-overview.md to document system design and component relationships
    • Decisions: No Architecture Decision Records (ADRs) found
      → Document key technology choices and design decisions using ADRs
    • Testing: Tests exist but no testing documentation found
      → Document testing philosophy, test structure, and how to run tests
    • API: Backend framework detected but no API documentation found
      → Document API endpoints, request/response formats, and authentication

  🟡 MEDIUM Priority:
    • Standards: No coding standards documentation found
      → Create standards.md to document coding conventions, style guides, and best practices
    • Operations: No troubleshooting or runbook documentation found
      → Create runbook.md with common issues, debugging steps, and operational procedures

  ⚪ LOW Priority:
    • Onboarding: No onboarding documentation found
      → Create onboarding.md to help new team members get started

💡 Recommendations
  • Address 4 high-priority documentation gaps first
  • Start by documenting the high-level architecture and component relationships
  • Begin tracking architectural decisions with ADRs
  • Document your testing approach - tests exist but no testing guide found

Audit completed at 10/13/2025, 3:45:00 PM
```

### Scenario: No Documentation Directory
**Given:** A project that has never run `docent init`
**When:** User runs `docent audit`
**Then:**
- Detects docs/ directory doesn't exist
- Returns score of 0
- Reports single high-severity gap: "No documentation directory found"
- All coverage items show ✗
- Suggests running `docent init`
- Displays tip to initialize docent

#### Example:
```bash
docent audit
```

```
📋 Auditing documentation...

📊 Documentation Score
  0/100 ░░░░░░░░░░░░░░░░░░░░

📖 Coverage
  ✗ Architecture documentation
  ✗ Architecture Decision Records (ADRs)
  ✗ Coding standards
  ✗ Testing documentation
  ✗ API documentation
  ✗ Troubleshooting guides
  ✗ Onboarding documentation

⚠️  Documentation Gaps

  🔴 HIGH Priority:
    • Setup: No documentation directory found
      → Run 'docent init' to set up documentation

💡 Recommendations
  • Initialize docent documentation

💡 Tip: Run docent init to set up structured documentation

Audit completed at 10/13/2025, 3:45:00 PM
```

### Scenario: JSON Output for Agent Integration
**Given:** Any project
**When:** User runs `docent audit --output json`
**Then:**
- Outputs valid JSON to stdout (no progress messages, no colors)
- JSON structure matches `AuditResult` interface:
  - `score`: Number 0-100
  - `gaps[]`: Array with category, severity, description, suggestion, files (optional)
  - `coverage`: Object with 7 boolean flags
  - `recommendations[]`: Array of strings
  - `timestamp`: ISO 8601 date string
- Exit code 0

#### Example:
```bash
docent audit --output json
```

```json
{
  "score": 35,
  "gaps": [
    {
      "category": "Architecture",
      "severity": "high",
      "description": "No architecture documentation found for multi-language/framework project",
      "suggestion": "Create architecture-overview.md to document system design and component relationships"
    },
    {
      "category": "Decisions",
      "severity": "high",
      "description": "No Architecture Decision Records (ADRs) found",
      "suggestion": "Document key technology choices and design decisions using ADRs"
    },
    {
      "category": "API",
      "severity": "high",
      "description": "Backend framework detected but no API documentation found",
      "suggestion": "Document API endpoints, request/response formats, and authentication"
    }
  ],
  "coverage": {
    "hasArchitecture": false,
    "hasADRs": false,
    "hasStandards": false,
    "hasTesting": true,
    "hasOnboarding": false,
    "hasAPI": false,
    "hasTroubleshooting": false
  },
  "recommendations": [
    "Address 3 high-priority documentation gaps first",
    "Start by documenting the high-level architecture and component relationships",
    "Begin tracking architectural decisions with ADRs"
  ],
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Custom Documentation Directory
**Given:** A project using a non-standard docs directory (e.g., "documentation")
**When:** User runs `docent audit --docs-dir documentation`
**Then:**
- Scans "documentation/" instead of "docs/"
- All other behavior remains the same
- Coverage analysis and gap detection work identically

#### Example:
```bash
docent audit --docs-dir documentation --output json
```

### Scenario: Empty or Placeholder Documentation Files
**Given:** A project with docs/ directory containing template files not yet filled in
**When:** User runs `docent audit`
**Then:**
- Detects files with <100 characters of content
- Detects files with many placeholder patterns (5+ `[...]`)
- Reports medium-severity gap: "N documentation files are empty or contain only placeholders"
- Lists affected files (up to 3, then "...")
- Suggests filling in these files with actual content

#### Example output snippet:
```
  🟡 MEDIUM Priority:
    • Content: 3 documentation files are empty or contain only placeholders
      → Fill in these documentation files with actual content
      Files: architecture-overview.md, api.md, standards.md
```

### Scenario: ADR Format Compliance Check
**Given:** A project with ADR files that are missing required sections
**When:** User runs `docent audit`
**Then:**
- Identifies files matching ADR pattern (`adr-001.md`, `adr001.md`, etc.)
- Checks for required sections: Status, Context, Decision, Consequences
- Reports low-severity gap for ADRs missing sections
- Lists affected ADR files

#### Example output snippet:
```
  ⚪ LOW Priority:
    • Format: 2 ADRs are missing required sections
      → ADRs should include: Status, Context, Decision, and Consequences
      Files: adr-001-use-typescript.md, adr-002-choose-react.md
```

### Scenario: Context-Aware Gap Detection - Simple CLI Tool
**Given:** A simple CLI tool (single language, no backend framework, no tests)
**When:** User runs `docent audit`
**Then:**
- Does NOT flag missing API docs (not a backend project)
- Does NOT flag missing testing docs (no tests exist)
- Does NOT flag missing architecture docs (simple single-language project)
- Only suggests basic docs like README and standards

### Scenario: Context-Aware Gap Detection - Backend Service
**Given:** A backend service with Express/FastAPI but no API documentation
**When:** User runs `docent audit`
**Then:**
- Detects backend framework (type: 'backend' or 'web')
- Flags missing API docs as HIGH severity
- Flags missing troubleshooting docs as MEDIUM severity
- Suggests documenting endpoints, authentication, and operational procedures

### Scenario: Context-Aware Gap Detection - Test Suite Exists
**Given:** A project with test/ or tests/ directory but no testing documentation
**When:** User runs `docent audit`
**Then:**
- Uses project structure analysis to detect test directories
- Flags missing testing docs as HIGH severity (tests exist but undocumented)
- Suggests documenting testing philosophy, structure, and how to run tests

### Scenario: Analyze Non-Current Directory
**Given:** User wants to audit a different project
**When:** User runs `docent audit --path /path/to/other/project`
**Then:**
- Analyzes specified directory instead of current directory
- All other behavior remains the same

#### Example:
```bash
docent audit --path ~/projects/my-app --output json
```

### Scenario: Score Calculation Example
**Given:** A project with the following status:
- Has architecture docs (worth 15 points)
- Has testing docs (worth 15 points)
- Missing ADRs (loses 20 points)
- Missing API docs (loses 15 points)
- Missing standards (loses 15 points)
- Missing onboarding (loses 10 points)
- Missing troubleshooting (loses 10 points)
- 2 high-severity gaps (loses 10 points each)
- 1 medium-severity gap (loses 5 points)

**When:** Score is calculated
**Then:**
- Base: 100
- Kept: +15 (architecture) + 15 (testing) = 30
- Lost from missing coverage: 20+15+15+10+10 = 70
- Lost from gaps: 10+10+5 = 25
- Final calculation: 100 - 70 = 30, then 30 - 25 = 5
- Score: 5/100 (clamped to 0 minimum)

## Acceptance Criteria
- [ ] Command runs without errors on typical projects
- [ ] Both human and JSON output modes work correctly
- [ ] Score calculated correctly (0-100, properly weighted)
- [ ] Coverage analysis detects all 7 documentation categories
- [ ] Gap detection is context-aware (based on project analysis)
- [ ] Gaps correctly categorized by severity (high/medium/low)
- [ ] Empty file detection works (<100 chars or many placeholders)
- [ ] ADR format validation checks for required sections
- [ ] Recommendations are relevant and actionable
- [ ] Human output uses color coding and proper formatting
- [ ] --docs-dir flag allows custom documentation directories
- [ ] --path flag allows analyzing non-current directories
- [ ] JSON output is valid and parseable by agents
- [ ] Handles missing docs directory gracefully (score 0, suggests init)
- [ ] Score bar visual display works correctly
- [ ] Gap files listed with reasonable truncation (max 3 shown)
- [ ] Timestamp included in results (ISO 8601 format)
- [ ] Exit code 0 on success

## Technical Notes

**Coverage Detection Patterns:**
- Architecture: Filename contains "architecture" or "overview"
- ADRs: Filename matches regex `/adr-?\d+/i` (e.g., adr-001, adr001, ADR-1)
- Standards: Filename contains "standard" or "convention"
- Testing: Filename contains "test"
- API: Filename contains "api"
- Troubleshooting: Filename contains "troubleshoot" or "runbook"
- Onboarding: Filename contains "onboard"

**Context-Aware Gap Rules:**
- Architecture (high): Required if `languages.length > 1` OR `frameworks.length > 2`
- ADRs (high): Required if `frameworks.length > 0`
- Standards (medium): Always suggested if languages detected
- Testing (high): Required if `structure.hasTests === true`
- API (high): Required if backend/web framework detected
- Troubleshooting (medium): Suggested if backend/web framework detected
- Onboarding (low): Always suggested

**Score Weights:**
- Architecture: 15 points
- ADRs: 20 points (highest weight - decisions are critical)
- Standards: 15 points
- Testing: 15 points
- API: 15 points
- Onboarding: 10 points
- Troubleshooting: 10 points
- Total possible from coverage: 100 points

**Gap Severity Deductions:**
- High severity: -10 points per gap
- Medium severity: -5 points per gap
- Low severity: -2 points per gap

**Empty File Detection:**
- Files with trimmed length < 100 characters
- Files with 5+ placeholder patterns (`[...]`)
- Based on simple heuristics (may have false positives)

**ADR Validation:**
- Checks for markdown headers matching required sections
- Required sections: Title (# heading), Status, Context, Decision, Consequences
- Case-insensitive section matching
- Low severity if sections missing (documentation exists, just incomplete)

**Integration with Other Commands:**
- Uses `analyzeProject()` from analyze command
- Uses `loadContext()` to detect if `docent init` was run
- Human output suggests running `docent review` if score < 100

## Test Hints

**Unit Tests:**
- Test coverage analysis with fixture documentation files
- Test gap detection with various project types (CLI, backend, library)
- Test score calculation with known coverage/gap combinations
- Test empty file detection with various file contents
- Test ADR validation with valid and invalid ADR files
- Test context-aware logic (ensure backend projects get API gaps)

**Integration Tests:**
- Test against real projects with known documentation states
- Verify JSON output matches schema
- Test --docs-dir flag with non-standard directories
- Test --path flag with absolute and relative paths
- Test scoring produces expected results end-to-end

**Edge Cases:**
- Empty docs directory (has directory but no files)
- Docs directory with only README.md
- Very large documentation trees (100+ files)
- Symlinks in docs directory
- Non-markdown files in docs directory
- Unicode filenames
- Malformed ADRs (partial content, weird formatting)
- Score edge cases (exactly 0, exactly 100, negative before clamping)
