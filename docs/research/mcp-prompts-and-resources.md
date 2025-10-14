# MCP Resources and Prompts Research

**Created:** 2025-10-13
**Purpose:** Research findings for implementing MCP resources and prompts in docent (RFC-0005)
**Status:** Complete

## Executive Summary

The Model Context Protocol (MCP) provides three core capabilities for servers: **tools**, **resources**, and **prompts**. This research documents how to implement resources and prompts in TypeScript using the official MCP SDK.

**Key Findings:**

- Resources provide URI-based content discovery and caching for efficient context management
- Prompts enable pre-defined workflow templates with parameterized arguments
- Both use standard request handlers (`server.setRequestHandler`) with schema validation
- Caching via resource URIs is critical for token efficiency in RAG scenarios

**Relevance to docent:**

- Resources expose runbooks, templates, standards, docs, journal as discoverable URIs
- Prompts standardize workflows (Review RFC, Resume Work, etc.) with context gathering
- Both align with docent's "context provider" principle (documentation as agent configuration)

---

## Table of Contents

1. [MCP Resources](#mcp-resources)
2. [MCP Prompts](#mcp-prompts)
3. [Implementation Patterns](#implementation-patterns)
4. [Caching Mechanisms](#caching-mechanisms)
5. [Best Practices](#best-practices)
6. [Real-World Examples](#real-world-examples)
7. [Recommendations for Docent](#recommendations-for-docent)
8. [References](#references)

---

## MCP Resources

### Overview

Resources allow MCP servers to expose data that provides context to language models, such as files, database schemas, or application-specific information. Each resource is uniquely identified by a URI.

**Purpose:**

- Provide discoverable content to agents
- Enable efficient caching via URI-based deduplication
- Reduce token consumption in multi-call scenarios (RAG)

**Key Quote:**
> "MCP resources are for improved prompt utilization, namely cache invalidation. If your MCP client doesn't support resources, it is **not a good client**." — Tim Kellogg

### API Structure

#### Declaring Capability

Servers must declare the `resources` capability:

```typescript
const server = new Server(
  {
    name: "docent",
    version: "0.4.0"
  },
  {
    capabilities: {
      resources: {}  // Can include subscribe, listChanged options
    }
  }
)
```

#### Resources List (`resources/list`)

**Purpose:** Return all available resources for discovery

**Request Schema:** `ListResourcesRequestSchema`

**Response Structure:**

```typescript
{
  resources: [
    {
      uri: string,           // Unique identifier
      name: string,          // Human-readable name
      description?: string,  // Optional description
      mimeType: string       // Content type (e.g., "text/markdown")
    }
  ]
}
```

**Implementation Example:**

```typescript
import { ListResourcesRequestSchema } from "@modelcontextprotocol/sdk/types.js";

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "docent://runbook/preview-branch",
        name: "Create Preview Database Branch",
        description: "Step-by-step procedure for creating Neon DB preview branches",
        mimeType: "text/markdown"
      },
      {
        uri: "docent://template/adr",
        name: "ADR Template",
        description: "Architecture Decision Record template",
        mimeType: "text/markdown"
      },
      {
        uri: "docent://journal/current",
        name: "Current Work Journal",
        description: "Active work journal with session context",
        mimeType: "text/markdown"
      }
    ]
  };
});
```

#### Resources Read (`resources/read`)

**Purpose:** Return content for a specific resource URI

**Request Schema:** `ReadResourceRequestSchema`

**Request Parameters:**

```typescript
{
  uri: string  // Resource URI to read
}
```

**Response Structure:**

```typescript
{
  contents: [
    {
      uri: string,      // Same as requested URI
      mimeType: string, // Content type
      text?: string,    // Text content (for text mimeTypes)
      blob?: string     // Base64 encoded binary (for binary mimeTypes)
    }
  ]
}
```

**Implementation Example:**

```typescript
import { ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs/promises';

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Parse URI: docent://runbook/preview-branch
  const match = uri.match(/^docent:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid URI format: ${uri}`);
  }

  const [, type, identifier] = match;

  switch (type) {
    case 'runbook': {
      const path = `docs/runbooks/${identifier}.md`;
      const content = await fs.readFile(path, 'utf-8');
      return {
        contents: [{
          uri,
          mimeType: 'text/markdown',
          text: content
        }]
      };
    }

    case 'template': {
      const path = `templates/${identifier}-template.md`;
      const content = await fs.readFile(path, 'utf-8');
      return {
        contents: [{
          uri,
          mimeType: 'text/markdown',
          text: content
        }]
      };
    }

    case 'journal': {
      const path = identifier === 'current'
        ? '.docent/journal.md'
        : `.docent/journal-${identifier}.md`;
      const content = await fs.readFile(path, 'utf-8');
      return {
        contents: [{
          uri,
          mimeType: 'text/markdown',
          text: content
        }]
      };
    }

    default:
      throw new Error(`Unknown resource type: ${type}`);
  }
});
```

### URI Schemes

MCP defines standard URI schemes, but implementations can use custom schemes:

**Standard Schemes:**

- `http://` / `https://` - Web resources (client fetches directly)
- `file://` - Filesystem-like resources (may be virtual)

**Custom Schemes (for docent):**

- `docent://runbook/{name}` - Operational runbooks
- `docent://template/{type}` - Documentation templates
- `docent://standard/{type}` - Project standards/conventions
- `docent://doc/{path}` - Project documentation
- `docent://journal/{date|'current'}` - Work journals

**Best Practice:** Use descriptive custom schemes that clearly identify the resource type and origin.

### Security Considerations

**Path Traversal Prevention:**

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Validate URI doesn't escape bounds
  if (uri.includes('..') || uri.includes('~')) {
    throw new Error('Invalid URI: path traversal detected');
  }

  // Whitelist allowed URI patterns
  if (!uri.startsWith('docent://')) {
    throw new Error('Access denied: unsupported URI scheme');
  }

  // ... read and return content
});
```

---

## MCP Prompts

### Overview

Prompts are pre-defined templates that servers expose to clients, allowing users to explicitly select and invoke structured workflows. Prompts are **user-controlled** (unlike tools which are model-controlled).

**Purpose:**

- Standardize common workflows with reusable templates
- Provide context-aware instructions to agents
- Accept parameterized arguments for customization
- Encode institutional knowledge as invocable procedures

### API Structure

#### Declaring Capability

Servers must declare the `prompts` capability:

```typescript
const server = new Server(
  {
    name: "docent",
    version: "0.4.0"
  },
  {
    capabilities: {
      prompts: {}
    }
  }
)
```

#### Prompts List (`prompts/list`)

**Purpose:** Return all available prompts for discovery

**Request Schema:** `ListPromptsRequestSchema`

**Response Structure:**

```typescript
{
  prompts: [
    {
      name: string,           // Unique identifier
      description: string,    // Human-readable description
      arguments?: [
        {
          name: string,       // Argument name
          description: string, // Argument purpose
          required: boolean   // Whether argument is required
        }
      ]
    }
  ]
}
```

**Implementation Example:**

```typescript
import { ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const PROMPTS = {
  "review-rfc": {
    name: "review-rfc",
    description: "Conduct multi-perspective RFC review with context gathering",
    arguments: [
      {
        name: "rfc_path",
        description: "Path to RFC file (e.g., docs/rfcs/rfc-0005-...md)",
        required: true
      },
      {
        name: "perspective",
        description: "Review perspective: architecture, security, implementation, or all",
        required: false
      }
    ]
  },

  "resume-work": {
    name: "resume-work",
    description: "Session recovery: analyze recent work and provide context to continue",
    arguments: []
  },

  "create-adr": {
    name: "create-adr",
    description: "Create new Architecture Decision Record with guided process",
    arguments: [
      {
        name: "title",
        description: "ADR title",
        required: true
      }
    ]
  }
};

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS)
  };
});
```

#### Prompts Get (`prompts/get`)

**Purpose:** Return rendered prompt with context for a specific workflow

**Request Schema:** `GetPromptRequestSchema`

**Request Parameters:**

```typescript
{
  name: string,              // Prompt name
  arguments?: {              // Optional prompt arguments
    [key: string]: string
  }
}
```

**Response Structure:**

```typescript
{
  description?: string,      // Optional prompt description
  messages: [
    {
      role: "user" | "assistant",
      content: {
        type: "text" | "resource" | "image",
        text?: string,       // For text content
        resource?: {         // For embedded resources
          uri: string,
          text: string,
          mimeType?: string
        },
        data?: string,       // For images (base64)
        mimeType?: string
      }
    }
  ]
}
```

**Implementation Example:**

```typescript
import { GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { analyzeProject } from '../lib/detector.js';
import fs from 'fs/promises';

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case 'review-rfc': {
      const { rfc_path, perspective = 'architecture' } = args;

      if (!rfc_path) {
        throw new Error('Missing required argument: rfc_path');
      }

      // Gather context
      const analysis = await analyzeProject('.');
      const rfcContent = await fs.readFile(rfc_path, 'utf-8');

      // Build prompt with context
      const prompt = `# RFC Review: ${perspective} Perspective

## Your Task

Conduct a thorough ${perspective} review of the RFC at: ${rfc_path}

## RFC Content

<rfc>
${rfcContent}
</rfc>

## Project Context

- Languages: ${analysis.languages.join(', ')}
- Frameworks: ${analysis.frameworks.join(', ')}

## Review Criteria

${getReviewCriteria(perspective)}

## Process

1. Read the RFC carefully
2. Apply ${perspective} review criteria
3. Identify blockers, concerns, and recommendations
4. Provide structured assessment

## Output Format

- **Overall Assessment**: APPROVE | APPROVE_WITH_CHANGES | REQUEST_CHANGES | REJECT
- **Blockers**: Critical issues
- **Major Concerns**: Significant issues
- **Minor Issues**: Small improvements
- **Recommendations**: Enhancement suggestions
`;

      return {
        description: `RFC review from ${perspective} perspective`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: prompt
            }
          }
        ]
      };
    }

    case 'resume-work': {
      // Read journal via resource
      const journalUri = 'docent://journal/current';
      const journalResponse = await handleResourceRead(journalUri);
      const journal = journalResponse.contents[0].text;

      // Get git status
      const { execSync } = await import('child_process');
      const gitStatus = execSync('git status', { encoding: 'utf-8' });
      const commits = execSync('git log --oneline -10', { encoding: 'utf-8' });

      const prompt = `# Resume Work Session

## Your Task

Analyze recent work and help me continue where I left off.

## Context Gathered

### Work Journal
<journal>
${journal}
</journal>

### Recent Commits
${commits}

### Git Status
\`\`\`
${gitStatus}
\`\`\`

## What I Need

1. **Summary**: What was I working on?
2. **Status**: Where did I leave off?
3. **Next Steps**: What should I do next?
4. **Context**: Anything important to remember?
5. **Blockers**: Any unresolved issues?
`;

      return {
        description: 'Session recovery with work context',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: prompt
            }
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

function getReviewCriteria(perspective: string): string {
  switch (perspective) {
    case 'architecture':
      return `- System design clarity and completeness
- Integration with existing architecture
- Scalability and maintainability
- Technical debt implications
- Alternative approaches considered`;
    case 'security':
      return `- Security implications and threat model
- Data protection and privacy
- Authentication and authorization
- Input validation and sanitization
- Secrets management`;
    case 'implementation':
      return `- Feasibility and complexity
- Testing strategy
- Migration and rollout plan
- Performance implications
- Developer experience`;
    default:
      return 'General review criteria';
  }
}
```

### Argument Handling

**Validation Pattern:**

```typescript
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  const prompt = PROMPTS[name];
  if (!prompt) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  // Validate required arguments
  for (const arg of prompt.arguments || []) {
    if (arg.required && !args[arg.name]) {
      throw new Error(`Missing required argument: ${arg.name}`);
    }
  }

  // Build and return prompt...
});
```

**Type-Safe Arguments (using Zod):**

```typescript
import { z } from 'zod';

