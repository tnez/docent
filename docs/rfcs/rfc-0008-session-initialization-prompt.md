# RFC-0008: Session Initialization Prompt

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-16
**Updated:** 2025-10-16
**Related:** RFC-0005 (Enhanced MCP Architecture), RFC-0006 (Session-Based Journals)

## Summary

Create an MCP prompt for session initialization that bootstraps agent work sessions with comprehensive project context. When agents connect to docent via MCP, they can invoke the "Initialize Session" prompt to receive: working guidelines, available resources (guides, runbooks, standards), journal workflow instructions, and project-specific conventions. This transforms the cold-start problem into an informed, guided beginning where agents understand how to work with docent and what's available in the project.

## Motivation

### Problem Statement

**The Cold Start Problem:**

When agents connect to a project via MCP, they start with zero context:

```
Agent connects to docent MCP server...
Agent: "I'm ready to help!"

What the agent doesn't know:
- How to use docent effectively
- When to capture work in journals
- What resources are available (runbooks, guides, standards)
- Project-specific working conventions
- Common tasks and their procedures
- Where to find documentation
```

**Current Reality:**

1. **Agents discover piecemeal** - They learn about docent features incrementally
2. **Trial and error** - Agent tries actions, user corrects, rinse/repeat
3. **Inconsistent usage** - Some agents use journal capture, others don't
4. **Hidden resources** - Agent doesn't know runbooks exist until user mentions them
5. **Repeated instructions** - User has to explain "use docent to capture work" every session

**User Pain:**

```
User: "Can you help me add a feature?"

Agent: [Starts working without checking guides or standards]

User: "Wait, did you check our contributing guide?"
Agent: "No, where is that?"

User: "Also, remember to capture your work in the journal"
Agent: "How do I do that?"

User: [Explains docent for the 10th time this week]
```

**What we want:**

```
User: "Can you help me add a feature?"

Agent: [Invokes session initialization prompt]
Agent: [Receives: working guidelines, available resources, journal instructions]
Agent: "I see you have contributing.md with code standards and a feature-development runbook. Let me review those first."
Agent: [Works effectively from the start ✅]
```

### Goals

1. **Bootstrap agent sessions** - Provide comprehensive initialization context
2. **Surface available resources** - Show guides, runbooks, standards, templates
3. **Establish working patterns** - Explain when/how to use journal, resources
4. **Project-specific conventions** - Include project-specific guidelines
5. **Reduce onboarding friction** - Agent productive immediately, not after trial/error

### Non-Goals

1. **Not replacing documentation** - Initiative prompt points to docs, doesn't replace them
2. **Not mandatory** - Agents can skip initialization if they prefer
3. **Not enforcing behavior** - Guidelines, not rules
4. **Not project-agnostic** - Intentionally customizable per project

## Detailed Design

### Overview

Create a new MCP prompt called **"Initialize Session"** (or "Session Bootstrap") that:

1. **Dynamically discovers** available resources (guides, runbooks, standards, templates)
2. **Provides working guidelines** for using docent effectively
3. **Explains journal workflow** (when to capture work, how to use sessions)
4. **Lists common tasks** with pointers to relevant documentation
5. **Includes project-specific** conventions from project docs

**MCP Prompt Invocation:**

```typescript
// Agent startup
const init = await mcp.getPrompt('init-session', {})

// Returns comprehensive initialization message with:
// - Available resources directory
// - Docent usage guidelines
// - Journal workflow
// - Project conventions
// - Quick reference
```

### Prompt Structure

**Prompt Definition:**

```typescript
// src/mcp/prompts/definitions.ts

const PROMPTS: Record<string, Prompt> = {
  'init-session': {
    name: 'Initialize Session',
    description: 'Bootstrap work session with project context and docent guidelines',
    arguments: [
      {
        name: 'focus',
        description: 'Optional focus area: development, operations, documentation',
        required: false
      }
    ]
  }
}
```

**Prompt Content (Table of Contents Format):**

