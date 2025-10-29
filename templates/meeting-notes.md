---
name: meeting-notes
description: Meeting notes with agenda, discussion points, decisions, and action items
type: single-file
author: docent
version: 1.0.0
tags: [meeting, notes, productivity, collaboration]

variables:
  - name: date
    description: Meeting date
    type: string
    default: "{{today}}"
  - name: topic
    description: Meeting topic or title
    type: string
    required: false
---
# Meeting Notes{{#if topic}} - {{topic}}{{/if}}

**Date:** {{date}}
**Attendees:** [Names or just "solo" for personal sessions]

---

## Agenda

> What we intended to discuss

- Topic 1
- Topic 2
- Topic 3

---

## Discussion

### Topic 1

> Key points discussed

- Point made
- Idea shared
- Question raised

### Topic 2

> More discussion

---

## Decisions Made

> Important conclusions or agreements reached

**Decision:** [Brief title]

- **Details:** What was decided
- **Owner:** Who's responsible (if applicable)
- **Deadline:** When (if applicable)

---

## Action Items

> Tasks that came out of this meeting

- [ ] Action item 1 - **Owner:** [Name] - **Due:** [Date]
- [ ] Action item 2 - **Owner:** [Name] - **Due:** [Date]
- [ ] Action item 3 - **Owner:** [Name] - **Due:** [Date]

---

## Open Questions

> Questions that need follow-up

- Question 1?
- Question 2?

---

## Next Meeting

**Date:** [When]
**Topics:** [What to discuss]

---

## Notes & Context

> Additional context, links, or observations

- Note 1
- Link to relevant doc
- Context about decision
