# PRD-0001: Agent-Orchestrated Workflows for Solo Developer Productivity

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-12
**Updated:** 2025-10-12

## Executive Summary

Transform solo developer productivity by orchestrating AI agents through structured workflows. Enable a single developer to achieve the output and quality of a 5-person team by compressing traditionally week-long processes (research, RFC creation, architecture review) into one-hour workflows. The key innovation: CLI-based orchestration (agent-agnostic) enhanced by MCP integration (rich interactive UX in the user's agent of choice).

## Problem Statement

### User Pain Points

**Solo developers today face a productivity ceiling:**
- Creating an RFC traditionally takes 1-2 weeks (research, writing, review cycles)
- Lack of team means no diverse perspectives on design decisions
- Architecture reviews require external consultants or go undone
- Context switching between research, writing, and implementation fragments focus
- Quality suffers without the structure and processes larger teams have

**Even with AI agents available:**
- Developers must manually orchestrate agent interactions
- No structured process for complex workflows
- Each task requires starting from scratch
- Agent context doesn't accumulate across sessions
- No way to track progress through multi-step processes

### Current State

How developers work today:
1. **Manual research:** Spend days googling, reading docs, comparing options
2. **Solo writing:** Draft RFCs alone, often incomplete or one-sided
3. **No review:** Ship without architecture review or skip RFCs entirely
4. **Ad-hoc agents:** Use AI for isolated tasks but no workflow orchestration
5. **Lost context:** Each interaction with agents starts from zero

**Limitations:**
- Time-intensive: Multi-day processes for decisions that should take hours
- Quality gaps: Missing perspectives and overlooked considerations
- Inconsistent: No repeatable process for complex tasks
- Fragmented: Tools don't work together toward a goal

### Impact

**Consequences of not solving this:**
- **Productivity:** Solo devs move slower than necessary (50-100x slower than potential)
- **Quality:** Decisions made without adequate research or review
- **Burnout:** Context switching and manual orchestration exhausts developers
- **Opportunity cost:** Time spent on process instead of building product
- **Competitive disadvantage:** Solo devs can't compete with well-resourced teams

**Market opportunity:**
- Millions of solo developers and small teams globally
- Growing AI agent ecosystem (Claude Code, Cursor, Aider, etc.)
- Shift toward "AI-first" development workflows
- Need for structured orchestration as agents proliferate

## User Personas

### Persona 1: Solo Founder / Independent Developer

**Who they are:**
- Building product alone or with 1-2 others
- Technical expertise but limited time
- Wear multiple hats (dev, product, ops)
- Need to move fast without sacrificing quality

**Their needs:**
- Make architectural decisions in hours, not days
- Get multiple perspectives without hiring consultants
- Maintain quality documentation without manual overhead
- Leverage AI agents effectively through structured workflows
- Track progress on complex multi-step tasks

**Pain points:**
- "I know I should research options, but I don't have time"
- "I write RFCs but never get them reviewed"
- "I use Claude Code but still spend hours orchestrating agents manually"
- "I forget where I left off in complex research tasks"

### Persona 2: Small Team Technical Lead

**Who they are:**
- Leading team of 2-5 developers
- Responsible for architecture and quality
- Need structured decision-making process
- Want team members to be productive independently

**Their needs:**
- Standardize how the team makes decisions
- Enable team members to do thorough research independently
- Get architecture reviews without hiring external experts
- Track what's been decided and why
- Scale team productivity without adding headcount

**Pain points:**
- "Team members skip research because it's time-consuming"
- "I'm the bottleneck for all architecture reviews"
- "We lack consistent process for RFC creation"
- "New team members don't know our decision-making workflow"

## Product Vision

### What We're Building

**Docent becomes an agent orchestration platform** that guides developers through structured workflows, automatically coordinating multiple AI agents to achieve complex goals.

**Core concept:**
```bash
# Describe problem, get complete RFC in 1 hour
docent workflow rfc "Should we add behavioral specs?"

# Workflow automatically:
# 1. Launches research-analyst (10 min research)
# 2. Presents findings interactively
# 3. Drafts complete RFC (all sections)
# 4. Gets architecture review
# 5. Finalizes based on feedback
```

**Key differentiators:**
1. **Agent-agnostic:** CLI works with ANY agent (Claude Code, Cursor, Aider, shell scripts)
2. **MCP-enhanced:** Rich interactive UX in user's agent of choice when MCP available
3. **Structured workflows:** Multi-agent orchestration with human checkpoints
4. **Resumable:** Save progress, continue later
5. **Time-boxed:** Target 1 hour for RFC, 4 hours for full feature development
6. **Quality-focused:** Built-in research, review, and validation steps

### Why Now

**Perfect timing for this product:**

1. **AI agents everywhere:** Claude Code, Cursor, Aider, Copilot - developers have agent options
2. **MCP emerging standard:** Model Context Protocol enables richer agent integration
3. **Solo dev trend:** More developers building independently (remote work, side projects, startups)
4. **Agent orchestration gap:** Agents exist but no structured workflows to coordinate them
5. **Documentation debt:** Teams recognize documentation matters but lack tools to make it efficient

**Technology enablers:**
- 200K token context windows (agents can hold entire workflows in memory)
- Streaming APIs (real-time progress updates)
- MCP protocol (standardized tool calling)
- Subprocess orchestration (CLI can spawn and monitor agents)

**User readiness:**
- Developers already use AI agents daily
- Frustrated by manual orchestration
- Want structure without complexity
- Willing to adopt new workflows that save time

## Success Metrics

### Primary Metrics

**Time savings (the core value):**
- **RFC creation:** Weeks → 1 hour (50-100x improvement)
  - Current: 1-2 weeks (research + writing + review)
  - Target: <1 hour with workflow orchestration
- **Feature development:** Days → 4 hours (10-20x improvement)
  - Current: 2-5 days (spec + implement + test + document)
  - Target: <4 hours with full-cycle workflow

**Adoption:**
- **Weekly active workflows:** 1000+ workflows executed/week within 6 months of launch
- **Workflow completion rate:** >80% of started workflows reach completion
- **User retention:** 60%+ of users run 2+ workflows per week

### Secondary Metrics

**Quality indicators:**
- Documentation completeness: Average docent audit score >80 for projects using workflows
- Architecture review adoption: 70%+ of RFCs get automated architecture review
- Multi-agent usage: Average 2.5 agents per workflow

**Efficiency:**
- Time to first artifact: <5 minutes (research starts immediately)
- Checkpoint response time: <30 seconds (workflows don't block on user input)
- Context retention: Users resume 40%+ of interrupted workflows

### Success Criteria

**What "done" and "successful" looks like:**
- [x] Solo developer creates complete, reviewed RFC in <1 hour
- [ ] RFC quality matches or exceeds manual multi-week process (validated by blind review)
- [ ] Works with multiple AI agents (Claude Code, Cursor, Aider tested)
- [ ] MCP integration provides superior UX over CLI-only
- [ ] Users report 10x productivity improvement in developer surveys
- [ ] 3+ workflow types validated (RFC, feature, decision)

## Requirements

### Must Have (P0)

**For initial launch, these are non-negotiable:**

1. **CLI Workflow Engine**
   - `docent workflow rfc "Problem"` - RFC creation workflow
   - Interactive checkpoints for key decisions
   - Progress tracking (TodoWrite integration)
   - JSON output for agent consumption
   - Resumable workflows (save/restore state)

2. **Agent Orchestration**
   - Spawn research-analyst as subprocess
   - Stream output to terminal in real-time
   - Capture user input at checkpoints
   - Spawn architecture-reviewer for review phase
   - Handle agent failures gracefully

3. **RFC Workflow Complete**
   - Research phase (10 min automated investigation)
   - Interactive review (present findings, capture decisions)
   - Draft RFC (generate complete document from template)
   - Architecture review (automated critique)
   - Finalization (incorporate feedback)

4. **Agent-Agnostic Architecture**
   - Works from any terminal
   - No coupling to specific agents
   - Structured JSON output
   - Follows ADR-0003 principles

### Should Have (P1)

**Important for great experience:**

1. **MCP Integration (RFC-0001)**
   - Expose workflows as MCP tools
   - Streaming progress updates in chat
   - Rich formatting in agent UI
   - Interactive decision prompts in agent context

2. **Additional Workflows**
   - `docent workflow feature "Feature name"` - Full feature development
   - `docent workflow decide "Decision"` - ADR creation with research
   - `docent workflow debug "Problem"` - Structured debugging workflow

3. **Workflow Management**
   - `docent workflow list` - Show all workflows (active and completed)
   - `docent workflow status <id>` - Check progress
   - `docent workflow resume <id>` - Continue interrupted workflow
   - `docent workflow cancel <id>` - Abort running workflow

4. **Checkpoint Customization**
   - Configure which decisions require human input
   - Auto-mode for decisions with defaults
   - Batch checkpoints to reduce interruptions

5. **Session Recovery (Cold-Start Solution)**
   - `docent session start` - Instant context recovery
   - Analyze recent commits, todos, RFC/PRD status
   - Display: What was completed, what's pending, suggested next steps
   - Project health summary (audit/review scores)
   - 30-second context load vs 15-30 minutes manual

### Nice to Have (P2)

**Future enhancements:**

1. **Advanced Workflows**
   - `docent workflow full-cycle` - Spec → Implement → Test → Review → ADR → Commit
   - `docent workflow refactor` - Safe refactoring with testing validation
   - Custom workflow definitions (user-defined workflows)

2. **Workflow Analytics**
   - Time tracking per phase
   - Success/failure rates
   - Most common checkpoints
   - Optimization suggestions

3. **Team Features**
   - Shared workflow history
   - Collaborative checkpoints (multiple reviewers)
   - Workflow templates per project

4. **AI Enhancements**
   - Learn from past workflow decisions
   - Suggest workflows based on context
   - Pre-fill checkpoints with smart defaults

### Out of Scope

**What we explicitly will NOT do initially:**

1. **Workflow IDE/GUI** - CLI and agent integration only (no standalone UI)
2. **Workflow marketplace** - No sharing workflows publicly (local only)
3. **Integration with project management** - No Jira/Linear/GitHub Projects sync
4. **Code execution** - Workflows orchestrate agents, don't execute code directly
5. **Multi-repo workflows** - Single project only (no cross-repo orchestration)

## User Experience

### Key User Journeys

#### Journey 1: RFC Creation for Solo Developer

**Scenario:** Developer needs to decide whether to add a new feature (behavioral specifications). They want to research options and create a complete RFC in their lunch break.

**Steps:**
1. Developer runs: `docent workflow rfc "Should we add behavioral specs?"`
2. System launches research-analyst, shows progress: "Researching specification formats..."
3. After 10 minutes, system presents findings: "Found 6 formats. Key insight: Gherkin works well for agents"
4. System asks checkpoint question: "Naming: numbered or descriptive?"
5. Developer answers: "descriptive"
6. System drafts complete RFC (all sections, examples, alternatives)
7. System launches architecture-reviewer: "Analyzing RFC for issues..."
8. System presents review: "Consider Phase 2 scope - might be too ambitious"
9. Developer approves finalization
10. Complete: RFC-0002 created, research documented, ready for team review

**Success outcome:** Developer has complete, reviewed RFC in 45 minutes. Quality matches what would take 1-2 weeks manually.

**Agent integration:** If using Claude Code with MCP, entire workflow happens in chat with rich formatting and inline decision prompts.

#### Journey 2: Feature Development with Agent Collaboration

**Scenario:** Developer needs to implement semantic search. They want spec, implementation, tests, and documentation - all coordinated through agents.

**Steps:**
1. Developer runs: `docent workflow feature "semantic search" --full-cycle`
2. System: "Phase 1: Creating behavioral spec..."
3. Interactive: Developer fills in Given/When/Then scenarios
4. System: "Phase 2: Agent implementing from spec..."
5. Progress visible: "Writing detector logic... Writing tests... Running tests..."
6. System hits checkpoint: "3 tests failing - debug or continue?"
7. Developer: "debug"
8. System launches debug workflow: "Analyzing failures... Suggested fixes..."
9. Developer approves fixes
10. System: "Tests passing. Phase 3: Documentation..."
11. System: "Complete! Spec → Implementation → Tests → ADR created"

**Success outcome:** Feature fully implemented, tested, and documented in 4 hours. Solo developer achieved output of small team.

#### Journey 3: MCP-Enhanced Interactive Experience

**Scenario:** Developer using Claude Code with MCP wants rich interactive workflow experience.

**Steps:**
1. Developer in Claude Code chat: "Help me create an RFC for adding specs"
2. Claude: "I'll orchestrate an RFC workflow. Launching research..."
3. Research streams in chat with formatting:
   ```
   📊 Research Phase (2 min elapsed)
   ✅ Analyzed 6 specification formats
   ✅ Reviewed agent-driven development practices
   ✅ Found real-world examples

   Key Findings:
   - Gherkin: Excellent for natural language scenarios
   - AGENTS.md: Simple but doesn't scale
   - Hybrid approach recommended
   ```
4. Claude: "🤔 Decision Point: How should we name specs?"
   - Shows options with pros/cons inline
   - Developer clicks choice in UI
5. Claude: "📝 Drafting RFC... (30 sec)"
   - Progress bar appears
6. Claude: "🔍 Architecture Review..."
   - Streams review findings with severity levels
7. Claude: "✅ Complete! Created:
   - RFC-0002: /docs/rfcs/rfc-0002-add-behavioral-specs.md
   - Research: /docs/research/behavioral-specs-investigation.md
   Next: Review RFC and create ADR if accepted"

**Success outcome:** Developer gets structured workflow with rich UX in their familiar agent environment. CLI benefits + MCP UX enhancement.

#### Journey 4: Cold-Start Session Recovery

**Scenario:** Developer worked on docent for 3 hours yesterday, now returning after a break. They need to quickly remember what was accomplished and what's next, without manually digging through git logs and documentation.

**Steps:**
1. Developer runs: `docent session start`
2. System analyzes recent activity:
   - Reads last 5 commits from git log
   - Parses pending todos from last session
   - Checks RFC/PRD/ADR status (draft vs completed)
   - Runs quick audit/review for project health
3. System displays comprehensive summary:
   ```
   ┌─────────────────────────────────────────────────────
   │ Session Summary - Last: 2025-10-12 (3 hours ago)
   ├─────────────────────────────────────────────────────
   │
   │ ✅ Completed Last Session:
   │  • Research on behavioral specifications
   │  • RFC-0002: Behavioral Specification Support
   │  • PRD-0001: Agent-Orchestrated Workflows
   │  • 3 commits (ebf130e, c6a70fe, 5a6620a)
   │
   │ 📋 Pending Tasks:
   │  • Get architectural review of RFC-0002
   │  • Create ADR on PRD usage
   │  • Fix audit bug (empty docs detection)
   │
   │ 🎯 Suggested Next Steps:
   │  1. Review RFC-0002 or get architecture review
   │  2. Create RFC-0003 for workflow orchestration
   │  3. Implement Phase 1 of RFC-0002
   │
   │ 📊 Project Status:
   │  • Audit: 85% complete
   │  • Health: 100%
   │  • 2 RFCs draft, 1 PRD, 3 ADRs documented
   │
   │ 💡 Context:
   │  Working on: Agent orchestration workflows
   │  for solo developer productivity
   │
   └─────────────────────────────────────────────────────
   ```
4. Developer immediately understands full context
5. Picks up work with zero mental overhead

**Success outcome:** Full project context in 30 seconds instead of 15-30 minutes of manual investigation. Developer starts productive work immediately instead of spending time reconstructing mental state.

**Why this matters:** Solo developers are constantly interrupted (meetings, context switches, breaks). The cold-start problem is a major productivity killer. This feature turns docent's structured documentation into a time machine - instantly recover where you were and what you were thinking.

### User Stories

**As a solo developer:**
- I want to create RFCs in 1 hour instead of 1 week, so that I can make faster architectural decisions
- I want multiple AI agents to collaborate automatically, so that I get diverse perspectives without manual orchestration
- I want to resume interrupted workflows, so that I can spread complex work across multiple sessions
- I want workflows in my agent of choice (Claude Code), so that I don't context switch to terminal
- I want to instantly recover context when returning to a project, so that I don't waste 15-30 minutes reconstructing where I left off

**As a small team lead:**
- I want standardized workflows, so that team members follow consistent processes
- I want visibility into workflow progress, so that I can help when team members are stuck
- I want workflow history, so that I can review past decisions and learn from them

**As an AI agent (Claude Code, Cursor):**
- I want to discover available workflows via MCP, so that I can suggest them to users
- I want structured checkpoint format, so that I can present decisions clearly
- I want to monitor workflow progress, so that I can show status to users
- I want workflow artifacts linked, so that I can reference research when drafting RFCs

## Technical Considerations

### Constraints

**Technical requirements and limitations:**
- Must work without MCP (CLI-first, MCP-enhanced)
- Workflows must be resumable (serialize state to disk)
- Must handle agent failures gracefully (timeout, crash, network issues)
- Must work with any POSIX shell (bash, zsh, fish)
- Subprocess spawning for agent orchestration

### Dependencies

**What needs to exist first:**
- ✅ RFC-0002: Behavioral specifications (workflows will create these)
- ⏳ MCP server (RFC-0001) - Optional enhancement, not blocker
- ✅ Existing CLI commands (analyze, audit, review)
- ✅ Agent communication protocol (.docent-protocol/)

### Integration Points

**How workflows fit with existing systems:**
1. **Docent CLI:** Workflows extend CLI as new command namespace
2. **Templates:** Workflows use existing templates (RFC, ADR, spec)
3. **Audit/Review:** Workflows trigger audit/review automatically
4. **Agent protocol:** Workflows consume/produce JSON per ADR-0003
5. **MCP (future):** Workflows exposed as MCP tools when server available

## Timeline and Milestones

### Phase 1: CLI Workflow Foundation (2-3 weeks)

**Goal:** Prove workflows work via CLI (agent-agnostic)

**Deliverables:**
- Workflow engine implementation (`src/lib/workflow-engine.ts`)
- `docent workflow rfc` command working end-to-end
- Interactive checkpoints with user input
- Progress tracking via TodoWrite
- State serialization (resume capability)
- JSON output for agent consumption
- Dogfooding: Create RFC-0003 using workflow

**Success criteria:**
- Create RFC-0002 in <1 hour using workflow
- Works from any terminal (tested in bash, zsh)
- Handles interruption/resume gracefully

### Phase 2: Additional Workflows (1-2 weeks)

**Goal:** Validate workflow system with more use cases

**Deliverables:**
- `docent workflow feature` - Feature development workflow
- `docent workflow decide` - Decision/ADR workflow
- Workflow management commands (list, status, resume, cancel)
- Documentation and examples
- Dogfooding: Use workflows for docent development

**Success criteria:**
- 3 different workflow types working
- Users report 10x time savings in surveys
- 80%+ workflow completion rate

### Phase 3: MCP Integration (2-3 weeks)

**Goal:** Rich interactive UX in agent environments

**Deliverables:**
- MCP server exposing workflows as tools (builds on RFC-0001)
- Streaming progress updates via MCP
- Interactive checkpoints in agent chat
- Rich formatting and UI elements
- Tested with Claude Code, Cursor

**Success criteria:**
- MCP workflows feel significantly better than CLI
- Works in 2+ agent environments
- Users prefer MCP over CLI when available

### Phase 4: Advanced Features (Ongoing)

**Goal:** Scale and optimize based on usage

**Deliverables:**
- Custom workflow definitions
- Workflow analytics and optimization
- Team collaboration features
- AI-powered checkpoint suggestions

**Success criteria:**
- Users create custom workflows
- Average time savings increases with usage
- Team adoption grows

## Risks and Mitigation

### Risk 1: Agent orchestration complexity

**Likelihood:** High
**Impact:** High

**Description:** Coordinating multiple agents (research-analyst, architecture-reviewer) via subprocesses may be fragile. Agents can timeout, crash, or produce unexpected output.

**Mitigation:**
- Robust error handling with retries
- Timeouts and fallback strategies
- Clear error messages guide user intervention
- Test with intentional failures
- Graceful degradation (continue workflow without failed step)

### Risk 2: MCP adoption slower than expected

**Likelihood:** Medium
**Impact:** Medium

**Description:** MCP is new standard. If agents don't adopt MCP quickly, rich interactive UX may not be available to users.

**Mitigation:**
- ✅ CLI-first architecture (works without MCP)
- MCP is enhancement, not requirement
- Focus on CLI experience quality
- Document how to use workflows with any agent
- If MCP stalls, CLI still provides 90% of value

### Risk 3: Workflow interruption frustration

**Likelihood:** Medium
**Impact:** High

**Description:** If workflows take 1+ hour and don't resume cleanly, users will abandon them when interrupted (phone call, meeting, etc.).

**Mitigation:**
- State serialization from day one
- Auto-save at every checkpoint
- Clear resume instructions
- Test interruption/resume extensively
- Show progress so users know how much is left

### Risk 4: Users want more customization than we provide

**Likelihood:** Medium
**Impact:** Medium

**Description:** Hard-coded workflows may not fit everyone's process. Users may want to customize phases, skip steps, or add their own.

**Mitigation:**
- Start with opinionated workflows (better to have one good way)
- Gather feedback on what users want to customize
- Phase 4 adds custom workflow support
- Document workflow internals so users understand what's happening
- Provide escape hatches (run individual agents manually)

## Open Questions

1. **Checkpoint granularity:** How many checkpoints is too many? Too few? (Test with dogfooding)
2. **Workflow timeout:** Should workflows have max runtime? Or let them run indefinitely? (Suggest: 2 hour default, configurable)
3. **Parallel agents:** Can we run research and architecture review in parallel? Or must they be sequential? (Explore in implementation)
4. **Workflow discovery:** How do users find out workflows exist? AGENTS.md mentions them? CLI help? (Document in multiple places)
5. **Custom agents:** Should users be able to plug in their own agents? Or only use built-in ones? (Defer to Phase 4)

## Related Documentation

**Directly supports this vision:**
- [RFC-0001: MCP Server Integration](/Users/tnez/Code/tnez/docent/docs/rfcs/rfc-0001-mcp-server-for-agent-integration.md) - Technical foundation for MCP workflows
- [RFC-0002: Behavioral Specifications](/Users/tnez/Code/tnez/docent/docs/rfcs/rfc-0002-add-behavioral-specification-support-for-agent-driven-development.md) - Workflows create specs
- [ADR-0003: Agent-Agnostic Architecture](/Users/tnez/Code/tnez/docent/docs/adr/adr-0003-agent-agnostic-architecture.md) - Why CLI-first matters

**Will reference this PRD:**
- RFC-0003: Workflow Orchestration System (to be created)
- Future workflow-related RFCs and ADRs

---

## Vision Statement

**Docent transforms solo developers into high-output teams through agent orchestration.**

The future of development isn't writing code alone. It's orchestrating AI agents through structured workflows that compress weeks of work into hours. Docent provides the platform: CLI for any agent, MCP for rich UX, workflows for complex processes.

**What used to take a team of 5 developers 1 week now takes 1 developer 1 hour.**

This is the platform that makes it possible.
