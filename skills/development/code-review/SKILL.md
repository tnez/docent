---
name: code-review
description: Conduct thorough code reviews for pull requests and pre-commit changes
group: development
keywords: [code-review, pull-request, quality, pr, review code, code quality]
version: 1.0.0
author: docent
---

# Code Review Runbook

## Overview

This runbook provides procedures for reviewing code in two scenarios:

1. **Pull Request Review** - Reviewing contributor PRs before merging (primary focus)
2. **Pre-Commit Review** - Self-reviewing changes before committing directly to main

The review process ensures code quality, maintainability, adherence to project standards, and alignment with architectural decisions (ADRs).

**Expected duration:**

- PR Review: 15-30 minutes per PR
- Pre-Commit Review: 5-10 minutes for local changes

## Prerequisites

### Required Tools

- `gh` CLI (GitHub CLI) - version 2.0 or higher
- `git` command line tool
- Project-specific build tools (npm, cargo, etc.)
- Text editor or IDE for code inspection
- Web browser for detailed PR viewing

### Required Access

- **For PR Review:** Read access to repository (comment-only) OR Write access (approve/request changes)
- **For Pre-Commit Review:** Local development environment

### Required Knowledge

- Familiarity with project ADRs or architectural documentation
- Understanding of project coding standards
- Knowledge of project's primary language(s) and frameworks

### Pre-Flight Checklist

Before starting, ensure:

