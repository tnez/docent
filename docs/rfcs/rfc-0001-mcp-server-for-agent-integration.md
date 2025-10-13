# RFC-0001: MCP Server for Agent Integration

**Status:** Superseded by [ADR-0004](../adr/adr-0004-mcp-only-architecture.md)
**Author:** @tnez
**Created:** 2025-10-12
**Updated:** 2025-10-13

> **Note:** This RFC proposed adding MCP *alongside* CLI (dual interfaces). [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) chose MCP-only architecture instead, based on evidence that agents are required (73/100 vs 21/100 quality improvement) and all target users are AI agents. This RFC remains valuable for understanding the MCP integration approach and rationale.

## Summary

Add a Model Context Protocol (MCP) server interface to docket alongside the existing CLI. This enables AI agents to interact with docket through native tool calling rather than shell command execution. The MCP server is implemented in the same repository as the CLI (`/src/mcp/`) sharing core logic and prompt templates. **Validated by audit prototype showing agent-driven analysis (73/100) significantly outperforms heuristic-based analysis (21/100).**

## Motivation

### Problem Statement

Docket currently exposes functionality through CLI commands with JSON output (e.g., `docket analyze --output json`). While this works, it has limitations:

**Current limitations:**
- Requires agents to execute shell commands and parse stdout
- No native tool calling support
- Limited to environments with shell access
- Doesn't work well in web-based or sandboxed environments
- Agents must manually validate JSON output
- No built-in tool discovery mechanism
- **Manual copy/paste workflow for agent-driven features** (validated by audit prototype)

**Prototype validation:**
We built `docket audit --agent` to test agent-driven analysis. Results:
- **Heuristic analysis**: 21/100 score, 87% false positive rate (flagged 13/15 substantial docs as "empty")
- **Agent analysis**: 73/100 score, contextual understanding, actionable recommendations
- **3.5x improvement** - Agents can do what heuristics cannot
- **Manual workflow works** but requires copy/paste (MCP would make it seamless)

**Who is affected:**
- AI coding agents wanting richer integration
- Web-based agent environments without shell access
- Sandboxed execution environments
- Agent developers building integrations

**Consequences of not solving:**
- Docket remains harder to integrate than tools with MCP support
- Limited adoption in non-shell environments
- Manual JSON parsing remains agent's responsibility
- No standardized integration pattern as MCP gains adoption

### Goals

- **Enable richer agent integration** through MCP protocol
- **Maintain backward compatibility** with existing shell-based approach
- **Support broader environments** (web, sandboxed, mobile agents)
- **Provide native tool discovery** for agents
- **Position docket for future** as MCP becomes standard

### Non-Goals

- Replace the CLI (it remains the primary interface for humans)
- Break existing shell-based integrations
- Implement every possible MCP feature (start minimal)
- Support non-MCP agent protocols (focus on MCP + shell)

## Detailed Design

### Overview

Implement MCP server in `/src/mcp/` within the main docket repository (monorepo approach). The MCP server shares core libraries (`detector`, `auditor`, `reviewer`, `installer`) and prompt templates (`/templates/prompts/`) with the CLI, providing identical functionality through a different interface.

**Monorepo rationale:**
- MCP is integral to product (not optional plugin)
- Shared code: detector, auditor, prompt templates
- Coordinated releases: CLI and MCP changes together
- Single repo to understand, test, contribute
- Easier dogfooding: run docket via MCP while developing

### Architecture

```
@tnezdev/docket (monorepo)
├── src/
│   ├── commands/           # CLI commands
│   ├── lib/                # Core libraries (shared)
│   │   ├── detector.ts     # Project analysis
│   │   ├── auditor.ts      # Documentation gaps
│   │   ├── reviewer.ts     # Staleness/drift
│   │   ├── installer.ts    # Doc structure
│   │   ├── agent-audit.ts  # Agent context gathering
│   │   └── prompt-builder.ts # Prompt generation
│   └── mcp/                # MCP server (new)
│       ├── server.ts       # MCP implementation
│       └── tools/          # Tool handlers
├── templates/
│   ├── ...                 # Doc templates
│   └── prompts/            # Agent prompts (shared)
│       └── audit-quality.md
└── bin/
    └── run.js              # CLI entry point

        ↓ used by ↓

┌─────────────────┐         ┌─────────────────┐
│  CLI Interface  │         │  MCP Interface  │
│  (commands/)    │         │  (mcp/)         │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
    ┌─────────┐               ┌──────────┐
    │ Humans  │               │  Agents  │
    │ (shell) │               │  (MCP)   │
    └─────────┘               └──────────┘
```

