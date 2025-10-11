# Template: Developer Onboarding

## Overview

This document provides the template for "Developer Onboarding" documentation. It guides new team members through their first days and weeks, helping them become productive contributors quickly.

---

## Template Structure

### Frontmatter

```yaml
---
title: Developer Onboarding
description: Guide for new developers joining the project
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: new contributors
related:
  - writing-software.md
  - standards.md
  - contributing/development.md
---
```

### Document Outline

```markdown
# Developer Onboarding

> **Purpose**: Welcome to {{PROJECT_NAME}}! This guide will help you get up to speed quickly. Follow the checklists for your first day, week, and month to become a productive contributor.

---

## Table of Contents

1. [Welcome](#welcome)
2. [Before Your First Day](#before-your-first-day)
3. [Day 1: Getting Started](#day-1-getting-started)
4. [Week 1: Learning the Codebase](#week-1-learning-the-codebase)
5. [Month 1: Becoming Productive](#month-1-becoming-productive)
6. [Learning Resources](#learning-resources)
7. [Who to Ask](#who-to-ask)
8. [Common Gotchas](#common-gotchas)

---

## Welcome

Welcome to the {{PROJECT_NAME}} team! We're excited to have you here.

### What This Project Does

[TODO: Brief description of the project]

{{PROJECT_NAME}} is {{PROJECT_DESCRIPTION}}. It helps {{TARGET_USERS}} {{SOLVE_WHAT_PROBLEM}}.

### Our Team Culture

[TODO: Describe your team culture and values]

- **Collaborative**: We solve problems together
- **Curious**: We ask questions and learn continuously
- **Pragmatic**: We ship working software
- **Supportive**: We help each other succeed

### What to Expect

Your first month will look like:

- **Week 1**: Setup, codebase exploration, small fixes
- **Week 2-3**: First feature or substantial contribution
- **Week 4**: Fully productive, participating in reviews and planning

Don't worry if it feels overwhelming at first. Everyone does. Ask questions liberally.

---

## Before Your First Day

### Accounts and Access

[TODO: List accounts needed and how to request them]

Make sure you have access to:

- [ ] **GitHub** - Repository access
- [ ] **{{COMMUNICATION_TOOL}}** - Team communication (Slack/Discord/etc.)
- [ ] **{{PROJECT_MANAGEMENT_TOOL}}** - Issue tracking (GitHub Issues/Jira/etc.)
- [ ] **{{CI_CD_PLATFORM}}** - CI/CD pipeline access
- [ ] **{{DEPLOYMENT_PLATFORM}}** - Production/staging environment access (if applicable)
- [ ] **{{DOCS_PLATFORM}}** - Documentation platform (if separate)

**How to Request Access**: {{ACCESS_REQUEST_PROCESS}}

### Required Tools

[TODO: List required tools and installation links]

Install these tools before your first day:

- [ ] **{{EDITOR_OR_IDE}}** - Code editor ([download]({{EDITOR_LINK}}))
- [ ] **{{LANGUAGE_RUNTIME}}** - Language runtime (e.g., Node.js, Python, Rust)
- [ ] **{{PACKAGE_MANAGER}}** - Package manager (e.g., npm, cargo, pip)
- [ ] **Git** - Version control ([download](https://git-scm.com/))
- [ ] **{{DATABASE_TOOL}}** - Database client (if applicable)
- [ ] **{{ADDITIONAL_TOOL}}** - Other required tools

**Installation Guide**: See [Development Setup](./contributing/development.md)

---

## Day 1: Getting Started

### Morning: Environment Setup

**Goal**: Get the project running on your machine.

#### 1. Clone the Repository

```bash
git clone {{REPOSITORY_URL}}
cd {{REPOSITORY_NAME}}
```

#### 2. Install Dependencies

```bash
{{INSTALL_COMMAND}}
```

[TODO: Document any special setup steps]

#### 3. Configure Environment

[TODO: Describe environment configuration]

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with required values
# See [Configuration Guide]({{CONFIG_DOC_LINK}}) for details
```

Required environment variables:
- `{{ENV_VAR_1}}` - {{DESCRIPTION}}
- `{{ENV_VAR_2}}` - {{DESCRIPTION}}

**Where to Get Values**: {{WHERE_TO_GET_VALUES}}

#### 4. Run Database Migrations (if applicable)

```bash
{{MIGRATION_COMMAND}}
```

#### 5. Start the Development Server

```bash
{{DEV_SERVER_COMMAND}}
```

