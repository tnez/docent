# RFC-0007: Resource-Based Question Answering

**Status:** Implemented (validation pending)
**Author:** @tnez
**Created:** 2025-10-16
**Updated:** 2025-10-16
**Related:** RFC-0005 (Enhanced MCP Architecture), Research: Onboarding Questions

## Summary

Validate that docent's MCP resources are discoverable enough for agents to answer common developer/onboarding questions naturally. Rather than building a special "ask" tool, we ensure resource descriptions and organization enable agents to find the right documentation by listing/browsing resources. Success means agents can answer questions like "What are the code standards?" by discovering and reading `docent://guide/contributing` without special tooling.

## Motivation

### Problem Statement

**The Question:**

When developers or agents join a project, they ask questions:

- "What are the code standards?"
- "How do I add a new feature?"
- "What's the testing strategy?"
- "Why was this architectural decision made?"

**Current State:**

Agents must:

1. Manually search files (grep, read random docs)
2. Guess where information lives
3. Synthesize answers from disconnected sources
4. No guidance on what documentation exists

**Research shows 50+ canonical questions** across 7 categories (see `docs/research/onboarding-questions-for-ask-tool.md`):

- Setup & Environment
- Code Standards & Conventions
- Architecture & Design
- Testing & Quality
- Workflows & Processes
- Deployment & Operations
- Troubleshooting

### The Insight: Resources ARE the Answer

Instead of building an "ask tool" that parses questions and searches docs, we realize:

**Agents naturally find answers if resources are discoverable.**

```typescript
// NOT this (special tool):
ask("What are the code standards?")
→ custom question parsing
→ custom doc search
→ synthesized answer

// THIS (natural discovery):
Agent thinks: "I need code standards"
→ mcp.listResources()
→ Sees: docent://guide/contributing (description mentions standards)
→ mcp.readResource('docent://guide/contributing')
→ Answers based on actual docs
```

**Key principle:** The "ask tool" is really about **resource discoverability**, not question parsing.

### Goals

1. **Validate Discoverability**: Can agents find appropriate resources for common questions?
2. **Identify Gaps**: Which questions lack corresponding resources?
3. **Improve Descriptions**: Make resource descriptions guide agents to the right content
4. **Document Success Patterns**: What makes a resource discoverable?

### Non-Goals

1. **Not building semantic search**: No indexing, embeddings, or vector databases
2. **Not parsing questions**: No question classification or NLP
3. **Not creating new tools**: Work with existing MCP resources (RFC-0005)
4. **Not replacing agent intelligence**: Agents already know how to search and synthesize

## Detailed Design

### Validation Approach

**Use the 50+ questions from research as a test suite for resource discoverability.**

For each question category, verify:

1. Does a resource exist that answers it?
2. Is the resource description clear enough?
3. Does the content actually answer the question?
4. Would an agent naturally discover this resource?

### Test Format

```markdown
## Question Category: Code Standards & Conventions

### Q: "What are the code standards?"

**Expected Resource:** `docent://guide/contributing`
**Current Description:** "Contributing guidelines, code standards, commit format, PR process"
**Test Result:** ✅ Agent finds it (contains "code standards" in description)
**Answer Quality:** ✅ Content covers TypeScript standards, formatting, naming
**Citation:** docs/guides/contributing.md:228-280

### Q: "How do I format my code?"

**Expected Resource:** `docent://guide/contributing`
**Current Description:** "Contributing guidelines, code standards, commit format, PR process"
**Test Result:** ⚠️ "format" not in description, might miss it
**Fix:** Add "code formatting" to description
**Answer Quality:** ✅ Content covers prettier, linting
**Citation:** docs/guides/contributing.md:63-72

### Q: "What's the naming convention?"

**Expected Resource:** `docent://guide/contributing` OR `docent://standard/typescript`
**Current Description:** Contributing guide doesn't mention "naming"
**Test Result:** ❌ Agent unlikely to find this
**Gap:** Need explicit standard resource or improve description
```

### Resource Organization Principles

**1. Logical URI Structure**

Resources organized by purpose:

- `docent://guide/*` - How-to guides (onboarding, contributing, testing)
- `docent://standard/*` - Standards and conventions (code style, patterns)
- `docent://adr/*` - Decision history (why we chose X)
- `docent://rfc/*` - Future plans and proposals
- `docent://runbook/*` - Operational procedures

