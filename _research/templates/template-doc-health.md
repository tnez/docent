# Template: Documentation Health

## Overview

This document provides the template for "Documentation Health" meta-documentation. It defines how to maintain, review, and improve documentation over time to prevent documentation drift and decay.

---

## Template Structure

### Frontmatter

```yaml
---
title: Documentation Health
description: Maintaining and improving documentation quality over time
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: all contributors
related:
  - contributing/documentation.md
  - code-review.md
---
```

### Document Outline

```markdown
# Documentation Health

> **Purpose**: This document defines how we maintain documentation quality in {{PROJECT_NAME}}. Documentation, like code, requires ongoing maintenance to remain useful. This guide explains how to keep our docs current, accurate, and helpful.

---

## Table of Contents

1. [Documentation Philosophy](#documentation-philosophy)
2. [Signs Documentation Needs Updating](#signs-documentation-needs-updating)
3. [Documentation Review Schedule](#documentation-review-schedule)
4. [Drift Detection Methods](#drift-detection-methods)
5. [Ownership and Maintenance](#ownership-and-maintenance)
6. [Documentation in PR Process](#documentation-in-pr-process)
7. [Coverage Metrics](#coverage-metrics)
8. [Improvement Process](#improvement-process)
9. [Automation and Tooling](#automation-and-tooling)
10. [Quarterly Health Check](#quarterly-health-check)

---

## Documentation Philosophy

### Living Documentation

Our documentation is **living** - it evolves with the codebase and project. Documentation is never "done."

**Key Beliefs**:

1. **Documentation is code** - Version controlled, reviewed, tested, deployed
2. **Documentation debt is real** - Outdated docs are worse than no docs
3. **Everyone maintains docs** - Not just dedicated writers
4. **Documentation quality matters** - Bad docs create confusion and slow progress
5. **Small updates are better than perfect rewrites** - Incremental improvement works

### Documentation vs Code Sync

**The Goal**: Documentation and code should always reflect each other.

**The Reality**: They drift apart unless actively maintained.

**Our Approach**: Make documentation maintenance part of the development process, not a separate activity.

---

## Signs Documentation Needs Updating

### Critical Signs (Fix Immediately)

These indicate documentation is actively harmful:

- **Incorrect instructions** - Steps don't work as written
- **Broken links** - Links return 404 or point to wrong content
- **Obsolete commands** - Commands have changed or been removed
- **Security issues** - Documented approaches have known vulnerabilities
- **Deprecated features** - Documentation for removed features

**Action**: Fix immediately, same urgency as a production bug.

### Warning Signs (Fix Within Week)

These indicate documentation is becoming stale:

- **Outdated examples** - Code examples use old APIs or patterns
- **Missing new features** - Recent additions not documented
- **Confusing explanations** - Multiple people ask same questions
- **Incomplete information** - Important details missing
- **Inconsistent terminology** - Same concept called different names

**Action**: Create issue, prioritize in current sprint.

### Improvement Opportunities (Fix When Convenient)

These indicate documentation could be better:

- **Could be clearer** - Explanations are correct but hard to understand
- **Could be more complete** - Basic info present but missing advanced topics
- **Could be better organized** - Information is there but hard to find
- **Could have better examples** - Examples are minimal or not practical

**Action**: Create issue, schedule for future sprint.

---

## Documentation Review Schedule

### Continuous Review (Every PR)

**Who**: PR author and reviewers

**What**: Documentation affected by code changes

**Checklist**:
- [ ] New features documented
- [ ] Changed behavior updated in docs
- [ ] Examples still work
- [ ] Links still valid
- [ ] Related docs updated

See [Documentation in PR Process](#documentation-in-pr-process) below.

### Monthly Review

[TODO: Assign monthly documentation review responsibility]

**Who**: {{MONTHLY_REVIEWER_ROLE}}

**What**: High-traffic documentation

**Focus On**:
- Getting started guides
- Most-viewed docs (check analytics)
- Recently changed areas of code

**Time**: {{MONTHLY_REVIEW_TIME}}

**Output**: List of issues created for problems found

### Quarterly Review

[TODO: Assign quarterly documentation review responsibility]

**Who**: {{QUARTERLY_REVIEWER_ROLE}}

**What**: Complete documentation set

**Focus On**:
- Architecture documentation
- Design decision records
- Testing guides
- Contributing guides
- All core documentation

**Time**: {{QUARTERLY_REVIEW_TIME}}

**Output**:
- Documentation health report
- Prioritized improvement backlog
- Quarterly documentation goals

### Annual Review

[TODO: Assign annual documentation review responsibility]

**Who**: {{ANNUAL_REVIEWER_ROLE}}

**What**: Documentation strategy

**Focus On**:
- Overall documentation structure
- Documentation tooling
- Process effectiveness
- Major gaps or redundancies

**Time**: {{ANNUAL_REVIEW_TIME}}

**Output**:
- Strategic documentation roadmap
- Tooling and process improvements
- Major documentation initiatives

---

## Drift Detection Methods

### Manual Detection

**During Development**:
- Read related docs before making changes
- Note inaccuracies while working
- Check if examples still work

**During PR Review**:
- Review documentation changes
- Verify examples are tested
- Check for related docs that need updates

**During Support**:
- Note when questions indicate doc gaps
- Track repeated questions (FAQ candidates)
- Observe where users get confused

### Automated Detection

[TODO: Document automated drift detection if implemented]

#### Link Checking

**Tool**: {{LINK_CHECKER_TOOL}}

**Frequency**: {{LINK_CHECK_FREQUENCY}}

**Action**: Fix broken links within {{FIX_TIME}}

```bash
# Run link checker
{{LINK_CHECK_COMMAND}}
```

#### Example Testing

**Tool**: {{EXAMPLE_TEST_TOOL}}

**Frequency**: Every CI run

**What**: Extract code examples from docs and test them

```bash
# Test code examples
{{EXAMPLE_TEST_COMMAND}}
```

#### Outdated Content Detection

**Tool**: {{DRIFT_DETECTION_TOOL}}

**Frequency**: {{DRIFT_CHECK_FREQUENCY}}

**What**:
- Find docs not updated in > {{STALE_THRESHOLD}}
- Find docs referencing deprecated code
- Find undocumented public APIs

```bash
# Check for outdated docs
{{DRIFT_CHECK_COMMAND}}
```

### Analytics-Based Detection

[TODO: If you track documentation analytics, document it]

**Tool**: {{ANALYTICS_TOOL}}

**Metrics Tracked**:
- Page views
- Time on page
- Bounce rate
- Search queries
- "Was this helpful?" feedback

**How to Use**:
- High bounce rate → content doesn't match expectations
- Long time on page → content is complex or confusing
- Search queries → topics we should document

---

## Ownership and Maintenance

### Documentation Owners

[TODO: Define documentation ownership model]

**Ownership Model**: {{OWNERSHIP_MODEL}}

**Options**:

#### Option 1: Area-Based Ownership

Each documentation area has an owner:

| Documentation Area | Owner | Backup |
|--------------------|-------|--------|
| Getting Started | {{OWNER}} | {{BACKUP}} |
| Architecture | {{OWNER}} | {{BACKUP}} |
| API Reference | {{OWNER}} | {{BACKUP}} |
| Contributing | {{OWNER}} | {{BACKUP}} |
| Testing | {{OWNER}} | {{BACKUP}} |

**Owner Responsibilities**:
- Review doc changes in their area
- Perform scheduled reviews
- Triage doc improvement issues
- Maintain doc quality

#### Option 2: Collective Ownership

Everyone owns documentation:

- Author of code update is responsible for doc updates
- Reviewers verify documentation changes
- Anyone can improve any docs
- Documentation issues triaged like code issues

**This Works If**:
- Documentation is part of definition of done
- PR template includes documentation checklist
- Team culture values documentation

### Documentation Steward

[TODO: Assign overall documentation steward if applicable]

**Role**: {{DOC_STEWARD_ROLE}}

**Responsibilities**:
- Ensure documentation reviews happen
- Track documentation health metrics
- Prioritize documentation improvements
- Advocate for documentation quality
- Run quarterly health checks

**Not Responsible For**:
- Writing all documentation (collective responsibility)
- Knowing all details (domain experts own content)

---

## Documentation in PR Process

### PR Template Documentation Section

[TODO: Ensure your PR template includes documentation section]

Our PR template includes:

```markdown
## Documentation

