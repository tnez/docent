# Runbook: Publish Package

**Purpose:** Publish a new version of docent to npm registry
**Owner:** Maintainers
**Last Updated:** 2025-10-17
**Frequency:** After each release preparation (as needed)

## Overview

This runbook provides procedures for publishing the docent package to npm. This should be run immediately after the "Prepare Release" runbook.

**Expected duration:** 10-15 minutes

## Prerequisites

### Required Tools

- `git` command line tool
- `gh` CLI (GitHub CLI) - installed and authenticated
- `npm` - Node.js package manager with publish access
- Node.js >= 18.0.0

### Required Access

- npm account with publish access to `@tnezdev/docent`
- Write access to GitHub repository
- Ability to push tags

### Pre-Flight Checklist

Before starting, ensure:

- [ ] "Prepare Release" runbook completed successfully
- [ ] Release commit and tag created locally
- [ ] All tests passing: `npm test`
- [ ] Build successful: `npm run build`
- [ ] You are on main branch: `git branch --show-current`
- [ ] npm is logged in: `npm whoami`

## Procedure

### Step 1: Verify npm Authentication

**Purpose:** Ensure you have publish access to the package

**Commands:**

```bash
# Check if logged in to npm
npm whoami

# If not logged in:
npm login

# Verify access to @tnezdev scope
npm access ls-packages @tnezdev
```

**Validation:**

- `npm whoami` returns your npm username
- You have write access to `@tnezdev/docent`

**If step fails:**

- Run `npm login` and authenticate
- Contact package owner for publish permissions
- Check 2FA settings (npm requires 2FA for publishing)

---

### Step 2: Verify Release Preparation

**Purpose:** Confirm all preparation steps were completed

**Commands:**

```bash
# Verify version in package.json
npm pkg get version

# Verify CHANGELOG is updated
head -n 20 CHANGELOG.md

# Verify release commit exists
git log -1 --oneline | grep "chore: prepare release"

# Verify tag exists and points to HEAD
VERSION=$(npm pkg get version | tr -d '"')
git tag -l "v${VERSION}"
git describe --exact-match HEAD
```

**Validation:**

- Version number looks correct
- CHANGELOG has entry for this version with today's date
- Latest commit is the release preparation commit
- Git tag exists and matches version
- Tag points to HEAD

**If step fails:**

- Return to "Prepare Release" runbook
- Do not proceed with publishing until preparation is complete

---

### Step 3: Final Pre-Publish Validation

**Purpose:** Last verification before publishing

**Commands:**

```bash
# Verify working tree is clean
git status

# Run full test suite
npm test

# Verify package contents
npm pack --dry-run

# Check for security vulnerabilities
npm audit

# Verify CI is passing
gh run list --branch main --limit 3
```

**Validation:**

- Working directory is clean
- All tests pass (14 tests expected)
- Package contents look correct
- No critical security vulnerabilities
- Latest CI run on main is successful (or acceptable known issues)

**If step fails:**

- Fix any critical issues found
- Run `npm audit fix` if needed
- Commit fixes and create new tag
- Do not publish with failing tests or critical vulnerabilities

---

### Step 4: Publish to npm (Dry Run)

**Purpose:** Test publish without actually publishing

**Commands:**

```bash
# Perform dry-run publish
npm publish --dry-run

# Review output for warnings or errors
```

**Validation:**

- Dry run completes successfully
- Package size is reasonable (< 1MB)
- Correct files are included
- No errors or warnings (some warnings about package name are OK)

**If step fails:**

- Review errors carefully
- Fix any issues in package.json
- Do not proceed to actual publish

---

### Step 5: Publish to npm

**Purpose:** Publish the package to npm registry

**Commands:**

```bash
# Publish to npm (will prompt for 2FA if enabled)
npm publish --access public

# Verify publication
npm view @tnezdev/docent version
npm view @tnezdev/docent
```

**Validation:**

- Publish completes successfully
- New version appears on npm registry
- Package page shows correct version
- Published date is today

**If step fails:**

- If 2FA times out: run `npm publish --access public` again
- If version already exists: version was already published (check npm)
- If permission denied: verify npm login and access
- Contact npm support for registry issues

---

### Step 6: Push to GitHub

**Purpose:** Push release commit and tag to GitHub

**Commands:**

```bash
# Push commit and tags together
git push origin main --follow-tags

# Verify push succeeded
git status
gh run list --branch main --limit 3
```

**Validation:**

