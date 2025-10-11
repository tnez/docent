# Claude Code Integration Files

## Overview

This directory contains ready-to-use Claude Code integration files for documentation maintenance. Copy these files to your project's `.claude/` directory to enable documentation-focused workflows.

## Quick Installation

### Option 1: Install Everything

```bash
# From your project root
cp -r claude-setup-files/commands/* ./.claude/commands/
cp -r claude-setup-files/agents/* ./.claude/agents/
```

### Option 2: Install Selectively

```bash
# Just drift detection
cp claude-setup-files/commands/check-doc-drift.md ./.claude/commands/
cp claude-setup-files/agents/drift-detector.md ./.claude/agents/

# Just documentation review
cp claude-setup-files/commands/review-docs.md ./.claude/commands/
cp claude-setup-files/agents/doc-reviewer.md ./.claude/agents/

# Just example validation
cp claude-setup-files/commands/validate-examples.md ./.claude/commands/
cp claude-setup-files/agents/example-tester.md ./.claude/agents/
```

## What's Included

### Commands (/slash-commands)

Located in `commands/` directory:

1. **check-doc-drift.md** - Detect documentation out of sync with code
2. **validate-examples.md** - Test code examples in documentation
3. **review-docs.md** - Review documentation quality
4. **update-doc.md** - Update specific documentation file
5. **fix-links.md** - Find and fix broken links
6. **check-doc-health.md** - Comprehensive documentation health check
7. **validate-onboarding.md** - Validate onboarding documentation
8. **check-coverage.md** - Measure documentation coverage

### Agents (Specialized Assistants)

Located in `agents/` directory:

1. **drift-detector.md** - Specialized in detecting documentation drift
2. **doc-reviewer.md** - Multi-perspective documentation review
3. **example-tester.md** - Code example validation expert
4. **standards-enforcer.md** - Documentation standards compliance
5. **onboarding-validator.md** - Onboarding experience validator

## Usage

After installation, use commands in Claude Code:

```bash
# Check for documentation drift
/check-doc-drift

# Review specific documentation
/review-docs docs/guides/setup.md

# Validate all code examples
/validate-examples

# Check overall documentation health
/check-doc-health

# Fix broken links
/fix-links

# Update specific doc after code changes
/update-doc docs/reference/api.md

# Validate onboarding experience
/validate-onboarding

# Check documentation coverage
/check-coverage
```

## Customization

These files are templates. Customize them for your project:

### 1. Configure Drift Detector

Edit `.claude/agents/drift-detector.md` to add project-specific patterns:

```markdown
## Project-Specific Drift Signals

**API Changes:**
- Files: src/api/routes/*.ts
- Affects: docs/reference/api/*.md
- Keywords: "route", "endpoint", "handler"

**Configuration Changes:**
- Files: config/*.schema.ts
- Affects: docs/reference/configuration.md
- Detection: Schema field changes
```

### 2. Set Documentation Standards

Edit `.claude/agents/standards-enforcer.md` to define your standards:

```markdown
## Project Standards

**Required Frontmatter:**
- title
- description
- last_updated
- owner

**Code Block Requirements:**
- Language always specified
- Runnable examples only (no pseudocode)
```

### 3. Add Custom Commands

Create new commands in `.claude/commands/`:

```markdown
---
description: Your custom documentation command
---

1. Step 1 of your workflow
2. Step 2 of your workflow
...
```

## Integration with CI/CD

See `validation-scripts.md` for scripts that run in CI/CD pipelines alongside these commands.

## Dependencies

These commands work with:
- Claude Code CLI (required)
- Git (for drift detection)
- Node.js, Python, etc. (for example validation, optional)
- Vale (for prose linting, optional)

## Troubleshooting

**Command not found:**
- Ensure files are in `.claude/commands/` directory
- Check file names match command names
- Restart Claude Code if needed

**Agent errors:**
- Ensure agents are in `.claude/agents/` directory
- Check agent prompt syntax
- Review agent tool requirements

**Slow performance:**
- Use `--scope` flags to limit file sets
- Skip external link checking with `--internal-only`
- Run comprehensive checks weekly, quick checks on PRs

## Support

- Full Documentation: See `claude-integration-overview.md`
- Output Styles: See `output-styles.md`
- Validation Scripts: See `validation-scripts.md`
- Issues: [GitHub Issues](https://github.com/user/project-docs-template/issues)

## Version

Integration Version: 1.0.0
Last Updated: 2025-10-11
