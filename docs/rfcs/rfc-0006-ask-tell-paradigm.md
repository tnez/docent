# RFC-0006: Ask/Act/Tell - Universal Knowledge Interface

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-29
**Updated:** 2025-10-29

## Summary

Transform docent from a developer-focused documentation tool into a universal knowledge system with a minimal, intuitive API based on four core interactions:

- `/docent:start` - Initialize session
- `/docent:ask` - Query all knowledge
- `/docent:act` - Execute runbooks
- `/docent:tell` - Update documentation

This paradigm shift removes opinionated directory structures, uses `.docent/` for managed content, enables extensibility through user-overridable templates and runbooks, and makes docent accessible to anyone while maintaining power for technical users.

## Motivation

### Problem Statement

Current docent design has several limitations:

- **Developer-centric:** Assumes users work with `docs/` directories, git repos, and technical documentation patterns
- **Opinionated structure:** Enforces specific directory layouts (docs/, guides/, runbooks/, etc.)
- **Limited extensibility:** Users cannot easily add custom templates or customize behavior
- **Complex API surface:** Multiple MCP tools with specific purposes rather than a unified interaction model
- **Template rigidity:** Templates focused on documentation (ADRs, RFCs) rather than broader knowledge management

These constraints limit adoption beyond developer workflows and make docent less flexible for varied knowledge management needs.

### Goals

- **Minimal API:** 4 core commands (start, ask, act, tell) instead of many specific tools
- **Flexible structure:** Use `.docent/` for managed content, support configurable search paths
- **User override:** User templates and runbooks always override bundled resources
- **Runbook-based actions:** All operational procedures (bootstrap, doctor, issue filing) are runbooks
- **Universal knowledge:** `/docent:ask` searches all configured documentation
- **Clear semantics:** ask=read, act=execute, tell=write
- **Easy discovery:** `/docent:start` shows all templates, runbooks, and capabilities

### Non-Goals

- Maintain backward compatibility with current MCP tool names (breaking changes acceptable)
- Support code-based customization (use runbooks and templates instead)
- Provide every possible template/runbook out-of-box (start with useful core set)
- Advanced hook system in MVP (defer to post-MVP)

## Detailed Design

### Overview

The new architecture centers on four core MCP tools:

1. **`/docent:start`** - Initialize session, show capabilities
2. **`/docent:ask <query>`** - Query all knowledge (search `.docent/`, `docs/`, etc.)
3. **`/docent:act <runbook>`** - Execute runbooks (bundled or user-defined)
4. **`/docent:tell <info>`** - Update or create documentation in `.docent/`

**Key Principles:**

- **Managed content in `.docent/`:** Templates, runbooks, journals, sessions, notes
- **User override always wins:** User templates/runbooks in `.docent/` override bundled
- **Runbooks are procedures:** Bootstrap, doctor, issue filing—all runbooks
- **Templates are content:** Journals, ADRs, RFCs, project trackers
- **Configurable search:** `/docent:ask` searches configured paths

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User / Agent                      │
└──┬──────────┬───────────┬───────────────────────┬──┘
   │          │           │                       │
start│    ask  │      act  │                  tell │
   │          │           │                       │
┌──▼──────────▼───────────▼───────────────────────▼──┐
│              Docent MCP Server                      │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Resource Registry (User Override)         │    │
│  │  - Templates: .docent/templates/           │    │
│  │  - Runbooks: .docent/runbooks/             │    │
│  │  - Bundled: docent/templates/              │    │
│  │  - Bundled: docent/runbooks/               │    │
│  └────────────┬───────────────────────────────┘    │
│               │                                     │
│  ┌────────────▼───────────────────────────────┐    │
│  │  Knowledge Index                           │    │
│  │  - Search: .docent/, docs/, README.md      │    │
│  │  - Semantic retrieval                      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  Runbook Executor                           │   │
│  │  - Parse runbook markdown                   │   │
│  │  - Execute steps                            │   │
│  │  - Handle user/bundled runbooks             │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Components:**