- Commit is pushed to origin/main
- Tag is pushed to origin
- GitHub shows the new tag
- CI/CD starts running on the new commit

**If step fails:**

- Check network connectivity
- Verify push permissions
- If tag push fails: `git push origin vX.Y.Z`
- Package is already on npm - cannot unpublish easily

---

### Step 7: Create GitHub Release

**Purpose:** Create a GitHub release from the tag

**Commands:**

```bash
# Get version
VERSION=$(npm pkg get version | tr -d '"')

# Extract release notes from CHANGELOG
# (Shows this version's section)
awk "/## \[${VERSION}\]/,/## \[/" CHANGELOG.md | head -n -2 | tail -n +3 > /tmp/release-notes.md

# Create GitHub release
gh release create "v${VERSION}" \
  --title "Release v${VERSION}" \
  --notes-file /tmp/release-notes.md

# Cleanup
rm /tmp/release-notes.md
```

**Validation:**

- GitHub release is created
- Release notes match CHANGELOG section
- Release is marked as latest
- Assets (tarball) are automatically added

**If step fails:**

- Create release manually via GitHub web UI
- Copy release notes from CHANGELOG.md
- Attach tarball if needed

---

### Step 8: Verify Installation

**Purpose:** Confirm package can be installed from npm

**Commands:**

```bash
# Wait 30 seconds for npm to propagate
sleep 30

# Test installation in temporary directory
mkdir -p /tmp/test-npm-install
cd /tmp/test-npm-install

# Install from npm registry
npm install @tnezdev/docent

# Verify version
./node_modules/.bin/docent --version 2>/dev/null || echo "Check binary"

# Check package structure
ls -la node_modules/@tnezdev/docent/

# Cleanup
cd -
rm -rf /tmp/test-npm-install
```

**Validation:**

- Package installs successfully
- Correct version is installed
- Binary exists and is executable
- Templates directory exists
- lib/ directory contains compiled code

**If step fails:**

- Wait longer for npm propagation (up to 5 minutes)
- Check npm registry status: https://status.npmjs.org/
- Verify publish actually succeeded: `npm view @tnezdev/docent version`

---

### Step 9: Update Documentation Links

**Purpose:** Update any version-specific documentation links (if applicable)

**Commands:**

```bash
# Check for hardcoded version references in README
grep -r "0\.[0-9]\.[0-9]" README.md docs/ | grep -v CHANGELOG.md | grep -v node_modules

# If found, update and commit (only if necessary)
```

**Validation:**

- No stale version references in documentation
- Links to npm badge show latest version
- Installation instructions reference correct version or use latest

**If step fails:**

- Not critical - can be fixed in follow-up PR
- Create issue to track documentation updates

---

### Step 10: Announce Release

**Purpose:** Notify users and contributors of new release

**Commands:**

```bash
# Get GitHub release URL
VERSION=$(npm pkg get version | tr -d '"')
echo "Release URL: https://github.com/tnez/docent/releases/tag/v${VERSION}"

# Get npm package URL
echo "npm URL: https://www.npmjs.com/package/@tnezdev/docent/v/${VERSION}"
```

**Validation:**

- Release notes are visible on GitHub
- Package is visible on npm
- Version number is correct in both places

**Announcement Channels (as applicable):**

- GitHub Discussions or Issues
- Project Discord/Slack
- Twitter/Social media
- Project blog/website
- Email to contributors list

**If step fails:**

- Announcements are optional
- Release is complete even without announcements

---

## Validation

After completing all steps, verify:

1. **Package on npm:**

   ```bash
   npm view @tnezdev/docent version
   # Expected: X.Y.Z (new version)
   ```

2. **GitHub Release Created:**

   ```bash
   gh release view "v$(npm pkg get version | tr -d '"')"
   # Expected: Shows release details
   ```

3. **Tag Pushed:**

   ```bash
   git ls-remote --tags origin | grep "v$(npm pkg get version | tr -d '"')"
   # Expected: Shows remote tag
   ```

4. **Can Install from npm:**

   ```bash
   npm view @tnezdev/docent
   # Expected: Shows package info with new version
   ```

5. **CI Passing:**

   ```bash
   gh run list --branch main --limit 3
   # Expected: Recent runs successful (or known issues documented)
   ```

## Troubleshooting

### Common Issues

#### Issue 1: npm Publish Permission Denied

**Symptoms:**

- `npm publish` fails with 403 Forbidden
- Error: "You do not have permission to publish"

**Resolution:**

