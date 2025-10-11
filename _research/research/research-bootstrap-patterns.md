# Bootstrap and Installation Script Patterns Research

## Overview

This research examines installation and bootstrap patterns from successful one-line installers to understand effective approaches for setting up project documentation templates.

---

## 1. Oh My Zsh

**Installation Command**:
```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

**Alternative**:
```bash
sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

### Pattern Analysis

#### Installation Approach

**curl Pipeline Pattern**:
- Downloads script from known URL
- Pipes directly to shell interpreter
- Uses `-fsSL` flags for silent, fail-fast, location-following
- No intermediate file required

**Installation Script Responsibilities**:
- Downloads complete Oh My Zsh framework
- Sets Zsh as default login shell (no manual `chsh` needed)
- Creates backup of existing configuration
- Installs default theme and plugins
- Completes in seconds

#### User Experience

**Simplicity**:
- Single command to go from zero to configured
- No prerequisites check required
- Automatic shell switching
- Immediate usability

**Safety**:
- Backs up existing `.zshrc`
- Non-destructive installation
- Can be uninstalled
- Clear success/failure indication

### Key Principles

1. **Single command installation**: Maximum simplicity
2. **Automatic configuration**: No manual setup steps
3. **Backup existing config**: Safety before modification
4. **Default choices**: Sensible defaults, customization later
5. **Fast feedback**: Installation completes in seconds
6. **Immediate usability**: Working configuration immediately

### What Makes It Effective

**Viral adoption**:
- Extreme simplicity lowers barrier to trial
- Copy-paste from README to installed
- No decision fatigue
- Immediate gratification

**Trust through transparency**:
- Installation script is public
- Can review before running
- Well-known, established project
- Clear source URL

### Patterns to Adopt

1. **One-line installer**: Reduce installation to single command
2. **Sensible defaults**: Choose good defaults, enable customization later
3. **Backup automatically**: Protect user's existing configuration
4. **Fast completion**: Optimize for quick feedback
5. **Clear success message**: User knows installation worked

---

## 2. Homebrew

**Installation Command**:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Pattern Analysis

#### Idempotency Journey

Homebrew has worked toward making installation and operations idempotent:

**Installation Idempotency Challenges**:
- Post-installation PATH setup not initially idempotent
- Running installer twice could duplicate PATH entries
- Community pushed for fully idempotent installation

**Command Idempotency**:
- `brew install <package>` made idempotent (can run multiple times safely)
- `brew upgrade` returns consistent exit codes
- Previously, outdated packages caused exit code 1, breaking idempotency

**Solution Approach**:
- `brew shellenv` designed for idempotence
- Produces no output when PATH already correct
- Can be called repeatedly without side effects
- Proposed: auto-detect existing configuration, don't duplicate

#### Error Handling

**Previous Issues**:
- Formulas not linked properly caused inconsistent exit codes
- Outdated packages returned non-zero exit, breaking CI/CD
- PATH configuration could be added multiple times

**Improvements**:
- Consistent exit codes for all operations
- Idempotent install/upgrade commands
- Better feedback on what changed vs what was already correct

#### Installation Process

**Post-Install Configuration**:
- Homebrew must be added to PATH
- Uses `brew shellenv` for shell configuration
- Needs to detect user's shell (zsh, bash, fish)
- Must modify appropriate shell startup file

**User Guidance**:
- Clear instructions after installation
- Tells user what to add to shell config
- Provides exact commands to run
- Indicates when setup is complete

### Key Principles

1. **Idempotency**: Running installer twice is safe and produces same result
2. **Smart detection**: Detect existing configuration, don't duplicate
3. **Clear feedback**: Tell user what was done vs what was already correct
4. **Consistent exit codes**: Predictable behavior for automation
5. **PATH management**: Handle shell configuration intelligently

### What Makes It Effective

**Production-ready operations**:
- Idempotency enables automation
- Consistent behavior across runs
- Safe for CI/CD environments
- Reduces cognitive load

**Error prevention**:
- Prevents duplicate PATH entries
- Detects and handles existing installations
- Provides recovery mechanisms
- Clear error messages

### Patterns to Adopt

1. **Idempotent operations**: Running installer multiple times safe and consistent
2. **Detect before modify**: Check existing state before making changes
3. **Consistent exit codes**: Same result = same exit code
4. **Shell detection**: Identify user's shell, modify correct config file
5. **Clear post-install instructions**: Tell user exactly what to do next

---

## 3. Rustup

**Installation Command**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Pattern Analysis

#### Interactive vs Non-Interactive

**Interactive Installation (Default)**:
- Queries user for input
- Offers options: "1", "2", or "3"
- Allows customization during install
- User can accept defaults or customize

