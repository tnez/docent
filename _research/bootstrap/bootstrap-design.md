# Bootstrap Installation Script Design

## Overview

This document details the complete design and implementation strategy for the documentation template bootstrap installer. The installer enables teams to set up comprehensive project documentation with a single command.

**Installation Command**:
```bash
curl -fsSL https://raw.githubusercontent.com/user/project-docs-template/main/install.sh | bash
```

---

## Design Principles

Based on research of successful installation patterns (Oh My Zsh, Homebrew, Rustup, npm create), our installer follows these core principles:

1. **Single Command Installation** - Minimal friction, copy-paste ready
2. **Idempotent Operation** - Safe to run multiple times, produces consistent results
3. **Interactive with Automation Support** - Default to interactive, support flags for CI/CD
4. **Non-Destructive** - Never overwrite without explicit confirmation
5. **Fail-Fast with Clear Errors** - Stop on errors, provide actionable guidance
6. **Security-First** - HTTPS downloads, input validation, safe defaults
7. **Platform-Aware** - Detect environment and adapt accordingly
8. **Rollback Capability** - Can undo installation cleanly

---

## Installation Flow

### High-Level Flow

```
┌─────────────────────────────────────┐
│ User runs installation command      │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 1. Pre-flight Checks                │
│    - Check for bash/sh              │
│    - Check for curl/wget            │
│    - Check write permissions        │
│    - Check existing docs/           │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 2. Project Detection                │
│    - Detect language (package.json, │
│      Cargo.toml, go.mod, etc.)      │
│    - Detect project name (dirname)  │
│    - Detect existing git repo       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 3. Interactive Configuration        │
│    (or use config file/flags)       │
│    - Project name                   │
│    - Project type (library, app)    │
│    - Primary language               │
│    - Optional features              │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 4. Confirmation & Dry Run           │
│    - Show what will be created      │
│    - Confirm with user (Y/n)        │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 5. Template Installation            │
│    - Download template files        │
│    - Create directory structure     │
│    - Copy templates to docs/        │
│    - Apply customizations           │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 6. Post-Install Configuration       │
│    - Replace placeholders           │
│    - Initialize git (if needed)     │
│    - Setup .gitignore entries       │
│    - Create .gitkeep files          │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 7. Validation                       │
│    - Verify structure created       │
│    - Validate placeholders replaced │
│    - Check file permissions         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ 8. Success & Next Steps             │
│    - Display success message        │
│    - Show next actions              │
│    - Save installation config       │
└─────────────────────────────────────┘
```

### Detailed Step-by-Step Flow

#### Phase 1: Pre-Flight Checks

**Purpose**: Validate environment before attempting installation.

**Checks**:
1. Shell compatibility (bash 3.2+)
2. Required commands available (curl or wget, git)
3. Write permission in target directory
4. Check if docs/ directory exists
5. Check if previous installation exists

**Decision Points**:
- If docs/ exists and not empty:
  - Non-interactive mode: Exit with error
  - Interactive mode: Offer options (backup, overwrite, abort)
- If curl not available but wget is: Use wget
- If neither curl nor wget: Exit with installation instructions
- If no git: Continue but warn about git functionality

**Output**:
- Green checkmarks for passed checks
- Yellow warnings for non-critical issues
- Red errors for fatal problems
- Clear next steps if checks fail

#### Phase 2: Project Detection

**Purpose**: Auto-detect project context to provide smart defaults.

**Detection Logic**:

```bash
# Language detection by configuration files
if [ -f "package.json" ]; then
  DETECTED_LANGUAGE="JavaScript/TypeScript"
  DETECTED_TYPE="application" # or library if "type": "library"
elif [ -f "Cargo.toml" ]; then
  DETECTED_LANGUAGE="Rust"
  DETECTED_TYPE="library" # or binary if [[bin]]
elif [ -f "go.mod" ]; then
  DETECTED_LANGUAGE="Go"
  DETECTED_TYPE="application" # or library based on main.go
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  DETECTED_LANGUAGE="Python"
  DETECTED_TYPE="library" # or application based on structure
elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
  DETECTED_LANGUAGE="Java"
  DETECTED_TYPE="application"
elif [ -f "Gemfile" ]; then
  DETECTED_LANGUAGE="Ruby"
  DETECTED_TYPE="application"
elif [ -f "composer.json" ]; then
  DETECTED_LANGUAGE="PHP"
  DETECTED_TYPE="application"
fi

# Project name from directory
PROJECT_NAME=$(basename "$(pwd)")

# Git detection
if [ -d ".git" ]; then
  GIT_INITIALIZED=true
  # Try to get remote URL
  GIT_REMOTE=$(git config --get remote.origin.url 2>/dev/null || echo "")
else
  GIT_INITIALIZED=false
fi
```

**Fallbacks**:
- If no language detected: Default to "Other" with generic templates
- If no project name: Prompt user
- If no git: Offer to initialize

#### Phase 3: Interactive Configuration

**Purpose**: Gather customization details from user (unless non-interactive).

**Questions & Flow**:

