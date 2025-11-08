# ADR-0005: Agent-Driven Template Classification

**Status:** Accepted
**Date:** 2025-10-29
**Deciders:** solo

---

## Context

The `/docent:tell` tool needed to classify user statements into appropriate documentation templates (ADR, RFC, journal entry, etc.). The initial approach attempted to use the MCP sampling API to perform server-side LLM classification.

However, we discovered that MCP sampling is not yet widely supported in agentic CLIs like Claude Code as of October 2025. This created a constraint: how do we perform semantic classification without server-side LLM access?

Forces at play:

- Need intelligent, semantic classification (not just keyword matching)
- Cannot rely on MCP sampling availability
- Want to avoid external API dependencies
- Need solution that works across all MCP-compatible clients
- Prefer simple architecture over complex infrastructure

---

## Decision

Present classification instructions to the agent in their existing context, leveraging the LLM capabilities already available. The agent receives template metadata (including `use_when` descriptions and examples) and makes semantic classification decisions.

This is an "agent-driven" approach where the MCP tool returns structured instructions for the agent to execute, rather than attempting server-side execution.

---

## Consequences

### Positive

- **Simpler architecture** - No server-side LLM infrastructure needed
- **No API dependencies** - No API keys, quotas, or external service dependencies
- **Universal compatibility** - Works across all MCP clients (Claude Code, Cursor, etc.)
- **Better classification quality** - Full LLM semantic understanding vs pattern matching
- **Transparent to user** - Agent sees classification logic and can override if needed
- **Extensible** - Users can add custom templates with `use_when` guidance

### Negative

- **Relies on agent capability** - Assumes agent will follow classification instructions
- **Token usage** - Classification instructions consume context in each use
- **Not fully automated** - Agent must execute the classification, not just call a function

### Neutral

- **Declarative pattern** - Tool provides instructions rather than executing directly
- **Self-documenting** - Template metadata makes classification criteria explicit

---

## Alternatives Considered

### Alternative 1: MCP Sampling API

**Description:** Use MCP's sampling API to perform server-side LLM calls for classification.

**Pros:**

- Fully automated server-side
- Clean separation of concerns
- Could use specialized prompts

**Cons:**

- Not supported in Claude Code and other major clients yet (Oct 2025)
- Adds infrastructure complexity
- Future feature with uncertain timeline

**Why not chosen:** Not available in target environments. Would work in theory but impractical given current MCP client support.

### Alternative 2: Server-Side LLM API Calls

**Description:** Make direct API calls to OpenAI, Anthropic, or other LLM providers from the MCP server.

**Pros:**

- Full server-side automation
- Could use any LLM provider
- Predictable behavior

**Cons:**

- Requires API keys and configuration
- Adds cost per classification
- Complex dependency management
- Rate limiting concerns
- Requires user credentials management

**Why not chosen:** Adds significant complexity and cost for a problem the agent can already solve.

### Alternative 3: Embeddings + Vector Search

**Description:** Generate embeddings for templates and user statements, find best match via cosine similarity.

**Pros:**

- Fast at runtime
- No LLM call needed per classification
- Deterministic

**Cons:**

- Overkill for 10-15 templates
- Requires embedding model and infrastructure
- Less accurate than full semantic understanding
- Hard to debug misclassifications

**Why not chosen:** Over-engineered solution for small template set. LLM semantic understanding is superior.

### Alternative 4: Regex Pattern Matching

**Description:** Use keyword patterns and regex to classify statements.

**Pros:**

- Simple implementation
- Fast and deterministic
- No dependencies

**Cons:**

- Brittle and unmaintainable
- Poor accuracy on nuanced statements
- "Whack-a-mole" adding patterns
- Doesn't understand intent

**Why not chosen:** Insufficient classification quality. Fails on edge cases and requires constant pattern maintenance.

---

## Implementation Notes

Implementation in `src/mcp/tools/tell.ts`:

1. Load all available templates with metadata
2. Extract `use_when` descriptions and `examples` from frontmatter
3. Format as structured classification instructions
4. Return instructions to agent for execution
5. Agent receives templates, classifies statement, creates file

Template metadata structure:

```yaml
use_when: |
  Use this template when documenting [criteria]
  - Indicator 1
  - Indicator 2

examples:
  - "Example statement 1"
  - "Example statement 2"
```

No migration needed - this was the initial implementation approach.

---

## References

- MCP Sampling Spec: https://modelcontextprotocol.io/specification/2025-06-18/client/sampling
- Implementation: `src/mcp/tools/tell.ts`
- Template metadata: `templates/*.md` frontmatter
- Related: Template classification system (Oct 2025)

---

## Notes

This decision reflects a pragmatic approach: use the capabilities you have (agent's LLM context) rather than building infrastructure for capabilities you don't have (MCP sampling support).

The "agent-driven" pattern may become a useful paradigm for other MCP tools where server-side execution is complex or unavailable.