- [ ] You have time for thorough review (don't rush)
- [ ] You understand the feature/fix context
- [ ] CI/CD checks status is visible
- [ ] You're familiar with related ADRs

## Scenario 1: Pull Request Review

Use this procedure when reviewing PRs from contributors or reviewing your own PRs before merge.

### Step 1: Find PRs Ready for Review

**Purpose:** Identify pull requests that need review

**Commands:**

```bash
# List all open PRs
gh pr list --state open

# List PRs assigned to you for review
gh pr list --search "review-requested:@me"

# List PRs by specific author
gh pr list --author <username>

# List PRs with specific label
gh pr list --label "ready-for-review"
```

**Validation:**

- Output shows list of open PRs with numbers and titles
- PR status is visible (draft, open, ready)

**If step fails:**

- Verify you're in the docent repo directory
- Check GitHub CLI auth: `gh auth status`

---

### Step 2: Review PR Overview

**Purpose:** Understand what the PR does and why

**Commands:**

```bash
# View PR in terminal
gh pr view <PR_NUMBER>

# View PR in browser for full experience
gh pr view <PR_NUMBER> --web

# Check PR metadata (labels, reviewers, CI status)
gh pr view <PR_NUMBER> --json title,body,labels,reviews,statusCheckRollup
```

**Review Checklist:**

- [ ] **Title is clear** - Describes the change concisely
- [ ] **Description is complete** - What, why, and how
- [ ] **Issue linked** - References related issue (if applicable)
- [ ] **Labels applied** - Type (bug/enhancement), components
- [ ] **Tests mentioned** - How was this tested?
- [ ] **Breaking changes noted** - If any
- [ ] **Screenshots/examples** - For UI or output changes

**Validation:**

- PR purpose is clear
- Context for review is sufficient
- No red flags in description

**If context is missing:**

```bash
gh pr comment <PR_NUMBER> --body "Thanks for this PR! Could you provide additional context:

- What problem does this solve?
- How did you test this?
- Are there any breaking changes?

This will help with the review process."
```

---

### Step 3: Check CI/CD Status

**Purpose:** Ensure automated checks pass before manual review

**Commands:**

```bash
# Check CI status
gh pr checks <PR_NUMBER>

# Watch CI in real-time
gh pr checks <PR_NUMBER> --watch

# View specific check details
gh run view <RUN_ID>
```

**Requirements:**

- ✅ All CI checks must pass (tests, linting, build)
- ✅ No failing workflows
- ✅ Code coverage maintained or improved

**If CI fails:**

```bash
# Request fixes before continuing review
gh pr comment <PR_NUMBER> --body "The CI checks are failing. Please fix these issues before review:

- [List specific failures]

Once fixed, I'll complete the review."
```

**Do not proceed with detailed review until CI passes** - this saves time and ensures baseline quality.

---

### Step 4: Check Out PR Locally

**Purpose:** Test the changes in your local environment

**Commands:**

```bash
# Check out the PR branch
gh pr checkout <PR_NUMBER>

# Verify you're on the PR branch
git branch --show-current

# Pull latest changes if needed
git pull
```

**Validation:**

- You're on the PR branch
- Working directory is clean (except for uncommitted changes from PR)

**If step fails:**

- Stash local changes: `git stash`
- Try checkout again
- Check for merge conflicts

---

### Step 5: Run Tests and Build Locally

**Purpose:** Verify the code works in your environment

**Commands:**

```bash
# Install dependencies (if package.json changed)
npm install

# Run TypeScript build
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Run markdown linting
npm run lint:md
```

**Validation:**

- ✅ Build completes without errors
- ✅ All tests pass
- ✅ No linting errors
- ✅ No new warnings (or acceptable warnings documented)

**If tests fail locally but pass in CI:**

- Check Node version: `node --version`
- Check for environment differences
- Document findings in review comment

---

### Step 6: Review Code Quality

**Purpose:** Examine the code for quality, style, and maintainability

**Commands:**

```bash
# View all files changed
gh pr diff <PR_NUMBER>

# View diff for specific file
gh pr diff <PR_NUMBER> --name-only
git diff main -- path/to/file.ts

# See full file content
cat path/to/file.ts
```

**Code Quality Checklist:**

- [ ] **Follows project conventions** - Style matches existing code
- [ ] **Clear naming** - Functions/variables have descriptive names
- [ ] **Appropriate complexity** - Not overly complex or nested
- [ ] **DRY principle** - No unnecessary duplication
- [ ] **Error handling** - Errors are caught and handled appropriately
- [ ] **Edge cases** - Boundary conditions are considered
- [ ] **Comments where needed** - Complex logic is explained (focus on WHY)
- [ ] **No debug code** - No console.log, debugger statements
- [ ] **Type safety** - TypeScript types are used appropriately
- [ ] **Dependency injection** - External dependencies are injected (testable)

**Red Flags:**

- 🚩 Large functions (>50 lines) - Consider breaking up
- 🚩 Deeply nested logic (>3 levels) - Refactor for readability
- 🚩 Magic numbers/strings - Use named constants
- 🚩 Commented-out code - Remove or document why it's kept
- 🚩 TODO/FIXME comments - Should be issues, not comments
- 🚩 Copy-pasted code - Extract to shared function

---

### Step 7: Verify Architectural Alignment

**Purpose:** Ensure changes align with project architecture and decisions

**Commands:**

```bash
# Check relevant ADRs
ls -1 docs/adr/

# Search ADRs for related decisions
grep -r "<topic>" docs/adr/

# View specific ADR
cat docs/adr/adr-NNNN-<topic>.md
```

**Architecture Checklist:**

- [ ] **Follows established patterns** - Uses existing architectural patterns
- [ ] **Respects ADR decisions** - Doesn't contradict documented decisions
- [ ] **Appropriate abstraction** - Not over-engineered or under-engineered
- [ ] **Separation of concerns** - Clear responsibilities
- [ ] **Testability** - Code is structured for testing
- [ ] **MCP vs CLI alignment** - For docent: follows MCP-first approach (ADR-0004)
- [ ] **No breaking changes** - Or if breaking, properly documented and justified

**If PR conflicts with ADR:**

```bash
gh pr comment <PR_NUMBER> --body "This change conflicts with [ADR-NNNN](../adr/adr-NNNN.md) where we decided [decision].

Could you either:
1. Refactor to align with the ADR, OR
2. Make a case for why we should revisit that decision (would require new RFC/ADR)

Happy to discuss approaches!"
```

---

### Step 8: Review Tests

**Purpose:** Ensure changes are properly tested

**Commands:**

```bash
# List test files changed
gh pr diff <PR_NUMBER> --name-only | grep -E 'test|spec'

# View test coverage (if available)
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.ts
```

**Test Quality Checklist:**

- [ ] **Tests exist** - New functionality has tests
- [ ] **Tests are focused** - Test one thing at a time
- [ ] **Descriptive test names** - Clear what's being tested
- [ ] **Business-focused** - Tests reflect requirements, not implementation
- [ ] **Edge cases covered** - Happy path and error cases
- [ ] **No test implementation details** - Tests don't know about internals
- [ ] **Fixtures used** - Existing test data reused when possible
- [ ] **Assertions are clear** - Expected vs actual is obvious

**Test Coverage Requirements:**

- **Required:** Business logic and core functionality
- **Optional:** Simple getters/setters, glue code
- **Encouraged:** Bug fixes include regression test

**If tests are inadequate:**

```bash
gh pr comment <PR_NUMBER> --body "The implementation looks good, but I'd like to see tests for:

- [Specific functionality that needs tests]
- [Edge cases that should be covered]

Tests help ensure this works correctly and prevents regressions."
```

---

### Step 9: Check Documentation

**Purpose:** Ensure changes are documented appropriately

**Commands:**

```bash
# Check if docs were updated
gh pr diff <PR_NUMBER> --name-only | grep -E '\.md$|docs/'

# Search for related documentation
grep -r "<feature name>" docs/
```

**Documentation Checklist:**

- [ ] **Public APIs documented** - JSDoc/TSDoc for exported functions
- [ ] **User-facing changes documented** - README or guides updated
- [ ] **Breaking changes documented** - CHANGELOG.md or migration guide
- [ ] **Examples provided** - For new features or tools
- [ ] **ADR created** - For architectural decisions (if applicable)
- [ ] **RFC referenced** - If implemented from an RFC

**Documentation Requirements:**

- **New MCP tools:** Must have spec in `docs/specs/mcp-tools/`
- **Breaking changes:** Must update CHANGELOG.md
- **New features:** Should update relevant guides
- **Bug fixes:** Optional docs, unless behavior changes

**If docs are missing:**

```bash
gh pr comment <PR_NUMBER> --body "This change needs documentation updates:

- [ ] Update README with new feature usage
- [ ] Add JSDoc comments to exported functions
- [ ] Update CHANGELOG.md with breaking changes

Let me know if you need help with any of these!"
```

---

### Step 10: Provide Review Feedback

**Purpose:** Give constructive, actionable feedback

**Feedback Guidelines:**

- **Be specific** - Point to exact lines and explain why
- **Be constructive** - Suggest improvements, don't just criticize
- **Be kind** - Remember there's a person behind the code
- **Prioritize** - Mark required changes vs nice-to-haves
- **Praise good work** - Call out clever solutions and good patterns

**Commands:**

```bash
# Add general comment
gh pr comment <PR_NUMBER> --body "Great work on this! I have a few suggestions..."

# For inline comments, use the web interface
gh pr view <PR_NUMBER> --web

# Request changes (blocks merging)
gh pr review <PR_NUMBER> --request-changes --body "Thanks for this PR! Before merging, please address:

## Required Changes
- [ ] Fix error handling in foo.ts:45
- [ ] Add tests for edge case X
- [ ] Update documentation for API change

## Nice-to-have
- Consider extracting duplicate logic to helper function
- Variable naming could be more descriptive

Happy to re-review once these are addressed!"

# Approve with minor comments
gh pr review <PR_NUMBER> --approve --body "Looks great! Just a couple of minor suggestions (non-blocking):

- Consider adding a comment explaining the algorithm in line 45
- Nice refactoring of the error handling!

Approved to merge once CI passes."

# Comment without approving/requesting changes
gh pr review <PR_NUMBER> --comment --body "I have some questions about the approach before I can give a full review:

- Why did you choose approach X over Y?
- How does this handle case Z?

Once clarified, I'll complete the review."
```

**Review Categories:**

1. **Approve** - Code is good to merge (use `--approve`)
2. **Request Changes** - Issues must be fixed before merge (use `--request-changes`)
3. **Comment Only** - Feedback/questions but not blocking (use `--comment`)

---

### Step 11: Follow Up on Changes

**Purpose:** Ensure requested changes are addressed

**Commands:**

```bash
# Check if PR was updated
gh pr view <PR_NUMBER>

# See new commits since your review
git log --oneline main..<PR_BRANCH> --since="2 days ago"

# View changes to specific file since review
git diff <OLD_COMMIT> <NEW_COMMIT> -- path/to/file.ts

# Re-run tests with changes
npm test
```

**Follow-up Actions:**

- Review updated code
- Verify all requested changes were addressed
- Check if any new issues were introduced
- Approve once satisfied

**If changes look good:**

```bash
gh pr review <PR_NUMBER> --approve --body "Thanks for addressing the feedback! The changes look good. ✅"
```

---

### Step 12: Merge or Close PR

**Purpose:** Complete the review process

**Merge Requirements:**

- ✅ At least one approval (or your approval if you have write access)
- ✅ All CI checks passing
- ✅ No unresolved review comments
- ✅ No merge conflicts
- ✅ Branch is up to date with main

**Commands:**

```bash
# Merge PR (squash commits for clean history)
gh pr merge <PR_NUMBER> --squash --delete-branch

# Merge with merge commit (preserves commit history)
gh pr merge <PR_NUMBER> --merge --delete-branch

# Merge with rebase (linear history)
gh pr merge <PR_NUMBER> --rebase --delete-branch

# Close without merging (if rejecting)
gh pr close <PR_NUMBER> --comment "Thanks for the contribution! Unfortunately, this doesn't align with [reason]. See [alternative approach/issue]."
```

**Merge Strategy for Docent:**

- **Default: Squash merge** - Clean commit history, one commit per PR
- **Use merge commit:** Only if preserving detailed history is important
- **Use rebase:** For small PRs with clean commits

**Post-Merge:**

```bash
# Return to main branch
git checkout main

# Pull merged changes
git pull origin main

# Clean up local PR branch
git branch -d <PR_BRANCH>
```

---

## Scenario 2: Pre-Commit Review (Local)

Use this procedure when reviewing your own changes before committing directly to main.

### Quick Pre-Commit Checklist

**Purpose:** Self-review before committing to main (no PR)

**When to use:** For small fixes, documentation updates, or when you have direct commit access

**Commands:**

```bash
# 1. Check what's changed
git status
git diff

# 2. Review your own changes
git diff --staged  # If already staged
git diff HEAD      # All uncommitted changes

# 3. Run automated checks
npm run build      # TypeScript compilation
npm test           # Run test suite
npm run lint       # Linting
npm run lint:md    # Markdown linting

# 4. Check for debug code
git diff | grep -E 'console\.log|debugger|TODO|FIXME'

# 5. Verify no secrets
git diff | grep -iE 'password|secret|token|api[_-]?key'

# 6. Check against ADRs (if architectural change)
grep -r "<related topic>" docs/adr/

# 7. Update docs if needed
# - Update README if user-facing
# - Update CHANGELOG.md if notable
# - Add ADR if architectural decision

# 8. Commit with clear message
git add .
git commit -m "feat: add concise doctor output

- Add verbose parameter to doctor tool (default: false)
- Create concise formatter that groups findings
- Show only failures/warnings by default
- Maintain backward compatibility

Closes #2"
```

**Self-Review Questions:**

- [ ] Would this pass PR review?
- [ ] Is it tested?
- [ ] Is it documented (if needed)?
- [ ] Does it follow conventions?
- [ ] Does it align with ADRs?
- [ ] Will others understand this in 6 months?

**If unsure:**

Consider creating a PR even for your own work - gives community visibility and opportunity for feedback.

---

## Validation

After completing a review:

1. **For PR Review:**
   - Feedback is clear and actionable
   - Review status is set (approve/request changes/comment)
   - All required changes are documented
   - Next steps are clear to PR author

2. **For Pre-Commit Review:**
   - All automated checks pass
   - No debug code or secrets
   - Changes align with standards
   - Commit message is clear

## Rollback

If you need to undo review actions:

### Dismiss Review

```bash
# Dismiss your own review (if you change your mind)
# Note: Can only be done via web UI or API
gh pr view <PR_NUMBER> --web
# Navigate to your review and select "Dismiss review"
```

### Revert Merged PR

```bash
# If PR was merged incorrectly
gh pr view <PR_NUMBER> --json mergeCommit --jq '.mergeCommit.oid'

# Create revert PR
git revert <MERGE_COMMIT_SHA>
git push origin main

# Or revert via GitHub
gh pr view <PR_NUMBER> --web
# Click "Revert" button
```

## Troubleshooting

### Common Issues

#### Issue 1: Can't Reproduce Bug Fix Locally

**Symptoms:**

- PR claims to fix bug
- Can't reproduce bug locally
- Tests pass but unclear what was fixed

**Resolution:**

```bash
gh pr comment <PR_NUMBER> --body "I'm having trouble reproducing the bug this fixes. Could you provide:

- Steps to reproduce the original bug
- How to verify the fix works
- Test case that covers this scenario

This will help validate the fix and prevent regressions."
```

---

#### Issue 2: PR is Too Large to Review

**Symptoms:**

- 1000+ lines changed
- Multiple unrelated changes
- Difficult to understand scope

**Resolution:**

```bash
gh pr comment <PR_NUMBER> --body "This PR is quite large and touches many areas. To make review more effective, could you:

1. Split into smaller PRs (if possible), OR
2. Provide a detailed summary of each major change, OR
3. Schedule a synchronous review session to walk through changes

Large PRs are harder to review thoroughly and more likely to introduce issues."
```

---

#### Issue 3: Conflicting Feedback from Multiple Reviewers

**Symptoms:**

- Different reviewers suggest different approaches
- Author is confused about which direction to take

**Resolution:**

```bash
# Coordinate with other reviewers
gh pr comment <PR_NUMBER> --body "@reviewer1 @reviewer2 - We have different suggestions on approach. Let's align on one direction:

**Option A (my suggestion):** [Describe]
**Option B (@reviewer1's suggestion):** [Describe]

@author - We'll resolve this and get back to you with aligned feedback."
```

---

### When to Escalate

Escalate to project lead (@tnez) if:

- Major architectural disagreement between reviewers
- Potential security vulnerability discovered
- Breaking change without clear justification
- Contributor is unresponsive for >1 week
- Personal conflicts in review comments

**Escalation Method:**

```bash
gh pr comment <PR_NUMBER> --body "@tnez - Could you weigh in on [specific issue]? Need maintainer input to proceed."
```

## Post-Procedure

After reviewing a batch of PRs:

- [ ] Document any patterns noticed (common issues, good practices)
- [ ] Update this runbook if new edge cases discovered
- [ ] Consider creating issues for recurring review feedback
- [ ] Thank contributors publicly (comment, mention in changelog)
- [ ] Take a break - code review is cognitively demanding!

## Notes

**Important Notes:**

- **Review with empathy** - Contributors are volunteering their time
- **Explain the "why"** - Don't just say what's wrong, explain why it matters
- **Be timely** - Review within 24-48 hours when possible
- **Link to standards** - Point to ADRs, guides, examples
- **Praise good work** - Positive feedback is motivating
- **Ask questions** - "Why did you choose X?" is often better than "Change X to Y"

**Gotchas:**

- Don't rubber-stamp reviews - thoroughness matters
- Don't be a perfectionist - good enough is often good enough
- Don't review when tired - quality suffers
- Don't review your own major changes without a second pair of eyes
- Don't merge immediately after approval - give time for others to review

**Related Procedures:**

- [Triage GitHub Issues](triage-github-issues.md) - For issue review workflow
- [CI/CD Health Check](ci-cd-health-check.md) - For checking CI status
- [Contributing Guide](../guides/contributing.md) - Standards for contributors

**Review Philosophy:**

docent values:

- **Code quality over speed** - Take time for thorough review
- **Maintainability over cleverness** - Prefer clear code
- **Testing as documentation** - Tests should express intent
- **Architecture alignment** - Respect documented decisions (ADRs)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-20 | @tnez | Initial creation for PR and pre-commit review workflows |

---

**This runbook ensures consistent, thorough code review that maintains quality while being respectful and constructive to contributors.**
