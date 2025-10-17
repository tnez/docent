# Installation Scripts

Docent provides installation scripts that allow users to install documentation templates from the npm package into their projects.

## Available Scripts

### install.sh

**Location:** `/Users/tnez/Code/tnez/docent/scripts/install.sh`

Installs documentation templates from the docent package into a target project directory.

**Usage:**

```bash
# Interactive mode - prompts for template selection
./scripts/install.sh

# Install specific templates
./scripts/install.sh --templates=adr,rfc,runbook

# Install all templates non-interactively
./scripts/install.sh --templates=all --non-interactive

# Install to custom directory
./scripts/install.sh --target-dir=documentation

# Dry run to preview changes
./scripts/install.sh --dry-run

# Force overwrite existing files
./scripts/install.sh --force

# Backup existing files before overwriting
./scripts/install.sh --backup
```

**Available Templates:**
- `adr-template.md` - Architecture Decision Records
- `rfc-template.md` - Request for Comments
- `runbook-template.md` - Operational procedures
- `api-documentation-template.md` - API reference docs
- `architecture-overview-template.md` - System design docs
- `onboarding-template.md` - Developer onboarding guides
- `patterns-template.md` - Architectural patterns catalog
- `prd-template.md` - Product Requirements Documents
- `spec-template.md` - Feature specifications
- And more...

**Features:**
- Interactive template selection
- Atomic installation with rollback on failure
- Pre-flight checks for permissions and conflicts
- Transaction logging for debugging
- Backup existing files before overwriting

**Used By:**
- CI/CD workflows (`.github/workflows/test.yml`)
- Developer setup (`CONTRIBUTING.md`)
- Operational runbooks (`docs/runbooks/ci-cd-health-check.md`)

### uninstall.sh

**Location:** `/Users/tnez/Code/tnez/docent/scripts/uninstall.sh`

Safely removes docent-managed documentation templates from a project.

**Usage:**

```bash
# Interactive mode - prompts for confirmation
./scripts/uninstall.sh

# Force removal without prompts
./scripts/uninstall.sh --force --non-interactive

# Dry run to preview deletions
./scripts/uninstall.sh --dry-run
```

**Features:**
- Detects customized templates and warns before deletion
- Transaction logging for debugging
- Rollback capability on errors
- Preserves git history

## Testing

Both scripts are tested in CI/CD:

```yaml
# .github/workflows/test.yml
- name: Test install script
  run: $GITHUB_WORKSPACE/scripts/install.sh --templates=all --non-interactive

- name: Test uninstall script
  run: $GITHUB_WORKSPACE/scripts/uninstall.sh --force --non-interactive
```

Local testing:

```bash
# Run installation test suite
./test/test-install.sh
```

## Implementation Details

Both scripts:
- Use bash 3.0+ for cross-platform compatibility
- Implement proper error handling with `set -eo pipefail`
- Support both macOS and Linux
- Explicitly reject native Windows (WSL required)
- Provide colored output for better UX
- Include comprehensive help text

## Common Use Cases

### For Package Users

```bash
# After installing @tnezdev/docent
npx @tnezdev/docent install

# Or use npx directly
npx -y @tnezdev/docent install --templates=adr,rfc
```

### For Contributors

```bash
# Test locally during development
./scripts/install.sh --dry-run /tmp/test-project

# Run full test suite
npm test
```

## Error Handling

Both scripts implement:
- Transaction logging to temporary files
- Automatic cleanup on exit
- Rollback on interruption (SIGINT/SIGTERM)
- Clear error messages with suggested fixes

## Future Enhancements

Potential improvements tracked in issues:
- Configuration file support (`.docentrc`)
- Template customization during installation
- Selective template updates
- Merge strategies for modified templates
