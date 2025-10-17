# ADR-0004: MCP-Only Architecture (Remove CLI)

**Status:** Accepted
**Date:** 2025-10-13
**Deciders:** @tnez
**Supersedes:** ADR-0001 (CLI Platform), ADR-0002 (Oclif Framework)

## Context

After implementing both CLI and MCP interfaces (per ADR-0001 and RFC-0001), a prototype validation revealed a fundamental insight: **agent-driven analysis outperforms heuristic analysis by 3.5x**.

### The Validation

Built `docent audit --agent` to test agent-driven documentation assessment:

**Results:**

- **Heuristic analysis:** 21/100 score, 87% false positive rate (flagged 13/15 substantial docs as "empty")
- **Agent analysis:** 73/100 score, semantic understanding, contextual recommendations
- **3.5x improvement** - Agents can reason about documentation quality in ways heuristics cannot

**Key insight:** The CLI was scaffolding to validate the approach. Agents are not a feature - they're *required* for docent to work well.

### Strategic Realizations

Two critical insights emerged during the MCP implementation:

1. **CI/CD is not docent's lane**
   - Documentation quality isn't a build gate (unlike tests or linting)
   - Blocking builds for doc gaps frustrates developers
   - Documentation is a human collaboration process, not a pass/fail check
   - CI/CD belongs to linters, formatters, type checkers - not documentation tools

2. **All target users have agents**
   - Solo developers using AI as coding partners (primary persona)
   - Agents are central to their workflow, not optional
   - "Human developers using agents" is not a constraint - it's the target audience
   - If agents are required anyway, why maintain a CLI humans rarely use?

### The "Invisible Infrastructure" Insight

From user feedback:
> "docent should really just make your agent work better ... not be a separate thing you have to learn. Just configure the MCP ... maybe ask some questions to give it some initial direction, and off you go."

**Analogy:** Docent is like a database

- Humans don't query databases directly
- Applications (agents) query databases
- Makes applications smarter, not a separate tool to learn

**The Vision:** Configure once, forget about it. Your agent just knows documentation stuff.

### Forces at Play

**In favor of MCP-only:**

- CLI was validated but rarely used directly
- Dual maintenance increases complexity
- Agent-driven features require agents (not CLI)
- Simpler mental model: one interface, one audience
- Users don't want to learn docent commands

**Against MCP-only:**

- Removes human-facing interface
- Breaks backward compatibility
- Bold architectural bet
- No fallback for non-agent workflows

**The Decision Point:**

If agents are required for docent to work well (validated by 73/100 vs 21/100), and all target users have agents, then the CLI is unnecessary complexity.

## Decision

**Remove the CLI entirely. Make docent MCP-only.**

### What This Means

1. **Delete `/src/commands/`** - All CLI command files
2. **Delete `bin/run.js`** - CLI entry point
3. **Remove oclif dependency** - And 706 other packages (72% reduction)
4. **Keep `/src/lib/`** - Core intelligence shared by MCP tools
5. **Keep `/src/mcp/`** - MCP server is the *only* interface
6. **Keep templates** - Accessed via MCP tools (list-templates, get-template)

### New Architecture

```
docent/
├── src/
│   ├── lib/              # Core intelligence (shared)
│   │   ├── detector.ts     # Project analysis
│   │   ├── auditor.ts      # Heuristic audit (for baseline)
│   │   ├── agent-audit.ts  # Agent context gathering
│   │   └── prompt-builder.ts # Prompt templates
│   └── mcp/              # MCP server (only interface)
│       ├── server.ts       # Protocol implementation
│       └── tools/
│           ├── analyze.ts
│           ├── audit.ts  # Agent-driven (73/100)
│           ├── audit.ts          # Heuristic (21/100, baseline)
│           ├── list-templates.ts
│           └── get-template.ts
├── templates/            # Documentation templates
│   ├── adr-template.md
│   └── prompts/          # Agent assessment prompts
│       └── audit.md
└── bin/
    └── mcp-server.js     # Single entry point
```

### User Experience

**Before (Dual Interface):**

1. Learn docent commands: `docent analyze`, `docent audit`, etc.
2. Configure MCP for agent integration
3. Remember to run audits manually
4. Context switch between terminal and agent

**After (MCP-Only):**

1. Configure MCP once: `npx @tnezdev/docent`
2. Restart agent
3. Just talk naturally: "How's my documentation?"
4. Agent uses docent automatically - invisible infrastructure

### Distribution

```json
{
  "mcpServers": {
    "docent": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@tnezdev/docent"],
      "env": {}
    }
  }
}
```

**For local development:**

```json
{
  "mcpServers": {
    "docent": {
      "type": "stdio",
      "command": "/absolute/path/to/docent/bin/mcp-server.js",
      "args": [],
      "env": {}
    }
  }
}
```

## Consequences

### Positive

- **Dramatically simpler architecture** - One interface, one audience, one mental model
- **72% fewer dependencies** - 977 packages → 272 packages (eliminated oclif, chalk, inquirer, etc.)
- **Clearer value proposition** - "Documentation intelligence for AI agents" (not another CLI to learn)
- **Lower maintenance burden** - No CLI/MCP feature parity to maintain
- **Better UX** - Configure once, forget about it (not a separate tool to learn)
- **True to vision** - Agents are required, so embrace it fully
- **Faster iteration** - Change MCP tools without CLI compatibility concerns
- **Dogfoodable** - Use docent via MCP while developing docent

### Negative

- **Breaking change** - Removes CLI for anyone who used it
- **MCP required** - No fallback for non-MCP environments
- **Agent dependency** - Requires agent that supports MCP protocol
- **Bold bet** - Assumes MCP becomes standard (reasonable given Anthropic backing)
- **No human interface** - Can't run docent commands directly in terminal

