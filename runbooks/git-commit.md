---
name: git-commit
description: Create professional git commits following conventional commit format with proper staging and verification
---

# Git Commit Runbook

This runbook guides you through creating professional, well-structured git commits that follow project conventions and represent logical units of work.

## Purpose

Create git commits that:

- Follow conventional commit format
- Represent atomic, logical units of work
- Match existing project style and conventions
- Pass pre-commit hooks
- Are independently reviewable and revertible

## Prerequisites

- Git repository initialized
- Working directory with changes to commit
- Write access to current branch

## Procedure

### Step 1: Examine Current State

**Action:** Gather complete context about changes and repository state

```bash
git status                    # See untracked files and modifications
git diff                     # Review unstaged changes
git diff --staged           # Review already staged changes
git log --oneline -10       # Check recent commit style
git branch --show-current   # Confirm current branch
```

**Analysis Required:**

Before proceeding, analyze:

1. What files have changed and why
2. Whether changes represent ONE logical unit or MULTIPLE distinct units
3. What conventional commit type applies (feat, fix, docs, etc.)
4. Whether any files should be excluded (temporary files, secrets, build artifacts)
5. If multiple units exist, how to group them logically

### Step 2: Determine Commit Strategy

**Single Commit When:**

- All changes serve the same purpose
- Changes are interdependent and cannot function separately
- Small, focused change set
- Emergency hotfix requiring atomic deployment

**Multiple Commits When:**

- Changes span different conventional commit types (feat + fix + docs)
- Independent features/fixes that could be reviewed separately
- Configuration changes mixed with code changes
- Substantial documentation alongside code changes
- Changes affect different modules/components independently
- Refactoring mixed with new functionality
- Test additions separate from implementation

### Step 3: Analyze Existing Commit Style

**Action:** Identify project conventions

Look for patterns in `git log`:

- Does repo use conventional commits? (feat:, fix:, chore:, etc.)
- What's typical message length and format?
- Are scopes used? (feat(auth):, fix(api):)
- Are there ticket/issue references required?
- Body format and detail level?

**Match the existing style exactly.**

### Step 4: Stage Changes

**For Single Commit:**

```bash
# Review and stage relevant files
git add src/feature.ts
git add tests/feature.test.ts
git add README.md

# Or stage all tracked changes
git add -u

# Or stage specific hunks interactively
git add -p src/complex-file.ts
```

**For Multiple Commits:**

Stage files in logical groups:

```bash
# Example: Stage only configuration files first
git add config/ .env.example docker-compose.yml
```

**Exclusion Checklist:**

Do NOT stage:

- Temporary files (*.tmp,*.log, *.swp)
- Build artifacts (dist/, build/, node_modules/)
- OS files (.DS_Store, Thumbs.db)
- Editor files (.vscode/, .idea/)
- Debug code or commented-out code
- Secrets or API keys

### Step 5: Craft Commit Message

**Format:**

```
type(scope): brief description in imperative mood

[optional body explaining WHY, not HOW]

[optional footer with breaking changes or issue refs]
```

**Conventional Commit Types:**

- `feat:` - New feature for users
- `fix:` - Bug fix
- `docs:` - Documentation changes only
- `style:` - Formatting, whitespace, no code change
- `refactor:` - Code restructuring without behavior change
- `test:` - Adding or updating tests
- `chore:` - Maintenance, dependencies, tooling
- `perf:` - Performance improvements
- `ci:` - CI/CD configuration changes
- `build:` - Build system or external dependency changes

**Quality Standards:**

- **Subject line:** 50 chars max, imperative mood ("add" not "added")
- **Body:** 72 chars per line, explain motivation and context
- **Focus:** Business impact and "why", not technical "how"

**Examples:**

```bash
# Simple feature
git commit -m "feat: add user profile page"

# Feature with scope
git commit -m "feat(auth): implement JWT token refresh"

# Bug fix with body
git commit -m "fix: prevent race condition in file upload

The previous implementation didn't properly lock the upload queue,
causing concurrent uploads to overwrite each other. Added mutex
to ensure sequential processing."

# Breaking change
git commit -m "feat!: migrate to v2 API endpoints

BREAKING CHANGE: All API endpoints now require /v2/ prefix"
```

### Step 6: Create Commit

```bash
git commit -m "feat: add user authentication system

- Implement JWT token generation
- Add login/logout endpoints
- Create user session management"
```

**For Multi-line Messages:**

Use heredoc for clean formatting:

```bash
git commit -m "$(cat <<'EOF'
feat: implement full-text search

Add search functionality across all content types:
- Product catalog search with fuzzy matching
- User directory search
- Document full-text indexing

Improves user experience by providing unified search interface.
EOF
)"
```

### Step 7: Verify Commit Success

**Action:** Confirm commit was created correctly

```bash
git log -1 --oneline          # Confirm commit exists
git show --stat HEAD          # Show committed files
git status                    # Should show clean working directory
```

