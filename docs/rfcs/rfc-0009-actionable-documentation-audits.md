# RFC-0009: Actionable Documentation Audits with Progress Tracking

**Status:** Partially Implemented (see doctor tool)
**Author:** @tnez
**Created:** 2025-10-16
**Updated:** 2025-10-16
**Related:** ADR-0004 (MCP-Only Architecture), RFC-0005 (Enhanced MCP Architecture)

## Summary

Enhance docent's `audit` tool to provide actionable, specific documentation gap reports with progress tracking over time. Instead of returning a conversational assessment prompt for agents, the audit tool will detect specific missing documentation, provide exact file paths to create, calculate scores, and persist reports to enable progress tracking. This transforms documentation audits from "you should have API docs" to "create `docs/guides/api-reference.md` using `docent://template/api` (Priority 1, 2-3 hours)".

## Motivation

### Problem Statement

**Current Reality:**

When using the existing `audit` tool, users get:

```
User: "Use docent to audit this project's documentation"

Agent calls: audit(path: '.')
Returns: Prompt asking agent to assess documentation
Agent responds: "Score: 65/100
  Strengths: Good RFCs
  Critical Gaps: Missing API documentation
  Recommendations: Add API reference documentation"
```

**Problems with this approach:**

1. **Not actionable** - "Add API documentation" doesn't tell you WHERE or WHAT specifically
2. **Not persistent** - Audit results disappear when context resets
3. **No progress tracking** - Can't see if documentation is improving over time
4. **Agent-dependent** - Quality varies based on agent's reasoning
5. **No prioritization** - All gaps treated equally
6. **Missing templates** - Doesn't point to templates for creating docs

**Real-world pain:**

- User asks "How are our docs doing?" multiple times, gets similar vague answers
- No way to track if documentation debt is increasing or decreasing
- Teams can't set measurable documentation quality goals
- New contributors don't know which docs to create first

**What users actually need:**

```
User: "Use docent to audit this project's documentation"

Agent calls: audit(path: '.', save: true, compare: true)
Returns: Structured report saved to docs/.audit/2025-10-16.md

Report shows:
- Score: 65/100 (+12 from last audit 🟢)
- Critical Gaps (Priority 1):
  ❌ TypeScript Style Guide
     Path: docs/standards/typescript-style-guide.md
     Template: docent://template/standards
     Effort: 2-3 hours
     Reason: Project uses TypeScript but no documented code style

  ❌ Development Setup Runbook
     Path: docs/runbooks/setup-development-environment.md
     Template: docent://template/runbook
     Effort: 1-2 hours
     Reason: Contributing.md references setup but no step-by-step guide

- Progress History:
  | Date       | Score | Change | Gaps Resolved |
  |------------|-------|--------|---------------|
  | 2025-10-16 | 65    | +12    | 2             |
  | 2025-10-15 | 53    | -      | 0             |

Agent responds: "Your documentation score improved from 53 to 65 (+12 points).
  You resolved 2 gaps since last audit.
  Priority 1 action: Create TypeScript style guide at docs/standards/typescript-style-guide.md"
```

### Goals

1. **Actionable recommendations** - Specific file paths, templates, effort estimates
2. **Persistent reports** - Save audit results to `docs/.audit/YYYY-MM-DD.md`
3. **Progress tracking** - Compare audits over time, show trends
4. **Structured output** - Machine-readable format for tooling
5. **Prioritized gaps** - Critical vs. high vs. medium priority
6. **Template integration** - Point to exact templates for creating missing docs
7. **Measurable improvement** - Set and track documentation quality goals

### Non-Goals

1. **Not replacing agent assessment** - Complement, don't replace agent-driven audits
2. **Not enforcing documentation** - Guidance, not gatekeeping
3. **Not project-specific rules** - Generic gap detection applicable to any project
4. **Not automatic fixes** - Identify gaps, don't auto-generate docs

## Detailed Design

### Overview

Enhance the `audit` MCP tool with three new capabilities:

1. **Gap Detection** - Built-in logic to detect specific missing documentation
2. **Report Persistence** - Save structured reports to `docs/.audit/`
3. **Progress Tracking** - Compare current audit to previous audits

