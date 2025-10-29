# Documentation Maintenance Learnings

**Date:** 2025-10-29
**Context:** Documentation audit after ask/act/tell architecture migration

## Key Lessons

### 1. Documentation Drift Happens Quickly

Even in projects that dogfood their own documentation tools, drift occurs rapidly after architectural changes. The migration to ask/act/tell paradigm left extensive outdated references throughout:

- Old tools: bootstrap, analyze, doctor, audit, list-templates, get-template, capture-work
- Old concepts: MCP resources (`docent://`), MCP prompts
- Outdated workflows and examples

**Takeaway:** After major architecture changes, plan time for comprehensive documentation review - don't assume incremental updates will catch everything.

### 2. Version Marketing Matters

Calling pre-1.0 software "Docent 2.0" was misleading since no one used prior versions. Version numbers should reflect actual user impact, not internal iterations.

**Takeaway:** For solo/early projects, focus on what the tool does rather than version hype. Save major version bumps for when they have user meaning.

### 3. Rewrites vs Incremental Edits

The MCP API reference (747 lines) was better served by a complete rewrite (383 lines) than surgical edits. When architecture changes are fundamental, clean slate > patches.

**Decision criteria for rewrites:**

- Majority of content is outdated
- Underlying concepts have changed
- Simpler to explain from scratch
- Opportunity to improve clarity

### 4. Documentation Surface Area is Large

Five major files needed updates after the architecture change:

1. README.md (root)
2. docs/README.md
3. docs/guides/mcp-setup.md
4. docs/guides/mcp-api-reference.md
5. docs/architecture/overview.md

**Takeaway:** Documentation maintenance burden grows with project maturity. Architecture changes have ripple effects across multiple doc files.

### 5. Pre-commit Hooks Provide Value

Markdown linting caught 20 formatting errors during commit:

- Missing blank lines around lists
- Fenced code block spacing
- Consistent formatting

Auto-fix capability saved manual correction work.

**Takeaway:** Invest in pre-commit hooks early. They catch consistency issues that are tedious to fix manually and prevent documentation quality degradation.

### 6. Natural Language is Core Differentiator

Throughout the documentation update, the emphasis was on docent's "conversation over commands" philosophy. This is what sets it apart from traditional CLI documentation tools.

**Takeaway:** Core differentiators should be emphasized consistently across all documentation. In docent's case: natural language interface, agent-first design, invisible infrastructure.

## Impact

- **Files changed:** 5
- **Lines added:** 681
- **Lines removed:** 1,037
- **Net reduction:** 356 lines (more concise, clearer docs)

## Related Work

- Commit: `5927d99` - docs: update all documentation to reflect current architecture
- Architecture: ask/act/tell paradigm (start, ask, act, tell tools)
- Version: 0.8.0 (pre-1.0)
