# RFC-NNNN: [Short descriptive title]

**Status:** [Draft | In Review | Accepted | Rejected | Implemented]
**Author:** [Your name/username]
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD
**Tracking Issue:** [Link to issue] (optional)

## Summary

<!-- One-paragraph explanation of the proposal -->

Brief summary of what this RFC proposes. What problem does it solve? What is the high-level approach?

## Motivation

<!-- Why are we doing this? What use cases does it support? What problems does it solve? -->

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

## Detailed Design

<!-- This is the bulk of the RFC. Explain the design in enough detail for someone familiar with the project to understand and implement. -->

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

## Trade-offs and Alternatives

<!-- What other designs were considered? What are the pros/cons of this approach? -->

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

### Alternative 2: [Name]

**Description:** Brief description

**Pros:**

- Pro 1
- Pro 2

**Cons:**

- Con 1
- Con 2

**Why not chosen:** Explanation

## Security Considerations

<!-- What are the security implications of this design? -->

- Security consideration 1
- Security consideration 2
- Mitigations

## Performance Considerations

<!-- How does this design impact performance? -->

- Performance impact 1
- Performance impact 2
- Benchmarks or estimates (if available)

## Testing Strategy

<!-- How will we test this? -->

- Unit tests
- Integration tests
- Performance tests
- Manual testing scenarios

## Migration and Rollout

<!-- How will we deploy this? Is there a migration path for existing users? -->

### Migration Path

For existing users/systems:

- Step 1
- Step 2
- Step 3

### Rollout Plan

How we'll deploy this feature:

- Phase 1: [Description]
- Phase 2: [Description]
- Phase 3: [Description]

### Backward Compatibility

- Breaking changes (if any)
- Deprecation timeline
- Support for existing behavior

## Documentation Plan

<!-- What documentation needs to be created or updated? -->

- User-facing documentation
- API documentation
- Migration guides
- Examples and tutorials

## Open Questions

<!-- What aspects of the design are still being debated or need more research? -->

- Question 1?
- Question 2?
- Question 3?

## Future Possibilities

<!-- What future work could build on this? -->

This RFC focuses on [core functionality], but future work could include:

- Future possibility 1
- Future possibility 2
- Future possibility 3

## References

<!-- Links to related resources, discussions, documentation -->

- [Related RFC](rfc-0000.md)
- [External documentation](https://example.com)
- [Discussion thread](https://example.com)
- [Prototype or POC](https://example.com)

---

## Template Usage Notes

### When to Write an RFC

Write an RFC for:

- New features requiring design discussion
- Breaking changes to APIs or interfaces
- Significant refactoring efforts
- Cross-cutting concerns affecting multiple areas
- Experimental features needing validation

### RFC Process

1. **Draft:** Author writes initial proposal
2. **Review:** Team provides feedback (1-2 weeks)
3. **Revision:** Author addresses feedback and updates RFC
4. **Final Comment Period:** Last chance for objections
5. **Decision:** RFC is accepted or rejected
6. **Implementation:** If accepted, work begins

### Numbering Convention

- Use sequential numbering: RFC-0001, RFC-0002, etc.
- Zero-pad to 4 digits for proper sorting
- Number is assigned when RFC is created, not when accepted

### Status Definitions

- **Draft:** Initial version, still being written
- **In Review:** Ready for team review and feedback
- **Accepted:** Approved for implementation
- **Rejected:** Not approved (keep for historical reference)
- **Implemented:** Feature has been built and shipped

### Writing Tips

- **Start with motivation:** Clearly explain the problem
- **Show alternatives:** Demonstrate you've considered options
- **Be specific:** Include code examples and diagrams
- **Address concerns:** Cover security, performance, testing
- **Keep it living:** Update as design evolves during review
- **Link liberally:** Reference related RFCs, issues, docs
- **Future file references:** RFCs may reference files that don't exist yet - this is expected for proposals describing future implementations