**Enhanced Audit Flow:**

```
User invokes audit tool
    ↓
1. Analyze project (languages, frameworks, structure)
    ↓
2. Detect specific documentation gaps
    ↓
3. Calculate score based on gaps
    ↓
4. Load previous audit (if exists)
    ↓
5. Generate structured report
    ↓
6. Save report to docs/.audit/YYYY-MM-DD.md
    ↓
7. Return formatted markdown to agent
```

### Gap Detection Logic

**Gap Types:**

```typescript
type GapType =
  | 'guide'      // How-to guides (getting-started, contributing, testing)
  | 'runbook'    // Operational procedures
  | 'standard'   // Code standards, conventions
  | 'api'        // API documentation
  | 'architecture' // Architecture overview, diagrams
  | 'adr'        // Architecture Decision Records
  | 'rfc'        // Request for Comments

type Priority = 'critical' | 'high' | 'medium' | 'low'

interface Gap {
  type: GapType
  priority: Priority
  title: string
  path: string
  template: string  // docent://template/X
  reason: string
  impact: string
  effort: string    // "1-2 hours", "2-3 hours", "4+ hours"
}
```

**Detection Rules:**

```typescript
async function detectDocumentationGaps(
  analysis: ProjectAnalysis,
  docsDir: string
): Promise<Gap[]> {
  const gaps: Gap[] = []
  const docs = await scanDocumentation(docsDir)

  // Critical: Getting Started Guide
  if (!docs.guides.includes('getting-started')) {
    gaps.push({
      type: 'guide',
      priority: 'critical',
      title: 'Getting Started Guide',
      path: `${docsDir}/guides/getting-started.md`,
      template: 'docent://template/onboarding',
      reason: 'New contributors need setup instructions',
      impact: 'High friction for new contributors',
      effort: '2-3 hours'
    })
  }

  // Critical: Contributing Guide
  if (!docs.guides.includes('contributing')) {
    gaps.push({
      type: 'guide',
      priority: 'critical',
      title: 'Contributing Guide',
      path: `${docsDir}/guides/contributing.md`,
      template: 'docent://template/onboarding',
      reason: 'Contributors need workflow and standards',
      impact: 'Inconsistent contributions',
      effort: '2-3 hours'
    })
  }

  // Critical: Style Guide (if TypeScript/Python/etc)
  if (analysis.languages.includes('TypeScript') && !docs.standards.includes('typescript-style-guide')) {
    gaps.push({
      type: 'standard',
      priority: 'critical',
      title: 'TypeScript Style Guide',
      path: `${docsDir}/standards/typescript-style-guide.md`,
      template: 'docent://template/standards',
      reason: 'Project uses TypeScript but has no documented code style',
      impact: 'Inconsistent code style across codebase',
      effort: '2-3 hours'
    })
  }

  // Critical: Development Setup Runbook
  if (!docs.runbooks.some(r => r.includes('setup') || r.includes('development'))) {
    gaps.push({
      type: 'runbook',
      priority: 'critical',
      title: 'Development Setup Runbook',
      path: `${docsDir}/runbooks/setup-development-environment.md`,
      template: 'docent://template/runbook',
      reason: 'Contributing guide references setup but no detailed runbook exists',
      impact: 'Setup friction for new developers',
      effort: '1-2 hours'
    })
  }

  // High: Build & Test Runbook
  if (!docs.runbooks.some(r => r.includes('build') || r.includes('test'))) {
    gaps.push({
      type: 'runbook',
      priority: 'high',
      title: 'Build & Test Runbook',
      path: `${docsDir}/runbooks/build-and-test.md`,
      template: 'docent://template/runbook',
      reason: 'No documented build/test procedures',
      impact: 'Contributors unsure how to validate changes',
      effort: '1-2 hours'
    })
  }

  // High: Release Process Runbook (if publishable)
  if (analysis.buildTools.includes('npm') && !docs.runbooks.some(r => r.includes('release'))) {
    gaps.push({
      type: 'runbook',
      priority: 'high',
      title: 'Release Process Runbook',
      path: `${docsDir}/runbooks/prepare-release.md`,
      template: 'docent://template/runbook',
      reason: 'Package is publishable but no documented release process',
      impact: 'Inconsistent releases, potential errors',
      effort: '2-3 hours'
    })
  }

  // High: API Documentation (if backend framework)
  if (hasBackendFramework(analysis) && !docs.guides.includes('api-reference')) {
    gaps.push({
      type: 'api',
      priority: 'high',
      title: 'API Reference',
      path: `${docsDir}/guides/api-reference.md`,
      template: 'docent://template/api',
      reason: 'Backend framework detected but no API documentation',
      impact: 'API consumers lack documentation',
      effort: '4+ hours'
    })
  }

  // High: Testing Guide (if tests exist)
  if (analysis.structure.hasTests && !docs.guides.includes('testing')) {
    gaps.push({
      type: 'guide',
      priority: 'high',
      title: 'Testing Guide',
      path: `${docsDir}/guides/testing.md`,
      template: 'docent://template/testing',
      reason: 'Tests exist but no testing guide',
      impact: 'Contributors unsure of testing expectations',
      effort: '2-3 hours'
    })
  }

  // Medium: Architecture Overview
  if (!docs.architecture && (analysis.frameworks.length > 1 || analysis.languages.length > 1)) {
    gaps.push({
      type: 'architecture',
      priority: 'medium',
      title: 'Architecture Overview',
      path: `${docsDir}/architecture/overview.md`,
      template: 'docent://template/architecture',
      reason: 'Multi-language or multi-framework project needs architecture docs',
      impact: 'Contributors lack high-level understanding',
      effort: '4+ hours'
    })
  }

  // Medium: ADRs (if frameworks in use but no ADRs)
  if (analysis.frameworks.length > 0 && docs.adrs.length === 0) {
    gaps.push({
      type: 'adr',
      priority: 'medium',
      title: 'Architecture Decision Records',
      path: `${docsDir}/adr/adr-0001-initial-technology-choices.md`,
      template: 'docent://template/adr',
      reason: 'Frameworks in use but architectural decisions not documented',
      impact: 'Lost context on why technologies were chosen',
      effort: '1-2 hours per ADR'
    })
  }

  return gaps
}
```

