# Claude Code Integration for Project Documentation

## Philosophy

Documentation isn't a one-time deliverable - it's a living system that requires continuous maintenance. The challenge isn't writing initial documentation; it's keeping it current as code evolves.

This Claude Code integration transforms documentation maintenance from a manual chore into an automated, quality-assured workflow. Rather than documenting after the fact, Claude Code becomes a documentation partner that:

- **Detects drift** before it becomes a problem
- **Validates accuracy** by testing examples and checking references
- **Enforces standards** consistently across all documentation
- **Guides updates** with context-aware suggestions
- **Reviews quality** from multiple perspectives
- **Automates validation** in CI/CD pipelines

The integration is designed to work within a project's `docs/` directory, complementing (not replacing) project-level Claude Code configurations and respecting user's global preferences.

## Architecture

### Three-Layer Design

The integration uses a layered architecture that separates concerns:

```
┌─────────────────────────────────────────────┐
│         Slash Commands                       │  User-facing workflows
│  (/check-drift, /review-docs, etc.)          │  Orchestrate agents
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Specialized Agents                   │  Focused capabilities
│  (drift-detector, doc-reviewer, etc.)        │  Deep expertise
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Output Styles                        │  Consistent formatting
│  (drift-report, review-feedback, etc.)       │  Scannable results
└─────────────────────────────────────────────┘
```

**Layer 1: Slash Commands**
- User-facing workflows for common documentation tasks
- Orchestrate multiple agents and tools
- Handle complex multi-step processes
- Provide clear next actions

**Layer 2: Specialized Agents**
- Focused on specific documentation capabilities
- Can be used independently or by commands
- Maintain deep domain knowledge
- Reusable across different workflows

**Layer 3: Output Styles**
- Consistent formatting for documentation-focused output
- Scannable, actionable results
- Professional appearance for team communication
- Machine-readable when needed for CI/CD

### Integration with Existing Workflows

This integration complements existing Claude Code features:

```
User's Global CLAUDE.md
    │
    ├─→ Applies to ALL projects
    │   (preferences, agents like git-commit, architecture-reviewer)
    │
Project .claude/CLAUDE.md
    │
    ├─→ Applies to THIS project
    │   (project patterns, standards, testing approach)
    │
Documentation .claude/ (THIS INTEGRATION)
    │
    └─→ Documentation-specific workflows
        (drift detection, doc review, link checking)
```

**Design Principles:**

1. **Non-Conflicting**: Documentation commands don't duplicate existing ones
2. **Reuse Existing**: Use `git-commit`, `architecture-reviewer` where appropriate
3. **Scope-Limited**: Only handle documentation-related tasks
4. **Team-Friendly**: Multiple developers can use same configuration
5. **CI/CD Ready**: Commands can run in automated pipelines

## Installation

### Option 1: Via Bootstrap Script (Recommended)

When using the documentation template installer:

```bash
curl -fsSL https://raw.githubusercontent.com/user/project-docs-template/main/install.sh | bash
```

The installer prompts:
```
? Install optional components:
  [✓] Examples directory
  [✓] CI/CD workflow templates
  [✓] Claude Code integration    ← This installs .claude/ directory
```

The `.claude/` directory is installed directly into the project root with documentation-specific commands and agents.

### Option 2: Manual Installation

Copy the `.claude/` directory from this template:

```bash
# From template repository
cp -r project-docs-template/.claude/commands/doc-* ./.claude/commands/
cp -r project-docs-template/.claude/agents/doc-* ./.claude/agents/
cp -r project-docs-template/.claude/output-styles/ ./.claude/
```

### Option 3: Selective Installation

Install only the commands you need:

```bash
# Just drift detection
cp project-docs-template/.claude/commands/check-doc-drift.md ./.claude/commands/
cp project-docs-template/.claude/agents/drift-detector.md ./.claude/agents/

# Just documentation review
cp project-docs-template/.claude/commands/review-docs.md ./.claude/commands/
cp project-docs-template/.claude/agents/doc-reviewer.md ./.claude/agents/
```

## Common Workflows

### Daily Development: Keeping Docs Current

**Scenario**: You just changed the authentication system from JWT to OAuth.

```bash
# Check what documentation might be affected
/check-doc-drift --scope auth

# Output shows:
# - docs/quickstart.md references JWT setup
# - docs/guides/authentication.md has JWT examples
# - docs/onboarding.md links to old JWT guide

# Update affected documentation
/update-doc docs/guides/authentication.md

# Claude analyzes code changes and suggests updates
# You review, approve, and changes are made

# Validate the updates
/validate-examples docs/guides/authentication.md

# All examples pass, commit changes
git add docs/
git commit -m "docs: Update authentication to use OAuth"
```

