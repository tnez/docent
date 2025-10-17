# Canonical Onboarding Questions for Docent Ask Tool

**Created:** 2025-10-15
**Purpose:** Identify questions new developers and AI agents ask when joining a project to inform design of docent's "ask" tool
**Status:** In Progress

## Executive Summary

When developers or AI agents join a project, they need answers to specific questions to work effectively. This research compiles canonical questions across key categories to guide the design of docent's "ask" tool - a feature that would let agents query project knowledge naturally rather than manually searching documentation.

**Key Categories:**

- Setup & Environment
- Code Standards & Conventions
- Architecture & Design
- Testing & Quality
- Workflows & Processes
- Deployment & Operations
- Troubleshooting

**Relevance to Docent:**
The "ask" tool would make docent act like a senior engineer buddy who knows the project inside-out and can answer questions instantly with citations to source documentation.

---

## Setup & Environment Questions

### Getting Started

- How do I set up my development environment?
- What tools and dependencies do I need installed?
- How do I build the project?
- How do I verify my setup is working?
- Where is the getting started guide?

### Configuration

- What configuration files do I need to create?
- Are there any secrets or API keys I need?
- How do I configure my editor/IDE for this project?
- What environment variables are required?
- Is there a `.env.example` file?

### Local Development

- How do I run the project locally?
- How do I connect to local services (database, cache, etc.)?
- Are there any mock services or stubs I need?
- How do I enable debug mode?
- What's the fastest way to test my changes?

---

## Code Standards & Conventions

### Style & Formatting

- What are the code standards for this project?
- Is there a style guide?
- What linter/formatter do you use?
- How do I auto-format code?
- What's the indentation style (tabs vs spaces)?

### Language & Framework Conventions

- What version of [language] does this project use?
- What frameworks are we using and why?
- Are there any language features we avoid?
- What's the preferred way to handle errors?
- What's the naming convention for files/classes/functions?

### Code Organization

- How is the code organized?
- Where should I put new code?
- What's the module/package structure?
- Are there any architectural patterns I should follow?
- Where do utilities/helpers go?

### Commit & PR Conventions

- What commit message format should I use?
- How do I structure a good PR?
- What should be included in PR descriptions?
- Should I squash commits before merging?
- What branch naming convention do you use?

---

## Architecture & Design Questions

### High-Level Architecture

- What's the overall architecture of this system?
- What are the main components and how do they interact?
- Is there an architecture diagram?
- What design patterns are used?
- Why was [technology/framework] chosen?

### Data Flow

- How does data flow through the system?
- What's the request/response lifecycle?
- How is state managed?
- What's the data model?
- How do we handle concurrency?

### Dependencies & Integration

- What external services do we integrate with?
- What are our critical dependencies?
- How do we handle API versioning?
- What's our dependency update policy?
- Are there any deprecated dependencies?

### Design Decisions

- Where are architecture decisions documented? (ADRs)
- Why did we choose [approach] over [alternative]?
- What trade-offs were considered?
- What constraints influenced the design?
- Are there any known technical debt areas?

---

## Testing & Quality Questions

### Running Tests

- How do I run tests?
- What types of tests exist (unit, integration, e2e)?
- How long do tests take to run?
- Can I run a subset of tests?
- How do I run tests in watch mode?

### Writing Tests

- What testing framework do we use?
- Where should I put test files?
- What's the testing philosophy?
- What should be tested vs not tested?
- Are there test helpers or fixtures?
- What's the expected test coverage?

### Quality Checks

- What checks run in CI/CD?
- How do I run the same checks locally?
- What's the definition of "ready to merge"?
- Are there pre-commit hooks?
- What's the code review process?

---

## Workflows & Processes

### Development Workflow

- What's the development workflow?
- How do I pick up a task?
- What's the branching strategy?
- When should I ask for code review?
- How do feature flags work?

### Communication & Collaboration

- Where do we discuss technical decisions?
- How do I ask for help?
- What's documented vs tribal knowledge?
- Are there regular team syncs?
- How do I contribute to documentation?

### Release Process

- How do we release new versions?
- What's the versioning scheme?
- Is there a changelog?
- What's the deployment schedule?
- How do we handle hotfixes?

---

## Deployment & Operations

### Deployment

- How do I deploy changes?
- What environments exist (dev, staging, prod)?
- How do I create a preview environment?
- What's the rollback procedure?
- Are deployments automated?

### Infrastructure

- What cloud provider/infrastructure do we use?
- How is infrastructure managed (IaC)?
- Where can I find infrastructure documentation?
- How do I access logs?
- How do I access metrics/monitoring?

### Operations & Runbooks

- Where are the runbooks?
- How do I handle common operational tasks?
- What's the on-call process?
- How do I troubleshoot production issues?
- What's the incident response procedure?

---

## Troubleshooting Questions

### Common Issues

