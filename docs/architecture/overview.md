# Architecture Overview: Docket

**Version:** 0.3.0
**Last Updated:** 2025-10-13
**Status:** Current
**Audience:** Contributors, Developers, Agent Integrators

## Executive Summary

Docket is documentation intelligence for AI agents. It provides agents with semantic analysis, project context, and documentation templates through the Model Context Protocol (MCP). Agents use docket automatically—users configure once and forget about it.

The system consists of three main components: an MCP server exposing 5 tools, core analysis libraries written in TypeScript that provide both heuristic and agent-driven assessments, and 10 comprehensive documentation templates.

**Key Points:**
- **Agent-first design** - Built for AI agents, not human CLI usage
- **MCP-only interface** - Native tool calling through Model Context Protocol
- **Semantic analysis** - Agent-driven assessment outperforms heuristics 3.5x (73/100 vs 21/100)
- **Invisible infrastructure** - Configure once, agent just knows documentation stuff
- **Agent-agnostic** - Works with any MCP-compatible agent (Claude Code, Claude Desktop, etc.)

## System Context

### Purpose

Docket makes AI agents smarter at understanding and improving documentation. It provides semantic analysis, project context, and templates so agents can assess documentation quality beyond simple pattern matching.

**How agents use docket:**

1. **Analyze projects** - Understand languages, frameworks, and structure
2. **Assess quality** - Semantic evaluation using agent reasoning (73/100) vs heuristics (21/100)
3. **Access templates** - Get ADR, RFC, spec, guide templates on demand
4. **Gather context** - Receive structured project + documentation data for reasoning

**The key insight:** Heuristic analysis (pattern matching) fails catastrophically (87% false positive rate). Agent-driven analysis provides contextual, actionable insights.

### Users

**Primary audience: Solo developers using AI agents as coding partners**

- Individual developers with AI agents central to their workflow
- Using agents like Claude Code, Claude Desktop, Cursor, or other MCP-compatible tools
- Want documentation help without learning another CLI tool
- Prefer invisible infrastructure over explicit tooling