### Weekly Review: Documentation Health

**Scenario**: Friday afternoon, check documentation health before weekend.

```bash
# Run comprehensive health check
/check-doc-health

# Output shows:
# ✓ No broken links
# ⚠ 3 examples need testing
# ⚠ 2 TODO markers unresolved
# ✗ 1 feature undocumented (new payment flow)

# Fix issues one by one
/validate-examples --fix
/update-doc docs/features.md  # Add payment flow
/review-docs docs/features.md  # Quality check

# Clean bill of health
/check-doc-health  # All green
```

### Pull Request: Documentation Review

**Scenario**: Reviewing a PR that adds a new feature.

```bash
# Check if documentation was updated
/check-coverage --diff main..feature-branch

# Output shows feature is undocumented

# Review PR's documentation changes
/review-docs --files $(git diff --name-only main..HEAD -- docs/)

# Claude provides feedback:
# - Missing example usage
# - Link to non-existent API reference
# - Inconsistent terminology

# Address feedback and re-review
# Once approved, merge PR
```

### Pre-Release: Validation

**Scenario**: About to cut a release, ensure docs are ready.

```bash
# Full validation suite
/validate-docs

# Runs all checks:
# ✓ Examples tested (12/12 passing)
# ✓ Links validated (internal + external)
# ✓ Frontmatter complete
# ✓ Standards compliant
# ✓ No drift detected
# ✓ Coverage adequate (87%)

# Ready for release
```

### New Feature: Documentation from Scratch

**Scenario**: Just built a new caching system, need docs.

```bash
# Generate initial documentation from code
/docs-from-code src/cache/

# Creates draft documentation with:
# - Purpose and overview
# - API reference
# - Configuration options
# - Usage examples (extracted from tests)

# Review and refine
/review-docs docs/reference/caching.md

# Claude suggests improvements
# Add to appropriate sections
mv docs/reference/caching.md docs/guides/caching.md

# Validate
/validate-examples docs/guides/caching.md

# Commit using existing git-commit agent
# (Don't need special doc-commit, use standard flow)
```

## Usage Patterns

### Pattern 1: Drift Detection and Prevention

**When to use**: After any significant code changes, before releases, weekly checks.

**Workflow**:
```
1. /check-doc-drift [--scope <area>]
2. Review drift report (what's outdated, why)
3. /update-doc <file> (for each affected file)
4. /validate-examples (ensure examples work)
5. Commit changes
```

**Prevents**: Documentation falling out of sync with code over time.

### Pattern 2: Quality Assurance

**When to use**: Before merging PRs, during documentation writing, quarterly reviews.

**Workflow**:
```
1. /review-docs [--files <files>]
2. Review feedback (completeness, quality, standards)
3. Address issues
4. /review-docs (re-check)
5. Approved, commit
```

**Ensures**: All documentation meets quality standards consistently.

### Pattern 3: Example Validation

**When to use**: After dependency updates, before releases, CI/CD pipeline.

**Workflow**:
```
1. /validate-examples [--scope <pattern>]
2. Review failures
3. Fix broken examples
4. Re-run validation
5. All passing
```

**Catches**: Broken code examples before users encounter them.

### Pattern 4: Onboarding Validation

**When to use**: After dependency changes, monthly, when new developers struggle.

**Workflow**:
```
1. /validate-onboarding
2. Claude walks through onboarding steps
3. Reports failures or unclear sections
4. Fix issues
5. Test with real new developer
```

**Ensures**: New developers can successfully onboard using documentation.

### Pattern 5: Standards Enforcement

**When to use**: During documentation reviews, before merging, CI/CD.

**Workflow**:
```
1. /check-standards [--files <files>]
2. Review violations
3. Fix standard violations
4. Re-check
5. Compliant
```

**Maintains**: Consistent style and structure across all documentation.

## Customization

### Adapting to Your Project

The integration is designed to be customized for your project's needs.

#### 1. Configure Drift Detection

Edit `.claude/agents/drift-detector.md` to specify what to track:

