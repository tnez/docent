# Docent MCP Server Setup

This guide shows how to integrate docent's MCP (Model Context Protocol) server with AI agents like Claude Desktop.

## What is the MCP Server?

The docent MCP server exposes docent's functionality through native tool calling instead of shell commands. This enables:

- **Agent-driven analysis** - Agents can use semantic reasoning instead of brittle heuristics
- **Seamless integration** - No shell command parsing required
- **Rich context** - Structured data and prompts optimized for agents
- **Tool discovery** - Agents automatically discover available tools

## Quick Start

### 1. Build Docent

```bash
cd /path/to/docent
npm install
npm run build
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "docent": {
      "command": "node",
      "args": ["/absolute/path/to/docent/lib/mcp/server.js"]
    }
  }
}
```

Or use the docent-mcp command:

```json
{
  "mcpServers": {
    "docent": {
      "command": "/absolute/path/to/docent/bin/mcp-server.js"
    }
  }
}
```

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. The docent MCP server will now be available.

### 4. Verify Setup

In Claude Desktop, ask:

> "What MCP tools do you have available from docent?"

You should see:

- `bootstrap` - Initialize docent in a project
- `analyze` - Project structure analysis
- `doctor` - Comprehensive health checks (mechanical + semantic analysis)
  - Use `--quick` flag for fast mechanical checks only

## Available Tools

### analyze

Analyzes project structure, languages, frameworks, and build tools.

**Input:**

```json
{
  "path": "/path/to/project"
}
```

**Output:**

```json
{
  "languages": [{"name": "TypeScript", "fileCount": 42, ...}],
  "frameworks": [{"name": "React", "type": "web", ...}],
  "structure": {...},
  "buildTools": ["TypeScript", "Webpack"],
  "packageManagers": ["npm"]
}
```

### bootstrap

Initializes docent in a project by creating docs/ structure and initial documentation.

**Input:**

```json
{
  "path": "/path/to/project",
  "force": false  // optional, force reinit if docs/ exists
}
```

**Output:**
Creates documentation structure and returns confirmation with next steps.

### doctor

Runs comprehensive project health checks including mechanical checks and semantic documentation analysis.

**Input:**

```json
{
  "path": "/path/to/project",
  "docsDir": "docs",  // optional, defaults to "docs"
  "quick": false      // optional, skip semantic analysis for speed
}
```

**Output:**
A comprehensive health report including:

**Mechanical Checks:**

- Broken links in documentation
- Debug code in source files
- Test markers (.only, .skip)
- Uncommitted changes
- Temporary files
- Structure reconciliation

**Semantic Analysis (unless --quick):**

- Documentation quality assessment prompt
- Context-aware scoring guidelines
- Project-specific recommendations

**Modes:**

- **Full (default):** Mechanical checks + semantic analysis prompt
- **Quick (`quick: true`):** Mechanical checks only (fast, for pre-commit)

**Performance:**

- Quick mode: ~0.5s (mechanical checks only)
- Full mode: ~1s mechanical + semantic prompt for agent analysis

## Example Workflow

### 1. Analyze a Project

> "Use the analyze tool on /Users/me/my-project"

Agent calls `analyze` and gets project structure.

### 2. Run Health Check

> "Run doctor on /Users/me/my-project"

Agent:

1. Calls `doctor` (full mode by default)
2. Gets mechanical check results (links, debug code, etc.)
3. Receives semantic analysis prompt
4. Analyzes documentation quality and provides recommendations

### 3. Quick Pre-Commit Check

> "Run a quick health check on /Users/me/my-project"

Agent calls `doctor` with `quick: true` for fast mechanical checks only.

## Architecture

```
┌─────────────────────┐
│  Claude Desktop     │
│  (MCP Client)       │
└──────────┬──────────┘
           │ MCP Protocol (JSON-RPC via stdio)
           ▼
┌─────────────────────┐
│  Docent MCP Server  │
│  (lib/mcp/server.js)│
└──────────┬──────────┘
           │
           ├─→ bootstrap tool → bootstrap.ts
           ├─→ analyze tool → detector.ts
           └─→ doctor tool → doctor.ts + agent-audit.ts
```

## Troubleshooting

### MCP Server Not Showing Up

1. Check Claude Desktop config path:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Verify absolute paths (not relative):

   ```json
   "args": ["/absolute/path/to/docent/lib/mcp/server.js"]
   ```

3. Check build succeeded:

   ```bash
   ls /path/to/docent/lib/mcp/server.js  # Should exist
   ```

4. Test manually:

   ```bash
   node /path/to/docent/test-mcp.js
   ```

### Tools Not Working

Check for errors in Claude Desktop logs:

- macOS: `~/Library/Logs/Claude/mcp*.log`
- Look for docent-related errors

## Architecture History: MCP-Only Decision

Docent originally planned dual CLI+MCP interfaces (see [RFC-0001](../rfcs/rfc-0001-mcp-server-for-agent-integration.md)). However, [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) chose MCP-only architecture after validating that:

1. Agent-driven analysis (73/100) significantly outperforms heuristics (21/100)
2. All target users are AI agents (solo devs using AI as coding partners)
3. Simpler architecture: one interface instead of two

### MCP Approach (Current)

```typescript
// Agent code
const healthCheck = await mcp.callTool('doctor', {path: '.'})
// Returns mechanical checks + semantic analysis prompt
// Agent analyzes and provides recommendations
```

**Why MCP-only:**

- Native tool calling (no shell execution)
- Structured data built for agents
- Works in sandboxed environments
- Persistent connection (fast)
- Agent-driven analysis outperforms heuristics

## Next Steps

- See [RFC-0001](../rfcs/rfc-0001-mcp-server-for-agent-integration.md) for architecture details
- Check [Audit Tool Spec](../specs/mcp-tools/audit-tool.md) for behavior documentation
- Read [MCP API Reference](./mcp-api-reference.md) for integration patterns

## Performance

### Startup Time

- MCP: ~500ms once, then instant tool calls
- CLI: ~100ms per command invocation

### Memory

- MCP: ~50MB (persistent Node.js process)
- CLI: Released after each command

### Best For

- MCP: Multiple operations, agent integration, sandboxed environments
- CLI: One-off commands, CI/CD, human use
