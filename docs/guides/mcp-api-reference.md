# MCP API Reference

Comprehensive reference for docent's Model Context Protocol (MCP) server capabilities.

## Overview

Docent exposes three types of MCP capabilities:

- **Tools** - Functions agents invoke with parameters to perform actions
- **Resources** - Content agents can read via URIs (templates, docs, journal)
- **Prompts** - Pre-defined prompt templates for common workflows

## Tools

Tools perform actions and return data to agents.

### `analyze`

Analyze project structure, languages, frameworks, and build tools.

**Parameters:**

```typescript
{
  path: string  // Path to project directory (required)
}
```

**Returns:**

```json
{
  "languages": ["TypeScript", "JavaScript"],
  "frameworks": ["MCP", "Express"],
  "buildTools": ["npm"],
  "structure": {
    "hasTests": true,
    "hasDocs": true,
    "sourceDir": "src"
  }
}
```

**Example Usage:**

```typescript
// Via MCP
const result = await client.callTool('analyze', {
  path: '/path/to/project'
})

// Via Claude Code
"Use docent to analyze this project"
```

---

### `audit`

Assess documentation quality using agent-driven semantic analysis. Returns a structured prompt for deep evaluation.

**Parameters:**

```typescript
{
  path: string       // Path to project directory (required)
  docsDir?: string   // Documentation directory name (default: "docs")
}
```

**Returns:**

A comprehensive assessment prompt including:
- Project context (languages, frameworks, structure)
- Documentation inventory (all markdown files found)
- Quality assessment criteria (completeness, accuracy, coherence, depth)
- Scoring guidance

**Example Usage:**

```typescript
// Via MCP
const prompt = await client.callTool('audit', {
  path: '/path/to/project',
  docsDir: 'documentation'  // optional
})

// Via Claude Code
"Use docent to audit our documentation"
```

---

### `list-templates`

List all available documentation templates.

**Parameters:** None

**Returns:**

```json
{
  "templates": [
    {
      "type": "adr",
      "name": "Architecture Decision Record",
      "description": "Document significant architectural decisions"
    },
    {
      "type": "rfc",
      "name": "Request for Comments",
      "description": "Propose and discuss significant changes"
    }
    // ... 10 total templates
  ]
}
```

**Available Templates:**
- `adr` - Architecture Decision Records
- `rfc` - Request for Comments
- `prd` - Product Requirements Documents
- `architecture-overview` - System architecture
- `api-documentation` - API reference
- `onboarding` - Developer onboarding
- `testing` - Testing philosophy
- `runbook` - Operational procedures
- `standards` - Coding standards
- `spec` - Behavioral specifications
- `patterns` - Design patterns
- `troubleshooting` - Troubleshooting guides
- `writing-software` - Software writing guide

**Example Usage:**

```typescript
// Via MCP
const templates = await client.callTool('list-templates', {})

// Via Claude Code
"Show me available docent templates"
```

---

### `get-template`

Retrieve a specific documentation template.

**Parameters:**

```typescript
{
  type: string  // Template type (e.g., "adr", "rfc", "spec")
}
```

**Returns:**

```json
{
  "content": "# [Template Title]\n\n[Template content...]",
  "type": "adr",
  "name": "Architecture Decision Record"
}
```

**Example Usage:**

```typescript
// Via MCP
const template = await client.callTool('get-template', {
  type: 'adr'
})

// Via Claude Code
"Get the ADR template from docent"
```

---

### `capture-work`

Append an entry to the work journal for session recovery.

**Parameters:**

```typescript
{
  summary: string           // Brief summary of work completed (required)
  discoveries?: string[]    // Key discoveries or insights (optional)
  next_steps?: string[]     // What should be done next (optional)
  questions?: string[]      // Open questions or ideas to explore (optional)
}
```

**Returns:**

Confirmation message with timestamp and entry preview.

**Example Usage:**

```typescript
// Via MCP
await client.callTool('capture-work', {
  summary: "Implemented MCP resource discovery",
  discoveries: [
    "Dynamic resource listing scales better than hard-coded lists",
    "Agents need contextual descriptions to choose resources"
  ],
  next_steps: [
    "Test reading specific resources",
    "Create example runbook"
  ],
  questions: [
    "Should we add metadata tags for filtering?"
  ]
})

// Via Claude Code
"Use docent to capture today's work"
```

## Resources

Resources provide read-only access to project documentation via URIs.

### URI Scheme

All resources use the `docent://` URI scheme:

```
docent://<type>/<identifier>
```

### Resource Types

#### Journal

**URI:** `docent://journal/current`

**Description:** Active work journal capturing session context, discoveries, and rationale.