const ReviewRfcArgs = z.object({
  rfc_path: z.string(),
  perspective: z.enum(['architecture', 'security', 'implementation', 'all']).optional()
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: rawArgs = {} } = request.params;

  if (name === 'review-rfc') {
    const args = ReviewRfcArgs.parse(rawArgs);  // Throws if validation fails
    // ... use typed args
  }
});
```

### Embedded Resources in Prompts

Prompts can include resource content directly in messages:

```typescript
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === 'create-preview-branch') {
    const runbookUri = 'docent://runbook/preview-branch';
    const runbookContent = await readResource(runbookUri);

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Follow the runbook to create a preview branch:'
          }
        },
        {
          role: 'user',
          content: {
            type: 'resource',
            resource: {
              uri: runbookUri,
              text: runbookContent,
              mimeType: 'text/markdown'
            }
          }
        }
      ]
    };
  }
});
```

---

## Implementation Patterns

### Complete MCP Server with Resources and Prompts

```typescript
// src/mcp/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'docent',
    version: '0.4.0',
  },
  {
    capabilities: {
      tools: {},      // Existing tools
      resources: {},  // New: resources
      prompts: {}     // New: prompts
    },
  }
);

// ===== RESOURCES =====

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: await listAllResources()
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return await readResource(request.params.uri);
});

