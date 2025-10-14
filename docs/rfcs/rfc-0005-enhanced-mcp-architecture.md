# RFC-0005: Enhanced MCP Architecture with Resources and Prompts

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-13
**Updated:** 2025-10-13
**Related:** ADR-0004, RFC-0001, RFC-0003, PRD-0001

## Summary

Extend docent's MCP server from tools-only to full MCP capabilities by adding **resources** (URI-based documentation content) and **prompts** (pre-defined workflow templates). This transforms docent from "action executor" to "context provider" - agents discover runbooks, templates, standards, and journal entries via resources, then execute workflows via prompts. This architecture elegantly replaces CLI-based workflow orchestration (RFC-0003) with MCP-native patterns while maintaining docent's role as documentation intelligence, not execution engine.

## Motivation

### Problem Statement

**Current Limitation: Tools-Only MCP Server**

Following ADR-0004 (MCP-only architecture), docent currently exposes only "tools" via MCP:
- `analyze` - Project structure analysis
- `audit-quality` - Agent-driven documentation assessment
- `audit` - Heuristic documentation audit
- `list-templates` / `get-template` - Template discovery

This tools-only approach works but misses MCP's full potential:

**What we're missing:**

1. **Resources** (URI-based content)
   - Agents cannot browse available documentation
   - No discovery mechanism for runbooks, standards, policies
   - Templates exposed as tools instead of browsable content
   - Journal entries require file system access

2. **Prompts** (workflow templates)
   - No pre-defined workflows (agent must invent process)
   - Workflow orchestration unclear (RFC-0003 proposed CLI commands)
   - No standardized procedures for common tasks
   - Knowledge locked in documentation, not executable

**Real-world pain points:**

```
User: "Can you create a preview database branch?"

Without prompts/resources:
1. Agent searches codebase for database info
2. Agent guesses at process
3. User corrects agent multiple times
4. 15 minutes of trial and error

With prompts/resources:
1. Agent: docent.prompt("Create Preview DB Branch")
2. Prompt includes: runbook reference, context gathering steps
3. Agent: docent.resource("runbook://preview-branch")
4. Agent follows runbook, executes correctly
5. 30 seconds, first try ✅
```

**User validation:** "That 'Beautiful Pattern' is exactly what I want ✅"

**The Beautiful Pattern:**
```
Discovery → Context → Execution
   ↓           ↓          ↓
analyze()   resource()  (agent acts)
```

Docent provides **documentation as configuration for agents**, not execution.

**Who is affected:**
- Solo developers using docent with AI agents
- Teams establishing operational procedures
- Anyone building agent-driven workflows
- Projects needing documentation-driven development

**Consequences of not solving:**
- Docent remains "tools only" (1/3 of MCP capabilities)
- Workflows require custom agent code (not standardized)
- Knowledge buried in docs (not discoverable by agents)
- RFC-0003 workflow orchestration requires CLI (more complex)

### The MCP Opportunity

MCP provides three complementary capabilities:

#### 1. Tools (Current: ✅)
**Purpose:** Actions requiring computation

**Examples:**
- `analyze(path)` → AnalysisResult
- `audit-quality(path)` → QualityAssessment

**When to use:** Active operations that transform or analyze data

#### 2. Resources (Not Using: ❌)
**Purpose:** URI-based content discovery and retrieval

**Pattern:** `docent://{type}/{identifier}`

**Examples:**
- `docent://runbook/preview-branch` → Step-by-step DB branch creation
- `docent://template/adr` → ADR template markdown
- `docent://standard/testing` → Team testing standards
- `docent://journal/current` → Active work journal

**Benefits:**
- **Discoverable**: Agents list available resources
- **Cacheable**: MCP clients cache content
- **Feels native**: Documentation as first-class content
- **Version-aware**: Resources can include version/timestamp

**Why this matters:** Runbooks become instructions agents can follow, not just markdown files they search for.

#### 3. Prompts (Not Using: ❌)
**Purpose:** Pre-defined workflow templates agents invoke

**Examples:**
- "Review RFC" → Multi-perspective RFC review with context gathering
- "Resume Work" → Session recovery using journal + git + todos
- "Create ADR" → Guided ADR creation with template + standards
- "Plan Feature" → Research → Design → Spec generation

**Benefits:**
- **Workflow as code**: Procedures become invocable
- **Standardized**: Same process every time
- **Discoverable**: Agents see available workflows
- **Parameterized**: Pass arguments (rfc_path, perspective, etc.)

**Why this is huge:**
- RFC-0003 proposed `docent workflow start review-rfc` (CLI orchestration)
- **Better approach:** MCP prompt "Review RFC" (native workflow)
- Simpler, more elegant, MCP-native

### Goals

1. **Enable content discovery**: Agents browse runbooks, templates, standards, docs, journal
2. **Standardize workflows**: Common procedures invocable via prompts
3. **Replace CLI workflows**: MCP prompts > CLI orchestration (simpler architecture)
4. **Maintain "context provider" role**: Docent provides documentation, agents execute
5. **Preserve tools**: Keep existing tools, enhance with resources/prompts
6. **Stay agent-agnostic**: Work with any MCP-compatible agent

### Non-Goals

1. **Not an execution engine**: Docent doesn't run commands (agents do)
2. **Not replacing templates directory**: Resources expose existing templates
3. **Not a general workflow engine**: Prompts guide, don't control
4. **Not breaking existing tools**: Additive enhancement

