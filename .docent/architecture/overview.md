# Architecture Overview: Docent

**Version:** 0.8.0
**Last Updated:** 2025-10-29
**Status:** Current
**Audience:** Contributors, Developers, Agent Integrators

## Executive Summary

Docent is documentation intelligence for AI agents. It provides a natural language interface through the Model Context Protocol (MCP), enabling agents to ask questions, execute procedures, and capture knowledge through simple conversation.

The system consists of four MCP tools (start, ask, act, tell) built on a lightweight search engine and template system. Everything runs locally with no external dependencies.

**Key Points:**

- **Natural language interface** - Conversation over commands
- **MCP-only** - Native tool calling through Model Context Protocol
- **Agent-agnostic** - Works with any MCP-compatible agent (Claude Code, Claude Desktop, etc.)
- **Local execution** - No network calls, no data transmission
- **Template-driven** - Runbooks and templates in `.docent/` directory

## System Context

### Purpose

Docent makes AI agents smarter at documentation tasks by providing:

1. **Question answering** - Search all docs to find relevant information
2. **Procedure execution** - Follow runbooks for common operations
3. **Knowledge capture** - Record learnings and decisions naturally
4. **Template creation** - Generate structured docs from templates

### Users

**Primary audience: Solo developers using AI agents as coding partners**

- Individual developers with AI agents central to their workflow
- Using agents like Claude Code, Claude Desktop, Cursor, or other MCP-compatible tools
- Want documentation help through natural conversation
- Prefer invisible infrastructure over explicit tooling

### Dependencies

**External dependencies:**

- **Node.js** - Runtime (v18+)
- **npm** - Package manager and distribution
- **MCP-compatible agent** - Claude Code, Claude Desktop, or similar
- **File system** - Local project files for analysis

**No network dependencies** - Everything runs locally

### Dependents

Systems that depend on docent:

- **AI coding agents** - MCP-compatible agents using docent for documentation intelligence
- **User projects** - Documentation captured in `.docent/` directories

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
│  ┌────────┬───────────┬───────────────┬──────────────┐  │
│  │ start  │    ask    │     act       │     tell     │  │
│  │        │           │               │              │  │
│  │Session │  Search   │ Runbooks +    │ Capture      │  │
│  │ init   │   docs    │  Templates    │ knowledge    │  │
│  └────────┴───────────┴───────────────┴──────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ reads/writes
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Templates   │  │   Runbooks   │  │   Search     │
│              │  │              │  │              │
│ - adr        │  │ - bootstrap  │  │ - Markdown   │
│ - rfc        │  │ - health     │  │ - Full-text  │
│ - runbook    │  │ - git-commit │  │ - Scoring    │
│ - ... (10+)  │  │ - file-issue │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │ operates on
                         ▼
         ┌───────────────────────────────┐
         │  .docent/ directory           │
         ├───────────────┬───────────────┤
         │  /templates   │ /runbooks     │
         │  /journals    │ /sessions     │
         │  /notes       │               │
         └───────────────┴───────────────┘
                         │
                         │
                         ▼
                ┌─────────────────┐
                │  docs/          │
                │                 │
                │ Project docs    │
                └─────────────────┘
