# Docent

> Your guide through the codebase.

Documentation intelligence for AI agents. Just as a museum docent guides visitors through exhibits, explaining context and connections, docent guides AI agents through your codebase.

Docent makes your agent better at understanding and improving documentation. No commands to learn—just configure once and talk to your agent naturally.

## What Docent Does

Docent provides your agent with:

- **Project analysis** - Understand languages, frameworks, structure
- **Quality assessment** - Semantic evaluation, not pattern matching
- **Template library** - ADRs, RFCs, specs, guides
- **Context gathering** - Structured data for agent reasoning
- **Resource discovery** - Runbooks, templates, standards via URI
- **Workflow prompts** - Pre-defined procedures (RFC review, session recovery)

## Quick Start

### 1. Configure Your Agent

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

Then restart Claude Code.

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

### 2. Initialize in Your Project

First time in a project:

```
"Set up docent in this project"
```

Your agent will run `docent act bootstrap` to create the `.docent/` directory structure.

### 3. Use Naturally

Then just ask your agent about documentation:

- "How do I run tests?" - searches all docs
- "Check project health" - runs health-check runbook
- "Create an ADR for PostgreSQL" - generates from template
- "I finished the auth module" - captures to journal

Docent works behind the scenes through natural conversation.

## How It Works

Docent gives your AI agent four capabilities:

1. **Ask** - Search documentation to answer questions
2. **Act** - Execute runbooks and create from templates
3. **Tell** - Capture knowledge in natural language
4. **Start** - Initialize sessions and discover resources

The agent translates your natural language requests into appropriate tool calls. You never invoke docent directly—it just makes your agent smarter about documentation.

## MCP Tools

Docent provides four core MCP tools for documentation intelligence:

- **`start`** - Initialize session and list available resources (templates, runbooks, commands)
- **`ask`** - Search all documentation to answer questions
- **`act`** - Execute runbooks and create files from templates
- **`tell`** - Write or update documentation using natural language

### Natural Language Interface

All tools accept natural language. No rigid syntax to learn:

```
"How do I configure the build process?"        → ask
"Set up the .docent directory"                 → act bootstrap
"Create an ADR for using PostgreSQL"           → act create adr
"I learned that Redis requires AOF for writes" → tell
```

## Example Workflows

### Getting Started

```
You: "Initialize docent"

Agent: [calls docent start]
Agent: "Session initialized. Available templates: adr, rfc, runbook...
       Available runbooks: bootstrap, health-check, git-commit..."
```

### Asking Questions

```
You: "How do I run tests in this project?"

Agent: [calls docent ask with "how to run tests"]
Agent: "Based on your docs: npm test runs Mocha tests.
       Use npm run test:watch for development."
```

### Creating Documentation

```
You: "Document the decision to use PostgreSQL"

Agent: [calls docent act create adr]
Agent: "I'll create an ADR for the PostgreSQL decision..."
Agent: [creates docs/adr/adr-000N-postgresql.md]
```

### Following Runbooks

```
You: "Check project health"

Agent: [calls docent act health-check]
Agent: [follows runbook procedures]
Agent: "Health check complete. Git status clean,
       tests passing, 2 TODO comments found."
```

### Capturing Work

```
You: "Finished implementing auth module"

Agent: [calls docent tell with context]
Agent: "Documented: Completed JWT-based authentication
       with refresh tokens and role-based access."
```

## Target Audience

Solo developers using AI agents as part of their development workflow.

If you're using Claude, ChatGPT, or other AI coding assistants, docent helps them understand and improve your documentation.

## Documentation

- [MCP Setup Guide](.docent/guides/mcp-setup.md) - Detailed configuration
- [Architecture Overview](.docent/architecture/overview.md) - System design
- [ADRs](.docent/adr/) - Architecture decisions

## Development

```bash
# Clone and install (build happens automatically)
git clone https://github.com/tnez/docent.git
cd docent
npm install

# Add to ~/.claude.json for local development
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

# Restart Claude Code to load the MCP server
```

## Philosophy

Docent is infrastructure for AI agents, not a direct tool for humans.

Think of it like a database:

- Humans don't query databases directly
- Applications (agents) query databases
- Makes applications smarter

Docent makes agents smarter about documentation.
