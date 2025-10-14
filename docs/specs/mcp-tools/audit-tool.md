# Spec: Audit Tool (MCP)

## Metadata
- **Status:** draft
- **Created:** 2025-10-13
- **Updated:** 2025-10-13
- **Related:**
  - Implementation: `/Users/tnez/Code/tnez/docent/src/mcp/tools/audit.ts`
  - Core logic: `/Users/tnez/Code/tnez/docent/src/lib/auditor.ts`
  - Depends on: analyze tool for project analysis

## Context

The `audit` MCP tool provides agent-driven semantic documentation quality assessment. This tool generates a detailed prompt that enables an AI agent to deeply analyze documentation quality, coherence, completeness, and alignment with the codebase.

The tool is **context-aware**: a backend project needs API docs but a CLI tool doesn't, a project with tests needs testing docs, and multi-language projects need architecture documentation. Quality assessment is based on analyzing the project first, then providing structured guidance for semantic evaluation.

This tool helps agents provide comprehensive documentation quality feedback that goes beyond simple heuristics.

## Behaviors

### Scenario: Generate Quality Assessment Prompt
**Given:** A project with documentation that needs quality evaluation
**When:** Agent calls `audit` tool with project path
**Then:**
- Tool analyzes project structure and technology stack
- Scans docs/ directory for documentation files
- Generates structured prompt for agent-driven quality assessment
- Prompt includes:
  - Project context (languages, frameworks, structure)
  - Documentation inventory (files found)
  - Quality criteria based on project type
  - Expected documentation types for this project
  - Scoring guidance
- Returns prompt as string for agent to process

#### Example:
```typescript
// Agent calls tool to get assessment prompt
const prompt = await tools['audit']({
  path: "/path/to/project",
  docsDir: "docs"  // optional, defaults to "docs"
});

// Agent then processes the prompt to analyze documentation
const assessment = await agent.process(prompt);
```

### Scenario: Well-Documented Project Assessment
**Given:** A project with comprehensive documentation (architecture, ADRs, testing, API docs)
**When:** Agent processes quality assessment prompt
**Then:**
- Agent evaluates documentation against criteria
- Checks semantic coherence (not just presence)
- Validates accuracy against actual codebase
- Assesses completeness for project type
- Expected score: 80-100
- Expected feedback: Few or no critical gaps
- Recommendation: Maintain current quality

### Scenario: Project with Missing Critical Documentation
**Given:** A multi-language project with backend framework but no architecture or API docs
**When:** Agent processes quality assessment prompt
**Then:**
- Agent detects project has multiple languages and backend framework
- Identifies missing architecture and API docs as high-severity gaps
- Evaluates if existing docs accurately describe the system
- Expected score: 30-50
- Provides specific suggestions for each gap
- Recommends addressing high-priority items first

### Scenario: Context-Aware Assessment - Simple CLI Tool
**Given:** A simple CLI tool (single language, no backend framework, no tests)
**When:** Agent processes quality assessment for this project
**Then:**
- Does NOT flag missing API docs (not a backend project)
- Does NOT flag missing testing docs (no tests exist)
- Does NOT flag missing architecture docs (simple single-language project)
- Focuses on CLI-relevant documentation (usage, commands, configuration)

### Scenario: Context-Aware Assessment - Backend Service
**Given:** A backend service with Express/FastAPI but no API documentation
**When:** Agent processes quality assessment
**Then:**
- Detects backend framework (type: 'backend' or 'web')
- Flags missing API docs as HIGH severity
- Flags missing troubleshooting docs as MEDIUM severity
- Suggests documenting endpoints, authentication, and operational procedures

### Scenario: Context-Aware Assessment - Test Suite Exists
**Given:** A project with test/ or tests/ directory but no testing documentation
**When:** Agent processes quality assessment
**Then:**
- Uses project structure analysis to detect test directories
- Flags missing testing docs as HIGH severity (tests exist but undocumented)
- Suggests documenting testing philosophy, structure, and how to run tests

### Scenario: Custom Documentation Directory
**Given:** A project using a non-standard docs directory (e.g., "documentation")
**When:** Agent calls `audit` with docsDir parameter
**Then:**
- Scans "documentation/" instead of "docs/"
- All other behavior remains the same
- Quality assessment prompt references the custom directory

#### Example:
```typescript
const prompt = await tools['audit']({
  path: "/path/to/project",
  docsDir: "documentation"
});
```