You should see:
```
{{EXPECTED_OUTPUT}}
```

Visit: {{DEV_SERVER_URL}}

#### 6. Run Tests

```bash
{{TEST_COMMAND}}
```

All tests should pass. If not, ask for help.

✅ **Checkpoint**: Project running locally, tests passing.

### Afternoon: Code Exploration

**Goal**: Understand the codebase structure.

#### 1. Read Core Documentation

Read these documents in order:

1. [README.md](../README.md) - Project overview
2. [How We Write Software](./writing-software.md) - Development philosophy
3. [Code Standards](./standards.md) - Coding conventions
4. [Architecture](./concepts/architecture.md) - System architecture

Take notes. You'll reference these often.

#### 2. Explore the Codebase

[TODO: Provide a guided tour of key files/directories]

Start with these files to understand the codebase:

```
{{PROJECT_STRUCTURE}}
```

**Key Files to Read**:
- `{{KEY_FILE_1}}` - {{DESCRIPTION}}
- `{{KEY_FILE_2}}` - {{DESCRIPTION}}
- `{{KEY_FILE_3}}` - {{DESCRIPTION}}

**Exercise**: Find where {{EXAMPLE_FEATURE}} is implemented. Trace the code from {{ENTRY_POINT}} to {{END_POINT}}.

#### 3. Run the Application

[TODO: Provide hands-on exercises]

Try these workflows:

1. **{{WORKFLOW_1}}**: {{DESCRIPTION}}
   - Steps: {{STEPS}}
   - What happens: {{EXPECTED_BEHAVIOR}}

2. **{{WORKFLOW_2}}**: {{DESCRIPTION}}
   - Steps: {{STEPS}}
   - What happens: {{EXPECTED_BEHAVIOR}}

#### 4. Make Your First Change

**Exercise**: Fix a typo or improve documentation.

1. Create a branch: `git checkout -b {{YOUR_NAME}}/first-contribution`
2. Make a small change (fix typo, improve comment, etc.)
3. Commit: `git commit -m "docs: fix typo in onboarding.md"`
4. Push: `git push -u origin {{YOUR_NAME}}/first-contribution`
5. Create a pull request
6. Request review from your onboarding buddy

This gets you familiar with the contribution workflow.

✅ **Checkpoint**: First PR created.

---

## Week 1: Learning the Codebase

### Day 2: Pick Up a Starter Issue

**Goal**: Complete your first real contribution.

#### Find a Good First Issue

[TODO: Link to good first issues]

Look for issues tagged with:
- `good first issue`
- `beginner-friendly`
- `documentation`

**Recommended First Issues**:
- {{ISSUE_TYPE_1}}: {{DESCRIPTION}}
- {{ISSUE_TYPE_2}}: {{DESCRIPTION}}

Ask your onboarding buddy to recommend an issue.

#### Work on the Issue

1. **Understand the problem** - Read the issue thoroughly, ask questions
2. **Plan your approach** - Discuss with your buddy before coding
3. **Implement** - Follow [code standards](./standards.md) and [patterns](./patterns.md)
4. **Test** - Write tests, run existing tests
5. **Document** - Update relevant documentation
6. **Submit PR** - Create PR with clear description
7. **Respond to review** - Address feedback constructively

✅ **Checkpoint**: First real contribution merged.

### Day 3-5: Explore Different Areas

**Goal**: Get exposure to different parts of the codebase.

[TODO: Suggest areas to explore based on your architecture]

Spend time exploring:

**Day 3**: {{AREA_1}}
- Read: {{DOCS_TO_READ}}
- Explore: {{CODE_TO_EXPLORE}}
- Exercise: {{HANDS_ON_TASK}}

**Day 4**: {{AREA_2}}
- Read: {{DOCS_TO_READ}}
- Explore: {{CODE_TO_EXPLORE}}
- Exercise: {{HANDS_ON_TASK}}

**Day 5**: {{AREA_3}}
- Read: {{DOCS_TO_READ}}
- Explore: {{CODE_TO_EXPLORE}}
- Exercise: {{HANDS_ON_TASK}}

### End of Week 1 Checklist

By end of week 1, you should have:

- [ ] Environment set up and working
- [ ] Read core documentation
- [ ] Explored major areas of codebase
- [ ] Completed 1-2 starter issues
- [ ] Created 2-3 PRs
- [ ] Participated in code reviews (as author)
- [ ] Attended team meetings/standups
- [ ] Met the team

