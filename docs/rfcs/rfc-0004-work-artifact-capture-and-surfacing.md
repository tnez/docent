# RFC-0004: Work Artifact Capture and Surfacing

**Status:** Draft
**Author:** @tnez (via dogfooding session)
**Created:** 2025-10-13
**Updated:** 2025-10-13

## Summary

Add docent capability to capture work artifacts (decisions, tasks, questions, improvements) discovered during development sessions and surface them at contextually relevant times. Prevents the "bottomless pit" problem where discovered work gets lost or forgotten.

**Core insight:** Documentation isn't just writing docs - it's capturing what you learn and decide *during* work, so it doesn't vanish.

## Motivation

### Problem Statement

**The pain point (experienced in real-time during documentation update):**

While updating architecture docs from CLI to MCP-only:
1. Started with 4 todos: create ADR, update architecture, convert specs, find references
2. Discovered during work: architecture overview has 30+ sections to update
3. Realized: "This is too much to finish right now, but I don't want to lose track"
4. **The friction:** No good way to:
   - Stash partially completed work with context
   - Capture discovered sub-tasks without derailing current focus
   - Ensure these don't become "never to be seen again" items
   - Surface them when contextually relevant (e.g., "Hey, you never finished architecture overview section 3-7")

**Who is affected:**
- Solo developers juggling multiple concerns
- Developers using AI agents who discover work during agent interactions
- Anyone doing exploratory or investigative work where scope expands
- Teams doing refactoring where you discover more issues as you go

**Current workarounds (all insufficient):**
- TODO comments in code → scattered, hard to track, often forgotten
- External task trackers → context switch, lose connection to code/docs
- Agent todo lists → ephemeral, lost when conversation ends
- Memory → unreliable, high cognitive load