### Scenario: No Documentation Directory
**Given:** A project that has no documentation directory
**When:** Agent calls `audit` tool
**Then:**
- Tool detects docs/ directory doesn't exist
- Generates prompt noting absence of documentation
- Prompt guides agent to recommend initial documentation setup
- Expected agent assessment: Score 0, suggest creating documentation structure

### Scenario: Semantic Quality Beyond Heuristics
**Given:** Documentation files exist but contain outdated or incorrect information
**When:** Agent processes quality assessment prompt
**Then:**
- Agent reads actual documentation content
- Compares documented frameworks/tools against actual project analysis
- Identifies semantic drift (docs say "Angular" but project uses "React")
- Evaluates whether examples in docs are accurate
- Checks if documented architecture matches actual structure
- This goes beyond heuristic checks (file exists = good) to semantic analysis

## Quality Assessment Criteria

The prompt generated by this tool guides agents to evaluate:

### Completeness
- Are all critical documentation types present for this project type?
- Do docs cover all major components/features?
- Are there undocumented subsystems?

### Accuracy
- Do documented frameworks match actual dependencies?
- Are code examples syntactically correct?
- Does architecture documentation reflect actual structure?

### Coherence
- Are naming conventions consistent across documents?
- Do documents link to each other appropriately?
- Is there internal consistency (no contradictions)?

### Depth
- Are explanations sufficiently detailed for the audience?
- Do docs explain "why" decisions were made, not just "what"?
- Are edge cases and limitations documented?

### Context-Appropriateness
- Is documentation level appropriate for project complexity?
- Are docs tailored to actual project type (CLI, backend, library, etc.)?
- Is depth appropriate (README for simple projects, full architecture for complex ones)?

## Acceptance Criteria
- [ ] Tool generates comprehensive assessment prompt based on project analysis
- [ ] Prompt includes project context (languages, frameworks, structure)
- [ ] Prompt includes documentation inventory (files found in docs/)
- [ ] Prompt provides context-aware quality criteria
- [ ] Context-aware expectations match project type (backend = API docs, tests = testing docs)
- [ ] Tool handles missing docs directory gracefully
- [ ] docsDir parameter allows custom documentation directories
- [ ] path parameter allows analyzing specified directories
- [ ] Prompt format enables structured agent assessment
- [ ] Prompt includes scoring guidance (0-100 scale)
- [ ] Prompt includes severity levels (high/medium/low)
- [ ] Generated prompt is valid and processable by AI agents
- [ ] Returns error for non-existent paths

## Technical Notes

**Assessment Prompt Generation:**
- First calls analyze tool to understand project
- Scans documentation directory for files
- Builds context about project type and complexity
- Generates structured prompt with:
  - Project overview (from analysis)
  - Documentation inventory (files and sizes)
  - Quality criteria (context-aware)
  - Expected documentation types
  - Scoring framework
  - Output format expectations

**Context-Aware Quality Rules:**
- Architecture (high): Required if `languages.length > 1` OR `frameworks.length > 2`
- ADRs (high): Required if `frameworks.length > 0`
- Standards (medium): Always suggested if languages detected
- Testing (high): Required if `structure.hasTests === true`
- API (high): Required if backend/web framework detected
- Troubleshooting (medium): Suggested if backend/web framework detected
- Onboarding (low): Always suggested

**Integration with Analysis:**
- Uses `analyzeProject()` to understand codebase
- Analysis results inform quality expectations
- Prompt includes full analysis context for agent

**Semantic vs Heuristic:**
- Heuristic audit (`audit` tool): Fast, file-based checks (file exists, size, format)
- Semantic audit (this tool): Agent-driven, content analysis, accuracy validation
- Use heuristic for CI/CD, semantic for comprehensive quality review

## Test Hints

**Unit Tests:**
- Test prompt generation with various project types (CLI, backend, library)
- Test context-aware criteria selection based on project analysis
- Test documentation inventory generation
- Test prompt structure and format validity

**Integration Tests:**
- Test against real projects with known documentation states
- Verify generated prompt produces consistent agent assessments
- Test docsDir parameter with non-standard directories
- Test path parameter with absolute and relative paths
- Validate that agent processing of prompt yields expected quality scores

**Edge Cases:**
- Empty docs directory (has directory but no files)
- Docs directory with only README.md
- Very large documentation trees (100+ files)
- Symlinks in docs directory
- Non-markdown files in docs directory
- Unicode filenames
- Projects with no recognized frameworks
- Multi-language polyglot projects