// ===== PROMPTS =====

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS)
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return await buildPrompt(request.params.name, request.params.arguments);
});

// ===== START SERVER =====

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Docent MCP server running');
```

### Modular Handler Organization

```typescript
// src/mcp/resources/handler.ts
export class ResourceHandler {
  async list(): Promise<Resource[]> {
    // Scan and return all available resources
  }

  async read(uri: string): Promise<ResourceContent> {
    // Parse URI and return content
  }
}

// src/mcp/prompts/builder.ts
export class PromptBuilder {
  async build(name: string, args: Record<string, string>): Promise<PromptMessages> {
    // Build prompt with context gathering
  }
}

// src/mcp/server.ts
import { ResourceHandler } from './resources/handler.js';
import { PromptBuilder } from './prompts/builder.js';

const resourceHandler = new ResourceHandler();
const promptBuilder = new PromptBuilder();

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: await resourceHandler.list() };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const messages = await promptBuilder.build(
    request.params.name,
    request.params.arguments || {}
  );
  return { messages };
});
```

---

## Caching Mechanisms

### Resource-Based Caching

**Problem:** RAG queries return large documents that get duplicated across multiple tool calls, consuming excessive tokens.

**Solution:** Use resource URIs as cache keys to deduplicate content.

**Pattern:**

```typescript
// Tool returns resource references, not full content
{
  result: [
    { uri: "docent://doc/architecture/overview" },
    { uri: "docent://doc/adr/adr-0004-mcp-only-architecture" }
  ]
}

