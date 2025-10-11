# Template: Code Review Practices

## Overview

This document provides the template for "Code Review Practices" documentation. It defines the philosophy, process, and standards for conducting effective, constructive code reviews.

---

## Template Structure

### Frontmatter

```yaml
---
title: Code Review Practices
description: Philosophy, process, and guidelines for code reviews
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: all contributors
related:
  - standards.md
  - patterns.md
  - contributing/development.md
---
```

### Document Outline

```markdown
# Code Review Practices

> **Purpose**: This document defines how we conduct code reviews in {{PROJECT_NAME}}. Code review is a critical practice for maintaining quality, sharing knowledge, and building shared ownership of the codebase.

---

## Table of Contents

1. [Code Review Philosophy](#code-review-philosophy)
2. [When to Review](#when-to-review)
3. [Review Process](#review-process)
4. [For Authors](#for-authors)
5. [For Reviewers](#for-reviewers)
6. [Review Checklist](#review-checklist)
7. [Common Review Topics](#common-review-topics)
8. [Giving Feedback](#giving-feedback)
9. [Receiving Feedback](#receiving-feedback)
10. [Review Anti-Patterns](#review-anti-patterns)
11. [Escalation and Disagreements](#escalation-and-disagreements)

---

## Code Review Philosophy

### Why We Review Code

Code review serves multiple purposes:

1. **Catch bugs and defects** - Find issues before they reach production
2. **Ensure consistency** - Keep codebase consistent with standards and patterns
3. **Share knowledge** - Reviewers learn about changes, authors learn from feedback
4. **Improve design** - Discuss and refine architectural decisions
5. **Build ownership** - Create shared responsibility for code quality
6. **Mentor developers** - Help team members grow through feedback

### Our Core Beliefs

**Reviews Are Collaborative, Not Adversarial**

The goal is to improve the code, not critique the author. We're on the same team working toward the same goals.

**Authors and Reviewers Are Equal**

Both bring valuable perspectives. Authors understand the problem deeply; reviewers provide fresh eyes.

**Speed and Thoroughness Both Matter**

Fast reviews keep velocity high. Thorough reviews maintain quality. We balance both.

**Perfect Is the Enemy of Good**

Code doesn't need to be perfect to be merged. It needs to be correct, maintainable, and incrementally better than what was there before.

**Documentation Updates Are Part of the Change**

If code changes, related documentation should be updated in the same PR.

---

## When to Review

### What Requires Review

[TODO: Define what requires review in your project]

**Required Reviews**:
- [ ] All production code changes
- [ ] Changes to critical infrastructure
- [ ] Changes to public APIs
- [ ] Security-sensitive changes
- [ ] Database migrations
- [ ] Configuration changes

**Optional Reviews** (author's discretion):
- [ ] Documentation-only changes
- [ ] Test-only changes
- [ ] Trivial fixes (typos, formatting)

[TODO: Adjust based on team size and velocity]

### Who Reviews

**Reviewer Requirements**:
- At least {{MINIMUM_REVIEWERS}} approval(s) required
- Reviewers should have context for the change
- For large changes, include domain expert
- For architectural changes, include {{ARCHITECTURE_REVIEW_ROLE}}

**Self-Review Exception** [TODO: Define self-review policy]:
- Solo contributors: Self-review is acceptable with careful attention
- Team projects: Peer review required

---

## Review Process

### PR Creation

[TODO: Describe your PR creation workflow]

1. **Create feature branch** from `{{BASE_BRANCH}}`
   ```bash
   git checkout -b {{BRANCH_PREFIX}}/{{FEATURE_NAME}}
   ```

2. **Make changes** following [code standards](./standards.md)

3. **Write tests** covering the changes

4. **Update documentation** affected by changes

5. **Self-review** the changes:
   - Review your own diff
   - Check for debugging code, TODOs, etc.
   - Verify tests pass locally
   - Run linters and formatters

6. **Create pull request** with clear description

### PR Description Template

[TODO: Customize this template or link to your GitHub PR template]

```markdown
## Summary

[Brief description of what this PR does]

## Motivation

[Why are we making this change? What problem does it solve?]

## Changes

- [List of changes made]
- [Be specific about what changed]

## Testing

[How was this tested? What scenarios were covered?]

## Screenshots

[If UI changes, include before/after screenshots]

## Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No debugging code left in
- [ ] Breaking changes documented (if applicable)

## Related

