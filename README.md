# Docent

> Your guide through the codebase.

Documentation intelligence for AI agents. Just as a museum docent guides visitors through exhibits, explaining context and connections, docent guides AI agents through your codebase.

Docent makes your agent better at understanding and improving documentation. No commands to learn—just configure once and talk to your agent naturally.

## What Docent Does

Docent provides your agent with:

- **Skill discovery** - Semantic search finds relevant procedural skills
- **Project analysis** - Understand languages, frameworks, structure
- **Quality assessment** - Semantic evaluation, not pattern matching
- **Template library** - ADRs, RFCs, specs, guides
- **Context gathering** - Structured data for agent reasoning
- **Resource discovery** - Skills, templates, standards via natural language
- **Workflow guidance** - Pre-defined procedures for git, GitHub, documentation

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

1. **Ask** - Search documentation and discover relevant skills
2. **Act** - Execute runbooks and create from templates (deprecated)
3. **Tell** - Capture knowledge in natural language
4. **Start** - Initialize sessions and discover resources

The agent translates your natural language requests into appropriate tool calls. You never invoke docent directly—it just makes your agent smarter about documentation.

### Skills-Based Architecture

Docent uses a **skills-based architecture** to provide procedural guidance to AI agents. Skills are organized by domain and discovered semantically through natural language queries.

**Bundled skill groups:**

- `git/*` - Git workflow skills (commits, branching, merging)
- `github/*` - GitHub operations (filing issues, creating PRs)
- `project/*` - Project management (bootstrap, health checks)
- `docent/*` - Documentation workflows (capturing work, processing sessions)

**How it works:**

1. Configure which skills to enable in `.docent/config.yaml`
2. Agent queries: "how do I commit my changes?"
3. Docent discovers the `git-commit` skill and returns full instructions
4. Agent follows the skill's guidance autonomously

**Example config:**

```yaml
version: "1.0.0"
root: .docent

skills:
  - docent/*      # Enable all docent skills
  - git/*         # Enable all git skills
  - github/*      # Enable GitHub skills
  - !github/fork  # Exclude specific skill
```

Skills are just markdown files with frontmatter—you can override bundled skills or add custom ones in `.docent/skills/`.

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

## Creating Custom Templates

Docent's `/tell` tool uses intelligent template classification to organize your knowledge. You can extend this with custom templates for project-specific documentation types.

### Adding a Custom Template

1. **Create template file** in `.docent/templates/` (overrides bundled templates with same name)
2. **Add frontmatter** with classification guidance
3. **Use naturally** - agent will classify your statements to the right template

### Template Structure

```markdown
---
name: incident-report
description: Post-mortem documentation for production incidents
directory: incidents
filename_prefix: incident
use_when: |
  Use this template when the user mentions:
  - Production incidents, outages, or downtime
  - Post-mortems or incident reviews
  - System failures or service disruptions
  - Root cause analysis
examples:
  - "We had a database outage this morning"
  - "Document the API timeout incident"
  - "Create post-mortem for the deployment failure"
---

# Incident Report: {{incident_name}}

**Date:** {{date}}
**Duration:** {{duration}}
**Severity:** {{severity}}

## Summary

[Brief description of what happened]

## Timeline

[Chronological events]

## Root Cause

[What caused the incident]

## Resolution

[How it was fixed]

## Prevention

[Steps to prevent recurrence]
```

### Template Frontmatter Fields

- **`name`** - Unique identifier (must match filename without `.md`)
- **`description`** - One-line explanation shown to users
- **`directory`** - Target subdirectory under `.docent/` (e.g., `incidents`, `specs`, `guides`)
- **`filename_prefix`** - Prefix for generated files (e.g., `incident-2025-10-29.md`)
- **`use_when`** - Semantic guidance for when this template applies (natural language)
- **`examples`** - Sample statements that should match this template

### How Classification Works

When you use `/tell`:

1. Agent receives all templates with their `use_when` guidance
2. Agent analyzes your statement semantically
3. Agent selects best matching template
4. File is created in correct directory with appropriate naming

### Examples

**Release notes template:**

```yaml
---
name: release-notes
description: Version release documentation
directory: releases
filename_prefix: release
use_when: |
  Use when documenting:
  - Version releases or deployments
  - Release notes or changelogs
  - Version-specific changes
examples:
  - "Document v2.0 release"
  - "We shipped the new dashboard today"
---
```

**Team meeting notes:**

```yaml
---
name: meeting-notes
description: Team meeting documentation
directory: meetings
filename_prefix: meeting
use_when: |
  Use when capturing:
  - Team meetings or standups
  - Meeting notes or minutes
  - Discussion outcomes or decisions from meetings
examples:
  - "Notes from today's planning meeting"
  - "Document sprint review discussion"
---
```

### Override Bundled Templates

To customize bundled templates, create a file with the same name in `.docent/templates/`:

- `.docent/templates/adr.md` - Override architecture decisions
- `.docent/templates/rfc.md` - Override request for comments
- `.docent/templates/runbook.md` - Override operational procedures

Your version takes precedence and includes your custom classification guidance.

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
