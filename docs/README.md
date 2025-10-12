# Docket Documentation

Welcome to the docket documentation! This is docket documenting itself - a real-world example of the documentation platform in action.

## Quick Navigation

### 📐 Architecture
- [Architecture Overview](./architecture/overview.md) - Complete system design, components, and data flows

### 📋 Architecture Decision Records
- [ADR-0001: CLI Platform Over Templates-Only](./adr/adr-0001-cli-platform-over-templates-only.md) - Core transformation decision
- [ADR-0002: Use Oclif for CLI Framework](./adr/adr-0002-oclif-for-cli-framework.md) - Technical framework choice
- [ADR-0003: Agent-Agnostic Architecture](./adr/adr-0003-agent-agnostic-architecture.md) - Integration philosophy

### 💡 RFCs
No RFCs yet. Create one with:
```bash
docket new rfc "Your Feature Proposal"
```

### 📚 Guides
- [Contributing](../CONTRIBUTING.md) - How to contribute to docket (see repo root)
- [Agent Integration Guide](../.docket-protocol/agent-guide.md) - Complete guide for AI agent developers

### 🔧 Runbooks
No runbooks yet. Docket is a CLI tool with no operational procedures needed at this time.

## About Docket

**Primary Language:** TypeScript
**Primary Framework:** oclif (CLI framework)
**Testing Framework:** Mocha
**Package Manager:** npm

Docket is a documentation platform that combines production-ready templates with intelligent CLI tools and an agent-agnostic protocol. See [Architecture Overview](./architecture/overview.md) for complete details.

## Documentation Health

As of last check (v0.3.0):
- **Completeness Score:** 93/100 ✅
- **Health Score:** 95/100 ✅

Run health checks anytime:
```bash
docket audit   # Check completeness
docket review  # Check for staleness
```

## Creating New Documentation

```bash
# Create a new ADR
docket new adr "Use WebSockets for real-time features"

# Create a new RFC
docket new rfc "Plugin system design"

# Create a new guide
docket new guide "Setting up development environment"
```

## Documentation Philosophy

Docket uses itself to document itself. This serves multiple purposes:

1. **Validation** - If docket can't document docket, it's not ready
2. **Demonstration** - Real-world example for users
3. **Dogfooding** - We experience our own product
4. **Quality** - Forces us to make the product actually useful

See [ADR-0001](./adr/adr-0001-cli-platform-over-templates-only.md) for the story of how we got here.

---

*This documentation was initialized and maintained using docket itself.*