// Client maintains seen URIs
const seenResources = new Set<string>();

for (const ref of result) {
  if (!seenResources.has(ref.uri)) {
    const content = await mcp.readResource(ref.uri);
    seenResources.add(ref.uri);
    // Use content...
  }
}
```

**Key Quote:**
> "Keep a list of resource IDs already seen (a 'cache'). Avoid duplicating files across tool calls. Use URIs as cache keys." — Tim Kellogg

### Client-Side Caching

MCP clients should cache resources:

```typescript
class ResourceCache {
  private cache = new Map<string, { content: string; timestamp: number }>();

  async get(uri: string, ttl = 60000): Promise<string> {
    const cached = this.cache.get(uri);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.content;
    }

    const content = await mcp.readResource(uri);
    this.cache.set(uri, { content, timestamp: Date.now() });
    return content;
  }

  invalidate(uri: string): void {
    this.cache.delete(uri);
  }
}
```

### Resource Metadata for Caching

While MCP spec doesn't mandate caching headers, servers can include metadata:

```typescript
{
  uri: "docent://journal/current",
  name: "Current Work Journal",
  mimeType: "text/markdown",
  metadata: {
    lastModified: "2025-10-13T14:30:00Z",
    etag: "\"abc123\"",
    size: 45120
  }
}
```

**Note:** Metadata structure is implementation-specific. MCP doesn't standardize caching headers.

---

## Best Practices

### Resources

1. **Use descriptive URI schemes**
   - Good: `docent://runbook/preview-branch`
   - Bad: `file:///docs/runbooks/preview-branch.md`

