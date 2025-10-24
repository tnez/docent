# RFC-0011: DAG-Based Pipeline Planning for Agent Task Orchestration

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-23
**Updated:** 2025-10-23
**Tracking Issue:** TBD

## Summary

Add a DAG-based pipeline planning system to docent that enables agents to plan, track, and visualize complex multi-step work with dependencies, fan-out/fan-in patterns, and data flow between tasks. This provides a more sophisticated alternative to linear task lists for complex work orchestration.

## Motivation

### Problem Statement

Current agent task management uses linear task lists (like Claude Code's TodoWrite). While effective for simple sequential work, these lists fall short for complex scenarios:

- **No dependency tracking**: Can't represent "Task B requires Task A's output"
- **No parallelization**: Can't identify which tasks can run concurrently
- **No data flow**: Can't track outputs from one task feeding into another
- **No fan-out/fan-in**: Can't handle "process N files" → "aggregate N results" patterns
- **Limited visualization**: Hard to understand overall workflow structure

These limitations force agents to mentally track dependencies and make it difficult for users to understand progress on complex multi-branch work.

### Goals

- Enable agents to plan work as a Directed Acyclic Graph (DAG) with explicit dependencies
- Support fan-out (1→N: "for each" pattern) and fan-in (N→1: aggregation pattern)
- Track data flow between nodes using typed outputs (MIME types)
- Provide visual graph rendering in terminal for user comprehension
- Allow multiple concurrent pipelines that integrate with Claude Code's native task lists
- Support incremental, declarative updates (informational state, not imperative execution)
- Minimize agent context usage through flexible querying

### Non-Goals

- **Not an execution engine**: Pipelines are declarative state for agent reference, not executable workflow systems
- **Not replacing Claude Code's TodoWrite**: Complements it for complex scenarios
- **Not a general workflow engine**: Focused on agent planning use cases
- **Not handling external integrations**: Initially focused on local task orchestration

## Detailed Design

### Overview

The system consists of three components:

1. **Pipeline storage**: YAML files containing DAG structure and state
2. **MCP tools**: read-pipeline, write-pipeline, render-pipeline
3. **Visualization**: Terminal-based graph rendering using Unicode box-drawing

Each pipeline has a unique ID and contains nodes with dependencies, status, outputs, and optional fan-out/fan-in configurations.

### Architecture

#### Storage Location

**Option A (Current Pattern):** Parallel to journals

```
docs/
  .journal/          # Existing
  .pipelines/        # New
    abcd-1234.yaml
    efgh-5678.yaml
    README.md        # Tracked, explains what pipelines are
```

**Option B (Consolidation):** Single ephemeral directory

```
docs/
  .agent/            # New consolidated directory
    journals/
    pipelines/
      abcd-1234.yaml
      efgh-5678.yaml
```

**Recommendation:** Start with Option A (matches existing pattern), consider Option B in future refactor.

**Gitignore:**

```gitignore
# Docent pipelines - ephemeral agent task planning state
docs/.pipelines/*.yaml
!docs/.pipelines/README.md
```

#### Pipeline ID Generation

Format: `{adjective}-{noun}-{4-digit-number}` (e.g., `swift-eagle-1234`)

- Human-readable for Claude Code task lists
- Shorter than UUIDs but collision-resistant
- Easy to type and reference

Alternative: Simple sequential IDs or timestamps (open question)

### Data Structures

```typescript
interface Pipeline {
  id: string;                    // Pipeline identifier
  title: string;                 // Human-readable title
  description?: string;          // Optional description
  created: string;               // ISO 8601 timestamp
  updated: string;               // ISO 8601 timestamp
  status: 'active' | 'completed' | 'abandoned';
  nodes: Record<string, PipelineNode>;  // Keyed by node ID
  metadata?: Record<string, any>;       // Extensible
}

interface PipelineNode {
  id: string;                    // Unique within pipeline
  title: string;                 // Display name
  description?: string;          // Optional details
  context?: string;              // Agent's working notes/observations
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'template';
  dependencies: string[];        // Node IDs that must complete first

  // Fan-out: Template for N instances (N determined at runtime)
  fanout?: {
    type: 'for-each';
    sourceNodeId: string;        // Node whose outputs determine N
    template: {
      titlePattern: string;      // e.g., "Process ${output.uri}"
      descriptionPattern?: string;
    };
  };

  // Fan-out instance: Links to source output
  sourceOutput?: {
    nodeId: string;              // Source node ID
    outputIndex: number;         // Which output this processes
  };

  // Fan-in: Aggregates multiple inputs
  fanin?: {
    type: 'aggregate';
    sourceNodeIds: string[];     // All nodes feeding into this
  };

  outputs?: NodeOutput[];        // Data produced by this node
}

interface NodeOutput {
  contentType: string;           // MIME type: text/plain, application/json, image/png
  uri: string;                   // file:///path, https://, s3://
  description?: string;          // Optional label
  size?: number;                 // Optional size in bytes
  metadata?: Record<string, any>; // Extensible
}
```

### MCP Tools

#### 1. `read-pipeline` - Query pipeline state

**Purpose:** Retrieve pipeline data with flexible filtering to minimize context usage.

**Parameters:**

```typescript
{
  pipelineId: string;            // Required: which pipeline to read

  // Filters (all optional)
  nodeIds?: string[];            // Specific nodes
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'template';
  ready?: boolean;               // Only nodes with satisfied dependencies
  search?: string;               // Text search in titles/descriptions

  // Control verbosity
  includeContext?: boolean;      // Include node context (can be large)
  includeOutputs?: boolean;      // Include output details
  summaryOnly?: boolean;         // Just counts and high-level stats
}
```

**Returns:**

```typescript
{
  pipeline: Partial<Pipeline>;   // Filtered based on parameters
  stats?: {                      // If summaryOnly=true
    totalNodes: number;
    byStatus: Record<string, number>;
    readyCount: number;
  };
}
```

**Example usage:**

```typescript
// Get only nodes ready to work on
read-pipeline({
  pipelineId: 'swift-eagle-1234',
  ready: true,
  includeOutputs: false
})

// Get summary stats
read-pipeline({
  pipelineId: 'swift-eagle-1234',
  summaryOnly: true
})
```

#### 2. `write-pipeline` - Create or update pipeline

**Purpose:** Create new pipelines, update node status, add outputs, expand fan-out templates.

**Parameters:**

```typescript
{
  pipelineId: string;            // Required: which pipeline

  // Full pipeline operations
  pipeline?: Pipeline;           // Create new or replace entire pipeline
  pipelineStatus?: 'active' | 'completed' | 'abandoned';

  // Node-level updates
  nodeId?: string;               // Update specific node
  node?: Partial<PipelineNode>;  // Fields to update

  // Fan-out expansion
  expandFanout?: {
    templateNodeId: string;      // Template node to expand
    instances: PipelineNode[];   // Concrete nodes to create
  };

  // Metadata updates
  metadata?: Record<string, any>;
}
```

**Returns:**

```typescript
{
  success: boolean;
  pipeline: Pipeline;            // Updated pipeline
  message?: string;
}
```

**Example usage:**

```typescript
// Create new pipeline
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  pipeline: { /* full pipeline structure */ }
})

// Update node status
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  nodeId: 'analyze-code',
  node: {
    status: 'completed',
    outputs: [{
      contentType: 'application/json',
      uri: 'file:///tmp/analysis.json'
    }]
  }
})

// Expand fan-out template
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  expandFanout: {
    templateNodeId: 'process-file',
    instances: [
      { id: 'process-file-0', sourceOutput: { nodeId: 'list-files', outputIndex: 0 }, ... },
      { id: 'process-file-1', sourceOutput: { nodeId: 'list-files', outputIndex: 1 }, ... },
    ]
  }
})
```

#### 3. `render-pipeline` - Generate visual graph

**Purpose:** Create terminal-friendly visual representation of pipeline DAG.

**Parameters:**

```typescript
{
  pipelineId: string;            // Required: which pipeline to render

  // Terminal dimensions (defaults: 80x24)
  width?: number;                // Hint: Get with `tput cols`
  height?: number;               // Hint: Get with `tput lines`

  // Visualization options
  highlight?: string[];          // Node IDs to emphasize
  focusNodeId?: string;          // Center view on this node
  showLegend?: boolean;          // Include status symbol legend (default: true)
  format?: 'graph' | 'tree';     // Layout style (default: 'graph')
}
```

**Returns:**

```typescript
{
  visual: string;                // Rendered graph as string
  dimensions: {                  // Actual dimensions used
    width: number;
    height: number;
  };
}
```

**Example output:**

```
Pipeline: Process Files [active]

┌──────────────┐
│ list-files   │ ✓
└──────┬───────┘
       │
   ┌───┴───┬──────────┬─────────┐
   │       │          │         │
   ▼       ▼          ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ proc-0 │ │ proc-1 │ │ proc-2 │ ⏸
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    └──────────┴────┬─────┘
                    ▼
              ┌───────────┐
              │ aggregate │ 🚫
              └───────────┘

Legend: ✓ Completed | ⏳ In Progress | ⏸ Pending | 🚫 Blocked
```

**Tool description hints:**

- Mention `tput cols` and `tput lines` for getting terminal dimensions
- Note that dimensions are optional (defaults to 80x24)
- Works with tmux (reads pane dimensions correctly)

### Fan-Out Workflow

1. **Initial DAG** - Template node exists with `status: 'template'`

```yaml
nodes:
  list-files:
    status: pending

  process-file:           # Template
    status: template
    dependencies: [list-files]
    fanout:
      type: for-each
      sourceNodeId: list-files
```

1. **After source completes** - Agent calls `write-pipeline` to expand

```yaml
nodes:
  list-files:
    status: completed
    outputs:
      - {contentType: "text/plain", uri: "file:///a.txt"}
      - {contentType: "text/plain", uri: "file:///b.txt"}
      - {contentType: "text/plain", uri: "file:///c.txt"}

  process-file:           # Template remains
    status: template

  process-file-0:         # Concrete instance
    status: pending
    dependencies: [list-files]
    sourceOutput: {nodeId: list-files, outputIndex: 0}

  process-file-1: ...
  process-file-2: ...
```

1. **Agent queries ready nodes**

```typescript
read-pipeline({ pipelineId: 'xyz', ready: true })
// Returns: process-file-0, process-file-1, process-file-2
```

### Fan-In Workflow

1. **Fan-in node waits for ALL dependencies**

```yaml
nodes:
  aggregate:
    status: pending
    dependencies: [process-file-0, process-file-1, process-file-2]
    fanin:
      type: aggregate
      sourceNodeIds: [process-file-0, process-file-1, process-file-2]
```

1. **Readiness check** - Node only becomes ready when all dependencies are completed

```typescript
// When all process-file-* nodes complete
read-pipeline({ pipelineId: 'xyz', ready: true })
// Returns: aggregate
```

1. **Agent accesses all inputs**

```typescript
// Agent reads outputs from all source nodes
// Fan-in node context can reference: "Processing 3 results from X, Y, Z"
```

### User Experience

#### Integration with Claude Code

Users reference pipelines in Claude Code's native task list:

```markdown
- [ ] Implement authentication refactor
- [ ] Execute docent pipeline swift-eagle-1234
- [ ] Review PR feedback
- [ ] Execute docent pipeline calm-river-5678
```

Agent workflow:

1. Agent sees task: "Execute docent pipeline swift-eagle-1234"
2. Calls `read-pipeline({ pipelineId: 'swift-eagle-1234', ready: true })`
3. Works on ready nodes, updates with `write-pipeline`
4. Periodically calls `render-pipeline` to show user progress
5. Marks Claude Code task complete when pipeline status becomes 'completed'

#### Agent Workflow Example

```
User: "Refactor authentication module across 5 files, then update tests and docs"

Agent:
1. Creates pipeline with DAG structure:
   - analyze-dependencies →
   - [refactor-file-1, refactor-file-2, ...] →
   - aggregate-changes →
   - update-tests →
   - update-docs

2. Renders pipeline for user to see structure

3. Starts working on ready nodes, updating status as it goes

4. When analyze-dependencies completes with list of files,
   expands fan-out template to create refactor-file-* nodes

5. Periodically shows progress visualization

6. Marks pipeline 'completed' when all nodes done
```

### Code Examples

#### Creating a Pipeline

```typescript
// Agent creates pipeline for multi-file refactoring
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  pipeline: {
    id: 'swift-eagle-1234',
    title: 'Refactor Authentication Module',
    created: '2025-10-23T10:00:00Z',
    updated: '2025-10-23T10:00:00Z',
    status: 'active',
    nodes: {
      'analyze': {
        id: 'analyze',
        title: 'Analyze dependencies',
        status: 'pending',
        dependencies: [],
      },
      'refactor-template': {
        id: 'refactor-template',
        title: 'Refactor files',
        status: 'template',
        dependencies: ['analyze'],
        fanout: {
          type: 'for-each',
          sourceNodeId: 'analyze',
          template: {
            titlePattern: 'Refactor ${output.uri}'
          }
        }
      },
      'aggregate': {
        id: 'aggregate',
        title: 'Review changes',
        status: 'pending',
        dependencies: ['refactor-template'],
        fanin: {
          type: 'aggregate',
          sourceNodeIds: ['refactor-template']
        }
      },
      'tests': {
        id: 'tests',
        title: 'Update tests',
        status: 'pending',
        dependencies: ['aggregate'],
      },
      'docs': {
        id: 'docs',
        title: 'Update documentation',
        status: 'pending',
        dependencies: ['aggregate'],
      }
    }
  }
})
```

#### Querying Ready Nodes

```typescript
// Agent asks: "What can I work on now?"
const response = read-pipeline({
  pipelineId: 'swift-eagle-1234',
  ready: true,
  includeContext: true,
  includeOutputs: true
})

// Response: { pipeline: { nodes: { 'analyze': { ... } } } }
```

#### Updating Node Status

```typescript
// Agent completes analysis
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  nodeId: 'analyze',
  node: {
    status: 'completed',
    outputs: [
      { contentType: 'text/plain', uri: 'file:///src/auth/login.ts' },
      { contentType: 'text/plain', uri: 'file:///src/auth/session.ts' },
      { contentType: 'text/plain', uri: 'file:///src/auth/token.ts' },
    ]
  }
})
```

#### Expanding Fan-Out

```typescript
// Agent expands template based on analyze outputs
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  expandFanout: {
    templateNodeId: 'refactor-template',
    instances: [
      {
        id: 'refactor-0',
        title: 'Refactor src/auth/login.ts',
        status: 'pending',
        dependencies: ['analyze'],
        sourceOutput: { nodeId: 'analyze', outputIndex: 0 }
      },
      {
        id: 'refactor-1',
        title: 'Refactor src/auth/session.ts',
        status: 'pending',
        dependencies: ['analyze'],
        sourceOutput: { nodeId: 'analyze', outputIndex: 1 }
      },
      {
        id: 'refactor-2',
        title: 'Refactor src/auth/token.ts',
        status: 'pending',
        dependencies: ['analyze'],
        sourceOutput: { nodeId: 'analyze', outputIndex: 2 }
      }
    ]
  }
})

// Agent also updates aggregate node's dependencies
write-pipeline({
  pipelineId: 'swift-eagle-1234',
  nodeId: 'aggregate',
  node: {
    dependencies: ['refactor-0', 'refactor-1', 'refactor-2']
  }
})
```

#### Visualizing Progress

```typescript
// Agent shows user current state
const visual = render-pipeline({
  pipelineId: 'swift-eagle-1234',
  width: 120,  // from tput cols
  height: 40,  // from tput lines
  highlight: ['refactor-1'],  // Currently working on this
  showLegend: true
})

console.log(visual.visual)
```

## Trade-offs and Alternatives

### Trade-offs

**Advantages of this approach:**

- **Declarative state**: Agent maintains flexible view of work, not locked into execution model
- **Visual clarity**: Graph rendering helps users understand complex workflows
- **Data flow tracking**: MIME-typed outputs provide clear contracts between nodes
- **Flexible querying**: Agent can minimize context by requesting only relevant nodes
- **Multiple pipelines**: Can track several concurrent complex tasks
- **Integration**: Works with Claude Code's native task lists

**Disadvantages of this approach:**

- **Complexity**: More sophisticated than simple task lists
- **Implementation effort**: Graph layout algorithm requires work
- **Learning curve**: Agents need to understand when to use pipelines vs simple todos
- **Storage overhead**: YAML files for each pipeline (mitigated by gitignore)
- **Potential overuse**: Risk of using DAGs for simple linear tasks

### Alternative 1: Enhance TodoWrite with Dependencies

**Description:** Extend Claude Code's existing TodoWrite to support dependencies

**Pros:**

- Builds on existing familiar system
- No new concepts to learn
- Simpler implementation

**Cons:**

- Limited to simple dependency relationships
- No data flow tracking
- No visual graph representation
- Doesn't support fan-out/fan-in patterns
- Still linear mental model

**Why not chosen:** Insufficient for complex multi-branch workflows with data flow

### Alternative 2: External Workflow Engines (Temporal, Airflow)

**Description:** Integrate with external workflow orchestration systems

**Pros:**

- Proven, battle-tested systems
- Rich features (retries, scheduling, monitoring)
- Industry standard

**Cons:**

- Heavy dependencies
- Requires external infrastructure
- Imperative execution model (not declarative state)
- Overkill for agent planning use case
- Complex setup/configuration

**Why not chosen:** Too heavyweight, execution-focused rather than planning-focused

### Alternative 3: Graph Database (Neo4j, etc.)

**Description:** Store pipeline graph in graph database

**Pros:**

- Native graph queries
- Sophisticated traversal algorithms
- Scalable

**Cons:**

- Requires database infrastructure
- Overkill for local file-based tool
- Complex dependency
- Not human-readable

**Why not chosen:** YAML files are sufficient, human-readable, and git-friendly

### Alternative 4: Mermaid-Only (No Custom Rendering)

**Description:** Just generate Mermaid diagrams, let users render elsewhere

**Pros:**

- No complex layout algorithm needed
- High-quality rendering via mermaid tooling
- Can paste into docs/GitHub

**Cons:**

- Not visible in terminal immediately
- Requires external tools (mmdc, browser)
- Poor integration with agent workflow
- No interactive elements (highlighting, focusing)

**Why not chosen:** Terminal rendering provides immediate feedback during agent work

## Security Considerations

- **File paths in outputs**: URIs may reference sensitive file locations
  - Mitigation: Pipelines stored in gitignored directory
  - User responsibility: Don't commit pipeline files

- **Arbitrary code execution**: Pipeline data is declarative, not executable
  - No eval() or code execution from pipeline YAML
  - Agent interprets and acts on data

- **Path traversal**: Output URIs could reference paths outside project
  - Validation: MCP tools should validate URIs before writing
  - No automatic file operations based on URIs

- **Pipeline tampering**: If committed, pipeline files could be modified
  - Mitigation: Gitignored by default
  - User education: Document ephemeral nature

## Performance Considerations

- **Large pipelines**: Hundreds of nodes could impact read performance
  - Mitigation: Flexible querying (read only what's needed)
  - `summaryOnly` option for stats without full data

- **Graph layout algorithm**: Complex graphs may be slow to render
  - Mitigation: Timeout for layout computation
  - Fallback to simpler tree view if layout exceeds time budget
  - Cache rendered graphs (future optimization)

- **Multiple pipelines**: Reading all pipelines could be slow
  - Mitigation: Read one pipeline at a time by ID
  - Future: Index file for quick pipeline listing

- **YAML parsing**: Repeated reads may be inefficient
  - Mitigation: YAML parsing is fast for reasonable file sizes
  - Future: In-memory caching if needed

**Benchmarks:** TBD during implementation

## Testing Strategy

### Unit Tests

- **Data model validation**
  - Node dependency cycles detection
  - Status transition validation
  - Output URI format validation

- **Graph algorithms**
  - Ready node computation (satisfied dependencies)
  - Fan-out expansion logic
  - Fan-in dependency updates
  - Topological sort for rendering

- **YAML serialization**
  - Round-trip (read/write/read)
  - Schema validation
  - Error handling for malformed YAML

### Integration Tests

- **MCP tool interactions**
  - Create pipeline → Read pipeline
  - Update node → Verify changes
  - Expand fan-out → Verify instances created
  - Render pipeline → Verify visual output

- **Multi-step workflows**
  - Complete workflow: create → work → update → complete
  - Fan-out expansion and execution
  - Fan-in waiting and aggregation
  - Multiple concurrent pipelines

### Manual Testing Scenarios

1. **Simple linear pipeline** (3-5 nodes)
   - Create, execute, complete
   - Verify visual rendering

2. **Fan-out/fan-in pipeline** (1→N→1 pattern)
   - Template expansion
   - Parallel node execution
   - Aggregation node waiting

3. **Complex multi-branch** (10+ nodes)
   - Multiple parallel branches
   - Different dependency depths
   - Visual rendering clarity

4. **Terminal rendering**
   - Various terminal sizes (80x24, 120x40, 200x60)
   - Tmux panes
   - Long node titles (text wrapping)

5. **Error conditions**
   - Missing pipeline file
   - Malformed YAML
   - Invalid node references
   - Circular dependencies

## Migration and Rollout

### Migration Path

**No migration needed** - This is a new feature with no existing state.

### Rollout Plan

**Phase 1: Core Implementation**

- Data model and YAML storage
- `read-pipeline` and `write-pipeline` MCP tools
- Basic validation (cycles, references)

**Phase 2: Visualization**

- Graph layout algorithm (Sugiyama-style layered layout)
- Unicode box-drawing rendering
- `render-pipeline` MCP tool
- Terminal dimension awareness

**Phase 3: Documentation and Examples**

- User guide for when to use pipelines
- Agent prompt templates for pipeline creation
- Example pipelines for common patterns
- Integration with Claude Code workflows

**Phase 4: Refinements (Future)**

- Pipeline listing/search
- Archive completed pipelines
- Export to other formats (Mermaid, DOT, JSON)
- Performance optimizations

### Backward Compatibility

**N/A** - New feature, no breaking changes to existing functionality.

## Documentation Plan

### User-Facing Documentation

- **Guide:** "Working with Pipelines" (`docs/guides/pipelines.md`)
  - When to use pipelines vs simple task lists
  - Creating a pipeline
  - Working with fan-out/fan-in
  - Interpreting visualizations

- **Runbook:** "Troubleshooting Pipelines" (`docs/runbooks/pipeline-troubleshooting.md`)
  - Common issues (cycles, broken references)
  - Debugging techniques
  - Fixing malformed pipeline files

### API Documentation

- **MCP Tool Reference:** Update `docs/guides/mcp-api-reference.md`
  - Document all three MCP tools
  - Parameter descriptions
  - Return value schemas
  - Usage examples

### Examples and Tutorials

- **Example Pipelines:** `docs/examples/pipelines/`
  - Simple linear workflow
  - Fan-out/fan-in pattern
  - Complex multi-branch refactoring
  - Test execution pipeline

### README Updates

- **Feature List:** Add "DAG Pipeline Planning" to main README
- **Quick Start:** Example of creating and executing a pipeline

## Open Questions

### 1. Naming

**Question:** What should we call this feature?

**Options:**

- `pipeline` - Suggests data flow, familiar from CI/CD
- `workflow` - More general, familiar from GitHub Actions
- `task-graph` - Explicit about structure
- `work-plan` - Emphasizes planning aspect
- `dag` - Accurate but technical

**Discussion:** "Pipeline" emphasizes data flow between stages. "Workflow" is more general-purpose. Need to decide based on primary mental model.

**Decision:** TBD during review

### 2. Pipeline ID Generation

**Question:** How should pipeline IDs be generated?

**Options:**

- Human-readable: `swift-eagle-1234` (adjective-noun-number)
- UUID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Sequential: `pipeline-0001`, `pipeline-0002`
- Timestamp: `20251023-100000`
- User-provided: Agent asks user for name

**Discussion:** Human-readable IDs are easier to reference in Claude Code task lists. UUIDs are collision-resistant but ugly.

**Decision:** TBD during review

### 3. Multiple Active Pipelines vs Single Pipeline

**Question:** Should we support multiple active pipelines simultaneously?

**Options:**

- **Multiple:** Store as `{id}.yaml`, agent picks which to work on
- **Single:** Store as `current.yaml`, simpler but limiting

**Discussion:** Multiple pipelines enables parallel complex tasks. Claude Code task list can reference specific pipeline IDs.

**Decision:** Multiple pipelines (per RFC draft)

### 4. Graph Layout Algorithm

**Question:** Which algorithm should we use for terminal rendering?

**Options:**

- **Sugiyama (layered):** Standard for DAG visualization, complex
- **Force-directed:** Simpler but less predictable
- **Tree-based:** Simple but only works for tree-shaped graphs
- **Manual/heuristic:** Custom algorithm tuned for terminal rendering

**Discussion:** Sugiyama is standard for DAG layout but complex to implement. May need simplified version for terminal constraints.

**Decision:** TBD during implementation (prototype needed)

### 5. Pipeline Listing Tool

**Question:** Do we need a separate `list-pipelines` tool?

**Options:**

- **Separate tool:** `list-pipelines({ status?: 'active' | ... })`
- **Part of read-pipeline:** `read-pipeline({ pipelineId: '*' })`
- **Not needed:** Agent can read directory listing

**Discussion:** Separate tool is clearer API. Reading directory is simpler but less elegant.

**Decision:** TBD during review

### 6. Fan-In Dependency Updates

**Question:** When expanding fan-out, should we automatically update fan-in dependencies?

**Options:**

- **Automatic:** System updates fan-in node's dependencies when fan-out expands
- **Manual:** Agent responsible for updating fan-in dependencies
- **Hybrid:** System offers suggested update, agent confirms

**Discussion:** Automatic is convenient but may surprise agent. Manual is explicit but error-prone.

**Decision:** TBD during review (leaning toward automatic for simplicity)

### 7. Template Node Lifecycle

**Question:** What happens to template nodes after expansion?

**Options:**

- **Keep with status 'template':** Documentation of pattern
- **Mark as 'expanded':** New status indicating it's done
- **Delete:** Remove after expansion (instances are the record)

**Discussion:** Keeping as 'template' preserves the original plan structure for understanding.

**Decision:** TBD during review (leaning toward keeping as 'template')

## Future Possibilities

This RFC focuses on core pipeline planning, but future work could include:

### Pipeline Templates Library

Pre-built pipeline templates for common patterns:

- Multi-file refactoring
- Test-driven development workflow
- Documentation generation pipeline
- Code review and revision cycle

### Pipeline Composition

Compose pipelines from sub-pipelines:

- Reference another pipeline as a node
- Nest pipelines for modularity
- Reusable workflow components

### Advanced Visualization

- Export to Mermaid, Graphviz DOT, or other formats
- Interactive terminal UI (select nodes, zoom, pan)
- Web-based visualization (if MCP supports browser rendering)
- Animation showing execution flow

### Pipeline Analytics

- Track completion time for nodes
- Identify bottlenecks (nodes that often block progress)
- Suggest optimizations (parallelization opportunities)
- Historical performance data

### Integration with Other Tools

- GitHub Actions workflow generation from pipeline
- Export to project management tools (Linear, Jira)
- Import from CI/CD configs (reverse engineering)

### Conditional Nodes

- Nodes that run conditionally based on previous outputs
- If/else branches in the graph
- Dynamic path selection

### Retry and Error Handling

- Mark nodes as failed (not just blocked)
- Retry policies for nodes
- Fallback paths in the graph

### Resource Constraints

- Mark nodes with resource requirements (memory, time estimates)
- Schedule nodes based on available resources
- Prevent overload (e.g., don't run all N fan-out nodes simultaneously)

## References

### Related Work

- **Claude Code TodoWrite:** Linear task list system that inspired this
- **GitHub Actions:** Workflow YAML syntax and DAG execution
- **Apache Airflow:** Python-based workflow engine with DAG support
- **Temporal:** Durable workflow orchestration
- **Tekton Pipelines:** Kubernetes-native CI/CD pipelines

### Academic References

- **Sugiyama Layout:** Kozo Sugiyama et al., "Methods for Visual Understanding of Hierarchical System Structures" (1981)
- **DAG Visualization:** Survey of graph drawing algorithms for DAGs

### Documentation

- **Mermaid Flowcharts:** https://mermaid.js.org/syntax/flowchart.html
- **Graphviz DOT Language:** https://graphviz.org/doc/info/lang.html

### Discussions

- Initial design discussion: (this conversation)
- RFC review: TBD
- Implementation tracking issue: TBD

---

## Review Notes

This RFC is in **Draft** status and needs review for:

1. **Naming decision:** pipeline vs workflow vs other
2. **Pipeline ID format:** human-readable vs UUID vs sequential
3. **Graph layout algorithm:** Sugiyama vs alternatives
4. **API refinements:** list-pipelines tool, fan-in auto-update
5. **Implementation priorities:** Core features vs nice-to-haves

Please provide feedback on these open questions and any other aspects of the design.