### Neutral

- **Still local-only** - Same security model (file system access only)
- **Same core logic** - detector, auditor, reviewer unchanged
- **Templates preserved** - Accessible via MCP tools instead of CLI
- **Feature set unchanged** - Same 5 tools, different interface

### Mitigations for Negatives

**"What if MCP fails to gain adoption?"**

- MCP is backed by Anthropic (Claude's maker)
- Protocol is open and simple
- Can add other interfaces later if needed (CLI as plugin)

**"What about users without MCP-compatible agents?"**

- Target audience is "solo developers using agents" - they have MCP
- MCP support growing rapidly (Claude Desktop, Claude Code, more coming)
- Non-agent users weren't our target anyway

**"What about CI/CD use cases?"**

- Not docent's lane (documentation isn't a build gate)
- If needed, agents can run in CI too
- Alternative: separate thin CLI wrapper for CI (future consideration)

## Alternatives Considered

### Alternative 1: Keep Dual Interface (CLI + MCP)

**Description:** Maintain both CLI and MCP indefinitely (status quo from RFC-0001)

**Pros:**

- Backward compatible
- Works for all users
- No breaking changes
- Fallback if MCP fails

**Cons:**

- Feature drift risk (CLI vs MCP parity)
- Maintenance burden (two interfaces)
- Confusing value proposition
- 977 dependencies vs 272
- CLI rarely used directly

**Why not chosen:** Complexity not justified. Agent-first simplifies everything.

### Alternative 2: CLI for Humans, MCP for Agents

**Description:** Position CLI for human developers, MCP for automated agents

**Pros:**

- Clear separation of concerns
- Serves both audiences
- CLI could have richer UX

**Cons:**

- Misunderstands the audience (humans *with* agents, not humans *or* agents)
- CLI still rarely used (agents do the work)
- Doesn't solve complexity problem
- Maintains false dichotomy

**Why not chosen:** The audience is "humans using agents," not two separate groups.

### Alternative 3: Web UI Instead of MCP

**Description:** Build web interface instead of MCP server

**Pros:**

- Visual, approachable UX
- Works without agents
- Broader appeal

**Cons:**

- Different product entirely
- Requires hosting/deployment
- Doesn't integrate with coding workflow
- Misses the "invisible infrastructure" vision
- Much more complex to build

**Why not chosen:** Wrong direction. Docent is infrastructure, not an app.

## Implementation Notes

### Removal Checklist

- [x] Delete `/src/commands/` directory
- [x] Delete `bin/run.js` CLI entry point
- [x] Remove oclif and related dependencies from package.json
- [x] Update package.json `bin` to point to MCP server only
- [x] Keep `/src/lib/` (shared intelligence)
- [x] Keep `/src/mcp/` (only interface)
- [x] Run `npm install` to remove unused packages
- [x] Update README to remove CLI instructions
- [x] Update example configs to show MCP-only setup

### Documentation Updates Needed

- [ ] Create ADR-0004 (this file) ✅
- [ ] Update architecture/overview.md (remove CLI layer, document MCP)
- [ ] Update or archive command specs (analyze, audit, review, init)
- [ ] Search docs/ for CLI references and update
- [ ] Create docs/philosophy.md explaining agent-first approach
- [ ] Update README.md with MCP-only setup
- [ ] Update guides/mcp-setup.md if needed

### Package Changes

**Before:** 977 packages, 83MB node_modules
**After:** 272 packages, ~25MB node_modules

**Removed dependencies:**

- @oclif/core, @oclif/plugin-*
- chalk, inquirer (interactive CLI)
- cli-ux, cli-table3 (CLI formatting)
- All CLI-specific testing mocks

**Kept dependencies:**

- @modelcontextprotocol/sdk (MCP protocol)
- glob (file search)
- TypeScript, Mocha (development)

## Migration Path

### For Existing Users (if any)

If anyone was using the CLI directly:

**Before:**

```bash
docent analyze
docent audit
docent review
```

**After:**

```bash
# Configure MCP in ~/.claude.json
{
  "mcpServers": {
    "docent": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@tnezdev/docent"],
      "env": {}
    }
  }
}

# Restart agent, then just ask:
"Analyze my project"
"How's my documentation?"
"Create an ADR for the database change"
```

### For New Users

1. Add docent to MCP config
2. Restart agent
3. Talk naturally - agent uses docent automatically

## References

- [ADR-0001: CLI Platform](./adr-0001-cli-platform-over-templates-only.md) - **Superseded**
- [ADR-0002: Oclif Framework](./adr-0002-oclif-for-cli-framework.md) - **Superseded**
- [RFC-0001: MCP Server](../rfcs/rfc-0001-mcp-server-for-agent-integration.md) - Implementation that led to this decision
- [ADR-0003: Agent-Agnostic Architecture](./adr-0003-agent-agnostic-architecture.md) - Still valid (MCP is agent-agnostic)
- [Agent-Driven Audit Research](../research/behavioral-specifications-investigation.md) - Context on agent-driven development

---

## Reflection: The Journey

Docent's evolution:

1. **Templates-only** - Static markdown files
2. **CLI + Agent Protocol** - Commands with JSON output (ADR-0001)
3. **CLI + MCP Dual Interface** - Native tool calling (RFC-0001)
4. **MCP-Only** - Agent-first, invisible infrastructure (this ADR)

**The key insight:** We didn't know agents were *required* until we built the audit prototype. Once validated (3.5x improvement), the CLI became unnecessary complexity.

**This is the right decision** because:

- Evidence-based (prototype validation)
- User-driven (target audience has agents)
- Simpler (one interface)
- True to vision (invisible infrastructure)

The CLI served its purpose: validating the approach. Now we commit fully to the agent-first future.
