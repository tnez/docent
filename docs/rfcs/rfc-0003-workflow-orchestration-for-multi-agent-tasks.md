# RFC-0003: Workflow Orchestration for Multi-Agent Tasks

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-13
**Updated:** 2025-10-13
**Related:** PRD-0001, RFC-0002, research/rfc-review-workflow-pain-points.md

## Summary

Add workflow orchestration to docket, enabling automated multi-stage processes that coordinate agent tasks with human decision points. Starting with document review workflows (RFC review, ADR review, spec validation), the system will eliminate 30+ minutes of manual orchestration per workflow by automating context gathering, agent launching, result storage, and status management. Workflows are defined in YAML, executed via CLI commands, and maintain full state for resumption and auditing.

## Motivation

### Problem Statement

**Current Pain: Manual Multi-Agent Orchestration**

During RFC-0002 architectural review, we documented the manual process required:

| Task | Time | Pain |
|------|------|------|
| Context gathering | 15 min | Manual doc identification, uncertain completeness |
| Review prompt construction | 10 min | Domain knowledge required, inconsistent quality |
| Agent launching | 5 min | No progress visibility, poor result handling |
| Status management | 2 min | Easy to forget, inconsistent updates |
| **Total overhead** | **32 min** | **Should be 30 seconds** |

**The core problem:** Every multi-agent workflow requires:
1. Gathering context from multiple sources
2. Launching agents with proper prompts and context
3. Tracking execution status and results
4. Storing outputs for future reference
5. Updating document metadata automatically

**Without orchestration:**
- Developers repeat this manual work every time
- Quality varies based on orchestrator's domain knowledge
- No audit trail of what was reviewed when
- Results lost after agent completes
- Easy to miss steps or forget status updates

**Who is affected:**
- Solo developers running reviews, generating docs, validating designs
- Teams coordinating agent-assisted workflows
- Anyone using docket for agent-driven development

**Consequences of not solving:**
- Time wasted on workflow mechanics instead of content
- Inconsistent process quality across team members
- Lost institutional knowledge (no review records)
- Friction discourages best practices (reviews skipped)
- Docket becomes "templates only" not "workflow platform"

### The Opportunity: PRD-0001 Vision

PRD-0001 describes docket's vision:

> "Transform solo developers into high-output teams through agent orchestration. What used to take a team of 5 developers 1 week now takes 1 developer 1 hour."

**Key workflows to enable:**