```

**Key Flow:**

1. Agent receives user request in natural language
2. Agent calls appropriate MCP tool (start/ask/act/tell)
3. Tool executes locally (search, template, runbook, capture)
4. Returns formatted response to agent
5. Agent presents to user

## Components

### Component 1: MCP Server

**Purpose:** Model Context Protocol server exposing docent intelligence

**Technology:** TypeScript, @modelcontextprotocol/sdk (stdio transport)

**Responsibilities:**

- Implement MCP protocol (JSON-RPC over stdio)
- Expose 4 tools: start, ask, act, tell
- Route tool calls to appropriate handlers
- Return formatted responses
- Handle errors gracefully

**Available Tools:**

1. **`start`** - Initialize session, list resources
2. **`ask`** - Search documentation for answers
3. **`act`** - Execute runbooks or create from templates
4. **`tell`** - Capture knowledge in journals/notes

**Interactions:**

- Calls: Search engine, template system, runbook executor
- Called by: MCP-compatible agents
- Protocol: JSON-RPC 2.0 over stdio

**Key Interfaces:**

```typescript
// Tool calling interface
{
  method: 'tools/call',
  params: {
    name: 'ask',
    arguments: {query: 'how do I test', limit: 10}
  }
}
// Returns: Formatted search results
```

**Deployment:**

- Entry point: `bin/mcp-server.js`
- Distributed via npm: `npx @tnezdev/docent`
- Configured in agent's MCP settings (e.g., `~/.claude.json`)
- Runs as persistent process (stdio transport)

---

### Component 2: Search Engine

**Purpose:** Full-text search across documentation files

**Technology:** TypeScript, Node.js `fs` module, `glob` library

**Responsibilities:**

- Find all markdown files in configured search paths
- Extract and index content
- Search with keyword matching
- Score results by relevance
- Return excerpts with context

**Interactions:**

- Called by: MCP `ask` tool
- Calls: File system APIs, glob pattern matching
- Reads: docs/, .docent/, and configured search paths

**Key Interfaces:**

- `search(query: string, paths: string[], limit: number): SearchResult[]`
- Returns ranked results with excerpts and file paths

**Deployment:**

- Compiled to `/lib/mcp/tools/ask.js` from `/src/mcp/tools/ask.ts`
- Bundled with npm package

---

### Component 3: Template System

**Purpose:** Create structured documentation from templates

**Technology:** Markdown templates with variable substitution

**Responsibilities:**

- List available templates
- Read template content
- Substitute variables (title, date, etc.)
- Create files in appropriate locations
- Handle numbering (e.g., ADR-0001, RFC-0002)

**Available Templates (10+ types):**

1. `adr` - Architecture Decision Records
2. `rfc` - Request for Comments
3. `prd` - Product Requirements
4. `runbook` - Operational procedures
5. `journal-entry` - Daily work journal
6. `meeting-notes` - Meeting documentation
7. `todo-list` - Task tracking
8. `agent-session` - AI session notes
9. `domain` - Domain model documentation
10. And more...

**Interactions:**

- Called by: MCP `act` tool (when directive matches "create X")
- Calls: File system APIs
- Reads: templates/ directory
- Writes: docs/, .docent/ directories

**Deployment:**

- Templates in `/templates` directory
- Handler in `/lib/mcp/tools/act.js`
- Included in npm package

---

### Component 4: Runbook System

**Purpose:** Execute operational procedures and workflows

**Technology:** Markdown files with instructions for agents

**Responsibilities:**

- List available runbooks
- Read runbook content
- Return formatted instructions for agent execution
- Support custom project-specific runbooks

**Available Runbooks:**

- `bootstrap` - Initialize .docent directory structure
- `health-check` - Run project health checks
- `git-commit` - Create professional git commits
- `file-issue` - File GitHub issues
- `code-review` - Conduct code reviews
- `process-journals` - Extract knowledge from journals
- Custom runbooks in `.docent/runbooks/`

**Interactions:**

- Called by: MCP `act` tool (when directive matches runbook name)
- Calls: File system APIs
- Reads: runbooks/ directory, `.docent/runbooks/`

**Deployment:**

- Bundled runbooks in `/runbooks` directory
- Handler in `/lib/mcp/tools/act.js`
- Custom runbooks in `.docent/runbooks/`

---

### Component 5: Knowledge Capture

**Purpose:** Record learnings, decisions, and work progress

**Technology:** Markdown journals and notes

**Responsibilities:**

- Understand natural language statements
- Determine appropriate capture location
- Format content appropriately
- Append to existing files or create new ones
- Maintain date-based organization

**Capture Types:**

- **Journals** - Daily work logs (`.docent/journals/YYYY-MM-DD.md`)
- **Notes** - Topic-based notes (`.docent/notes/topic.md`)
- **Sessions** - AI session notes (`.docent/sessions/session-YYYY-MM-DD.md`)

**Interactions:**

- Called by: MCP `tell` tool
- Calls: File system APIs
- Writes: `.docent/journals/`, `.docent/notes/`

**Deployment:**

- Handler in `/lib/mcp/tools/tell.js`
- Uses simple pattern matching and AI interpretation

## Data Flow

### Primary Flow: Ask (Question Answering)

1. **User asks agent:** "How do I run tests?"
2. **Agent calls:** MCP `ask` tool with query
3. **Search engine:**
   - Finds all markdown files
   - Searches for keywords: "test", "run"
   - Scores results by relevance
4. **MCP Server returns:** Formatted search results with excerpts
5. **Agent presents:** Natural language answer to user

### Secondary Flow: Act (Procedure Execution)

1. **User asks agent:** "Check project health"
2. **Agent calls:** MCP `act` tool with directive "health-check"
3. **Runbook system:**
   - Matches directive to `health-check` runbook
   - Reads runbook content
4. **MCP Server returns:** Formatted runbook instructions
5. **Agent follows:** Instructions and reports results

### Tertiary Flow: Act (Template Creation)

1. **User asks agent:** "Create an ADR for PostgreSQL"
2. **Agent calls:** MCP `act` tool with directive "create adr postgresql"
3. **Template system:**
   - Matches "create adr" pattern
   - Reads ADR template
   - Determines next number (e.g., 0004)
   - Substitutes variables (title, date)
   - Creates file: `docs/adr/adr-0004-postgresql.md`
4. **MCP Server returns:** Confirmation with file path
5. **Agent reports:** ADR created

### Quaternary Flow: Tell (Knowledge Capture)

1. **User asks agent:** "I learned Redis needs AOF"
2. **Agent calls:** MCP `tell` tool with statement
3. **Knowledge capture:**
   - Determines capture type (learning → journal)
   - Formats content
   - Appends to `.docent/journals/2025-10-29.md`
4. **MCP Server returns:** Confirmation
5. **Agent reports:** Knowledge captured

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
- **Linting:** markdownlint for docs

### Core Libraries

- **File Operations:** Node.js `fs` module
- **Pattern Matching:** `glob` v10
- **MCP SDK:** @modelcontextprotocol/sdk

### Distribution

- **Registry:** npm
- **Package Name:** `@tnezdev/docent`
- **Entry Point:** `bin/mcp-server.js`
- **Usage:** `npx @tnezdev/docent`

## Scalability

### Current Scale

- **Compiled size:** ~1 MB lib directory
- **Template count:** 10+ markdown templates
- **Runbook count:** 7+ bundled runbooks
- **MCP tools:** 4 (start, ask, act, tell)

### Performance Characteristics

- **MCP startup:** ~200ms (persistent process, one-time cost)
- **Search time:** < 500ms for typical projects
- **Template creation:** < 100ms (instant)
- **Runbook read:** < 100ms (instant)
- **Knowledge capture:** < 100ms (append to file)

### Scaling Strategy

**MCP Architecture** - Docent runs as persistent MCP server:

- Individual user machines (no central service)
- One process per agent session (stdio transport)
- npm CDN for package distribution
- Lightweight footprint (~30MB memory)

## Security

### Local Execution Model

- **No network calls** - All operations are local file system only
- **No data transmission** - No telemetry or analytics
- **No credentials** - Doesn't handle secrets or authentication

### File System Access

- **Read access:** Scans project files for search
- **Write access:** Creates `.docent/` directory and documentation
- **Permissions:** Respects standard file system permissions
- **Safety:** Idempotent operations (won't overwrite without confirmation)

### Supply Chain

- **Dependencies:** Managed via npm with package-lock.json
- **Audit:** Regular `npm audit` for vulnerability scanning
- **Source:** All code open source on GitHub

## Performance

### Benchmarks

- **MCP server startup:** ~200ms (one-time per session)
- **Tool calls:** < 50ms overhead (persistent connection)
- **Search:** < 500ms for typical projects
- **Large projects:** Scales to 1,000+ markdown files

### Optimization Strategies

- **Persistent process:** MCP server stays running (no startup cost per tool call)
- **Lazy search:** Only searches when `ask` is called
- **Simple templates:** Text substitution (no complex rendering)
- **Compiled output:** Pre-compiled TypeScript for production

## Deployment

### Distribution Method

**npm Package** - Published to npm registry as `@tnezdev/docent`

### MCP Configuration

```json
// ~/.claude.json or agent's MCP config
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
- **Current version:** 0.8.0 (pre-1.0)
- **Breaking changes:** Will bump major version