```markdown
## Project-Specific Drift Signals

Track these patterns in your project:

**Authentication Changes:**
- File: `src/auth/*.ts`
- Affects: `docs/quickstart.md`, `docs/guides/authentication.md`
- Keywords: "JWT", "OAuth", "login", "session"

**API Changes:**
- Files: `src/api/routes/*.ts`
- Affects: `docs/reference/api/*.md`
- Detection: Function signature changes, new routes

**Configuration Changes:**
- File: `config/schema.ts`
- Affects: `docs/reference/configuration.md`
- Detection: New config fields, changed defaults
```

#### 2. Customize Documentation Standards

Edit `.claude/agents/standards-enforcer.md`:

```markdown
## Project Standards

**Required Frontmatter:**
- title
- description
- last_updated
- owner (team name)

**Code Block Requirements:**
- Language specified
- Copy button compatible
- Runnable examples (no pseudocode)

**Link Policy:**
- Absolute URLs for external links
- Relative paths for internal links
- Link text describes destination
```

#### 3. Add Project-Specific Commands

Create `.claude/commands/validate-api-docs.md`:

```markdown
---
description: Validate API documentation matches OpenAPI spec
---

1. Load OpenAPI spec from `openapi.yaml`
2. Load API documentation from `docs/reference/api/`
3. Compare endpoints, parameters, responses
4. Report mismatches
5. Suggest updates
```

#### 4. Configure CI/CD Integration

Edit `.github/workflows/docs-validation.yml`:

```yaml
- name: Validate documentation
  run: |
    # Use validation scripts
    ./scripts/check-links.sh
    ./scripts/test-examples.sh
    ./scripts/detect-drift.sh

- name: Claude review
  if: github.event_name == 'pull_request'
  run: |
    claude /review-docs --files "${{ steps.changed-files.outputs.docs_files }}"
```

## Integration with CI/CD

### GitHub Actions

The integration includes GitHub Actions workflows for automated validation.

**On Every PR** (`docs-test.yml`):
```yaml
jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for broken links
        run: ./scripts/check-links.sh

      - name: Validate code examples
        run: ./scripts/test-examples.sh

      - name: Detect documentation drift
        run: ./scripts/detect-drift.sh

      - name: Check standards compliance
        run: ./scripts/validate-standards.sh

      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: '⚠️ Documentation validation failed. Review the logs.'
            })
```

**On Main Branch** (`docs-deploy.yml`):
```yaml
jobs:
  deploy-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate before deploy
        run: |
          ./scripts/check-links.sh
          ./scripts/test-examples.sh

      - name: Build documentation
        run: npm run docs:build

      - name: Deploy to hosting
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-build
```

**Weekly Health Check** (`docs-health.yml`):
```yaml
on:
  schedule:
    - cron: '0 10 * * 1'  # Monday 10am

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run health check
        run: ./scripts/health-check.sh

      - name: Create issue if unhealthy
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              title: 'Documentation Health Check Failed',
              body: 'Weekly health check found issues. Review the logs.',
              labels: ['documentation', 'health-check']
            })
```

### Pre-Commit Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Only run if docs changed
if git diff --cached --name-only | grep -q '^docs/'; then
  echo "Validating documentation changes..."

  # Check for broken internal links
  ./scripts/check-links.sh --scope docs/ --internal-only || {
    echo "❌ Documentation validation failed"
    echo "Run './scripts/check-links.sh' to see details"
    exit 1
  }

  # Validate examples in changed files
  git diff --cached --name-only | grep '^docs/' | while read file; do
    if grep -q '```' "$file"; then
      ./scripts/test-examples.sh "$file" || {
        echo "❌ Code examples failed in $file"
        exit 1
      }
    fi
  done

  echo "✅ Documentation validation passed"
fi
```

## Trade-offs and Limitations

### What Works Well

**1. Automated Drift Detection**
- Reliably catches outdated documentation
- Reduces manual review burden
- Prevents documentation from becoming stale

**2. Example Validation**
- Ensures code examples actually work
- Catches breaking changes immediately
- Builds confidence in documentation

**3. Standards Enforcement**
- Consistent style across all documentation
- Lower cognitive load for readers
- Easier to maintain

**4. CI/CD Integration**
- Blocks PRs with bad documentation
- Automated validation at scale
- No manual intervention needed

### What Doesn't Work Well

**1. Complex Interactive Examples**
- CLI tools requiring user input
- Browser-based interactions
- Multi-step workflows with external dependencies

**Mitigation**: Document prerequisites, provide non-interactive versions, use Docker for isolation.

**2. Subjective Quality Issues**
- "Is this explanation clear enough?"
- "Should this be a guide or tutorial?"
- "Is the tone appropriate?"

**Mitigation**: Use human reviewers for subjective aspects, Claude for objective checks.

**3. Documentation for Moving Targets**
- Rapidly changing APIs during development
- Experimental features
- Pre-release code

**Mitigation**: Mark documentation as "draft", skip certain validations, update in batches.

**4. False Positives in Drift Detection**
- Renamed variables that don't affect meaning
- Refactored code with same behavior
- Implementation changes that don't affect API

**Mitigation**: Configure drift detector with project-specific rules, use --confidence flag.

**5. Resource Intensive Operations**
- Testing all examples on every commit
- Checking external links frequently
- Generating full coverage reports

**Mitigation**: Run comprehensive checks weekly/monthly, quick checks on PRs, use caching.

### Known Limitations

**Cannot Replace Human Judgment**
- Technical accuracy of complex explanations
- Appropriate level of detail for audience
- Trade-offs between depth and clarity

**Requires Project Context**
- Initial setup requires understanding project structure
- Drift detector needs training on project patterns
- Standards must be defined per project

**CI/CD Token Limits**
- Claude API calls cost money
- Rate limits in CI/CD pipelines
- Balance automation with cost

**Not a Silver Bullet**
- Documentation culture still required
- Team must value documentation
- Tools enable, don't replace, discipline

## Advanced Patterns

### Pattern: Documentation-Driven Development

```bash
# 1. Write documentation first (design phase)
/create-doc docs/guides/new-feature.md

# 2. Review design through documentation lens
/review-docs docs/guides/new-feature.md

# 3. Implement feature to match documentation
# (code goes here)

# 4. Validate examples work
/validate-examples docs/guides/new-feature.md

# 5. Documentation already done!
```

**Benefits**: Better API design, clear requirements, documentation never lags.

### Pattern: Documentation Pair Programming

```bash
# Developer A: Makes code changes
git checkout -b feature/new-cache

# Developer B: Updates documentation in parallel
/check-doc-drift --watch feature/new-cache

# As code changes, drift detector alerts
# Developer B updates docs immediately

# End of feature: docs and code in sync
```

**Benefits**: No documentation debt, shared understanding, better collaboration.

### Pattern: Quarterly Documentation Sprints

```bash
# Beginning of quarter
/check-doc-health --full

# Creates backlog of improvements:
# - 15 TODO markers unresolved
# - 8 undocumented features
# - 4 outdated guides
# - 12 opportunities for tutorials

# Assign to team, tackle over quarter
# Each PR includes both code and docs

# End of quarter: comprehensive documentation
/check-doc-health --full  # All green
```

**Benefits**: Dedicated time for documentation, steady progress, complete coverage.

### Pattern: Documentation as QA Gate

```bash
# Before feature marked "done"
/validate-feature-docs feature-name

# Checks:
# - Feature documented
# - Examples tested
# - Integration guide exists
# - Migration guide (if needed)
# - API reference updated

# Feature not done until docs pass
```

**Benefits**: Documentation treated as first-class artifact, no shipping without docs.

## Next Steps

### Getting Started (First 30 Minutes)

1. **Install the integration**
   ```bash
   # Via bootstrap or manual copy
   ```

2. **Try a command**
   ```bash
   /check-doc-health
   ```

3. **Review output**
   - What issues were found?
   - Are they actionable?
   - Do results make sense?

4. **Fix one issue**
   - Pick simplest issue from report
   - Use commands to fix
   - Validate fix worked

5. **Commit changes**
   ```bash
   git add .claude/ docs/
   git commit -m "Add Claude Code documentation integration"
   ```

### First Week Goals

- [ ] Run all commands to understand capabilities
- [ ] Customize drift detector for your project
- [ ] Set up pre-commit hook for link checking
- [ ] Add documentation validation to CI/CD
- [ ] Train team on available commands

### First Month Goals

- [ ] Establish documentation review process
- [ ] Create project-specific commands
- [ ] Measure documentation health over time
- [ ] Integrate with PR review workflow
- [ ] Document your documentation workflow (meta!)

### Ongoing

- [ ] Monitor drift detection alerts
- [ ] Review documentation health weekly
- [ ] Update standards as project evolves
- [ ] Share successful patterns with team
- [ ] Contribute improvements back to template

## Resources

### Documentation

- [Slash Commands Reference](/Users/tnez/Desktop/claude-setup-files/commands/)
- [Agent Reference](/Users/tnez/Desktop/claude-setup-files/agents/)
- [Output Styles](/Users/tnez/Desktop/output-styles.md)
- [Validation Scripts](/Users/tnez/Desktop/validation-scripts.md)

### Examples

- [JavaScript Project Example](/Users/tnez/Desktop/claude-setup-files/examples/javascript/)
- [Python Project Example](/Users/tnez/Desktop/claude-setup-files/examples/python/)
- [Rust Project Example](/Users/tnez/Desktop/claude-setup-files/examples/rust/)

### Support

- Template Repository: https://github.com/user/project-docs-template
- Issues: https://github.com/user/project-docs-template/issues
- Discussions: https://github.com/user/project-docs-template/discussions

## Version

Integration Version: 1.0.0
Template Version: 1.0.0
Last Updated: 2025-10-11
