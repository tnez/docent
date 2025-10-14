# RFC Review Workflow Pain Points

**Date:** 2025-10-13
**Context:** Observations from manually reviewing RFC-0002
**Purpose:** Inform design of RFC-0003 (Workflow Orchestration)

## Summary

During the manual review of RFC-0002, we documented every step required to conduct an architectural review. This document captures the pain points, inefficiencies, and manual work that `docent review` and workflow orchestration should automate.

**Key Finding:** What took ~45 minutes of manual orchestration should take 30 seconds with automation.

---

## Pain Points Discovered

### 1. Manual Context Gathering (15 minutes)

**What we did manually:**

- Identified 5+ related documents to provide as context
  - ADR-0003 (agent-agnostic architecture)
  - Architecture overview
  - RFC-0001 (MCP integration)
  - PRD-0001 (product vision)
  - Existing CLI commands (new.ts, audit.ts, review.ts)
- Read each document to understand relevance
- Decided which docs to include in review prompt

**Pain:**

- No automated way to find related docs
- Had to manually remember what exists
- Uncertain if we included everything relevant
- Time-consuming and error-prone

**What `docent review rfc-0002` should do:**

```bash
# Automated context gathering
docent review docs/rfcs/rfc-0002-... --perspective architecture

# Behind the scenes:
# 1. Parse RFC references section
# 2. Find related ADRs (search for architectural topics)
# 3. Identify integration points (what commands are affected?)
# 4. Gather existing code patterns
# 5. Build complete context package
```

**Estimated time saved:** 10-15 minutes → 5 seconds

---

### 2. Review Prompt Construction (10 minutes)

**What we did manually:**

- Wrote detailed prompt specifying:
  - Review objectives
  - Focus areas (6 categories)
  - Required deliverable format
  - Process observations to capture
- Ensured prompt asked for actionable feedback
- Structured output requirements

**Pain:**

- Generic "review this" produces generic feedback
- Need domain knowledge to ask right questions
- Prompt quality determines review quality
- Recreating wheel each time

**What `docent review` should provide:**

- Pre-built review templates for document types:
  - RFC architectural review
  - RFC implementation feasibility review
  - ADR completeness review
  - Spec validation review
- Perspective-specific prompts (architecture, security, performance)
- Consistent output format across reviews

**Example:**

```bash
docent review rfc-0002 --perspective architecture
# Uses: templates/review-prompts/rfc-architecture.md
# Output: Structured review with: assessment, strengths, issues, recommendations
```

**Estimated time saved:** 10 minutes → 0 seconds (pre-built templates)

---

### 3. Agent Launching and Management (5 minutes)

**What we did manually:**

- Launched architecture-reviewer agent
- Discovered it wasn't suited for document review
- Created custom general-purpose agent with RFC-specific prompt
- Waited for completion with no progress visibility
- Couldn't access first agent's results

**Pain:**