Closes #{{ISSUE_NUMBER}}
Related to #{{RELATED_ISSUE}}
```

### Review Timeline

[TODO: Define expected review turnaround]

**Target Timelines**:
- **Small PRs** (< 200 lines): Review within {{SMALL_PR_HOURS}} hours
- **Medium PRs** (200-500 lines): Review within {{MEDIUM_PR_HOURS}} hours
- **Large PRs** (> 500 lines): Should be split or reviewed within {{LARGE_PR_DAYS}} days

**Reviewer Expectations**:
- Check for new PRs {{REVIEW_FREQUENCY}}
- Acknowledge PR within {{ACK_TIME}} (comment "Reviewing" or similar)
- Complete review within timeline above
- If unavailable, reassign to another reviewer

---

## For Authors

### Before Creating PR

**Prepare Your Changes**:

1. **Keep PRs focused** - One logical change per PR
2. **Keep PRs small** - Aim for < 400 lines changed (excluding tests)
3. **Write clear commit messages** - Follow [commit conventions](./contributing/development.md)
4. **Test thoroughly** - All tests pass, new tests added
5. **Self-review** - Review your own changes first

**Write a Clear Description**:

- **What changed**: Specific changes made
- **Why it changed**: Problem being solved
- **How to test**: Steps to verify the change
- **Context**: Links to issues, docs, related PRs

### During Review

**Respond to Feedback Promptly**:

- Acknowledge comments (👍 reaction or reply)
- Ask clarifying questions if feedback is unclear
- Make requested changes or explain why not
- Mark conversations as resolved when addressed

**Keep Reviewers Updated**:

- Push new commits addressing feedback
- Comment when ready for re-review
- If making major changes, explain what and why

### Handling Feedback

**Types of Feedback**:

[TODO: Customize your feedback categories]

- **🔴 Blocking**: Must be addressed before merge (bugs, security, breaks tests)
- **🟡 Non-blocking**: Should be addressed but not blocking (style, minor improvements)
- **💡 Suggestion**: Optional improvements (alternative approaches, future ideas)
- **❓ Question**: Seeking understanding (not requiring changes)
- **🎉 Praise**: Positive feedback (reinforces good practices)

**Responding to Feedback**:

For blocking feedback: Address immediately or explain why not.

For non-blocking feedback: Address now or create follow-up issue.

For suggestions: Consider and respond, but no obligation to implement.

For questions: Answer clearly, consider if code needs clarification.

---

## For Reviewers

### Review Approach

**First Pass - High Level**:

1. **Read PR description** - Understand what and why
2. **Review the changes overview** - Get big picture
3. **Check tests** - Verify test coverage and quality
4. **Check documentation** - Verify docs are updated

**Second Pass - Detailed**:

5. **Review code logic** - Correctness, edge cases, error handling
6. **Review code quality** - Readability, maintainability, standards
7. **Review design** - Patterns, architecture, future-proofing
8. **Check security** - Vulnerabilities, data handling, auth/authz

### Review Checklist

Use this checklist when reviewing PRs. Not every item applies to every PR.

#### Correctness
- [ ] Changes solve the stated problem
- [ ] Logic is correct and handles edge cases
- [ ] No obvious bugs
- [ ] Error handling is appropriate
- [ ] Race conditions considered (if applicable)

#### Testing
- [ ] Tests cover new functionality
- [ ] Tests cover edge cases
- [ ] Existing tests still pass
- [ ] Test names are descriptive
- [ ] Tests follow testing standards

#### Design and Architecture
- [ ] Changes follow established patterns (see [patterns.md](./patterns.md))
- [ ] Design is appropriate for the problem
- [ ] No unnecessary complexity
- [ ] Interfaces are clean and focused
- [ ] Dependencies are reasonable

#### Code Quality
- [ ] Code follows style guidelines (see [standards.md](./standards.md))
- [ ] Functions are focused and reasonably short
- [ ] Names are clear and descriptive
- [ ] No code duplication
- [ ] Comments explain WHY, not WHAT

#### Security
- [ ] Input validation is present
- [ ] No SQL injection vulnerabilities
- [ ] Authentication/authorization checked
- [ ] Secrets not committed
- [ ] Sensitive data handled appropriately

#### Performance
- [ ] No obvious performance issues
- [ ] Database queries are efficient (no N+1)
- [ ] Caching used appropriately
- [ ] Resource cleanup handled (connections, files)

#### Documentation
- [ ] Public APIs are documented
- [ ] Complex logic is explained
- [ ] README updated if needed
- [ ] CHANGELOG updated (if applicable)
- [ ] Migration guide provided (if breaking change)

#### User Experience (if UI changes)
- [ ] UI is intuitive
- [ ] Error messages are helpful
- [ ] Loading states are handled
- [ ] Responsive design works
- [ ] Accessibility considered

---

## Common Review Topics

[TODO: Add topics specific to your project. Below are common examples.]

### Logic and Correctness

**What to Look For**:
- Off-by-one errors
- Null/undefined handling
- Edge cases (empty arrays, negative numbers, etc.)
- Error propagation
- Concurrency issues

**Example Comments**:

```
❓ What happens if `items` is an empty array?