```bash
# Verify you're logged in
npm whoami

# Check package access
npm access ls-packages @tnezdev

# If not in list, request access from package owner
# If access listed, try logging in again:
npm logout
npm login

# Verify 2FA is configured
npm profile get
```

---

#### Issue 2: Version Already Published

**Symptoms:**

- `npm publish` fails with "cannot publish over existing version"

**Resolution:**

```bash
# Check what version is on npm
npm view @tnezdev/docent version

# Check local version
npm pkg get version

# If versions match, package was already published
# Either:
# 1. Skip npm publish step (already done)
# 2. Bump version and re-prepare release

# Cannot unpublish after 72 hours!
```

---

#### Issue 3: Git Push Rejected

**Symptoms:**

- `git push` fails with "rejected" or "non-fast-forward"

**Resolution:**

```bash
# Check remote status
git fetch origin
git status

# If behind remote:
git pull --rebase origin main

# Resolve any conflicts
# Try push again
git push origin main --follow-tags

# If still fails, force push (USE WITH CAUTION):
# git push origin main --force-with-lease --follow-tags
```

---

#### Issue 4: Tag Already Exists Remotely

**Symptoms:**

- Tag push fails with "already exists"
- Someone else pushed the tag

**Resolution:**

```bash
# Verify remote tag
git ls-remote --tags origin | grep "vX.Y.Z"

# Compare with local tag
git show vX.Y.Z

# If tags are identical: skip tag push
# If different: delete remote tag (DANGER - coordinate with team)
# git push origin :refs/tags/vX.Y.Z
# git push origin vX.Y.Z
```

---

#### Issue 5: npm Registry Issues

**Symptoms:**

- Publish hangs or times out
- npm registry unreachable

**Resolution:**

```bash
# Check npm status
curl https://status.npmjs.org/

# Try again after a few minutes
npm publish --access public

# If persistent, check npm blog:
# https://status.npmjs.org/
# May need to delay publish

# Package can be published later - main and tag are safe
```

---

### When to Escalate

Escalate if:

- npm registry is down for extended period
- Permission issues cannot be resolved
- Critical security vulnerability discovered after publish
- Broken package published (requires quick fix)
- Major CI/CD issues blocking verification

**Escalation Contact:**

- npm support (for registry issues)
- Package owner (for permissions)
- Security team (for vulnerabilities)
- Repository maintainer

## Post-Procedure

After completion:

- [ ] Package published to npm
- [ ] Git tag pushed to GitHub
- [ ] GitHub release created
- [ ] Installation verified
- [ ] Announcements sent (if applicable)
- [ ] Monitor for issues in first 24 hours
- [ ] Close related issues/PRs

## Quick Reference

### Command Summary

```bash
# Full publish workflow (after prepare-release)
npm whoami
npm test && npm run build
npm publish --dry-run
npm publish --access public
git push origin main --follow-tags
VERSION=$(npm pkg get version | tr -d '"')
gh release create "v${VERSION}" --title "Release v${VERSION}" --notes-file <(awk "/## \[${VERSION}\]/,/## \[/" CHANGELOG.md | head -n -2 | tail -n +3)
```

### Rollback Procedure (Emergency)

If critical bug discovered immediately after publish:

```bash
# 1. Deprecate the version
npm deprecate @tnezdev/docent@X.Y.Z "Critical bug - use X.Y.Z+1"

# 2. Prepare hot fix
npm version patch --no-git-tag-version
# Fix the bug
npm run build && npm test

# 3. Re-publish immediately
git add package.json CHANGELOG.md
git commit -m "chore: hotfix vX.Y.Z+1"
git tag -a "vX.Y.Z+1" -m "Hotfix vX.Y.Z+1"
npm publish --access public
git push origin main --follow-tags
```

## Notes

**Important Notes:**

- Once published to npm, cannot unpublish after 72 hours
- npm package names are permanent - choose wisely
- Always test installation after publishing
- GitHub releases are separate from npm - both needed
- Monitor for issues in first 24-48 hours after release

**Gotchas:**

- npm 2FA tokens expire quickly - have authenticator ready
- `--follow-tags` only pushes annotated tags
- npm propagation can take a few minutes
- GitHub release asset (tarball) auto-generated from tag
- Version must be bumped even for re-publish after fix

**Related Procedures:**

- [Prepare Release](./prepare-release.md) - must complete before this runbook
- [CI/CD Health Check](./ci-cd-health-check.md) - if CI is failing after push

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-17 | @tnez | Initial creation |
