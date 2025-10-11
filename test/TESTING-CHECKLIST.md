# Testing Checklist

Complete this checklist before each release to ensure quality.

## Pre-Release Testing

### Automated Tests

- [ ] All unit tests pass (`./test/test-install.sh`)
- [ ] GitHub Actions CI passing on all platforms
- [ ] ShellCheck linting passes
- [ ] Markdown linting passes

### Installation Testing

#### Fresh Installation
- [ ] Clean directory installation works
- [ ] All templates are copied correctly
- [ ] Directory structure is created properly
- [ ] File permissions are correct

#### Selective Installation
- [ ] Can install single template (`--templates=adr`)
- [ ] Can install multiple templates (`--templates=adr,rfc`)
- [ ] Can install all templates (`--templates=all`)
- [ ] Invalid template names are handled gracefully

#### Conflict Handling
- [ ] Detects existing templates
- [ ] Skip mode preserves existing files
- [ ] Force mode overwrites files
- [ ] Backup mode creates backups
- [ ] Interactive mode prompts correctly

#### Advanced Options
- [ ] Custom target directory works (`--target-dir`)
- [ ] Dry-run shows accurate preview
- [ ] Non-interactive mode completes without prompts
- [ ] Help message is clear and accurate
- [ ] Version command shows correct version

### Uninstallation Testing

- [ ] Removes installed templates
- [ ] Preserves non-template files
- [ ] Dry-run mode works correctly
- [ ] Force mode skips confirmation
- [ ] Removes empty docs/ directory when appropriate

### Platform Testing

#### macOS
- [ ] Fresh installation
- [ ] Update installation
- [ ] Uninstallation
- [ ] Dry-run mode
- [ ] bash shell
- [ ] zsh shell

#### Linux (Ubuntu)
- [ ] Fresh installation
- [ ] Update installation
- [ ] Uninstallation
- [ ] Dry-run mode
- [ ] bash shell

#### Windows WSL (if available)
- [ ] Fresh installation
- [ ] Update installation
- [ ] Uninstallation
- [ ] Path handling correct

### Edge Cases

- [ ] No write permissions - fails gracefully
- [ ] Missing templates directory - warns appropriately
- [ ] Interrupted installation - rollback works
- [ ] Very long file paths - handled correctly
- [ ] Special characters in project names - handled correctly

### Documentation Testing

- [ ] README installation instructions accurate
- [ ] All command-line examples work
- [ ] Help output matches documentation
- [ ] Error messages are helpful

### Template Validation

- [ ] All templates render correctly in GitHub
- [ ] No broken markdown formatting
- [ ] Examples are clear and realistic
- [ ] TODO markers are appropriate
- [ ] File headers are correct

## Post-Release Monitoring

### First 24 Hours
- [ ] Monitor GitHub Issues for bug reports
- [ ] Check GitHub Actions for any failures
- [ ] Verify installation works from fresh clone
- [ ] Check for any critical bugs

### First Week
- [ ] Review any reported issues
- [ ] Gather user feedback
- [ ] Document common problems
- [ ] Plan hotfixes if needed

## Test Environments

Document platforms tested:

| Platform | Version | Status | Date | Tester |
|----------|---------|--------|------|--------|
| macOS    |         | ⬜     |      |        |
| Ubuntu   |         | ⬜     |      |        |
| WSL      |         | ⬜     |      |        |

Legend:
- ⬜ Not tested
- ✅ Passing
- ❌ Failing
- ⚠️ Issues found

## Notes

Add any testing notes, issues encountered, or workarounds here:

---

**Checklist Last Updated:** 2025-10-11
**Version Tested:** v0.2.0-alpha