✅ **Checkpoint**: Comfortable navigating codebase, completed first contributions.

---

## Month 1: Becoming Productive

### Week 2: First Feature

**Goal**: Implement a small feature or substantial bug fix.

[TODO: Describe typical Week 2 tasks]

Work with your onboarding buddy to:
- Pick a feature-level issue
- Design the approach
- Implement with tests and docs
- Get it reviewed and merged

This is where you start working more independently.

### Week 3: Participate in Reviews

**Goal**: Start reviewing others' PRs.

[TODO: Guide for first reviews]

Code review is a great way to learn:

1. **Pick small PRs** - Start with documentation or small changes
2. **Ask questions** - Use code review to learn, not just critique
3. **Look for learning opportunities** - Note patterns and practices
4. **Be kind** - See [Code Review Practices](./code-review.md)

You don't need to be an expert to review. Fresh eyes catch different things.

### Week 4: Full Participation

**Goal**: Operate as a full team member.

By week 4, you should be:

- [ ] Picking up issues independently
- [ ] Participating in planning/grooming
- [ ] Reviewing PRs regularly
- [ ] Contributing to discussions
- [ ] Mentoring newer members (if any)

### End of Month 1 Checklist

By end of month 1, you should have:

- [ ] Implemented 2-3 features or substantial fixes
- [ ] Reviewed 5+ PRs
- [ ] Comfortable with development workflow
- [ ] Understand core architecture and patterns
- [ ] Know who to ask for different topics
- [ ] Contributing to team discussions
- [ ] Comfortable with team culture and norms

✅ **Checkpoint**: Fully productive team member.

---

## Learning Resources

### Essential Reading

[TODO: Link to essential documentation]