**Non-Interactive Installation**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain none -y
```
- Flags passed through shell script to rustup-init
- `-y` flag accepts defaults
- `--default-toolchain` customizes installation
- Enables automated/scripted installation

#### Installation Architecture

**Two-Stage Bootstrap**:
1. Download `rustup-init.sh` shell script
2. Script downloads correct `rustup-init` executable for platform
3. Executable performs actual installation

**Platform Detection**:
- Automatically detects OS and architecture
- Downloads appropriate binary
- Handles platform-specific configuration
- Sets up toolchain for detected platform

#### Customization Options

**Environment Variables**:
- `CARGO_HOME`: Customize installation location
- `RUSTUP_HOME`: Rustup metadata location
- Set before running installer
- Enables non-standard installations

**Command-Line Flags**:
- `--default-toolchain`: Choose initial toolchain (stable, beta, nightly, none)
- `--default-host`: Override platform detection
- `--profile`: Choose installation profile (minimal, default, complete)
- `-y`: Non-interactive mode

**Post-Install Configuration**:
- `rustup set default-host`: Change default platform
- `rustup default`: Change default toolchain
- `rustup update`: Update toolchains
- Configuration changes without reinstall

### Key Principles

1. **Interactive by default, scriptable when needed**: Best of both worlds
2. **Two-stage bootstrap**: Shell script downloads appropriate binary
3. **Platform awareness**: Detect and configure for user's system
4. **Customization points**: Environment variables and flags for control
5. **Post-install reconfiguration**: Change choices without reinstall

### What Makes It Effective

**Flexibility**:
- Serves both manual and automated installation
- Customizable without complexity
- Sensible defaults for interactive users
- Full control for automation

**Cross-platform**:
- Single installation command across platforms
- Platform detection automatic
- Platform-specific handling transparent
- Consistent experience

**Security**:
- HTTPS with TLS 1.2+ required
- Fail on download errors (`-f` flag)
- Verifiable installation script
- Clear source of installation binary

### Patterns to Adopt

1. **Interactive with automation support**: Default to interactive, support flags for automation
2. **Platform detection**: Auto-detect and configure for user's environment
3. **Environment variable configuration**: Allow customization without flags
4. **Two-stage bootstrap**: Shell wrapper downloads appropriate installer
5. **Security-first**: Require secure connections, fail on errors

---

## 4. npm create / yarn create

**Usage Pattern**:
```bash
npm create vite@latest
yarn create vite
pnpm create vite
```

### Pattern Analysis

#### Convention-Based Execution

**Package Naming Convention**:
- `npm create <foo>` executes package named `create-<foo>`
- Installed globally or updated to latest
- Main binary executed via `npm exec`
- Consistent pattern across ecosystem

**Execution Flow**:
1. User runs `npm create vite@latest`
2. npm installs/updates `create-vite` package
3. npm executes main bin of `create-vite`
4. Package runs interactive scaffolding
5. New project created based on user choices

#### Interactive Scaffolding

**User Experience**:
- Asks project name
- Offers framework choices (React, Vue, Svelte, etc.)
- Offers variant choices (TypeScript, JavaScript)
- Creates project with chosen configuration
- Provides next steps

**Progressive Disclosure**:
- Only ask necessary questions
- Provide sensible defaults
- Show what will be created
- Confirm before proceeding

#### Package Structure

**Typical create-* Package**:
```
create-foo/
├── package.json          # Main entry point in "bin"
├── templates/            # Project templates
│   ├── react/
│   ├── vue/
│   └── vanilla/
├── index.js              # Scaffolding logic
└── prompts.js            # Interactive prompts
```

**Responsibilities**:
- Present choices to user
- Validate user input
- Copy template files
- Perform string replacement (project name, etc.)
- Install dependencies (optional)
- Initialize git repository (optional)
- Display next steps

### Key Principles

1. **Convention over configuration**: Naming convention makes behavior predictable
2. **Always latest**: Ensures users get current templates
3. **Interactive by default**: Guide users through choices
4. **Template-based**: Maintain templates for each variant
5. **Actionable next steps**: Tell users what to do after creation

### What Makes It Effective

**Ecosystem consistency**:
- Same pattern across frameworks
- Users learn once, apply everywhere
- Predictable behavior
- Low cognitive load

**Template maintenance**:
- Templates separate from scaffolding logic
- Easy to update templates
- Version templates with package
- Test templates independently

**User guidance**:
- Interactive prompts reduce errors
- Validation prevents invalid choices
- Next steps reduce confusion
- Working project immediately

### Patterns to Adopt

1. **Convention-based naming**: Use predictable naming pattern
2. **Template structure**: Separate templates from logic
3. **Interactive prompts**: Guide users through choices
4. **Validation**: Prevent invalid configurations
5. **Next steps**: Show users what to do after installation

---

## 5. Cross-Pattern Analysis

### Common Success Patterns

#### 1. Single Command Installation

All successful installers reduce installation to one command:
- Copy-paste from documentation
- No prerequisite installation steps
- Works across platforms (where applicable)
- Minimal cognitive load

#### 2. Sensible Defaults

All provide good defaults:
- Interactive: suggest defaults, allow customization
- Non-interactive: use sensible defaults
- Defaults work for majority use case
- Customization available for edge cases

#### 3. Idempotency

Mature installers are idempotent:
- Safe to run multiple times
- Detect existing installations
- Skip already-completed steps
- Consistent exit codes

#### 4. Platform Awareness

Successful installers detect platform:
- Auto-detect OS and architecture
- Configure appropriately for platform
- Handle platform-specific requirements
- Provide platform-specific instructions

#### 5. Error Handling

All handle errors gracefully:
- Fail fast on errors
- Clear error messages
- Suggest remediation
- Safe failure (no partial state)

#### 6. Security Considerations

All prioritize security:
- HTTPS for downloads
- Verifiable sources
- Fail on download errors
- Transparent about what will be installed

#### 7. User Feedback

All provide clear feedback:
- Show progress during installation
- Clear success message
- Clear error messages
- Next steps after installation

### Installation Patterns Comparison

| Project | Command Pattern | Interactive | Idempotent | Platform Detection | Security |
|---------|----------------|-------------|------------|-------------------|----------|
| **Oh My Zsh** | curl \| sh | No | Partial | Manual | HTTPS |
| **Homebrew** | curl \| bash | Minimal | Yes | Yes | HTTPS, verified |
| **Rustup** | curl \| sh | Yes (optional) | Yes | Yes | HTTPS + TLS 1.2+ |
| **npm create** | npm create | Yes | N/A | N/A | npm registry |

### Anti-Patterns Observed

#### 1. Multi-Step Manual Installation

Projects requiring multiple manual steps see lower adoption:
- Each step adds friction
- Users forget steps
- Documentation goes stale
- Support burden increases

#### 2. No Idempotency

Scripts that can't be run multiple times create issues:
- Users afraid to retry on failure
- CI/CD complexity increases
- Duplicate configuration entries
- Unclear if installation succeeded

#### 3. Silent Failures

Scripts that fail silently create confusion:
- Users think installation succeeded
- Delayed error discovery
- Difficult to debug
- Support burden increases

#### 4. No Rollback

Scripts that can't be undone create fear:
- Users hesitant to try
- Adoption barrier increases
- Need to provide manual uninstall docs
- Testing becomes difficult

#### 5. Hardcoded Assumptions

Scripts with hardcoded paths/values fail edge cases:
- Assumes specific directory structure
- Assumes specific shell
- Assumes specific OS version
- Fails on non-standard setups

---

## Implementation Recommendations

### For Documentation Template Bootstrap

Based on analysis of successful installation patterns, a documentation template installer should:

#### 1. Single Command Installation

**Approach**:
```bash
curl -fsSL https://raw.githubusercontent.com/user/repo/main/install.sh | bash
```

Or via npm/yarn if targeting JavaScript projects:
```bash
npm create project-docs
```

#### 2. Interactive with Automation Support

**Interactive Mode** (default):
```bash
./install.sh
```
- Ask for project name
- Ask for documentation type (library, application, framework)
- Ask for language/framework (Go, Rust, JavaScript, Python, etc.)
- Confirm choices before proceeding

**Non-Interactive Mode** (for CI/CD):
```bash
./install.sh --non-interactive --name "my-project" --type library --lang go
```

#### 3. Idempotent Operation

**Detection**:
- Check if `docs/` directory exists
- Check if documentation files already present
- Warn user if overwriting
- Offer to backup existing docs

**Safe Re-run**:
- Running installer twice produces same result
- Skip already-completed steps
- Update only changed files
- Clear indication of what was done

#### 4. Template Selection

**Templates by Project Type**:
- Library documentation template
- Application documentation template
- Framework documentation template
- CLI tool documentation template

**Templates by Language/Framework**:
- Language-specific example code
- Framework-specific conventions
- Appropriate build tooling
- Community expectations

#### 5. Minimal Configuration

**Required Information**:
- Project name (default from directory name)
- Project type (default: library)
- Language/framework (attempt detection from existing files)

**Optional Information**:
- Author name/organization
- License
- Repository URL
- Documentation URL

#### 6. Post-Installation Actions

**What the installer does**:
- Create `docs/` directory structure
- Copy template files
- Perform string replacement (project name, etc.)
- Create initial README.md (if not exists)
- Initialize git if not already initialized
- Add documentation build scripts (if applicable)

**What the installer tells user to do**:
```
✓ Documentation structure created at ./docs/

