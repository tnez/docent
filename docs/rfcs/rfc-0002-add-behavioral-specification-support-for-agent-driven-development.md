# RFC-0002: Add Behavioral Specification Support for Agent-Driven Development

**Status:** In Review
**Author:** @tnez
**Created:** 2025-10-12
**Updated:** 2025-10-13
**Reviewed:** 2025-10-13 (architectural review completed, critical issues addressed)

## Summary

Add behavioral specification support to docket, enabling AI agents to understand WHAT features should do through Gherkin-style scenarios with concrete examples. Specifications will live in a `specs/` directory, use descriptive naming (e.g., `analyze-command.spec.md`), and integrate with existing docket commands (`audit`, `review`, `new`). This addresses a critical gap in agent-driven development: providing testable, navigable behavior contracts that scale beyond monolithic AGENTS.md files.

## Motivation

### Problem Statement: The AGENTS.md Scaling Problem

Current practice in AI-assisted development involves creating a single `AGENTS.md` file that contains all context an agent needs: project setup, architecture, conventions, testing instructions, and deployment process. This approach has a critical scaling problem:

**The Monolithic Documentation Trap:**
- Projects attempt to cram all agent context into one file (often 5000+ lines)
- Even with 200K token context windows, this becomes inefficient and unwieldy
- Agents load irrelevant information for every task
- Single file becomes hard to maintain and keep current
- Doesn't scale beyond ~50 documentation topics

**Who is affected:**
- Solo developers trying to maintain comprehensive documentation
- Teams working on projects with 100+ features
- AI agents that need to understand specific behaviors without loading entire codebases

**Consequences of not solving:**
- Developers revert to undocumented or poorly documented behavior
- Agents lack clear contracts for what features should do
- Testing becomes implementation-driven instead of spec-driven
- Knowledge remains locked in code rather than accessible documentation

### Docket's Vision: Documentation as Agent-Navigable Knowledge Base

Docket already provides the architecture for scalable agent documentation:

**Structured Discovery Instead of Monolithic Docs:**
```bash
# Agents discover what exists
docket analyze    # Languages, frameworks, structure
docket audit      # Documentation coverage, gaps
docket review     # Freshness, staleness, drift

# Agents navigate selectively
docs/
├── README.md              # Navigation hub
├── architecture/          # System design
├── adr/                   # Decisions (why we did X)
├── rfcs/                  # Proposals (should we do Y?)
└── guides/                # How-to documentation
```

**The approach scales:**
- Small AGENTS.md: "Run `docket audit` to understand documentation"
- Structured docs: Organized by type and purpose
- Just-in-time reading: Load only relevant docs
- Discovery tools: Find what you need when you need it

### The Missing Piece: Behavioral Specifications

Docket currently supports:
- **ADRs** - Document decisions and their rationale (past)
- **RFCs** - Propose changes and gather feedback (future)
- **Architecture docs** - Explain system design (structure)
- **Guides** - Describe how to do specific tasks (process)

**What's missing:**
- **Specifications** - Define WHAT features should do (behavior contracts)

Without behavioral specs, agents must:
1. Read implementation code to understand behavior
2. Infer requirements from tests
3. Guess at edge cases and error handling
4. Lack clear acceptance criteria

**With behavioral specs, agents can:**
1. Understand feature behavior without reading implementation
2. Generate appropriate tests from Given/When/Then scenarios
3. Validate implementations against contracts
4. Know exactly what "done" looks like

### Goals

1. **Enable spec-first development:** Define behavior before implementation
2. **Provide agent-readable contracts:** Clear Given/When/Then scenarios with examples
3. **Scale documentation:** Specs integrate with docket's discovery architecture
4. **Support testing:** Specs provide test scenarios agents can implement
5. **Maintain traceability:** Link specs to ADRs, RFCs, and implementation
6. **Track implementation status:** Agents know what's done, what's next

### Non-Goals

1. **Not an executable test framework:** Specs are documentation, not test code (use Jest, Cucumber, etc. for execution)
2. **Not replacing ADRs/RFCs:** Specs complement existing doc types
3. **Not supporting every format:** Focus on one well-designed hybrid format
4. **Not generating implementation:** Agents read specs and write code, but specs don't generate code automatically

## Detailed Design

### Overview

