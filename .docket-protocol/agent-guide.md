# Docket Agent Protocol Guide

## Overview

Docket is a documentation platform with an agent-agnostic CLI. This guide explains how any AI agent can use docket to help developers maintain high-quality project documentation.

**Key Principle:** Docket provides structured JSON output that any agent framework can consume. No agent-specific integrations required.

## Core Commands

All docket commands support `--output json` for structured data and `--path <directory>` for specifying project location.

### 1. `docket analyze`

Analyzes project structure, languages, and frameworks.

**Purpose:** Understand the project's technical landscape

**Human Usage:**
```bash
docket analyze
```

**Agent Usage:**
```bash
docket analyze --output json --path /path/to/project
```

**Output Schema:** See [`schemas/analysis.schema.json`](./schemas/analysis.schema.json)

**Key Fields:**
- `languages[]` - Detected programming languages with confidence levels
- `frameworks[]` - Detected frameworks categorized by type (web, backend, testing, etc.)
- `structure` - Project organization (source dirs, test dirs, docs dirs)
- `buildTools[]` - Build systems and task runners
- `packageManagers[]` - Package management tools

**Agent Use Cases:**
- Before suggesting documentation, understand what technologies are used
- Tailor documentation templates to project's tech stack
- Identify if project is web, backend, CLI tool, library, etc.

**Example Flow:**
```typescript
const analysis = JSON.parse(await exec('docket analyze --output json'))
const primaryLang = analysis.languages[0]?.name
const hasBackend = analysis.frameworks.some(f => f.type === 'backend')
// Now suggest backend-specific documentation if needed
```

---

### 2. `docket init`

Initializes docket documentation with smart customization.

**Purpose:** Set up documentation structure for a project

**Human Usage:**
```bash
docket init  # Interactive prompts
```

**Agent Usage:**
```bash
docket init --non-interactive --output json --path /path/to/project
```

**Options:**
- `--non-interactive` - Use smart defaults, no prompts
- `--docs-dir <name>` - Specify documentation directory (default: `docs`)
- `--output json` - Return structured result

**Output Schema:** See [`schemas/init.schema.json`](./schemas/init.schema.json)

**Key Fields:**
- `success` - Boolean indicating if initialization succeeded
- `context` - Project context including name, team size, goals, analysis
- `installedFiles[]` - List of template files created
- `docsDirectory` - Where templates were installed

**What It Does:**
1. Analyzes project (runs `docket analyze` internally)
2. Gathers project context (name, team size, documentation goals)
3. Customizes templates based on context
4. Installs templates to docs directory
5. Saves context to `.docket/context.json`

**Agent Use Cases:**
- Initialize documentation for new projects
- Set up documentation structure based on project type
- Skip interactive prompts by using `--non-interactive`

**Important:** Won't reinitialize if `.docket/context.json` exists (returns error in JSON mode)

---

### 3. `docket audit`

Audits documentation completeness and identifies gaps.

**Purpose:** Find what's missing or incomplete in documentation

**Human Usage:**
```bash
docket audit
```

**Agent Usage:**
```bash
docket audit --output json --path /path/to/project
```

**Output Schema:** See [`schemas/audit.schema.json`](./schemas/audit.schema.json)

**Key Fields:**
- `score` - Documentation completeness score (0-100)
- `gaps[]` - List of documentation gaps with severity and suggestions
- `coverage` - Boolean flags for key documentation types
- `recommendations[]` - Prioritized list of actions

**Gap Categories:**
- `Architecture` - System design documentation
- `Decisions` - ADRs (Architecture Decision Records)
- `Standards` - Coding conventions and style guides
- `Testing` - Test philosophy and practices
- `API` - API endpoint documentation
- `Operations` - Runbooks and troubleshooting
- `Onboarding` - Getting started guides
- `Content` - Empty or placeholder files
- `Format` - Documentation format issues

**Agent Use Cases:**
- Identify what documentation is missing
- Prioritize documentation work by severity (high/medium/low)
- Suggest specific documentation to create
- Check if templates have been filled in

**Example Flow:**
```typescript
const audit = JSON.parse(await exec('docket audit --output json'))
const highPriorityGaps = audit.gaps.filter(g => g.severity === 'high')
// Offer to help user address high-priority gaps first
for (const gap of highPriorityGaps) {
  console.log(`Missing: ${gap.description}`)
  console.log(`Suggestion: ${gap.suggestion}`)
}
```

---

### 4. `docket review`

Reviews documentation for staleness and drift from code.

**Purpose:** Detect outdated or misaligned documentation

**Human Usage:**
```bash
docket review
```

**Agent Usage:**
```bash
docket review --output json --path /path/to/project
```

**Output Schema:** See [`schemas/review.schema.json`](./schemas/review.schema.json)

