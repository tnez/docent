# ADR-0001: Build CLI Platform with Agent Protocol Instead of Templates-Only

**Status:** Superseded by [ADR-0004](./adr-0004-mcp-only-architecture.md)
**Date:** 2025-10-11
**Superseded:** 2025-10-13
**Deciders:** @tnez
**Technical Story:** Phase 3.9 Planning Discussion

## Context

Docket started as a collection of 11 production-ready documentation templates. During Phase 3.9 (dogfooding), a critical insight emerged: documentation initialization and maintenance are inherently **agentic tasks** that require:

- Analyzing codebase structure
- Asking contextual questions about the project
- Making customization decisions based on tech stack
- Detecting what's missing in documentation
- Suggesting what should be documented
- Keeping documentation synchronized with code changes

**Key Forces:**

1. **Templates alone are static** - Users must manually figure out what to document, how to customize templates, and when documentation is incomplete or stale.

2. **AI agents are ideal for documentation tasks** - They can analyze projects, ask questions, customize content, and detect drift. However, we can't couple to a specific agent (Claude Code, Cursor, etc.) due to:
   - Users have different agent preferences
   - Agent landscape is rapidly evolving
   - Vendor lock-in kills adoption and longevity

3. **User feedback** - During planning, the question "How will I use docket to inform agents about building features and maintain consistent standards?" revealed the templates didn't address this need.

4. **The "smart-init" insight** - User stated: "I think the `smart-init` is actually **critical** for using the product. We also need a _smart_ way to keep things maintained."

**The Core Problem:**
Documentation tasks are agentic, but coupling to any specific agent creates lock-in. We need a way to make docket work with ANY agent framework.

## Decision

Transform docket from "template collection" to a **complete documentation platform** with three components:

### 1. Smart CLI
Build command-line tools that intelligently analyze projects and documentation:

- **`docket analyze`** - Detect languages, frameworks, project structure
- **`docket init`** - Smart initialization with context-aware customization
- **`docket audit`** - Find documentation gaps (completeness scoring)
- **`docket review`** - Detect staleness and code/documentation drift

### 2. Agent-Agnostic Protocol
Create a protocol that any AI agent can use:

- All commands support `--output json` for structured data
- Comprehensive protocol documentation in `.docket-protocol/`
- JSON schemas for all command outputs
- No agent-specific features or integrations

### 3. Production Templates
Keep the 11 existing templates as the foundation, but make them smarter:

- Templates customized based on project analysis
- Context saved to `.docket/context.json` for agent use
- Templates filled in with project-specific placeholders

**Framework Choice:** Use oclif for CLI implementation (see ADR-0002)

## Consequences

### Positive

- **Agent-agnostic architecture** - Works with Claude Code, Cursor, Aider, and any future agent
- **Significantly more valuable** - Transforms from templates to a platform
- **Solves the real problem** - Documentation maintenance is now automated/assisted
- **Great for humans too** - CLI provides immediate value without any agent
- **No vendor lock-in** - Users choose their preferred agent
- **Broader adoption potential** - Appeals to both AI-assisted and traditional workflows
- **Creates network effects** - Any agent integration benefits all users

### Negative

- **Increased complexity** - Must build and maintain TypeScript codebase
- **More dependencies** - Node.js/npm required for CLI (templates were dependency-free)
- **Higher maintenance burden** - CLI needs updates as language/framework ecosystems evolve
- **Testing complexity** - Must test CLI commands, not just shell scripts
- **Breaking change** - Users who only wanted templates now have additional tooling
- **Delayed launch** - Building CLI pushed launch timeline by ~1 week

### Neutral

- **Still supports template-only usage** - Shell scripts remain for users who want just templates
- **Backward compatible** - Existing template structure unchanged
- **Adds ~3-4 days development time** - But validates product direction
- **npm package** - Requires publishing to npm registry

## Alternatives Considered

### Alternative 1: Build Claude Code Integration Only

**Description:** Build docket as a Claude Code plugin/extension with deep integration.

**Pros:**
- Fastest to build
- Richest integration possible
- Can use Claude Code APIs directly
- Immediate value for Claude Code users

**Cons:**
- Vendor lock-in - only works with Claude Code
- Smaller addressable market
- Risk if Claude Code changes or shuts down
- Alienates users of other agents
- No value for non-AI workflows

**Why not chosen:** Violates core principle of agent-agnostic design. Lock-in kills long-term viability.

### Alternative 2: Templates + Documentation Generator

**Description:** Keep templates static but build a separate documentation generator that analyzes projects and generates docs.

**Pros:**
- Clear separation of concerns
- Templates remain simple
- Generator can be sophisticated
- Can still output JSON for agents

**Cons:**
- Two separate products to maintain
- Confusing user experience (which to use?)
- Generator would need its own templates anyway
- Doesn't solve the "smart-init" problem
- Still no gap detection or drift monitoring

**Why not chosen:** Splitting into two products creates confusion and maintenance burden. Better to unify into one platform.

### Alternative 3: Templates + GitHub Actions

**Description:** Keep templates simple, provide GitHub Actions for automation (audit/review as CI).

**Pros:**
- Leverages existing CI/CD infrastructure
- Automatic documentation checks
- No local tooling required
- Works in any workflow

**Cons:**
- Only useful for GitHub users
- No local development value
- CI-only means no interactive experience
- Hard to customize per-project
- Doesn't help with initialization
- GitHub Actions have their own complexity

**Why not chosen:** Too narrow (GitHub-only), doesn't solve the core initialization and customization problems.

## Implementation Notes

### Architecture

```
docket/
├── templates/        # 11 markdown templates (existing)
├── scripts/          # Shell scripts (existing, kept for compatibility)
├── src/              # TypeScript CLI source
│   ├── commands/     # analyze, init, audit, review
│   └── lib/          # detector, installer, auditor, reviewer
├── .docket-protocol/ # Agent integration documentation
│   ├── agent-guide.md
│   └── schemas/      # JSON schemas for all outputs
└── bin/              # CLI entry points
```

### Technology Stack

- **Language:** TypeScript (type safety, modern tooling)
- **CLI Framework:** oclif (rich CLI UX, plugin system)
- **Package Manager:** npm (widest compatibility)
- **Build Tool:** TypeScript compiler
- **Testing:** Mocha (existing test framework)

### Rollout Strategy

1. **Phase 1:** Build and test CLI locally
2. **Phase 2:** Publish to npm as `@tnezdev/docket`
3. **Phase 3:** Update documentation and examples
4. **Phase 4:** Keep shell scripts for backward compatibility
5. **Phase 5:** Gather feedback from agent framework developers

### Migration Path

- Existing template users: No migration needed, templates still work
- New users: Can use CLI or templates depending on preference
- Agent developers: Follow `.docket-protocol/agent-guide.md`

### Rollback Plan

If CLI adoption is poor:
- Templates and shell scripts remain functional
- Can deprecate CLI in future major version
- Minimal risk since templates are the foundation

## References

- [Phase 3.9 Dogfooding Plan](./phase-3.9-dogfooding-plan.md) - Original planning discussion
- [Agent Guide](./.docket-protocol/agent-guide.md) - Complete protocol documentation
- [oclif Documentation](https://oclif.io/) - CLI framework we chose
- [ADR-0002: Use Oclif for CLI Framework](./adr-0002-oclif-for-cli.md) - Related decision

---

**This ADR represents the transformation of docket from a template collection to a complete documentation platform. It's the most significant architectural decision in the project's history.**