## Detailed Design

### Overview

Extend docent's MCP server (`src/mcp/server.ts`) to expose three capabilities:

```
┌─────────────────────────────────────────────────┐
│         Docent MCP Server (Enhanced)            │
├─────────────────────────────────────────────────┤
│ TOOLS (existing)                                │
│  - analyze(path) → project analysis             │
│  - audit-quality(path) → quality assessment     │
│  - audit(path) → heuristic audit                │
├─────────────────────────────────────────────────┤
│ RESOURCES (new)                                 │
│  - docent://runbook/{name}                      │
│  - docent://template/{type}                     │
│  - docent://standard/{type}                     │
│  - docent://doc/{path}                          │
│  - docent://journal/current                     │
├─────────────────────────────────────────────────┤
│ PROMPTS (new)                                   │
│  - Review RFC (perspective, rfc_path)           │
│  - Resume Work ()                               │
│  - Create ADR (title)                           │
│  - Plan Feature (description)                   │
│  - Create Preview DB Branch ()                  │
└─────────────────────────────────────────────────┘
```

**Architectural Principle (from context):**

> "Docent provides **context** (discovery + instructions), not **execution**.
> Documentation becomes **configuration for AI agents**."

### Architecture

```
┌──────────────────────────────────────────┐
│            AI Agent                       │
└────┬──────────┬──────────┬───────────────┘
     │          │          │
  Tools      Resources   Prompts
     │          │          │
     ▼          ▼          ▼
┌─────────────────────────────────────────┐
│       MCP Server (docent)                │
│  ┌──────────────────────────────────┐   │
│  │  Tools Handler                    │   │
│  │  - analyze()                      │   │
│  │  - audit-quality()                │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Resources Handler                │   │
│  │  - List resources by type         │   │
│  │  - Read resource content          │   │
│  │  - Parse URI patterns             │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Prompts Handler                  │   │
│  │  - List available prompts         │   │
│  │  - Build prompt with context      │   │
│  │  - Parameterized templates        │   │
│  └──────────────────────────────────┘   │
└───────────────┬─────────────────────────┘
                │
                ▼
    ┌──────────────────────────┐
    │   Project Documentation   │
    │   - templates/            │
    │   - docs/                 │
    │   - .docent/journal.md    │
    │   - runbooks/             │
    │   - standards/            │
    └──────────────────────────┘
```

### Implementation Details

#### 1. Resources Implementation

**URI Pattern:** `docent://{type}/{identifier}`

**Supported Resource Types:**

```typescript
// src/mcp/resources/types.ts

type ResourceType =
  | 'runbook'    // Operational procedures
  | 'template'   // Documentation templates
  | 'standard'   // Project standards/conventions
  | 'doc'        // Project documentation
  | 'journal'    // Work journal

interface Resource {
  uri: string                    // docent://runbook/preview-branch
  name: string                   // "Create Preview Database Branch"
  description?: string           // "Step-by-step procedure..."
  mimeType: string               // "text/markdown"
  metadata?: {
    tags?: string[]
    lastModified?: string
    related?: string[]           // Related resource URIs
  }
}
```

**Resource Handlers:**

```typescript
// src/mcp/resources/handlers.ts

class ResourceHandler {
  async list(type?: ResourceType): Promise<Resource[]> {
    // List all resources, optionally filtered by type
    // Returns: Array of Resource objects with URIs
  }

  async read(uri: string): Promise<ResourceContent> {
    const parsed = this.parseUri(uri)

    switch (parsed.type) {
      case 'runbook':
        return this.readRunbook(parsed.identifier)
      case 'template':
        return this.readTemplate(parsed.identifier)
      case 'standard':
        return this.readStandard(parsed.identifier)
      case 'doc':
        return this.readDoc(parsed.identifier)
      case 'journal':
        return this.readJournal(parsed.identifier)
      default:
        throw new Error(`Unknown resource type: ${parsed.type}`)
    }
  }

  private parseUri(uri: string): { type: ResourceType; identifier: string } {
    // Parse: docent://runbook/preview-branch
    // Returns: { type: 'runbook', identifier: 'preview-branch' }
  }

  private async readRunbook(name: string): Promise<ResourceContent> {
    // Look in: docs/runbooks/{name}.md
    const path = `docs/runbooks/${name}.md`
    const content = await fs.readFile(path, 'utf-8')
    return {
      uri: `docent://runbook/${name}`,
      mimeType: 'text/markdown',
      text: content
    }
  }

  private async readTemplate(type: string): Promise<ResourceContent> {
    // Look in: templates/{type}-template.md
    const path = `templates/${type}-template.md`
    const content = await fs.readFile(path, 'utf-8')
    return {
      uri: `docent://template/${type}`,
      mimeType: 'text/markdown',
      text: content
    }
  }

  private async readJournal(identifier: string): Promise<ResourceContent> {
    // identifier: 'current' | 'YYYY-MM-DD'
    const path = identifier === 'current'
      ? '.docent/journal.md'
      : `.docent/journal-${identifier}.md`

    const content = await fs.readFile(path, 'utf-8')
    return {
      uri: `docent://journal/${identifier}`,
      mimeType: 'text/markdown',
      text: content
    }
  }

  // ... similar for standards, docs
}
```

**MCP Server Integration:**

```typescript
// src/mcp/server.ts

