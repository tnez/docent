# Docent Documentation

Welcome to the docent documentation! This is docent documenting itself - a real-world example of the documentation platform in action.

## Quick Navigation

### 📐 Architecture

- [Architecture Overview](./architecture/overview.md) - Complete system design, components, and data flows

### 📋 Architecture Decision Records

- [ADR-0001: CLI Platform Over Templates-Only](./adr/adr-0001-cli-platform-over-templates-only.md) - Core transformation decision *(superseded)*
- [ADR-0002: Use Oclif for CLI Framework](./adr/adr-0002-oclif-for-cli-framework.md) - Technical framework choice *(superseded)*
- [ADR-0003: Agent-Agnostic Architecture](./adr/adr-0003-agent-agnostic-architecture.md) - Integration philosophy
- [ADR-0004: MCP-Only Architecture](./adr/adr-0004-mcp-only-architecture.md) - Current architecture decision

### 💡 RFCs

- [RFC-0001: MCP Server for Agent Integration](./rfcs/rfc-0001-mcp-server-for-agent-integration.md)
- [RFC-0002: Behavioral Specification Support](./rfcs/rfc-0002-add-behavioral-specification-support-for-agent-driven-development.md)
- [RFC-0003: Workflow Orchestration](./rfcs/rfc-0003-workflow-orchestration-for-multi-agent-tasks.md)
- [RFC-0004: Work Artifact Capture](./rfcs/rfc-0004-work-artifact-capture-and-surfacing.md)

### 📚 Guides

- [MCP Setup Guide](./guides/mcp-setup.md) - How to integrate docent MCP server with AI agents
- [Contributing](../CONTRIBUTING.md) - How to contribute to docent (see repo root)

### 🔧 Runbooks

No runbooks yet. Docent is developer tooling with no operational procedures needed at this time.

## About Docent

**Primary Language:** TypeScript
**Primary Framework:** MCP SDK (Model Context Protocol)
**Testing Framework:** Mocha
**Package Manager:** npm

Docent is documentation intelligence for AI agents. It provides MCP tools for project analysis, documentation quality assessment, and template generation. See [Architecture Overview](./architecture/overview.md) for complete details.

## Using Docent

Docent integrates with AI agents through MCP (Model Context Protocol):

```typescript
// Ask your AI agent to:
"Analyze this project using docent's analyze tool"
"Assess documentation quality using audit"
"Generate a new ADR using the adr template"
```

See [MCP Setup Guide](./guides/mcp-setup.md) for configuration instructions.

## Available MCP Tools

- **analyze** - Project structure and technology stack analysis
- **audit** - Agent-driven documentation quality assessment
- **audit** - Fast heuristic documentation audit
- **list-templates** - List available documentation templates
- **get-template** - Retrieve a template by type

## Documentation Philosophy

Docent uses itself to document itself. This serves multiple purposes:

1. **Validation** - If docent can't document docent, it's not ready
2. **Demonstration** - Real-world example for users
3. **Dogfooding** - We experience our own product
4. **Quality** - Forces us to make the product actually useful

See [ADR-0004](./adr/adr-0004-mcp-only-architecture.md) for the architectural evolution story.

---

*This documentation was initialized and maintained using docent itself.*