**Monorepo approach:**
- Single `@tnezdev/docket` package with dual interfaces
- MCP server in `/src/mcp/` alongside CLI in `/src/commands/`
- Shared core libraries in `/src/lib/`
- Shared prompt templates in `/templates/prompts/`

### Implementation Details

**MCP Tools Exposed:**

1. **`analyze`** - Analyze project structure
   ```typescript
   Input: { path: string }
   Output: AnalysisResult (same as CLI JSON)
   ```

2. **`audit-quality`** - Agent-driven documentation quality assessment
   ```typescript
   Input: { path: string, docsDir?: string }
   Output: {
     prompt: string,              // Generated assessment prompt
     context: AgentAuditContext   // Structured project + doc data
   }
   Note: Agent receives prompt, analyzes, returns structured assessment
   ```

3. **`audit`** - Heuristic documentation audit (legacy/fast)
   ```typescript
   Input: { path: string, docsDir?: string }
   Output: AuditResult
   ```

4. **`review`** - Review documentation health
   ```typescript
   Input: { path: string, docsDir?: string }
   Output: ReviewResult
   ```

4. **`init`** - Initialize documentation
   ```typescript
   Input: {
     path: string,
     docsDir?: string,
     projectName?: string,
     teamSize?: 'solo' | 'small' | 'medium' | 'large'
   }
   Output: InitResult
   ```

5. **`new`** - Create new document
   ```typescript
   Input: {
     path: string,
     type: 'adr' | 'rfc' | 'guide' | 'runbook' | 'architecture',
     title: string,
     docsDir?: string
   }
   Output: { created: string, path: string }
   ```

**Project Structure:**

```
docket/
├── src/
│   ├── commands/              # CLI commands (human interface)
│   │   ├── analyze.ts
│   │   ├── audit.ts           # Now supports --agent flag
│   │   └── review.ts
│   ├── lib/                   # Shared core logic
│   │   ├── detector.ts        # Project analysis
│   │   ├── auditor.ts         # Heuristic audit
│   │   ├── reviewer.ts        # Staleness detection
│   │   ├── agent-audit.ts     # Agent context gathering
│   │   └── prompt-builder.ts  # Prompt template system
│   └── mcp/                   # MCP server (agent interface)
│       ├── server.ts          # MCP protocol implementation
│       └── tools/             # Tool handlers
│           ├── analyze.ts
│           ├── audit-quality.ts  # Agent-driven audit
│           └── review.ts
├── templates/
│   ├── adr-template.md        # Doc templates
│   └── prompts/               # Agent prompt templates
│       ├── audit-quality.md   # Quality assessment
│       └── review-staleness.md # Staleness detection
├── bin/
│   ├── run.js                 # CLI entry point
│   └── mcp-server.js          # MCP entry point
└── package.json               # Exports both CLI and MCP
```

### Code Examples

**MCP Server Implementation:**

```typescript
// src/mcp/server.ts
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {analyzeProject} from '../lib/detector.js'
import {auditDocumentation} from '../lib/auditor.js'
import {prepareAgentAuditContext} from '../lib/agent-audit.js'
import {buildAuditPrompt} from '../lib/prompt-builder.js'

const server = new Server(
  {
    name: 'docket',
    version: '0.3.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List available tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'analyze',
      description: 'Analyze project structure, languages, and frameworks',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to project directory',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'audit',
      description: 'Audit documentation completeness and find gaps',
      inputSchema: {
        type: 'object',
        properties: {
          path: {type: 'string', description: 'Path to project directory'},
          docsDir: {type: 'string', description: 'Documentation directory name', default: 'docs'},
        },
        required: ['path'],
      },
    },
    // ... other tools
  ],
}))

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const {name, arguments: args} = request.params

  switch (name) {
    case 'analyze': {
      const result = await analyzeProject(args.path)
      return {
        content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
      }
    }
    case 'audit-quality': {
      // Agent-driven quality assessment (new approach)
      const analysis = await analyzeProject(args.path)
      const audit = await auditDocumentation(args.path, args.docsDir || 'docs', analysis)
      const context = await prepareAgentAuditContext(args.path, args.docsDir || 'docs', analysis, audit)
      const prompt = buildAuditPrompt(context)

      return {
        content: [
          {type: 'text', text: prompt},
          {type: 'text', text: `\n\nContext data:\n${JSON.stringify(context, null, 2)}`}
        ],
      }
    }
    case 'audit': {
      // Heuristic audit (legacy/fast fallback)
      const analysis = await analyzeProject(args.path)
      const result = await auditDocumentation(args.path, args.docsDir || 'docs', analysis)
      return {
        content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
      }
    }
    // ... other tools
  }
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
```

