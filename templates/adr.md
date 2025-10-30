---
name: adr
description: Architecture Decision Record for documenting significant decisions
type: single-file
author: docent
version: 1.0.0
tags: [architecture, decision, documentation, adr]
directory: decisions
filename_prefix: adr


use_when: |
  Use this template when documenting significant technical or architectural decisions:
  - Uses decision language (decided, chose, selected, going with, adopting)
  - Explains tradeoffs between alternatives
  - Documents why one approach was chosen over others
  - Has lasting impact on system architecture or design
  - Needs to be referenced in the future to understand "why we built it this way"

examples:
  - "Decided to use Postgres over MongoDB because we need ACID transactions"
  - "Chose microservices architecture to enable independent team scaling"
  - "Selected React over Vue due to team expertise and ecosystem maturity"
  - "Adopted event sourcing for audit trail and temporal query requirements"

variables:
  - name: number
    description: ADR number (e.g., "0001")
    type: string
    required: false
  - name: title
    description: Short descriptive title
    type: string
    required: true
  - name: date
    description: Decision date
    type: string
    default: "{{today}}"
---
# ADR-{{number}}: {{title}}

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** {{date}}
**Deciders:** [Names or "solo"]

---

## Context

> What is the issue we're seeing that motivates this decision or change?

Describe the context and problem statement:

- What forces are at play?
- What are the technical, business, or organizational factors?
- What constraints exist?

---

## Decision

> What is the change we're proposing/making?

State the decision clearly and concisely:

- What are we doing?
- Why this approach over alternatives?

---

## Consequences

> What becomes easier or more difficult because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Trade-off 1
- Trade-off 2

### Neutral

- Change 1

---

## Alternatives Considered

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

## Implementation Notes

> Technical details, migration path, rollout strategy

- Implementation detail 1
- Implementation detail 2
- Migration considerations
- Rollback plan (if applicable)

---

## References

> Links to related resources, discussions, documentation

- [Related ADR](link)
- [Discussion](link)
- [Documentation](link)

---

## Notes

**When to Create an ADR:**

- Architecture and system design
- Technology choices (languages, frameworks, databases)
- Development processes and workflows
- API design and contracts
- Security approaches

**Status Definitions:**

- **Proposed:** Under discussion, not yet decided
- **Accepted:** Decision made and approved
- **Deprecated:** No longer valid but kept for reference
- **Superseded:** Replaced by a newer ADR (link to it)
