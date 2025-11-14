# ADR-0007: Skills-Based Architecture

**Status:** Accepted
**Date:** 2025-01-13
**Deciders:** @tnez
**References:** [Issue #14](https://github.com/tnez/docent/issues/14)

---

## Context

Docent currently organizes agent capabilities into three distinct concepts:

1. **Runbooks** - Procedural task guides (git-commit, health-check, bootstrap)
2. **Templates** - Documentation scaffolds (ADR, RFC, journal)
3. **MCP Tools** - Four explicit entry points (`start`, `ask`, `act`, `tell`)

This structure creates several friction points:

### Discovery Burden

Agents must know exact runbook names to invoke them:

```typescript
// Agent must map user intent → exact name
"run a health check" → docent:act "health-check"
```

No semantic discovery - if the agent doesn't know the precise name, it can't find the runbook.

### API Complexity

Four tools with different purposes creates cognitive overhead:

- When to use `ask` vs `act`?
- How do templates relate to `tell`?
- Why is `start` separate from `ask`?

The mental model requires understanding three resource types and four tools.

### Misalignment with Industry Patterns

Anthropic published a skills pattern that solves similar problems:

- **Progressive disclosure** - Metadata first, full content on-demand
- **Semantic discovery** - Natural language triggers, not exact names
- **Unified format** - `SKILL.md` with YAML frontmatter
- **Directory organization** - Group skills by domain/topic

Docent's current structure predates this pattern and doesn't align with it.

### Artificial Separation

Runbooks and templates serve similar purposes (guide agent workflows) but are treated as separate concepts with different APIs:

- Runbooks → accessed via `act` tool
- Templates → accessed via `tell` tool (with agent-driven classification)

This separation adds complexity without clear benefit.

### Forces at Play

**In favor of change:**

- Simpler mental model (one concept: skills)
- Better discovery (semantic matching, not exact names)
- Industry alignment (compatible with Anthropic's pattern)
- Explicit control (users choose which skill groups to enable)
- Smaller context (only opted-in skills loaded)

**Against change:**

- Breaking changes (config, directory structure, API)
- Migration required for existing projects
- Implementation effort (4-5 days)
- Learning curve for existing users

**The Decision Point:**

If skills provide better discovery, simpler mental model, and industry alignment, the migration cost is justified for a v1.0 breaking release.

---

## Decision

**Adopt a skills-based architecture with ask/tell API paradigm.**

### What This Means

#### 1. Unified Resource Model: Skills

Merge runbooks and templates into a single **skills** concept using Anthropic's `SKILL.md` format:

```
src/skills/                    # Bundled with docent
├── docent/
│   ├── bootstrap/SKILL.md
│   ├── migrate/SKILL.md       # Self-service upgrade
│   └── session/SKILL.md
├── git/
│   └── commit/SKILL.md
├── github/
│   ├── issue/SKILL.md
│   └── pull-request/SKILL.md
└── project/
    └── health-check/SKILL.md

.docent/skills/                # Project-local
├── custom/
│   └── deploy/SKILL.md
└── git/
    └── commit/SKILL.md        # Overrides bundled
```

**Skill format:**

```yaml
---
name: git-commit
description: |
  Create conventional commits with proper staging and verification.
  Use when: "commit changes", "create commit", "git commit"
---

# Git Commit Skill

Instructions for creating commits...
```

#### 2. Simplified API

**Before:**

- `docent:start` - List resources
- `docent:ask` - Search docs
- `docent:act` - Execute runbooks (by exact name)
- `docent:tell` - Create docs (agent classifies template)

**After:**

- `docent:start` - List enabled skills (grouped by domain)
- `docent:ask` - Search docs + discover applicable skills
- `docent:tell` - Create docs (discovers doc-creation skills)
- ~~`docent:act`~~ - Removed (discovery via `ask`)

#### 3. Glob-Based Skill Configuration

Config version tracking + explicit skill opt-in:

```yaml
# .docent/config.yaml
version: "1.0.0"              # Track schema version

skills:
  - docent/*                  # All docent skills
  - git/*                     # All git skills
  - github/*                  # All github skills
  - !github/pull-request      # Explicit opt-out
  - custom/*                  # Local project skills

searchPaths:
  - ./.docent
```

**Glob semantics:**

- `docent/*` - All skills in `docent/` directory
- `!github/pull-request` - Negation (exclude this one)
- Patterns match directory paths (e.g., `git/commit`)

#### 4. Merge Semantics

Bundled skills (`src/skills/`) + local skills (`.docent/skills/`) combine:

1. Load bundled skills matching glob patterns
2. Load local skills matching glob patterns
3. If paths match (e.g., `git/commit`), **local overrides bundled entirely**
4. Result: Combined skill registry with local precedence

#### 5. Skill Discovery in `ask` Tool

```typescript
// Enhanced ask tool
async function ask(args, server) {
  const docResults = await searchDocumentation(args.query, ...)
  const skills = await findMatchingSkills(args.query, registry)

  return {
    documentation: docResults,
    applicableSkills: skills.map(s => ({
      path: s.path,
      description: s.description,
      matchScore: s.score
    }))
  }
}
```

**Discovery algorithm (v1.0):**

- Extract keywords from user query
- Match against skill descriptions
- Rank by keyword overlap + description relevance
- Return top 3-5 matches with confidence scores

**Future:** Could enhance with embeddings or LLM-based classification

#### 6. Self-Service Migration Skill

Create `docent/migrate` skill to handle v0.9 → v1.0 upgrades:

```yaml
---
name: migrate
description: |
  Migrate docent project to v1.0 schema. Converts runbooks→skills,
  templates→doc skills, updates config. Idempotent and safe to re-run.
  Use when: "migrate docent", "upgrade docent", "update to v1.0"
---
```

**Migration process:**

1. Detect current version from config
2. Create backup: `.docent/.backup-{timestamp}/`
3. Convert `.docent/runbooks/*.md` → `.docent/skills/{group}/{name}/SKILL.md`
4. Convert `.docent/templates/*.md` → `.docent/skills/docent/create-{name}/SKILL.md`
5. Update `config.yaml` with `version: "1.0.0"` and skill patterns
6. Report summary, offer to archive old directories

---

## Consequences

### Positive

- **Simpler mental model** - One concept (skills) instead of three (runbooks, templates, tools)
- **Better discovery** - Natural language queries find skills semantically
- **Industry alignment** - Compatible with Anthropic's `SKILL.md` pattern
- **Explicit control** - Users opt-in to skill groups, smaller context
- **Self-documenting upgrades** - Migration is itself a docent skill
- **Extensible** - Easy to add new skill groups by domain
- **Local customization** - Override bundled skills or add custom ones

### Negative

- **Breaking changes** - Config format, directory structure, API
- **Migration required** - Existing projects need upgrade (via migration skill)
- **Implementation effort** - 4-5 full days of development
- **Learning curve** - Users must understand new skill model

### Neutral

- **Still agent-driven** - Skills provide instructions, agents execute
- **Same delegation pattern** - Docent doesn't execute, it guides
- **Local-only** - No external dependencies or API calls
- **MCP-based** - Architecture unchanged (still MCP server)

---

## Alternatives Considered

### Alternative 1: Keep Current Structure (No Change)

**Description:** Maintain runbooks, templates, and 4-tool API

**Pros:**

- No breaking changes
- No migration needed
- Users already familiar
- Works today

**Cons:**

- Discovery burden remains (exact names required)
- Complexity persists (three concepts, four tools)
- Misaligned with industry (Anthropic skills)
- Harder to explain value proposition

**Why not chosen:** Technical debt compounds. Skills model is objectively simpler and better for discovery.

### Alternative 2: Enhance Discovery Without Breaking Changes

**Description:** Add semantic discovery to `act` tool, keep runbooks/templates separate

**Pros:**

- Backward compatible
- Incremental improvement
- Lower implementation risk
- No user migration

**Cons:**

- Doesn't address conceptual complexity
- Still three resource types
- Missed opportunity for alignment
- Half-measure solution

**Why not chosen:** Solves one problem (discovery) but misses the bigger win (unified model). If we're making discovery better, commit to the cleaner architecture.

### Alternative 3: Skills Without Glob Configuration

**Description:** Adopt skills but load all bundled skills automatically (no opt-in)

**Pros:**

- Simpler config (no skills array)
- No explicit selection needed
- Works out of box

**Cons:**

- Larger context (all skills always loaded)
- No user control over capabilities
- Can't exclude unwanted skills
- Misses progressive disclosure benefit

**Why not chosen:** Glob patterns give users control and reduce context. Small config cost for significant benefit.

### Alternative 4: Use Anthropic's Directory Structure

**Description:** Use `.claude/skills/` instead of `.docent/skills/`

**Pros:**

- Matches Anthropic exactly
- Could share skills with Claude Code
- Industry standard location

**Cons:**

- Confusing for docent-specific skills
- `.claude/` implies Claude-only (not agent-agnostic)
- Mixing docent config with agent config
- Docent should own `.docent/` namespace

**Why not chosen:** Docent is agent-agnostic (ADR-0003). Using `.docent/` is clearer and maintains independence.

---

## Implementation Plan

### Phase 1: Version Tracking (2-3 hours)

- Add `version` field to `DocentConfig` interface
- Update config schema and validation
- Bootstrap creates `version: "1.0.0"` in new projects
- Export `CURRENT_VERSION` constant

### Phase 2: Migration Skill (4-6 hours)

- Create `src/skills/docent/migrate/SKILL.md`
- Write migration instructions (detect, backup, convert, update)
- Add co-located scripts for deterministic operations
- Test idempotency (safe to re-run)

### Phase 3: Skill Infrastructure (6-10 hours)

- Implement glob matcher with negation support
- Create `SkillLoader` (load bundled + local, merge by path)
- Create `SkillRegistry` (store, discover, query skills)
- Parse `SKILL.md` frontmatter (name, description)
- Group skills by directory hierarchy

### Phase 4: Tool Refactoring (6-8 hours)

- Update `start` tool: list enabled skills grouped by domain
- Update `ask` tool: search docs + discover skills
- Update `tell` tool: discover doc-creation skills
- Deprecate `act` tool: mark deprecated, keep for compat

### Phase 5: Bundled Content Migration (4-6 hours)

- Run migration on docent repo itself
- Convert `bundles/runbooks/*.md` → `src/skills/{group}/{name}/SKILL.md`
- Convert `bundles/templates/*.md` → `src/skills/docent/create-{name}/SKILL.md`
- Organize by domain (git, github, project, docent)
- Enhance descriptions with trigger keywords

### Phase 6: Bootstrap Enhancement (3-4 hours)

- Detect project type (Node.js, Go, Rust, etc.)
- Recommend relevant skill groups
- Generate config with smart defaults
- Allow customization before writing

### Phase 7: Testing & Documentation (4-6 hours)

- Unit tests: glob matcher, skill loader, discovery
- Integration tests: load skills from config, merge bundled+local
- Migration testing: v0.9 → v1.0 upgrade scenarios
- Documentation: README, ADR, migration guide
- Example configs for different project types

**Total estimated effort:** 29-43 hours (4-5 full days)

---

## Migration Path

### For Existing Projects

**Before (v0.9):**

```
.docent/
├── config.yaml
├── runbooks/
│   ├── git-commit.md
│   └── health-check.md
└── templates/
    └── adr.md
```

**After (v1.0):**

```
.docent/
├── config.yaml              # Updated with version + skills
├── skills/
│   ├── git/
│   │   └── commit/SKILL.md
│   ├── project/
│   │   └── health-check/SKILL.md
│   └── docent/
│       └── create-adr/SKILL.md
└── .backup-2025-01-13/      # Old directories archived
    ├── runbooks/
    └── templates/
```

**User workflow:**

```
User: "Upgrade my docent project to v1.0"

Agent: [calls docent:ask("upgrade docent")]
Docent: [discovers docent/migrate skill]
Agent: "I found the migration skill. This will:
  - Convert 5 runbooks → skills
  - Convert 3 templates → doc skills
  - Update config.yaml
  - Create backup

  Proceed? [y/n]"

User: "y"

Agent: [executes migration skill instructions]
Agent: "Migration complete! [shows summary]"
```

### For New Projects

```bash
# Configure MCP (unchanged)
{
  "mcpServers": {
    "docent": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@tnezdev/docent"]
    }
  }
}

# Bootstrap (now includes skill selection)
User: "Initialize docent"
Agent: [detects Node.js + GitHub project]
Agent: "Recommended skills: docent/*, git/*, github/*, project/*
       Include all? [y/n/customize]"
User: "customize"
Agent: "Which groups? [shows options]"
User: "All except github/pull-request"
Agent: [creates config with skills: [docent/*, git/*, github/*, !github/pull-request]]
```

---

## References

- [Issue #14: Adopt skills-based architecture](https://github.com/tnez/docent/issues/14)
- [ADR-0003: Agent-Agnostic Architecture](./adr-0003-agent-agnostic-architecture.md) - Still valid
- [ADR-0004: MCP-Only Architecture](./adr-0004-mcp-only-architecture.md) - Still valid (MCP server unchanged)
- [ADR-0005: Agent-Driven Template Classification](./adr-0005-agent-driven-template-classification.md) - Extended (now discovers doc-creation skills)
- Research: `~/Documents/RESOURCES/research--agentic-skills-pattern.md`
- Anthropic Skills: https://github.com/anthropics/anthropic-cookbook/tree/main/skills

---

## Reflection

Docent's journey:

1. **Templates-only** - Static markdown scaffolds
2. **CLI + MCP** - Commands and tool calling (ADR-0001)
3. **MCP-only** - Agent-first invisible infrastructure (ADR-0004)
4. **Skills-based** - Unified model with semantic discovery (this ADR)

**The key insight:** Runbooks and templates are both "instructions for agents" - the distinction is artificial. Skills unify the model and align with industry patterns.

**This is the right decision** because:

- Evidence-based (skills pattern proven by Anthropic)
- User-driven (discovery burden is real pain point)
- Simpler (one concept instead of three)
- Future-proof (compatible with emerging standards)

The migration cost is justified for a v1.0 breaking release that sets docent on a cleaner, more maintainable path.