Behavioral specifications will be markdown documents stored in a `specs/` directory, using a hybrid format that combines:
- **Gherkin-style scenarios** (Given/When/Then) for clarity
- **Concrete examples** (input/output) for agent understanding
- **Metadata** for tracking status and relationships
- **Markdown flexibility** for human readability

### Specification Format

Each spec is a `.spec.md` file with this structure:

```markdown
# Spec: [Feature Name]

## Metadata
- **Status:** draft | ready | implemented | deprecated
- **Created:** YYYY-MM-DD
- **Updated:** YYYY-MM-DD
- **Related:** Links to ADRs, RFCs, implementation files

## Context
Brief description of what this feature does and why it exists.

## Behaviors

### Scenario: [Scenario Name]
**Given:** Initial state or preconditions
**When:** Action or event that triggers behavior
**Then:** Expected outcomes and postconditions

#### Example:
\`\`\`bash
# Command input
$ docket analyze --output json
\`\`\`

\`\`\`json
{
  "languages": ["JavaScript", "TypeScript"],
  "frameworks": [
    { "name": "React", "type": "frontend" }
  ]
}
\`\`\`

### Scenario: [Another Scenario]
**Given:** Different initial state
**When:** Different action
**Then:** Different expected outcome

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
Implementation hints, constraints, or considerations (optional).

## Test Hints
Suggested test cases or testing approaches (optional).
```

### Concrete Example: Analyze Command Spec

```markdown
# Spec: Analyze Command

## Metadata
- **Status:** implemented
- **Created:** 2025-10-12
- **Related:** [ADR-0003](/Users/tnez/Code/tnez/docket/docs/adr/adr-0003-agent-agnostic-architecture.md), [detector.ts](/Users/tnez/Code/tnez/docket/src/lib/detector.ts)

## Context
The analyze command examines a project directory to detect programming languages, frameworks, and project structure. It provides JSON output for agent consumption.

## Behaviors

### Scenario: Analyze JavaScript/TypeScript project
**Given:** A project directory containing package.json and source files
**When:** User runs `docket analyze`
**Then:** System detects languages and frameworks with confidence scores

#### Example:
\`\`\`bash
$ docket analyze --output json
\`\`\`

\`\`\`json
{
  "languages": [
    { "name": "JavaScript", "confidence": 0.95 },
    { "name": "TypeScript", "confidence": 0.85 }
  ],
  "frameworks": [
    { "name": "React", "type": "frontend", "confidence": 0.9 },
    { "name": "Express", "type": "backend", "confidence": 0.8 }
  ],
  "structure": {
    "sourceDirectories": ["src", "lib"],
    "testDirectories": ["test"],
    "hasDocumentation": true
  }
}
\`\`\`

### Scenario: Empty directory analysis
**Given:** A directory with no code files
**When:** User runs `docket analyze`
**Then:** System returns empty arrays for languages and frameworks

#### Example:
\`\`\`json
{
  "languages": [],
  "frameworks": [],
  "structure": {
    "sourceDirectories": [],
    "testDirectories": [],
    "hasDocumentation": false
  }
}
\`\`\`

### Scenario: Monorepo detection
**Given:** A directory with multiple package.json files in subdirectories
**When:** User runs `docket analyze`
**Then:** System identifies monorepo structure and analyzes each package

## Acceptance Criteria
- [x] Detects top 20 programming languages by file extension
- [x] Identifies major web frameworks (React, Vue, Angular, Express, etc.)
- [x] Recognizes monorepo structures (multiple package.json files)
- [x] Outputs valid JSON with --output json flag
- [x] Completes analysis in under 5 seconds for typical projects
- [x] Handles permission errors gracefully

## Technical Notes
- Uses file extensions and patterns for language detection
- Parses package.json for dependency analysis
- Checks for framework-specific config files (.eslintrc, tsconfig.json, etc.)
- Respects .gitignore patterns when scanning

## Test Hints
1. Test with single-language projects (pure JS, pure Python)
2. Test with polyglot projects (multiple languages)
3. Test with monorepos (Lerna, Nx, Turborepo)
4. Test with empty directories
5. Test with permission-denied directories
6. Verify JSON schema compliance
```

### Template Definition

**Location:** `/templates/spec-template.md`

The spec template will be stored alongside existing docket templates (adr-template.md, rfc-template.md, etc.) and used by `docket new spec` to generate new specification files.