2. **Keep resource handlers lightweight**
   - No complex computation
   - Fast reads (< 100ms)
   - Handle missing files gracefully

3. **Validate URIs rigorously**
   - Prevent path traversal
   - Whitelist allowed schemes
   - Sanitize identifiers

4. **Provide rich metadata**
   - Clear, human-readable names
   - Descriptive summaries
   - Accurate mimeType

5. **Design for discoverability**
   - Consistent URI patterns
   - Logical grouping by type
   - Meaningful identifiers

### Prompts

1. **User-controlled workflows**
   - Prompts are explicitly invoked by users
   - Not automatically triggered by agents
   - Clear, action-oriented names

2. **Context gathering in prompts**
   - Collect relevant project context
   - Include related resources
   - Provide structured instructions

3. **Validate arguments thoroughly**
   - Required vs. optional
   - Type checking (use Zod, etc.)
   - Clear error messages

4. **Structure prompt output**
   - Define expected response format
   - Use consistent formatting
   - Include examples when helpful

5. **Keep prompts focused**
   - One workflow per prompt
   - Clear, singular purpose
   - Composable but not monolithic

### General

1. **Error handling**
   - Throw descriptive errors
   - Use MCP error types
   - Don't leak sensitive paths

2. **Testing**
   - Unit test handlers
   - Integration test with MCP client
   - Test edge cases (missing files, invalid URIs)

3. **Documentation**
   - Document URI schemes
   - Describe prompt workflows
   - Provide usage examples

---

## Real-World Examples

### Example Servers

1. **Official TypeScript SDK Examples**
   - Repository: https://github.com/modelcontextprotocol/typescript-sdk/tree/main/src/examples
   - Includes: greeting templates, resource templates, tool implementations

2. **FastMCP Framework**
   - Repository: https://github.com/punkpeye/fastmcp
   - Higher-level abstractions for resources and prompts
   - Uses Standard Schema for validation

3. **Production Template**
   - Repository: https://github.com/cyanheads/mcp-ts-template
   - Production-grade patterns
   - Declarative resource/prompt definitions
   - Dependency injection, auth, observability

### Tutorial Series

**Building MCP Servers (Christopher Strolia-Davis, Medium):**

- Part 1: Resources (Feb 2025)
- Part 2: Resource Templates (Feb 2025)
- Part 3: Prompts (Feb 2025)

**Understanding MCP (Matthew MacFarquhar, Medium):**

- Part 3: Adding Prompts to MCP Servers (2025)

---

## Recommendations for Docent

### Phase 1: Resources Implementation

**Priority 1 Resources:**

1. `docent://journal/current` - Session context
2. `docent://template/{type}` - Documentation templates
3. `docent://runbook/{name}` - Operational procedures

**Implementation:**

```typescript
// Start simple, expand iteratively
const resources = {
  journal: () => listJournalResources(),
  template: () => listTemplateResources(),
  runbook: () => listRunbookResources()
};
```

**File Structure:**

```
src/mcp/
  resources/
    handler.ts        // Main ResourceHandler class
    types.ts          // Resource types and interfaces
    journal.ts        // Journal resource handler
    template.ts       // Template resource handler
    runbook.ts        // Runbook resource handler
```

### Phase 2: Prompts Implementation

**Priority 1 Prompts:**

1. `resume-work` - Session recovery (highest value, uses journal resource)
2. `review-rfc` - RFC review workflow (validates architecture)
3. `create-adr` - ADR creation (encodes process)

**Implementation:**

```typescript
// Context gathering utilities
class ContextGatherer {
  async gatherForResumeWork(): Promise<WorkContext> {
    // Journal, git status, commits, TODOs
  }

  async gatherForRfcReview(rfcPath: string): Promise<RfcContext> {
    // RFC content, related docs, project analysis
  }
}
```

