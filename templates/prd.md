---
name: prd
description: Product Requirements Document for planning features and products
type: single-file
author: docent
version: 1.0.0
tags: [prd, product, planning, requirements]

variables:
  - name: number
    description: PRD number (e.g., "0001")
    type: string
    required: false
  - name: title
    description: Product or feature title
    type: string
    required: true
  - name: date
    description: Creation date
    type: string
    default: "{{today}}"
---
# PRD-{{number}}: {{title}}

**Status:** Draft | In Progress | Review | Approved | Shipped
**Author:** [Your name]
**Created:** {{date}}
**Updated:** {{date}}

---

## Executive Summary

> One-paragraph overview: What is this? Why does it matter? What's the high-level approach?

Brief summary of the product vision, the problem it solves, and the value it delivers.

---

## Problem Statement

### User Pain Points

What problems do users face today?

- Pain point 1
- Pain point 2
- Pain point 3

### Current State

How do users solve this problem today?

- Current approach 1
- Current approach 2
- Limitations of current approaches

### Impact

What are the consequences of not solving this?

- Impact on productivity
- Impact on quality
- Impact on user satisfaction
- Opportunity cost

---

## User Personas

### Persona 1: [Name]

**Who they are:**

- Role/title
- Technical level
- Goals and motivations

**Their needs:**

- What they need to accomplish
- What frustrates them
- What would make them successful

---

## Product Vision

### What We're Building

High-level description of the product or feature:

- Core concept
- Key differentiators
- How it solves the problem

### Why Now

Why is this the right time?

- Market trends
- Technology enablers
- User readiness
- Competitive landscape

---

## Success Metrics

### Primary Metrics

Key indicators that this is successful:

- Metric 1: [Description] - Target: [Value]
- Metric 2: [Description] - Target: [Value]

### Secondary Metrics

Supporting indicators:

- Metric 1: [Description]
- Metric 2: [Description]

### Success Criteria

What does "done" and "successful" look like?

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Requirements

### Must Have (P0)

Features that are absolutely required for launch:

1. **Feature 1**
   - Description
   - Why it's required
   - Acceptance criteria

2. **Feature 2**
   - Description
   - Why it's required
   - Acceptance criteria

### Should Have (P1)

Important but not critical for initial launch:

1. **Feature 3**
   - Description
   - Why it's valuable
   - Can be delayed to post-launch

### Nice to Have (P2)

Desirable but can be deferred:

1. **Feature 4**
   - Description
   - Why it's nice to have
   - Timeline for consideration

---

## User Experience

### User Flows

#### Flow 1: [Primary User Journey]

1. User starts at [entry point]
2. User does [action]
3. System responds with [result]
4. User completes [goal]

#### Flow 2: [Secondary Journey]

1. Step 1
2. Step 2
3. Step 3

### Wireframes/Mockups

> Link to designs or describe key screens

- Screen 1: [Description]
- Screen 2: [Description]

---

## Technical Approach

### Architecture

High-level technical architecture:

- Components needed
- Data flow
- Integration points
- External dependencies

### Technical Requirements

- Performance requirements
- Scalability requirements
- Security requirements
- Compatibility requirements

### Technical Risks

- Risk 1: [Description and mitigation]
- Risk 2: [Description and mitigation]

---

## Timeline & Milestones

### Phase 1: Foundation

**Timeline:** [Dates]

- Milestone 1
- Milestone 2

### Phase 2: Core Features

**Timeline:** [Dates]

- Milestone 3
- Milestone 4

### Phase 3: Polish & Launch

**Timeline:** [Dates]

- Milestone 5
- Beta testing
- Launch

---

## Dependencies & Constraints

### Dependencies

What do we need from other teams/systems?

- Dependency 1
- Dependency 2

### Constraints

What limitations do we have?

- Time constraints
- Resource constraints
- Technical constraints
- Policy/compliance constraints

---

## Risks & Mitigation

### High Priority Risks

**Risk:** [Description]

- **Likelihood:** High | Medium | Low
- **Impact:** High | Medium | Low
- **Mitigation:** How we'll address it

### Medium Priority Risks

**Risk:** [Description]

- **Likelihood:** High | Medium | Low
- **Impact:** High | Medium | Low
- **Mitigation:** How we'll address it

---

## Go-to-Market

### Launch Strategy

How will we introduce this to users?

- Launch approach (big bang, phased rollout, beta)
- Communication plan
- Training/documentation needs

### Marketing & Communication

- Key messaging
- Target channels
- Success stories to highlight

---

## Open Questions

> Questions that need answers before we can proceed

- Question 1?
- Question 2?
- Question 3?

---

## Appendix

### Research & References

- User research findings
- Competitive analysis
- Market research
- Technical references

### Change Log

**{{date}}:** Initial version