**Consequences of not solving:**
- Work artifacts get lost in "bottomless pit"
- Developers hesitate to explore (afraid of losing track)
- Partial work blocks progress (can't safely pause/resume)
- Knowledge captured during work evaporates
- Context switching kills flow

### Goals

- **Capture work artifacts in-flow** without breaking concentration
- **Preserve context** - Why was this discovered? What was the situation?
- **Surface intelligently** - Show relevant items when working in related areas
- **Prevent loss** - Ensure captured items don't vanish into bottomless pit
- **Enable pause/resume** - Safely stop mid-task and resume later with full context

### Non-Goals

- Replace general-purpose task management (Jira, Linear, GitHub Issues)
- Real-time collaboration or team task assignment
- Complex workflows or state machines
- Build another todo app

**This is about:** Capturing *documentation-related* work discovered during development, with enough context to act on it later.

## Detailed Design

### Overview

Docent maintains a **work journal** that captures artifacts discovered during development:
- **Decisions** - "We chose X because Y"
- **Tasks** - "Need to update section Z"
- **Questions** - "Does this apply to situation W?"
- **Improvements** - "Could enhance feature V"
- **Discoveries** - "Found that component uses old pattern"

**Key principles:**
1. **Capture is frictionless** - Agent command or single docent call
2. **Context is preserved** - What file, what change, what conversation
3. **Surfacing is smart** - Show relevant items when working nearby
4. **Promotion is easy** - Convert capture to RFC, ADR, or issue when ready

### Example: The Current Session

**What we'd capture during this architecture update:**

```markdown
## Work Session: 2025-10-13 MCP Architecture Update

### Decision
**Where:** docs/adr/adr-0004-mcp-only-architecture.md
**What:** Chose MCP-only over dual CLI+MCP interface
**Why:** Agent-driven validation (73/100) proved agents required, CLI was scaffolding
**Impact:** Supersedes ADR-0001, ADR-0002

### Task - Partially Complete
**Where:** docs/architecture/overview.md
**What:** Update from CLI-first to MCP-only architecture
**Status:** In-progress
**Completed:**
- ✅ Executive summary
- ✅ Purpose and users sections
- ✅ Architecture diagram
**Remaining:**
- ⏳ Component 1 (still describes CLI Layer, needs to be MCP Server)
- ⏳ Components 2-7 (need review for CLI references)
- ⏳ Data flow diagrams (reference CLI commands)
- ⏳ Technology stack (mentions oclif - removed)
- ⏳ Scalability section (shows 717 packages, now 272)
- ⏳ ~25 more CLI references throughout
**Context:** Was updating during ADR-0004 creation, scope larger than expected
**Resume hint:** Start at line 129 "Component 1: CLI Layer"

### Task - Discovered
**Where:** docs/specs/
**What:** Four CLI command specs reference non-existent commands
**Files:**
- analyze-command.md
- audit-command.md
- review-command.md
- analyze-command-behavior.md
**Options:**
1. Archive to docs/archive/cli-specs/ (preserve history)
2. Convert to MCP tool behavior specs (reuse scenarios)
**Context:** Discovered during docent audit-quality assessment

### Question
**Where:** Entire docs/ directory
**What:** How many CLI references exist across all documentation?
**Next step:** Run grep search for "docent audit", "docent analyze", etc.
**Why matters:** Need to update all references to reflect MCP-only

### Meta-Discovery
**What:** This exact workflow problem - capturing work without bottomless pit
**Evidence:** "This actually illustrates a point of friction that I want docent to solve"
**Action:** Created RFC-0004 to capture this
```

### Architecture

```
┌─────────────────────────────────────────────────┐
│           Agent / Developer                      │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Capture Commands      │
        │  (via agent or CLI)    │
        │                        │
        │  - docent capture      │
        │  - docent journal      │
        │  - docent surface      │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │   Work Journal         │
        │   (.docent/journal.md) │
        │                        │
        │  - Timestamped entries │
        │  - File context        │
        │  - Conversation link   │
        │  - Status tracking     │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Smart Surfacing       │
        │                        │
        │  - File proximity      │
        │  - Topic relevance     │
        │  - Time-based          │
        │  - Status-based        │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │    Promotions          │
        │                        │
        │  - RFC: big ideas      │
        │  - ADR: decisions      │
        │  - Issue: tasks        │
        │  - Docs: knowledge     │
        └────────────────────────┘
```

### Implementation Details

**1. Capture Interface (MCP Tools)**

```typescript
// New MCP tool: capture-work
{
  name: 'capture-work',
  description: 'Capture work artifact (decision, task, question, discovery)',
  inputSchema: {
    type: {
      enum: ['decision', 'task', 'question', 'improvement', 'discovery']
    },
    content: {
      type: 'string',
      description: 'What to capture'
    },
    context: {
      file?: string,              // File being worked on
      line?: number,              // Line in file
      conversationId?: string,    // Link to agent conversation
      relatedFiles?: string[],    // Related files
    },
    status?: {
      enum: ['pending', 'in-progress', 'blocked', 'completed']
    }
  }
}

// New MCP tool: surface-work
{
  name: 'surface-work',
  description: 'Find relevant work artifacts for current context',
  inputSchema: {
    file?: string,           // Current file
    topic?: string,          // Topic/tag filter
    status?: string[],       // Filter by status
    since?: string           // Time filter
  }
}

// New MCP tool: promote-work
{
  name: 'promote-work',
  description: 'Promote work artifact to formal document',
  inputSchema: {
    id: string,              // Artifact ID
    promoteTo: {
      enum: ['rfc', 'adr', 'issue', 'doc']
    }
  }
}
```

**2. Storage Format**

Store in `.docent/journal.md` (human-readable, agent-parseable):

```markdown
# Work Journal

## 2025-10-13 14:30 - Decision
**ID:** dec-20251013-1430
**Type:** Decision
**Status:** Completed
**File:** docs/adr/adr-0004-mcp-only-architecture.md
**Content:**
Chose MCP-only architecture over dual CLI+MCP.

**Context:**
Agent-driven validation showed 3.5x improvement (73/100 vs 21/100).
CLI was scaffolding to prove the concept - now commit fully.

**Impact:**
- Supersedes ADR-0001, ADR-0002
- Removes 706 packages (72% reduction)

---

## 2025-10-13 14:45 - Task (In-Progress)
**ID:** task-20251013-1445
**Type:** Task
**Status:** In-Progress
**File:** docs/architecture/overview.md
**Line:** 129
**Content:**
Update architecture overview from CLI-first to MCP-only.

**Progress:**
- [x] Executive summary
- [x] Purpose and users
- [x] Architecture diagram
- [ ] Component 1: CLI Layer → MCP Server
- [ ] Components 2-7: Review CLI references
- [ ] Data flow diagrams
- [ ] Technology stack (remove oclif)
- [ ] Scalability (717 → 272 packages)

**Resume Hint:**
Start at line 129 "Component 1: CLI Layer (oclif)"

**Estimated Remaining:** ~30 edits

---

## 2025-10-13 15:00 - Question
**ID:** q-20251013-1500
**Type:** Question
**Status:** Pending
**File:** docs/**
**Content:**
How many CLI references exist across all docs/?

**Next Action:**
grep -r "docent audit" docs/
grep -r "CLI" docs/

**Why Matters:**
Need comprehensive update to reflect MCP-only architecture.

---

## 2025-10-13 15:15 - Discovery (Meta)
**ID:** disc-20251013-1515
**Type:** Discovery
**Status:** Captured
**Content:**
This workflow problem itself - need way to capture work without bottomless pit.

**Evidence:**
"This actually illustrates a point of friction that I want docent to solve."

**Action Taken:**
Created RFC-0004 to design solution.

**Potential Impact:**
Could be docent's killer feature - solve documentation *workflow*, not just templates.
```

**3. Smart Surfacing**

Agent automatically surfaces relevant items:

```typescript
// When agent sees user editing docs/architecture/overview.md
surface_work({file: 'docs/architecture/overview.md'})

// Returns:
{
  "relevant_items": [
    {
      "id": "task-20251013-1445",
      "type": "task",
      "status": "in-progress",
      "summary": "Update architecture overview from CLI-first to MCP-only",
      "file": "docs/architecture/overview.md",
      "line": 129,
      "progress": "4/9 sections complete",
      "resume_hint": "Start at line 129 'Component 1: CLI Layer (oclif)'",
      "context": "Partially completed during ADR-0004 creation"
    }
  ],
  "related_items": [
    {
      "id": "q-20251013-1500",
      "type": "question",
      "summary": "How many CLI references exist across docs/?",
      "relevance": "Same topic: CLI → MCP transition"
    }
  ]
}
```

### User Experience

**Scenario 1: Capture During Work**

Developer (via agent):
> "While updating the architecture, I realized we need to check all CLI references in docs. Can you capture that for later?"

Agent:
```typescript
capture_work({
  type: 'task',
  content: 'Search and update all CLI references in docs/',
  context: {
    file: 'docs/architecture/overview.md',
    conversationId: 'session-xyz'
  },
  status: 'pending'
})
```

Agent responds:
> "Captured as task-20251013-1500. I'll remind you about this when relevant."

**Scenario 2: Surface When Relevant**

*Next day, developer working on docs/guides/mcp-setup.md*

Agent proactively:
> "FYI: You have 1 in-progress task related to this area:
>
> **Task:** Update architecture overview (4/9 sections complete)
> **File:** docs/architecture/overview.md:129
> **Resume hint:** Start at 'Component 1: CLI Layer'
>
> Want to continue that first, or keep working here?"

**Scenario 3: Review Work Journal**

Developer: "What unfinished work do I have?"

Agent calls `surface_work({status: ['pending', 'in-progress']})`

> "You have 3 items:
>
> **In-Progress:**
> - Architecture overview update (4/9 sections)
>
> **Pending:**
> - Convert CLI command specs to MCP tool specs
> - Search all docs for CLI references
>
> Which would you like to tackle?"

**Scenario 4: Promote to RFC**

Developer: "That discovery about work capture - can we make it a formal RFC?"

Agent:
```typescript
promote_work({
  id: 'disc-20251013-1515',
  promoteTo: 'rfc'
})
```

> "Created RFC-0004 from your discovery. Populated with context from work journal. Ready to refine?"

## Trade-offs and Alternatives

### Trade-offs

**Advantages:**
- Captures knowledge that would otherwise be lost
- Preserves context automatically
- Reduces cognitive load (offload to docent)
- Enables safe pause/resume of complex work
- Makes agent more helpful (proactive surfacing)

**Disadvantages:**
- Another file to maintain (.docent/journal.md)
- Requires discipline to capture (though agent can prompt)
- Could accumulate cruft if not pruned
- Need conventions for when to capture vs just do the work

### Alternative 1: Use GitHub Issues

**Description:** Just create issues for discovered work

**Pros:**
- Existing tooling
- Team visibility
- Integration with PRs

**Cons:**
- Context switch to browser/GitHub
- Loses conversational context
- Not integrated with agent workflow
- Too heavyweight for "note to self" items
- Bottomless pit problem persists (stale issues)

**Why not chosen:** Too disruptive, loses context, not agent-native

### Alternative 2: TODO Comments in Code

**Description:** Just add TODO comments in files

**Pros:**
- Standard practice
- No new tools
- Lives with code

**Cons:**
- Scattered across files (hard to track)
- Often forgotten
- No status tracking
- No context preservation
- Only works for code (not decisions/questions)

**Why not chosen:** Doesn't solve the core problems

### Alternative 3: Markdown in Project Root

**Description:** Maintain `WORK.md` or similar manually

**Pros:**
- Simple, no tooling needed
- Human-readable

**Cons:**
- Requires manual maintenance
- No structure enforcement
- No smart surfacing
- Agent can't easily parse/update
- Still prone to bottomless pit

**Why not chosen:** Lacks intelligence and agent integration

## Security Considerations

- **Local only** - Journal stored in `.docent/` (gitignored by default)
- **No secrets** - Capture shouldn't include credentials/keys
- **Privacy** - Conversation IDs are optional, local references only

## Performance Considerations

- **Lightweight** - Markdown file, fast to parse
- **Incremental** - Append-only writes
- **Prune periodically** - Archive completed items after N days
- **Index if needed** - Build index for large journals (future)

## Testing Strategy

**Dogfooding scenarios:**
1. Capture decisions during ADR writing
2. Capture tasks during refactoring
3. Surface items when editing related files
4. Promote discovery to RFC (this very RFC!)

## Migration and Rollout

### Phase 1: Manual Dogfooding
- Manually maintain `.docent/journal.md` during docent development
- Learn what works/doesn't
- Refine format

### Phase 2: MCP Tools
- Implement `capture-work` tool
- Implement `surface-work` tool
- Basic surfacing (file-based proximity)

### Phase 3: Smart Surfacing
- Topic/tag-based surfacing
- Time-based reminders
- Status-based filtering

### Phase 4: Promotions
- Implement `promote-work` tool
- Auto-populate RFC/ADR from captures
- Integration with templates

## Documentation Plan

- Add "Work Journal" section to README
- Create docs/guides/work-journal.md
- Update MCP tool documentation
- Show examples in agent integration guide

## Open Questions

- **Granularity:** What's worth capturing vs just doing?
- **Pruning:** When/how to archive completed items?
- **Privacy:** Should conversation IDs be optional or required?
- **Scope:** Only documentation work, or all development work?
- **Format:** Is markdown sufficient, or need structured data?

## Future Possibilities

Once basic capture/surface works:
- **Team journals** - Shared work context
- **Sync with GitHub** - Bidirectional issue sync
- **Analytics** - "What types of work get forgotten most?"
- **AI summaries** - "Here's what happened this week"
- **Cross-project** - Track work across multiple repos

## References

- Inspired by: This very documentation update session (dogfooding)
- Related: RFC-0003 (workflow orchestration) - could integrate
- Related: ADR-0004 (MCP-only) - could use work capture during transitions
- Pattern: Engineering notebooks, lab journals - capture during work

---

## Meta Note

**This RFC was created in response to the exact problem it proposes to solve.**

During the MCP documentation update, we discovered:
- Partially completed work (architecture overview 4/9 sections)
- Discovered tasks (CLI spec conversion)
- Open questions (how many CLI references?)

Rather than losing this in the "bottomless pit," we're capturing it formally. This RFC itself demonstrates the workflow docent should enable.

**Dogfooding signal:** If this RFC helps us track and complete the documentation update, it validates the approach.