- [ ] New features documented
- [ ] Changed behavior updated
- [ ] Examples added/updated
- [ ] API reference updated (if applicable)
- [ ] Migration guide provided (if breaking change)
- [ ] Related docs updated

**Documentation Changes**: (list files changed)

**N/A Reason**: (if no doc changes needed)
```

### When Documentation Is Required

[TODO: Define when documentation is mandatory]

Documentation updates are **required** for:

- [ ] New features
- [ ] Changes to existing features
- [ ] API changes (additions, modifications, deprecations)
- [ ] Breaking changes
- [ ] Configuration changes
- [ ] Deployment process changes
- [ ] Development environment changes

Documentation updates are **optional** for:

- [ ] Internal refactoring (no behavior change)
- [ ] Bug fixes (behavior now matches docs)
- [ ] Test-only changes
- [ ] Build system changes

### Documentation Review Checklist

Reviewers check:

**Accuracy**:
- [ ] Instructions actually work
- [ ] Examples are correct
- [ ] Code snippets are tested

**Completeness**:
- [ ] All new functionality documented
- [ ] Edge cases mentioned
- [ ] Error handling documented

**Clarity**:
- [ ] Explanations are clear
- [ ] Examples are helpful
- [ ] Terminology is consistent

**Discoverability**:
- [ ] New docs linked from appropriate places
- [ ] Table of contents updated
- [ ] Related docs cross-referenced

---

## Coverage Metrics

### What We Measure

[TODO: Define documentation coverage metrics]

#### API Documentation Coverage

**Metric**: Percentage of public APIs documented

**Target**: {{API_DOC_TARGET}}%

**How to Measure**: {{API_DOC_MEASUREMENT}}

```bash
# Check API documentation coverage
{{API_DOC_COVERAGE_COMMAND}}
```

#### Feature Documentation Coverage

**Metric**: Percentage of features with documentation

**Target**: {{FEATURE_DOC_TARGET}}%

**How to Measure**: Manual review or feature tracking system

#### Guide Coverage

**Metric**: Common tasks have how-to guides

**Target**: {{GUIDE_COVERAGE_TARGET}} most common tasks documented

**How to Measure**: Support question frequency analysis

### Documentation Freshness

**Metric**: Age of documentation

**Target**:
- Core docs reviewed every {{CORE_DOC_FRESHNESS}}
- API docs updated with code changes
- Examples tested on every release

**How to Measure**:
- Last updated date in frontmatter
- Git history of doc files

### Documentation Quality

**Metric**: User satisfaction with documentation

**Target**: {{DOC_SATISFACTION_TARGET}}% satisfied

**How to Measure**:
- "Was this helpful?" feedback
- Support ticket reduction
- Onboarding feedback

---

## Improvement Process

### Identifying Improvements

**Sources**:
1. **User feedback** - "Was this helpful?" responses, support questions
2. **Analytics** - High bounce rate, low time on page
3. **Scheduled reviews** - Monthly/quarterly reviews
4. **Team observations** - Confusion during onboarding, repeated questions

### Prioritizing Improvements

[TODO: Define prioritization framework]

**Priority Levels**:

**P0 - Critical (Fix Immediately)**:
- Incorrect instructions
- Broken critical paths
- Security issues

**P1 - Important (Fix This Sprint)**:
- High-traffic page issues
- Blocking new user onboarding
- Repeated support questions

**P2 - Normal (Fix Next Sprint)**:
- Medium-traffic page issues
- Incomplete documentation
- Missing examples

**P3 - Nice to Have (Backlog)**:
- Clarity improvements
- Additional examples
- Advanced topics

### Making Improvements

**Process**:
1. **Create issue** - Document the problem
2. **Assign owner** - Area owner or volunteer
3. **Implement fix** - Update documentation
4. **Get review** - PR review like code
5. **Deploy** - Merge and publish
6. **Verify** - Confirm issue resolved

**Don't Wait for Perfect**:
- Small improvements beat perfect rewrites
- Fix what you can, file issues for rest
- Incremental progress compounds

---

## Automation and Tooling

### Documentation CI/CD

[TODO: Document your documentation CI/CD pipeline]

Our documentation pipeline:

```yaml
# .github/workflows/docs.yml