**Template Structure:**

```markdown
# Spec: [SPEC_TITLE]

## Metadata
- **Status:** draft
- **Created:** [CREATED_DATE]
- **Updated:** [CREATED_DATE]
- **Related:**

## Context

[Brief description of what this feature does and why it exists.]

## Behaviors

### Scenario: [Primary Happy Path]
**Given:** [Initial state or preconditions]
**When:** [Action or event that triggers behavior]
**Then:** [Expected outcomes and postconditions]

#### Example:
\`\`\`bash
# Add example command or code showing the scenario
\`\`\`

\`\`\`json
{
  "expected": "output"
}
\`\`\`

### Scenario: [Error or Edge Case]
**Given:** [Different initial conditions]
**When:** [Action that might fail or behave differently]
**Then:** [Expected error handling or alternative behavior]

## Acceptance Criteria
- [ ] [Criterion describing what must be true when feature is complete]
- [ ] [Another criterion]
- [ ] [Another criterion]

## Technical Notes

[Optional: Implementation hints, constraints, or considerations that help developers.]

## Test Hints

[Optional: Suggested test cases or testing approaches.]
```

**Placeholders:**
- `[SPEC_TITLE]` - Feature name provided by user (e.g., "Analyze Command")
- `[CREATED_DATE]` - Current date in YYYY-MM-DD format
- Status defaults to "draft"
- Related field starts empty for user to fill
- Context, scenarios, and criteria sections are template guidelines

**Template Processing:**

When running `docket new spec "Analyze Command"`:
1. Load template from `/templates/spec-template.md`
2. Replace `[SPEC_TITLE]` with title
3. Replace `[CREATED_DATE]` with current date
4. Slugify title for filename: "Analyze Command" → `analyze-command.spec.md`
5. Write to `/specs/analyze-command.spec.md`

### Traceability and Cross-References

Specifications should link to related documentation and implementation for complete context.

**In Spec Metadata (Related field):**

```yaml
Related:
  - ADR: docs/adr/adr-0003-agent-agnostic-architecture.md
  - RFC: docs/rfcs/rfc-0001-mcp-server-integration.md
  - Implementation: src/commands/analyze.ts
  - Tests: test/commands/analyze.test.ts
```

**Path Format:**
- Use project-relative paths starting from repo root
- Example: `docs/adr/adr-0003-...` not `/Users/name/project/docs/...`
- Makes specs portable across machines and environments

**In Implementation Code (Docstring):**

```typescript
/**
 * Analyze command - detects languages, frameworks, and project structure
 *
 * @spec docs/specs/analyze-command.spec.md
 */
export default class Analyze extends Command {
  // implementation
}
```

**Bidirectional Linking Benefits:**
- Spec → Code: Find implementation from spec
- Code → Spec: Understand behavior from implementation
- `docket review` can validate links and detect drift
- Agents can navigate between behavior contract and implementation

**Future Enhancement:**

Phase 4+ could add `docket validate-links` to check:
- Do Related links point to existing files?
- Do implementation files reference their specs?
- Are there orphaned specs (no implementation)?
- Are there unspecified features (implementation without spec)?

### Storage and Organization

**Location:** `specs/` directory at project root

**Naming Convention:**
- Use descriptive names: `analyze-command.spec.md`, `authentication.spec.md`
- Use kebab-case for filenames
- Extension: `.spec.md` for easy identification

**Why Descriptive Names (Not Numbered Like ADRs/RFCs)?**

| Document Type | Naming | Rationale |
|---------------|--------|-----------|
| ADRs/RFCs | Numbered (`adr-0001-...`) | **Sequential decisions** where temporal order matters. "When did we decide X?" |
| Specs | Descriptive (`feature-name.spec.md`) | **Feature behaviors** where topical grouping matters. "What does feature X do?" |

**Advantages of descriptive spec naming:**
- Agents can guess spec location: need auth behavior? Try `specs/authentication.spec.md`
- Alphabetical sorting groups related features
- Spec names match feature names (no number lookup required)
- No merge conflicts when multiple developers create specs simultaneously

**Examples:**
- `specs/authentication.spec.md` - Clear what it covers
- `specs/cli/analyze-command.spec.md` - Clear context
- vs `specs/spec-0042-analyze-command.spec.md` - Number adds no value