**Agent Usage (via MCP):**

```typescript
// Agent code using MCP
const analysis = await mcp.callTool('analyze', {path: '/my/project'})
// Returns typed AnalysisResult, no JSON parsing needed

// Agent-driven quality assessment (recommended)
const auditPrompt = await mcp.callTool('audit-quality', {path: '/my/project'})
// Returns: { prompt: string, context: AgentAuditContext }
// Agent analyzes context using the prompt, returns structured assessment

// Heuristic audit (fast fallback for CI)
const auditFast = await mcp.callTool('audit', {path: '/my/project'})
// Returns AuditResult from pattern matching

// Agent can discover all tools
const tools = await mcp.listTools()
// Shows: analyze, audit-quality, audit, review, init, new
```

**Agent Usage (via CLI - still supported):**

```typescript
// Agent code using shell commands
const result = await exec('docket analyze --output json --path /my/project')
const analysis = JSON.parse(result.stdout)
// Still works, backward compatible
```

### User Experience

**For Agent Developers:**

Two integration options:

1. **MCP (recommended if supported):**
   ```bash
   # Add to MCP configuration (e.g., Claude Desktop)
   {
     "mcpServers": {
       "docket": {
         "command": "node",
         "args": ["/path/to/docket/lib/mcp/server.js"]
       }
     }
   }

   # Or via npx (after publishing)
   {
     "mcpServers": {
       "docket": {
         "command": "npx",
         "args": ["@tnezdev/docket", "mcp"]
       }
     }
   }
   ```

2. **CLI (works everywhere):**
   ```bash
   docket analyze --output json
   ```

**For End Users:**

No change - they continue using the CLI as normal. MCP is transparent to them.

**For Docket Maintainers:**

- Maintain two packages with shared core logic
- Test both CLI and MCP interfaces
- Keep feature parity between interfaces

## Trade-offs and Alternatives

### Trade-offs

**Advantages of MCP approach:**
- Native tool calling (no shell needed)
- Works in web/sandboxed environments
- Built-in tool discovery
- Typed, validated inputs/outputs
- Future-proof as MCP gains adoption
- Richer integration capabilities

**Disadvantages of MCP approach:**
- Additional package to maintain
- MCP adoption is still early/uncertain
- Requires agent to support MCP
- More complex testing (two interfaces)
- Potential for feature drift between CLI and MCP

### Alternative 1: MCP-Only (No CLI)

**Description:** Replace CLI with MCP server, force all interactions through MCP

**Pros:**
- Single interface to maintain
- Cleaner architecture
- Push agents to adopt MCP

**Cons:**
- Breaking change for all users
- Doesn't work for humans (MCP is agent-only)
- Excludes agents without MCP support
- Risky bet on MCP adoption

**Why not chosen:** Too risky, breaks backward compatibility, excludes human users

### Alternative 2: CLI-Only (No MCP)

**Description:** Keep current approach, don't add MCP

**Pros:**
- No additional maintenance
- Shell commands work everywhere
- Simple architecture

**Cons:**
- Less rich integration for agents
- Doesn't work in sandboxed environments
- Agent must parse JSON manually
- Miss opportunity as MCP gains adoption

**Why not chosen:** Leaves value on the table, doesn't position for future

### Alternative 3: Plugin System

**Description:** Build generic plugin system, MCP is just one plugin

**Pros:**
- Maximum flexibility
- Could support multiple protocols
- Extensible architecture

**Cons:**
- Much more complex
- Over-engineering for current needs
- Maintenance burden
- Unclear which protocols to support

**Why not chosen:** Premature abstraction, YAGNI

## Security Considerations

**File System Access:**
- MCP server has same file access as CLI (local file system)
- No network access required
- Respects file system permissions
- Same security model as existing CLI

**Input Validation:**
- Validate all MCP tool inputs
- Sanitize file paths (prevent directory traversal)
- Limit to reasonable path depths
- Same validation as CLI commands

**No Authentication Required:**
- Local-only tool (like CLI)
- No remote access
- Agent already has system access

**Mitigations:**
- Input validation on all parameters
- Path sanitization for file operations
- Rate limiting if needed (future)

## Performance Considerations

**Startup Time:**
- MCP server runs as long-lived process (better than CLI)
- CLI: ~100ms startup per command
- MCP: ~500ms startup once, then instant tool calls

**Memory Usage:**
- MCP server holds process in memory
- Small footprint (~50MB for Node.js + dependencies)
- CLI releases memory after each command