```markdown
# Session Initialization

📍 **docent** provides documentation intelligence for this project.

## 🗂️ Available Resources (Table of Contents)

**Guides** - How-to documentation
{{#each guides}}
- `{{uri}}` - {{shortDescription}}
{{/each}}

**Runbooks** - Step-by-step operational procedures
{{#each runbooks}}
- `{{uri}}` - {{shortDescription}}
{{/each}}

**Standards** - Project conventions and patterns
{{#each standards}}
- `{{uri}}` - {{shortDescription}}
{{/each}}

**Templates** - Document templates for ADRs, RFCs, specs
- {{templateCount}} templates available via `mcp.listResources()`

💡 **How to access:** `await mcp.readResource('docent://guide/getting-started')`

---

## 📝 CRITICAL: Journal Workflow

**This is a HUGE pain point when working across sessions/projects. Follow this pattern:**

**Pattern:** capture → resume → capture → resume

### When to Capture Work

Use `capture-work` tool:
- ✅ After completing significant tasks
- ✅ Before context window resets
- ✅ When discovering important insights
- ✅ When switching between major features

### How to Resume Work

Use `resume-work` prompt:
- Gathers recent journal entries
- Shows git status and commits
- Provides context to continue seamlessly

**Quick Example:**
```typescript
// End of work session
mcp.callTool('capture-work', {
  summary: "Implemented OAuth2 authentication",
  discoveries: ["Server components needed for callbacks"],
  next_steps: ["Add session persistence"]
})

// Start of next session
mcp.getPrompt('resume-work')  // ← Gets full context to continue
```

**Location:** `docs/.journal/YYYY-MM-DD-session-NNN.md` (automatic)

---

## 🎯 Project Conventions

{{#if projectConventions}}
Found at `docs/.config/CONVENTIONS.md`:
{{projectConventions}}
{{else}}
No custom conventions file. Check guides for project-specific patterns.
{{/if}}

---

## 🚀 Common Tasks (Quick Reference)

| Task | Where to Look |
|------|---------------|
| Getting started | `docent://guide/getting-started` |
| Add a feature | `docent://guide/contributing` + look for runbooks |
| Run tests | `docent://guide/testing` |
| Check CI/CD | `docent://runbook/ci-cd-health-check` |
| Resume work | `mcp.getPrompt('resume-work')` |

**Discovery Commands:**

- `mcp.listResources()` - See all available documentation
- `mcp.listPrompts()` - See all available workflows
- `mcp.readResource('docent://...')` - Read specific documentation

---

✅ **You're ready!** Browse resources as needed, and **remember to capture work before session ends**.

```

### Prompt Builder Implementation

```typescript
// src/mcp/prompts/builder.ts

private async buildInitSession(args: Record<string, string>): Promise<{description?: string; messages: PromptMessage[]}> {
  const {focus} = args

  // 1. Discover all available resources
  const resourceHandler = new ResourceHandler(this.basePath)
  const allResources = await resourceHandler.list()

  // 2. Categorize resources
  const guides = allResources.filter(r => r.uri.startsWith('docent://guide/'))
  const runbooks = allResources.filter(r => r.uri.startsWith('docent://runbook/'))
  const standards = allResources.filter(r => r.uri.startsWith('docent://standard/'))
  const templates = allResources.filter(r => r.uri.startsWith('docent://template/'))

  // 3. Check for project-specific conventions
  let projectConventions = ''
  try {
    const conventionsPath = path.join(this.basePath, 'docs', '.config', 'CONVENTIONS.md')
    projectConventions = await fs.readFile(conventionsPath, 'utf-8')
  } catch {
    // No conventions file - that's okay
  }

  // 4. Get project analysis
  const analysis = await analyzeProject(this.basePath)

  // 5. Build the initialization prompt
  const prompt = this.renderInitPrompt({
    guides,
    runbooks,
    standards,
    templates,
    projectConventions,
    analysis,
    focus
  })

  return {
    description: 'Session initialization with project context',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  }
}

