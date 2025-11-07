# ADR-0002: Dogfooding Over Unit Tests for Template Classifier

**Status:** Accepted
**Date:** 2025-10-29
**Deciders:** @tnez

---

## Context

The template-classifier module was implemented as part of the `/docent:tell` MCP tool. The module handles:

- Loading template files from bundled and user directories
- Parsing YAML frontmatter to extract classification criteria
- Providing templates and guidance to agents for content classification

Standard practice would suggest writing unit tests for functions like `parseFrontmatter()` and integration tests for file I/O operations. However, the nature of this module and how it's used raised questions about the value of traditional testing approaches.

Key forces at play:

- Template loading is exercised on every `/docent:tell` invocation
- The system is used heavily during its own development (dogfooding)
- Unit tests for parsing functions would largely duplicate implementation logic
- File I/O integration tests are often brittle and require mocking
- Real-world usage provides more valuable validation than isolated tests

---

## Decision

Skip traditional unit and integration tests for the template-classifier module. Instead, rely on **dogfooding** and **pre-release manual validation**.

Validation approach:

1. **Dogfooding:** Use `/docent:tell` regularly during development
2. **Manual pre-release checklist:**
   - Verify `/tell` shows all bundled templates with use_when guidance
   - Confirm bundled templates load correctly from `/templates` directory
   - Test user templates in `.docent/templates/` override bundled ones correctly
   - Validate agent receives proper classification instructions
   - Ensure created files land in correct directories with proper naming
   - Verify custom template examples work as documented

Future consideration: Agent-driven acceptance tests when test infrastructure exists.

---

## Consequences

### Positive

- Reduces test maintenance burden for low-value tests
- Dogfooding validates real-world usage patterns
- Avoids brittle file I/O mocking
- Focuses development effort on features rather than test infrastructure
- Real usage catches edge cases better than isolated unit tests
- Faster iteration during development

### Negative

- Less deterministic validation - requires human review
- No automated regression detection for this module
- Requires discipline to actually perform pre-release checklist
- New contributors may be uncertain about how to validate changes
- Risk of shipping bugs if checklist is skipped

### Neutral

- Manual checklist must be maintained and updated as features evolve
- Test strategy may need revisiting as project matures

---

## Alternatives Considered

### Alternative 1: Traditional Unit Tests for parseFrontmatter()

**Description:** Write unit tests that validate YAML frontmatter parsing logic with various inputs.

**Pros:**

- Automated validation
- Catches regressions automatically
- Standard practice, familiar to contributors

**Cons:**

- Low value - tests would largely duplicate implementation
- Parsing logic is straightforward, unlikely to break
- Doesn't validate actual template loading or file I/O
- Maintenance overhead for tests that rarely catch bugs

**Why not chosen:** Tests would be low-value and largely redundant with implementation.

### Alternative 2: Integration Tests for File I/O

**Description:** Write integration tests that create mock file systems, load templates, and validate behavior.

**Pros:**

- Tests full template loading pipeline
- Validates file system interactions

**Cons:**

- Brittle - file system mocking is complex and fragile
- Adds significant test infrastructure complexity
- Low confidence - mocked file systems don't match real usage
- Real-world usage via dogfooding is more valuable
- High maintenance burden

**Why not chosen:** File I/O integration tests are brittle and add little confidence compared to real usage.

---

## Implementation Notes

This decision applies specifically to the `template-classifier` module (`src/core/template-classifier.ts`). Other modules may still benefit from traditional testing approaches.

The pre-release manual checklist lives in: `.docent/journals/2025-10-29-pre-release-requirements.md`

Before each release, the checklist must be executed and results documented.

Migration considerations:

- No migration needed - tests were never written
- If this decision proves problematic, can add tests later without breaking changes

Rollback plan:

- If bugs become frequent, revisit and add targeted tests for problem areas
- Agent-driven acceptance tests may be valuable future addition

---

## References

- Journal entry: `.docent/journals/2025-10-29-pre-release-requirements.md`
- Template classifier implementation: `src/core/template-classifier.ts`
- Related tool: `src/mcp/tools/tell.ts`
- Example templates: `templates/*.md`

---