**Overall Impact:**
- **Better for agents** - No startup penalty per command
- **Same for one-off** - Similar to single CLI command
- **Better for batch** - Significant improvement for multiple operations

## Testing Strategy

**Unit Tests:**
- Test core libraries (shared between CLI and MCP)
- Test MCP tool handlers individually
- Mock file system operations

**Integration Tests:**
- Test MCP server end-to-end
- Validate against MCP protocol spec
- Test with real MCP client

**Cross-Interface Tests:**
- Ensure CLI and MCP return same results
- Test feature parity
- Validate JSON schemas match

**Manual Testing:**
- Test with Claude Desktop (MCP client)
- Test with other MCP-compatible agents
- Verify tool discovery works

## Migration and Rollout

### Migration Path

**No migration needed** - this is additive:

1. Existing users continue using CLI
2. Agents can adopt MCP when ready
3. Both interfaces coexist indefinitely

### Rollout Plan

**Phase 0: Validation (Complete ✅)**
- Built `docket audit --agent` prototype with manual workflow
- Validated agent-driven analysis (73/100) vs heuristics (21/100)
- Confirmed prompt template system works
- Demonstrated 3.5x quality improvement with agent reasoning

**Phase 1: Core Infrastructure (1-2 weeks)**
- Implement MCP server in `/src/mcp/`
- Create tool handlers for analyze, audit-quality, audit
- Test with Claude Desktop MCP integration
- Update package.json to export MCP server

**Phase 2: Agent Integration (1-2 weeks)**
- Wire CLI commands to use MCP when available
- Implement review-staleness tool (agent-driven review)
- Add prompt templates for review
- Write integration tests

**Phase 3: Full Feature Parity (1 week)**
- Implement init, new tools for MCP
- Document all tools in MCP schema
- Add examples to `.docket-protocol/agent-guide.md`

**Phase 4: Release & Dogfooding (1 week)**
- Use docket MCP while developing docket
- Update documentation with MCP setup
- Publish npm package with MCP support
- Announce to community

**Phase 5: Iteration**
- Gather feedback from agent developers
- Improve prompt templates based on usage
- Add streaming support for long operations
- Monitor agent vs heuristic performance

### Backward Compatibility

- **No breaking changes** - CLI remains unchanged
- **Additive** - MCP is new interface, not replacement
- **Optional** - Agents choose CLI or MCP
- **Feature parity** - Both expose same functionality

## Documentation Plan

**User-Facing Documentation:**
- Update README with MCP installation instructions
- Add MCP section to `.docket-protocol/agent-guide.md`
- Create `packages/docket-mcp/README.md` with usage examples

**Agent Developer Documentation:**
- MCP configuration examples
- Tool schemas and examples
- Comparison: when to use CLI vs MCP
- Migration guide for shell-based integrations

**Examples:**
- Sample MCP client code
- Integration with Claude Desktop
- Integration with other MCP agents

## Open Questions

- ~~**Package structure:** Monorepo or separate repos?~~ **RESOLVED: Monorepo** - MCP in `/src/mcp/` alongside CLI
- ~~**Core library sharing:** Extract to `@tnezdev/docket-core`?~~ **RESOLVED: No** - Keep shared in `/src/lib/`
- **Feature parity:** Should MCP support interactive prompts (like `docket init`)? **DEFER** - Start with read-only tools
- **Resource limits:** Should we add rate limiting or resource quotas? **DEFER** - Add if needed based on usage
- **MCP version:** Which MCP protocol version to target? **ANSWER: Latest stable** - Use `@modelcontextprotocol/sdk` latest
- **Testing with agents:** Which agents should we test with? **ANSWER: Claude Desktop** - Primary validation platform
- **Agent-first transition:** When to make agent tools default instead of heuristics? **ANSWER: After Phase 2** - Once MCP is stable

## Future Possibilities

Once MCP server is established:

- **Streaming support** - Stream audit/review results as they're discovered
- **Watch mode** - Monitor files and trigger reviews automatically
- **Agent collaboration** - Multiple agents sharing same docket instance
- **Rich responses** - Return formatted markdown, images, diagrams
- **Context integration** - Provide docket data as agent context
- **Custom tools** - Allow projects to define custom MCP tools

## References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop MCP Guide](https://modelcontextprotocol.io/quickstart)
- [ADR-0003: Agent-Agnostic Architecture](../adr/adr-0003-agent-agnostic-architecture.md)
- [Docket Agent Protocol Guide](../../.docket-protocol/agent-guide.md)

---

**This RFC proposes adding MCP support to make docket a first-class citizen in the emerging agent ecosystem while maintaining our agent-agnostic philosophy through dual interfaces.**