- **Resource Registry:** Loads templates and runbooks, user resources override bundled
- **Knowledge Index:** Searches configured paths for `/docent:ask` queries
- **Runbook Executor:** Parses and executes runbook procedures for `/docent:act`
- **Doc Writer:** Creates/updates documentation for `/docent:tell`

### Implementation Details

#### Directory Structure

```
.docent/
  config.yaml              # Configuration

  templates/               # User templates (override bundled)
    custom-journal.md

  runbooks/                # User runbooks (override bundled)
    deploy.md
    health-check.md        # Overrides bundled doctor

  journals/                # Daily work journals
    2025-10-29.md

  sessions/                # Agent work sessions
    2025-10-29-planning.md

  notes/                   # Meeting notes, general notes
    team-meeting-10-29.md

  projects/                # Personal project tracking
    api-gateway.md

  decisions/               # ADRs
    adr-0001-use-postgres.md

  proposals/               # RFCs
    rfc-0001-new-feature.md
```

#### Configuration

```yaml
# .docent/config.yaml
root: .docent              # Where docent operates (default: .docent)

search_paths:              # Where /docent:ask searches
  - .docent                # Always search managed content
  - docs                   # Project documentation
  - README.md              # Project readme
```

#### Template Structure

Templates use frontmatter metadata with content in a single file:

**Single-file template:**

```yaml
---
name: journal-entry
description: Daily work journal entry with structured sections
type: single-file
author: docent
version: 1.0.0
tags: [journal, daily, productivity]

variables:
  - name: date
    description: Entry date
    type: string
    default: "{{today}}"
---
# Journal - {{date}}

## What I did

## What I learned

## What's next

## Questions/Blockers
```

**Multi-file template:**

Multi-file templates use markdown body with annotated code blocks. The LLM parses codeblock annotations (e.g., `typescript:path/to/file.ts`) to extract file paths and content.

````markdown
---
name: domain
description: Domain model with actions, schemas, and effect pattern
type: multi-file
author: docent
version: 1.0.0
tags: [code, architecture, domain, effects]

variables:
  - name: domain_name
    description: Domain name (e.g., "user", "payment")
    type: string
    required: true
---

# Domain: {{domain_name}}

This template creates a domain model following the actions/effects pattern.

## Structure

```
{{domain_name}}/
  actions/           # Business logic (pure functions)
  schemas/           # Runtime-validated schemas
  types/             # Type definitions
effects/             # Infrastructure interfaces
```

## Actions

Actions are pure functions with context injection, co-located with tests.

```typescript:{{domain_name}}/actions/create-{{domain_name}}.ts
import { Context } from '../types/context';

export async function create{{domain_name | capitalize}}(
  ctx: Context,
  data: unknown
) {
  // Implementation
}
```

```typescript:{{domain_name}}/actions/create-{{domain_name}}.test.ts
import { describe, it, expect } from 'vitest';
import { create{{domain_name | capitalize}} } from './create-{{domain_name}}';

describe('create{{domain_name | capitalize}}', () => {
  it('should create a {{domain_name}}', async () => {
    // Test implementation
  });
});
```

## Effects

Effects define interfaces with co-located implementations.

```typescript:effects/logger.ts
export interface Logger {
  info(message: string, meta?: Record<string, any>): Promise<void>;
}
```

```typescript:effects/logger.console.ts
import { Logger } from './logger';

export const consoleLogger: Logger = {
  async info(message, meta) {
    console.log(message, meta);
  },
};
```
````

**Frontmatter Schema:**

Required fields:

- `name` (string) - Template identifier, used for override resolution
- `description` (string) - Human-readable description shown in `/docent:start`
- `type` (enum) - Either `single-file` or `multi-file`

Optional fields:

- `author` (string) - Template creator
- `version` (string) - Semantic version (e.g., "1.0.0")
- `tags` (array) - Searchable tags for discovery
- `variables` (array) - Variable definitions for documentation/validation
  - `name` (string) - Variable name
  - `description` (string) - What this variable represents
  - `type` (string) - Data type (string, number, boolean)
  - `default` (string) - Default value if not provided
  - `required` (boolean) - Whether variable must be provided

**Template Body Format:**

