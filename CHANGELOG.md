# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2025-10-19

### Added

- **Comprehensive Project Health Tool (`doctor`)**
  - Automated pre-release health checks with 6 diagnostic categories
  - Broken link detection in documentation
  - Debug code detection (console.log, debugger, TODO markers)
  - Test marker detection (.only/.skip in test files)
  - Uncommitted changes check
  - Temporary file detection (Claude Code artifacts, scratch files)
  - Bidirectional structure reconciliation: detects both documented-but-missing and existing-but-undocumented files
  - Intelligent documentation gap detection with context-aware suggestions
  - Quantitative health scoring (0-100) with severity-based deductions
  - Actionable fixes with file:line references for each issue
  - Selective check execution via `checks` parameter
  - Three severity levels: errors (must fix), warnings (should fix), info (suggestions)

### Changed

- Renamed `audit` tool to `doctor` for broader health check scope
- Updated CI/CD workflow to use npm test instead of script-based testing
- Improved test suite to focus on MCP server functionality

### Removed

- Obsolete `scripts/install.sh` and `scripts/uninstall.sh` (replaced by `init-project` MCP tool)
- Script-based installation workflow (superseded by MCP-native approach)
- Associated test infrastructure for bash scripts

### Technical

- Enhanced doctor tool accuracy with code block detection and self-reference filtering
- Improved false positive handling in pattern matching
- Smart grouping in output (limits to 5 files per category, summarizes remaining)

## [0.5.0] - 2025-10-17 (unpublished)

### Added

- **Project Bootstrap Workflow**
  - `init-project` MCP tool for one-command project initialization
  - Auto-detects project type (languages, frameworks, build tools)
  - Creates docs/ structure: guides/, runbooks/, adr/, rfcs/, specs/, architecture/
  - Generates context-aware README.md with project info
  - Creates starter getting-started.md guide with TODO placeholders
  - Sets up .journal/ directory (gitignored) for work session tracking
  - `docent://meta/setup-needed` resource auto-appears when docs/ missing
  - Seamless onboarding: `docent init` just works
- **Agent Configuration Integration**
  - Auto-detects existing agent config files (AGENTS.md, CLAUDE.md, .cursorrules, .aiderules)
  - Intelligently merges docent instructions into detected config
  - Creates AGENTS.md if no config exists (agent-agnostic standard)
  - Includes session initialization instructions for post-compaction context recovery
  - Idempotent - safe to run multiple times without duplication
- **Claude SessionStart Hook Guide**
  - Comprehensive guide for automatic docent initialization in Claude Code
  - Documents SessionStart hook pattern for post-compact context recovery
  - Zero-friction solution: no manual `docent init` after compaction
  - Includes troubleshooting and alternative approaches
- **Session Initialization Prompt (RFC-0008)**
  - `init-session` prompt for bootstrapping agent work sessions
  - Dynamically discovers and lists available resources (guides, runbooks, standards, templates)
  - Provides journal workflow instructions with capture → resume pattern
  - Includes project-specific conventions from `docs/.config/CONVENTIONS.md` if present
  - Shows project info (languages, frameworks, build tools)
  - Table of contents format for quick reference without overwhelming context
- **Session-Based Journal Architecture (RFC-0006)**
  - Migrated from single `.docent/journal.md` to session-based files in `docs/.journal/`
  - Session files named: `YYYY-MM-DD-session-NNN.md` for chronological organization
  - Automatic session detection with 4-hour threshold for natural session boundaries
  - Worktree isolation - each worktree maintains independent journal state
  - Migration logic automatically converts old journal format to new structure
  - `SessionManager` class for session lifecycle management
  - Resume-work reads last 3 sessions (bounded context, no unbounded growth)

### Changed

- **BREAKING**: Journal location changed from `.docent/journal.md` to `docs/.journal/*.md`
  - Automatic migration on first use (old journal renamed to `.migrated`)
  - Gitignored at `docs/.journal/` as ephemeral agent state