### Score Calculation

**Scoring System (0-100):**

```typescript
function calculateScore(gaps: Gap[], analysis: ProjectAnalysis): number {
  let score = 100

  // Deduct points based on gap priority
  for (const gap of gaps) {
    switch (gap.priority) {
      case 'critical':
        score -= 15  // Critical gaps hurt score significantly
        break
      case 'high':
        score -= 10
        break
      case 'medium':
        score -= 5
        break
      case 'low':
        score -= 2
        break
    }
  }

  // Bonus points for good practices
  if (analysis.structure.hasTests && hasDoc('testing')) {
    score += 5
  }

  if (hasADRs() && hasDoc('architecture')) {
    score += 5
  }

  return Math.max(0, Math.min(100, score))
}
```

### Report Structure

**Markdown Format:**

```markdown
# Documentation Audit Report

**Date:** 2025-10-16
**Score:** 65/100 (+12 from previous)
**Status:** 🟢 Improving

## Progress History

| Date | Score | Change | Gaps Resolved | Status |
|------|-------|--------|---------------|--------|
| 2025-10-16 | 65 | +12 | 2 | 🟢 Improving |
| 2025-10-15 | 53 | - | 0 | 🟡 Baseline |

## Summary

Your documentation quality improved by 12 points since the last audit. You resolved 2 critical gaps (TypeScript testing guide, CI/CD runbook). Continue momentum by addressing the 3 remaining Priority 1 items this week.

## Critical Gaps (Priority 1) - 3 items

### ❌ TypeScript Style Guide

- **Path:** `docs/standards/typescript-style-guide.md`
- **Template:** `docent://template/standards`
- **Effort:** 2-3 hours
- **Reason:** Project uses TypeScript but has no documented code style
- **Impact:** Inconsistent code style, unclear conventions for contributors
- **Action:** Create style guide documenting naming, imports, types vs interfaces