private renderInitPrompt(context: {
  guides: Resource[]
  runbooks: Resource[]
  standards: Resource[]
  templates: Resource[]
  projectConventions: string
  analysis: ProjectAnalysis
  focus?: string
}): string {
  // Template rendering with Handlebars or simple string interpolation
  let prompt = `# Session Initialization

Welcome! This project uses **docent** for documentation intelligence and workflow guidance.

## 🗺️ Available Resources

I've discovered the following resources in this project:
`

  // Add guides section
  if (context.guides.length > 0) {
    prompt += '\n### Guides\n\n'
    for (const guide of context.guides) {
      prompt += `- **${guide.name}** (\`${guide.uri}\`)\n`
      if (guide.description) {
        prompt += `  ${guide.description}\n`
      }
    }
  }

  // Add runbooks section
  if (context.runbooks.length > 0) {
    prompt += '\n### Runbooks\n\n'
    for (const runbook of context.runbooks) {
      prompt += `- **${runbook.name}** (\`${runbook.uri}\`)\n`
      if (runbook.description) {
        prompt += `  ${runbook.description}\n`
      }
    }
  }

  // Add standards section
  if (context.standards.length > 0) {
    prompt += '\n### Standards\n\n'
    for (const standard of context.standards) {
      prompt += `- **${standard.name}** (\`${standard.uri}\`)\n`
      if (standard.description) {
        prompt += `  ${standard.description}\n`
      }
    }
  }

  // Add templates section
  if (context.templates.length > 0) {
    prompt += '\n### Templates\n\n'
    for (const template of context.templates) {
      prompt += `- **${template.name}** (\`${template.uri}\`)\n`
      if (template.description) {
        prompt += `  ${template.description}\n`
      }
    }
  }

  // Add journal workflow section
  prompt += `
## 📝 Working with Journals

This project uses **session-based journals** for work capture:

**Location:** \`docs/.journal/YYYY-MM-DD-session-NNN.md\`

**When to Capture:**
- After completing a significant task or milestone
- When discovering important insights or decisions
- Before context window resets or session changes
- When switching between major features/tasks

**How to Capture:**
Use the \`capture-work\` tool with:
- \`summary\`: Brief description of what was accomplished (1-2 sentences)
- \`discoveries\`: Key learnings or insights (optional)
- \`next_steps\`: What should be done next (optional)
- \`questions\`: Open questions or partially explored ideas (optional)
- \`new_session\`: Set to true to force a new journal session (optional)

**Example:**
\`\`\`typescript
mcp.callTool('capture-work', {
  summary: "Implemented user authentication with OAuth2",
  discoveries: [
    "Next.js App Router requires server components for OAuth callbacks",
    "Environment variables need NEXT_PUBLIC_ prefix for client access"
  ],
  next_steps: [
    "Add session persistence with Redis",
    "Implement role-based access control"
  ]
})
\`\`\`
`

  // Add docent usage guidelines
  prompt += `
## 🔧 Docent Usage Guidelines

### Discovering Information

**List all resources:**
\`\`\`typescript
const resources = await mcp.listResources()
\`\`\`

**Read a specific resource:**
\`\`\`typescript
const guide = await mcp.readResource('docent://guide/contributing')
\`\`\`

**Find runbooks for tasks:**
\`\`\`typescript
const runbooks = resources.filter(r => r.uri.startsWith('docent://runbook/'))
\`\`\`

### Common Workflows

**Starting a new feature:**
1. Check \`docent://guide/contributing\` for development process
2. Review relevant standards (\`docent://standard/*\`)
3. Look for feature-related runbooks
4. Capture work as you progress

**Troubleshooting:**
1. Check \`docent://runbook/ci-cd-health-check\` for health checks
2. Review relevant guides for debugging procedures
3. Capture discoveries about issues and solutions

**Before committing:**
1. Review \`docent://guide/contributing\` for commit conventions
2. Run any pre-commit checks mentioned in guides
3. Capture a journal entry summarizing the work
`

  // Add project-specific conventions
  if (context.projectConventions) {
    prompt += `
## 🎯 Project-Specific Conventions

${context.projectConventions}
`
  } else {
    prompt += `
## 🎯 Project-Specific Conventions

No project-specific conventions file found. Check guides for project patterns.
`
  }

  // Add quick reference
  prompt += `
## 🚀 Quick Reference

**Most Common Tasks:**

1. **Explore codebase** → Read \`docent://guide/getting-started\`
2. **Add a feature** → Read \`docent://guide/contributing\`, check for feature runbooks
3. **Run tests** → Check \`docent://guide/testing\`
4. **Fix a bug** → Review testing guide, check troubleshooting runbooks
5. **Deploy changes** → Look for \`docent://runbook/deploy-*\` resources
6. **Resume work** → Use the \`resume-work\` prompt to gather context

**Project Info:**
- **Languages:** ${context.analysis.languages.join(', ')}
- **Frameworks:** ${context.analysis.frameworks.join(', ')}
- **Build Tools:** ${context.analysis.buildTools.join(', ')}

**Need Help?**

- List available prompts: \`await mcp.listPrompts()\`
- List available resources: \`await mcp.listResources()\`
- Get specific resource: \`await mcp.readResource('docent://...')\`

---

**You're all set!** Start by exploring the guides above or ask me specific questions about the project.
`

  return prompt
}
```

### User Experience

**Scenario 1: Agent Startup**

```typescript
// Agent connects to docent MCP server

