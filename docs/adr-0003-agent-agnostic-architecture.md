# ADR-0003: Agent-Agnostic Architecture with JSON Protocol

**Status:** Accepted
**Date:** 2025-10-11
**Deciders:** @tnez
**Technical Story:** CLI Platform Design (ADR-0001)

## Context

Documentation tasks (analyzing projects, finding gaps, detecting drift) are inherently agentic - they benefit greatly from AI assistance. However, the AI coding agent landscape is rapidly evolving with multiple competing tools:

- **Claude Code** - Anthropic's official CLI
- **Cursor** - Popular AI-powered editor
- **Aider** - Terminal-based AI pair programmer
- **GitHub Copilot Workspace** - GitHub's solution
- **Continue** - VS Code extension
- **Many others** emerging constantly

**Key Forces:**

1. **User Preference Varies** - Different developers prefer different agents based on editor choice, workflow, features, and trust.

2. **Landscape is Unstable** - Agent tools are rapidly evolving. New entrants appear, existing tools pivot, some may shut down.

3. **Lock-in is Fatal** - If docket only works with one agent:
   - Users locked to that agent can't switch
   - Non-users of that agent won't adopt docket
   - If the agent changes/dies, docket becomes worthless
   - Limits total addressable market significantly

4. **Integration Approaches Differ** - Each agent has different integration patterns:
   - Claude Code: Tools/functions, MCP servers
   - Cursor: Command palette, docs
   - Aider: Shell commands, stdin/stdout
   - Copilot: Extensions, APIs

5. **The Common Ground** - All agents can:
   - Execute shell commands
   - Read and parse JSON
   - Access file systems
   - Follow documentation

**The Question:** How do we make docket useful for AI agents without coupling to any specific agent?

## Decision

Build an **agent-agnostic architecture** where docket provides a standardized protocol that ANY agent can use, regardless of implementation.

### Core Principles

1. **CLI as Interface** - All functionality exposed via command-line tools
2. **Structured Output** - Every command supports `--output json` mode
3. **Documented Protocol** - Complete integration guide in `.docket-protocol/`
4. **JSON Schemas** - Typed, validated output for reliable parsing
5. **No Agent-Specific Features** - Zero special cases for specific agents

### Protocol Components

**1. Commands**
- `docket analyze --output json` → Project analysis
- `docket init --non-interactive --output json` → Setup
- `docket audit --output json` → Gap detection
- `docket review --output json` → Health check

**2. JSON Schemas**
- `analysis.schema.json` - Language/framework detection format
- `audit.schema.json` - Documentation gap report format
- `review.schema.json` - Staleness/drift report format
- `init.schema.json` - Initialization result format

**3. Agent Guide**
- `.docket-protocol/agent-guide.md` - Complete integration documentation
- Workflow examples for common tasks
- Best practices for agent developers
- Example code snippets

### Design Rules

**DO:**
- ✅ Provide structured JSON output for machines
- ✅ Provide rich human output for developers
- ✅ Document every field in JSON schemas
- ✅ Keep output stable across versions
- ✅ Support both interactive and non-interactive modes

**DON'T:**
- ❌ Build agent-specific integrations
- ❌ Use agent-specific APIs or protocols
- ❌ Couple to specific agent capabilities
- ❌ Assume specific agent behavior
- ❌ Build features only one agent can use

## Consequences

### Positive

- **Universal Compatibility** - Works with any current or future agent
- **No Lock-in** - Users can switch agents anytime
- **Broader Adoption** - Appeals to all agent users, not just one
- **Future-Proof** - New agents automatically work with docket
- **Clean Interface** - Simple shell commands + JSON
- **Easy Integration** - Any agent that can run commands can use docket
- **Documentation Benefits Humans** - Agent guide helps human users too
- **Network Effects** - Each agent integration benefits all users
- **Decoupled Evolution** - Docket and agents evolve independently

### Negative

- **Can't Use Agent-Specific Features** - No deep integration with any agent
- **Lowest Common Denominator** - Limited to what all agents can do
- **More Agent Work** - Each agent must implement integration themselves
- **No Official Integrations** - Can't claim "Works with X" officially
- **Testing Burden** - Must verify protocol works across many agents
- **Less "Magic"** - No automatic context sharing or deep integrations