### ❌ Development Setup Runbook

- **Path:** `docs/runbooks/setup-development-environment.md`
- **Template:** `docent://template/runbook`
- **Effort:** 1-2 hours
- **Reason:** Contributing guide references development workflow but no step-by-step setup
- **Impact:** New contributors face setup friction
- **Action:** Create runbook with prerequisites, clone, install, verify steps

### ❌ Build & Test Runbook

- **Path:** `docs/runbooks/build-and-test.md`
- **Template:** `docent://template/runbook`
- **Effort:** 1-2 hours
- **Reason:** No documented build/test procedures
- **Impact:** Contributors unsure how to validate their changes
- **Action:** Document build commands, test execution, common issues

## High Priority Gaps (Priority 2) - 2 items

### ❌ Release Process Runbook

- **Path:** `docs/runbooks/prepare-release.md`
- **Template:** `docent://template/runbook`
- **Effort:** 2-3 hours
- **Reason:** Package.json indicates npm publishing but no documented release process
- **Impact:** Inconsistent releases, potential publishing errors
- **Action:** Document version bumping, changelog, build, publish, verify steps

### ❌ API Reference Documentation

- **Path:** `docs/guides/api-reference.md`
- **Template:** `docent://template/api`
- **Effort:** 4+ hours
- **Reason:** Express.js backend detected but no API documentation
- **Impact:** API consumers lack endpoint documentation
- **Action:** Document all endpoints with request/response examples

## Medium Priority Gaps (Priority 3) - 1 item

### ⚠️ Architecture Overview

- **Path:** `docs/architecture/overview.md`
- **Template:** `docent://template/architecture`
- **Effort:** 4+ hours
- **Reason:** Multi-framework project (React + Express) needs architecture docs
- **Impact:** Contributors lack high-level system understanding
- **Action:** Create overview with diagrams, component descriptions, data flow

## Strengths

- ✅ Comprehensive RFCs (8 found) - Good practice for proposals
- ✅ ADRs present (4 records) - Architectural decisions documented
- ✅ Testing guide exists - Clear testing expectations
- ✅ Contributing guide present - Workflow documented

## Resolved Since Last Audit

- ✅ TypeScript testing guide created (Priority 1)
- ✅ CI/CD health check runbook added (Priority 2)

## Recommendations

**This week:**
1. Create TypeScript style guide (2-3 hours)
2. Create development setup runbook (1-2 hours)
3. Create build & test runbook (1-2 hours)
   **Total effort:** 4-7 hours to resolve all Priority 1 gaps

**Next week:**
1. Create release process runbook (2-3 hours)
2. Start API reference documentation (4+ hours)

**This month:**
1. Complete API documentation
2. Create architecture overview
3. Target score: 85/100

## Next Audit

Run next audit in 1 week to track progress on Priority 1 items.

```bash
# Run audit with comparison
mcp.callTool('audit', {
  path: '.',
  save: true,
  compare: true
})
```

---

*Generated by docent v0.4.0*

```

### Implementation Architecture

**New File Structure:**

```

src/lib/audit/
├── gap-detector.ts       # Gap detection logic
├── score-calculator.ts   # Score calculation
├── report-generator.ts   # Format audit reports
├── report-persistence.ts # Save/load audit history
└── progress-tracker.ts   # Compare audits

docs/.audit/
├── 2025-10-16.md         # Today's audit
├── 2025-10-15.md         # Previous audit
└── latest.md             # Symlink to most recent

```

**Enhanced Audit Tool:**

```typescript
// src/mcp/tools/audit.ts

export const auditToolDefinition = {
  name: 'audit',
  description: 'Generate actionable documentation quality report with specific gaps, priorities, and progress tracking',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to project directory',
      },
      docsDir: {
        type: 'string',
        description: 'Documentation directory name (default: "docs")',
        default: 'docs',
      },
      save: {
        type: 'boolean',
        description: 'Save audit report to docs/.audit/ (default: true)',
        default: true,
      },
      compare: {
        type: 'boolean',
        description: 'Compare to previous audit for progress tracking (default: true)',
        default: true,
      },
    },
    required: ['path'],
  },
} as const