- Build is failing - what should I check?
- Tests are failing - how do I debug?
- My local environment isn't working - where do I start?
- I'm getting [specific error] - what does it mean?
- Dependencies won't install - what's wrong?

### Getting Unstuck

- Where can I find troubleshooting guides?
- Who should I ask about [specific area]?
- Is there a known issues list?
- How do I debug [specific component]?
- What logs should I check?

### Project-Specific Issues

- Why is [feature] behaving this way?
- Is [behavior] a bug or intended?
- Where is [functionality] implemented?
- How do I trace a request through the system?
- What's the history behind [decision/code]?

---

## Question Patterns by User Type

### New Developer (Human)

Focuses on:

- Setup and getting started
- Code standards and conventions
- How to contribute
- Where to find things
- "How do I...?" questions

### AI Agent

Focuses on:

- Code standards (for generating code)
- Architecture constraints (for making decisions)
- Testing requirements (for validation)
- Operational procedures (for following runbooks)
- "What are the rules?" questions

### Returning Contributor

Focuses on:

- Recent changes
- What's currently being worked on
- Design decisions since last contribution
- New conventions or processes
- "What changed?" questions

---

## Question Classification System

### By Answer Location

1. **Setup Questions** → Getting started guide, README
2. **Standards Questions** → Contributing guide, style guides
3. **Architecture Questions** → ADRs, architecture docs, RFCs
4. **Testing Questions** → Testing guide, test files
5. **Workflow Questions** → Contributing guide, runbooks
6. **Operations Questions** → Runbooks, deployment docs
7. **History Questions** → Git commits, ADRs, RFCs, journal

### By Complexity

1. **Simple** - Single doc, direct answer (e.g., "What linter do we use?")
2. **Moderate** - Multiple docs, synthesis needed (e.g., "How do I add a feature?")
3. **Complex** - Understanding context, trade-offs (e.g., "Why this architecture?")

### By Time Sensitivity

1. **Onboarding** - Needed immediately for new contributors
2. **Regular** - Needed periodically during development
3. **Occasional** - Edge cases, troubleshooting

---

## Real-World Examples from Docent Project

Questions a new contributor to docent might ask:

### Immediate Onboarding

- "How do I set up docent for local development?" → getting-started.md
- "What are the code standards?" → contributing.md:228-235
- "How do I test my changes?" → testing.md

### Understanding the Project

- "Why did we choose MCP over CLI?" → adr-0004-mcp-only-architecture.md
- "What's the architecture?" → architecture/overview.md
- "What tools are available?" → mcp-api-reference.md

### Contributing

- "How do I add a new MCP tool?" → getting-started.md:95-120
- "What commit format should I use?" → contributing.md:130-147
- "How do I run the linter?" → contributing.md:63-72

### Troubleshooting

- "Build is failing - what's wrong?" → getting-started.md:261-267
- "MCP server won't connect - help?" → getting-started.md:273-278
- "How do I check CI/CD status?" → runbooks/ci-cd-health-check.md

---

## Recommendations for Docent Ask Tool

### Phase 1: Core Onboarding Questions

Prioritize answering:

1. Setup & getting started (highest immediate value)
2. Code standards & conventions (enables contributions)
3. Testing & quality (ensures quality contributions)
4. How to add common features (accelerates development)

### Phase 2: Architecture & Context

Add:

1. Architecture questions (why decisions were made)
2. Design pattern questions (how to structure code)
3. Integration questions (how components work together)

### Phase 3: Operations & Advanced

Expand to:

1. Deployment & operations
2. Troubleshooting guidance
3. Historical context ("why did we...?")

### Implementation Approach

**Simple Start:**

```typescript
// Question → Doc mapping
const questionPatterns = {
  "code standards": ["contributing.md", "standards.md"],
  "how to test": ["testing.md", "package.json"],
  "architecture": ["architecture/overview.md", "adr/"],
  // ...
}
```

**Advanced Approach:**

- Semantic search over documentation
- LLM-powered question classification
- Multi-doc synthesis for complex questions
- Citation tracking (file:line references)

---

## Next Steps

1. **Validate question list** - Review with actual onboarding experience
2. **Prototype answer engine** - Build simple version that handles top 10 questions
3. **Draft RFC** - Formal proposal for "ask" tool
4. **Test with real developers** - See what questions aren't covered
5. **Iterate** - Expand to handle more question types

---

## References

### Internal

- [Getting Started Guide](../guides/getting-started.md)
- [Contributing Guide](../guides/contributing.md)
- [Testing Guide](../guides/testing.md)
- [MCP API Reference](../guides/mcp-api-reference.md)
- [Architecture Overview](../architecture/overview.md)

### External Research

- [First-time contributor questions](https://opensource.guide/how-to-contribute/)
- [Onboarding best practices](https://increment.com/teams/the-art-of-onboarding/)
- RAG for documentation: Need to research existing approaches

---

**End of Research Document**