🔴 This condition will never be true because we return early above.

💡 Consider using optional chaining here: `user?.email`
```

### Code Quality

**What to Look For**:
- Function length and complexity
- Code duplication
- Variable and function names
- Code organization

**Example Comments**:

```
🟡 This function is doing two things - could we split it?

💡 These three functions have similar logic - could we extract a helper?

🎉 Nice use of early returns to reduce nesting!
```

### Patterns and Architecture

**What to Look For**:
- Adherence to project patterns
- Dependency injection
- Separation of concerns
- API design

**Example Comments**:

```
🔴 This should use the Repository pattern for data access (see patterns.md)

❓ Is this the right place for this logic? Seems like it belongs in the domain layer.

💡 Have you considered using the Adapter pattern here?
```

### Testing

**What to Look For**:
- Test coverage
- Test quality
- Test names
- Test independence

**Example Comments**:

```
🔴 Missing test case for when user is suspended.

🟡 This test name describes implementation, not behavior.
   Consider: "rejects orders when inventory is insufficient"

💡 These tests could use the UserBuilder pattern to reduce setup code.
```

### Security

**What to Look For**:
- Input validation
- Authentication/authorization
- Data exposure
- Injection vulnerabilities

**Example Comments**:

```
🔴 This user input needs validation before using in the query.

🔴 Are we checking that the user has permission to delete this resource?

❓ Should this endpoint require authentication?
```

### Performance

**What to Look For**:
- N+1 queries
- Inefficient algorithms
- Unnecessary database hits
- Memory leaks

**Example Comments**:

```
🔴 This will cause N+1 queries. Consider using a JOIN or eager loading.

💡 This sorts the entire array but we only need the first 10.
   Consider using a heap or partial sort.

❓ Is this data cached? This query runs on every request.
```

---

## Giving Feedback

### Be Kind and Clear

**Kind**:
- Assume good intent
- Focus on the code, not the person
- Acknowledge good work
- Suggest improvements, don't demand them

**Clear**:
- Be specific about the issue
- Explain why it's a problem
- Suggest alternatives when possible
- Distinguish blocking from non-blocking

### Feedback Examples

**❌ Bad Feedback**:

```
This is wrong.
```

**✅ Good Feedback**:

```
🔴 This will throw an error when `items` is null.
We should check for null before mapping:

if (!items) return [];
return items.map(item => item.id);
```

---

**❌ Bad Feedback**:

```
Why did you do it this way?
```

**✅ Good Feedback**:

```
❓ I'm curious about the approach here. What's the advantage of
looping twice instead of combining into one loop?
```

---

**❌ Bad Feedback**:

```
This could be better.
```

**✅ Good Feedback**:

```
💡 This works but we could make it more readable:

// Current:
const x = data.filter(d => d.active).map(d => d.id);

// Suggestion:
const activeIds = data
  .filter(item => item.active)
  .map(item => item.id);
```

### Praise Good Work

Don't just point out problems. Acknowledge good practices:

```
🎉 Great job handling all the edge cases in these tests!

🎉 I like how you extracted this into a reusable util function.

🎉 This error message is really helpful for debugging.
```

### Use Categories

[TODO: Define your feedback categories]

Use emoji prefixes to categorize feedback:

- 🔴 **Blocking** - Must fix
- 🟡 **Non-blocking** - Should fix
- 💡 **Suggestion** - Consider this
- ❓ **Question** - Help me understand
- 🎉 **Praise** - Nice work

---

## Receiving Feedback

### Assume Good Intent

Reviewers want to help improve the code, not criticize you personally. Feedback is about the code, not about you.

### Ask for Clarification

If feedback is unclear:

```
❓ Could you elaborate on this? I'm not sure I understand the concern.

❓ Can you provide an example of what you mean?
```

### Respond Constructively

For blocking feedback, either:
- Fix the issue
- Explain why it's not an issue (with evidence)

For non-blocking feedback, either:
- Fix it now
- Create a follow-up issue
- Explain why you're not addressing it

For suggestions:
- Consider them thoughtfully
- Respond with your reasoning
- No obligation to implement

### Example Responses

**Accepting Feedback**:

```
Good catch! Fixed in {{COMMIT_HASH}}

You're right, I'll create a follow-up issue for this.