**Key Fields:**
- `healthScore` - Documentation health score (0-100)
- `staleDocuments[]` - Files not updated recently (with timestamps)
- `driftIssues[]` - Misalignments between code and docs
- `recommendations[]` - Actions to improve health

**Drift Detection:**
- Framework changes not reflected in docs
- Testing framework changes without doc updates
- Significant code changes without corresponding doc updates

**Staleness Thresholds:**
- **High:** 6+ months since last update
- **Medium:** 3-6 months since last update
- **Low:** 1-3 months since last update

**Agent Use Cases:**
- Remind users about outdated documentation
- Detect when recent code changes might require doc updates
- Find documentation-code mismatches
- Suggest documentation review sessions

**Example Flow:**
```typescript
const review = JSON.parse(await exec('docket review --output json'))
if (review.healthScore < 70) {
  console.log('Documentation health is low')
  const highPriorityStale = review.staleDocuments.filter(d => d.severity === 'high')
  // Suggest reviewing these files
}
```

---

## Agent Workflows

### Workflow 1: New Project Documentation Setup

**Scenario:** User starts a new project and wants documentation

```typescript
// 1. Analyze project
const analysis = JSON.parse(await exec('docket analyze --output json'))

// 2. Confirm with user
console.log(`Detected: ${analysis.languages.map(l => l.name).join(', ')}`)
console.log(`Frameworks: ${analysis.frameworks.map(f => f.name).join(', ')}`)
console.log('Should I set up documentation?')

// 3. Initialize (after confirmation)
const init = JSON.parse(await exec('docket init --non-interactive --output json'))
console.log(`Created ${init.installedFiles.length} documentation templates`)

// 4. Guide user
console.log('Next steps:')
console.log('1. Review templates in docs/')
console.log('2. Fill in project-specific details')
console.log('3. Run `docket audit` to check completeness')
```

### Workflow 2: Documentation Health Check

**Scenario:** User asks "Is our documentation up to date?"

```typescript
// 1. Run audit
const audit = JSON.parse(await exec('docket audit --output json'))

// 2. Run review
const review = JSON.parse(await exec('docket review --output json'))

// 3. Present findings
console.log(`Documentation Score: ${audit.score}/100`)
console.log(`Health Score: ${review.healthScore}/100`)

// 4. Prioritize issues
const highPriorityGaps = audit.gaps.filter(g => g.severity === 'high')
const highPriorityStaleness = review.staleDocuments.filter(d => d.severity === 'high')

if (highPriorityGaps.length > 0) {
  console.log(`\nMissing documentation (${highPriorityGaps.length} items):`)
  for (const gap of highPriorityGaps) {
    console.log(`- ${gap.description}`)
  }
}

if (highPriorityStaleness.length > 0) {
  console.log(`\nStale documentation (${highPriorityStaleness.length} files):`)
  for (const doc of highPriorityStaleness) {
    console.log(`- ${doc.file} (${doc.daysSinceUpdate} days old)`)
  }
}
```

### Workflow 3: Feature Implementation Documentation

**Scenario:** User implements a new feature, agent helps document it

```typescript
// 1. Check current state
const beforeAudit = JSON.parse(await exec('docket audit --output json'))

// 2. After feature implementation
console.log('Feature implemented! Let me check documentation needs...')
const afterAudit = JSON.parse(await exec('docket audit --output json'))

// 3. Suggest documentation updates
if (featureIsArchitecturalChange) {
  console.log('This feature affects architecture. Update:')
  console.log('- architecture-overview.md')
  console.log('- Create ADR for this decision')
}

if (featureAddsAPI) {
  console.log('New API endpoints added. Update:')
  console.log('- api-documentation.md')
}

// 4. After user updates docs
const review = JSON.parse(await exec('docket review --output json'))
console.log(`Documentation health: ${review.healthScore}/100`)
```

### Workflow 4: Onboarding New Team Member

**Scenario:** Agent helps prepare onboarding for new team member

```typescript
// 1. Check onboarding documentation
const analysis = JSON.parse(await exec('docket analyze --output json'))
const audit = JSON.parse(await exec('docket audit --output json'))

// 2. Identify gaps specific to onboarding
const onboardingGaps = audit.gaps.filter(g =>
  g.category === 'Onboarding' ||
  g.category === 'Standards' ||
  g.category === 'Testing'
)

// 3. Guide user
if (onboardingGaps.length > 0) {
  console.log('Onboarding documentation needs attention:')
  for (const gap of onboardingGaps) {
    console.log(`- ${gap.suggestion}`)
  }
} else {
  console.log('Onboarding docs look good!')
  console.log('Key documents for new team member:')
  console.log('- docs/onboarding-template.md')
  console.log('- docs/architecture-overview-template.md')
  console.log('- docs/standards-template.md')
}
```

---

## Integration Patterns

### Pattern 1: Periodic Health Checks

**Use Case:** Regular documentation maintenance

