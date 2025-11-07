# ADR-0001: Declarative Agent-Coordinator Architecture

**Status:** Accepted
**Date:** 2025-10-28
**Deciders:** @tnez

---

## Context

Docent 2.0 needed a clear architectural model for how it interacts with AI agents. The fundamental question was: should docent directly execute operations (imperative model) or should it provide instructions for agents to execute (declarative model)?

Key forces at play:

- Agents are already designed to execute tasks autonomously
- MCP tools should align with agent capabilities and strengths
- The relationship between docent (coordinator) and agents (executors) needed definition
- Complexity and maintainability of having docent execute vs. instruct

Technical factors:

- Agents have access to comprehensive tooling (Bash, Edit, Write, etc.)
- Runbooks and templates can be consumed and interpreted by agents
- Documentation updates require context understanding and decision-making

---

## Decision

Docent will operate as a **declarative coordinator** rather than an imperative executor.

When agents call docent's MCP tools:

- `/docent:act` - Returns runbook instructions; agent executes procedures
- `/docent:tell` - Returns research + edit instructions; agent writes documentation
- `/docent:ask` - Returns gathered context; agent synthesizes answers

Docent's role is to:

1. Prepare context and instructions
2. Load appropriate resources (templates, runbooks)
3. Research what needs to be done and where
4. Format instructions for agent consumption

The agent's role is to:

1. Execute the provided instructions
2. Make actual file changes, run commands, perform operations
3. Possibly delegate to specialized subagents

Example: `/docent:act bootstrap` returns "Here's the bootstrap runbook, please execute these procedures" rather than executing commands directly.

---

## Consequences

### Positive

- Aligns with agent-first architecture - lets agents do what they do best
- Reduces complexity in docent - no need for execution logic
- Agents can use their full tooling capabilities
- More flexible - agents can adapt instructions to specific contexts
- Subagent delegation becomes natural and seamless
- Better separation of concerns: docent = knowledge/coordination, agent = execution

### Negative

- Requires agents to be capable of executing multi-step procedures
- Success depends on agent quality and instruction-following ability
- May need explicit guidance on when to use subagents
- Less deterministic than direct execution

### Neutral

- Instructions need to be clear and well-formatted for agent consumption
- Responses may include tool suggestions to guide agents

---

## Alternatives Considered

### Alternative 1: Imperative Execution Model

**Description:** Docent directly executes commands, makes file changes, and performs operations when tools are called.

**Pros:**

- More deterministic and predictable
- Doesn't depend on agent capabilities
- Direct control over execution

**Cons:**

- Duplicates functionality agents already have
- Increases docent complexity significantly
- Limits flexibility - harder to adapt to different contexts
- Breaks separation of concerns
- Requires docent to implement file I/O, command execution, etc.

**Why not chosen:** Violates agent-first principles and creates unnecessary complexity. Agents are already designed for execution.

---

## Implementation Notes

This decision shaped the implementation of all three core MCP tools:

1. **`/docent:act`** (implemented)
   - Loads runbook from ResourceRegistry
   - Returns formatted markdown with execution instructions
   - Includes "Instructions for Agent" section

2. **`/docent:ask`** (planned)
   - Searches configured documentation paths
   - Returns relevant chunks
   - Agent synthesizes answer from context

3. **`/docent:tell`** (planned)
   - Classifies statement against templates
   - Researches where content should go
   - Returns clear edit/create instructions
   - Agent performs actual writes

Migration considerations:

- No migration needed - this was decided during initial 2.0 architecture
- Establishes pattern for all future MCP tools

---

## References

- Journal entry: `.docent/journals/2025-10-28-session-001.md`
- Related implementation: `src/mcp/tools/act.ts`
- ResourceRegistry: `src/core/resource-registry.ts`

---