**2. Descriptive Naming**

Resource descriptions should:

- Mention key topics covered
- Use terms from common questions
- Be specific, not generic
- Guide agents to the right resource

**Examples:**

```typescript
// ❌ Generic
{
  uri: 'docent://guide/contributing',
  name: 'Contributing Guide',
  description: 'How to contribute to this project'
}

// ✅ Specific and searchable
{
  uri: 'docent://guide/contributing',
  name: 'Contributing Guide',
  description: 'Code standards (TypeScript, formatting), commit format (conventional commits), PR process, testing requirements, and how to add new features'
}
```

**3. Content Completeness**

Each resource should:

- Answer its category of questions fully
- Include examples where helpful
- Cite related resources
- Use clear section headers

### Validation Process

**Phase 1: Question Mapping (1-2 days)**

For each of the 50+ questions:

1. Identify which resource should answer it
2. Check if that resource exists
3. Verify resource description mentions relevant terms
4. Read resource to confirm content quality

**Phase 2: Gap Analysis (1 day)**

Identify:

- Questions with no corresponding resource → need to create docs
- Resources with unclear descriptions → improve descriptions
- Content gaps in existing resources → enhance docs
- Redundant or overlapping resources → consolidate

**Phase 3: Iteration (ongoing)**

Fix identified issues:

- Create missing resources (guides, standards, runbooks)
- Improve resource descriptions for discoverability
- Enhance content to answer questions more directly
- Add cross-references between related resources

**Phase 4: Agent Testing (1-2 days)**

Real-world validation:

- Ask agent common questions
- Observe what resources it discovers
- Check if answers are accurate and complete
- Identify patterns: what works, what doesn't

### Success Criteria

**Quantitative:**

- 80% of onboarding questions (Setup, Standards, Testing) have discoverable resources
- 60% of architecture questions have discoverable resources
- 40% of operations questions have discoverable resources

**Qualitative:**

- Agent finds correct resource within 2 attempts (list + browse)
- Resource descriptions clearly indicate content
- Answers include accurate citations (file:line)
- Agents don't need to read multiple resources to answer simple questions

### Example: Onboarding Question Validation

**Question:** "How do I set up my development environment?"

**Test:**

1. Agent lists resources: `mcp.listResources()`
2. Finds: `docent://guide/getting-started` (description mentions "development setup")
3. Reads resource: `mcp.readResource('docent://guide/getting-started')`
4. Content includes: prerequisites, installation, configuration, verification

**Result:** ✅ Discoverable and complete

**Question:** "What commit format should I use?"

**Test:**

1. Agent lists resources
2. Finds: `docent://guide/contributing` (description mentions "commit format")
3. Reads resource
4. Content includes: conventional commits, examples, PR requirements

**Result:** ✅ Discoverable and complete

**Question:** "How do I debug failing tests?"

**Test:**

1. Agent lists resources
2. Finds: `docent://guide/testing` (description mentions "testing")
3. Reads resource
4. Content covers: running tests, but NOT debugging

**Result:** ⚠️ Discoverable but incomplete - needs debugging section

## Question Bank by Category

### High Priority (Onboarding - Must Answer)

**Setup & Environment:**

- How do I set up my development environment?
- How do I run the project locally?
- How do I verify my setup is working?

**Code Standards:**

- What are the code standards?
- What commit message format should I use?
- How do I format my code?

**Testing:**

- How do I run tests?
- Where should I put test files?
- What's the testing philosophy?

**Contributing:**

- How do I add a new feature?
- What's the PR process?
- When should I ask for code review?

### Medium Priority (Understanding - Should Answer)

**Architecture:**

- What's the overall architecture?
- What design patterns are used?
- Where are architecture decisions documented?

**Development:**

- How is the code organized?
- Where should I put new code?
- What's the development workflow?

**Workflows:**

- What's the branching strategy?
- How do we release new versions?
- What checks run in CI/CD?

### Lower Priority (Operations - Nice to Answer)

**Deployment:**

- How do I deploy changes?
- What environments exist?
- How do I create a preview environment?

**Troubleshooting:**

- Build is failing - what should I check?
- Where can I find troubleshooting guides?
- Who should I ask about specific areas?

## Trade-offs and Alternatives