server.setRequestHandler('resources/list', async () => {
  const handler = new ResourceHandler()
  const resources = await handler.list()

  return {
    resources: resources.map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType
    }))
  }
})

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params
  const handler = new ResourceHandler()
  const content = await handler.read(uri)

  return {
    contents: [{
      uri: content.uri,
      mimeType: content.mimeType,
      text: content.text
    }]
  }
})
```

#### 2. Prompts Implementation

**Prompt Structure:**

```typescript
// src/mcp/prompts/types.ts

interface Prompt {
  name: string                   // "Review RFC"
  description: string            // "Multi-perspective RFC review"
  arguments?: PromptArgument[]   // Parameters required
}

interface PromptArgument {
  name: string                   // "rfc_path"
  description: string            // "Path to RFC file"
  required: boolean
}

interface PromptMessage {
  role: 'user' | 'assistant'
  content: {
    type: 'text' | 'resource'
    text?: string                // Rendered prompt
    resource?: {
      uri: string                // docent://runbook/preview-branch
      text: string               // Resource content
    }
  }
}
```

**Prompt Definitions:**

```typescript
// src/mcp/prompts/definitions.ts

const PROMPTS: Record<string, Prompt> = {
  'review-rfc': {
    name: 'Review RFC',
    description: 'Conduct multi-perspective RFC review with context gathering',
    arguments: [
      {
        name: 'rfc_path',
        description: 'Path to RFC file (e.g., docs/rfcs/rfc-0005-...md)',
        required: true
      },
      {
        name: 'perspective',
        description: 'Review perspective: architecture, security, implementation, or all',
        required: false
      }
    ]
  },

  'resume-work': {
    name: 'Resume Work',
    description: 'Session recovery: analyze recent work and provide context to continue',
    arguments: []
  },

  'create-adr': {
    name: 'Create ADR',
    description: 'Create new Architecture Decision Record with guided process',
    arguments: [
      {
        name: 'title',
        description: 'ADR title',
        required: true
      }
    ]
  },

  'plan-feature': {
    name: 'Plan Feature',
    description: 'Research and plan new feature: research → design → spec',
    arguments: [
      {
        name: 'description',
        description: 'Feature description',
        required: true
      }
    ]
  },

  'create-preview-branch': {
    name: 'Create Preview DB Branch',
    description: 'Create database preview branch following project runbook',
    arguments: []
  }
}
```

**Prompt Builder:**

```typescript
// src/mcp/prompts/builder.ts

class PromptBuilder {
  async build(
    promptName: string,
    args: Record<string, string>
  ): Promise<PromptMessage[]> {
    switch (promptName) {
      case 'review-rfc':
        return this.buildReviewRFC(args)
      case 'resume-work':
        return this.buildResumeWork(args)
      case 'create-preview-branch':
        return this.buildCreatePreviewBranch(args)
      default:
        throw new Error(`Unknown prompt: ${promptName}`)
    }
  }

  private async buildReviewRFC(args: Record<string, string>): Promise<PromptMessage[]> {
    const { rfc_path, perspective = 'architecture' } = args

    // 1. Gather context (using existing tools)
    const analysis = await analyzeProject('.')
    const rfcContent = await fs.readFile(rfc_path, 'utf-8')

    // 2. Find related documents
    const relatedDocs = await this.findRelatedDocs(rfcContent)

    // 3. Build prompt
    const prompt = `
# RFC Review: ${perspective} Perspective

## Your Task

Conduct a thorough ${perspective} review of the RFC at: ${rfc_path}

## Review Criteria

${this.getReviewCriteria(perspective)}

## Context Provided

### RFC Content
<rfc>
${rfcContent}
</rfc>

### Related Documentation
${relatedDocs.map(d => `- ${d.path}: ${d.summary}`).join('\n')}

### Project Analysis
- Languages: ${analysis.languages.join(', ')}
- Frameworks: ${analysis.frameworks.join(', ')}
- Architecture: ${analysis.architecture}

## Process

1. Read the RFC carefully
2. Review related documentation for context
3. Apply ${perspective} review criteria
4. Identify blockers, concerns, and recommendations
5. Provide structured assessment

## Output Format

Provide assessment using this structure:
- **Overall Assessment**: APPROVE | APPROVE_WITH_CHANGES | REQUEST_CHANGES | REJECT
- **Blockers**: Critical issues that must be addressed
- **Major Concerns**: Significant issues to consider
- **Minor Issues**: Small improvements
- **Recommendations**: Suggestions for enhancement
- **Strengths**: What's done well
`

    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  }