**Must Read** (if you haven't already):
1. [How We Write Software](./writing-software.md)
2. [Code Standards](./standards.md)
3. [High-Level Patterns](./patterns.md)
4. [Testing](./testing.md)
5. [Code Review Practices](./code-review.md)

**Architecture**:
1. [Architecture Overview](./concepts/architecture.md)
2. [Design Decisions](./concepts/design-decisions.md)
3. [API Reference](./reference/api/)

**Workflows**:
1. [Development Process](./contributing/development.md)
2. [Deployment Guide](./guides/deployment.md)
3. [Troubleshooting](./guides/troubleshooting.md)

### External Resources

[TODO: Link to external learning resources]

**{{LANGUAGE}} Resources**:
- [{{RESOURCE_NAME}}]({{URL}}) - {{DESCRIPTION}}
- [{{RESOURCE_NAME}}]({{URL}}) - {{DESCRIPTION}}

**{{FRAMEWORK}} Resources**:
- [{{RESOURCE_NAME}}]({{URL}}) - {{DESCRIPTION}}
- [{{RESOURCE_NAME}}]({{URL}}) - {{DESCRIPTION}}

**General Software Development**:
- [{{RESOURCE_NAME}}]({{URL}}) - {{DESCRIPTION}}
- [{{RESOURCE_NAME}}]({{URL}}) - {{DESCRIPTION}}

### Project-Specific Knowledge

[TODO: Document tribal knowledge that's not written elsewhere]

**Things You'll Learn Over Time**:

1. **{{KNOWLEDGE_ITEM_1}}**: {{DESCRIPTION}}
   - Why it matters: {{WHY}}
   - Where to find it: {{WHERE}}

2. **{{KNOWLEDGE_ITEM_2}}**: {{DESCRIPTION}}
   - Why it matters: {{WHY}}
   - Where to find it: {{WHERE}}

---

## Who to Ask

### Your Onboarding Buddy

[TODO: Describe onboarding buddy system]

**Your buddy**: {{BUDDY_NAME}} ({{BUDDY_CONTACT}})

Your onboarding buddy is your primary point of contact for:
- Questions about the codebase
- Help getting unstuck
- Guidance on good first issues
- Code review feedback
- General team questions

Don't hesitate to ask questions. That's what they're here for.

### Domain Experts

[TODO: List domain experts and their areas]

For specific areas, ask these people:

| Area | Expert | Contact |
|------|--------|---------|
| {{DOMAIN_1}} | {{EXPERT_NAME}} | {{CONTACT}} |
| {{DOMAIN_2}} | {{EXPERT_NAME}} | {{CONTACT}} |
| {{DOMAIN_3}} | {{EXPERT_NAME}} | {{CONTACT}} |
| {{INFRASTRUCTURE}} | {{EXPERT_NAME}} | {{CONTACT}} |
| {{FRONTEND}} | {{EXPERT_NAME}} | {{CONTACT}} |
| {{BACKEND}} | {{EXPERT_NAME}} | {{CONTACT}} |

### Team Communication

[TODO: Describe communication channels]

**Channels**:
- `#{{GENERAL_CHANNEL}}` - General team discussion
- `#{{DEV_CHANNEL}}` - Development questions
- `#{{HELP_CHANNEL}}` - Ask for help
- `#{{RANDOM_CHANNEL}}` - Non-work chat

**When to Use What**:
- **Quick questions**: Post in relevant channel
- **Detailed help**: DM your buddy or domain expert
- **Blocked on issue**: Post in `#{{HELP_CHANNEL}}`
- **Discussion needed**: Schedule a call or meeting

**Response Times**:
- Not everyone is online all the time
- If no response in {{RESPONSE_TIME}}, follow up
- For urgent issues, {{ESCALATION_PROCESS}}

---

## Common Gotchas

[TODO: Document common mistakes and confusions for new team members]

### Gotcha 1: {{GOTCHA_NAME}}

**Problem**: {{WHAT_GOES_WRONG}}

**Why It Happens**: {{EXPLANATION}}

**Solution**: {{HOW_TO_FIX}}

**Prevention**: {{HOW_TO_AVOID}}

---

### Gotcha 2: {{GOTCHA_NAME}}

**Problem**: {{WHAT_GOES_WRONG}}

**Why It Happens**: {{EXPLANATION}}

**Solution**: {{HOW_TO_FIX}}

**Prevention**: {{HOW_TO_AVOID}}

---

### Gotcha 3: {{GOTCHA_NAME}}

**Problem**: {{WHAT_GOES_WRONG}}

**Why It Happens**: {{EXPLANATION}}

**Solution**: {{HOW_TO_FIX}}

**Prevention**: {{HOW_TO_AVOID}}

---

## Feedback on Onboarding

We want to continuously improve our onboarding process.

### Share Your Experience

[TODO: Create mechanism for onboarding feedback]

After your first month, please:

1. **Fill out feedback form**: {{FEEDBACK_FORM_LINK}}
2. **Meet with your buddy**: Discuss what worked and what didn't
3. **Update this document**: Fix anything confusing, add missing info

Questions to consider:
- What was confusing or unclear?
- What would have helped you get up to speed faster?
- What resources did you wish you had?
- What surprised you about the codebase or process?

Your feedback helps future team members.

---

## Onboarding Buddy Guide

[TODO: Guide for people serving as onboarding buddies]

If you're serving as an onboarding buddy:

### Your Responsibilities

**Before Their First Day**:
- [ ] Ensure they have all required access
- [ ] Send welcome message with logistics
- [ ] Schedule first day check-in

**Day 1**:
- [ ] Welcome them to the team
- [ ] Help with environment setup issues
- [ ] Give codebase tour
- [ ] Answer questions

**Week 1**:
- [ ] Daily check-ins
- [ ] Help choose first issues
- [ ] Review their first PRs
- [ ] Introduce them to team members

**Week 2-4**:
- [ ] Check in 2-3 times per week
- [ ] Review progress
- [ ] Provide feedback
- [ ] Encourage independence

### Tips for Buddies

**Be Proactive**:
- Check in regularly, don't wait for them to ask
- Share resources before they need them
- Introduce them to people they should know

**Be Patient**:
- Everyone learns at different speeds
- Expect lots of questions - that's good!
- Repeat yourself - information overload is real

**Be Encouraging**:
- Celebrate small wins
- Provide positive feedback
- Share your own onboarding struggles

**Be Honest**:
- If you don't know, say so and find someone who does
- Share challenges honestly
- Give constructive feedback early

---

## Related Documentation

- [Development Process](./contributing/development.md) - How we develop
- [Code Standards](./standards.md) - How we write code
- [Code Review Practices](./code-review.md) - How we review code
- [Testing](./testing.md) - How we test

---

## Customization Checklist

When adapting this template:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Add required accounts and access
- [ ] List required tools and installation steps
- [ ] Provide actual setup commands
- [ ] Create guided codebase tour
- [ ] Add recommended first issues
- [ ] List domain experts and contacts
- [ ] Document common gotchas
- [ ] Create feedback mechanism
- [ ] Add onboarding buddy guide
- [ ] Link to related documentation

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*

*Next onboarding improvements:* {{PLANNED_IMPROVEMENTS}}