```
┌──────────────────────────────────────────────────────────┐
│ Project Documentation Setup                               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Detected: JavaScript project in "my-app"                  │
│                                                           │
│ ? Project name: (my-app) _                               │
│                                                           │
└──────────────────────────────────────────────────────────┘

After project name:

┌──────────────────────────────────────────────────────────┐
│ ? Project type:                                          │
│   ❯ Application (web app, mobile app, desktop app)       │
│     Library/Package (reusable code)                       │
│     Framework (platform for other developers)             │
│     CLI Tool (command-line utility)                       │
│     Other                                                 │
│                                                           │
│   [Use arrows to move, enter to select]                  │
└──────────────────────────────────────────────────────────┘

After project type:

┌──────────────────────────────────────────────────────────┐
│ ? Primary language: (JavaScript/TypeScript) _            │
│                                                           │
│   Common choices: JavaScript, TypeScript, Python,        │
│   Rust, Go, Java, Ruby, PHP, C++, C#                     │
└──────────────────────────────────────────────────────────┘

After language:

┌──────────────────────────────────────────────────────────┐
│ ? Framework (optional): _                                │
│                                                           │
│   Examples: React, Vue, Angular, Express, Next.js        │
│   Press enter to skip                                     │
└──────────────────────────────────────────────────────────┘

After framework:

┌──────────────────────────────────────────────────────────┐
│ ? Install optional components:                           │
│   [✓] Examples directory (recommended)                   │
│   [✓] CI/CD workflow templates                           │
│   [✓] Claude Code integration                            │
│   [ ] Vale prose linter config                           │
│   [ ] API reference generation setup                     │
│                                                           │
│   [Space to toggle, enter when done]                     │
└──────────────────────────────────────────────────────────┘
```

**Non-Interactive Mode**:

When flags are provided or config file is used:

```bash
# Via flags
./install.sh \
  --name "my-project" \
  --type library \
  --lang rust \
  --examples \
  --ci \
  --non-interactive

# Via config file
./install.sh --config .docs-config.json --non-interactive
```

**Validation**:
- Project name: No special characters, reasonable length
- Language: From known list or "Other"
- Type: Must be one of: application, library, framework, cli, other

#### Phase 4: Confirmation & Preview

**Purpose**: Show user what will happen before making changes.

**Preview Display**:

```
┌─────────────────────────────────────────────────────────────┐
│ Installation Preview                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Project: my-app                                              │
│ Type: Application                                            │
│ Language: JavaScript/TypeScript                              │
│ Framework: Next.js                                           │
│                                                              │
│ Will create:                                                 │
│   📁 docs/                                                   │
│   ├── README.md                                             │
│   ├── quickstart.md                                         │
│   ├── writing-software.md                                   │
│   ├── patterns.md                                           │
│   ├── standards.md                                          │
│   ├── code-review.md                                        │
│   ├── testing.md                                            │
│   ├── onboarding.md                                         │
│   ├── doc-health.md                                         │
│   ├── 📁 tutorials/                                         │
│   ├── 📁 guides/                                            │
│   ├── 📁 reference/                                         │
│   ├── 📁 concepts/                                          │
│   ├── 📁 examples/                                          │
│   └── 📁 contributing/                                      │
│                                                              │
│ Optional components:                                         │
│   ✓ Examples directory                                      │
│   ✓ CI/CD workflows (.github/workflows/docs.yml)            │
│   ✓ Claude Code integration (.claude/)                      │
│                                                              │
│ Total: ~50 files, ~200KB                                    │
│                                                              │
│ ? Proceed with installation? (Y/n) _                        │
└─────────────────────────────────────────────────────────────┘
```

**Dry Run Mode**:

```bash
./install.sh --dry-run
```

Shows everything that would be done without making changes:
- Files that would be created
- Directories that would be created
- Placeholders that would be replaced
- Git operations that would be performed

#### Phase 5: Template Installation

**Purpose**: Download and install template files.

**Download Strategy**:

```bash
# Template source (configurable)
TEMPLATE_SOURCE="${TEMPLATE_SOURCE:-https://raw.githubusercontent.com/user/project-docs-template/main}"
TEMPLATE_VERSION="${TEMPLATE_VERSION:-main}"

# Download approach
download_file() {
  local url="$1"
  local dest="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest" || return 1
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$dest" "$url" || return 1
  else
    echo "Error: curl or wget required"
    return 1
  fi

  return 0
}

# Download manifest (list of files to install)
download_file "$TEMPLATE_SOURCE/manifest.json" "$TEMP_DIR/manifest.json"

# Parse manifest and download each file
jq -r '.files[]' "$TEMP_DIR/manifest.json" | while read -r file; do
  download_file "$TEMPLATE_SOURCE/templates/base/$file" "$TEMP_DIR/$file"
done
```

**Directory Creation**:

```bash
# Create base structure
mkdir -p docs/{tutorials,guides,reference/{api,cli,configuration},concepts,examples,contributing}

# Create .gitkeep for empty directories
find docs -type d -empty -exec touch {}/.gitkeep \;
```

**Progress Indication**:

```
┌─────────────────────────────────────────────────────────┐
│ Installing documentation templates...                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [✓] Creating directory structure                        │
│ [✓] Downloading base templates                          │
│ [▶] Installing core documentation...      [========>  ] │
│ [ ] Installing reference templates...                   │
│ [ ] Installing Claude Code integration...               │
│ [ ] Applying customizations...                          │
│                                                          │
│ Progress: 45% (15/33 files)                             │
└─────────────────────────────────────────────────────────┘
```