- **Single-file templates:** Content follows frontmatter directly, uses variable interpolation
- **Multi-file templates:** Markdown body with annotated code blocks
  - Annotation syntax: ` ```language:path/to/file.ext`
  - LLM parses annotations to extract file paths and content
  - Can include explanatory text, structure diagrams, usage notes
  - Much more readable than YAML structure arrays

**Template Resolution:**

1. Check `.docent/templates/` for user templates
2. Fall back to bundled templates in `docent/templates/`
3. User templates with same `name` field override bundled templates

#### MCP Tools

Docent exposes 4 MCP tools that appear as slash commands in Claude Code:

1. **`/docent:start`** - Initialize session

   ```typescript
   {
     name: "start",
     parameters: {}
   }
   ```

   - Lists available templates (9 bundled + user overrides)
   - Lists available runbooks (3 bundled + user runbooks)
   - Shows usage examples
   - Fast path (<100ms, no LLM)

2. **`/docent:ask <query>`** - Query all knowledge

   ```typescript
   {
     name: "ask",
     parameters: {
       query: { type: "string", description: "Natural language query" }
     }
   }
   ```

   - Searches all configured paths (.docent/, docs/, etc.)
   - Semantic search through documentation
   - Returns relevant information

   Examples:
   - `/docent:ask what templates are available`
   - `/docent:ask how do we deploy to production`
   - `/docent:ask what did we work on yesterday`

3. **`/docent:act <runbook> [args]`** - Execute runbook

   ```typescript
   {
     name: "act",
     parameters: {
       runbook: { type: "string", description: "Runbook name or natural language" },
       args: { type: "string", description: "Optional arguments", required: false }
     }
   }
   ```

   - Executes bundled or user-defined runbooks
   - User runbooks in `.docent/runbooks/` override bundled
   - Semantic matching for runbook selection

   Examples:
   - `/docent:act bootstrap` → Initialize .docent/ structure
   - `/docent:act doctor` → Run health checks
   - `/docent:act file-issue bug in bootstrap` → File GitHub issue
   - `/docent:act deploy` → User-defined deployment runbook

4. **`/docent:tell <information>`** - Update documentation

   ```typescript
   {
     name: "tell",
     parameters: {
       information: { type: "string", description: "Information to record" }
     }
   }
   ```

   - Creates or updates documentation in `.docent/`
   - Determines appropriate location/format
   - Can append to journals, create ADRs, update notes

   Examples:
   - `/docent:tell I completed authentication feature` → Append to journal
   - `/docent:tell create ADR for using Postgres` → Create ADR from template
   - `/docent:tell I learned Redis needs AOF enabled` → Update/create note

#### Runbook Structure

Runbooks are markdown files with optional frontmatter:

```markdown
---
name: health-check
description: Run comprehensive project health checks
---

# Health Check Runbook

This runbook performs health checks on the project.

## Steps

### 1. Check for broken links

Run link checker on all documentation:

\`\`\`bash
# Find and check all markdown files
find . -name "*.md" -exec markdown-link-check {} \;
\`\`\`

### 2. Check for debug code

Search for debug statements:

\`\`\`bash
rg "console\.log|debugger|TODO|FIXME" --type ts --type js
\`\`\`

### 3. Run tests

\`\`\`bash
npm test
\`\`\`

## Success Criteria

- [ ] No broken links
- [ ] No debug code in production files
- [ ] All tests passing
```

**Bundled Runbooks:**

1. **bootstrap** - Initialize .docent/ structure
2. **health-check** - Run project health checks (replaces doctor command)
3. **file-issue** - File bug/feature/question to docent GitHub repo

#### Semantic Understanding

Both `/docent:act` and `/docent:tell` use LLM for natural language understanding:

**For `/docent:act`:**

```
/docent:act check if the project is healthy

↓ LLM maps to runbook

Matches: health-check (bundled runbook)

↓ Execute runbook steps
```

**For `/docent:tell`:**

```
/docent:tell I completed authentication feature

↓ LLM determines intent

Intent: Update journal with completed work

↓ Append to .docent/journals/2025-10-29.md
```

#### Session Initialization

`/docent:start` provides capability discovery:

```markdown
# Docent Ready

## Available Templates (9 bundled)

- journal-entry - Daily work journal
- todo-list - Task tracker with priorities
- meeting-notes - Meeting/discussion notes
- agent-session - Agent work session tracking
- prd - Product Requirements Document
- adr - Architecture Decision Record
- rfc - Request for Comments
- runbook - Operational procedures
- domain - Code architecture with actions/effects pattern

User templates in `.docent/templates/` override bundled templates.

## Available Runbooks

### Bundled (3)
- bootstrap - Initialize .docent/ structure
- health-check - Run project health checks
- file-issue - File bug/feature/question to GitHub

### User (yours)
- deploy - Custom deployment procedure
- backup - Backup procedures

User runbooks in `.docent/runbooks/` override bundled runbooks.

## Commands

- `/docent:start` - Show this message
- `/docent:ask <query>` - Query all knowledge
- `/docent:act <runbook>` - Execute runbook
- `/docent:tell <info>` - Update documentation

## Usage Examples

**Query knowledge:**
```

/docent:ask what templates are available
/docent:ask how do we deploy to production
/docent:ask what did we work on yesterday

```

**Execute procedures:**
```

/docent:act bootstrap
/docent:act health-check
/docent:act deploy
/docent:act file-issue bug in bootstrap command

```

**Record information:**
```

/docent:tell I completed authentication feature
/docent:tell I learned Redis needs AOF enabled
/docent:tell create ADR for using Postgres

```
```

#### Self-Directed Behavior (Future)

In future iterations, docent can invoke its own `/docent:tell` directives through hooks:

```
User: /docent:tell I finished the auth module
↓
Hook processes directive (agentic prompt)
↓
Hook executes: /docent:tell add journal entry "Completed auth module..."
Hook executes: /docent:tell update project tracker
Hook queries: /docent:ask what should we test next
```

This is deferred to post-MVP scope.

### Usage Examples

**Querying with /docent:ask:**

```
User: /docent:ask what templates are available

Docent: I have 9 bundled templates:
  - journal-entry: Daily work journal
  - todo-list: Task tracker with priorities
  - meeting-notes: Meeting/discussion notes
  - agent-session: Agent work session tracking
  - prd: Product Requirements Document
  - adr: Architecture Decision Record
  - rfc: Request for Comments
  - runbook: Operational procedures
  - domain: Code architecture example

Which would you like to use?
```

**Directives with /docent:tell:**

```
User: /docent:tell create journal entry for today

Docent: Created: journal/2025-10-29.md

What did you work on today?
```

```
User: /docent:tell I found a bug in bootstrap - it crashes on empty directories

Docent: Filed issue #143: Bug - bootstrap crashes on empty directories
        https://github.com/user/docent/issues/143
```

**Session workflow:**

```
User: /docent:start

Docent: [Shows available templates, commands, usage examples]

User: /docent:tell create agent-session for planning new feature

Docent: Created: sessions/2025-10-29-planning.md

User: /docent:ask what should I document in the session

Docent: Include: goals, work completed, key decisions, files changed,
        challenges/resolutions, discoveries, and context for next session.
```

### User Experience

**Before (current docent):**

```bash
# Multiple specific MCP tools
docent capture-work "Fixed auth"
docent resume-work
docent bootstrap --template default
docent file-issue --type bug --description "..."
docent doctor
```

**After (docent 2.0):**

```bash
# 4 natural language commands
/docent:tell I completed authentication
/docent:ask what should I work on next
/docent:act bootstrap
/docent:act health-check
/docent:act file-issue bug in bootstrap
```

**Workflow changes:**

- **Simpler API:** 4 commands instead of many specific tools
- **Clear semantics:** ask=read, act=execute, tell=write
- **User extensible:** Add runbooks and templates without code
- **Self-documenting:** `/docent:start` shows all capabilities
- **Natural language:** No need to remember exact syntax
- **Consistent:** User resources always override bundled

## Trade-offs and Alternatives

### Trade-offs

**Advantages:**

- **Simplicity:** Two verbs instead of many tools
- **Flexibility:** Templates handle any structure
- **Extensibility:** Users customize via templates and hooks, not code
- **Intuitive:** Natural language queries
- **Universal:** Works for developers and non-developers