on:
  pull_request:
    paths: ['docs/**']
  push:
    branches: [{{MAIN_BRANCH}}]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check links
        run: {{LINK_CHECK_COMMAND}}

      - name: Lint prose
        run: {{PROSE_LINT_COMMAND}}

      - name: Test examples
        run: {{EXAMPLE_TEST_COMMAND}}

      - name: Build docs
        run: {{DOC_BUILD_COMMAND}}

  deploy:
    needs: test
    if: github.ref == 'refs/heads/{{MAIN_BRANCH}}'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy docs
        run: {{DOC_DEPLOY_COMMAND}}
```

### Tools We Use

[TODO: Document documentation tools]

| Tool | Purpose | Configuration |
|------|---------|---------------|
| {{TOOL_1}} | {{PURPOSE}} | {{CONFIG_FILE}} |
| {{TOOL_2}} | {{PURPOSE}} | {{CONFIG_FILE}} |
| {{TOOL_3}} | {{PURPOSE}} | {{CONFIG_FILE}} |

### Linting and Style

**Prose Linting**: {{PROSE_LINTER}}

Configuration: `{{PROSE_LINTER_CONFIG}}`

Rules:
- Writing style (active voice, present tense)
- Inclusive language
- Terminology consistency
- Reading level

**Markdown Linting**: {{MARKDOWN_LINTER}}

Configuration: `{{MARKDOWN_LINTER_CONFIG}}`

Rules:
- Consistent formatting
- Proper heading hierarchy
- Link formats

---

## Quarterly Health Check

[TODO: Create quarterly review template]

### Health Check Template

Every {{REVIEW_FREQUENCY}}, perform this health check:

#### 1. Documentation Completeness

- [ ] All public APIs documented
- [ ] All features have guides
- [ ] Getting started guide is current
- [ ] Architecture docs reflect reality
- [ ] Contributing guide is up to date

**Issues Found**: {{LIST_ISSUES}}

#### 2. Documentation Accuracy

- [ ] All links work
- [ ] All examples run successfully
- [ ] Commands and configs are correct
- [ ] No references to deprecated features
- [ ] No contradictions between docs

**Issues Found**: {{LIST_ISSUES}}

#### 3. Documentation Quality

- [ ] Explanations are clear
- [ ] Examples are helpful
- [ ] Organization makes sense
- [ ] Search works well
- [ ] No major user complaints

**Issues Found**: {{LIST_ISSUES}}

#### 4. Documentation Maintenance

- [ ] Review schedule being followed
- [ ] Doc updates in recent PRs
- [ ] Automation running successfully
- [ ] Coverage metrics meeting targets
- [ ] Owner roles are working

**Issues Found**: {{LIST_ISSUES}}

### Health Report

**Overall Health**: {{HEALTHY | NEEDS_ATTENTION | UNHEALTHY}}

**Strengths**: {{LIST_WHAT_IS_WORKING_WELL}}

**Weaknesses**: {{LIST_WHAT_NEEDS_IMPROVEMENT}}

**Priorities for Next Quarter**:
1. {{PRIORITY_1}}
2. {{PRIORITY_2}}
3. {{PRIORITY_3}}

**Action Items**:
- [ ] {{ACTION_1}} - Owner: {{OWNER}}, Due: {{DATE}}
- [ ] {{ACTION_2}} - Owner: {{OWNER}}, Due: {{DATE}}
- [ ] {{ACTION_3}} - Owner: {{OWNER}}, Due: {{DATE}}

---

## Emergency Documentation Updates

### When Code Ships Without Docs

Sometimes code ships without complete documentation. This is not ideal, but reality.

**When This Happens**:

1. **Acknowledge it** - Create issue immediately
2. **Add basic info** - Document enough to unblock users
3. **Schedule completion** - Prioritize proper documentation
4. **Learn from it** - Why did this happen? How to prevent?

**Emergency Doc Template**:

```markdown
# {{FEATURE_NAME}} (Preliminary Documentation)