export async function handleAuditTool(args: {
  path: string
  docsDir?: string
  save?: boolean
  compare?: boolean
}) {
  const docsDir = args.docsDir || 'docs'
  const save = args.save !== false
  const compare = args.compare !== false

  // 1. Analyze project
  const analysis = await analyzeProject(args.path)

  // 2. Detect specific gaps
  const gaps = await detectDocumentationGaps(analysis, docsDir)

  // 3. Calculate score
  const score = calculateScore(gaps, analysis)

  // 4. Load previous audit for comparison
  const previousAudit = compare
    ? await loadLatestAudit(args.path, docsDir)
    : null

  // 5. Track progress
  const progress = previousAudit
    ? trackProgress(score, gaps, previousAudit)
    : null

  // 6. Generate structured report
  const report: AuditReport = {
    date: new Date().toISOString().split('T')[0],
    score,
    gaps,
    progress,
    strengths: identifyStrengths(analysis, docsDir),
    resolved: progress?.resolved || [],
  }

  // 7. Save report if requested
  if (save) {
    await saveAuditReport(args.path, docsDir, report)
  }

  // 8. Format as markdown for agent
  const markdown = formatAuditReportMarkdown(report)

  return {
    content: [
      {
        type: 'text' as const,
        text: markdown,
      },
    ],
  }
}
```

### Gap Detection Implementation

```typescript
// src/lib/audit/gap-detector.ts

interface DocumentationInventory {
  guides: string[]        // ['getting-started', 'contributing', 'testing']
  runbooks: string[]      // ['setup-development', 'ci-cd-health-check']
  standards: string[]     // ['typescript-style-guide']
  architecture: boolean   // Has architecture/overview.md
  adrs: string[]          // ['adr-0001', 'adr-0002']
  rfcs: string[]          // ['rfc-0001', 'rfc-0002']
  api: boolean            // Has API documentation
}

async function scanDocumentation(docsDir: string): Promise<DocumentationInventory> {
  const inventory: DocumentationInventory = {
    guides: [],
    runbooks: [],
    standards: [],
    architecture: false,
    adrs: [],
    rfcs: [],
    api: false,
  }

  // Scan docs directory
  const files = await glob(`${docsDir}/**/*.md`)

  for (const file of files) {
    const relativePath = path.relative(docsDir, file)

    if (relativePath.startsWith('guides/')) {
      const name = path.basename(file, '.md')
      inventory.guides.push(name)

      if (name.includes('api')) {
        inventory.api = true
      }
    } else if (relativePath.startsWith('runbooks/')) {
      const name = path.basename(file, '.md')
      inventory.runbooks.push(name)
    } else if (relativePath.startsWith('standards/')) {
      const name = path.basename(file, '.md')
      inventory.standards.push(name)
    } else if (relativePath.startsWith('architecture/')) {
      inventory.architecture = true
    } else if (relativePath.startsWith('adr/')) {
      const name = path.basename(file, '.md')
      inventory.adrs.push(name)
    } else if (relativePath.startsWith('rfcs/')) {
      const name = path.basename(file, '.md')
      inventory.rfcs.push(name)
    }
  }

  return inventory
}