- No visibility into agent progress
- No way to check agent status
- Can't see partial results
- Results not automatically returned to orchestrator
- Visibility mismatch (user sees completion, agent doesn't have results)

**What workflow orchestration should provide:**

```bash
# Launch with status tracking
docent workflow start rfc-review --target rfc-0002
# Output: Workflow ID: rfc-review-abc123

# Check progress
docent workflow status rfc-review-abc123
# Output: Stage 2/4 - Architecture Review (3m 15s elapsed)
# Last activity: Reading ADR-0003...

# Stream logs
docent workflow logs rfc-review-abc123 --follow
# Real-time output from agent

# Get results when complete
docent workflow results rfc-review-abc123
# Structured output with findings
```

**Estimated time saved:** 5 minutes → 30 seconds (automated with visibility)

---

### 4. Feedback Processing (10 minutes)

**What we did manually:**

- Read through comprehensive review output
- Categorized issues (critical, major, minor)
- Prioritized which to address
- Decided order of fixes
- Manually edited RFC to address each issue

**Pain:**

- All manual editing
- Easy to miss issues
- No tracking of which issues addressed
- No verification fixes are complete

**What should be automated:**

```bash
# Review produces structured feedback
docent workflow results rfc-review-abc123 --format json
{
  "assessment": "APPROVE_WITH_CHANGES",
  "blockers": [
    {
      "id": "BLOCK-001",
      "title": "CLI command structure inconsistent",
      "section": "CLI Integration",
      "recommendation": "...",
      "status": "open"
    }
  ],
  "major": [...],
  "minor": [...]
}

# Track issue resolution
docent review-issue resolve BLOCK-001
# Marks issue as addressed, updates RFC status
```

**Estimated time saved:** Tracking overhead reduced, but editing still manual

---

### 5. Status Management (2 minutes)

**What we did manually:**

- Updated RFC status from "Draft" to "In Review"
- Added "Reviewed" date
- Added review notes

**Pain:**

- Easy to forget
- Inconsistent metadata updates
- No audit trail of review iterations

**What should be automated:**

```bash
# Automatic status transitions
docent workflow complete rfc-review-abc123

# Behind the scenes:
# - Updates RFC status: Draft → In Review
# - Adds Reviewed date
# - Stores review results reference
# - Updates audit history
```

**Estimated time saved:** 2 minutes → 0 seconds (automatic)

---

### 6. Missing: Result Preservation

**Pain discovered:**

- Review agent output only visible in UI temporarily
- No permanent record of review findings
- Can't reference review later
- Can't track if issues were addressed

**What should exist:**

```bash
# Review workflow stores results
docs/rfcs/rfc-0002-add-behavioral-specification-support.md
docs/rfcs/.reviews/rfc-0002-2025-10-13-architecture.md

# Review file contains:
# - Date and reviewer (agent type)
# - Full findings (blockers, major, minor)
# - Recommendations
# - Resolution status (which issues fixed)
```

---

## Desired Workflow (Ideal State)

### Manual Review Process (Current - 45 min)

```bash
1. Identify related docs (15 min)
2. Craft review prompt (10 min)
3. Launch agent and wait (5 min)
4. Process feedback manually (10 min)
5. Update RFC status (2 min)
6. Edit RFC to address issues (variable)
```

### Automated Review Process (Future - 30 sec + editing)

```bash
# Single command
docent review docs/rfcs/rfc-0002-... --perspective architecture

# Behind the scenes (30 seconds):
# 1. Gather context automatically (5s)
# 2. Use pre-built review template (0s)
# 3. Launch agent with progress tracking (20s)
# 4. Store structured results (1s)
# 5. Update RFC status automatically (1s)
# 6. Present findings to user (3s)

# User focuses on actual work:
# - Reading findings
# - Making decisions
# - Editing RFC content
```

---

## Requirements for RFC-0003 (Workflow Orchestration)

### Core Capabilities Needed

1. **Context Discovery**
   - Automated related document detection
   - Smart reference following
   - Code pattern identification
   - Dependency analysis

2. **Template Library**
   - Review prompt templates by doc type
   - Perspective-specific templates (architecture, security, etc.)
   - Deliverable format specifications
   - Extensible template system

3. **Agent Orchestration**
   - Launch agents with context
   - Track progress and status
   - Stream logs in real-time
   - Return structured results
   - Handle agent failures gracefully

4. **State Management**
   - Workflow status tracking
   - Resume interrupted workflows
   - Store intermediate results
   - Audit trail of workflow execution

5. **Result Storage**
   - Structured review results
   - Link results to documents
   - Track issue resolution
   - Historical review archive

6. **Status Automation**
   - Auto-update document metadata
   - Transition rules enforcement
   - Audit trail maintenance
   - Notification of status changes

### User Experience Goals

**Single command invocation:**

```bash
docent review <document> [--perspective <type>]
```

**Clear progress indication:**

```
⏳ Gathering context... (5 related documents found)
⏳ Launching architecture review...
⏳ Architecture review in progress (2m 15s)...
✅ Review complete! 3 blockers, 5 major concerns, 2 minor issues
```

**Actionable output:**

```
Review Results: docs/rfcs/.reviews/rfc-0002-2025-10-13-architecture.md

Critical Blockers (must fix):
  1. CLI command structure inconsistent
  2. Missing spec template definition
  3. JSON schema additions unclear

Next steps:
  - Fix blockers: docent review-issue resolve BLOCK-001
  - Re-review: docent review rfc-0002 --verify-fixes
```

---

## Time Savings Analysis

| Task | Manual | Automated | Savings |
|------|--------|-----------|---------|
| Context gathering | 15 min | 5 sec | 14m 55s |
| Prompt construction | 10 min | 0 sec | 10m 0s |
| Agent management | 5 min | 30 sec | 4m 30s |
| Status updates | 2 min | 0 sec | 2m 0s |
| **Total** | **32 min** | **35 sec** | **31m 25s** |

*Note: Editing RFC content is inherently manual and not included in timing.*

**ROI:** For a project with 10 RFCs reviewed 2x each: saves ~10 hours

---

## Process Observations from Review Agent

The custom RFC review agent provided valuable meta-commentary on what made review hard:

### What Was Hard About This Review?

1. **CLI Command Pattern Ambiguity** - Took time to understand existing patterns and identify inconsistency
2. **Schema Integration** - High-level description but missing low-level details
3. **Traceability Gaps** - Linking mentioned but not fully designed
4. **Validation Absence** - No discussion of spec quality validation

### What Context Was Helpful?

1. **ADR-0003** - Critical for understanding design philosophy
2. **Existing CLI Commands** - Clarified implementation patterns
3. **PRD-0001** - Understanding bigger vision
4. **Architecture Overview** - Full system context

### What Would Make RFC Reviews Easier?

1. **JSON Schema Diffs** - Before/after schema comparisons
2. **CLI Command Table** - All affected commands in table
3. **Implementation Checklist** - Explicit files to create/modify
4. **Dogfooding Plan** - How authors will validate
5. **Decision Log** - Document ambiguous choices with rationale

**These suggestions should be RFC template enhancements!**

---

## Next Steps

1. **RFC-0003: Workflow Orchestration** - Design system to automate this process
2. **Template Enhancements** - Update RFC template with review suggestions
3. **Agent Library** - Define specialized review agents for different perspectives
4. **Result Schema** - Design structured format for review findings

---

## Conclusion

Manual RFC review revealed significant workflow friction that docent can eliminate. The gap between current manual process (45 min) and ideal automated process (30 sec + editing) represents the opportunity for RFC-0003.

**Key insight:** Users should spend time on decisions and content, not on orchestration and context gathering. That's what tools are for.

**Next RFC:** Use these pain points to design workflow orchestration that makes RFC reviews (and other multi-agent workflows) fast, consistent, and reliable.