⚠️ **Note**: This is preliminary documentation. More complete docs coming soon.
See issue #{{ISSUE_NUMBER}}.

## Basic Usage

[Minimal usage example]

## Known Limitations

[What's not yet documented]

## Questions?

[Where to ask for help]
```

### Post-Release Documentation

**Process**:
1. Ship minimal documentation with feature
2. Create detailed documentation issue
3. Complete documentation within {{TIME_FRAME}}
4. Remove "preliminary" tag
5. Announce updated docs

---

## Documentation Anti-Patterns

### Anti-Pattern: Documentation as Afterthought

**Problem**: Writing documentation after feature is "done"

**Why Bad**:
- Documentation often never happens
- Important details forgotten
- Implementation bias in explanations

**Instead**: Document while developing or before

---

### Anti-Pattern: Duplicate Documentation

**Problem**: Same information in multiple places

**Why Bad**:
- Inconsistencies between copies
- Multiple places to update
- Confusion about which is correct

**Instead**: Single source of truth, cross-reference

---

### Anti-Pattern: Over-Documenting Implementation

**Problem**: Documenting every detail of how code works

**Why Bad**:
- Docs break when implementation changes
- Overwhelming amount of information
- High maintenance burden

**Instead**: Document behavior and usage, not implementation

---

### Anti-Pattern: Under-Documenting Why

**Problem**: Documenting what and how, but not why

**Why Bad**:
- Future changes may undo important decisions
- Context lost over time
- Hard to evaluate alternatives

**Instead**: Explain rationale and trade-offs

---

## Related Documentation

- [Contributing: Documentation](./contributing/documentation.md) - How to write docs
- [Code Review Practices](./code-review.md) - Reviewing doc changes
- [How We Write Software](./writing-software.md) - Documentation strategy

---

## Customization Checklist

When adapting this template:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Define documentation review schedule
- [ ] Assign documentation owners/stewards
- [ ] Set up automated drift detection
- [ ] Define coverage metrics and targets
- [ ] Document CI/CD pipeline for docs
- [ ] List documentation tools and configuration
- [ ] Create quarterly health check schedule
- [ ] Define prioritization framework
- [ ] Add project-specific anti-patterns

---

## Meta: This Document's Health

**Last Full Review**: {{LAST_REVIEW_DATE}}

**Next Scheduled Review**: {{NEXT_REVIEW_DATE}}

**Owner**: {{OWNER}}

**Known Issues**:
- {{ISSUE_1}}
- {{ISSUE_2}}

**Planned Improvements**:
- {{IMPROVEMENT_1}}
- {{IMPROVEMENT_2}}

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*

*Practice what we preach: This document follows its own guidelines for maintenance.*