Next steps:
  1. Review docs/README.md for documentation overview
  2. Edit docs/getting-started.md with your getting started guide
  3. Run `npm run docs:dev` to preview documentation locally
  4. Commit your documentation to version control

Learn more: https://github.com/user/repo#readme
```

#### 7. Error Handling

**Fail Fast**:
- Check prerequisites before starting
- Validate inputs before proceeding
- Stop on first error
- Clean up partial state on error

**Clear Error Messages**:
```
✗ Error: docs/ directory already exists

To overwrite existing documentation:
  ./install.sh --force

To backup existing documentation:
  ./install.sh --backup

To use a different directory:
  ./install.sh --dir other-docs
```

#### 8. Security Considerations

**Download Security**:
- Use HTTPS for all downloads
- Verify checksums if applicable
- Fail on download errors
- Don't execute untrusted code

**File System Safety**:
- Don't overwrite without confirmation
- Backup before destructive operations
- Use safe temporary directories
- Clean up on error

### Example Installation Script Structure

```bash
#!/bin/bash
set -euo pipefail  # Fail fast

# Configuration
DOCS_DIR="docs"
FORCE=false
NON_INTERACTIVE=false
BACKUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --force) FORCE=true; shift ;;
    --non-interactive) NON_INTERACTIVE=true; shift ;;
    --backup) BACKUP=true; shift ;;
    --name) PROJECT_NAME="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Detect project name from directory
