# Docket Work Journal

*This is a prototype demonstrating RFC-0004's work artifact capture concept.*

---

## 2025-10-13 Session: MCP Architecture Documentation Update

### Decision - Completed ✅
**ID:** dec-20251013-1
**Type:** Decision
**Status:** Completed
**File:** docs/adr/adr-0004-mcp-only-architecture.md
**Created:** 2025-10-13 ~13:00

**What:** Chose MCP-only architecture over maintaining dual CLI+MCP interfaces

**Why:**
- Agent-driven audit prototype proved agents required (73/100 vs 21/100 = 3.5x improvement)
- All target users have agents (solo devs using AI as coding partners)
- CI/CD is not docket's lane (docs aren't build gates)
- CLI was scaffolding to validate approach - now commit fully

**Impact:**
- Supersedes ADR-0001 (CLI Platform), ADR-0002 (Oclif Framework)
- Removes 706 packages (72% reduction: 977 → 272)
- Simpler architecture (one interface vs two)
- Clearer value proposition ("invisible infrastructure")

**Artifacts Created:**
- docs/adr/adr-0004-mcp-only-architecture.md (created)
- docs/adr/adr-0001-cli-platform-over-templates-only.md (updated status)
- docs/adr/adr-0002-oclif-for-cli-framework.md (updated status)

---

### Task - In-Progress ⏳
**ID:** task-20251013-2
**Type:** Task
**Status:** In-Progress (~40% complete)
**File:** docs/architecture/overview.md
**Line:** 129 (resume point)
**Created:** 2025-10-13 ~14:00

**What:** Update architecture overview from CLI-first to MCP-only design

**Progress:**
- ✅ Executive summary (lines 3-19)
- ✅ Purpose section (lines 23-34)
- ✅ Users section (lines 36-48)
- ✅ Dependencies (lines 50-57)
- ✅ Dependents (lines 59-64)
- ✅ Architecture diagram (lines 66-125)
- ⏳ Component 1: Still describes "CLI Layer (oclif)" → needs "MCP Server"
- ⏳ Components 2-7: Need review for CLI references
- ⏳ Data Flow sections: Reference CLI commands
- ⏳ Technology Stack: Mentions oclif (removed)
- ⏳ Scalability: Shows 717 packages (now 272)
- ⏳ ~25 more CLI references scattered throughout

**Estimated Work:** ~30 more edits, ~20 minutes

**Resume Hint:**
Start at line 129: `### Component 1: CLI Layer (oclif)`
This entire component needs rewrite to describe MCP Server instead.

**Context:**
Started during ADR-0004 creation. Scope larger than expected - file is 538 lines.
Made good progress on intro sections, but components section is substantial.

**Blocker:** None, just time-consuming

---

### Task - Pending 📋
**ID:** task-20251013-3
**Type:** Task
**Status:** Pending
**Files:** docs/specs/
**Created:** 2025-10-13 ~15:00

**What:** Handle CLI command spec files (4 files referencing deleted commands)

**Files Affected:**
- docs/specs/analyze-command.md
- docs/specs/audit-command.md
- docs/specs/review-command.md
- docs/specs/analyze-command-behavior.md

**Options:**
1. **Archive** to `docs/archive/cli-specs/` (preserve history)
2. **Convert** to MCP tool behavior specs (reuse scenarios for MCP tools)

**Recommendation:** Option 2 (convert)
- Behavioral scenarios still valuable (what docket should do)
- Just need to update interface from CLI to MCP tool calls
- Preserves work that went into defining behaviors

**Next Steps:**
1. Create docs/specs/mcp-tools/ directory
2. For each spec, convert:
   - CLI command → MCP tool name
   - Command invocations → Tool call examples
   - Preserve all scenarios and acceptance criteria
3. Archive original CLI specs to docs/archive/cli-specs/

**Estimated Work:** ~1 hour

---

