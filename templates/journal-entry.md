---
name: journal-entry
description: Daily work journal entry with structured sections
type: single-file
author: docent
version: 1.0.0
tags: [journal, daily, productivity, personal]
directory: journals
filename_prefix: journal


use_when: |
  Use this template for quick daily reflections and notes:
  - End-of-day summaries
  - Brief captures of what you worked on
  - Quick learnings or discoveries
  - Uses reflective language (learned, noticed, discovered)
  - Personal notes about progress and blockers
  - Less structured than session notes, more casual tone

examples:
  - "Learned that Redis requires AOF persistence for durability"
  - "Noticed the API rate limit is 100 requests per hour"
  - "Discovered a useful pattern for handling async errors"
  - "Today worked on refactoring the auth module"

variables:
  - name: date
    description: Entry date
    type: string
    default: "{{today}}"
---
# Journal - {{date}}

## What I did

> Document what you worked on today

## What I learned

> Key discoveries, insights, or learnings

## What's next

> Prioritized tasks for tomorrow or next session

## Questions/Blockers

> Open questions or obstacles that need resolution