```bash
# Weekly cron job or CI check
docket review --output json > review-$(date +%Y%m%d).json

# Agent analyzes results and notifies team
if [ "$(cat review-*.json | jq '.healthScore')" -lt 70 ]; then
  # Alert team about documentation drift
fi
```

### Pattern 2: PR/Commit Hooks

**Use Case:** Ensure docs stay current with code changes

```bash
# In pre-commit or CI
docket audit --output json > audit.json
SCORE=$(cat audit.json | jq '.score')

if [ "$SCORE" -lt 50 ]; then
  echo "Documentation score too low. Update docs before committing."
  exit 1
fi
```

### Pattern 3: Context-Aware Suggestions

**Use Case:** Agent suggests documentation based on what user is doing

```typescript
// User asks about testing
const analysis = JSON.parse(await exec('docket analyze --output json'))
const testingFrameworks = analysis.frameworks.filter(f => f.type === 'testing')

if (testingFrameworks.length > 0) {
  // Check if testing docs exist
  const audit = JSON.parse(await exec('docket audit --output json'))
  if (!audit.coverage.hasTesting) {
    console.log('I notice you have testing frameworks but no testing docs.')
    console.log('Would you like me to help document your testing approach?')
  }
}
```

---

## JSON Output Guarantees

1. **All commands support `--output json`** - Structured, parseable output
2. **Schema-validated** - All JSON follows documented schemas
3. **Stable structure** - Field names and types won't change without major version bump
4. **Error handling** - Errors returned as JSON with `{error: string, details?: any}`
5. **No stdout pollution** - JSON mode only outputs JSON, no human-readable text

---

## File System Conventions

- **Documentation directory:** `docs/` (customizable with `--docs-dir`)
- **Context file:** `.docket/context.json` (created by `docket init`)
- **Templates installed:** 11 markdown templates in docs directory
- **Template naming:** `*-template.md` (e.g., `adr-template.md`)

---

## Best Practices for Agents

1. **Always use `--output json`** when programmatically consuming docket
2. **Check for initialization** before running audit/review (look for `.docket/context.json`)
3. **Prioritize by severity** - High > Medium > Low
4. **Combine commands** - Use analyze + audit + review together for full picture
5. **Respect user control** - Suggest actions, don't auto-modify documentation
6. **Handle errors gracefully** - JSON output includes error information
7. **Present human-readable summaries** - Parse JSON, show key insights to user
8. **Track changes over time** - Store command outputs to detect trends

---

## Example: Full Agent Integration

```typescript
class DocketAgent {
  async checkDocumentationHealth(projectPath: string) {
    // 1. Analyze project
    const analysis = await this.runCommand('analyze', projectPath)

    // 2. Check if initialized
    const contextExists = await fs.exists(path.join(projectPath, '.docket', 'context.json'))

    if (!contextExists) {
      return {
        status: 'not_initialized',
        suggestion: 'Run docket init to set up documentation',
        analysis
      }
    }

    // 3. Audit and review
    const [audit, review] = await Promise.all([
      this.runCommand('audit', projectPath),
      this.runCommand('review', projectPath)
    ])

    // 4. Synthesize findings
    return {
      status: 'initialized',
      scores: {
        completeness: audit.score,
        health: review.healthScore
      },
      highPriorityActions: [
        ...audit.gaps.filter(g => g.severity === 'high'),
        ...review.staleDocuments.filter(d => d.severity === 'high')
      ],
      recommendations: [
        ...audit.recommendations,
        ...review.recommendations
      ]
    }
  }

  private async runCommand(command: string, projectPath: string): Promise<any> {
    const result = await exec(
      `docket ${command} --output json --path "${projectPath}"`
    )
    return JSON.parse(result.stdout)
  }
}
```

---

## Troubleshooting

**Q: Command fails with "no such file or directory"**
A: Check that docket is installed globally (`npm install -g @tnezdev/docket`) or use `npx @tnezdev/docket`

**Q: JSON output includes human-readable text**
A: Ensure you're using `--output json` flag. Without it, commands default to human-readable output.

**Q: Analysis detects wrong frameworks**
A: Docket uses heuristics (package.json, lock files, config files). If detection is wrong, it's detecting what's present in the filesystem.

**Q: Review shows staleness even though docs are current**
A: Staleness is based on git history or filesystem mtime. Make sure docs are committed to git for accurate tracking.

---

## Version Compatibility

This protocol guide is for **Docket v0.3.0+**

- Breaking changes will bump major version
- New commands will bump minor version
- Bug fixes will bump patch version

Check version: `docket --version`

---

## Support

- **Issues:** https://github.com/tnez/docket/issues
- **Discussions:** https://github.com/tnez/docket/discussions
- **Documentation:** https://github.com/tnez/docket/blob/main/README.md

---

**Agent developers:** Feel free to open issues or discussions if you need additional CLI features or JSON output fields to support your use case.
