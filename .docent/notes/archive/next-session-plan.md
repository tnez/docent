# Next Session Plan: Docent 2.0 MVP

## Current State (2025-10-28)

**Completed:**

- ✅ RFC-0006 complete with final architecture
- ✅ 9 bundled templates with YAML frontmatter
- ✅ 5 bundled runbooks with YAML frontmatter
- ✅ Resource registry (loads templates/runbooks, handles user overrides)
- ✅ Extended config system (.docent/config.yaml with search_paths and projects)
- ✅ `/docent:start` MCP tool working (lists resources, shows commands)
- ✅ Commit c06298b created with all foundation work

**Working:**

- Can call `/docent:start` to see available templates, runbooks, and commands
- Infrastructure is in place for ask/act/tell paradigm

**Not Working:**

- `/docent:ask` - not implemented yet
- `/docent:act` - not implemented yet
- `/docent:tell` - not implemented yet

---

## Critical Design Insight: Declarative, Not Imperative

**Key Principle:** Docent is a **coordinator and context provider**, not an executor.

### What This Means

When an agent calls docent commands, docent should:

1. **Gather context** (search docs, load runbooks, analyze state)
2. **Format instructions** (clear, actionable guidance)
3. **Return to agent** (let agent execute with appropriate tools/subagents)

### Examples