**Error Handling**:

- If download fails: Retry up to 3 times with exponential backoff
- If partial installation: Offer to resume or rollback
- If disk full: Clean up temp files and exit gracefully
- If network timeout: Show helpful message about network issues

#### Phase 6: Post-Install Configuration

**Purpose**: Customize templates for this specific project.

**Placeholder Replacement**:

Templates contain placeholders that get replaced:

```
{{PROJECT_NAME}}         → "my-app"
{{PROJECT_DESCRIPTION}}  → (from user input or detected)
{{PRIMARY_LANGUAGE}}     → "JavaScript/TypeScript"
{{FRAMEWORK}}            → "Next.js"
{{TESTING_FRAMEWORK}}    → "Jest" (detected or default)
{{REPOSITORY_URL}}       → (from git remote or empty)
{{YEAR}}                 → 2025
{{DATE}}                 → 2025-10-11
{{TEAM_NAME}}            → (from user input or "Team")
{{AUTHOR}}               → (from git config or "Author")

{{TODO: ...}}            → Kept as-is for manual completion
```

**Replacement Engine**:

```bash
replace_placeholders() {
  local file="$1"

  # Simple replacements
  sed -i.bak \
    -e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
    -e "s|{{PROJECT_DESCRIPTION}}|$PROJECT_DESCRIPTION|g" \
    -e "s|{{PRIMARY_LANGUAGE}}|$PRIMARY_LANGUAGE|g" \
    -e "s|{{FRAMEWORK}}|$FRAMEWORK|g" \
    -e "s|{{YEAR}}|$(date +%Y)|g" \
    -e "s|{{DATE}}|$(date +%Y-%m-%d)|g" \
    "$file"

  # Remove .bak file
  rm -f "$file.bak"
}

# Apply to all installed files
find docs -type f -name "*.md" | while read -r file; do
  replace_placeholders "$file"
done
```

**Git Integration**:

```bash
# If git not initialized, offer to initialize
if [ ! -d ".git" ]; then
  if prompt_yes_no "Initialize git repository?"; then
    git init
    echo "✓ Initialized git repository"
  fi
fi

# Add docs to git (if git exists)
if [ -d ".git" ]; then
  git add docs/

  if prompt_yes_no "Create initial commit?"; then
    git commit -m "docs: Add project documentation structure

Generated with project-docs-template installer.

Includes:
- Core documentation files (writing-software, patterns, standards)
- Diataxis-based structure (tutorials, guides, reference, concepts)
- Developer onboarding guide
- Testing documentation
- Code review practices

Next: Customize TODO sections in documentation."
    echo "✓ Created initial commit"
  fi
fi
```

**Configuration File Save**:

Save installation configuration for future upgrades:

```bash
# Save to .docs-config.json
cat > .docs-config.json <<EOF
{
  "version": "1.0.0",
  "installedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "config": {
    "projectName": "$PROJECT_NAME",
    "projectType": "$PROJECT_TYPE",
    "primaryLanguage": "$PRIMARY_LANGUAGE",
    "framework": "$FRAMEWORK",
    "components": {
      "examples": $INSTALL_EXAMPLES,
      "ci": $INSTALL_CI,
      "claude": $INSTALL_CLAUDE
    }
  }
}
EOF
```

#### Phase 7: Validation

**Purpose**: Verify installation completed successfully.

**Validation Checks**:

```bash
validate_installation() {
  local errors=0

  # Check required directories exist
  for dir in docs docs/tutorials docs/guides docs/reference docs/concepts; do
    if [ ! -d "$dir" ]; then
      echo "✗ Missing directory: $dir"
      errors=$((errors + 1))
    fi
  done

  # Check required files exist
  for file in docs/README.md docs/quickstart.md docs/writing-software.md; do
    if [ ! -f "$file" ]; then
      echo "✗ Missing file: $file"
      errors=$((errors + 1))
    fi
  done

  # Check placeholders were replaced
  if grep -r "{{PROJECT_NAME}}" docs/ >/dev/null 2>&1; then
    echo "⚠ Warning: Some placeholders may not have been replaced"
  fi

  # Check file permissions
  if [ ! -w "docs/README.md" ]; then
    echo "⚠ Warning: Documentation files may not be writable"
  fi

  return $errors
}
```

**Validation Output**:

```
┌─────────────────────────────────────────────────────────┐
│ Validating installation...                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [✓] Directory structure                                 │
│ [✓] Core documentation files                            │
│ [✓] Placeholder replacement                             │
│ [✓] File permissions                                    │
│ [✓] Git integration                                     │
│                                                          │
│ ✓ Installation validated successfully                   │
└─────────────────────────────────────────────────────────┘
```

#### Phase 8: Success & Next Steps

**Purpose**: Guide user on what to do next.