Great idea, I've updated the approach.
```

**Providing Context**:

```
I considered that approach, but it doesn't handle the case where...

This is a temporary solution until we refactor {{COMPONENT}}.
I've added a TODO comment.

The existing code does it this way, so I kept it consistent.
Should we refactor both?
```

**Disagreeing Respectfully**:

```
I see your point, but I think this approach is clearer because...

I understand the concern, but the performance impact is minimal
(measured at {{MEASUREMENT}}) and the readability benefit is significant.
```

---

## Review Anti-Patterns

### Anti-Patterns for Reviewers

**❌ Nitpicking Style**:

Don't comment on style issues that linters should catch. If it's not automated, consider automating it.

**❌ Bike-shedding**:

Don't spend disproportionate time on trivial decisions (naming, formatting) while missing important issues.

**❌ "I Would Have Done It Differently"**:

Your way isn't necessarily better. Unless there's a clear problem, different is okay.

**❌ Vague Criticism**:

```
Bad: "This looks off"
Good: "This function is hard to test because it has side effects"
```

**❌ Drive-by Reviews**:

Don't leave a single critical comment and disappear. Engage in conversation and help reach resolution.

**❌ Approval Without Review**:

Don't approve PRs you haven't actually reviewed. "LGTM" should mean something.

### Anti-Patterns for Authors

**❌ Large, Unfocused PRs**:

Don't create PRs with 1000+ lines changing multiple unrelated things. Split into smaller PRs.

**❌ Defensive Responses**:

Don't take feedback personally or respond defensively. Engage constructively.

**❌ Ignoring Feedback**:

Don't mark conversations as resolved without addressing them. Either fix the issue or explain why not.

**❌ "It Works on My Machine"**:

Don't dismiss feedback with "but it works." If reviewers are confused, future maintainers will be too.

**❌ Merging Without Approval**:

Don't merge before reviewers approve (unless you have explicit exemption).

**❌ Silent Changes**:

Don't force-push without explanation. Explain what changed and why.

---

## Escalation and Disagreements

### When Reviewers Disagree

If reviewers disagree:

1. **Discussion first** - Reviewers should discuss and try to reach consensus
2. **Author decides** - If no consensus, author makes final call (they own the code)
3. **Escalate if needed** - If fundamental disagreement, escalate to {{ESCALATION_ROLE}}

### When Author and Reviewer Disagree

If author and reviewer can't reach agreement:

1. **Understand each other** - Make sure you understand each other's perspective
2. **Find common ground** - Often there's a middle path
3. **Experiment** - Try the reviewer's suggestion in a follow-up PR
4. **Escalate if needed** - Escalate to {{ESCALATION_ROLE}}

### Blocking PRs

Reviewers should only block PRs for:

- **Correctness** - Code has bugs
- **Security** - Code has vulnerabilities
- **Breaking changes** - Code breaks existing functionality
- **Test failures** - Tests don't pass

Reviewers should NOT block PRs for:

- **Style preferences** - Use linters/formatters
- **Alternative approaches** - Different isn't wrong
- **Nice-to-haves** - Create follow-up issues

### Escalation Process

[TODO: Define escalation process for your team]

If you can't resolve a disagreement:

1. **Document perspectives** - Both sides clearly state their position
2. **Bring in third party** - Ask {{ESCALATION_ROLE}} to review
3. **Make decision** - Third party makes final call
4. **Move forward** - Accept the decision and move on

---

## Review Metrics

[TODO: If you track review metrics, document them]

### Metrics We Track

We monitor these metrics to improve our review process:

- **Review turnaround time** - Time from PR creation to first review
- **Merge time** - Time from PR creation to merge
- **Review iteration count** - Number of review rounds
- **PR size** - Lines of code changed

### Targets

- **First review**: Within {{FIRST_REVIEW_TARGET}}
- **Merge time**: {{MERGE_TIME_TARGET}}
- **Review iterations**: {{ITERATION_TARGET}} on average
- **PR size**: {{SIZE_TARGET}} median

---

## Related Documentation

- [Code Standards](./standards.md) - What reviewers check for
- [High-Level Patterns](./patterns.md) - Architectural patterns
- [Development Process](./contributing/development.md) - Development workflow
- [Testing](./testing.md) - Testing standards

---

## Customization Checklist

When adapting this template:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Define what requires review in your project
- [ ] Set reviewer requirements (minimum approvals, etc.)
- [ ] Define review timelines
- [ ] Customize PR template
- [ ] Define feedback categories and conventions
- [ ] Document escalation process
- [ ] Add project-specific review topics
- [ ] Define review metrics (if tracked)
- [ ] Link to related documentation

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*