- capture-work tool now uses SessionManager for session-based journaling
- resume-work prompt now reads last 3 session files instead of single journal
- All journal operations within `docs/` namespace (removed `.docent/` directory)

### Technical

- Added `SessionManager` class for session file management
- Session detection based on time threshold (configurable, default 4 hours)
- Improved context gathering with bounded session history
- Better git diff handling (new files vs appends to large file)

## [0.4.0] - 2025-10-16

### Added

- **Enhanced MCP Architecture (RFC-0005)**
  - Full MCP resources support with URI-based content discovery
  - Full MCP prompts support for workflow templates
  - Resource types: runbooks, templates, standards, guides, ADRs, RFCs, docs, journal
  - Resource URI scheme: `docent://type/identifier`
  - Path traversal security validation
- **Comprehensive Prompt Library**
  - `resume-work` - Session recovery with git status, commits, TODOs, and journal
  - `review-rfc` - Multi-perspective RFC review (architecture, security, implementation)
  - `create-adr` - Guided ADR creation with template
  - `plan-feature` - Feature planning from research to spec
  - `research-topic` - Structured research with web search integration
- **Resource Discovery**
  - Automatic resource listing with metadata
  - Rich descriptions for agent discoverability
  - Extraction of titles and status from documentation
  - When-to-use guidance from runbooks
- **Example Documentation**
  - CI/CD Health Check runbook demonstrating operational procedures
  - Research document on MCP prompts and resources
- **Documentation as Configuration**
  - Runbooks become instructions agents can follow
  - Templates accessible as resources
  - Standards and guides discoverable via MCP
  - Work journal surfaced for session continuity

### Changed

- MCP server now exposes three capabilities: tools, resources, and prompts
- Prompt context gathering now includes project analysis and related documents
- Resource handlers organized by type (runbook, template, standard, etc.)

### Technical

- Updated to follow RFC-0005 Enhanced MCP Architecture
- Modular resource and prompt handlers
- Comprehensive error handling and validation
- Security: Path traversal prevention in resource URIs

## [0.3.0] - 2025-10-13

### Changed

- **BREAKING**: Project renamed from "docket" to "docent"
  - Package name: `@tnezdev/docket` → `@tnezdev/docent`
  - All documentation updated to reflect new branding
  - Repository URLs updated to `github.com/tnez/docent`
- Updated all documentation references from "docket" to "docent"

### Added

- MCP Resources support for accessing project artifacts
  - Journal resource (`docent://journal`)
  - Templates resource (`docent://templates/*`)
  - Runbooks resource (`docent://runbooks/*`)
- MCP Prompts for structured agent workflows
  - `resume-work` - Session recovery with context gathering
  - `review-rfc` - Multi-perspective RFC review
  - `create-adr` - Guided ADR creation
  - `plan-feature` - Feature research and planning
  - `research-topic` - Structured research workflow
- Journal capture workflow for tracking work sessions
- Enhanced resume-work prompt with git status, commits, and TODO scanning

### Fixed

- Test script removed from package.json (no tests currently implemented)

## [0.2.0] - 2025-10-11

### Added

- MCP server implementation for agent integration
- Tools: `analyze`, `audit`, `list-templates`, `get-template`, `capture-work`
- Agent-driven documentation quality assessment (73/100 vs 21/100 heuristic baseline)
- Template library: ADR, RFC, PRD, API docs, architecture, onboarding, patterns, runbook, spec, standards, testing, troubleshooting, writing-software

### Changed

- Architecture decision: MCP-only (removed CLI commands per ADR-0004)
- Agent-agnostic design for compatibility with any MCP-compatible AI agent

## [0.1.0] - 2025-10-10

### Added

- Initial release
- Documentation templates
- Basic project structure
- TypeScript implementation
- MIT license

[0.3.0]: https://github.com/tnez/docent/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/tnez/docent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tnez/docent/releases/tag/v0.1.0