**Organization Strategy:**
- **Start flat:** All specs in `specs/` directory initially
- **Organize when needed:** Create subdirectories when you have 10+ specs
- **Suggested structure for later:**
  ```
  specs/
  ├── README.md           # Index of specifications
  ├── cli/                # CLI command behaviors
  │   ├── analyze-command.spec.md
  │   ├── audit-command.spec.md
  │   └── review-command.spec.md
  ├── core/               # Core library behaviors
  │   ├── detector.spec.md
  │   └── auditor.spec.md
  └── integrations/       # External integrations
      └── mcp-server.spec.md
  ```

**Future enhancement:** `docket audit` could suggest reorganization when flat structure has 10+ specs.

### Status Tracking

Each spec includes a **Status** field critical for agent understanding:

- **draft:** Spec being written, behavior not yet finalized
- **ready:** Spec approved, ready for implementation
- **implemented:** Feature built and matches spec
- **deprecated:** Feature removed or replaced (keep spec for history)

**Status Lifecycle:**

```
draft → ready → implemented → deprecated
  ↓       ↓          ↓
  └───────┴──────────┘
  (can return to draft for revisions)
```

**Transition Rules:**

| Transition | Criteria | Who Updates |
|------------|----------|-------------|
| draft → ready | Spec complete, scenarios defined, acceptance criteria clear, reviewed | Developer or reviewer |
| ready → implemented | Code written, tests pass, acceptance criteria met | Developer after implementation |
| implemented → draft | Major feature changes needed, spec requires rework | Developer when planning changes |
| any → deprecated | Feature removed, replaced, or no longer relevant | Developer |

**Update Method:**
- Manual: Developer edits spec metadata `Status:` field
- Future automation: `docket review` could suggest status updates based on code analysis

**Why this matters for agents:**
- Agents know what needs building (ready → implemented)
- Agents avoid implementing deprecated features
- Agents can validate implementations against current specs
- Project status visible through `docket audit --include-specs`
- Clear criteria prevent ambiguity about "done"

### CLI Integration

#### Enhanced Command: `docket new spec`

Following the existing `docket new` pattern, spec creation extends the existing command rather than introducing a new namespace:

```bash
# Create new specification (follows existing pattern)
$ docket new spec "analyze-command"

# Creates: specs/analyze-command.spec.md
# Contains: Template with metadata, scenarios, acceptance criteria

# Consistent with existing commands:
# docket new adr "title"
# docket new rfc "title"
# docket new guide "title"
```

**Implementation details:**

Add to `TEMPLATE_MAP` in `/src/commands/new.ts`:

```typescript
spec: {
  templateFile: 'spec-template.md',
  subdirectory: 'specs',
  needsNumber: false,  // descriptive names only
  prefix: '',
}
```

Update type definition:
```typescript
type DocType = 'adr' | 'rfc' | 'guide' | 'runbook' | 'architecture' | 'spec'
```

**Command behavior:**
- Creates spec from template with descriptive naming (no numbers)
- Uses slugified title for filename (e.g., "Analyze Command" → `analyze-command.spec.md`)
- Returns spec path in JSON output
- Consistent with existing `new` command UX

#### Enhanced: `docket audit --include-specs`

```bash
$ docket audit --include-specs --output json
```

**Additional audit checks:**
- Count specifications by status
- Identify features without specs
- Suggest specs for undocumented features
- Calculate spec coverage percentage

**JSON Schema Addition:**

Adds `specifications` field to `AuditResult` type in `.docket-protocol/schemas/audit.schema.json`:

```typescript
interface AuditResult {
  // ... existing fields (score, checks, recommendations)
  specifications?: {
    total: number
    byStatus: {
      draft: number
      ready: number
      implemented: number
      deprecated: number
    }
    coverage: number  // 0-1, percentage of features with specs
    missingSpecs?: string[]  // Features identified without specs
  }
}
```

**Example JSON output:**
```json
{
  "score": 85,
  "specifications": {
    "total": 15,
    "byStatus": {
      "draft": 2,
      "ready": 3,
      "implemented": 9,
      "deprecated": 1
    },
    "coverage": 0.85,
    "missingSpecs": ["search command", "export feature"]
  },
  "recommendations": [
    "Create spec for 'search' command",
    "Update deprecated specs or remove them"
  ]
}
```