**Success Message**:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ✓ Installation Complete                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Documentation structure created at: ./docs/                     │
│                                                                  │
│ 📚 Next Steps:                                                  │
│                                                                  │
│   1. Review the documentation index                             │
│      👉 docs/README.md                                          │
│                                                                  │
│   2. Customize your project's philosophy                        │
│      👉 docs/writing-software.md                                │
│      (Look for TODO markers)                                    │
│                                                                  │
│   3. Write your quick start guide                               │
│      👉 docs/quickstart.md                                      │
│                                                                  │
│   4. Document your code standards                               │
│      👉 docs/standards.md                                       │
│                                                                  │
│   5. Add your first tutorial                                    │
│      👉 docs/tutorials/                                         │
│                                                                  │
│ 📖 Documentation Guide:                                         │
│    https://github.com/user/project-docs-template#usage          │
│                                                                  │
│ 💡 Tips:                                                        │
│    • Search for TODO markers: grep -r "TODO:" docs/            │
│    • Preview locally: npx serve docs/                           │
│    • Commit often: Document as you build                        │
│                                                                  │
│ 🤖 Claude Code Integration:                                     │
│    Use /review-docs to check documentation quality              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Configuration Summary**:

```
Configuration saved to .docs-config.json

To update or reinstall:
  ./install.sh --update --config .docs-config.json
```

---

## Decision Points & Branching Logic

### Decision Tree

```
Start
  │
  ├─ docs/ exists and not empty?
  │   ├─ Yes → Interactive mode?
  │   │   ├─ Yes → Show options
  │   │   │   ├─ Backup → Move to docs.backup.TIMESTAMP
  │   │   │   ├─ Merge → Keep existing, add missing
  │   │   │   ├─ Overwrite → Delete existing, install fresh
  │   │   │   └─ Abort → Exit with status 0
  │   │   └─ No → Exit with error (use --force)
  │   └─ No → Continue
  │
  ├─ Language detected?
  │   ├─ Yes → Use as default
  │   └─ No → Prompt or use "Other"
  │
  ├─ Git initialized?
  │   ├─ Yes → Get remote URL for placeholder
  │   └─ No → Offer to initialize
  │
  ├─ Interactive mode?
  │   ├─ Yes → Prompt for configuration
  │   └─ No → Use flags/config/defaults
  │
  ├─ Dry run mode?
  │   ├─ Yes → Show preview, exit
  │   └─ No → Continue
  │
  ├─ Download fails?
  │   ├─ Yes → Retry with backoff
  │   │   ├─ Max retries exceeded?
  │   │   │   ├─ Yes → Rollback, exit with error
  │   │   │   └─ No → Retry
  │   │   └─ ...
  │   └─ No → Continue
  │
  └─ Validation fails?
      ├─ Yes → Show errors, rollback, exit
      └─ No → Show success, exit
```

### Handling Existing Documentation

When `docs/` already exists:

**Check what exists**:
```bash
if [ -d "docs" ]; then
  FILE_COUNT=$(find docs -type f | wc -l)

  if [ "$FILE_COUNT" -eq 0 ]; then
    # Empty directory - safe to use
    DOCS_STATUS="empty"
  else
    # Has files - need user decision
    DOCS_STATUS="exists"
  fi
fi
```

**Interactive options**:
```
┌──────────────────────────────────────────────────────────┐
│ ⚠ Documentation directory already exists                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Found: ./docs/ (24 files)                                │
│                                                           │
│ How would you like to proceed?                           │
│                                                           │
│   1. Backup existing and install fresh                   │
│      (Move current docs/ to docs.backup.TIMESTAMP)       │
│                                                           │
│   2. Merge with existing                                 │
│      (Keep your files, add missing templates)            │
│                                                           │
│   3. Overwrite everything                                │
│      (Delete existing, install fresh - DESTRUCTIVE)      │
│                                                           │
│   4. Abort installation                                  │
│      (Leave everything as-is)                            │
│                                                           │
│ ? Choose option (1-4): _                                 │
└──────────────────────────────────────────────────────────┘
```

**Non-interactive handling**:
- Default: Abort if docs/ exists
- `--force`: Overwrite
- `--backup`: Backup first
- `--merge`: Merge with existing

### Error Handling Strategy

**Error Categories**:

1. **Pre-flight Errors** (before any changes)
   - Missing dependencies → Show installation instructions
   - No write permission → Show permission fix instructions
   - Incompatible shell → Show compatibility info

2. **Download Errors** (during download)
   - Network failure → Retry with backoff, then fail
   - 404 Not Found → Check TEMPLATE_SOURCE variable
   - Rate limiting → Wait and retry

3. **Installation Errors** (during file creation)
   - Disk full → Clean up temp files, exit
   - Permission denied → Show permission instructions
   - Corrupted download → Re-download file

4. **Validation Errors** (after installation)
   - Missing files → Rollback and show error
   - Failed placeholder replacement → Show warning, continue
   - Git errors → Show warning, continue (non-fatal)

**Error Message Format**:

```
┌─────────────────────────────────────────────────────────┐
│ ✗ Error: Failed to download template files              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Network connection failed while downloading:             │
│   https://raw.githubusercontent.com/.../README.md        │
│                                                          │
│ Possible causes:                                         │
│   • No internet connection                               │
│   • GitHub is down (check status.github.com)             │
│   • Firewall blocking the request                       │
│   • Template repository not accessible                   │
│                                                          │
│ Solutions:                                               │
│   1. Check your internet connection                      │
│   2. Try again in a few minutes                          │
│   3. Use custom template source:                         │
│      TEMPLATE_SOURCE=... ./install.sh                    │
│                                                          │
│ For more help:                                           │
│   https://github.com/user/project-docs-template/issues   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Rollback Mechanism

### When to Rollback

Automatic rollback triggers:
- Download failure (after max retries)
- Validation failure
- Disk full during installation
- User interruption (Ctrl-C)

### How Rollback Works

**Transaction Log**:

Keep log of all operations in temp file:

```bash
# Log file
TRANSACTION_LOG="$TEMP_DIR/install.log"