## Future Considerations

### Near Term

- **Enhanced search** - Better ranking, fuzzy matching
- **More templates** - API specs, troubleshooting guides
- **Runbook improvements** - Conditional steps, validation
- **Better NLP** - Smarter intent understanding in `act` and `tell`

### Medium Term

- **Custom templates** - User-provided template repositories
- **Workflow chaining** - Link runbooks together
- **Search filters** - Filter by doc type, date, etc.
- **Session summaries** - Auto-generate from captured knowledge

### Long Term

- **Multi-project** - Search across multiple projects
- **Agent collaboration** - Multiple agents sharing docent
- **Template variants** - Project-specific customizations
- **Analytics** - Track documentation usage patterns

## Decision Log

Key architectural decisions documented in ADRs:

- [ADR-0001: CLI Platform Over Templates-Only](../adr/adr-0001-cli-platform-over-templates-only.md) - **Superseded** by ADR-0004
- [ADR-0002: Use Oclif for CLI Framework](../adr/adr-0002-oclif-for-cli-framework.md) - **Superseded** by ADR-0004
- [ADR-0003: Agent-Agnostic Architecture](../adr/adr-0003-agent-agnostic-architecture.md) - **Accepted** - MCP is agent-agnostic
- [ADR-0004: MCP-Only Architecture](../adr/adr-0004-mcp-only-architecture.md) - **Accepted** - Remove CLI, commit to agent-first

## References

- [MCP Setup Guide](../guides/mcp-setup.md) - Configuration instructions
- [MCP API Reference](../guides/mcp-api-reference.md) - Detailed tool documentation
- [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) - Why MCP-only
- [MCP Spec](https://spec.modelcontextprotocol.io/) - Model Context Protocol specification
- [README](../../README.md) - Project overview and quick start

## Glossary

- **ADR:** Architecture Decision Record - Document capturing a significant decision
- **Agent:** AI coding assistant (Claude Code, Claude Desktop, Cursor, etc.)
- **MCP:** Model Context Protocol - Standard for AI agent tool calling
- **MCP Tool:** Function exposed to agents via MCP protocol
- **Runbook:** Operational procedure document that guides agents through tasks
- **Template:** Pre-structured markdown file with placeholders
- **Natural language interface:** Tools that accept conversational input

---

**This architecture overview documents docent's current implementation as of v0.8.0. It reflects the natural language ask/act/tell paradigm that replaced rigid tool APIs (ADR-0004).**
