---
name: agent-session
description: Track LLM agent work session for context recovery and handoff
type: single-file
author: docent
version: 1.0.0
tags: [agent, session, ai, tracking, collaboration]
directory: sessions
filename_prefix: session

use_when: |
  Use this template when documenting work completed in a bounded session:
  - Debugging, troubleshooting, or investigation work
  - Feature implementation with specific outcomes
  - Bug fixes with clear resolution
  - Contains action verbs (fixed, implemented, debugged, resolved, investigated)
  - References specific commits, PRs, or dates
  - Describes objective → work done → results flow
  - Session-based work that took place over a specific time period

examples:
  - "Fixed CI/CD failures by updating import paths and test expectations"
  - "Investigated authentication bug - root cause was expired JWT tokens"
  - "Implemented user profile feature, all tests passing, committed as abc123"
  - "Debugged memory leak in background worker - reduced memory usage by 40%"

variables:
  - name: timestamp
    description: Session start timestamp
    type: string
    default: "{{now}}"
  - name: session_id
    description: Unique session identifier (optional)
    type: string
    required: false
---
# Agent Session - {{timestamp}}

{{#if session_id}}
**Session ID:** {{session_id}}
{{/if}}

## Session Info

- **Started:** {{timestamp}}
- **Model:** _[Optional: specify if known]_
- **Context:** _[Optional: tokens used / budget if available]_

---

## Goals

> What we set out to accomplish this session

- Goal 1
- Goal 2

---

## Work Completed

> What was actually done

- Task 1 completed
- Feature implemented
- Bug fixed

---

## Key Decisions

> Important choices made and the reasoning behind them

**Decision:** [Brief title]

- **Why:** Rationale for this choice
- **Alternatives considered:** What else we looked at
- **Impact:** What this affects

---

## Files Changed

### Created

- `path/to/new/file.ts`

### Modified

- `path/to/existing/file.ts` - Description of changes

### Deleted

- `path/to/removed/file.ts`

---

## Challenges & Resolutions

> Problems encountered and how they were solved

**Challenge:** [Description]

- **Attempted:** What we tried first
- **Solution:** What actually worked
- **Learning:** What we learned

---

## Discoveries

> Important learnings, insights, or patterns identified

- Discovery 1: [Insight and why it matters]
- Discovery 2: [Pattern observed]

---

## Context for Next Session

> Critical information for session recovery and handoff

### Current State

- Where we are now
- What's working

### What Needs Attention

- Incomplete work
- Known issues
- Technical debt introduced

### Open Questions

- Question 1?
- Question 2?

### Next Steps (Prioritized)

1. First thing to tackle
2. Second priority
3. Third priority

---

## References

> Links to related docs, issues, PRs, discussions

- [Related RFC](link)
- [Issue #123](link)
- [Documentation](link)