**When to Use:**
- Session recovery (resume work after interruption)
- Understanding recent project decisions
- Finding partially explored ideas

**Example:**

```typescript
// Via MCP
const journal = await client.readResource('docent://journal/current')

// Via Claude Code
"Read the docent journal to see what we've been working on"
```

---

#### Templates

**URI Pattern:** `docent://template/<type>`

**Available Types:**
- `adr`, `rfc`, `prd`, `architecture-overview`, `api-documentation`
- `onboarding`, `testing`, `runbook`, `standards`, `spec`
- `patterns`, `troubleshooting`, `writing-software`

**Example:**

```typescript
// Via MCP
const adrTemplate = await client.readResource('docent://template/adr')

// Via Claude Code
"Read the ADR template resource"
```

---

#### Runbooks

**URI Pattern:** `docent://runbook/<name>`

Operational procedures and troubleshooting guides.

**Example Runbooks:**
- `docent://runbook/ci-cd-health-check` - Check GitHub Actions status

**When to Use:**
- Need step-by-step operational procedures
- Troubleshooting common issues
- Understanding deployment processes

**Example:**

```typescript
// Via MCP
const runbook = await client.readResource('docent://runbook/ci-cd-health-check')

// Via Claude Code
"How do I check CI/CD health? Read the docent runbook"
```

---

#### Guides

**URI Pattern:** `docent://guide/<name>`

Developer guides and setup instructions.

**Available Guides:**
- `docent://guide/contributing` - Contributing to docent
- `docent://guide/mcp-setup` - MCP server setup
- `docent://guide/neovim-markdown-setup` - Neovim configuration
- `docent://guide/testing` - Testing guide

**Example:**

```typescript
// Via MCP
const guide = await client.readResource('docent://guide/testing')

// Via Claude Code
"Read the testing guide from docent"
```

---

#### ADRs (Architecture Decision Records)

**URI Pattern:** `docent://adr/<filename>`

**Available ADRs:**
- `docent://adr/adr-0001-cli-platform-over-templates-only` (Superseded)
- `docent://adr/adr-0002-oclif-for-cli-framework` (Superseded)
- `docent://adr/adr-0003-agent-agnostic-architecture` (Accepted)
- `docent://adr/adr-0004-mcp-only-architecture` (Accepted)

**Example:**

```typescript
// Via MCP
const adr = await client.readResource('docent://adr/adr-0004-mcp-only-architecture')

// Via Claude Code
"Read ADR-0004 from docent"
```

---

#### RFCs (Requests for Comments)

**URI Pattern:** `docent://rfc/<filename>`

**Available RFCs:**
- `docent://rfc/rfc-0001-mcp-server-for-agent-integration` (Superseded)
- `docent://rfc/rfc-0002-add-behavioral-specification-support-for-agent-driven-development` (In Review)
- `docent://rfc/rfc-0003-workflow-orchestration-for-multi-agent-tasks` (Draft)
- `docent://rfc/rfc-0004-work-artifact-capture-and-surfacing` (Draft)
- `docent://rfc/rfc-0005-enhanced-mcp-architecture` (Draft)

**Example:**

```typescript
// Via MCP
const rfc = await client.readResource('docent://rfc/rfc-0005-enhanced-mcp-architecture')

// Via Claude Code
"Read RFC-0005 from docent"
```

### Security

**Path Traversal Protection:** All resource URIs are validated to prevent directory traversal attacks. Attempts to use `..`, `~`, or absolute paths will be blocked.

```typescript
// ❌ Blocked
docent://template/../../../etc/passwd
docent://runbook/~/sensitive-file

// ✅ Allowed
docent://template/adr
docent://runbook/ci-cd-health-check
```

## Prompts

Prompts provide pre-defined workflows that agents can invoke.

### `resume-work`

Session recovery: analyze recent work and provide context to continue.

**Arguments:** None

**What It Does:**
1. Reads work journal
2. Gets recent git commits
3. Checks git status
4. Scans for TODOs in code
5. Suggests health checks
6. Generates comprehensive continuation prompt

**When to Use:**
- Returning to work after a break
- Context window reset
- New agent joining session
- Understanding current project state

**Example:**

```typescript
// Via MCP
const prompt = await client.getPrompt('resume-work', {})

// Via Claude Code
"Use docent's resume-work prompt to catch me up"
```

---

### `review-rfc`

Conduct multi-perspective RFC review with context gathering.

**Arguments:**

```typescript
{
  rfc_path: string        // Path to RFC file (required)
  perspective?: string    // "architecture", "security", "implementation", "all" (optional)
}
```

**What It Does:**
1. Reads RFC content
2. Analyzes project context
3. Provides review criteria for chosen perspective
4. Generates structured review prompt

