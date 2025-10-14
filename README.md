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

### 2. Talk to Your Agent

That's it. Just ask about documentation:

- "How's my documentation?"
- "Set up documentation structure"
- "Create an ADR for switching to PostgreSQL"
- "What should I document for this feature?"

Your agent will use docent automatically.

## How It Works

When you ask your agent about documentation, it:

1. Uses docent to analyze your project
2. Gathers context about what exists
3. Reasons semantically (not pattern matching)
4. Provides contextual recommendations

You never invoke docent directly—it just makes your agent smarter.

## Available Tools

Agents can use these docent tools via MCP:

- **`analyze`** - Project structure, languages, frameworks
- **`audit-quality`** - Semantic documentation assessment
- **`list-templates`** - Available documentation templates
- **`get-template`** - Fetch a specific template

## Example Workflows

### Assess Documentation Quality

```
You: "How's my documentation?"

Agent: [uses docent audit-quality]
Agent: "Your documentation is solid (73/100).
       Strong architectural docs, missing testing guide.
       Want me to draft one based on your test structure?"
```

### Create New Documentation

```
You: "Document the decision to use PostgreSQL"

Agent: [uses docent get-template with type 'adr']
Agent: [creates docs/adr/adr-0004-postgresql.md]
Agent: "I've documented the PostgreSQL decision. Review?"
```

### Set Up Documentation Structure

```
You: "Initialize documentation for this project"

Agent: [uses docent analyze]
Agent: "TypeScript CLI tool with Mocha testing.
       I'll create architecture/, adr/, and specs/ directories
       with appropriate templates. Proceed?"
```

## Target Audience

Solo developers using AI agents as part of their development workflow.

If you're using Claude, ChatGPT, or other AI coding assistants, docent helps them understand and improve your documentation.

## Documentation

- [MCP Setup Guide](docs/guides/mcp-setup.md) - Detailed configuration
- [Architecture Overview](docs/architecture/overview.md) - System design
- [RFCs](docs/rfcs/) - Proposed features

## Development

```bash
# Clone and build
git clone https://github.com/tnez/docent.git
cd docent
npm install
npm run build

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

## License

MIT © Travis Nez

## Philosophy

Docent is infrastructure for AI agents, not a direct tool for humans.

Think of it like a database:
- Humans don't query databases directly
- Applications (agents) query databases
- Makes applications smarter

Docent makes agents smarter about documentation.
