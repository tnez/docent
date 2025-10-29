---
name: rfc
description: Request for Comments for proposing significant changes or features
type: single-file
author: docent
version: 1.0.0
tags: [rfc, proposal, architecture, planning]

variables:
  - name: number
    description: RFC number (e.g., "0001")
    type: string
    required: false
  - name: title
    description: Short descriptive title
    type: string
    required: true
  - name: date
    description: Creation date
    type: string
    default: "{{today}}"
---
# RFC-{{number}}: {{title}}

**Status:** Draft | In Review | Accepted | Rejected | Implemented
**Author:** [Your name]
**Created:** {{date}}
**Updated:** {{date}}

---

## Summary

> One-paragraph explanation of the proposal

Brief summary of what this RFC proposes. What problem does it solve? What is the high-level approach?

---

## Motivation

### Problem Statement

Describe the problem this RFC addresses:

- What pain points exist today?
- Who is affected?
- What are the consequences of not solving this?

### Goals

What we want to achieve:

- Goal 1
- Goal 2
- Goal 3

### Non-Goals

What we explicitly do NOT intend to address:

- Non-goal 1
- Non-goal 2

---

## Detailed Design

### Overview

High-level description of the proposed solution.

### Architecture

Describe the system architecture or design:

- Components and their responsibilities
- How components interact
- Data flow
- Key interfaces

### Implementation Details

Specific technical details:

- APIs or interfaces
- Data structures
- Algorithms
- Configuration changes
- Database schema changes (if applicable)

### Code Examples

```
// Example code showing how the feature would be used
function example() {
  // Demonstrate the proposed API or behavior
}
```

### User Experience

How will users interact with this feature?

- What workflows change?
- What new capabilities are enabled?
- What documentation is needed?

---

## Trade-offs and Alternatives

### Trade-offs

**Advantages of this approach:**

- Advantage 1
- Advantage 2

**Disadvantages of this approach:**

- Disadvantage 1
- Disadvantage 2

### Alternative 1: [Name]

**Description:** Brief description

**Pros:**

- Pro 1
- Pro 2

**Cons:**

- Con 1
- Con 2

**Why not chosen:** Explanation

---

## Security Considerations

> What are the security implications of this design?

- Security consideration 1
- Security consideration 2
- Mitigations

---

## Performance Considerations

> How does this design impact performance?

- Performance impact 1
- Performance impact 2
- Benchmarks or estimates (if available)

---

## Testing Strategy

> How will we test this?

- Unit tests
- Integration tests
- Performance tests
- Manual testing scenarios

---

## Migration and Rollout

### Migration Path

For existing users/systems:

- Step 1
- Step 2
- Step 3

### Rollout Plan

How we'll deploy this feature:

- Phase 1: [Description]
- Phase 2: [Description]

### Backward Compatibility

- Breaking changes (if any)
- Deprecation timeline
- Support for existing behavior

---

## Documentation Plan

> What documentation needs to be created or updated?

- User-facing documentation
- API documentation
- Migration guides
- Examples and tutorials

---

## Open Questions

> What aspects of the design are still being debated or need more research?

- Question 1?
- Question 2?

---

## Future Possibilities

> What future work could build on this?

This RFC focuses on [core functionality], but future work could include:

- Future possibility 1
- Future possibility 2

---

## References

> Links to related resources, discussions, documentation

- [Related RFC](link)
- [External documentation](link)
- [Discussion thread](link)
- [Prototype or POC](link)

---

## Notes

**When to Write an RFC:**

- New features requiring design discussion
- Breaking changes to APIs or interfaces
- Significant refactoring efforts
- Cross-cutting concerns affecting multiple areas
- Experimental features needing validation

**Status Definitions:**

- **Draft:** Initial version, still being written
- **In Review:** Ready for feedback
- **Accepted:** Approved for implementation
- **Rejected:** Not approved (kept for reference)
- **Implemented:** Feature has been built and shipped