#### Enhanced: `docket review` (spec drift detection)

`docket review` will detect:
- Specs marked "implemented" but code changed recently (drift risk)
- Specs marked "draft" for >30 days (stalled work?)
- Implemented features without specs (coverage gap)

**JSON Schema Addition:**

Adds `specDrift` field to `ReviewResult` type in `.docket-protocol/schemas/review.schema.json`:

```typescript
interface ReviewResult {
  // ... existing fields (health, staleDocs, recommendations)
  specDrift?: {
    implementedButChanged: Array<{
      spec: string
      lastSpecUpdate: string  // ISO date
      lastCodeUpdate: string  // ISO date
      affectedFiles: string[]
    }>
    stalledDrafts: Array<{
      spec: string
      status: string
      daysSinceDraft: number
      lastUpdate: string  // ISO date
    }>
    missingImplementations: Array<{
      spec: string
      status: string  // "ready" - approved but not built
      daysSinceReady: number
    }>
  }
}
```

**Example JSON output:**
```json
{
  "health": 95,
  "specDrift": {
    "implementedButChanged": [
      {
        "spec": "specs/analyze-command.spec.md",
        "lastSpecUpdate": "2025-10-01",
        "lastCodeUpdate": "2025-10-12",
        "affectedFiles": ["src/commands/analyze.ts", "src/lib/detector.ts"]
      }
    ],
    "stalledDrafts": [
      {
        "spec": "specs/search-feature.spec.md",
        "status": "draft",
        "daysSinceDraft": 45,
        "lastUpdate": "2025-08-28"
      }
    ],
    "missingImplementations": [
      {
        "spec": "specs/export-command.spec.md",
        "status": "ready",
        "daysSinceReady": 14
      }
    ]
  },
  "recommendations": [
    "Review specs/analyze-command.spec.md - implementation changed since spec",
    "Update or close stalled draft: specs/search-feature.spec.md",
    "Implement or reconsider specs/export-command.spec.md (ready for 14 days)"
  ]
}
```

### User Experience

**For solo developers:**
1. Start new feature: `docket spec new feature-name`
2. Fill in Given/When/Then scenarios
3. Agent reads spec and implements
4. Agent generates tests from scenarios
5. Update spec status to "implemented"
6. `docket audit` shows progress

**For agents:**
1. Receive task: "Implement semantic search"
2. Check for spec: `ls specs/ | grep search`
3. Read spec: `cat specs/semantic-search.spec.md`
4. Understand behavior from Given/When/Then
5. Generate tests from scenarios
6. Implement to satisfy acceptance criteria
7. Validate against examples in spec

## Trade-offs and Alternatives

### Trade-offs of Hybrid Gherkin-Markdown Approach

**Advantages:**
- **Human-readable:** Natural language scenarios anyone can understand
- **Agent-friendly:** Structured format with clear Given/When/Then contracts
- **Flexible:** Markdown allows customization for specific needs
- **Scalable:** Integrates with docket's discovery architecture
- **Testable:** Scenarios translate directly to test cases
- **No tooling lock-in:** Plain markdown, works with any editor

**Disadvantages:**
- **Not executable:** Unlike Cucumber, specs don't run as tests
- **Manual validation:** No automatic checking that code matches spec
- **Can drift:** Specs and implementation may diverge without discipline
- **Custom format:** Not industry standard like OpenAPI or pure Gherkin

**Our assessment:** Advantages outweigh disadvantages for docket's use case (documentation platform, not test framework).

### Alternative 1: Pure Gherkin with Cucumber

**Description:** Use standard Gherkin `.feature` files with Cucumber for execution.

**Pros:**
- Industry standard format
- Executable specifications (tests run from specs)
- Mature tooling ecosystem
- Ensures specs stay in sync with code

**Cons:**
- Requires step definitions (mapping layer from Gherkin to code)
- Adds Cucumber as dependency
- More complex setup for developers
- Testing framework, not documentation system
- Doesn't integrate with docket's markdown-based docs

**Why not chosen:** Docket is a documentation platform, not a testing framework. We want specs as readable contracts, not executable tests. Developers can use Cucumber separately if they want executable specs.

### Alternative 2: Extend AGENTS.md Only

**Description:** Don't add specs directory. Put behavioral descriptions in AGENTS.md.

**Pros:**
- No new directory structure
- Single file for all agent context
- Extremely simple approach