**Bad (Imperative - What We're NOT Building):**

```typescript
// ❌ Docent tries to execute commands itself
async function handleActTool(directive: string) {
  if (directive.includes('bootstrap')) {
    await execSync('mkdir -p .docent')
    await execSync('touch .docent/config.yaml')
    // ... docent executes everything
  }
}
```

**Good (Declarative - What We ARE Building):**

```typescript
// ✅ Docent provides instructions for agent to execute
async function handleActTool(directive: string) {
  if (matchesRunbook(directive, 'bootstrap')) {
    const runbook = getRunbook('bootstrap')
    return {
      instructions: runbook.content,
      guidance: `
This runbook guides you through initializing .docent/ structure.
Please execute the steps, using subagents as appropriate.
Check prerequisites first, then proceed through each step.
      `
    }
  }
}
```

---

## Implementation Plan: Next 3 Commands

### 1. `/docent:act [directive]` - Execute Runbooks

**Purpose:** Provide runbook instructions for agent to execute

**Implementation:**

- Parse directive to identify runbook (semantic matching)
- Load runbook from registry
- Format for agent consumption
- Return runbook markdown + execution guidance

**Example Flow:**

```
User → Agent: "Bootstrap the project"
Agent: /docent:act bootstrap
Docent: Returns bootstrap runbook content + "Please execute these steps"
Agent: Reads runbook, creates directories, files, etc. using available tools
Agent → User: "✅ Project bootstrapped successfully"
```

**Code Structure:**

```typescript
// src/mcp/tools/act.ts
export async function handleActTool(args: {directive: string}) {
  // 1. Use semantic router to identify runbook
  const runbookName = identifyRunbook(args.directive)

  // 2. Load runbook from registry
  const runbook = registry.getRunbook(runbookName)

  // 3. Format for agent
  return formatRunbookForExecution(runbook)
}
```

### 2. `/docent:ask [query]` - Search Documentation

**Purpose:** Gather relevant documentation for agent to synthesize answer

**Implementation:**

- Search all configured paths (from config.yaml search_paths)
- Use ripgrep for fast content search
- Return relevant documentation chunks
- Let agent synthesize the answer

**Example Flow:**

```
User → Agent: "How do I configure the build?"
Agent: /docent:ask how to configure build
Docent: Returns relevant docs from .docent/ and docs/
Agent: Reads docs, synthesizes answer
Agent → User: "Build is configured via package.json scripts..."
```

**Code Structure:**

```typescript
// src/mcp/tools/ask.ts
export async function handleAskTool(args: {query: string}) {
  // 1. Search configured paths
  const results = await searchDocumentation(args.query, config.searchPaths)

  // 2. Rank by relevance
  const ranked = rankResults(results, args.query)

  // 3. Format for agent consumption
  return formatSearchResults(ranked)
}
```

### 3. `/docent:tell [statement]` - Write Documentation

**Purpose:** Research where to write, provide clear instructions for agent to edit

**Implementation:**

- Understand what information needs to be documented
- Search existing docs to find appropriate location
- If no good location, suggest new file path
- Provide clear edit instructions
- Let agent make the actual edits

**Example Flow:**

```
User → Agent: "I learned that X does Y"
Agent: /docent:tell I learned that X does Y
Docent: Researches existing docs, determines best location
Docent: Returns "Add this information to docs/concepts/x.md, section 'How X Works'"
Agent: Uses Edit tool to update the file
Agent → User: "✅ Documentation updated"
```

**Code Structure:**

```typescript
// src/mcp/tools/tell.ts
export async function handleTellTool(args: {statement: string}) {
  // 1. Understand what's being told
  const intent = parseIntent(args.statement)

  // 2. Research where it should go
  const location = await findDocumentationHome(intent, config.searchPaths)

  // 3. Generate edit instructions
  return formatEditInstructions(intent, location)
}
```

---

## Implementation Order

**Phase 1: Basic Functionality (4-6 hours)**

1. Implement `/docent:act` with exact runbook name matching
2. Implement `/docent:ask` with simple grep search
3. Test flow: start → act bootstrap → ask question

**Phase 2: Intelligence (4-6 hours)**
4. Add semantic routing for `/docent:act` (fuzzy runbook matching)
5. Improve `/docent:ask` with relevance ranking
6. Implement basic `/docent:tell` (append to journal or notes)

**Phase 3: Polish (2-4 hours)**
7. Full `/docent:tell` with document location research
8. Better formatting of all responses
9. Error handling and edge cases
10. Test complete MVP flow

**Total Estimated Time:** 10-16 hours to functional MVP

---

## Success Criteria

MVP is ready when an agent can:

1. ✅ Call `/docent:start` and see available resources
2. ✅ Call `/docent:act bootstrap` and receive runbook to execute
3. ✅ Execute bootstrap steps using available tools
4. ✅ Call `/docent:ask how to configure X` and receive relevant docs
5. ✅ Synthesize answer from docs
6. ✅ Call `/docent:tell I learned Y` and receive edit instructions
7. ✅ Update documentation using available tools

When all 7 work, we have a functional docent 2.0 MVP!

---

## Open Design Questions

1. **Runbook Format:** Return raw markdown or add guidance wrapper?
   - **Lean toward:** Add minimal wrapper with execution hints

2. **Search Results:** Return all matches or top N?
   - **Lean toward:** Top 10 most relevant, with option to see more

3. **Tell Precision:** Exact file/line or multiple options?
   - **Lean toward:** Suggest 1-2 best locations, let agent choose

4. **Subagent Hints:** Explicitly suggest subagents or let agent decide?
   - **Lean toward:** Let agent decide autonomously (don't over-prescribe)

5. **Tool Suggestions:** Mention specific tools (Edit, Write) in responses?
   - **Lean toward:** No - agent knows its available tools

---

## Files to Create Next Session

1. `/Users/tnez/Code/tnez/docent/src/mcp/tools/act.ts`
2. `/Users/tnez/Code/tnez/docent/src/mcp/tools/ask.ts`
3. `/Users/tnez/Code/tnez/docent/src/mcp/tools/tell.ts`
4. `/Users/tnez/Code/tnez/docent/src/lib/semantic-router.ts` (if needed)
5. `/Users/tnez/Code/tnez/docent/src/lib/search.ts` (for ask implementation)

---

## Current Git State

- Branch: main
- 2 commits ahead of origin/main
- Last commit: c06298b "feat: implement resource registry system for docent 2.0 architecture"
- Working directory: clean
- Ready to continue implementation

---

## Quick Start Next Session

```bash
# Verify state
git log -1 --oneline
npm run build

# Start implementing /docent:act
# Create src/mcp/tools/act.ts
# Register in src/mcp/server.ts
# Build and test
```
