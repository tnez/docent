---
name: journal-entry
description: Daily work journal entry with structured sections
type: single-file
author: docent
version: 1.0.0
tags: [journal, daily, productivity, personal]

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