### Chosen Approach: Validation via Question Bank

**Advantages:**

- ✅ Builds on existing infrastructure (RFC-0005 resources)
- ✅ Natural and conversational (agents browse, not special commands)
- ✅ Lightweight (no new tools or indexing)
- ✅ Validates what we already built
- ✅ Identifies gaps in documentation

**Disadvantages:**

- ❌ Requires good resource descriptions (manual work)
- ❌ Depends on agent intelligence to find resources
- ❌ Doesn't handle complex multi-doc questions elegantly
- ❌ No specialized question parsing

**Assessment:** Right approach for v1. Validates core infrastructure before adding complexity.

### Alternative 1: Special "Ask" Tool

**Description:** Create `ask(question: string)` tool that parses questions and searches docs

**Pros:**

- Direct interface ("ask a question, get an answer")
- Can implement smart question classification
- Consistent interface

**Cons:**

- ❌ Custom question parsing (complex)
- ❌ Custom document search (complex)
- ❌ Doesn't leverage existing MCP resources
- ❌ Adds new tool when resources already exist
- ❌ Less flexible than agent-driven discovery

**Why not chosen:** Over-engineered for the problem. Resources already provide discovery.

### Alternative 2: Semantic Search + Embeddings

**Description:** Index docs with embeddings, use vector search for questions

**Pros:**

- Handles semantic similarity
- Works with vague questions
- No need for perfect resource descriptions

**Cons:**

- ❌ Heavy infrastructure (vector DB, embedding generation)
- ❌ Requires indexing pipeline
- ❌ More complex deployment
- ❌ Overkill for structured docs
- ❌ Doesn't align with docent's "simple & lightweight" philosophy

**Why not chosen:** Too complex for current needs. Save for future if validation shows gaps.

### Alternative 3: LLM-Powered Q&A Over Docs

**Description:** Load all docs into context, let LLM answer questions

**Pros:**

- Simple approach (just prompt engineering)
- Handles any question format
- No special infrastructure

**Cons:**

