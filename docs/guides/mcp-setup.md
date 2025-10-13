# Docket MCP Server Setup

This guide shows how to integrate docket's MCP (Model Context Protocol) server with AI agents like Claude Desktop.

## What is the MCP Server?

The docket MCP server exposes docket's functionality through native tool calling instead of shell commands. This enables:

- **Agent-driven analysis** - Agents can use semantic reasoning instead of brittle heuristics
- **Seamless integration** - No shell command parsing required
- **Rich context** - Structured data and prompts optimized for agents
- **Tool discovery** - Agents automatically discover available tools

## Quick Start

### 1. Build Docket

```bash
cd /path/to/docket
npm install
npm run build
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "docket": {
      "command": "node",
      "args": ["/absolute/path/to/docket/lib/mcp/server.js"]
    }
  }
}
```

Or use the docket-mcp command:

```json
{
  "mcpServers": {
    "docket": {
      "command": "/absolute/path/to/docket/bin/mcp-server.js"
    }
  }
}
```

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. The docket MCP server will now be available.

### 4. Verify Setup

In Claude Desktop, ask:

> "What MCP tools do you have available from docket?"

You should see:
- `analyze` - Project structure analysis
- `audit-quality` - Agent-driven documentation quality assessment
- `audit` - Heuristic documentation audit (fast, for CI/CD)

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

### audit-quality

Generates an agent-driven documentation quality assessment prompt with full project context.

**Input:**
```json
{
  "path": "/path/to/project",
  "docsDir": "docs"  // optional, defaults to "docs"
}
```

**Output:**
A comprehensive prompt (13,000+ characters) including:
- Project context (languages, frameworks, tests, APIs)
- Documentation metadata (files, sizes, headings, timestamps)
- Heuristic baseline (for comparison)
- Assessment guidelines (semantic analysis, context-aware scoring)
- Expected JSON response format

**Usage:**
When an agent receives this prompt, it analyzes the documentation semantically and returns a structured assessment with:
- Overall quality score (0-100) with rationale
- Critical gaps with actionable suggestions
- Prioritized recommendations (high/medium/low)
- Strengths to acknowledge

**Performance:**
- Agent analysis: ~73/100 (contextual, semantic understanding)
- Heuristic baseline: ~21/100 (pattern matching, 87% false positive rate)
- **3.5x improvement** with agent reasoning

### audit

Performs fast heuristic-based documentation audit (legacy, for CI/CD).

**Input:**
```json
{
  "path": "/path/to/project",
  "docsDir": "docs"  // optional
}
```

**Output:**
```json
{
  "score": 21,
  "gaps": [{category, severity, description, suggestion}],
  "coverage": {hasArchitecture, hasADRs, ...},
  "recommendations": ["..."],
  "timestamp": "2025-10-13T..."
}
```

**Note:** Use `audit-quality` for deep analysis. This tool is for quick CI/CD checks.

## Example Workflow

### 1. Analyze a Project

> "Use the analyze tool on /Users/me/my-project"

Agent calls `analyze` and gets project structure.

### 2. Deep Documentation Audit

> "Use audit-quality to assess the documentation in /Users/me/my-project"

Agent:
1. Calls `audit-quality` to get the prompt
2. Reads the context (project type, doc files, heuristic baseline)
3. Analyzes semantically (not just pattern matching)
4. Returns structured assessment with score, gaps, recommendations

### 3. Quick Heuristic Check

> "Run a quick audit on /Users/me/my-project for CI"

Agent calls `audit` and gets fast heuristic results.

## Architecture

```
┌─────────────────────┐
│  Claude Desktop     │
│  (MCP Client)       │
└──────────┬──────────┘
           │ MCP Protocol (JSON-RPC via stdio)
           ▼
┌─────────────────────┐
│  Docket MCP Server  │
│  (lib/mcp/server.js)│
└──────────┬──────────┘
           │
           ├─→ analyze tool → detector.ts
           ├─→ audit-quality → agent-audit.ts + prompt-builder.ts
           └─→ audit tool → auditor.ts (heuristic)
```

## Troubleshooting

### MCP Server Not Showing Up

1. Check Claude Desktop config path:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Verify absolute paths (not relative):
   ```json
   "args": ["/absolute/path/to/docket/lib/mcp/server.js"]
   ```

3. Check build succeeded:
   ```bash
   ls /path/to/docket/lib/mcp/server.js  # Should exist
   ```

4. Test manually:
   ```bash
   node /path/to/docket/test-mcp.js
   ```

### Tools Not Working

Check for errors in Claude Desktop logs:
- macOS: `~/Library/Logs/Claude/mcp*.log`
- Look for docket-related errors

## Architecture History: MCP-Only Decision

Docket originally planned dual CLI+MCP interfaces (see [RFC-0001](../rfcs/rfc-0001-mcp-server-for-agent-integration.md)). However, [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) chose MCP-only architecture after validating that:

1. Agent-driven analysis (73/100) significantly outperforms heuristics (21/100)
2. All target users are AI agents (solo devs using AI as coding partners)
3. Simpler architecture: one interface instead of two

### MCP Approach (Current)

```typescript
// Agent code
const audit = await mcp.callTool('audit-quality', {path: '.'})
// Returns structured prompt + context
// Agent analyzes and responds with JSON
```

**Why MCP-only:**
- Native tool calling (no shell execution)
- Structured data built for agents
- Works in sandboxed environments
- Persistent connection (fast)
- Agents required anyway (heuristics insufficient)

## Next Steps

- See [RFC-0001](../rfcs/rfc-0001-mcp-server-for-agent-integration.md) for architecture details
- Check [Audit Command Spec](../specs/audit-command.md) for behavior documentation
- Read [Agent Guide](../../.docket-protocol/agent-guide.md) for integration patterns

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