**File Structure:**

```
src/mcp/
  prompts/
    builder.ts          // Main PromptBuilder class
    types.ts            // Prompt types and interfaces
    definitions.ts      // Prompt definitions (name, args)
    context.ts          // Context gathering utilities
    templates/
      review-rfc.ts     // RFC review prompt builder
      resume-work.ts    // Session recovery prompt builder
      create-adr.ts     // ADR creation prompt builder
```

### Testing Strategy

**Resources:**

```typescript
describe('ResourceHandler', () => {
  it('lists all resources by type', async () => {
    const handler = new ResourceHandler();
    const resources = await handler.list();
    expect(resources).toContainEqual(
      expect.objectContaining({
        uri: 'docent://journal/current',
        name: 'Current Work Journal'
      })
    );
  });

  it('reads journal resource', async () => {
    const handler = new ResourceHandler();
    const content = await handler.read('docent://journal/current');
    expect(content.contents[0].text).toContain('# Docent Work Journal');
  });

  it('rejects path traversal attempts', async () => {
    const handler = new ResourceHandler();
    await expect(
      handler.read('docent://doc/../../etc/passwd')
    ).rejects.toThrow('path traversal');
  });
});
```

**Prompts:**

```typescript
describe('PromptBuilder', () => {
  it('builds resume-work prompt with context', async () => {
    const builder = new PromptBuilder();
    const result = await builder.build('resume-work', {});

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain('## Work Journal');
    expect(result.messages[0].content.text).toContain('## Recent Commits');
  });

  it('validates required arguments', async () => {
    const builder = new PromptBuilder();
    await expect(
      builder.build('review-rfc', {})
    ).rejects.toThrow('Missing required argument: rfc_path');
  });

  it('builds review-rfc prompt with perspective', async () => {
    const builder = new PromptBuilder();
    const result = await builder.build('review-rfc', {
      rfc_path: 'docs/rfcs/rfc-0005-enhanced-mcp-architecture.md',
      perspective: 'architecture'
    });

    expect(result.messages[0].content.text).toContain('architecture review');
    expect(result.messages[0].content.text).toContain('RFC Content');
  });
});
```

### Integration with Existing Code

**Leverage existing tools:**

```typescript
// Prompts can call existing docent tools
import { analyzeProject } from '../lib/detector.js';
import { auditDocumentation } from '../lib/auditor.js';

async function buildReviewRfcPrompt(args: ReviewRfcArgs): Promise<PromptMessages> {
  // Use existing analyze tool for context
  const analysis = await analyzeProject('.');

  // Use existing audit for documentation health
  const audit = await auditDocumentation('.', 'docs', analysis);

  // Build prompt with gathered context
  return {
    messages: [...]
  };
}
```

**Resource handlers read from existing directories:**