**Success Criteria:**

- ✅ Commit appears in git log with correct message
- ✅ All intended files included
- ✅ No unintended files included
- ✅ Working directory clean (or only intentionally uncommitted files remain)
- ✅ Commit message follows project conventions

### Step 8: Handle Pre-commit Hook Failures (If Applicable)

**If hooks modify files:**

```bash
git status                          # See what hook changed
git diff                           # Review hook modifications
git add -u                         # Stage hook changes
git commit --reuse-message=HEAD    # Retry with same message
```

**If hooks fail with errors:**

- Read error output carefully
- Common issues: linting failures, test failures, formatting
- Fix the root cause
- Retry commit after fixes

**Do NOT use `--no-verify` unless explicitly necessary.**

## Multi-Commit Workflow

When analysis reveals multiple logical units:

### Step 1: Identify Logical Boundaries

Group related files by:

- Purpose/feature
- Commit type (feat, fix, docs, test, etc.)
- Dependency order (earlier commits should not break functionality)

### Step 2: Create Commits Sequentially

**Example: Feature with Tests and Documentation**

```bash
# Commit 1: Core implementation
git add src/features/search/ src/utils/search-helpers.ts
git commit -m "feat: implement full-text search functionality"
git log -1 --oneline  # Verify

# Commit 2: Tests
git add tests/search/ tests/fixtures/search-data.json
git commit -m "test: add search feature test coverage"
git log -1 --oneline  # Verify

# Commit 3: Documentation
git add README.md docs/search.md
git commit -m "docs: document search API and configuration"
git log -1 --oneline  # Verify
```

**Example: Bug Fix with Refactoring**

```bash
# Fix first (higher priority)
git add src/validator.ts
git commit -m "fix: correct email validation regex"

# Then refactor
git add src/validator.ts src/types.ts
git commit -m "refactor: extract validation helpers"
```

**Example: Configuration and Feature**

```bash
# Infrastructure first (feature may depend on it)
git add package.json package-lock.json
git commit -m "chore: add lodash dependency"

# Then feature
git add src/utils/collection-helpers.ts
git commit -m "feat: add collection utility functions"
```

### Step 3: Use Partial Staging for Complex Files

When single file contains multiple logical changes:

```bash
git add -p src/app.ts  # Interactively stage hunks

# Stage only auth-related changes
git commit -m "feat: add authentication middleware"

# Stage remaining changes
git add src/app.ts
git commit -m "refactor: reorganize route registration"
```

### Step 4: Verify Each Commit

Run verification protocol after EACH commit in multi-commit workflow.

## Pre-Commit Verification Checklist

Before committing, verify:

1. ✅ No temporary files (*.tmp,*.log, .DS_Store, etc.)
2. ✅ No debug code (console.log, debugger, print statements)
3. ✅ No hardcoded secrets or API keys
4. ✅ No sensitive data or personal information
5. ✅ Commit message follows project style
6. ✅ Changes represent logical, atomic unit
7. ✅ All staged files are intentional

## Error Recovery

**Undo Last Commit (Keep Changes):**

```bash
git reset --soft HEAD~1
```

**Amend Last Commit Message:**

```bash
git commit --amend -m "corrected message"
```

**Unstage Specific File:**

```bash
git reset HEAD <file>
```

**Undo All Staging:**

```bash
git reset HEAD
```

## Branch Considerations

- Default to `main` branch unless specified
- In feature branch, ensure commit aligns with branch purpose
- For worktrees, verify correct branch before committing
- Check branch with `git branch --show-current`

## Common Patterns

### Documentation Update

```bash
git add README.md docs/
git commit -m "docs: update installation instructions"
```

### Dependency Update

```bash
git add package.json package-lock.json
git commit -m "chore: update dependencies to latest versions"
```

### Configuration Change

```bash
git add .eslintrc.json prettier.config.js
git commit -m "chore: update linting rules"
```

### Performance Improvement

```bash
git add src/api/users.ts
git commit -m "perf: optimize user query with database indexing

Reduced query time from 450ms to 23ms by adding composite index
on (email, status) columns."
```

### Breaking Change

```bash
git commit -m "feat!: migrate to ESM module format

BREAKING CHANGE: All imports now require .js extension.
Update import statements from:
  import {foo} from './bar'
to:
  import {foo} from './bar.js'
"
```

## Validation

After completing commits:

- ✅ `git log` shows commit(s) with proper messages
- ✅ `git status` shows clean working directory or only intentionally uncommitted files
- ✅ Each commit represents an atomic, logical unit
- ✅ Commit messages follow project conventions
- ✅ Pre-commit hooks passed (if applicable)

## Notes

- Focus on business value and user impact in commit messages
- Explain "why" in body, not "how" (code shows "how")
- Keep commits atomic - each should be independently functional
- Batch related changes in same commit, separate unrelated changes
- When in doubt, prefer multiple focused commits over one large mixed commit