### Neutral

- **Requires Documentation** - Protocol guide is essential (but we need it anyway)
- **Version Compatibility** - Must maintain stable JSON schemas
- **Agent Adoption** - Depends on agent developers reading docs
- **Community-Driven** - Integration quality varies by agent

## Alternatives Considered

### Alternative 1: Claude Code Native Integration

**Description:** Build docket as a Claude Code MCP server or native integration.

**Pros:**
- Deep integration with Claude Code
- Rich context sharing
- Native tool calling
- Best possible UX for Claude Code users
- Official partnership potential

**Cons:**
- Only works with Claude Code
- Vendor lock-in
- Smaller market (only Claude Code users)
- Risky if Claude Code pivots
- Alienates other agent users
- Can't leverage other agents' strengths

**Why not chosen:** Complete vendor lock-in. Violates core principle of universal compatibility.

### Alternative 2: Multi-Agent Integration Layer

**Description:** Build explicit integrations for multiple agents (Claude Code, Cursor, Aider).

**Pros:**
- Best-in-class experience for each agent
- Can use agent-specific features
- Official partnerships possible
- Rich per-agent functionality
- Great UX for covered agents

**Cons:**
- Massive maintenance burden
- Must track every agent's API changes
- Can't support all agents
- Huge testing complexity
- Agent-specific bugs and issues
- Perpetual catch-up game

**Why not chosen:** Unsustainable. Would consume all development time just maintaining integrations.

### Alternative 3: Agent SDK/Library

**Description:** Provide a JavaScript/TypeScript library agents can import.

**Pros:**
- Type-safe integration
- Programmatic API
- Can share code between agents
- Version management via npm
- Good developer experience

**Cons:**
- Requires agents use JavaScript/TypeScript
- Excludes non-JS agents
- Library API surface to maintain
- Versioning complexity
- Still needs CLI for humans
- Doesn't help Python/Rust agents

**Why not chosen:** Many agents aren't JavaScript-based. Shell commands are more universal.

### Alternative 4: GraphQL API

**Description:** Run docket as a service with GraphQL API for rich querying.

**Pros:**
- Rich query capabilities
- Type system built-in
- Can fetch exactly what's needed
- Standard protocol
- Good tooling

**Cons:**
- Requires running a service
- Much higher complexity
- Overkill for simple commands
- Deployment concerns
- Authentication needed
- Latency for local operations

**Why not chosen:** Massive complexity increase for no real benefit. Shell commands are simpler.

## Implementation Notes

### JSON Output Format

All commands use consistent patterns:

```json
{
  "field": "value",
  "timestamp": "2025-10-11T19:00:00.000Z"
}
```

### Error Handling

Errors returned as JSON in `--output json` mode:

```json
{
  "error": "already_initialized",
  "details": {"contextPath": ".docket/context.json"}
}
```

### Agent Integration Pattern

```typescript
// Any agent can do this:
const analysis = JSON.parse(
  await exec('docket analyze --output json')
)

const primaryLang = analysis.languages[0]?.name
// Now make intelligent suggestions
```

### Schema Evolution

- Minor changes: Add optional fields (non-breaking)
- Major changes: Bump major version, update schemas
- Deprecated fields: Mark in schema, remove in next major

### Testing Strategy

1. **Schema Validation** - Ensure output matches schemas
2. **Cross-Platform** - Test on macOS, Linux, Windows
3. **Agent Testing** - Manually verify with 2+ agents
4. **Documentation** - Keep agent-guide.md current

## References

- [ADR-0001: CLI Platform Decision](./adr-0001-cli-platform-over-templates-only.md)
- [Agent Guide](../.docket-protocol/agent-guide.md)
- [JSON Schema Specification](https://json-schema.org/)
- [UNIX Philosophy](https://en.wikipedia.org/wiki/Unix_philosophy) - "Do one thing well, compose via interfaces"
- [The Rule of Least Power](https://www.w3.org/2001/tag/doc/leastPower.html) - Use simplest tool that works

---

**This ADR is the philosophical core of docket. Agent-agnostic architecture ensures docket remains useful regardless of which agents succeed in the market. We build once, work everywhere.**
