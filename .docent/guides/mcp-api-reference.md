# MCP API Reference

Comprehensive reference for docent's Model Context Protocol (MCP) server capabilities.

## Overview

Docent provides four natural language MCP tools that enable AI agents to:

- **start** - Initialize sessions and discover available resources
- **ask** - Search documentation to answer questions
- **act** - Execute runbooks and create from templates
- **tell** - Capture knowledge in natural language

All tools accept natural language input - no rigid command syntax required.

## Tools

### start

Initialize docent session and list available resources.

**Parameters:**

```typescript
{
  path?: string  // Optional project path (defaults to current directory)
}
```

**Returns:**

Markdown-formatted response including:

- Available templates (adr, rfc, runbook, etc.)
- Available runbooks (bootstrap, health-check, git-commit, etc.)
- Project information
- Usage instructions

**Example Usage:**

```typescript
// Via MCP
const result = await client.callTool('start', {
  path: '/path/to/project'
})

// Via Claude Code
"Initialize docent"
"Start docent in this project"
```

**Use Cases:**

- Beginning a new session
- Discovering what's available
- Getting quick reference information

---

### ask

Search all documentation to answer questions.

**Parameters:**

```typescript
{
  query: string      // Your question in natural language (required)
  path?: string      // Project path (defaults to current directory)
  limit?: number     // Max results to return (default: 10)
}
```

**Returns:**

Markdown-formatted search results with:

- Matching documentation excerpts
- File paths and context
- Relevance-ranked results

**Example Usage:**

```typescript
// Via MCP
const result = await client.callTool('ask', {
  query: 'how do I run tests',
  limit: 5
})

// Via Claude Code
"How do I run tests in this project?"
"What's our authentication approach?"
"Search docs for API documentation"
```

**Use Cases:**

- Answering questions about the project
- Finding relevant documentation
- Understanding implementation details
- Discovering existing patterns

---

### act

Execute runbooks or create files from templates.

**Parameters:**

```typescript
{
  directive: string  // What to do, in natural language (required)
  path?: string      // Project path (defaults to current directory)
}
```

**Recognizes Two Types of Actions:**

1. **Runbook execution** - Follows operational procedures
   - "bootstrap" - Set up .docent directory
   - "health-check" - Run project health checks
   - "git-commit" - Create professional commits
   - "file-issue" - File GitHub issues
   - Custom runbooks in `.docent/runbooks/`

2. **Template creation** - Creates files from templates
   - "create adr [title]" - Architecture Decision Record
   - "create rfc [title]" - Request for Comments
   - "create runbook [title]" - Operational procedure
   - Other templates: prd, journal-entry, meeting-notes, etc.

**Returns:**

- For runbooks: Markdown-formatted instructions to follow
- For templates: Confirmation with file path created

**Example Usage:**

```typescript
// Via MCP - Runbooks
await client.callTool('act', {
  directive: 'bootstrap'
})
await client.callTool('act', {
  directive: 'health-check'
})

// Via MCP - Templates
await client.callTool('act', {
  directive: 'create adr use-postgresql-over-mongodb'
})

// Via Claude Code
"Set up the .docent directory"
"Check project health"
"Create an ADR for using PostgreSQL"
"Run the git commit workflow"
```

**Use Cases:**

- Following operational procedures
- Creating structured documentation
- Automating common workflows
- Maintaining consistency

---

### tell

Write or update documentation using natural language.

**Parameters:**

```typescript
{
  statement: string  // What you want to document (required)
  path?: string      // Project path (defaults to current directory)
}
```

**Behavior:**

The `tell` tool uses AI to understand your statement and determine:

- What type of documentation to update
- Where to write it (.docent/journals/ or .docent/notes/)
- How to format the content

**Returns:**

Confirmation with:

- Where the documentation was written
- What was captured
- When it was recorded

**Example Usage:**

```typescript
// Via MCP
await client.callTool('tell', {
  statement: 'I learned that Redis requires AOF persistence for write durability'
})

await client.callTool('tell', {
  statement: 'Completed JWT authentication with refresh tokens'
})

// Via Claude Code
"I learned that Redis needs AOF for durability"
"We decided to use PostgreSQL over MongoDB for transactions"
"Finished implementing the auth module with JWT"
```

**Use Cases:**

- Capturing learnings during development
- Recording decisions and rationale
- Documenting work completion
- Tracking discoveries
- Creating knowledge base

---

## Configuration

### Claude Code

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

For local development:

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

### Claude Desktop

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

## Common Workflows

### Session Start

```typescript
// 1. Initialize
const init = await client.callTool('start', {})
// Returns available resources and commands

// 2. Bootstrap if needed
await client.callTool('act', {
  directive: 'bootstrap'
})
// Creates .docent/ structure
```

### Documentation Q&A

```typescript
// Ask questions
const answer = await client.callTool('ask', {
  query: 'how do I deploy this application'
})
// Returns relevant docs about deployment
```

### Create Documentation

```typescript
// Create an ADR
await client.callTool('act', {
  directive: 'create adr switch-to-microservices'
})
// Creates docs/adr/adr-000N-switch-to-microservices.md

// Capture knowledge
await client.callTool('tell', {
  statement: 'Microservices deployment uses Docker Compose for local dev'
})
// Appends to .docent/journals/YYYY-MM-DD.md
```

### Run Health Checks

```typescript
// Check project health
await client.callTool('act', {
  directive: 'health-check'
})
// Returns checklist of project health indicators
```

## Error Handling

All tools return errors in standard MCP format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: <error message>"
    }
  ],
  "isError": true
}
```

**Common Errors:**

- **"Path not found"** - Verify project path exists
- **"Directive not understood"** - Rephrase your request
- **"No results found"** - Try different search terms
- **"Template not found"** - Use `start` to list available templates

## Natural Language Tips

Docent understands natural language, so you don't need to memorize exact syntax:

**Good examples:**

- ✅ "Set up docent" → `act('bootstrap')`
- ✅ "How do I test?" → `ask('how do I test')`
- ✅ "Make an ADR for Postgres" → `act('create adr postgres')`
- ✅ "I learned X does Y" → `tell('I learned X does Y')`

**The agent translates your intent to appropriate tool calls.**

## Philosophy

Docent embraces **conversation over commands**:

1. **No rigid syntax** - Speak naturally to your agent
2. **Intent-based** - Agent understands what you want
3. **Context-aware** - Docent adapts to your project
4. **Knowledge capture** - Easy to document as you work

See [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) for the architectural rationale.

## Version Information

To check docent version:

```bash
npm list @tnezdev/docent
```

Current MCP server version is reported on connection.

## Further Reading

- [MCP Setup Guide](./mcp-setup.md) - Configuration instructions
- [Architecture Overview](../architecture/overview.md) - System design
- [ADR-0004](../adr/adr-0004-mcp-only-architecture.md) - Why MCP-only
- [MCP Protocol Specification](https://modelcontextprotocol.io/) - Official MCP docs