- ❌ Context window limits (can't load all docs)
- ❌ No citation/source tracking
- ❌ Expensive (large prompts on every question)
- ❌ Doesn't leverage MCP architecture
- ❌ Not discoverable (black box)

**Why not chosen:** Doesn't align with MCP resource pattern. Resources provide structure and caching.

### Alternative 4: Do Nothing (Current State)

**Description:** Don't validate, assume resources work

**Pros:**

- No effort required
- Resources already implemented

**Cons:**

- ❌ Don't know if resources are discoverable
- ❌ Missing documentation not identified
- ❌ Unclear if descriptions are effective
- ❌ No feedback loop for improvement

**Why not chosen:** Need validation to know if RFC-0005 achieves its goals.

## Implementation Plan

### Phase 1: Question-Resource Mapping (Week 1)

**Goal:** Map each question to expected resources

**Tasks:**

1. Create validation spreadsheet/document
2. For each of 50+ questions, identify:
   - Expected resource URI
   - Current resource description
   - Whether resource exists
3. Document initial findings

**Deliverable:** `docs/research/question-resource-mapping.md`

### Phase 2: Resource Audit (Week 1-2)

**Goal:** Test discoverability and identify gaps

**Tasks:**

1. For each expected resource:
   - Check if description enables discovery
   - Read content to verify it answers questions
   - Rate discoverability (✅ good, ⚠️ needs work, ❌ missing)
2. Categorize findings:
   - Missing resources (need to create)
   - Unclear descriptions (need to improve)
   - Incomplete content (need to enhance)

**Deliverable:** Gap analysis document with priorities

### Phase 3: Improvements (Week 2-3)

**Goal:** Fix identified issues

**Tasks:**

1. **High Priority (Onboarding)**:
   - Create missing guides
   - Improve key resource descriptions
   - Enhance getting-started content
2. **Medium Priority (Architecture)**:
   - Improve ADR descriptions
   - Add architecture guide if missing
   - Cross-link related resources
3. **Lower Priority (Operations)**:
   - Create runbooks for common tasks
   - Document troubleshooting procedures

**Deliverable:** Updated resources, improved descriptions

### Phase 4: Agent Testing (Week 4)

**Goal:** Real-world validation

**Tasks:**

1. Ask agent sample questions from each category
2. Observe:
   - Which resources agent discovers
   - Time to find correct resource
   - Answer quality and citations
3. Document patterns:
   - What works well
   - Where agent struggles
   - Unexpected discoveries

**Deliverable:** Test report with recommendations

### Phase 5: Iteration (Ongoing)

**Goal:** Continuous improvement

**Tasks:**

1. Add new questions as they arise
2. Create resources for new question categories
3. Refine descriptions based on usage
4. Monitor agent behavior patterns

**Deliverable:** Living documentation that improves over time

## Success Metrics

### Discovery Metrics

**Can agents find resources?**

- 90% of questions in high-priority categories → resource found within 2 attempts
- 70% of questions in medium-priority categories → resource found within 3 attempts
- 50% of questions in lower-priority categories → resource found

### Quality Metrics

**Do resources answer questions?**

- 90% of high-priority questions fully answered by resource content
- 80% of medium-priority questions fully answered
- 60% of lower-priority questions fully answered

### Efficiency Metrics

**How fast can agents answer?**

- Simple questions (single resource): <30 seconds
- Moderate questions (2-3 resources): <2 minutes
- Complex questions (synthesis required): <5 minutes

### Feedback Metrics

**Are we improving?**

- Number of missing resources identified → decreases over time
- Number of unclear descriptions → decreases over time
- Agent discovery success rate → increases over time

## Future Enhancements

Once validation proves the approach works:

### 1. Common Question Patterns

Document patterns that help agents:

```markdown
## Common Question Patterns

"What are..." → Look for standard/* resources
"How do I..." → Look for guide/* resources
"Why did we..." → Look for adr/* resources
"What's the process for..." → Look for runbook/* resources
```

### 2. Resource Metadata Tags

Add tags to resources for better discovery:

```typescript
{
  uri: 'docent://guide/contributing',
  name: 'Contributing Guide',
  description: '...',
  metadata: {
    tags: ['onboarding', 'code-standards', 'testing', 'pr-process'],
    answers: ['code standards', 'commit format', 'PR requirements']
  }
}
```

### 3. Specialized Q&A Prompt

If validation shows value, create MCP prompt:

```typescript
// MCP Prompt: answer-question
// Pre-gathers relevant resources based on question category
// Provides structured guidance for answering
```

### 4. Semantic Search (Future)

If simple discovery proves insufficient:

- Add semantic search layer
- Generate embeddings for resources
- Enable fuzzy question matching

## Open Questions

1. **What's the right balance of resources?**
   - Too many → hard to browse
   - Too few → questions not answered
   - **Recommendation:** Start with ~10-15 core resources, expand as needed

2. **Should resources be atomic or comprehensive?**
   - Atomic: One topic per resource (more resources)
   - Comprehensive: Multiple topics per guide (fewer resources)
   - **Recommendation:** Mix - guides are comprehensive, standards are atomic

3. **How do we handle overlapping content?**
   - Example: Testing mentioned in contributing guide AND testing guide
   - **Recommendation:** Overview in one, details in the other, cross-link

4. **What if agents can't find resources?**
   - Add more description keywords?
   - Create more granular resources?
   - Add metadata/tags?
   - **Recommendation:** Validate first, then decide based on patterns

5. **How do we measure "discoverability" objectively?**
   - Agent testing (qualitative)
   - Success rate metrics (quantitative)
   - Time-to-answer (quantitative)
   - **Recommendation:** Use all three, weight qualitative highly

## References

### Related Docent Documentation

- [RFC-0005: Enhanced MCP Architecture](./rfc-0005-enhanced-mcp-architecture.md) - MCP resources implementation
- [Research: Onboarding Questions for Ask Tool](../research/onboarding-questions-for-ask-tool.md) - 50+ canonical questions
- [ADR-0004: MCP-Only Architecture](../adr/adr-0004-mcp-only-architecture.md) - Context provider principle

### External Resources

- [Information Architecture for Documentation](https://www.writethedocs.org/guide/writing/mindshare/)
- [Writing Good Documentation Descriptions](https://www.divio.com/blog/documentation/)
- [RAG for Documentation (if needed later)](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

**This RFC proposes using the 50+ canonical onboarding questions as a test suite to validate that docent's MCP resources are discoverable enough for agents to answer questions naturally, without building special "ask" tooling. Success means agents find and use existing resources effectively.**