PROJECT_NAME="${PROJECT_NAME:-$(basename "$(pwd)")}"

# Check if docs already exist
if [ -d "$DOCS_DIR" ] && [ "$FORCE" != true ]; then
  echo "✗ Error: $DOCS_DIR already exists"
  echo "Use --force to overwrite or --backup to backup first"
  exit 1
fi

# Interactive prompts (if not non-interactive)
if [ "$NON_INTERACTIVE" != true ]; then
  read -p "Project name [$PROJECT_NAME]: " input
  PROJECT_NAME="${input:-$PROJECT_NAME}"

  echo "Project type:"
  echo "  1) Library"
  echo "  2) Application"
  echo "  3) Framework"
  read -p "Choose [1]: " PROJECT_TYPE
  PROJECT_TYPE="${PROJECT_TYPE:-1}"
fi

# Backup existing docs if requested
if [ "$BACKUP" = true ] && [ -d "$DOCS_DIR" ]; then
  BACKUP_DIR="${DOCS_DIR}.backup.$(date +%s)"
  mv "$DOCS_DIR" "$BACKUP_DIR"
  echo "✓ Backed up existing docs to $BACKUP_DIR"
fi

# Create directory structure
echo "Creating documentation structure..."
mkdir -p "$DOCS_DIR"/{getting-started,guides,reference,concepts}

# Copy template files
echo "Installing template files..."
# (Template file copying logic here)

# Perform replacements
echo "Configuring for project '$PROJECT_NAME'..."
# (String replacement logic here)

# Success message and next steps
echo ""
echo "✓ Documentation structure created at ./$DOCS_DIR/"
echo ""
echo "Next steps:"
echo "  1. Review $DOCS_DIR/README.md"
echo "  2. Edit $DOCS_DIR/getting-started.md"
echo "  3. Commit to version control"
echo ""
```

---

## Key Takeaways

### Essential Properties of Good Installers

1. **Simplicity**: Single command to install
2. **Safety**: Idempotent, non-destructive, recoverable
3. **Flexibility**: Interactive for users, scriptable for automation
4. **Clarity**: Clear feedback, errors, and next steps
5. **Security**: HTTPS, verification, fail-fast
6. **Platform-aware**: Detect and adapt to environment

### Implementation Priorities

**Phase 1: Basic Bootstrap**
- Single command installation
- Interactive prompts
- Template directory creation
- Basic string replacement

**Phase 2: Safety and Polish**
- Idempotency
- Backup capability
- Better error messages
- Validation

**Phase 3: Advanced Features**
- Non-interactive mode
- Multiple template types
- Platform detection
- Customization options

### Measurement of Success

A successful installer should:
- Reduce time-to-first-documentation to < 2 minutes
- Require zero manual configuration steps
- Work correctly on first run for 95%+ of users
- Provide clear next steps
- Enable immediate contribution to documentation

---

## Citations and Further Reading

- **Oh My Zsh**: https://ohmyz.sh/
- **Homebrew**: https://brew.sh/
- **Rustup**: https://rustup.rs/
- **npm create**: https://docs.npmjs.com/cli/v8/commands/npm-init
- **Homebrew Idempotency Discussion**: https://github.com/Homebrew/brew/issues/11393
- **Rustup Installation Methods**: https://rust-lang.github.io/rustup/installation/other.html

---

*Research conducted: 2025-10-11*