**When to Use:**
- Reviewing proposed changes
- Getting feedback on RFCs
- Multi-perspective analysis

**Example:**

```typescript
// Via MCP
const prompt = await client.getPrompt('review-rfc', {
  rfc_path: 'docs/rfcs/rfc-0005-enhanced-mcp-architecture.md',
  perspective: 'architecture'
})

// Via Claude Code
"Review RFC-0005 from an architecture perspective using docent"
```

---

### `create-adr`

Create new Architecture Decision Record with guided process.

**Arguments:**

```typescript
{
  title: string  // ADR title (required)
}
```

**What It Does:**
1. Retrieves ADR template
2. Guides through ADR sections (context, decision, consequences, alternatives)
3. Prompts for necessary information
4. Generates structured ADR

**When to Use:**
- Documenting architectural decisions
- Creating formal decision records

**Example:**

```typescript
// Via MCP
const prompt = await client.getPrompt('create-adr', {
  title: 'Use PostgreSQL for primary datastore'
})

// Via Claude Code
"Create an ADR for using PostgreSQL"
```

---

### `plan-feature`

Research and plan new feature through research → design → spec phases.

**Arguments:**

```typescript
{
  description: string  // Feature description (required)
}
```

**What It Does:**
1. Analyzes project context
2. Guides through research phase (requirements, existing patterns)
3. Guides through design phase (architecture, components)
4. Guides through specification phase (acceptance criteria, implementation steps)

**When to Use:**
- Planning new features
- Breaking down complex work
- Creating implementation specs

**Example:**

```typescript
// Via MCP
const prompt = await client.getPrompt('plan-feature', {
  description: 'Add real-time collaboration to the editor'
})

// Via Claude Code
"Plan the real-time collaboration feature using docent"
```

---

### `research-topic`

Conduct structured research on a topic and create documentation.

**Arguments:**

```typescript
{
  topic: string      // Research topic or question (required)
  context?: string   // Additional context (optional)
}
```

**What It Does:**
1. Provides 3-phase research workflow (Discovery → Synthesis → Documentation)
2. Guides WebSearch and WebFetch usage
3. Includes document template with required sections
4. Generates filename from topic
5. Adds project context for relevance

**When to Use:**
- Investigating technical topics
- Researching implementation options
- Creating knowledge base articles
- Exploring best practices

**Example:**

```typescript
// Via MCP
const prompt = await client.getPrompt('research-topic', {
  topic: 'WebSocket vs Server-Sent Events for real-time updates',
  context: 'We need sub-second latency and support for 1000+ concurrent users'
})

// Via Claude Code
"Research WebSocket vs SSE using docent"
```

## Common Patterns

### Session Recovery

```typescript
// 1. Resume work
const resumePrompt = await client.getPrompt('resume-work', {})

// 2. Read journal for details
const journal = await client.readResource('docent://journal/current')

// 3. Continue work
```

### Feature Development Workflow

```typescript
// 1. Plan feature
const planPrompt = await client.getPrompt('plan-feature', {
  description: 'Add user authentication'
})

// 2. Create spec
// (agent creates spec based on plan)

// 3. Review design
// (agent or human reviews)

// 4. Document decision
const adrPrompt = await client.getPrompt('create-adr', {
  title: 'Use JWT for authentication tokens'
})

// 5. Capture work
await client.callTool('capture-work', {
  summary: 'Planned authentication feature',
  next_steps: ['Implement JWT middleware', 'Add login endpoint']
})
```

### Documentation Workflow

```typescript
// 1. Analyze project
const analysis = await client.callTool('analyze', {
  path: '.'
})

// 2. Audit documentation
const auditPrompt = await client.callTool('audit', {
  path: '.',
  docsDir: 'docs'
})

// 3. Get template for missing docs
const template = await client.callTool('get-template', {
  type: 'testing'
})

// 4. Create documentation
// (agent creates docs based on template)
```

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

## Error Handling

All tools return errors in a standard format:

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

Common errors:

- **Path not found** - Verify project path exists
- **Resource not found** - Check URI syntax and resource availability
- **Invalid template type** - Use `list-templates` to see available types
- **Permission denied** - Check file permissions

## Version Information

To check docent version:

```bash
npm list @tnezdev/docent
```

Or inspect the MCP server info when connecting.

## Further Reading

- [MCP Setup Guide](./mcp-setup.md) - Detailed configuration
- [Contributing Guide](./contributing.md) - Development setup
- [Testing Guide](./testing.md) - Testing docent
- [MCP Protocol Specification](https://modelcontextprotocol.io/) - Official MCP docs