**Not the target:**
- Teams needing CI/CD documentation gates (not docket's lane)
- Developers without AI agent integration
- Traditional documentation workflows without agent assistance

### Dependencies

External dependencies:

- **Node.js** - Runtime (v18+)
- **npm** - Package manager and distribution
- **MCP-compatible agent** - Claude Code, Claude Desktop, or similar
- **File system** - Local project files for analysis

### Dependents

Systems that depend on docket:

- **AI coding agents** - MCP-compatible agents using docket tools for documentation intelligence
- **User projects** - Documentation templates and analysis provided through agents

## Architecture Diagram

```
                ┌─────────────────────────┐
                │   AI Agents (Users)     │
                │  Claude Code, Desktop   │
                └────────────┬────────────┘
                             │ MCP Protocol
                             │ (stdio, JSON-RPC)
                             ▼
┌──────────────────────────────────────────────────────────┐
│              MCP Server (bin/mcp-server.js)              │
│                                                          │
│  ┌────────────┬──────────────┬──────────┬────────────┐  │
│  │  analyze   │ audit-quality│   audit  │list/get    │  │
│  │            │  (agent-     │(heuristic│ templates  │  │
│  │            │   driven)    │ fallback)│            │  │
│  └────────────┴──────────────┴──────────┴────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ uses
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Detector   │  │   Auditor    │  │ Agent-Audit  │
│              │  │              │  │              │
│ - Languages  │  │ - Heuristics │  │ - Context    │
│ - Frameworks │  │ - Coverage   │  │ - Prompts    │
│ - Structure  │  │ - Gaps (21%) │  │ - Data (73%) │
└──────────────┘  └──────────────┘  └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │ accesses
                         ▼
         ┌───────────────────────────────┐
         │      Templates & Prompts       │
         ├───────────────┬───────────────┤
         │  templates/   │ templates/    │
         │               │  prompts/     │
         │ - adr         │               │
         │ - rfc         │ - audit-      │
         │ - spec        │   quality.md  │
         │ - api         │               │
         │ - ... (10)    │               │
         └───────────────┴───────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  User's docs/   │
                │                 │
                │ Project-specific│
                │ documentation   │
                └─────────────────┘
```

**Key Flow:**
1. Agent calls MCP tool (e.g., `audit-quality`)
2. MCP server gathers context (detector + auditor + agent-audit)
3. Returns assessment prompt + structured data to agent
4. Agent analyzes semantically and provides recommendations
5. For templates: agent calls `get-template` → receives markdown

## Components

### Component 1: MCP Server

**Purpose:** Model Context Protocol server providing docket intelligence to AI agents

**Technology:** TypeScript, @modelcontextprotocol/sdk (stdio transport)

**Responsibilities:**
- Implement MCP protocol (JSON-RPC over stdio)
- Expose 5 tools for agent consumption
- Route tool calls to appropriate libraries
- Return structured data and prompts to agents
- Handle errors gracefully

**Available Tools:**
1. **`analyze`** - Analyze project structure, languages, frameworks
2. **`audit-quality`** - Agent-driven semantic documentation assessment (73/100 score)
3. **`audit`** - Heuristic documentation audit for baseline (21/100 score)
4. **`list-templates`** - List 10 available documentation templates
5. **`get-template`** - Fetch template content by type

**Interactions:**
- Calls: Detector, Auditor, Agent-Audit libraries
- Called by: MCP-compatible agents (Claude Code, Claude Desktop, etc.)
- Protocol: JSON-RPC 2.0 over stdio

**Key Interfaces:**
```typescript
// Tool calling interface
{
  method: 'tools/call',
  params: {
    name: 'audit-quality',
    arguments: {path: '/project', docsDir: 'docs'}
  }
}
// Returns: Assessment prompt + structured context
```

**Deployment:**
- Entry point: `bin/mcp-server.js`
- Distributed via npm: `npx @tnezdev/docket`
- Configured in agent's MCP settings (e.g., `~/.claude.json`)
- Runs as persistent process (stdio transport)

---

### Component 2: Detector Library

**Purpose:** Analyzes project structure, languages, frameworks, and organization

**Technology:** TypeScript, Node.js `fs` module, `glob` library

**Responsibilities:**
- Detect programming languages by file extensions
- Identify frameworks through config file analysis (package.json, Cargo.toml, etc.)
- Analyze project structure (source/test/docs directories)
- Identify build tools and package managers
- Generate confidence scores for detections

**Interactions:**
- Called by: MCP `analyze` tool, MCP `audit-quality` tool (for context)
- Calls: File system APIs, glob pattern matching

**Key Interfaces:**
- `analyzeProject(cwd: string): Promise<AnalysisResult>`
- Returns structured data matching `analysis.schema.json`

**Deployment:**
- Compiled to `/lib/lib/detector.js` from `/src/lib/detector.ts`
- Bundled with npm package

---

### Component 3: Agent-Audit Library

**Purpose:** Gathers project and documentation context for agent-driven semantic analysis

**Technology:** TypeScript, Node.js `fs` module, `glob` library

**Responsibilities:**
- Collect structured project context (languages, frameworks, structure)
- Gather documentation metadata (files, sizes, headings, timestamps)
- Include heuristic audit results as baseline
- Build comprehensive assessment prompts
- Format data for agent reasoning

**Interactions:**
- Called by: MCP `audit-quality` tool
- Calls: Detector, Auditor, prompt builder, file system APIs

**Key Interfaces:**
- `prepareAgentAuditContext(cwd, docsDir, analysis, audit): Promise<AgentContext>`
- `buildAuditPrompt(context): string` (13K+ character assessment prompt)

**Key Insight:**
Agent-driven analysis (73/100) outperforms heuristic analysis (21/100) by 3.5x. This component enables that semantic intelligence.

**Deployment:**
- Compiled to `/lib/lib/agent-audit.js` from `/src/lib/agent-audit.ts`
- Works with `/templates/prompts/audit-quality.md` template

---

### Component 4: Auditor Library

**Purpose:** Audits documentation completeness and identifies gaps

**Technology:** TypeScript, Node.js `fs` module, `glob` library

**Responsibilities:**
- Scan documentation directory for markdown files
- Check coverage for key documentation types (architecture, ADRs, testing, etc.)
- Identify empty or placeholder-only files
- Validate ADR format compliance
- Calculate completeness score (0-100)
- Generate prioritized gap recommendations

**Interactions:**
- Called by: MCP `audit` tool, MCP `audit-quality` tool (for baseline)
- Calls: File system APIs, pattern matching, analysis result from Detector

**Note:** Heuristic audit provides 21/100 baseline. Used for comparison against agent-driven 73/100 score.

**Key Interfaces:**
- `auditDocumentation(cwd, docsDir, analysis): Promise<AuditResult>`
- Returns structured data matching `audit.schema.json`

**Deployment:**
- Compiled to `/lib/lib/auditor.js` from `/src/lib/auditor.ts`

---

### Component 5: Templates Collection

**Purpose:** Production-ready documentation templates and agent assessment prompts

**Technology:** Markdown files with structured content

**Templates (10 types):**
1. `adr-template.md` - Architecture Decision Records
2. `rfc-template.md` - Request for Comments
3. `prd-template.md` - Product Requirements
4. `architecture-template.md` - System architecture
5. `api-template.md` - API reference
6. `onboarding-template.md` - Developer onboarding
7. `testing-template.md` - Testing philosophy
8. `runbook-template.md` - Operational procedures
9. `standards-template.md` - Coding standards
10. `spec-template.md` - Behavioral specifications

**Agent Prompts:**
- `templates/prompts/audit-quality.md` - 13K character assessment prompt for agent-driven analysis

**Responsibilities:**
- Provide structure and guidance for documentation
- Include examples and best practices
- Support agent access via `get-template` tool
- Enable semantic analysis via comprehensive prompts

**Interactions:**
- Called by: MCP `get-template` tool, MCP `list-templates` tool
- Accessed by: Agent-Audit library for prompts

**Deployment:**
- Source files in `/templates` directory
- Included in npm package via `files` field in package.json

## Data Flow

### Primary Flow: Agent-Driven Quality Assessment

1. **Agent calls:** MCP `audit-quality` tool with project path
2. **MCP Server routes:** Call to Agent-Audit library
3. **Detector analyzes:** Project structure, languages, frameworks
4. **Auditor runs:** Heuristic baseline audit (21/100 score)
5. **Agent-Audit gathers:** Complete context (project + docs + heuristic baseline)
6. **Prompt Builder generates:** 13K+ character assessment prompt
7. **MCP Server returns:** Prompt + structured context to agent
8. **Agent analyzes:** Semantically evaluates documentation quality
9. **Agent provides:** Contextual recommendations (73/100 score)

### Secondary Flow: Project Analysis

1. **Agent calls:** MCP `analyze` tool
2. **MCP Server routes:** Call to Detector library
3. **Detector scans:** File system, detects languages/frameworks
4. **MCP Server returns:** Structured analysis result
5. **Agent uses:** Context for documentation decisions

### Tertiary Flow: Template Access

1. **Agent calls:** MCP `list-templates` tool
2. **MCP Server returns:** Array of 10 template types
3. **Agent calls:** MCP `get-template` tool with type
4. **MCP Server reads:** Template file from `/templates`
5. **MCP Server returns:** Template markdown content
6. **Agent uses:** Template for documentation creation

## Technology Stack

### Core Runtime
- **Language:** TypeScript 5.x
- **Runtime:** Node.js 18+
- **Package Manager:** npm

### MCP Framework
- **Protocol:** Model Context Protocol (MCP)
- **SDK:** @modelcontextprotocol/sdk
- **Transport:** stdio (JSON-RPC 2.0)
- **Reason:** Native tool calling, agent-first, industry standard

### Build & Development
- **Compiler:** TypeScript compiler (`tsc`)
- **Testing:** Mocha v10
- **Linting:** ESLint v8

### Core Libraries
- **File Operations:** Node.js `fs` module
- **Pattern Matching:** `glob` v10
- **MCP SDK:** @modelcontextprotocol/sdk (stdio transport)

### Distribution
- **Registry:** npm
- **Package Name:** `@tnezdev/docket`
- **Entry Point:** `bin/mcp-server.js`
- **Usage:** `npx @tnezdev/docket`

### Documentation
- **Format:** Markdown
- **Templates:** 10 types + agent prompts
- **Prompt Size:** 13K+ characters for agent-driven assessment

## Scalability

### Current Scale
- **Installation size:** ~272 npm packages (72% reduction from 977)
- **Compiled size:** ~1 MB lib directory
- **Template count:** 10 markdown files + agent prompts
- **Supported languages:** 30+ (extensible)
- **Supported frameworks:** 50+ (extensible)
- **MCP tools:** 5 (analyze, audit-quality, audit, list-templates, get-template)

### Performance Characteristics
- **MCP startup:** ~500ms (persistent process, one-time cost)
- **Analysis time:** < 2 seconds for typical projects
- **Heuristic audit:** < 1 second (21/100 baseline)
- **Agent audit context:** < 2 seconds (gathers data for 73/100 analysis)
- **Template retrieval:** < 100ms (instant)

### Scaling Strategy

**MCP Architecture** - Docket runs as persistent MCP server:
- Individual user machines (no central service)
- One process per agent session (stdio transport)
- npm CDN for package distribution
- Lightweight footprint (~50MB memory)

## Security

### Local Execution Model
- **No network calls** - All analysis is local file system only
- **No data transmission** - No telemetry or analytics
- **No credentials** - Doesn't handle secrets or authentication

### File System Access
- **Read access:** Scans project files for analysis
- **Write access:** Creates docs/ directory and .docket/ context
- **Permissions:** Respects standard file system permissions
- **Safety:** Idempotent operations (won't overwrite existing files)

### Supply Chain
- **Dependencies:** Managed via npm with package-lock.json
- **Audit:** Regular `npm audit` for vulnerability scanning
- **Source:** All code open source on GitHub

## Resilience

### Error Handling
- **Graceful failures:** Commands fail with clear error messages
- **Validation:** Input validation for all user-provided data
- **Rollback:** Idempotent operations mean retries are safe

### Compatibility
- **Cross-platform:** Works on macOS, Linux, Windows
- **Node versions:** Requires Node.js 18+
- **Agent compatibility:** Works with any MCP-compatible agent

## Performance

### Benchmarks
- **MCP server startup:** ~500ms (one-time per session)
- **Tool calls:** < 100ms overhead (persistent connection)
- **Analysis:** < 2 seconds for typical projects
- **Large projects:** Scales to 10,000+ files without issues

### Optimization Strategies
- **Persistent process:** MCP server stays running (no startup cost per tool call)
- **Glob patterns:** Ignore common paths (node_modules, .git, dist)
- **Lazy loading:** Only load libraries when tool is called
- **Compiled output:** Pre-compiled TypeScript for production

## Deployment

### Distribution Method
**npm Package** - Published to npm registry as `@tnezdev/docket`

### MCP Configuration
```json
// ~/.claude.json or agent's MCP config
{
  "mcpServers": {
    "docket": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@tnezdev/docket"],
      "env": {}
    }
  }
}
```

**For local development:**
```json
{
  "mcpServers": {
    "docket": {
      "type": "stdio",
      "command": "/absolute/path/to/docket/bin/mcp-server.js",
      "args": [],
      "env": {}
    }
  }
}
```

### Build Process
```bash
# Production build
npm run build  # Compiles src/ to lib/

# Test MCP server
node bin/mcp-server.js

# Package for npm
npm pack       # Creates tarball
npm publish    # Publishes to registry
```

### Versioning
- **Semantic versioning:** MAJOR.MINOR.PATCH
- **Current version:** 0.3.0 (pre-1.0 alpha)
- **Breaking changes:** Will bump major version

## Future Considerations

### Near Term (RFC-0004)
- **Work artifact capture** - Journal for capturing discovered work during sessions
- **Smart surfacing** - Context-aware reminders of unfinished work
- **Work promotion** - Convert captures to formal docs (RFC, ADR, etc.)

### Medium Term
- **More agent prompts** - Review-staleness, init-guidance, etc.
- **Streaming responses** - Stream large analyses incrementally
- **Custom templates** - User-provided template repositories
- **More languages** - Expand language detection (Elixir, Zig, V, etc.)

### Long Term (Post 1.0)
- **Agent collaboration** - Multiple agents sharing same docket instance
- **Integration tests** - Test against multiple MCP agents
- **Template customization** - Project-specific template variants
- **Analytics** - Track documentation quality trends over time

## Decision Log

Key architectural decisions documented in ADRs:

- [ADR-0001: CLI Platform Over Templates-Only](./adr/adr-0001-cli-platform-over-templates-only.md) - **Superseded** by ADR-0004
- [ADR-0002: Use Oclif for CLI Framework](./adr/adr-0002-oclif-for-cli-framework.md) - **Superseded** by ADR-0004
- [ADR-0003: Agent-Agnostic Architecture](./adr/adr-0003-agent-agnostic-architecture.md) - Still valid (MCP is agent-agnostic)
- [ADR-0004: MCP-Only Architecture](./adr/adr-0004-mcp-only-architecture.md) - **Current** - Remove CLI, commit to agent-first

## References

- [RFC-0001: MCP Server Implementation](./rfcs/rfc-0001-mcp-server-for-agent-integration.md) - MCP architecture details
- [RFC-0004: Work Artifact Capture](./rfcs/rfc-0004-work-artifact-capture-and-surfacing.md) - Future workflow features
- [MCP Spec](https://spec.modelcontextprotocol.io/) - Model Context Protocol specification
- [README](../README.md) - Project overview and quick start
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to docket

## Glossary

- **ADR:** Architecture Decision Record - Document capturing a significant decision
- **Agent:** AI coding assistant (Claude Code, Claude Desktop, Cursor, etc.)
- **Agent-driven analysis:** Semantic documentation assessment using agent reasoning (73/100 score)
- **Heuristic analysis:** Pattern-matching documentation audit (21/100 score, baseline)
- **MCP:** Model Context Protocol - Standard for AI agent tool calling
- **MCP Tool:** Function exposed to agents via MCP protocol
- **Semantic analysis:** Context-aware evaluation beyond pattern matching
- **Template:** Pre-structured markdown file with examples and guidance

---

**This architecture overview documents docket's current implementation as of v0.3.0. It reflects the transformation to MCP-only, agent-first architecture based on validation showing agent-driven analysis outperforms heuristics by 3.5x (ADR-0004).**