# Log operations
log_operation() {
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $1 $2" >> "$TRANSACTION_LOG"
}

# Examples
log_operation "CREATE_DIR" "docs/tutorials"
log_operation "CREATE_FILE" "docs/README.md"
log_operation "MODIFY_FILE" ".gitignore"
```

**Rollback Procedure**:

```bash
rollback_installation() {
  echo "Rolling back installation..."

  # Read transaction log in reverse
  tac "$TRANSACTION_LOG" | while IFS=' ' read -r timestamp op target; do
    case "$op" in
      CREATE_DIR)
        if [ -d "$target" ]; then
          rm -rf "$target"
          echo "  Removed directory: $target"
        fi
        ;;
      CREATE_FILE)
        if [ -f "$target" ]; then
          rm -f "$target"
          echo "  Removed file: $target"
        fi
        ;;
      MODIFY_FILE)
        # Restore from backup if exists
        if [ -f "$target.pre-install" ]; then
          mv "$target.pre-install" "$target"
          echo "  Restored: $target"
        fi
        ;;
    esac
  done

  echo "✓ Rollback complete"
}

# Set trap for Ctrl-C
trap 'rollback_installation; exit 130' INT TERM
```

**Partial Installation Recovery**:

If installation is interrupted, next run detects it:

```
┌──────────────────────────────────────────────────────────┐
│ ⚠ Partial installation detected                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Found incomplete installation from 2025-10-11 14:32 UTC  │
│                                                           │
│ Would you like to:                                       │
│   1. Resume installation (continue where it left off)    │
│   2. Clean up and start fresh                            │
│   3. Abort                                               │
│                                                           │
│ ? Choose option (1-3): _                                 │
└──────────────────────────────────────────────────────────┘
```

---

## Non-Interactive Mode

### Use Cases

1. **CI/CD Pipelines** - Automated setup in build systems
2. **Scripted Deployments** - Part of project scaffolding scripts
3. **Batch Operations** - Installing docs in multiple projects
4. **Testing** - Automated testing of installer

### Configuration Methods

#### Method 1: Command-Line Flags

```bash
./install.sh \
  --name "my-project" \
  --type application \
  --lang javascript \
  --framework react \
  --examples \
  --ci \
  --claude \
  --non-interactive \
  --yes
```

**Flag Reference**:

| Flag | Description | Default |
|------|-------------|---------|
| `--name NAME` | Project name | Directory name |
| `--type TYPE` | Project type (application, library, framework, cli) | Detected |
| `--lang LANGUAGE` | Primary language | Detected |
| `--framework FRAMEWORK` | Framework name | None |
| `--examples` | Install examples directory | Yes |
| `--ci` | Install CI/CD templates | Yes |
| `--claude` | Install Claude Code integration | Yes |
| `--non-interactive` | Don't prompt for input | Interactive |
| `--yes` | Answer yes to all prompts | Prompt |
| `--force` | Overwrite existing docs | No |
| `--backup` | Backup before overwrite | No |
| `--dry-run` | Show what would be done | No |
| `--verbose` | Verbose output | No |
| `--quiet` | Minimal output | No |

#### Method 2: Configuration File

Create `.docs-config.json`:

```json
{
  "project": {
    "name": "my-project",
    "type": "application",
    "description": "A sample application"
  },
  "language": {
    "primary": "JavaScript",
    "framework": "React"
  },
  "components": {
    "examples": true,
    "ci": true,
    "claude": true,
    "vale": false,
    "apiReference": false
  },
  "customization": {
    "teamName": "Engineering Team",
    "repositoryUrl": "https://github.com/user/my-project"
  }
}
```

Install with config:

```bash
./install.sh --config .docs-config.json --non-interactive
```

#### Method 3: Environment Variables

```bash
export DOCS_PROJECT_NAME="my-project"
export DOCS_PROJECT_TYPE="application"
export DOCS_LANGUAGE="javascript"
export DOCS_FRAMEWORK="react"
export DOCS_INSTALL_EXAMPLES="true"
export DOCS_INSTALL_CI="true"
export DOCS_INSTALL_CLAUDE="true"

./install.sh --non-interactive
```

### Error Handling in Non-Interactive Mode

**Strict Mode**: Exit immediately on any error

```bash
#!/bin/bash
set -euo pipefail  # Exit on error, undefined var, pipe failure

# Non-interactive mode must succeed or fail cleanly
if [ "$NON_INTERACTIVE" = true ]; then
  set -e  # Exit on any error
fi
```

**Exit Codes**:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Pre-flight check failed |
| 3 | Download failed |
| 4 | Installation failed |
| 5 | Validation failed |
| 6 | Configuration error |
| 130 | Interrupted by user (Ctrl-C) |

---

## Version Management

### Version Checking

**Check installed version**:

```bash
./install.sh --version
```

Output:
```
project-docs-template installer v1.0.0
Template version: main (latest)
```

**Check for updates**:

```bash
./install.sh --check-updates
```

Output:
```
Current version: 1.0.0
Latest version: 1.2.0