export async function detectDocumentationGaps(
  analysis: ProjectAnalysis,
  docsDir: string
): Promise<Gap[]> {
  const docs = await scanDocumentation(docsDir)
  const gaps: Gap[] = []

  // Apply detection rules (see earlier examples)
  // ... all the gap detection logic

  return gaps.sort((a, b) => {
    // Sort by priority
    const priorityOrder = {critical: 0, high: 1, medium: 2, low: 3}
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
```

### Progress Tracking

```typescript
// src/lib/audit/progress-tracker.ts

interface ProgressComparison {
  scoreChange: number
  percentChange: number
  gapsResolved: Gap[]
  newGaps: Gap[]
  status: 'improving' | 'declining' | 'stable'
}

export function trackProgress(
  currentScore: number,
  currentGaps: Gap[],
  previousAudit: AuditReport
): ProgressComparison {
  const scoreChange = currentScore - previousAudit.score
  const percentChange = (scoreChange / previousAudit.score) * 100

  // Find resolved gaps (in previous but not current)
  const gapsResolved = previousAudit.gaps.filter(
    prevGap => !currentGaps.some(currGap => currGap.path === prevGap.path)
  )

  // Find new gaps (in current but not previous)
  const newGaps = currentGaps.filter(
    currGap => !previousAudit.gaps.some(prevGap => prevGap.path === currGap.path)
  )

  // Determine status
  let status: 'improving' | 'declining' | 'stable'
  if (scoreChange > 5) {
    status = 'improving'
  } else if (scoreChange < -5) {
    status = 'declining'
  } else {
    status = 'stable'
  }

  return {
    scoreChange,
    percentChange,
    gapsResolved,
    newGaps,
    status,
  }
}
```

### Report Persistence

```typescript
// src/lib/audit/report-persistence.ts

export async function saveAuditReport(
  projectPath: string,
  docsDir: string,
  report: AuditReport
): Promise<void> {
  const auditDir = path.join(projectPath, docsDir, '.audit')

  // Ensure .audit directory exists
  await fs.mkdir(auditDir, {recursive: true})

  // Save report with date as filename
  const filename = `${report.date}.md`
  const filepath = path.join(auditDir, filename)

  const markdown = formatAuditReportMarkdown(report)
  await fs.writeFile(filepath, markdown, 'utf-8')

  // Update latest symlink
  const latestPath = path.join(auditDir, 'latest.md')
  try {
    await fs.unlink(latestPath)
  } catch {}
  await fs.symlink(filename, latestPath)
}

export async function loadLatestAudit(
  projectPath: string,
  docsDir: string
): Promise<AuditReport | null> {
  const auditDir = path.join(projectPath, docsDir, '.audit')

  try {
    // List all audit files, sorted by date
    const files = await fs.readdir(auditDir)
    const auditFiles = files
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse()

    if (auditFiles.length === 0) {
      return null
    }

    // Read most recent audit
    const latestFile = auditFiles[0]
    const content = await fs.readFile(
      path.join(auditDir, latestFile),
      'utf-8'
    )

    // Parse markdown back to AuditReport structure
    return parseAuditReport(content)
  } catch {
    return null
  }
}
```

## Trade-offs and Alternatives

### Chosen Approach: Built-in Gap Detection + Persistence

**Advantages:**

- ✅ Actionable: Specific paths, templates, effort estimates
- ✅ Consistent: Same detection logic every time
- ✅ Trackable: Progress visible over time
- ✅ Self-contained: No external dependencies
- ✅ Fast: No agent reasoning required

**Disadvantages:**

- ❌ Maintenance: Detection rules need updates as best practices evolve
- ❌ Opinionated: Enforces specific documentation structure
- ❌ Storage: Audit reports accumulate over time

**Assessment:** Advantages strongly outweigh disadvantages. Maintenance burden is acceptable for consistency and actionability gains.

### Alternative 1: Keep Agent-Driven Assessment Only

**Description:** Don't build gap detection, rely on agent reasoning

**Pros:**

- Simple implementation
- Flexible (agent adapts to any project)
- No maintenance burden

**Cons:**

- ❌ Not actionable (vague recommendations)
- ❌ Not trackable (no persistence)
- ❌ Inconsistent (varies by agent)
- ❌ Slow (agent reasoning time)

**Why not chosen:** Doesn't solve the core problem of actionability and tracking.

### Alternative 2: External Linting Tool

**Description:** Create a separate CLI tool that runs documentation checks

**Pros:**

- Can run in CI/CD
- Strict enforcement possible
- Standard exit codes

**Cons:**

- ❌ Not MCP-native
- ❌ Requires installation
- ❌ Separate from docent
- ❌ Violates ADR-0004 (MCP-only)

**Why not chosen:** Doesn't align with MCP-only architecture. Agents should access via MCP, not CLI.

### Alternative 3: Agent + Human Hybrid

**Description:** Agent assesses, human reviews and saves report manually

**Pros:**

- Human oversight
- Flexible assessment

**Cons:**

- ❌ Manual effort required
- ❌ Inconsistent execution
- ❌ No automation

**Why not chosen:** Defeats purpose of automation. Users want tools to handle this.

### Alternative 4: Machine Learning Gap Detection

**Description:** Train ML model on good/bad documentation examples

**Pros:**

- Could detect nuanced issues
- Adaptive to project types

**Cons:**

- ❌ Over-engineered
- ❌ Training data required
- ❌ Unpredictable results
- ❌ High complexity

**Why not chosen:** Rule-based detection is sufficient and maintainable.

## Security Considerations

**File System Access:**

- Audit tool writes to `docs/.audit/` directory
- Uses user permissions (no elevation)
- Validates paths to prevent directory traversal

**Data Persistence:**

- Audit reports contain project metadata (languages, frameworks)
- No secrets or credentials stored
- Reports are markdown (human-readable, no binaries)

**Mitigation:**

- Validate all file paths before writing
- Use safe file system APIs
- Document what data is stored in audit reports

## Performance Considerations

**Gap Detection:**

- Scans documentation directory once per audit
- Typical: 10-100 files, <100ms scan time
- No external API calls

**Score Calculation:**

- Simple arithmetic based on gap counts
- <1ms computation time

**Report Persistence:**

- Single file write per audit
- Typical: 5-15KB markdown file
- <10ms write time

**Progress Tracking:**

- Loads one previous audit file
- Parses markdown (~5-15KB)
- <50ms load + parse time

**Overall:**

- Full audit: <500ms end-to-end
- Acceptable for interactive use
- Could cache documentation scan if needed

## Testing Strategy

### Unit Tests

1. **Gap Detection**
   - Test each detection rule independently
   - Verify priority assignment
   - Test edge cases (no docs, partial docs)

2. **Score Calculation**
   - Test scoring formula
   - Verify 0-100 range enforcement
   - Test bonus point logic

3. **Progress Tracking**
   - Test score change calculation
   - Test gap resolution detection
   - Test new gap detection

4. **Report Persistence**
   - Test save/load cycle
   - Test symlink creation
   - Test malformed data handling

### Integration Tests

1. **End-to-End Audit**
   - Run audit on real project
   - Verify report structure
   - Check file created in correct location

2. **Progress Tracking**
   - Run audit twice
   - Modify documentation between audits
   - Verify progress correctly tracked

3. **MCP Integration**
   - Invoke via MCP tool call
   - Verify response format
   - Test with/without save/compare flags

### Manual Testing (Dogfooding)

1. **Audit Docent Project**
   - Run audit on docent itself
   - Verify gaps make sense
   - Create missing docs identified
   - Re-run audit to verify improvements

2. **Audit Sample Projects**
   - Test on TypeScript project
   - Test on Python project
   - Test on multi-language project
   - Verify appropriate gaps detected

## Success Criteria

**Quantitative:**

- ✅ Audit completes in <500ms
- ✅ Detects 80%+ of missing critical documentation
- ✅ Score calculation reproducible (same input = same score)
- ✅ Progress tracking accurate (detects resolved/new gaps)
- ✅ Reports saved to `docs/.audit/YYYY-MM-DD.md`

**Qualitative:**

- ✅ Recommendations are actionable (specific paths, templates)
- ✅ Gaps are prioritized appropriately
- ✅ Progress trends are visible over time
- ✅ Users can set and track documentation quality goals
- ✅ New contributors know which docs to create first

**User Feedback:**

- "I can actually see our documentation improving week over week"
- "The specific file paths make it easy to know what to create"
- "Priority levels help us focus on critical gaps first"

## Migration and Rollout

**No Breaking Changes:**

- Enhanced `audit` tool remains backward compatible
- `save` and `compare` parameters default to `true` but can be disabled
- Existing agent-driven audit prompt still available (set `save=false, compare=false`)

**Rollout Plan:**

**Phase 1: Implementation (Week 1)**

- Implement gap detection logic
- Implement score calculation
- Implement report generation
- Unit tests for all components

**Phase 2: Persistence (Week 1)**

- Implement report save/load
- Implement progress tracking
- Create `docs/.audit/` directory structure
- Integration tests

**Phase 3: Dogfooding (Week 2)**

- Run audits on docent project
- Iterate on gap detection rules
- Refine report format based on feedback
- Create missing docs identified by audit

**Phase 4: Documentation (Week 2)**

- Update MCP API reference
- Create audit guide explaining reports
- Document gap detection rules
- Add examples to getting-started

**Phase 5: Release (Week 3)**

- Version bump (0.5.0 - minor feature)
- Update CHANGELOG
- Publish to npm
- Announce enhancement

## Open Questions

1. **Should audit reports be gitignored or committed?**
   - **Option A:** Gitignore (ephemeral, per-developer state)
   - **Option B:** Commit (track team progress over time)
   - **Recommendation:** Commit reports to track team progress, but document that frequent audits = noise

2. **How long to keep historical audits?**
   - All audits forever? Last 30 days? Last 10 audits?
   - **Recommendation:** Keep all, they're small (<15KB each)

3. **Should gaps be customizable per project?**
   - Could add `.docent/audit-rules.json` to customize gap detection
   - **Recommendation:** Start with built-in rules, add customization in future if needed

4. **Should audit run automatically (e.g., pre-commit hook)?**
   - Could enforce documentation quality gates
   - **Recommendation:** No enforcement, keep it advisory. Projects can add hooks if they want.

5. **How to handle project-specific documentation patterns?**
   - Some projects use different directory structures
   - **Recommendation:** Focus on content (getting-started exists), not exact paths

## Future Enhancements

### Enhanced Gap Detection

1. **Content Quality Checks**
   - Detect stub documents (< 100 words)
   - Detect broken internal links
   - Detect outdated examples (reference old versions)

2. **Custom Rules**
   - Allow projects to define additional gaps in `.docent/audit-rules.json`
   - Support regex patterns for custom file detection

3. **Language-Specific Gaps**
   - Python: Detect missing `__init__.py` docs
   - Rust: Detect missing crate-level docs
   - Go: Detect missing package docs

### Enhanced Progress Tracking

1. **Visualizations**
   - Generate charts showing score trends
   - Heatmap of documentation coverage
   - Gap resolution velocity

2. **Team Metrics**
   - Track who created which docs
   - Team contribution leaderboard
   - Documentation velocity over time

3. **Goal Setting**
   - Set target score (e.g., "reach 85/100 by end of month")
   - Track progress toward goal
   - Alert when falling behind

### Integration with Other Tools

1. **CI/CD Integration**
   - Fail build if score drops below threshold
   - Post audit results as PR comments
   - Track documentation quality in CI dashboard

2. **Documentation Linting**
   - Integrate with markdownlint results
   - Check for broken links
   - Verify code examples compile

3. **Template Auto-Generation**
   - Generate stub documents based on gaps
   - Pre-fill templates with project context
   - One-click "create missing docs" workflow

## References

### Related Docent Documentation

- [ADR-0004: MCP-Only Architecture](../adr/adr-0004-mcp-only-architecture.md) - Context provider principle
- [RFC-0005: Enhanced MCP Architecture](./rfc-0005-enhanced-mcp-architecture.md) - MCP tools, resources, prompts
- [RFC-0008: Session Initialization Prompt](./rfc-0008-session-initialization-prompt.md) - Bootstrapping agent sessions

### External Resources

- [Write the Docs: Documentation Quality](https://www.writethedocs.org/guide/writing/docs-principles/)
- [Diataxis Framework](https://diataxis.fr/) - Documentation structure principles
- [Google Season of Docs: Audit](https://developers.google.com/season-of-docs/docs/tech-writing-audit)

---

**This RFC proposes enhancing docent's audit tool to provide actionable, specific documentation gap reports with progress tracking, transforming "you should have docs" into "create docs/standards/typescript-style-guide.md using docent://template/standards (2-3 hours, Priority 1)".**