  private async buildCreatePreviewBranch(args: Record<string, string>): Promise<PromptMessage[]> {
    // 1. Get runbook resource
    const runbookUri = 'docent://runbook/preview-branch'

    // 2. Get project context
    const analysis = await analyzeProject('.')

    const prompt = `
# Create Database Preview Branch

## Your Task

Create a database preview branch for this project by following the runbook.

## Runbook

The step-by-step procedure is provided as a resource: ${runbookUri}

Please:
1. Read the runbook using \`docent.resource('${runbookUri}')\`
2. Follow each step in the runbook
3. Report progress and any issues
4. Confirm completion

## Project Context

- Database: ${analysis.database || 'Unknown (check runbook)'}
- Environment: ${process.env.NODE_ENV || 'development'}

## Important

- Follow the runbook exactly
- Verify each step before proceeding
- Report any errors or unexpected behavior
`

    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      },
      {
        role: 'user',
        content: {
          type: 'resource',
          resource: {
            uri: runbookUri,
            text: await this.readResource(runbookUri)
          }
        }
      }
    ]
  }

  private async buildResumeWork(args: Record<string, string>): Promise<PromptMessage[]> {
    // 1. Read journal
    const journal = await this.readResource('docent://journal/current')

    // 2. Get recent commits
    const commits = await this.getRecentCommits(10)

    // 3. Check git status
    const status = await this.getGitStatus()

    // 4. Scan for TODOs
    const todos = await this.findTodos()

    const prompt = `
# Resume Work Session

## Your Task

Analyze recent work and provide context to help me continue where I left off.

## Context Gathered

### Work Journal (${'.docent/journal.md'})
<journal>
${journal}
</journal>

### Recent Commits (last 10)
${commits.map(c => `- ${c.hash.slice(0, 7)}: ${c.message}`).join('\n')}

### Git Status
\`\`\`
${status}
\`\`\`

### TODOs Found
${todos.length > 0 ? todos.map(t => `- ${t.file}:${t.line}: ${t.text}`).join('\n') : 'None'}

## What I Need

1. **Summary**: What was I working on? (2-3 sentences)
2. **Status**: Where did I leave off?
3. **Next Steps**: What should I do next? (prioritized list)
4. **Context**: Anything important I should remember?
5. **Blockers**: Any unresolved issues?

Please provide a concise summary to help me resume work effectively.
`

    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  }

  private getReviewCriteria(perspective: string): string {
    // Load from: templates/review-criteria/{perspective}.md
    // Or inline definitions
    switch (perspective) {
      case 'architecture':
        return `
- System design clarity and completeness
- Integration with existing architecture
- Scalability and maintainability
- Technical debt implications
- Alternative approaches considered
`
      case 'security':
        return `
- Security implications and threat model
- Data protection and privacy
- Authentication and authorization
- Input validation and sanitization
- Secrets management
`
      case 'implementation':
        return `
- Feasibility and complexity
- Testing strategy
- Migration and rollout plan
- Performance implications
- Developer experience
`
      default:
        return 'General review criteria'
    }
  }

  private async readResource(uri: string): Promise<string> {
    const handler = new ResourceHandler()
    const content = await handler.read(uri)
    return content.text
  }

  // Helper methods for context gathering
  private async findRelatedDocs(content: string): Promise<Array<{path: string, summary: string}>> {
    // Implementation: parse references, find related ADRs/RFCs
    return []
  }

  private async getRecentCommits(count: number): Promise<Array<{hash: string, message: string}>> {
    // Implementation: git log
    return []
  }

  private async getGitStatus(): Promise<string> {
    // Implementation: git status
    return ''
  }

  private async findTodos(): Promise<Array<{file: string, line: number, text: string}>> {
    // Implementation: search for TODO/FIXME comments
    return []
  }
}
```

**MCP Server Integration:**

```typescript
// src/mcp/server.ts

server.setRequestHandler('prompts/list', async () => {
  return {
    prompts: Object.values(PROMPTS)
  }
})

server.setRequestHandler('prompts/get', async (request) => {
  const { name, arguments: args } = request.params

  const builder = new PromptBuilder()
  const messages = await builder.build(name, args || {})

  return {
    messages
  }
})
```

### Resource URI Patterns

**Standardized URI scheme:**

```
docent://{type}/{identifier}[?{params}]

Types:
- runbook/{name}              → docs/runbooks/{name}.md
- template/{type}             → templates/{type}-template.md
- standard/{type}             → docs/standards/{type}.md
- doc/{path}                  → docs/{path}
- journal/{date|'current'}    → .docent/journal[-{date}].md

Examples:
- docent://runbook/preview-branch
- docent://template/adr
- docent://standard/testing
- docent://doc/architecture/overview
- docent://journal/current
- docent://journal/2025-10-13
```

**Discovery:**

```typescript
// Agent discovers resources
const resources = await mcp.listResources()
// Returns:
[
  { uri: 'docent://runbook/preview-branch', name: 'Create Preview DB Branch', ... },
  { uri: 'docent://template/adr', name: 'ADR Template', ... },
  { uri: 'docent://journal/current', name: 'Current Work Journal', ... }
]

// Agent reads specific resource
const runbook = await mcp.readResource('docent://runbook/preview-branch')
// Returns: { text: "# Create Preview DB Branch\n\n1. Install Neon CLI...", ... }
```

### Code Examples

**Complete MCP Server with All Three Capabilities:**

```typescript
// src/mcp/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ToolHandler } from './tools/handler.js'
import { ResourceHandler } from './resources/handler.js'
import { PromptBuilder, PROMPTS } from './prompts/builder.js'

const server = new Server(
  {
    name: 'docent',
    version: '0.4.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    },
  }
)

// ===== TOOLS (existing) =====

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'analyze',
        description: 'Analyze project structure, languages, and frameworks',
        inputSchema: { /* ... */ }
      },
      {
        name: 'audit-quality',
        description: 'Generate agent-driven documentation quality assessment prompt',
        inputSchema: { /* ... */ }
      },
      // ... other tools
    ]
  }
})

server.setRequestHandler('tools/call', async (request) => {
  const handler = new ToolHandler()
  return handler.execute(request.params.name, request.params.arguments)
})

// ===== RESOURCES (new) =====