New features in 1.2.0:
  • Added API reference templates
  • Improved Claude Code integration
  • New testing patterns

Run './install.sh --update' to upgrade
```

### Upgrade Process

**Update existing installation**:

```bash
./install.sh --update
```

**Update flow**:

```
┌─────────────────────────────────────────────────────────┐
│ Updating documentation templates...                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Current: v1.0.0                                          │
│ Latest: v1.2.0                                           │
│                                                          │
│ Will update:                                             │
│   • Core templates (preserve customizations)            │
│   • CI/CD workflows                                     │
│   • Claude Code integration                             │
│                                                          │
│ Will NOT update:                                         │
│   • Your custom content (preserved)                     │
│   • TODO sections you've filled in                      │
│                                                          │
│ ? Proceed with update? (Y/n) _                          │
└─────────────────────────────────────────────────────────┘
```

**Smart Merge Strategy**:

1. Detect which files have been customized
2. Update only unmodified template sections
3. Preserve user customizations
4. Add new templates
5. Report changes

```bash
# Check if file was customized
is_customized() {
  local file="$1"

  # Check if file still has TODO markers
  if ! grep -q "{{TODO:" "$file"; then
    # User likely customized it
    return 0
  fi

  # Check git history
  if git log --oneline -- "$file" | wc -l > 1; then
    # Multiple commits = customized
    return 0
  fi

  return 1
}