```typescript
async readTemplate(type: string): Promise<ResourceContent> {
  // Existing templates directory
  const path = `templates/${type}-template.md`;
  const content = await fs.readFile(path, 'utf-8');
  return { uri: `docent://template/${type}`, text: content };
}
```

### Phased Rollout

**Phase 1: Resources (Week 1)**

- Implement ResourceHandler class
- Add journal, template, runbook resource types
- Wire into MCP server
- Test with MCP client (Claude Desktop)

**Phase 2: Prompts - Basic (Week 2)**

- Implement PromptBuilder class
- Add "resume-work" prompt (simplest, highest value)
- Test end-to-end workflow
- Gather feedback

**Phase 3: Prompts - Advanced (Week 3)**

- Add "review-rfc" prompt with context gathering
- Add "create-adr" prompt
- Test complex workflows
- Refine based on usage

**Phase 4: Additional Resources (Week 4)**

- Add standard, doc resource types
- Expand runbook coverage
- Add resource metadata (tags, related)

**Phase 5: Dogfooding (Ongoing)**

- Use docent via MCP daily
- Iterate on prompts based on real usage
- Add new prompts as needs emerge

---

## References

### Official Documentation

- **MCP Specification (2025-03-26):** https://spec.modelcontextprotocol.io/
- **MCP Resources Spec:** https://modelcontextprotocol.io/docs/concepts/resources
- **MCP Prompts Spec:** https://modelcontextprotocol.io/docs/concepts/prompts
- **TypeScript SDK:** https://github.com/modelcontextprotocol/typescript-sdk
- **NPM Package:** https://www.npmjs.com/package/@modelcontextprotocol/sdk

### Tutorials and Articles

- **Building MCP Servers Series** (Christopher Strolia-Davis, Medium, Feb 2025)
  - Part 1: Resources - https://medium.com/@cstroliadavis/building-mcp-servers-536969d27809
  - Part 2: Resource Templates - https://medium.com/@cstroliadavis/building-mcp-servers-315917582ad1
  - Part 3: Prompts - https://medium.com/@cstroliadavis/building-mcp-servers-13570f347c74

- **MCP Resources Are For Caching** (Tim Kellogg, June 2025)
  - https://timkellogg.me/blog/2025/06/05/mcp-resources

- **Understanding MCP** (Matthew MacFarquhar, Medium, 2025)
  - Part 3: Adding Prompts - https://matthewmacfarquhar.medium.com/understanding-mcp-part-3-adding-prompts-to-mcp-servers-5d76ad8bc75a

- **How to Effectively Use Prompts, Resources, and Tools in MCP** (Composio, 2025)
  - https://composio.dev/blog/how-to-effectively-use-prompts-resources-and-tools-in-mcp

- **MCP Prompts Explained** (Laurent Kubaski, Medium, 2025)
  - https://medium.com/@laurentkubaski/mcp-prompts-explained-including-how-to-actually-use-them-9db13d69d7e2

### Frameworks and Templates

- **FastMCP:** https://github.com/punkpeye/fastmcp
- **Production Template:** https://github.com/cyanheads/mcp-ts-template
- **MCP Prompts Server:** https://github.com/sparesparrow/mcp-prompts

### Community Resources

- **Building Your First MCP Server** (GitHub Blog, 2025)
  - https://github.blog/ai-and-ml/github-copilot/building-your-first-mcp-server-how-to-extend-ai-tools-with-custom-capabilities/

- **FreeCodeCamp Handbook** (2025)
  - https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/

- **Best Practices for MCP Caching** (GitHub Gist)
  - https://gist.github.com/eonist/16f74dea1e0110cee3ef6caff2a5856c

---

## Appendix: Complete Working Example

### Simple MCP Server with Resources and Prompts

```typescript
// server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';

const server = new Server(
  { name: 'docent', version: '0.4.0' },
  { capabilities: { resources: {}, prompts: {} } }
);

// RESOURCES

const RESOURCES = [
  {
    uri: 'docent://journal/current',
    name: 'Current Work Journal',
    mimeType: 'text/markdown'
  },
  {
    uri: 'docent://template/adr',
    name: 'ADR Template',
    mimeType: 'text/markdown'
  }
];

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCES
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'docent://journal/current') {
    const text = await fs.readFile('.docent/journal.md', 'utf-8');
    return { contents: [{ uri, mimeType: 'text/markdown', text }] };
  }

  if (uri === 'docent://template/adr') {
    const text = await fs.readFile('templates/adr-template.md', 'utf-8');
    return { contents: [{ uri, mimeType: 'text/markdown', text }] };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// PROMPTS

const PROMPTS = [
  {
    name: 'resume-work',
    description: 'Session recovery: analyze recent work',
    arguments: []
  }
];

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === 'resume-work') {
    const journal = await fs.readFile('.docent/journal.md', 'utf-8');

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `# Resume Work

Analyze the journal and tell me what I should focus on next.

<journal>
${journal}
</journal>`
          }
        }
      ]
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// START SERVER

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Docent MCP server running');
```

**Run:**

```bash
node server.ts
```

**Test with MCP client (Claude Desktop):**

```json
{
  "mcpServers": {
    "docent": {
      "command": "node",
      "args": ["/path/to/docent/dist/mcp/server.js"]
    }
  }
}
```

---

**End of Research Document**