1. **RFC Review** (this RFC's focus)
   - Single command: `docket review rfc-0002 --perspective architecture`
   - Automates: context gathering, agent launching, result storage
   - Time: 32 minutes → 30 seconds

2. **Spec-to-Implementation** (RFC-0002 + this RFC)
   - Pipeline: Create spec → Review spec → Implement → Test → Review code → Commit
   - Automates: Each stage with checkpoints
   - Time: 2 days of coordination → 4 hours of focused work

3. **Session Recovery** (PRD-0001 Journey 4)
   - Command: `docket session start`
   - Analyzes: Recent commits, todos, RFC/spec status, project health
   - Time: 15-30 minutes of context reconstruction → 30 seconds

4. **Research-to-RFC** (PRD-0001 Journey 1)
   - Pipeline: Research → Draft RFC → Review → Iterate → Accept
   - Automates: Research coordination, review cycles
   - Time: 1 week → 1 hour

### Goals

1. **Eliminate orchestration overhead:** Automate the mechanics of coordinating multi-agent workflows
2. **Maintain visibility:** Users see progress, logs, and results in real-time
3. **Enable resumption:** Workflows can be paused, inspected, and continued
4. **Preserve results:** All workflow outputs stored for audit and reference
5. **Stay agent-agnostic:** Works with any agent (ADR-0003 principle)
6. **Start with reviews:** RFC/ADR/spec review as first workflow implementation

### Non-Goals

1. **Not a general workflow engine:** Focused on documentation and agent coordination, not CI/CD or deployment pipelines
2. **Not fully automatic:** Workflows can have human decision points
3. **Not replacing Claude Code agents:** Orchestrates existing agents, doesn't replace them
4. **Not interactive wizards:** CLI-first with JSON output for agent consumption

## Detailed Design

### Overview

Workflow orchestration adds three new capabilities to docket:

1. **Workflow Definitions** - YAML files describing multi-stage processes
2. **Workflow Execution** - CLI commands to run, monitor, and resume workflows
3. **Workflow State** - Persistent storage for progress, results, and audit trail

**Architecture Principle:**

Following ADR-0003 (agent-agnostic), workflows are:
- **CLI-orchestrated** - Work with any agent through shell commands
- **JSON-communicative** - Input/output via structured JSON
- **Human-resumable** - Workflows can pause for human decision, then continue
- **State-persistent** - Full execution history maintained

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User / Agent                          │
└───────────────────┬──────────────────────┬──────────────────┘
                    │                      │
         CLI Commands                 JSON Output
                    │                      │
    ┌───────────────▼──────────────────────▼───────────────┐
    │            Workflow Engine (docket)                   │
    │  ┌──────────────────────────────────────────────┐   │
    │  │  Workflow Execution                           │   │
    │  │  - Load definition                            │   │
    │  │  - Execute stages sequentially                │   │
    │  │  - Track state                                │   │
    │  │  - Handle errors/pauses                       │   │
    │  └──────────────────────────────────────────────┘   │
    │  ┌──────────────────────────────────────────────┐   │
    │  │  Context Gatherer                             │   │
    │  │  - Parse document references                  │   │
    │  │  - Find related docs                          │   │
    │  │  - Collect code patterns                      │   │
    │  │  - Build context package                      │   │
    │  └──────────────────────────────────────────────┘   │
    │  ┌──────────────────────────────────────────────┐   │
    │  │  Agent Launcher (via Claude Code)             │   │
    │  │  - Construct prompts from templates           │   │
    │  │  - Launch Task tool with context              │   │
    │  │  - Monitor execution (poll status)            │   │
    │  │  - Collect results                            │   │
    │  └──────────────────────────────────────────────┘   │
    │  ┌──────────────────────────────────────────────┐   │
    │  │  State Manager                                │   │
    │  │  - Persist workflow state                     │   │
    │  │  - Store intermediate results                 │   │
    │  │  - Track stage completion                     │   │
    │  │  - Audit trail                                │   │
    │  └──────────────────────────────────────────────┘   │
    └────────────────────────┬─────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │  Workflow Storage   │
                  │  .docket/workflows/ │
                  │  - Definitions      │
                  │  - State            │
                  │  - Results          │
                  └────────────────────┘
```

**Key Components:**

1. **Workflow Engine** - Executes workflow definitions stage-by-stage
2. **Context Gatherer** - Automatically finds related documents and code
3. **Agent Launcher** - Coordinates with Claude Code's Task tool
4. **State Manager** - Persists execution state and results

### Workflow Definition Format

Workflows are defined in YAML files stored in `.docket/workflows/`:

```yaml
# .docket/workflows/rfc-review.yml
name: RFC Review
description: Architectural review of an RFC document
version: 1

# Input parameters required when starting workflow
inputs:
  - name: rfc_path
    type: file
    description: Path to RFC file
    required: true
  - name: perspective
    type: enum
    values: [architecture, security, implementation, all]
    default: architecture

# Workflow stages execute sequentially
stages:
  # Stage 1: Gather context
  - name: gather-context
    description: Find related documents and code patterns
    type: context
    config:
      strategy: rfc-review
      include:
        - parse_references      # Follow RFC References section
        - related_adrs          # Find ADRs on same topics
        - affected_commands     # Identify impacted CLI commands
        - architecture_docs     # Include system architecture
    outputs:
      context_package:
        path: .docket/workflows/{workflow_id}/context.json
        schema: context-package.schema.json

  # Stage 2: Launch review agent
  - name: review-{perspective}
    description: Conduct architectural review
    type: agent
    depends_on: gather-context
    config:
      agent_type: general-purpose
      prompt_template: templates/review-prompts/rfc-{perspective}.md
      context_from: gather-context.context_package
      timeout: 600  # 10 minutes
    outputs:
      review_results:
        path: .docket/workflows/{workflow_id}/review-results.json
        schema: review-results.schema.json

  # Stage 3: Store results
  - name: store-results
    description: Save review to docs directory
    type: storage
    depends_on: review-{perspective}
    config:
      source: review-{perspective}.review_results
      destination: docs/rfcs/.reviews/{rfc_name}-{date}-{perspective}.md
      format: markdown

  # Stage 4: Update RFC status
  - name: update-status
    description: Update RFC metadata
    type: metadata
    depends_on: store-results
    config:
      file: ${inputs.rfc_path}
      updates:
        - field: Status
          value: In Review
        - field: Reviewed
          value: ${date}
        - add_line: "**Reviewed:** ${date} ({perspective} perspective)"

# Success criteria
completion:
  conditions:
    - all_stages_complete
  outputs:
    - review-{perspective}.review_results
    - store-results.destination
  notifications:
    - type: stdout
      message: "Review complete! {blockers_count} blockers, {major_count} major concerns"
```

**Workflow Definition Schema:**

- **name**: Human-readable workflow name
- **inputs**: Parameters required to start workflow
- **stages**: Sequential steps with dependencies
- **outputs**: What gets produced and where
- **completion**: Success criteria and notifications

### Implementation Details

#### 1. Workflow Execution Model

```typescript
// src/lib/workflow-engine.ts

interface WorkflowState {
  id: string
  workflow: string  // workflow name
  status: 'running' | 'paused' | 'completed' | 'failed'
  currentStage: number
  stages: StageState[]
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  createdAt: string
  updatedAt: string
  completedAt?: string
  error?: string
}

interface StageState {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt?: string
  completedAt?: string
  outputs?: Record<string, unknown>
  error?: string
  agentId?: string  // If stage launched an agent
}

class WorkflowEngine {
  async start(workflowName: string, inputs: Record<string, unknown>): Promise<string> {
    // 1. Load workflow definition
    // 2. Validate inputs
    // 3. Create workflow state
    // 4. Execute first stage
    // 5. Return workflow ID
  }

  async executeStage(workflowId: string, stageIndex: number): Promise<void> {
    // 1. Load workflow state
    // 2. Get stage definition
    // 3. Execute based on stage type:
    //    - context: Run context gatherer
    //    - agent: Launch agent via Claude Code
    //    - storage: Store results to file
    //    - metadata: Update document metadata
    // 4. Save outputs to state
    // 5. Mark stage complete
    // 6. Execute next stage or complete workflow
  }

  async status(workflowId: string): Promise<WorkflowState> {
    // Return current workflow state
  }

  async pause(workflowId: string): Promise<void> {
    // Pause workflow after current stage completes
  }

  async resume(workflowId: string): Promise<void> {
    // Resume paused workflow from next stage
  }

  async logs(workflowId: string, follow: boolean = false): Promise<void> {
    // Stream or dump workflow execution logs
  }
}
```

#### 2. Context Gathering

```typescript
// src/lib/context-gatherer.ts

interface ContextPackage {
  target: string  // Document being reviewed
  related: {
    adrs: string[]
    rfcs: string[]
    architecture: string[]
    code: string[]
  }
  patterns: {
    cliCommands: string[]
    schemas: string[]
  }
  references: string[]  // From document References section
}

class ContextGatherer {
  async gather(strategy: string, target: string): Promise<ContextPackage> {
    switch (strategy) {
      case 'rfc-review':
        return this.gatherForRfcReview(target)
      case 'spec-validation':
        return this.gatherForSpecValidation(target)
      default:
        throw new Error(`Unknown strategy: ${strategy}`)
    }
  }

  private async gatherForRfcReview(rfcPath: string): Promise<ContextPackage> {
    // 1. Parse RFC file
    const rfc = await this.parseMarkdown(rfcPath)

    // 2. Extract explicit references
    const references = this.extractReferences(rfc)

    // 3. Find related ADRs (topic similarity)
    const relatedAdrs = await this.findRelatedADRs(rfc.content)

    // 4. Identify affected CLI commands
    const affectedCommands = await this.findAffectedCommands(rfc.content)

    // 5. Collect architecture docs
    const architectureDocs = await this.getArchitectureDocs()

    // 6. Build context package
    return {
      target: rfcPath,
      related: {
        adrs: relatedAdrs,
        rfcs: references.rfcs,
        architecture: architectureDocs,
        code: affectedCommands,
      },
      patterns: {
        cliCommands: await this.getCommandPatterns(),
        schemas: await this.getSchemas(),
      },
      references: references.all,
    }
  }
}
```

#### 3. Agent Launching

```typescript
// src/lib/agent-launcher.ts

class AgentLauncher {
  async launch(
    agentType: string,
    promptTemplate: string,
    context: ContextPackage,
    timeout: number
  ): Promise<AgentResult> {
    // 1. Load prompt template
    const template = await this.loadTemplate(promptTemplate)

    // 2. Inject context into prompt
    const prompt = this.renderPrompt(template, context)

    // 3. Launch agent via Claude Code Task tool
    //    NOTE: This is conceptual - actual integration TBD
    //    Options:
    //    a) Shell out to claude-code CLI if it exists
    //    b) Use MCP server to launch agents (requires RFC-0001)
    //    c) Output instructions for user to launch agent manually
    const agentId = await this.launchClaudeCodeAgent(agentType, prompt)

    // 4. Poll for completion
    const result = await this.waitForCompletion(agentId, timeout)

    // 5. Return structured results
    return result
  }

  private async launchClaudeCodeAgent(type: string, prompt: string): Promise<string> {
    // Integration point with Claude Code
    // Phase 1: Output instructions to user
    // Phase 2: Use MCP to launch automatically
    throw new Error('Agent launching requires MCP integration (RFC-0001)')
  }
}
```

#### 4. CLI Commands

```bash
# Start a workflow
docket workflow start <workflow-name> [inputs...]

# Examples:
docket workflow start rfc-review --rfc-path docs/rfcs/rfc-0003-... --perspective architecture
docket workflow start spec-to-impl --spec-path docs/specs/analyze-command.spec.md

# Check workflow status
docket workflow status <workflow-id>
# Output: JSON with current stage, progress, outputs

# View workflow logs
docket workflow logs <workflow-id> [--follow]

# Pause workflow (after current stage)
docket workflow pause <workflow-id>

# Resume paused workflow
docket workflow resume <workflow-id>

# List workflows
docket workflow list [--status running|completed|failed]

# Get workflow results
docket workflow results <workflow-id> [--format json|markdown]
```

**CLI Command Structure:**

Add to `src/commands/workflow/`:
- `src/commands/workflow/index.ts` - Base workflow command
- `src/commands/workflow/start.ts` - Start workflow
- `src/commands/workflow/status.ts` - Check status
- `src/commands/workflow/logs.ts` - View logs
- `src/commands/workflow/pause.ts` - Pause execution
- `src/commands/workflow/resume.ts` - Resume execution
- `src/commands/workflow/list.ts` - List workflows
- `src/commands/workflow/results.ts` - Get results

### Storage Structure

```
.docket/
├── workflows/
│   ├── definitions/           # Workflow definitions
│   │   ├── rfc-review.yml
│   │   ├── spec-validation.yml
│   │   └── session-start.yml
│   ├── state/                 # Active workflow state
│   │   ├── wf-abc123/
│   │   │   ├── state.json
│   │   │   ├── context.json
│   │   │   ├── logs.txt
│   │   │   └── results/
│   │   │       ├── stage-1-output.json
│   │   │       └── stage-2-output.json
│   │   └── wf-def456/
│   │       └── ...
│   └── completed/             # Completed workflow records
│       └── 2025-10/
│           ├── wf-abc123.json
│           └── wf-def456.json

docs/
└── rfcs/
    └── .reviews/              # Stored review results
        ├── rfc-0002-2025-10-13-architecture.md
        └── rfc-0003-2025-10-15-implementation.md
```

### User Experience

#### Starting a Workflow

```bash
$ docket workflow start rfc-review --rfc-path docs/rfcs/rfc-0003-... --perspective architecture

⏳ Starting workflow: RFC Review
✅ Workflow started: wf-a1b2c3

Stage 1/4: Gathering context...
  📄 Found 5 related documents
  💻 Found 3 affected commands
  📦 Context package ready
✅ Stage 1 complete (5.2s)

Stage 2/4: Launching architecture review...
  🤖 Agent launched: agent-xyz789
  ⏳ Review in progress...
  📊 Progress: Reading ADR-0003...
```

#### Checking Status

```bash
$ docket workflow status wf-a1b2c3

Workflow: RFC Review (wf-a1b2c3)
Status: Running
Current Stage: 2/4 - review-architecture
Started: 2025-10-13 14:30:15
Elapsed: 3m 45s

Stages:
  ✅ gather-context (5.2s)
  ⏳ review-architecture (3m 40s)
  ⏸  store-results (pending)
  ⏸  update-status (pending)

Agent: agent-xyz789 (running)
Last activity: Reading ADR-0003... (15s ago)
```

#### Getting Results

```bash
$ docket workflow results wf-a1b2c3

Workflow: RFC Review (wf-a1b2c3)
Status: Completed
Duration: 5m 12s

Review Results: docs/rfcs/.reviews/rfc-0003-2025-10-13-architecture.md

Summary:
  Assessment: APPROVE_WITH_CHANGES
  Blockers: 2
  Major Concerns: 4
  Minor Issues: 3

Critical Blockers:
  1. Agent launching mechanism undefined
  2. Workflow state schema incomplete

Next Steps:
  - Review full results: cat docs/rfcs/.reviews/rfc-0003-2025-10-13-architecture.md
  - Address blockers before moving to implementation
```

## Trade-offs and Alternatives

### Trade-offs of Workflow Orchestration

**Advantages:**

1. **Eliminates manual overhead** - 30+ minutes saved per workflow
2. **Ensures consistency** - Same process every time
3. **Audit trail** - Full record of what was reviewed when
4. **Resumable** - Can pause, inspect, continue
5. **Extensible** - New workflows added via YAML definitions
6. **Agent-agnostic** - Works with any agent system

**Disadvantages:**

1. **Added complexity** - New subsystem to maintain
2. **YAML learning curve** - Users must understand workflow definitions
3. **Storage overhead** - Workflow state persisted to disk
4. **Agent integration gap** - Phase 1 can't fully automate agent launching
5. **Not fully automatic** - Still requires human review of results

**Our assessment:** Advantages outweigh disadvantages. The time savings and consistency benefits justify the complexity.

### Alternative 1: Shell Scripts Only

**Description:** Use bash scripts to coordinate multi-agent workflows instead of workflow engine.

**Pros:**
- Simpler implementation
- Familiar to developers
- No new abstractions to learn

**Cons:**
- No state management (can't resume)
- No audit trail
- No structured results
- Not agent-agnostic (shell-specific)
- Harder to maintain and extend

**Why not chosen:** Shell scripts lack the state management, audit trail, and structured results needed for reliable workflows. Docket's CLI-first approach already provides better orchestration primitives.

### Alternative 2: Full Workflow Engine (Temporal, Airflow)

**Description:** Integrate with existing workflow engines like Temporal or Apache Airflow.

**Pros:**
- Battle-tested workflow engine
- Rich features (retries, distributed execution, etc.)
- Mature ecosystem

**Cons:**
- Heavy dependency (separate service required)
- Over-engineered for docket's needs
- Complex setup for users
- Not agent-focused

**Why not chosen:** Overkill for docket's use case. We need simple, local workflow orchestration for documentation tasks, not distributed task execution.

### Alternative 3: Interactive Wizards

**Description:** Guided CLI prompts that walk users through each step.

**Pros:**
- User-friendly for humans
- No YAML configuration needed
- Step-by-step guidance

**Cons:**
- Not agent-consumable (interactive prompts break automation)
- Can't resume or audit
- Doesn't scale to complex workflows
- Violates ADR-0003 (agent-agnostic requires non-interactive)

**Why not chosen:** Contradicts docket's agent-agnostic principle. CLI tools for agents must be non-interactive with JSON output.

### Alternative 4: Extend Existing `docket review`

**Description:** Add workflow features to existing review command instead of new workflow subsystem.

**Pros:**
- No new command namespace
- Simpler for simple use cases
- Less to learn

**Cons:**
- Doesn't generalize to non-review workflows
- State management awkward to add retroactively
- Can't compose multi-stage workflows
- Limits future workflow types

**Why not chosen:** Review is just one workflow type. Session recovery, spec-to-implementation, and research-to-RFC all need orchestration. Better to build general system.

## Security Considerations

Workflow orchestration has minimal new security concerns:

1. **Workflow Definitions**
   - YAML files may contain malicious commands
   - **Mitigation:** Validate workflow definitions before execution, sandboxed execution

2. **Agent Integration**
   - Workflows may launch agents with sensitive context
   - **Mitigation:** Workflows run in user's environment with user permissions, no elevation

3. **State Storage**
   - Workflow state may contain sensitive data
   - **Mitigation:** Stored in `.docket/` (gitignored by default), user file permissions apply

4. **File System Access**
   - Workflows read/write project files
   - **Mitigation:** Workflows run with user's file permissions, no privilege escalation

**Best practices:**
- Don't store secrets in workflow definitions
- Review workflow YAML before running untrusted workflows
- Use `.gitignore` to exclude `.docket/workflows/state/` from version control

## Performance Considerations

Workflow orchestration adds minimal performance overhead:

1. **Workflow Execution**
   - Most time spent waiting for agents (minutes)
   - Orchestration overhead: <1 second per stage
   - Negligible compared to agent execution time

2. **State Persistence**
   - Small JSON files (< 100KB per workflow)
   - Async file I/O doesn't block execution
   - Cleanup: Archive completed workflows after 30 days

3. **Context Gathering**
   - File reads and parsing (typically 5-10 docs)
   - Estimated: 1-5 seconds for typical RFC review
   - Cached if context unchanged

**Estimated workflow overhead:**
- Start workflow: 1-2 seconds
- Per stage transition: 100-500ms
- Status check: <100ms
- Total: <5 seconds for 4-stage workflow

**Time savings:**
- Manual orchestration: 30+ minutes
- Automated orchestration: 30 seconds + agent time
- **Net savings: 29+ minutes per workflow**

## Testing Strategy

### Unit Tests

1. **Workflow Definition Parsing**
   - Valid YAML loaded correctly
   - Invalid YAML caught with clear errors
   - Input validation works

2. **Workflow Engine**
   - Stages execute in order
   - Dependencies respected
   - State transitions correct
   - Error handling works

3. **Context Gatherer**
   - Related docs found correctly
   - References parsed accurately
   - Code patterns identified

4. **State Manager**
   - State persists correctly
   - State loads accurately
   - Cleanup works

### Integration Tests

1. **End-to-End Workflow**
   - Start RFC review workflow
   - Verify context gathering
   - Mock agent execution
   - Check result storage
   - Validate status updates

2. **Resume After Pause**
   - Start workflow
   - Pause mid-execution
   - Resume and complete
   - Verify state integrity

3. **Failure Recovery**
   - Agent fails mid-workflow
   - Workflow marked failed
   - State preserved
   - Can restart from beginning

### Manual Testing (Dogfooding)

1. **RFC Review Workflow**
   - Run on RFC-0003 itself (meta!)
   - Verify context gathering finds right docs
   - Check agent integration works
   - Validate results stored correctly

2. **Multiple Perspectives**
   - Architecture review
   - Security review
   - Implementation review
   - All perspectives in parallel

### Success Criteria

- ✅ RFC review workflow completes successfully
- ✅ Context gathering finds 90%+ relevant docs
- ✅ Agent integration works (manual Phase 1, automated Phase 2)
- ✅ Results stored and accessible
- ✅ Can resume paused workflows
- ✅ Time savings: 30+ minutes → <1 minute

## Migration and Rollout

### Migration Path

No migration needed - this is a new feature. Existing docket functionality unchanged.

**For existing docket users:**
- No breaking changes
- Workflow commands are additive
- Can continue using `docket review`, `docket audit` as before
- Workflows are opt-in enhancement

### Rollout Plan

**Phase 1: Foundation (1 week)**

Goal: Basic workflow engine and RFC review workflow

- Implement workflow definition parsing
- Build workflow engine (start, status, logs)
- Implement context gatherer for RFC reviews
- Create RFC review workflow definition
- **Agent integration:** Manual (user launches agent, pastes prompt)

**Phase 1 Success:** Can run `docket workflow start rfc-review`, which:
1. Gathers context automatically
2. Outputs prompt for user to paste into Claude Code
3. User manually launches agent
4. User manually provides results
5. Workflow stores results and updates status

**Phase 2: Agent Integration (requires RFC-0001 MCP server)**

Goal: Automatic agent launching via MCP

- Implement MCP-based agent launcher
- Update RFC review workflow to use automatic agent launching
- Add progress monitoring (real-time agent status)
- Implement pause/resume functionality

**Phase 2 Success:** Full automation of RFC review workflow (no manual steps)

**Phase 3: Additional Workflows (2-3 weeks)**

Goal: Generalize to other workflow types

- **Agent-driven documentation analysis** (prototype: replace audit/review heuristics with agent reasoning)
  - Current audit/review commands use hard-coded rules (filename matching, thresholds)
  - Agent-driven approach would assess quality through reasoning, not pattern matching
  - Serves as template for converting tool commands to agent workflows
- Spec validation workflow
- Session start workflow (PRD-0001 Journey 4)
- Research-to-RFC workflow
- Workflow templates for custom workflows

**Phase 4: Advanced Features (future)**

- Parallel stage execution
- Conditional stage execution
- Workflow composition (workflows calling workflows)
- Visual workflow status dashboard
- Workflow scheduling

### Backward Compatibility

**No breaking changes:**
- All existing commands work unchanged
- Workflow subsystem is additive
- Existing `docket review` continues to work (workflow is enhancement)

## Documentation Plan

### User-Facing Documentation

1. **README: Workflow Orchestration section**
   - What workflows are and why they exist
   - Quick start: Running RFC review workflow
   - Link to detailed guide

2. **Guide: Workflow Orchestration**
   - Concepts: workflows, stages, state
   - Running workflows (CLI commands)
   - Monitoring progress
   - Understanding results
   - Pausing and resuming
   - Troubleshooting

3. **Guide: Creating Custom Workflows**
   - Workflow YAML format
   - Available stage types
   - Context gathering strategies
   - Prompt templates
   - Testing workflows

4. **Examples:**
   - RFC review workflow (annotated)
   - Spec validation workflow
   - Custom workflow examples

### Internal Documentation

1. **ADR: Workflow Orchestration Architecture**
   - After RFC-0003 accepted
   - Document key design decisions
   - Rationale for YAML format, stage model, state management

2. **Architecture: Update with workflow subsystem**
   - Add workflow engine to system diagram
   - Document interaction with MCP server (RFC-0001)
   - Integration with existing commands

3. **Agent Protocol Guide: Workflow section**
   - How agents interact with workflows
   - JSON schemas for workflow commands
   - Launching workflows from agents

### Template Documentation

1. **Workflow Definition Templates**
   - `rfc-review.yml` with inline comments
   - `spec-validation.yml` example
   - Custom workflow template

2. **Prompt Templates**
   - `templates/review-prompts/rfc-architecture.md`
   - `templates/review-prompts/rfc-security.md`
   - `templates/review-prompts/spec-validation.md`

## Open Questions

1. **Agent Integration in Phase 1:** How should workflows handle agent launching before MCP server exists?
   - Option A: Output prompt for manual agent launching
   - Option B: Block on RFC-0001 completion
   - Option C: Shell out to hypothetical `claude-code` CLI
   - **Recommendation:** Option A for Phase 1 (manual), Option C or MCP for Phase 2

2. **Workflow Definition Location:** Where should users add custom workflows?
   - Option A: `.docket/workflows/definitions/` (project-specific)
   - Option B: `~/.docket/workflows/` (user global)
   - Option C: Both (user global + project override)
   - **Recommendation:** Option C (like git config)

3. **Workflow Versioning:** How to handle workflow definition changes?
   - Keep version field in YAML?
   - Migration strategy for breaking changes?
   - **Recommendation:** Version field required, document breaking changes in migration guide

4. **Parallel Stage Execution:** Should workflows support parallel stages?
   - Example: Run architecture AND security review simultaneously
   - Complexity: Dependency management, result merging
   - **Recommendation:** Not Phase 1, consider Phase 4

5. **Workflow Sharing:** Should workflows be shareable?
   - Commit workflow definitions to git?
   - Community workflow library?
   - **Recommendation:** Yes, built-in workflows in docket, custom workflows in project

6. **Human Decision Points:** How to handle workflows that need human approval mid-execution?
   - Pause automatically when stage requires decision?
   - Add "approval" stage type?
   - **Recommendation:** Phase 4 enhancement, not Phase 1

## Future Possibilities

This RFC focuses on basic workflow orchestration with RFC review as first use case. Future enhancements:

### Phase 4+ Enhancements

1. **Workflow Composition**
   - Workflows can call other workflows
   - Reusable sub-workflows
   - Example: Research workflow calls review workflow

2. **Conditional Execution**
   - Stages execute based on previous results
   - Example: Skip security review if no security changes
   - If/else logic in workflow definitions

3. **Parallel Stages**
   - Multiple stages run simultaneously
   - Example: Architecture + security + implementation reviews in parallel
   - Result aggregation

4. **Scheduled Workflows**
   - Cron-like scheduling
   - Example: Weekly documentation health check
   - Automated reports

5. **Visual Dashboard**
   - Web UI showing workflow status
   - Real-time progress visualization
   - Historical workflow analytics

6. **Workflow Templates**
   - Generator for common workflow patterns
   - `docket workflow new` command
   - Interactive workflow builder

7. **Distributed Execution**
   - Workflows run across multiple machines
   - Useful for long-running research tasks
   - Integration with cloud agents

### Additional Workflow Types

1. **Agent-Driven Quality Analysis** (Phase 3 prototype)
   - Gather project facts (files, structure, context)
   - Launch agent with quality assessment criteria
   - Agent reasons about completeness and quality
   - Generate structured recommendations
   - **Why this matters:** Replaces brittle heuristics with adaptable reasoning
   - **Example:** `docket audit --agent` for documentation quality assessment

2. **Session Recovery** (PRD-0001 Journey 4)
   - Analyze recent work
   - Summarize todos and status
   - Generate context for new session

3. **Spec-to-Implementation**
   - Read spec
   - Generate implementation
   - Run tests
   - Review code
   - Commit if passing

4. **Research-to-RFC**
   - Conduct research
   - Synthesize findings
   - Draft RFC
   - Review and iterate
   - Finalize

5. **Documentation Generation**
   - Analyze codebase
   - Generate API docs
   - Create usage examples
   - Review and publish

## References

### Related Docket Documentation

- [PRD-0001: Agent-Orchestrated Workflows](/Users/tnez/Code/tnez/docket/docs/prds/prd-0001-agent-orchestrated-workflows-for-solo-developer-productivity.md) - Product vision
- [RFC-0001: MCP Server Integration](/Users/tnez/Code/tnez/docket/docs/rfcs/rfc-0001-mcp-server-for-agent-integration.md) - Agent integration (Phase 2 dependency)
- [RFC-0002: Behavioral Specifications](/Users/tnez/Code/tnez/docket/docs/rfcs/rfc-0002-add-behavioral-specification-support-for-agent-driven-development.md) - Spec validation workflow use case
- [Research: RFC Review Workflow Pain Points](/Users/tnez/Code/tnez/docket/docs/research/rfc-review-workflow-pain-points.md) - Motivation and requirements
- [ADR-0003: Agent-Agnostic Architecture](/Users/tnez/Code/tnez/docket/docs/adr/adr-0003-agent-agnostic-architecture.md) - Design principles

### External Resources

- [Temporal Workflows](https://temporal.io/) - Inspiration for workflow state management
- [GitHub Actions](https://github.com/features/actions) - YAML workflow definitions
- [Apache Airflow](https://airflow.apache.org/) - DAG-based workflow orchestration
- [BPMN](https://www.bpmn.org/) - Business process modeling notation

### Community Examples

- [Dagger](https://dagger.io/) - Programmable CI/CD pipelines
- [Prefect](https://www.prefect.io/) - Modern workflow orchestration
- [n8n](https://n8n.io/) - Workflow automation platform
