# Runbook: Prepare Release

**⚠️ DEPRECATED:** This runbook has been superseded by [Release Package](./release-package.md) which combines preparation and automated publishing into a single GitOps workflow.

**Purpose:** Prepare a new version of docent for release to npm
**Owner:** Maintainers
**Last Updated:** 2025-10-17
**Frequency:** Before each release (as needed)

## Overview

This runbook provides procedures for preparing a new release of the docent package. It covers version bumping, changelog updates, testing, and pre-release validation.

**Expected duration:** 15-30 minutes depending on changes

## Prerequisites

### Required Tools

- `git` command line tool
- `gh` CLI (GitHub CLI) - installed and authenticated
- `npm` - Node.js package manager
- Node.js >= 18.0.0

### Required Access

- Write access to the repository
- Ability to create tags and push to main branch

### Pre-Flight Checklist

Before starting, ensure:

- [ ] All features for this release are merged to main
- [ ] All CI/CD checks are passing on main branch
- [ ] You are on the main branch: `git checkout main`
- [ ] Working directory is clean: `git status`
- [ ] Local main is up to date: `git pull origin main`

## Procedure

### Step 1: Determine Version Number

**Purpose:** Decide what version number to use based on changes

**Semantic Versioning Rules:**

- **Major (X.0.0)**: Breaking changes, incompatible API changes
- **Minor (0.X.0)**: New features, backwards-compatible
- **Patch (0.0.X)**: Bug fixes, backwards-compatible

**Commands:**

```bash
# Check current version
npm pkg get version

# Review commits since last release
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Check what changed in public API
git diff $(git describe --tags --abbrev=0) -- src/mcp/
```

**Validation:**

- Current version is identified
- Changes are categorized (breaking, feature, fix)
- New version number determined following semver

**If step fails:**

- No tags exist yet: start with 0.1.0 or 1.0.0
- Can't determine changes: review commit history and CHANGELOG.md

---

### Step 2: Update Version Number

**Purpose:** Bump version in package.json

**Commands:**

```bash
# For patch release (0.5.0 -> 0.5.1)
npm version patch --no-git-tag-version

# For minor release (0.5.0 -> 0.6.0)
npm version minor --no-git-tag-version

# For major release (0.5.0 -> 1.0.0)
npm version major --no-git-tag-version

# Or set specific version
npm version 0.6.0 --no-git-tag-version
```

**Validation:**

- `package.json` shows new version number
- File is modified but not committed yet
- Verify: `npm pkg get version`

**If step fails:**

- Working directory must be clean
- Manually edit package.json if needed

---

### Step 3: Update CHANGELOG.md

**Purpose:** Document changes in this release

**Commands:**

```bash
# Open CHANGELOG.md in editor
$EDITOR CHANGELOG.md

# Review commits for this release
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

**Validation:**

- New version section added at top
- Date set to today (YYYY-MM-DD format)
- Changes categorized: Added, Changed, Fixed, Removed, Technical
- Each change describes user-facing value
- Breaking changes clearly marked
- Follows Keep a Changelog format

**CHANGELOG Structure:**

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New features and capabilities

### Changed

- Changes to existing functionality
- BREAKING: Mark breaking changes clearly

### Fixed

- Bug fixes

### Technical

- Internal improvements, refactoring, dependencies
```

**If step fails:**

- Review recent commits: `git log --oneline --since="2 weeks ago"`
- Check closed issues: `gh issue list --state closed --limit 20`
- Review merged PRs: `gh pr list --state merged --limit 20`

---

### Step 4: Build and Test

**Purpose:** Ensure everything builds and tests pass

**Commands:**

```bash
# Clean previous build
rm -rf lib/

# Install dependencies (if needed)
npm install

# Run build
npm run build

# Run tests
npm test

# Run linting
npm run lint:md
```

**Validation:**

- Build completes without errors
- All tests pass (14 tests expected)
- Markdown linting passes (or known issues documented)
- `lib/` directory contains compiled JavaScript

**If step fails:**

- Fix build errors before proceeding
- Fix test failures - do not release broken code
- Document markdown lint issues if blocking (see runbook: fix-markdown-lint)
- Commit fixes and restart from Step 2

---

### Step 5: Verify Package Contents

**Purpose:** Ensure package will include correct files when published

**Commands:**