**Disadvantages:**

- **Ambiguity:** Natural language queries may be unclear
- **Complexity:** Template + hook system is more sophisticated
- **Performance:** LLM calls for hook processing add latency
- **Learning curve:** Users must learn template/hook definition format

### Alternative 1: Keep Current Tool-Based API

**Description:** Maintain separate MCP tools (`capture-work`, `bootstrap`, etc.)

**Pros:**

- Clear, specific tool purposes
- No ambiguity in invocation
- Simpler implementation

**Cons:**

- Not intuitive for non-developers
- Rigid structure
- Hard to extend
- Many tools to learn

**Why not chosen:** Doesn't achieve goal of universal, extensible system

### Alternative 2: Code-Based Hooks

**Description:** Hooks as JavaScript/TypeScript functions

**Pros:**

- More powerful (full programming)
- Better IDE support
- Type safety

**Cons:**

- Requires coding knowledge
- Not agentic-friendly
- Harder to share/distribute
- Security concerns (arbitrary code execution)

**Why not chosen:** Prompt-based hooks better fit agentic workflows and democratize customization

### Alternative 3: GraphQL-Style Query Language

**Description:** Formal query syntax like `query { templates { name description } }`

**Pros:**

- Precise semantics
- Strongly typed
- Good tooling potential

**Cons:**

- Harder to learn
- Less natural for conversational use
- Overkill for simple queries

**Why not chosen:** Natural language better fits conversational agent workflows

## Security Considerations

- **Prompt injection:** User queries to `#ask` could contain malicious prompts
  - **Mitigation:** Sanitize queries, use structured parsing where possible

- **Hook execution:** Agentic hooks execute LLM-generated actions
  - **Mitigation:** Sandbox hook execution, require user confirmation for destructive operations

- **Template content:** User templates could contain malicious content
  - **Mitigation:** Warn when using custom templates, review before execution

- **Filesystem access:** Templates define file creation patterns
  - **Mitigation:** Validate paths, prevent directory traversal, stay within project boundaries

## Performance Considerations

- **LLM latency:** Hook processing requires LLM calls
  - **Impact:** ~1-3 second delay per hook invocation
  - **Mitigation:** Show progress indicators, cache common patterns

- **Template loading:** Registry must scan and parse YAML frontmatter
  - **Impact:** ~10-50ms at startup for bundled + user templates
  - **Mitigation:** Cache parsed templates in memory, lazy load content

- **Session commands:** `/docent:start` runs every session
  - **Impact:** Must be <100ms for good UX
  - **Mitigation:** Fast-path bypass of query router, pre-computed template list cache

- **Query processing:** Natural language queries require interpretation
  - **Impact:** ~500ms-2s for query understanding
  - **Mitigation:** Pattern matching for common queries before LLM fallback

## Testing Strategy

**Unit tests:**

- Template registry: YAML parsing, frontmatter validation, override logic
- Template resolution: bundled vs user priority
- Query router: parsing, routing to handlers
- Directive router: parsing, hook triggering
- Hook system: prompt generation, context passing
- Command routing: session vs operational command handling

**Integration tests:**

- End-to-end `#ask` flows
- End-to-end `#tell` flows
- Template instantiation (single-file and multi-file)
- User template override behavior (same `name` field)
- `/docent:start` performance and output format
- Operational command expansion to `#ask`/`#tell`

**Manual testing scenarios:**

- Non-developer user creating journal entries
- Developer scaffolding new project
- Custom template definition and usage
- Hook customization for specific workflows
- Session start capability discovery

## MVP Scope

To enable rapid dogfooding and validate the paradigm, the MVP includes:

### In MVP (Phase 1)

**Core Infrastructure:**

- Resource registry (templates + runbooks, user override logic)
- Configuration file (`.docent/config.yaml`)
- 9 bundled templates (already created in `/templates/`)
- 3 bundled runbooks (need to create):
  - `bootstrap.md` - Initialize .docent/ structure
  - `health-check.md` - Run health checks
  - `file-issue.md` - File GitHub issues

**MCP Tools (4 commands):**