### Task - Pending 📋
**ID:** task-20251013-4
**Type:** Task
**Status:** Pending
**Scope:** docs/**
**Created:** 2025-10-13 ~15:15

**What:** Search and update all remaining CLI references across documentation

**Known Locations (from audit):**
16 files contain CLI references (from grep output earlier):
- docs/guides/mcp-setup.md
- docs/rfcs/rfc-0001-mcp-server-for-agent-integration.md
- docs/rfcs/rfc-0003-workflow-orchestration-for-multi-agent-tasks.md
- docs/specs/ (4 files - covered by task-20251013-3)
- docs/research/ (2 files)
- docs/prds/ (1 file)
- docs/adr/ (3 files - some already updated)
- docs/README.md
- docs/architecture/overview.md (covered by task-20251013-2)

**Search Commands:**
```bash
grep -r "docket audit" docs/
grep -r "docket analyze" docs/
grep -r "docket init" docs/
grep -r "docket review" docs/
grep -r "CLI" docs/ | grep -v ".git"
grep -r "command-line" docs/
grep -r "oclif" docs/
```

**Strategy:**
1. Run comprehensive search to find all references
2. Categorize by file type (guides, RFCs, specs, etc.)
3. Update based on context:
   - CLI commands → MCP tool names
   - Shell examples → Agent conversation examples
   - "Run docket X" → "Ask agent to analyze..."
4. Verify no broken links

**Estimated Work:** ~45 minutes

---

### Discovery - Captured 💡
**ID:** disc-20251013-5
**Type:** Discovery (Meta)
**Status:** Captured → RFC Created
**Created:** 2025-10-13 ~15:30

**What:** Discovered the exact workflow problem docket should solve

**Evidence:**
User quote: "This actually illustrates a point of friction that I want docket to solve. While working, we often identify large chunks of tasks, or things that we want to remember for later... docket should be able to take the things that it has discovered, and 'stash' them somewhere for later, but have a mechanism so those things do not get thrown into a 'bottomless pit' where they are 'never to be seen again'."

**Context:**
Experienced in real-time during documentation update:
- Started with 4 clear todos
- Discovered scope explosion (30+ edits needed)
- No good way to safely pause/resume with full context
- Risk of work vanishing into "bottomless pit"

**Impact:**
This could be docket's killer feature - solving documentation *workflow*, not just templates or assessment.

**Action Taken:**
Created RFC-0004: Work Artifact Capture and Surfacing
- Proposes work journal (.docket/journal.md)
- MCP tools: capture-work, surface-work, promote-work
- Smart surfacing based on context
- Promotion to formal docs (RFC, ADR, etc.)

**Next Steps:**
1. Dogfood this journal format during remaining doc updates
2. Refine based on what works/doesn't
3. Build MCP tools for capture/surface if validated

**This file is the prototype!**

---

### Question - Open ❓
**ID:** q-20251013-6
**Type:** Question
**Status:** Open
**Created:** 2025-10-13 ~15:45

**Question:** Should we finish architecture overview completely before moving to other tasks, or switch to specs/references and circle back?

**Context:**
Architecture overview is large (538 lines), partially updated (40%).
Remaining work is tedious but not complex (~30 edits).

**Options:**
A. **Finish now** (~20 min) - Complete one thing fully
B. **Switch tasks** - Tackle specs conversion, return later

**Trade-offs:**
- Option A: Maintains flow, completes one doc fully, but tedious
- Option B: Variety, spreads progress, but context switch

**User preference needed**

---

### Task - Completed ✅
**ID:** task-20251013-2
**Type:** Task
**Status:** Completed
**File:** docs/architecture/overview.md
**Completed:** 2025-10-13 ~16:30

**What:** Updated architecture overview from CLI-first to MCP-only design

**Final State:** 100% complete (was 40%)
- ✅ Executive summary
- ✅ Purpose section
- ✅ Users section
- ✅ Dependencies and dependents
- ✅ Architecture diagram
- ✅ Component 1: MCP Server (replaced CLI Layer)
- ✅ Component 2: Detector (updated interactions)
- ✅ Component 3: Agent-Audit (replaced Installer)
- ✅ Component 4: Auditor (updated, noted 21/100 baseline)
- ✅ Component 5: Templates (updated, noted agent prompts)
- ✅ Removed duplicate Components 6-7
- ✅ Data Flow: MCP-based workflows
- ✅ Technology Stack: MCP SDK, removed oclif
- ✅ Scalability: 272 packages (was 977)
- ✅ Performance: MCP persistent process
- ✅ Deployment: MCP configuration
- ✅ Decision Log: Added ADR-0004
- ✅ References: RFC-0001, RFC-0004
- ✅ Glossary: MCP terms

**Time taken:** ~1 hour (was estimated 20 min, actual scope larger)

---

## Session Statistics (Final)

**Time:** ~3.5 hours total
**Completed:** 5 major tasks
**Pending:** 2 tasks (specs conversion, CLI reference search)
**Tokens remaining:** 47K (24% of budget)

**What Got Done:**
1. ✅ ADR-0004: MCP-only architecture decision (3.1K lines)
2. ✅ ADR-0001/0002: Updated to superseded status
3. ✅ RFC-0004: Work capture and surfacing (5.3K lines)
4. ✅ `.docket/journal.md`: This file - work journal prototype
5. ✅ Architecture overview: Complete MCP-only rewrite (532 lines)

**Git Status:**
```
Modified files (5):
- docs/adr/adr-0001-cli-platform-over-templates-only.md
- docs/adr/adr-0002-oclif-for-cli-framework.md
- docs/architecture/overview.md

New files (3):
- docs/adr/adr-0004-mcp-only-architecture.md
- docs/rfcs/rfc-0004-work-artifact-capture-and-surfacing.md
- .docket/journal.md
```

**Commit Strategy:**
Suggest 2 logical commits:
1. **feat: add ADR-0004 and RFC-0004**
   - docs/adr/adr-0004-mcp-only-architecture.md (new)
   - docs/rfcs/rfc-0004-work-artifact-capture-and-surfacing.md (new)
   - .docket/journal.md (new, demonstrates RFC-0004)

2. **docs: update architecture for MCP-only design**
   - docs/adr/adr-0001-cli-platform-over-templates-only.md (superseded)
   - docs/adr/adr-0002-oclif-for-cli-framework.md (superseded)
   - docs/architecture/overview.md (complete rewrite)

---

## Resume Context for Next Session

**Remaining Work (from original plan):**

### Task 6: Convert CLI Command Specs ⏳
**Files:** docs/specs/ (4 files)
- analyze-command.md (11KB)
- audit-command.md (16KB)
- review-command.md (17KB)
- analyze-command-behavior.md (1KB)

**Options:**
1. **Archive** to docs/archive/cli-specs/ (preserve history)
2. **Convert** to MCP tool specs (reuse behavioral scenarios)

**Recommendation:** Convert (Option 2)
- Scenarios are valuable (what docket should do)
- Just update interface: CLI → MCP tools
- Preserves behavioral documentation work

**Steps:**
1. Create docs/specs/mcp-tools/ directory
2. For each spec:
   - Rename to match tool (analyze-tool.md, audit-quality-tool.md, etc.)
   - Update "CLI command" → "MCP tool"
   - Update invocations: `docket audit` → `mcp.call('audit-quality')`
   - Keep all scenarios and acceptance criteria
3. Archive originals to docs/archive/cli-specs/

**Estimated:** 45-60 minutes

### Task 7: Update Remaining CLI References ⏳
**Scope:** docs/** (16 files had references)

**Search commands to run:**
```bash
grep -r "docket audit" docs/
grep -r "docket analyze" docs/
grep -r "CLI" docs/
grep -r "oclif" docs/
```

**Known locations:**
- docs/guides/mcp-setup.md (may have CLI examples)
- docs/rfcs/rfc-0001-mcp-server-for-agent-integration.md (intentional CLI/MCP comparison)
- docs/rfcs/rfc-0003-workflow-orchestration-for-multi-agent-tasks.md (may reference CLI)
- docs/research/ (2 files)
- docs/prds/ (1 file)
- docs/README.md (may have CLI references)

**Strategy:**
1. Run comprehensive grep search
2. Categorize by update need (some references may be historical/intentional)
3. Update forward-looking references
4. Leave historical comparisons intact

**Estimated:** 30-45 minutes

---

## How This Journal Saved Us

**The Problem We Solved:**
At 16:00, we hit "low context" warning with:
- 5 completed tasks
- 2 pending tasks
- 8 modified/new files
- No clear commit strategy
- Risk of "bottomless pit" (losing track of remaining work)

**The Solution (RFC-0004 in action):**
This journal provides:
1. ✅ Complete record of what was accomplished
2. ✅ Clear resume points for pending work
3. ✅ Commit strategy with logical grouping
4. ✅ Time estimates for planning next session
5. ✅ Git status and file locations
6. ✅ No work lost or forgotten

**Next session starts with:**
- Read this journal
- Run git status to verify state
- Execute commit strategy
- Resume Task 6 or 7 as needed

**This validates RFC-0004's thesis:** Work capture prevents the bottomless pit.

---

*Session ended: 2025-10-13 ~16:45*
*Resume: Read this journal, commit changes, continue with Task 6/7*
*Context window: 47K tokens remaining (saved for next session)*