```bash
# See what files will be included in package
npm pack --dry-run

# Check package.json "files" field
npm pkg get files
```

**Validation:**

- Output includes: `/bin`, `/lib`, `/templates`, `CHANGELOG.md`
- Output does NOT include: `src/`, `test/`, `docs/`, `.git/`
- Size is reasonable (< 1MB for docent)

**If step fails:**

- Update `files` array in package.json
- Add paths to `.npmignore` if needed
- Rebuild and re-check

---

### Step 6: Test Installation Locally

**Purpose:** Verify package installs and works correctly

**Commands:**

```bash
# Create test directory
mkdir -p /tmp/test-docent-install
cd /tmp/test-docent-install

# Pack the package
cd /path/to/docent
npm pack

# Install from tarball in test directory
cd /tmp/test-docent-install
npm install /path/to/docent/tnezdev-docent-X.Y.Z.tgz

# Verify MCP server starts
./node_modules/.bin/docent --version 2>/dev/null || echo "Binary check"

# Test in MCP client if available
# (Manual verification - test basic tools: analyze, list-templates, bootstrap)

# Cleanup
cd /path/to/docent
rm tnezdev-docent-*.tgz
rm -rf /tmp/test-docent-install
```

**Validation:**

- Package installs without errors
- Binary is accessible
- MCP server can be started (if testing with client)
- Templates are accessible

**If step fails:**

- Check bin path in package.json
- Verify files array includes necessary directories
- Check for missing dependencies
- Fix and restart from Step 4

---

### Step 7: Review Changes Before Commit

**Purpose:** Final review of all changes

**Commands:**

```bash
# Return to project directory (if not already there)
cd /path/to/docent

# Check git status
git status

# Review all changes
git diff

# Specifically review package.json and CHANGELOG.md
git diff package.json
git diff CHANGELOG.md
```

**Validation:**

- Only expected files are modified (package.json, CHANGELOG.md)
- Version number is correct in package.json
- CHANGELOG.md is complete and accurate
- No unintended changes

**If step fails:**

- Use `git checkout -- <file>` to discard unwanted changes
- Make corrections and re-review

---

### Step 8: Commit Release Changes

**Purpose:** Commit version bump and changelog

**Commands:**

```bash
# Stage changes
git add package.json CHANGELOG.md

# Create release commit
git commit -m "chore: prepare release vX.Y.Z"

# Verify commit
git log -1 --stat
```

**Validation:**

- Commit message follows format: `chore: prepare release vX.Y.Z`
- Only package.json and CHANGELOG.md are in commit
- Commit is created but NOT pushed yet

**If step fails:**

- Fix commit message: `git commit --amend -m "correct message"`
- Unstage files: `git reset HEAD <file>`

---

### Step 9: Create Git Tag

**Purpose:** Tag the release commit

**Commands:**

```bash
# Get version from package.json
VERSION=$(npm pkg get version | tr -d '"')

# Create annotated tag
git tag -a "v${VERSION}" -m "Release v${VERSION}"

# Verify tag
git tag -l "v${VERSION}"
git show "v${VERSION}"
```

**Validation:**

- Tag is created with format `vX.Y.Z`
- Tag points to release commit
- Tag includes release message

**If step fails:**

- Delete tag: `git tag -d vX.Y.Z`
- Recreate with correct format

---

### Step 10: Final Pre-Push Validation

**Purpose:** Last check before pushing

**Commands:**

```bash
# Verify working tree is clean
git status

# Verify CI is passing on main
gh run list --branch main --limit 5

# Verify commit and tag are correct
git log -1
git tag -l | tail -1
```

**Validation:**

- Working directory is clean
- Latest CI run on main is successful
- Commit message is correct
- Tag exists and is correct

**If step fails:**

- Fix any issues found
- Do not push until everything is validated
- May need to delete tag and restart from Step 8

---

## Validation

After completing all steps, verify:

1. **Version Updated:**

   ```bash
   npm pkg get version
   # Expected: "X.Y.Z" (new version)
   ```

2. **CHANGELOG Updated:**

   ```bash
   head -n 20 CHANGELOG.md
   # Expected: New version section at top with today's date
   ```

3. **Build Passes:**

   ```bash
   npm run build && npm test
   # Expected: Build succeeds, all tests pass
   ```

4. **Commit Created:**

   ```bash
   git log -1 --oneline
   # Expected: "chore: prepare release vX.Y.Z"
   ```

