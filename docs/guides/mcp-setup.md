# Docent MCP Server Setup

This guide shows how to integrate docent's MCP (Model Context Protocol) server with AI agents like Claude Code and Claude Desktop.

## What is the MCP Server?

The docent MCP server provides documentation intelligence through four natural language tools:

- **start** - Initialize session and discover available resources
- **ask** - Search documentation to answer questions
- **act** - Execute runbooks and create from templates
- **tell** - Capture knowledge in natural language

This enables agents to understand and improve your documentation through natural conversation rather than rigid commands.

## Quick Start

### Option 1: Use Published Package (Recommended)

**Claude Code:**

Add to `~/.claude.json`:

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

**Claude Desktop:**

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docent": {
      "command": "npx",
      "args": ["-y", "@tnezdev/docent"]
    }
  }
}
```

Then restart your agent. Docent will be automatically available.

### Option 2: Local Development

For developing docent locally:

```bash
cd /path/to/docent
npm install
npm run build
```

**Claude Code** (`~/.claude.json`):

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

**Claude Desktop:**

```json
{
  "mcpServers": {
    "docent": {
      "command": "/absolute/path/to/docent/bin/mcp-server.js"
    }
  }
}
```

### Verify Setup

After restarting your agent, try:

> "Initialize docent"

You should see docent respond with available templates and runbooks.

## Available Tools

Docent provides four core tools that accept natural language:

### start

Initialize session and list available resources (templates, runbooks, commands).

**Usage:** "Initialize docent" or "Start docent session"

**Returns:** Available templates, runbooks, project info, and usage instructions.

### ask

Search all documentation to answer questions.

**Parameters:**

- `query` - Your question in natural language
- `limit` - Optional max results (default: 10)

**Usage Examples:**

- "How do I run tests?"
- "What's our authentication approach?"
- "Search docs for API endpoints"

**Returns:** Relevant documentation excerpts with context.

### act

Execute runbooks or create files from templates.

**Parameters:**

- `directive` - What to do in natural language

**Usage Examples:**

- "Set up the .docent directory" (runs bootstrap runbook)
- "Check project health" (runs health-check runbook)
- "Create an ADR for PostgreSQL" (creates from template)
- "Run git commit workflow" (follows git-commit runbook)

**Returns:** Runbook instructions or created file confirmation.

### tell

Write or update documentation using natural language.

**Parameters:**

- `statement` - What you want to document

**Usage Examples:**

- "I learned that Redis requires AOF for durability"
- "We decided to use PostgreSQL over MongoDB"
- "Completed the authentication module with JWT"

**Returns:** Documentation update confirmation with location.

## Example Workflows

### Getting Started

```
You: "Initialize docent in this project"
Agent: [calls docent start]
Agent: "Session initialized. Available templates: adr, rfc...
       Available runbooks: bootstrap, health-check, git-commit..."

You: "Set up the .docent directory"
Agent: [calls docent act with "bootstrap"]
Agent: [follows bootstrap runbook to create structure]
```

### Asking Questions

```
You: "How do I run tests in this project?"
Agent: [calls docent ask with "how to run tests"]
Agent: "Based on docs/guides/testing.md: Use npm test for Mocha..."
```

### Following Runbooks

```
You: "Check project health"
Agent: [calls docent act with "health-check"]
Agent: [runs health checks following runbook]
Agent: "Health check complete. Git status clean, tests passing..."
```

### Capturing Work

```
You: "I just finished the auth module"
Agent: [calls docent tell with context]
Agent: "Documented in .docent/journals/2025-10-29.md:
       Completed JWT-based authentication..."
```

## Architecture

```
┌─────────────────────────┐
│  AI Agent (User)        │
│  Claude Code/Desktop    │
└──────────┬──────────────┘
           │ MCP Protocol (JSON-RPC via stdio)
           ▼
┌─────────────────────────┐
│  Docent MCP Server      │
│  (bin/mcp-server.js)    │
└──────────┬──────────────┘
           │
           ├─→ start  → Session initialization
           ├─→ ask    → Search documentation
           ├─→ act    → Execute runbooks/templates
           └─→ tell   → Capture knowledge
                │
                ▼
     ┌─────────────────────┐
     │ .docent/ directory  │
     ├─────────────────────┤
     │ /templates          │
     │ /runbooks           │
     │ /journals           │
     │ /sessions           │
     └─────────────────────┘
```

## Troubleshooting

### MCP Server Not Showing Up

**Check config file locations:**

- Claude Code: `~/.claude.json`
- Claude Desktop (macOS): `~/Library/Application Support/Claude/claude_desktop_config.json`
- Claude Desktop (Windows): `%APPDATA%\Claude\claude_desktop_config.json`
- Claude Desktop (Linux): `~/.config/Claude/claude_desktop_config.json`

**For local development, verify:**

1. Build succeeded: `ls /path/to/docent/bin/mcp-server.js`
2. Path is absolute (not relative)
3. File is executable: `chmod +x /path/to/docent/bin/mcp-server.js`

**Test manually:**

```bash
node /path/to/docent/bin/mcp-server.js
# Should start MCP server and log to stderr
```

### Tools Not Responding

Check logs for errors:

- Claude Desktop: `~/Library/Logs/Claude/mcp*.log`
- Look for "docent" related errors

Common issues:

- **"Tool not found"** - Restart agent after config changes
- **"Path not found"** - Verify project path exists
- **"Permission denied"** - Check file permissions

## How It Works

Docent uses natural language understanding:

1. **Agent receives request** - "Check project health"
2. **Agent translates to tool call** - `act("health-check")`
3. **Docent interprets directive** - Matches to health-check runbook
4. **Runbook executes** - Follows defined procedures
5. **Agent presents results** - Formats output for user

This ask/act/tell paradigm replaces rigid tool APIs with flexible natural language.

## Philosophy

**Documentation as conversation** - Rather than learning commands, you talk to your agent naturally. The agent uses docent to:

- Answer questions about your docs (ask)
- Follow operational procedures (act)
- Capture your knowledge (tell)

See [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) for the architectural evolution.

## Next Steps

- Read [MCP API Reference](./mcp-api-reference.md) for detailed tool documentation
- See [Architecture Overview](../architecture/overview.md) for system design
- Check [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) for architectural context