Agent: "I'll initialize my session first"
Agent: await mcp.getPrompt('init-session')

Agent receives:
- 6 guides available
- 1 runbook available
- 0 standards (none created yet)
- 8 templates available
- Journal workflow explanation
- Quick reference

Agent: "I see you have a contributing guide and testing guide. Let me review those before we start."
Agent: await mcp.readResource('docent://guide/contributing')
Agent: "I understand the code standards and commit conventions. How can I help?"
```

**Scenario 2: Resume Work After Break**

```typescript
User: "Let's continue working on the authentication feature"

Agent: "Let me initialize my session to understand the project context"
Agent: await mcp.getPrompt('init-session')
Agent: [Sees journal workflow, available guides]

Agent: "I'll use the resume-work prompt to gather recent context"
Agent: await mcp.getPrompt('resume-work')
Agent: [Gets journal entries, git status, commits]

Agent: "I see you were implementing OAuth2 integration. The last session noted that server components are needed for OAuth callbacks. Should we continue with session persistence?"
```

**Scenario 3: Focused Initialization**

```typescript
// Agent working on operational tasks

Agent: await mcp.getPrompt('init-session', { focus: 'operations' })

// Returns initialization with emphasis on:
// - Runbooks (more prominent)
// - Deployment guides
// - CI/CD health checks
// - Operations-specific workflows
```

## Implementation Details

### File Structure

```
src/mcp/prompts/
├── definitions.ts          # Prompt definitions including init-session
├── builder.ts              # PromptBuilder class (add buildInitSession)
└── types.ts                # Prompt types

docs/
├── .config/
│   └── CONVENTIONS.md      # Optional: Project-specific conventions
├── .journal/               # Session journals (gitignored)
│   └── YYYY-MM-DD-session-NNN.md
├── guides/
│   ├── getting-started.md
│   ├── contributing.md
│   └── testing.md
├── runbooks/
└── ...
```

### Integration with Existing Prompts

The `init-session` prompt **complements** existing prompts:

- **resume-work** - Gathers context from journals/git (use after init)
- **review-rfc** - Focused on RFC review (use when needed)
- **create-adr** - Guided ADR creation (use when needed)

**Relationship:**

```
Session Start
    ↓
[init-session] ← Broad overview, resources directory
    ↓
Agent explores guides/runbooks
    ↓
[resume-work] ← Detailed recent context (if returning)
    ↓
Agent works with full context
```

### Customization Points

**Per-Project Customization:**

1. **CONVENTIONS.md** - Project-specific guidelines
   - Location: `docs/.config/CONVENTIONS.md`
   - Content: Project-specific patterns, preferences, gotchas
   - Automatically included in init prompt if present
   - Human AND agent readable

2. **Resource Descriptions** - Make resources discoverable
   - Write clear, one-line descriptions
   - Table of contents format - WHERE to find info, not the info itself
   - Focus on answering: "When would I need this?"

3. **Focus Areas** - Optional argument to init prompt (future enhancement)
   - `focus: 'development'` - Emphasize coding guides
   - `focus: 'operations'` - Emphasize runbooks
   - `focus: 'documentation'` - Emphasize standards/templates

**Example docs/.config/CONVENTIONS.md:**

```markdown
# Project Conventions

## Code Organization

- Features: `src/features/{feature-name}/`
- Each feature needs: `index.ts`, `types.ts`, `handlers.ts`, `tests.ts`

## Testing Philosophy

- Business logic tests (required)
- API integration tests (required)
- UI tests for critical paths (recommended)

## Commit Format

Conventional Commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests

## Deployment

Via GitHub Actions - see `docent://runbook/deploy-production`
```

## Trade-offs and Alternatives

### Chosen Approach: Dynamic MCP Prompt

**Advantages:**

- ✅ **Discoverable** - Agents see "Initialize Session" in prompt list
- ✅ **Dynamic** - Reflects current state of project resources
- ✅ **Customizable** - Projects can add CONVENTIONS.md for specifics
- ✅ **MCP-native** - Uses standard MCP prompts
- ✅ **Non-invasive** - Optional, agents can skip if desired

**Disadvantages:**

- ❌ **Requires invocation** - Agent must explicitly call prompt
- ❌ **Could get stale** - If resources change mid-session
- ❌ **Large output** - Comprehensive prompt may be lengthy

**Assessment:** Benefits outweigh drawbacks. Optional nature means no forcing, dynamic generation keeps it current.

### Alternative 1: Static README-style Resource

**Description:** Create `docent://guide/working-with-docent` static resource