5. **Tag Created:**

   ```bash
   git tag -l | tail -1
   # Expected: vX.Y.Z
   ```

6. **Not Pushed Yet:**

   ```bash
   git status
   # Expected: "Your branch is ahead of 'origin/main' by 1 commit"
   ```

## Troubleshooting

### Common Issues

#### Issue 1: Markdown Linting Failures

**Symptoms:**

- `npm run lint:md` fails with many errors
- CI/CD lint workflow is failing

**Resolution:**

```bash
# Run linting to see errors
npm run lint:md 2>&1 | tee lint-errors.txt

# Count errors
grep -c "MD0" lint-errors.txt

# Fix errors (see runbook: fix-markdown-lint for details)
# Common quick fixes:
# - Add blank lines around lists (MD032)
# - Add blank lines around code fences (MD031)
# - Fix ordered list numbering (MD029)

# Or document known issues in release notes if non-blocking
```

**Decision Point:**

- If < 20 errors: Fix before release
- If > 20 errors: Document in CHANGELOG under "Known Issues", fix in next release
- Never release if TypeScript compilation or tests fail

---

#### Issue 2: Version Conflict

**Symptoms:**

- `npm version` fails with "Git working directory not clean"
- Version was already bumped but commit was not completed

**Resolution:**

```bash
# Check what's modified
git status

# Option 1: Complete the previous version bump
git add package.json CHANGELOG.md
git commit -m "chore: prepare release vX.Y.Z"

# Option 2: Revert and start over
git checkout -- package.json
# Start again from Step 2
```

---

#### Issue 3: Tests Failing

**Symptoms:**

- `npm test` shows failures
- Tests were passing on main but failing now

**Resolution:**

```bash
# Run tests with verbose output
npm test -- --reporter spec

# Check if build is stale
rm -rf lib/
npm run build
npm test

# If tests still fail:
# 1. Fix the failing tests
# 2. Commit the fix
# 3. Restart release preparation

# Do not release with failing tests
```

---

#### Issue 4: Wrong Files in Package

**Symptoms:**

- `npm pack --dry-run` shows unexpected files
- Test installation doesn't work correctly

**Resolution:**

```bash
# Check current files configuration
npm pkg get files

# Update files array in package.json
npm pkg set files[]="/bin"
npm pkg set files[]="/lib"
npm pkg set files[]="/templates"
npm pkg set files[]="CHANGELOG.md"

# Rebuild and verify
npm run build
npm pack --dry-run

# Test again from Step 6
```

---

### When to Escalate

Escalate if:

- Critical bugs discovered during testing
- Breaking changes not properly documented
- Cannot resolve build failures
- Security vulnerabilities discovered
- Major CI/CD infrastructure issues

**Escalation Contact:**

- Repository maintainer
- Release manager
- Security team (for vulnerabilities)

## Post-Procedure

After completion:

- [ ] Release is prepared but NOT published yet
- [ ] Changes committed to local main branch
- [ ] Git tag created locally
- [ ] Ready to proceed to "Publish Package" runbook
- [ ] Do NOT push yet - pushing happens in publish runbook

## Quick Reference

### Command Summary

```bash
# Full prepare release workflow
git checkout main && git pull origin main
npm version minor --no-git-tag-version  # or patch/major
$EDITOR CHANGELOG.md
npm run build && npm test
npm pack --dry-run
VERSION=$(npm pkg get version | tr -d '"')
git add package.json CHANGELOG.md
git commit -m "chore: prepare release v${VERSION}"
git tag -a "v${VERSION}" -m "Release v${VERSION}"
```

## Notes

**Important Notes:**

- Never skip testing - broken releases damage trust
- Always use semantic versioning correctly
- CHANGELOG should tell a story users can understand
- Tag format must be `vX.Y.Z` (lowercase v)
- Do not push until publish runbook is followed

**Gotchas:**

- `npm version` creates git tags by default - we use `--no-git-tag-version` to control timing
- Tags must be pushed separately from commits: `git push --follow-tags`
- Once pushed to npm, versions cannot be unpublished after 72 hours

**Related Procedures:**

- [Publish Package](./publish-package.md) - next step after prepare release
- [CI/CD Health Check](./ci-cd-health-check.md) - if CI checks are failing

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-17 | @tnez | Initial creation |
