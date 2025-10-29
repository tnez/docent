---
name: bootstrap
description: Initialize .docent/ directory structure and configuration for a new project
type: runbook
author: docent
version: 1.0.0
tags: [setup, initialization, configuration]
---

# Bootstrap Runbook

This runbook initializes a new project with docent's directory structure and configuration.

## Purpose

Creates the `.docent/` directory structure, config file, and initial documentation scaffolding for a project. This runbook should be invoked when a user wants to set up docent for the first time.

## Prerequisites

- Project directory exists
- Write permissions to create `.docent/` directory
- Git repository (optional but recommended)

## Procedure

### Step 1: Check for Existing .docent/ Directory

**Action:** Verify if `.docent/` directory already exists

```bash
if [ -d ".docent" ]; then
  echo "⚠️  .docent/ directory already exists"
fi
```

**Decision Point:**

- If exists: Ask user if they want to proceed (will backup existing)
- If not exists: Continue to Step 2

### Step 2: Analyze Project Structure

**Action:** Detect project type, languages, and frameworks to inform template selection

**Look for:**

- `package.json` → Node.js/TypeScript project
- `Cargo.toml` → Rust project
- `pyproject.toml` or `setup.py` → Python project
- `go.mod` → Go project
- `.git/` → Git repository

**Gather information:**

- Project name (from config files or directory name)
- Primary language(s)
- Frameworks detected
- Build tools present

### Step 3: Create .docent/ Directory Structure

**Action:** Create the standard .docent/ directory structure

```bash
mkdir -p .docent
mkdir -p .docent/templates
mkdir -p .docent/runbooks
mkdir -p .docent/journals
mkdir -p .docent/sessions
mkdir -p .docent/notes
mkdir -p .docent/projects
mkdir -p .docent/decisions
mkdir -p .docent/proposals
```

**Expected result:** All directories created successfully

### Step 4: Create Configuration File

**Action:** Generate `.docent/config.yaml` with defaults

```yaml
# docent configuration
root: .docent

# Paths to search when using /docent:ask
search_paths:
  - .docent
  - docs  # Include general project docs if they exist

# Projects for issue filing (optional)
projects:
  # Example:
  # my-project:
  #   repo: user/my-project
```

**Customization:**

- If `docs/` directory exists, include it in search_paths
- If git remote is configured, extract project info for issue filing

### Step 5: Create Initial .gitignore

**Action:** Create `.docent/.gitignore` to exclude certain files

```gitignore
# Exclude journals and sessions (personal work logs)
journals/
sessions/

# Exclude temporary files
*.tmp
*.bak
*~
```

**Rationale:** Journals and sessions are personal/ephemeral, not for version control

### Step 6: Create Welcome Document

**Action:** Create `.docent/README.md` with getting started information

```markdown
# Docent Knowledge Base

This directory is managed by docent, a documentation intelligence system.

## Structure

- `templates/` - Custom templates (override bundled templates)
- `runbooks/` - Custom runbooks (override bundled runbooks)
- `journals/` - Work journals (gitignored)
- `sessions/` - Agent session logs (gitignored)
- `notes/` - General notes and knowledge capture
- `projects/` - Project tracking documents
- `decisions/` - Architecture Decision Records (ADRs)
- `proposals/` - RFCs and PRDs

## Usage

- `/docent:ask [query]` - Search all documentation
- `/docent:tell [statement]` - Write/update documentation
- `/docent:act [directive]` - Execute runbooks
- `/docent:start` - List available templates and runbooks

## Configuration

Edit `config.yaml` to customize search paths and project settings.
```

### Step 7: Offer Template Application (Optional)

**Decision Point:** Ask user if they want to apply any starter templates

**Options:**

1. Skip templates - minimal setup only
2. Apply starter templates - create initial journal, project tracker, etc.

**If user wants templates:**

- Use `/docent:act create journal entry` to start a journal
- Use `/docent:act create project` to set up project tracking
- Use `/docent:act create ADR` for architecture decisions

### Step 8: Verify Installation

**Action:** Confirm all files and directories were created successfully

**Checklist:**

- [ ] `.docent/` directory exists
- [ ] All subdirectories created
- [ ] `config.yaml` is valid YAML
- [ ] `.gitignore` exists
- [ ] `README.md` created

**If any checks fail:** Report specific failure and provide fix instructions

### Step 9: Report Success

**Action:** Provide confirmation and next steps

**Success Message:**

```
✅ docent initialized successfully!

Created:
  .docent/
  ├── config.yaml          # Configuration
  ├── .gitignore           # Excluded files
  ├── README.md            # Getting started guide
  ├── templates/           # Custom templates
  ├── runbooks/            # Custom runbooks
  ├── journals/            # Work journals
  ├── sessions/            # Agent sessions
  ├── notes/               # General notes
  ├── projects/            # Project tracking
  ├── decisions/           # ADRs
  └── proposals/           # RFCs and PRDs

Next steps:
  1. Run `/docent:start` to see available templates and runbooks
  2. Use `/docent:ask getting started` to learn more
  3. Start capturing knowledge with `/docent:tell`

Configuration can be customized in .docent/config.yaml
```

## Error Handling

### Permission Denied

**If:** Cannot create `.docent/` directory

**Fix:** Check write permissions in current directory

```bash
ls -ld .
# Should show write permission for current user
```

### Existing Directory Conflicts

**If:** `.docent/` exists and user didn't force

**Fix:** Offer to:

1. Backup existing → Move to `.docent.backup.TIMESTAMP/`
2. Merge → Keep existing config, create missing directories
3. Abort → Exit without changes

### Invalid Git Repository

**If:** Git operations fail

**Fix:** Continue without git integration, skip project detection from remotes

## Validation

After completion:

- `.docent/config.yaml` is parseable as YAML
- Directory structure matches expected layout
- README.md contains correct information
- User can run `/docent:start` successfully

## Session Initialization for AI Agents

After bootstrapping docent, you may want to configure your AI agent to automatically initialize docent at the start of each session. This ensures agents always have access to project context.

### For Claude Code Users

Add the following section to your project's `.claude/CLAUDE.md` file:

```markdown
## Session Initialization

**CRITICAL:** At the start of NEW sessions and after COMPACTION, you MUST initialize docent context as your FIRST ACTION before any other work.

### Initialization Command

Immediately run:

\`\`\`
docent context
\`\`\`

Or explicitly request: "read the docent://meta/context resource"

### When to Initialize

- At the beginning of a new session (context window is empty)
- After a `/compact` operation (context was reset)
- When the user explicitly requests it

### When NOT to Initialize

- When resuming with `claude --continue` (init content is already in context)
- When init content is visible earlier in the conversation

### What This Provides

- Available resources (guides, runbooks, standards, templates)
- Journal workflow instructions (capture → resume pattern)
- Project info and conventions
- Quick reference for common tasks
```

### Alternative: User-Level Configuration

For user-level initialization (applies to all projects), add the same instructions to `~/.claude/CLAUDE.md` instead of `.claude/CLAUDE.md`.

### For Other AI Agents

Different agents have different initialization mechanisms. Consult your agent's documentation for:

- Session hooks or startup scripts
- Custom system prompts
- Configuration files for automatic tool invocation

The key concept: Invoke `/docent:start` at the beginning of each session to load project context.

## Notes

- This runbook creates minimal structure - templates are applied separately
- Journals and sessions are gitignored by default (personal artifacts)
- Config can be edited manually after bootstrap
- Safe to re-run with force flag to reset structure
- Session initialization ensures agents have consistent access to project knowledge