**Cons:**
- **Doesn't scale** (the core problem we're solving!)
- Monolithic file becomes unmaintainable
- No status tracking per feature
- Hard to find specific behaviors
- Contradicts docket's architecture (structured, navigable docs)

**Why not chosen:** This is exactly the scaling problem we identified in Problem Statement. AGENTS.md is fine for project-level context, but behavioral specs need separate, organized files.

### Alternative 3: JSON Schema Only

**Description:** Use JSON Schema to define data contracts for inputs/outputs.

**Pros:**
- Machine-readable and validatable
- Strong type definitions
- Industry standard for APIs
- Automatic validation possible

**Cons:**
- Only describes data shapes, not behavior
- Not human-readable
- Doesn't capture scenarios or workflows
- Too narrow (only works for APIs/data)

**Why not chosen:** JSON Schema is great for "what does the data look like" but terrible for "what does the feature do." We can use JSON Schema alongside specs (in `.docket-protocol/schemas/`) for data validation, but it doesn't replace behavioral specifications.

### Alternative 4: RSpec/Jest-Style Describe-It

**Description:** Use test framework syntax (describe/it blocks) as specs.

**Pros:**
- Familiar to developers
- Maps directly to test structure
- Can be executable

**Cons:**
- Blurs line between spec and implementation
- Less accessible to non-developers
- Tied to specific testing frameworks
- Mixes "what we need" with "how we test"

**Why not chosen:** We want specs to be implementation-agnostic contracts, not tied to specific testing frameworks. Developers can write RSpec/Jest tests from our Gherkin-style specs.

## Security Considerations

Specifications are markdown documentation files with minimal security concerns:

- **No code execution:** Specs are read-only documentation, never executed
- **No sensitive data:** Specs should not contain secrets, API keys, or passwords (use environment variables in examples)
- **Standard file permissions:** Specs follow standard documentation permissions (644)
- **Version control:** Specs are committed to git like other documentation

**Best practice:** If spec examples require sensitive data (API keys, passwords), use placeholders like `YOUR_API_KEY` or reference environment variables.

## Performance Considerations

Minimal performance impact:

- **File I/O only:** Reading markdown files from disk
- **No computation:** Specs are documentation, not executable code
- **Small file sizes:** Typical spec is 100-500 lines (5-25 KB)
- **Lazy loading:** Agents read only relevant specs, not all at once

**Estimated impact:**
- `docket spec new`: <100ms (template copying)
- `docket audit --include-specs`: +50-200ms (scan specs directory)
- `docket review` (spec drift): +100-300ms (compare file timestamps)

These additions are negligible compared to existing docket operations.

## Testing Strategy

### Unit Tests
- Template rendering (`spec new` creates valid spec file)
- Spec detection (audit finds `.spec.md` files)
- Status parsing (parse metadata from spec files)
- Coverage calculation (count specs by status)

### Integration Tests
- Full workflow: create spec → audit → review
- CLI JSON output validation
- Subdirectory organization (flat vs. nested)

### Manual Testing (Dogfooding)
- Create specs for docket's own commands (analyze, audit, review)
- Validate format is clear and useful
- Test agent consumption (can agents understand and use specs?)
- Iterate on template based on real usage

### Success Criteria
- ✅ `docket spec new` creates valid spec from template
- ✅ `docket audit --include-specs` counts specs correctly
- ✅ Agents can read specs and understand behavior
- ✅ Format scales to 10+ specs without confusion

## Migration and Rollout

### Migration Path

**For existing docket users:**
- No breaking changes to existing commands
- `specs/` directory is new, doesn't affect existing docs
- `--include-specs` flag is optional on audit
- Existing workflows continue unchanged

**Adoption is opt-in:**
- Projects can use specs or not
- Start with one spec, add more over time
- No requirement to spec everything

### Rollout Plan

**Phase 1: Foundation (2-3 days)**
- Create spec template in `templates/spec-template.md`
- Implement `docket spec new` command
- Add `specs/` to init directory structure
- Basic documentation in README

**Phase 2: Dogfooding (1 week)**
- Create specs for docket's core commands:
  - `specs/analyze-command.spec.md`
  - `specs/audit-command.spec.md`
  - `specs/review-command.spec.md`