- `/docent:start` - List resources and show usage (fast path, <100ms)
- `/docent:ask` - Search configured paths, return relevant docs
- `/docent:act` - Execute runbooks (parse markdown, run commands)
- `/docent:tell` - Create/update docs in .docent/

**Semantic Understanding:**

- LLM-based runbook matching for `/docent:act`
- LLM-based intent classification for `/docent:tell`
- Simple prompt-based approach

### Deferred to Post-MVP

**Not needed for initial dogfooding:**

- Advanced hook system (runbooks are sufficient for MVP)
- Self-directed behavior (docent invoking own commands)
- Vector embeddings for semantic search (use simple text search)
- Multi-file template instantiation (keep single-file for MVP)
- Template/runbook marketplace
- Runbook validation and testing framework

### MVP Success Criteria

- [ ] `/docent:start` shows all templates and runbooks
- [ ] `/docent:ask` searches .docent/ and docs/, returns relevant info
- [ ] `/docent:act bootstrap` creates `.docent/` structure
- [ ] `/docent:act health-check` runs project checks
- [ ] `/docent:act file-issue` creates GitHub issues
- [ ] `/docent:tell` creates journal entries and other docs
- [ ] User templates/runbooks override bundled resources
- [ ] Replaces current capture-work/resume-work workflow

## Migration and Rollout

### Migration Path

Since there's only one user (author), migration can be immediate:

1. **Phase 1: MVP (2-3 weeks)**
   - Implement template registry
   - Implement 5 MCP tools with basic routing
   - Test with real workflows, iterate

2. **Phase 2: Dogfood & Iterate (ongoing)**
   - Use docent 2.0 in daily work
   - Identify pain points and missing features
   - Refine semantic routing

3. **Phase 3: Advanced Features (future)**
   - Hook system for user customization
   - Self-directed behavior
   - Advanced semantic search
   - Template marketplace

4. **Phase 4: Cleanup (when stable)**
   - Remove legacy MCP tools
   - Update all documentation
   - Consider public release

### Backward Compatibility

Breaking changes acceptable (single user). Old workflows map to new paradigm:

- `capture-work` → `/docent:tell I completed {work}`
- `resume-work` → `/docent:ask what should I work on`
- `file-issue` → `/docent:act file-issue {description}`
- `bootstrap` → `/docent:act bootstrap`
- `doctor` → `/docent:act health-check`

Old docs/ structure migrates to .docent/ structure.

## Documentation Plan

**User-facing:**

- Getting started guide with `#ask`/`#tell` examples
- Template authoring guide
- Hook creation guide
- Bundled template reference

**API documentation:**

- MCP tool signatures
- Template schema reference
- Hook schema reference

**Migration guides:**

- Mapping old commands to new paradigm

**Examples:**

- Non-developer workflows (journaling, TODOs)
- Developer workflows (projects, runbooks)
- Custom template examples
- Hook examples

## Open Questions

1. **Hook ordering:** If multiple hooks match a directive, what's the execution order?
2. **Hook failure:** What happens if a hook fails or produces invalid output?
3. **Template validation:** Should we validate template structure before instantiation?
4. **Query ambiguity:** How do we handle ambiguous queries? Ask for clarification?
5. **Recursive tells:** Should we limit depth of docent invoking its own `#tell`s?
6. **Template versioning:** How do we handle template schema changes over time?

## Future Possibilities

This RFC establishes the foundation, but future work could include:

- **Semantic search:** Vector embeddings for better knowledge retrieval
- **Template marketplace:** Share templates across users/teams
- **Multi-modal templates:** Templates that include images, diagrams
- **Collaborative features:** Shared knowledge bases, team workspaces
- **IDE integration:** Native editor support for `#ask`/`#tell`
- **Voice interface:** Spoken queries and directives
- **Analytics:** Insights into knowledge usage patterns

## References

- [RFC-0005: DAG-Based Pipeline Planning](rfc-0005-dag-pipeline-planner.md) - Related agentic architecture
- [Current MCP API](/Users/tnez/Code/tnez/docent/src/mcp/handlers/) - Existing implementation
- [Template Examples](/Users/tnez/Code/tnez/docent/templates/) - Current template structure