**Pros:**

- Simpler (just a markdown file)
- Always available
- No code required

**Cons:**

- ❌ Not dynamic (doesn't list current resources)
- ❌ Less discoverable (buried among other guides)
- ❌ Manual maintenance (gets out of sync)
- ❌ No project customization

**Why not chosen:** Static content becomes stale, doesn't reflect actual available resources.

### Alternative 2: Automatic System Prompt

**Description:** MCP server includes initialization content in every tool/resource response

**Pros:**

- No explicit invocation needed
- Agent always has context

**Cons:**

- ❌ Not MCP-native (hacking responses)
- ❌ Inefficient (repeated content)
- ❌ Pollutes responses with boilerplate
- ❌ No opt-out

**Why not chosen:** Violates MCP design, adds noise to every interaction.

### Alternative 3: Agent Profile/Config

**Description:** Create a configuration file agents read on startup (`.docent.config.json`)

**Pros:**

- Machine-readable format
- Could include agent-specific settings
- Cacheable

**Cons:**

- ❌ Not MCP-native
- ❌ Agents would need custom logic to read
- ❌ Not human-readable
- ❌ Doesn't leverage MCP prompts

**Why not chosen:** MCP prompts are the native way to provide initialization content.

### Alternative 4: Per-Resource Metadata

**Description:** Include initialization info in metadata of every resource

**Pros:**

- Distributed (no single source of truth)
- Each resource self-documents

**Cons:**

- ❌ Repetitive (duplicated across resources)
- ❌ No overview (agent must read all resources)
- ❌ Inconsistent (each resource might say different things)
- ❌ Maintenance burden

**Why not chosen:** Single comprehensive prompt is clearer than distributed metadata.

## Success Criteria

**Quantitative:**

- ✅ `init-session` prompt listed in `mcp.listPrompts()`
- ✅ Prompt invocation completes in <2 seconds (table of contents format)
- ✅ Dynamically lists all available resources (guides, runbooks, standards, templates)
- ✅ Includes project conventions if `docs/.config/CONVENTIONS.md` exists
- ✅ Prompt output is concise (< 2000 tokens) for startup efficiency

**Qualitative:**

- ✅ Agents understand how to use docent after reading prompt
- ✅ Agents proactively check guides before implementing features
- ✅ Agents use `capture-work` tool appropriately
- ✅ Agents discover runbooks for operational tasks
- ✅ User doesn't need to explain docent workflow every session

**User Feedback:**

- "Agent knew to check the contributing guide without me asking"
- "Agent captured work entries naturally"
- "Didn't have to explain the journal workflow this time"

## Testing Strategy

### Unit Tests

1. **Prompt Definition**
   - `init-session` prompt exists in definitions
   - Has correct name, description, arguments

2. **Prompt Building**
   - `buildInitSession` gathers resources correctly
   - Categorizes resources by type
   - Reads CONVENTIONS.md if present
   - Handles missing CONVENTIONS.md gracefully
   - Renders prompt with all sections

3. **Resource Discovery**
   - Lists all guides, runbooks, standards, templates
   - Filters by URI prefix correctly
   - Includes resource names and descriptions

### Integration Tests

1. **End-to-End Invocation**
   - Invoke `init-session` via MCP
   - Verify prompt content structure
   - Check resource lists match actual files

2. **With Project Conventions**
   - Create `docs/.config/CONVENTIONS.md`
   - Invoke prompt
   - Verify conventions included in output

3. **Without Project Conventions**
   - Remove `docs/.config/CONVENTIONS.md`
   - Invoke prompt
   - Verify graceful fallback message

### Manual Testing (Dogfooding)

1. **Fresh Session Startup**
   - Connect agent to docent MCP
   - Invoke `init-session` prompt
   - Verify agent understands context

2. **After Reading Initialization**
   - Ask agent to implement a feature
   - Observe if agent checks guides first
   - Verify agent uses journal appropriately

3. **Focused Initialization**
   - Try `focus: 'operations'`
   - Verify emphasis on runbooks
   - Check that relevant content highlighted

## User Feedback & Design Decisions

### 1. Auto-Invocation Strategy

**User Decision:** Enable auto-invocation via agent configuration files (CLAUDE.md, AGENTS.md, etc.)

**Implementation:**

- Users add one line to their agent config: `"At session start, invoke the 'init-session' prompt from docent"`
- This makes initialization automatic without forcing it into docent itself
- Keeps docent opt-in while enabling automatic behavior for those who want it

**Example `.claude/CLAUDE.md`:**

```markdown
# Project Setup

At the start of each session, invoke the 'init-session' prompt from the docent MCP server to bootstrap project context.
```

### 2. Prompt Length: Table of Contents Approach

**User Decision:** Keep prompt concise - "table of contents with quick summaries"

**Rationale:**

- Runs on every startup → context budget matters
- Should be quick reference, not comprehensive documentation
- Point to resources, don't duplicate them

**Design:**

- List available resources with one-line descriptions
- Explain WHERE to find information, not the information itself
- Clear instructions on HOW to access details when needed
- Think: "Here's what exists and how to find it when relevant"

### 3. Journal Workflow Emphasis

**User Decision:** Journal capture + resume-work is CRITICAL - make this pattern very clear

**Rationale:**

- "HUGE pain point" when working with agents across multiple projects/sessions
- Context loss is expensive and frustrating
- Want agents to follow this pattern consistently

**Implementation:**

- Journal workflow gets prominent placement in init prompt
- Clear examples of when to capture work
- Explicit connection between capture-work and resume-work
- Make the pattern: capture → resume → capture → resume obvious

### 4. Configuration Location

**User Decision:** All project-specific config lives in `docs/` using dot-directories

**Rationale:**

- No files outside the main docs/ directory
- Keep everything human AND agent readable
- Use standard dotfile conventions (hidden from casual browsing)

**Structure:**

```
docs/
├── .config/               # Docent configuration
│   └── CONVENTIONS.md     # Project-specific conventions
├── .journal/              # Session journals (gitignored)
├── .history/              # Historical archives (optional)
├── guides/
├── runbooks/
└── ...
```

**Note:** Dot-directories (`.config`, `.journal`, etc.) are standard practice for configuration/state files that shouldn't clutter the main documentation tree.

1. **Should we cache initialization content?**
   - Resources might change during session
   - But initialization only happens once
   - **Recommendation:** No caching, rebuild on each invocation (cheap operation)

2. **What about multi-project workspaces?**
   - Agent working across multiple projects
   - Need initialization per project?
   - **Recommendation:** Initialization is per MCP server (per project), works naturally

3. **Should initialization include resume-work context?**
   - Could combine init + resume in one prompt
   - Or keep them separate
   - **Recommendation:** Keep separate, allow chaining (init → resume)

## Future Enhancements

### Enhanced Discovery

1. **Semantic Resource Search**
   - Agent: "Show me resources about testing"
   - Returns: Testing guide, testing runbooks, test templates

2. **Related Resources**
   - Each resource suggests related resources
   - "If you're reading X, you might also need Y"

3. **Usage Analytics**
   - Track which resources are most accessed
   - Surface most relevant resources in init prompt

### Interactive Initialization

1. **Guided Onboarding**
   - Prompt asks: "What are you working on?"
   - Suggests relevant resources based on answer

2. **Focus-Based Filtering**
   - `focus: 'feature-auth'` shows auth-related resources
   - Dynamic filtering based on context

### Smart Defaults

1. **Learn Agent Preferences**
   - Track which resources agent uses most
   - Prioritize those in future initializations

2. **Project-Specific Init Prompts**
   - Projects can define custom init prompts
   - Override or extend default initialization

## References

### Related Docent Documentation

- [RFC-0005: Enhanced MCP Architecture](./rfc-0005-enhanced-mcp-architecture.md) - MCP resources and prompts
- [RFC-0006: Session-Based Journal Architecture](./rfc-0006-session-based-journal-architecture.md) - Journal workflow
- [RFC-0007: Resource-Based Question Answering](./rfc-0007-resource-based-question-answering.md) - Resource discoverability

### MCP Resources

- [MCP Prompts Specification](https://spec.modelcontextprotocol.io/prompts)
- [MCP Resources Specification](https://spec.modelcontextprotocol.io/resources)

### Inspiration

- [GitHub Codespaces onboarding](https://docs.github.com/en/codespaces) - Workspace initialization
- [VS Code workspace recommendations](https://code.visualstudio.com/docs/getstarted/settings) - Extension suggestions
- CLI tools with `--help` that explain available commands

---

**This RFC proposes a session initialization prompt that bootstraps agent work sessions with comprehensive project context, making agents productive immediately by surfacing available resources, explaining docent workflows, and providing project-specific conventions.**