server.setRequestHandler('resources/list', async () => {
  const handler = new ResourceHandler()
  const resources = await handler.list()
  return { resources }
})

server.setRequestHandler('resources/read', async (request) => {
  const handler = new ResourceHandler()
  const content = await handler.read(request.params.uri)
  return {
    contents: [content]
  }
})

// ===== PROMPTS (new) =====

server.setRequestHandler('prompts/list', async () => {
  return {
    prompts: Object.values(PROMPTS)
  }
})

server.setRequestHandler('prompts/get', async (request) => {
  const builder = new PromptBuilder()
  const messages = await builder.build(
    request.params.name,
    request.params.arguments || {}
  )
  return { messages }
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
```

**Agent Usage Examples:**

```typescript
// Example 1: Discover and use runbook
const resources = await mcp.listResources()
const runbooks = resources.filter(r => r.uri.startsWith('docent://runbook/'))
// User: "Create preview branch"
// Agent finds: docent://runbook/preview-branch
const runbook = await mcp.readResource('docent://runbook/preview-branch')
// Agent follows runbook steps...

// Example 2: Invoke workflow prompt
const prompts = await mcp.listPrompts()
// User: "Review the RFC I just wrote"
// Agent finds: "Review RFC" prompt
const prompt = await mcp.getPrompt('review-rfc', {
  rfc_path: 'docs/rfcs/rfc-0005-enhanced-mcp-architecture.md',
  perspective: 'architecture'
})
// Agent receives pre-built context and instructions

// Example 3: Session recovery
// User: "Help me resume work"
const prompt = await mcp.getPrompt('resume-work', {})
// Agent receives journal + commits + status + todos
// Agent analyzes and summarizes

// Example 4: Browse templates
const templates = await mcp.listResources()
  .then(r => r.filter(res => res.uri.startsWith('docent://template/')))
// Returns: [adr, rfc, spec, runbook, ...]
const adrTemplate = await mcp.readResource('docent://template/adr')
// Agent uses template to create new ADR
```

### User Experience

**Discovery Flow:**

```typescript
User: "What documentation processes do you have?"

Agent:
1. mcp.listPrompts()
   → Sees: "Review RFC", "Resume Work", "Create ADR", etc.

2. mcp.listResources({ type: 'runbook' })
   → Sees: "Create Preview DB Branch", "Deploy to Production", etc.

3. Reports to user:
   "This project has:
   - 5 workflow prompts (RFC review, ADR creation, ...)
   - 3 runbooks (DB branching, deployment, ...)
   - 8 templates (ADR, RFC, spec, ...)
   - Active work journal"
```

**Workflow Execution:**

```typescript
User: "Can you review RFC-0005?"

Agent:
1. Discovery:
   prompts = await mcp.listPrompts()
   // Finds: "Review RFC"

2. Invocation:
   prompt = await mcp.getPrompt('review-rfc', {
     rfc_path: 'docs/rfcs/rfc-0005-enhanced-mcp-architecture.md',
     perspective: 'architecture'
   })

3. Execution:
   // Receives pre-built prompt with:
   // - RFC content
   // - Related ADRs/RFCs
   // - Project analysis
   // - Review criteria
   // Agent conducts review following structure

4. Result:
   // Agent provides structured assessment
   // No manual orchestration needed ✅
```

**Operational Task:**

```typescript
User: "Create a preview database branch"

Agent:
1. Discovery:
   resources = await mcp.listResources()
   // Finds: docent://runbook/preview-branch

2. Retrieval:
   runbook = await mcp.readResource('docent://runbook/preview-branch')

3. Execution:
   // Runbook says:
   // 1. Install Neon CLI (if needed)
   // 2. Run: neon branches create --name preview-123
   // 3. Update .env.local with connection string
   // 4. Verify connection

   // Agent follows steps, reports progress

4. Verification:
   // Agent confirms each step completed
   // Reports success to user ✅
```

## Trade-offs and Alternatives

### Trade-offs of Enhanced MCP Architecture

**Advantages:**

1. **Richer capabilities**: Uses full MCP (tools + resources + prompts)
2. **Discoverable documentation**: Agents browse runbooks, templates, standards
3. **Standardized workflows**: Pre-defined prompts replace ad-hoc processes
4. **Simpler than CLI workflows**: MCP-native > CLI orchestration (RFC-0003)
5. **Maintains context provider role**: Docent guides, doesn't execute
6. **Cacheable resources**: MCP clients cache content (performance)

**Disadvantages:**

1. **More complex MCP server**: Three capabilities to maintain vs. tools-only
2. **URI scheme maintenance**: Resource paths must stay consistent
3. **Prompt template authoring**: Requires thoughtful prompt design
4. **MCP client dependency**: Only works with MCP-compatible agents
5. **Resource discovery overhead**: Agents must list/browse resources

**Our assessment:** Advantages strongly outweigh disadvantages. Full MCP capabilities unlock docent's potential as documentation intelligence platform.

### Alternative 1: Stay Tools-Only (Current)

**Description:** Keep MCP server as tools-only, don't add resources/prompts

**Pros:**
- Simpler to maintain
- Already works
- No new concepts to learn

**Cons:**
- Missing 2/3 of MCP capabilities
- No standardized workflows
- Documentation not discoverable
- Agents must invent processes every time
- RFC-0003 workflow orchestration becomes complex

**Why not chosen:** Leaves significant value on the table. Tools-only is 1/3 of what MCP offers.

### Alternative 2: CLI Workflow Orchestration (RFC-0003)

**Description:** Implement workflow orchestration via CLI commands

**Pros:**
- Works without MCP
- More control over execution
- Familiar CLI pattern

**Cons:**
- More complex architecture (workflow engine, state management)
- Not MCP-native (feels bolted on)
- Requires more code than prompts
- Less discoverable than MCP prompts
- Violates "context provider" principle (docent becomes executor)

**Why not chosen:** MCP prompts are more elegant, native, and align better with docent's role as context provider.

### Alternative 3: Prompts Only (No Resources)

**Description:** Add prompts but skip resources, keep file system access for docs

**Pros:**
- Simpler than full implementation
- Prompts solve main workflow problem
- Fewer URI patterns to maintain

**Cons:**
- Documentation not discoverable via MCP
- Agents use file system instead of resources
- Inconsistent (prompts are MCP, docs are not)
- Misses caching benefits of resources

**Why not chosen:** Resources are valuable for discovery and caching. Full MCP better than partial.

### Alternative 4: Resources Only (No Prompts)

**Description:** Add resources but skip prompts, let agents build workflows

**Pros:**
- Simpler prompt maintenance
- Agents retain full flexibility
- Resources enable discovery

**Cons:**
- No standardized workflows
- Every agent invents process from scratch
- Misses opportunity to encode best practices
- Quality varies by agent capability

**Why not chosen:** Prompts encode institutional knowledge and standardize processes. Too valuable to skip.

### Alternative 5: External Workflow Engine

**Description:** Integrate with Temporal, Airflow, or similar

**Pros:**
- Battle-tested workflow orchestration
- Rich features (retries, distributed execution)
- Mature ecosystem

**Cons:**
- Heavy dependency (separate service)
- Over-engineered for docent's needs
- Not MCP-native
- Complex setup for users
- Violates "context provider" principle

**Why not chosen:** Overkill. MCP prompts provide workflow guidance without execution engine complexity.

## Security Considerations

Enhanced MCP architecture has minimal new security concerns:

**Resources:**

1. **URI Access Control**
   - Resources expose project documentation
   - Runs in user's environment with user permissions
   - No elevation of privilege
   - **Mitigation:** Resources only expose docs intended for agents

2. **Path Traversal**
   - Malicious URIs could attempt directory traversal
   - Example: `docent://doc/../../etc/passwd`
   - **Mitigation:** Validate and sanitize all resource paths, restrict to project directory

3. **Sensitive Information**
   - Resources may contain sensitive context (API patterns, architecture)
   - **Mitigation:** Users control what docs exist; don't expose secrets in runbooks

**Prompts:**

1. **Prompt Injection**
   - User-provided arguments injected into prompts
   - Could manipulate agent behavior
   - **Mitigation:** Sanitize arguments, use structured formats, validate inputs

2. **Context Gathering**
   - Prompts may gather sensitive project context
   - **Mitigation:** Prompts run with user permissions, no elevation

**General:**

- No network access required (local only)
- Same security model as existing tools
- No new attack surface beyond file system access

**Best Practices:**

- Don't store secrets in runbooks or docs
- Use `.gitignore` for sensitive files
- Review resource URIs before implementing
- Validate all user inputs to prompts

## Performance Considerations

Enhanced MCP has minimal performance overhead:

**Resources:**

1. **Resource Listing**
   - Scans docs/runbooks/templates directories
   - Typical: 10-50 resources
   - Estimated: <100ms
   - Mitigated by MCP client caching

2. **Resource Reading**
   - Reads markdown files from disk
   - Typical: 1-10KB per resource
   - Estimated: <50ms
   - MCP clients cache content

3. **Caching Benefits**
   - Resources marked with timestamps
   - Clients avoid re-fetching unchanged content
   - Net improvement over repeated tool calls

**Prompts:**

1. **Prompt Building**
   - Gathers context (git status, file reads, tool calls)
   - Typical: 3-5 operations
   - Estimated: 1-3 seconds
   - Only when prompt invoked

2. **Context Gathering**
   - May call existing tools (analyze, audit-quality)
   - Already optimized
   - No additional overhead

**Overall Impact:**

- Resources: <100ms listing + <50ms per read
- Prompts: 1-3s context gathering (only on invocation)
- Total: Negligible vs. agent reasoning time (seconds to minutes)
- **Net benefit:** Caching reduces repeated file reads

## Testing Strategy

### Unit Tests

**Resources:**

1. **URI Parsing**
   - Valid URIs parsed correctly
   - Invalid URIs rejected with clear errors
   - Edge cases (special characters, long paths)

2. **Resource Handlers**
   - Runbook handler reads correct files
   - Template handler finds templates
   - Journal handler returns current/dated entries
   - Error handling (missing files, permissions)

3. **Resource Listing**
   - Lists all resources by type
   - Filters work correctly
   - Metadata accurate (timestamps, descriptions)

**Prompts:**

1. **Prompt Definitions**
   - All prompts have required fields
   - Arguments validated
   - Descriptions clear and accurate

2. **Prompt Building**
   - Context gathering works
   - Templates render correctly
   - Arguments injected properly
   - Error handling (missing args, invalid values)

3. **Prompt Messages**
   - Message structure valid
   - Resources embedded correctly
   - Multiple messages ordered properly

### Integration Tests

1. **End-to-End Resource Access**
   - List resources via MCP
   - Read resource via MCP
   - Verify content matches file system

2. **End-to-End Prompt Invocation**
   - List prompts via MCP
   - Invoke prompt with arguments
   - Verify context gathering
   - Check message structure

3. **Cross-Capability Integration**
   - Prompt calls tools (analyze, audit-quality)
   - Prompt references resources
   - Resources referenced from prompts

### Manual Testing (Dogfooding)

1. **Review RFC Workflow**
   - Invoke "Review RFC" prompt on RFC-0005 (meta!)
   - Verify context gathering finds related docs
   - Check prompt structure and clarity
   - Validate agent can follow instructions

2. **Resume Work Workflow**
   - Invoke "Resume Work" prompt
   - Verify journal reading
   - Check git status gathering
   - Confirm todo discovery

3. **Runbook Following**
   - Read preview-branch runbook resource
   - Verify content clear and actionable
   - Test with agent following steps

4. **Resource Discovery**
   - List all resources
   - Verify completeness
   - Check metadata accuracy
   - Test caching behavior

### Success Criteria

- ✅ Resources list/read work for all types
- ✅ Prompts invoke successfully with context
- ✅ "Review RFC" prompt works on RFC-0005
- ✅ "Resume Work" prompt gathers correct context
- ✅ Runbooks readable and followable
- ✅ Performance <100ms resource list, <3s prompt build
- ✅ MCP clients cache resources correctly

## Migration and Rollout

### Migration Path

**No breaking changes** - this is additive:

1. Existing tools continue working unchanged
2. Resources and prompts are new capabilities
3. Agents opt-in to using resources/prompts
4. Tools-only agents still work

**For existing docent users:**
- No changes to current usage
- Enhanced capabilities available when agents support them
- Backward compatible

### Rollout Plan

**Phase 0: Preparation (Completed ✅)**
- Validated MCP-only architecture (ADR-0004)
- Discovered MCP resources/prompts capabilities
- Identified "Beautiful Pattern" (context provider)
- User validated approach

**Phase 1: Research MCP SDK (1-2 days)**

Goal: Understand MCP resources and prompts implementation

Tasks:
- Study MCP TypeScript SDK documentation
- Review resources API (URI patterns, caching, discovery)
- Review prompts API (structure, arguments, invocation)
- Find real-world examples of MCP servers using resources/prompts
- Document best practices and patterns

Deliverable: Research notes in `docs/research/mcp-prompts-and-resources.md`

**Phase 2: Resources Implementation (1 week)**

Goal: Add resource discovery and reading

Tasks:
- Implement ResourceHandler class
- Add URI parsing and validation
- Implement runbook, template, standard, doc, journal handlers
- Wire into MCP server (resources/list, resources/read)
- Write unit tests for resource handlers
- Test with MCP client (Claude Desktop)

Deliverable: Resources working for all types

**Phase 3: Prompts Implementation (1-2 weeks)**

Goal: Add workflow prompts

Tasks:
- Implement PromptBuilder class
- Create "Review RFC" prompt (architecture, security, implementation)
- Create "Resume Work" prompt
- Create "Create ADR" prompt
- Create "Create Preview DB Branch" prompt
- Wire into MCP server (prompts/list, prompts/get)
- Write unit tests for prompt building
- Test workflows end-to-end

Deliverable: Core prompts working with context gathering

**Phase 4: Documentation & Polish (3-4 days)**

Goal: Document new capabilities and refine

Tasks:
- Update README with resources/prompts examples
- Write guide: "Using Docent Workflows"
- Create runbook examples (preview-branch, deploy, etc.)
- Add prompt templates documentation
- Update ADR-0004 if architectural decisions changed
- Integration testing
- Performance optimization

Deliverable: Complete documentation, polished implementation

**Phase 5: Dogfooding & Iteration (ongoing)**

Goal: Use docent via MCP while developing docent

Tasks:
- Use "Review RFC" prompt on new RFCs
- Use "Resume Work" prompt daily
- Follow runbooks via resources
- Gather feedback and improve
- Add new prompts as needs emerge

Deliverable: Validated workflows, real-world feedback

### Backward Compatibility

**No breaking changes:**
- All existing tools work unchanged
- MCP capabilities advertised to clients
- Agents without resource/prompt support still use tools
- Additive enhancement only

**Upgrade path:**
- Users update to docent 0.4.0
- MCP clients detect new capabilities automatically
- Agents opt-in to resources/prompts
- Fallback to tools-only if needed

## Documentation Plan

### User-Facing Documentation

1. **README: Enhanced MCP Capabilities**
   - Overview of tools + resources + prompts
   - Quick start examples
   - Link to detailed guides

2. **Guide: Using Docent Workflows**
   - What are prompts and when to use them
   - Available workflows ("Review RFC", "Resume Work", etc.)
   - How to invoke prompts
   - How to browse resources
   - Creating custom runbooks

3. **Guide: MCP Resources**
   - Resource URI patterns
   - Available resource types
   - How to add custom runbooks/standards
   - Resource metadata and caching

4. **Examples:**
   - Review RFC workflow walkthrough
   - Session recovery example
   - Following a runbook
   - Creating custom prompts

### Internal Documentation

1. **Update ADR-0004: MCP-Only Architecture**
   - Add section on resources and prompts
   - Explain decision to use full MCP vs. tools-only
   - Document "context provider" principle

2. **Architecture Documentation**
   - Update diagrams with resources/prompts
   - Document resource URI scheme
   - Explain prompt building process
   - Integration patterns

3. **Agent Protocol Guide**
   - How agents discover workflows
   - Resource browsing patterns
   - Prompt invocation examples
   - Best practices for workflow agents

### Developer Documentation

1. **Guide: Creating Custom Prompts**
   - Prompt structure and arguments
   - Context gathering patterns
   - Testing prompts
   - Prompt template best practices

2. **Guide: Adding Resource Types**
   - Resource handler implementation
   - URI scheme design
   - Metadata and caching
   - Testing resources

3. **MCP SDK Integration**
   - How docent uses MCP SDK
   - Request handlers implementation
   - Error handling patterns
   - Testing with MCP clients

## Open Questions

1. **Prompt Versioning:** How do we version prompts as they evolve?
   - Include version in prompt name? ("Review RFC v2")
   - Version field in prompt definition?
   - **Recommendation:** Defer to Phase 4, start with v1 implicit

2. **Custom Prompt Location:** Where should projects define custom prompts?
   - `.docent/prompts/` directory?
   - Register in config file?
   - **Recommendation:** Research in Phase 1, implement in Phase 3

3. **Resource Caching:** How long should MCP clients cache resources?
   - Use file modification time?
   - Explicit cache headers?
   - **Recommendation:** Research MCP SDK caching in Phase 1

4. **Prompt Composition:** Should prompts be composable?
   - Example: "Review RFC" calls "Resume Work" first?
   - Nested prompt invocation?
   - **Recommendation:** Not Phase 1, consider future

5. **Resource Templates:** Should we support template interpolation in resources?
   - Example: `docent://runbook/preview-branch?project={{projectName}}`
   - Dynamic content generation?
   - **Recommendation:** Start static (Phase 2), consider dynamic later

6. **Prompt Feedback:** How do prompts receive agent results?
   - One-way (agent receives prompt, docent doesn't see result)?
   - Two-way (agent reports back to docent)?
   - **Recommendation:** Start one-way, simpler model

7. **Multi-Step Prompts:** How to handle multi-stage workflows?
   - Single prompt with all steps?
   - Prompt chains (prompt 1 → prompt 2)?
   - **Recommendation:** Start single-stage, enhance in Phase 5

## Future Possibilities

Once resources and prompts are established:

### Enhanced Prompts

1. **Interactive Prompts**
   - Prompts that ask follow-up questions
   - Example: "Create ADR" asks about decision context
   - Multi-turn prompt conversations

2. **Conditional Prompts**
   - Prompt behavior based on project state
   - Example: "Review RFC" skips security if no security changes
   - Dynamic prompt generation

3. **Prompt Chains**
   - Workflows composed of multiple prompts
   - Example: "Spec to Production" = Create Spec → Review → Implement → Test → Review Code → Commit
   - Orchestrated multi-prompt flows

### Enhanced Resources

1. **Dynamic Resources**
   - Resources generated on-demand
   - Example: `docent://status/current` generates project status report
   - Computed content

2. **Resource Subscriptions**
   - Agents subscribe to resource changes
   - Example: Watch journal, notify on updates
   - Real-time resource monitoring

3. **Resource Search**
   - Full-text search across resources
   - Example: "Find runbooks mentioning Neon"
   - Semantic resource discovery

### New Capabilities

1. **Sampling** (4th MCP capability)
   - Let docent request completions from agent
   - Example: Docent asks agent to generate runbook section
   - Bidirectional agent interaction

2. **Resource Bundles**
   - Collections of related resources
   - Example: "Frontend Onboarding" bundle (templates + runbooks + standards)
   - Packaged knowledge sets

3. **Workflow Analytics**
   - Track prompt usage and success
   - Identify commonly used workflows
   - Optimize prompts based on outcomes

4. **Community Prompts**
   - Shareable prompt library
   - Import prompts from other projects
   - Best practice workflows across teams

## References

### Related Docent Documentation

- [ADR-0004: MCP-Only Architecture](../adr/adr-0004-mcp-only-architecture.md) - Current architecture
- [RFC-0001: MCP Server Integration](./rfc-0001-mcp-server-for-agent-integration.md) - MCP implementation
- [RFC-0003: Workflow Orchestration](./rfc-0003-workflow-orchestration-for-multi-agent-tasks.md) - CLI workflow approach (superseded by prompts)
- [RFC-0004: Work Artifact Capture](./rfc-0004-work-artifact-capture-and-surfacing.md) - Journal and session recovery
- [PRD-0001: Agent-Orchestrated Workflows](../prds/prd-0001-agent-orchestrated-workflows-for-solo-developer-productivity.md) - Product vision

### MCP Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Resources Documentation](https://spec.modelcontextprotocol.io/resources)
- [MCP Prompts Documentation](https://spec.modelcontextprotocol.io/prompts)
- [MCP Best Practices](https://modelcontextprotocol.io/docs/best-practices)

### Inspirations

- [GitHub Actions Workflows](https://docs.github.com/en/actions) - Workflow definitions
- [Kubernetes Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) - URI-based resource access
- [HTTP URI Design](https://www.w3.org/Provider/Style/URI) - URI scheme best practices

---

**This RFC proposes extending docent's MCP server with resources and prompts, transforming it from action executor to context provider. Documentation becomes configuration for AI agents, with discoverable runbooks, templates, and standardized workflows replacing manual orchestration.**