# Update strategy per file
update_file() {
  local file="$1"

  if is_customized "$file"; then
    echo "  Skipping (customized): $file"
  else
    echo "  Updating: $file"
    download_and_replace "$file"
  fi
}
```

### Versioned Templates

**Pin to specific version**:

```bash
TEMPLATE_VERSION=v1.0.0 ./install.sh
```

**Version manifest** (included in download):

```json
{
  "version": "1.0.0",
  "released": "2025-10-01",
  "templates": {
    "base": "1.0.0",
    "library": "1.0.0",
    "application": "1.0.0"
  },
  "breaking_changes": [],
  "new_features": [
    "Initial release"
  ]
}
```

---

## Security Considerations

### Input Validation

**Project name**:
```bash
validate_project_name() {
  local name="$1"

  # Check length
  if [ ${#name} -lt 1 ] || [ ${#name} -gt 100 ]; then
    return 1
  fi

  # Check characters (alphanumeric, dash, underscore)
  if ! echo "$name" | grep -qE '^[a-zA-Z0-9_-]+$'; then
    return 1
  fi

  return 0
}
```

**Prevent path traversal**:
```bash
# Never allow .. in paths
if echo "$DOCS_DIR" | grep -q '\.\.'; then
  echo "Error: Invalid path"
  exit 1
fi

# Use absolute paths internally
DOCS_DIR="$(cd "$(dirname "$DOCS_DIR")" && pwd)/$(basename "$DOCS_DIR")"
```

### Download Security

**HTTPS only**:
```bash
# Ensure HTTPS
if ! echo "$TEMPLATE_SOURCE" | grep -qE '^https://'; then
  echo "Error: Template source must use HTTPS"
  exit 1
fi
```

**Verify checksums** (if available):
```bash
# Download checksum file
download_file "$TEMPLATE_SOURCE/checksums.txt" "$TEMP_DIR/checksums.txt"

# Verify each downloaded file
verify_checksum() {
  local file="$1"
  local expected=$(grep "$(basename "$file")" "$TEMP_DIR/checksums.txt" | cut -d' ' -f1)
  local actual=$(sha256sum "$file" | cut -d' ' -f1)

  if [ "$expected" != "$actual" ]; then
    echo "Error: Checksum mismatch for $file"
    return 1
  fi

  return 0
}
```

### Permission Safety

**Don't run as root**:
```bash
if [ "$EUID" -eq 0 ]; then
  echo "⚠ Warning: Running as root is not recommended"
  echo "This installer doesn't need root privileges."

  if ! prompt_yes_no "Continue anyway?"; then
    exit 1
  fi
fi
```

**Restrict file permissions**:
```bash
# Set safe permissions on created files
chmod 644 docs/**/*.md
chmod 755 docs/scripts/*.sh
```

### No Secret Exposure

**Don't prompt for secrets**:
- Never ask for passwords or API keys
- Don't store credentials in config files
- Warn about .env files in templates

**Safe git integration**:
```bash
# Only get public git info
GIT_REMOTE=$(git config --get remote.origin.url 2>/dev/null || echo "")

# Don't expose credentials in URLs
GIT_REMOTE=$(echo "$GIT_REMOTE" | sed 's|://[^@]*@|://|')
```

---

## Platform Compatibility

### Supported Platforms

**Primary Support**:
- macOS 10.15+ (Catalina and newer)
- Ubuntu 20.04+ (and derivatives)
- Debian 11+
- CentOS/RHEL 8+
- Windows Subsystem for Linux (WSL2)

**Best Effort**:
- FreeBSD
- Older Linux distributions
- macOS 10.14 and older

### Shell Compatibility

**Minimum Requirements**:
- Bash 3.2+ (macOS default)
- POSIX sh (for maximum compatibility)

**Compatibility Checks**:

```bash
#!/bin/bash
# Use bash 3.2+ features only

# Check bash version
if [ -n "$BASH_VERSION" ]; then
  BASH_MAJOR=$(echo "$BASH_VERSION" | cut -d. -f1)
  BASH_MINOR=$(echo "$BASH_VERSION" | cut -d. -f2)

  if [ "$BASH_MAJOR" -lt 3 ] || \
     ([ "$BASH_MAJOR" -eq 3 ] && [ "$BASH_MINOR" -lt 2 ]); then
    echo "Error: Bash 3.2+ required (found $BASH_VERSION)"
    exit 1
  fi
fi
```

### Command Availability

**Detect alternatives**:

```bash
# Prefer curl, fallback to wget
if command -v curl >/dev/null 2>&1; then
  DOWNLOAD_CMD="curl"
elif command -v wget >/dev/null 2>&1; then
  DOWNLOAD_CMD="wget"
else
  echo "Error: Neither curl nor wget found"
  echo "Install: brew install curl  (macOS)"
  echo "    or: apt-get install curl  (Debian/Ubuntu)"
  exit 1
fi
```

**Platform-specific variations**:

```bash
# Detect OS
case "$(uname -s)" in
  Darwin*)
    OS="macos"
    SED_INPLACE="sed -i .bak"
    ;;
  Linux*)
    OS="linux"
    SED_INPLACE="sed -i"
    ;;
  CYGWIN*|MINGW*|MSYS*)
    OS="windows"
    echo "Error: Native Windows not supported. Use WSL."
    exit 1
    ;;
  *)
    OS="unknown"
    echo "Warning: Unsupported OS. Attempting to continue..."
    ;;
esac
```

---

## Testing Strategy

### Test Plan

**Manual Testing**:

1. **Fresh installation** (no existing docs/)
   - Run in clean directory
   - Verify all files created
   - Check placeholders replaced
   - Validate git integration

2. **Installation with existing docs/**
   - Test backup option
   - Test merge option
   - Test overwrite option
   - Test abort option

3. **Non-interactive mode**
   - Test with flags
   - Test with config file
   - Test with environment variables

4. **Error scenarios**
   - No internet connection
   - Disk full
   - No write permission
   - Interrupted installation (Ctrl-C)

5. **Platform testing**
   - macOS (latest)
   - Ubuntu 22.04
   - Ubuntu 20.04
   - WSL2 (Ubuntu)
   - CentOS 8

**Automated Testing**:

Create test suite:

```bash
#!/bin/bash
# tests/test-install.sh

test_fresh_install() {
  local test_dir=$(mktemp -d)
  cd "$test_dir"

  # Run installer non-interactively
  bash "$INSTALL_SCRIPT" \
    --name "test-project" \
    --type library \
    --lang rust \
    --non-interactive \
    --yes

  # Verify structure
  [ -d "docs" ] || fail "docs/ not created"
  [ -f "docs/README.md" ] || fail "README.md not created"

  # Verify placeholders replaced
  if grep -q "{{PROJECT_NAME}}" "docs/README.md"; then
    fail "Placeholders not replaced"
  fi

  # Cleanup
  rm -rf "$test_dir"
}

test_dry_run() {
  local test_dir=$(mktemp -d)
  cd "$test_dir"

  # Run in dry-run mode
  bash "$INSTALL_SCRIPT" --dry-run

  # Verify nothing created
  [ ! -d "docs" ] || fail "docs/ created in dry-run mode"

  rm -rf "$test_dir"
}

# Run all tests
run_tests() {
  test_fresh_install
  test_dry_run
  # ... more tests

  echo "All tests passed!"
}

run_tests
```

### CI/CD for Installer

GitHub Actions workflow to test installer:

```yaml
# .github/workflows/test-installer.yml
name: Test Installer

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3

      - name: Test fresh installation
        run: |
          ./tests/test-install.sh

      - name: Test dry-run mode
        run: |
          ./install.sh --dry-run

      - name: Test non-interactive mode
        run: |
          ./install.sh \
            --name test \
            --type library \
            --lang rust \
            --non-interactive \
            --yes
```

---

## Edge Cases

### Edge Case Handling

#### Case 1: Very Long Project Names

**Issue**: Project name too long for file paths

**Detection**:
```bash
if [ ${#PROJECT_NAME} -gt 100 ]; then
  echo "Warning: Project name is very long (${#PROJECT_NAME} characters)"
  echo "This may cause issues on some systems."

  if ! prompt_yes_no "Continue anyway?"; then
    exit 1
  fi
fi
```

#### Case 2: Special Characters in Paths

**Issue**: Spaces or special chars in directory names

**Handling**:
```bash
# Always quote variables
cd "$PROJECT_DIR" || exit 1
mkdir -p "$DOCS_DIR" || exit 1

# Escape special characters in display
display_path() {
  echo "$1" | sed 's/ /\\ /g'
}
```

#### Case 3: Slow Network

**Issue**: Downloads take very long

**Handling**:
```bash
# Show progress for slow connections
download_with_progress() {
  local url="$1"
  local dest="$2"

  if [ "$DOWNLOAD_CMD" = "curl" ]; then
    curl -fL --progress-bar "$url" -o "$dest"
  else
    wget --show-progress -O "$dest" "$url"
  fi
}
```

#### Case 4: No Git

**Issue**: Git not installed but user wants to use git features

**Handling**:
```bash
if ! command -v git >/dev/null 2>&1; then
  echo "Note: Git not found. Git integration will be skipped."
  echo ""
  echo "To enable git features, install git:"
  echo "  macOS: brew install git"
  echo "  Ubuntu: apt-get install git"
  echo ""

  INSTALL_GIT_INTEGRATION=false
fi
```

#### Case 5: Monorepo

**Issue**: Installing docs in subdirectory of monorepo

**Handling**:
```bash
# Detect monorepo
if [ -f "lerna.json" ] || [ -f "pnpm-workspace.yaml" ]; then
  echo "Monorepo detected!"
  echo ""
  echo "Install documentation where?"
  echo "  1. Root (./docs/)"
  echo "  2. Package (./packages/NAME/docs/)"
  echo ""
  read -p "Choose (1-2): " choice

  if [ "$choice" = "2" ]; then
    read -p "Package name: " package_name
    DOCS_DIR="packages/$package_name/docs"
  fi
fi
```

#### Case 6: Existing .docs-config.json

**Issue**: Config file exists, might conflict

**Handling**:
```bash
if [ -f ".docs-config.json" ]; then
  echo "Found existing .docs-config.json"
  echo ""
  echo "Use existing configuration?"
  echo "  1. Yes, use existing config"
  echo "  2. No, create new config"
  echo "  3. Merge with new options"
  echo ""
  read -p "Choose (1-3): " choice

  case "$choice" in
    1) load_existing_config ;;
    2) backup_config; create_new_config ;;
    3) merge_configs ;;
  esac
fi
```

---

## Performance Considerations

### Optimization Strategies

**Parallel Downloads**:

```bash
# Download multiple files in parallel (if supported)
if command -v xargs >/dev/null 2>&1; then
  cat "$MANIFEST" | xargs -P 4 -I {} download_file "{}"
else
  # Fallback to sequential
  cat "$MANIFEST" | while read -r file; do
    download_file "$file"
  done
fi
```

**Cached Downloads**:

```bash
# Use local cache if available
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/project-docs-template"
mkdir -p "$CACHE_DIR"

download_with_cache() {
  local url="$1"
  local dest="$2"
  local cache_key=$(echo "$url" | sha256sum | cut -d' ' -f1)
  local cache_file="$CACHE_DIR/$cache_key"

  if [ -f "$cache_file" ]; then
    # Check if cache is fresh (< 24 hours old)
    if [ $(($(date +%s) - $(stat -f %m "$cache_file" 2>/dev/null || stat -c %Y "$cache_file"))) -lt 86400 ]; then
      cp "$cache_file" "$dest"
      return 0
    fi
  fi

  # Download and cache
  download_file "$url" "$dest" && cp "$dest" "$cache_file"
}
```

**Minimal File Operations**:

```bash
# Batch sed operations
replace_all_placeholders() {
  local file="$1"

  # Single sed invocation for all replacements
  sed -i.bak \
    -e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
    -e "s|{{PRIMARY_LANGUAGE}}|$PRIMARY_LANGUAGE|g" \
    -e "s|{{FRAMEWORK}}|$FRAMEWORK|g" \
    -e "s|{{YEAR}}|$(date +%Y)|g" \
    -e "s|{{DATE}}|$(date +%Y-%m-%d)|g" \
    "$file" && rm -f "$file.bak"
}
```

### Progress Reporting

**Efficient progress updates**:

```bash
# Update progress without flooding terminal
show_progress() {
  local current=$1
  local total=$2
  local task=$3

  local percent=$((current * 100 / total))
  local bar_width=40
  local filled=$((bar_width * current / total))
  local empty=$((bar_width - filled))

  # Only update every 2%
  if [ $((percent % 2)) -eq 0 ]; then
    printf "\r[%s%s] %3d%% %s" \
      "$(printf '#%.0s' $(seq 1 $filled))" \
      "$(printf ' %.0s' $(seq 1 $empty))" \
      "$percent" \
      "$task"
  fi
}
```

---

## Summary

This bootstrap installer design provides:

1. **User-Friendly Installation** - Single command, interactive prompts, clear feedback
2. **Robustness** - Error handling, rollback, validation
3. **Flexibility** - Interactive and non-interactive modes, customizable
4. **Safety** - Non-destructive, backups, input validation
5. **Platform Support** - Works on macOS, Linux, WSL
6. **Version Management** - Update existing installations, pin versions
7. **Security** - HTTPS only, input validation, safe permissions

The installer reduces documentation setup from hours to minutes, lowering the barrier to adopting comprehensive documentation practices.

---

## Related Files

- `/Users/tnez/Desktop/install.sh` - Implementation of this design
- `/Users/tnez/Desktop/install-config-schema.json` - Configuration file schema
- `/Users/tnez/Desktop/uninstall.sh` - Removal script
- `/Users/tnez/Desktop/repo-structure.md` - Template repository structure

---

*Design document version: 1.0.0*
*Last updated: 2025-10-11*
*Author: Documentation Template Project*