- Validate format works for our use case
- Refine template based on experience
- Test agent consumption (can Claude/Cursor/Aider use them?)

**Phase 3: Integration (2-3 days)**
- Implement `--include-specs` flag in audit command
- Add spec detection to review command
- Update `docs/README.md` to explain specs
- Create example specs in documentation

**Phase 4: Publish (when ready)**
- Include in next npm release
- Announce feature to users
- Create blog post or guide on spec-driven development

### Backward Compatibility

**No breaking changes:**
- All existing commands work unchanged
- New functionality is additive only
- Optional flags don't affect default behavior

## Documentation Plan

### User-Facing Documentation
- README: Add "Behavioral Specifications" section
- Guide: "Writing Specifications for Agent-Driven Development"
- Examples: Show 2-3 real specs from docket itself

### Internal Documentation
- ADR documenting decision to add specs (after RFC accepted)
- Architecture overview: Update with specs in documentation types
- Agent protocol guide: Reference specs as behavior contracts

### Template Documentation
- Inline comments in spec template explaining each section
- Examples within template showing concrete usage

## Open Questions

1. **Numbering vs. naming:** Should specs support numbering (spec-0001) as alternative to descriptive names?
   - Current decision: Descriptive only
   - Could support both in future if needed

2. **Cross-reference validation:** Should docket validate that specs link to real ADRs/RFCs?
   - Defer to future: Nice-to-have, not Phase 1
   - Could add to `docket review` later

3. **Spec templates for different types:** Should we have different templates (CLI command spec, API spec, library spec)?
   - Start with one general template
   - Evaluate after dogfooding if specialization needed

4. **Integration with test frameworks:** Should docket help generate test scaffolding from specs?
   - Defer to future: Focus on documentation first
   - Agents can generate tests from specs manually

5. **Spec versioning:** How to handle major behavior changes to a spec?
   - Keep history in git (normal version control)
   - Use status: deprecated for old behavior
   - Create new spec file for major rewrites?

## Future Possibilities

This RFC focuses on basic behavioral specification support, but future work could include:

### Phase 4+ Enhancements

1. **Spec-to-test scaffolding:** Generate test templates from Given/When/Then scenarios
2. **Cross-reference validation:** Verify links between specs, ADRs, RFCs, and code
3. **Spec coverage analysis:** Detect which code files lack specs
4. **Smart organization:** `docket audit` suggests subdirectory structure at 10+ specs
5. **Multiple format support:** Allow alternative formats (pure Gherkin, RSpec-style) via templates
6. **Spec search:** `docket search "authentication"` finds relevant specs
7. **Spec status automation:** Auto-detect when implementation changes after spec marked "implemented"
8. **MCP integration:** When MCP server exists (RFC-0001), expose specs via MCP for richer agent queries

### Complementary Features

- **Traceability matrix:** Visual map of spec → implementation → ADR relationships
- **AI-assisted spec generation:** Generate draft specs from existing code
- **Spec validation rules:** Ensure specs have minimum required sections
- **Spec review workflow:** Track spec approvals before implementation

## References

### Related Docket Documentation
- [ADR-0003: Agent-Agnostic Architecture](/Users/tnez/Code/tnez/docket/docs/adr/adr-0003-agent-agnostic-architecture.md) - Why JSON output and protocol matter
- [RFC-0001: MCP Server Integration](/Users/tnez/Code/tnez/docket/docs/rfcs/rfc-0001-mcp-server-for-agent-integration.md) - Future richer agent integration
- [Research: Behavioral Specifications Investigation](/Users/tnez/Code/tnez/docket/docs/research/behavioral-specifications-investigation.md) - Comprehensive format analysis

### External Resources
- [Gherkin Reference](https://cucumber.io/docs/gherkin/) - Given/When/Then syntax
- [AGENTS.md Standard](https://github.com/openai/agents.md) - 2025 agent context standard
- [Specification by Example](https://gojkoadzic.com/books/specification-by-example/) - Book on behavior specifications
- [BDD in Action](https://www.manning.com/books/bdd-in-action-second-edition) - Behavior-driven development practices

### Community Examples
- [Cucumber Project Documentation](https://cucumber.io/docs/bdd/) - BDD best practices
- [RSpec Documentation](https://rspec.info/) - Describe-it pattern examples
- [OpenAPI Specification](https://swagger.io/specification/) - API contract standard

