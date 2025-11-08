# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.1] - 2025-11-07

### Added

- Frontmatter warnings in `docent:start` for custom resources missing required metadata

### Fixed

- Custom runbook frontmatter requirements now properly documented with improved error messages
- Updated file-issue runbook to reference correct repository (tnez/docent)

### Changed

- Upgraded production dependencies (@modelcontextprotocol/sdk 1.20.0 → 1.21.1)
- Upgraded development dependencies (@types/node, markdownlint-cli2)
- Upgraded GitHub Actions (checkout v4 → v5, setup-node v4 → v6, markdownlint-cli2-action v16 → v20)

### Technical

- Improved MCP development documentation with rebuild/restart workflow
- Extracted knowledge from journals to permanent documentation
- Updated release runbook to include package-lock.json

## [0.9.0] - 2025-10-29

### Added

- **Ask/Act/Tell Architecture**: Complete overhaul of agent interaction paradigm
  - `start` tool - Session initialization and resource discovery (now displays docent version)
  - `ask` tool - Natural language documentation search with relevance scoring
  - `act` tool - Execute runbooks and create files from templates by name
  - `tell` tool - Agent-driven template classification for knowledge capture
- **Template Classification System**: Intelligent template selection based on semantic analysis
  - Templates self-describe with `use_when` guidance and examples
  - Agent classifies user statements to appropriate templates
  - Extensible - users can add custom templates in `.docent/templates/`
  - See "Creating Custom Templates" in README for documentation
- **Resource Registry**: Centralized system for bundled templates and runbooks
  - Automatic discovery of bundled resources
  - User templates override bundled ones with same name
  - Template metadata exposed to agents for classification
- **New Bundled Runbooks**: 7 operational procedures included with package
  - `bootstrap` - Initialize `.docent/` directory structure
  - `git-commit` - Professional git commits with conventional format
  - `health-check` - Comprehensive project health validation
  - `code-review` - Thorough code review procedures
  - `file-issue` - GitHub issue filing workflow
  - `process-journals` - Extract knowledge from journal entries
  - `process-sessions` - Process ephemeral session notes
  - `capture-work-guidance` - Proactive documentation guidance for agents
- **Documentation in `.docent/` Directory**: Consolidated structure
  - `adr/` - Architecture Decision Records (4 ADRs)
  - `architecture/` - System architecture overview
  - `guides/` - 8 user guides (MCP setup, testing, contributing, etc.)
  - `journals/` - Daily work logs
  - `sessions/` - AI session notes
  - `notes/` - Topic-specific notes
  - `runbooks/` - Project-specific operational procedures

### Changed

- **Default Documentation Root**: `docs` → `.docent`
  - Configuration default updated to `.docent/` for cleaner project structure
  - Matches industry convention for tool-specific directories
  - Old `docs/` directory structure migrated to `.docent/`
- **Template Naming Convention**: Removed `-template` suffix
  - `adr-template.md` → `adr.md`
  - `rfc-template.md` → `rfc.md`
  - `runbook-template.md` → `runbook.md`
  - Cleaner filenames, consistent with user expectations
- **Module Organization**: Restructured codebase
  - `src/lib/*` → `src/core/*` for better semantic clarity
  - Core functionality (config, context, template system) centralized
  - MCP-specific code remains in `src/mcp/`
- **Simplified Template Library**: Focus on essential templates
  - Removed verbose templates (patterns, standards, writing-software, testing, troubleshooting)
  - Added concise, actionable templates (domain, journal-entry, meeting-notes, todo-list)
  - 10 total templates optimized for agent use

### Deprecated

- Legacy documentation structure in `docs/` directory (removed, migrated to `.docent/`)
- Duplicate runbooks in `.docent/runbooks/` that now ship with package

### Removed

- **37 obsolete files from `docs/` directory**:
  - 11 RFCs - Historical architectural proposals (either implemented or abandoned)
  - 5 research documents - Brainstorming and investigation notes
  - 11 old journal entries - Superseded by `.docent/journals/`
  - 4 CLI specs - Obsolete after MCP-only architecture (ADR-0004)
  - 5 obsolete templates - Verbose templates replaced by concise versions
  - 1 PRD - Early vision document
- **Deprecated runbooks**:
  - `prepare-release.md` - Superseded by unified `release-package.md`
  - `publish-package.md` - Superseded by unified `release-package.md`
- **Default `docs` search path** - Removed from configuration defaults

### Technical

- Added `TemplateClassifier` class for semantic template matching
- Added `ResourceRegistry` for centralized resource management
- Enhanced configuration system with `.docent/` as default root
- Updated 5 test files to match new structure and defaults
- Improved MCP tool integration with resource registry
- Better separation between bundled and user resources

## [0.8.0] - 2025-10-21

### Added

- **File Issue Tool**: New MCP tool for filing GitHub issues directly from agent sessions
  - Seamless issue reporting without context switching
  - Auto-gathers environment context (docent version, Node version, OS, architecture)
  - Includes docent configuration and project type when available
  - Uses GitHub CLI (`gh`) - no token management needed
  - Graceful fallback with installation instructions if `gh` not available
  - Four issue types supported: bug, feature, question, documentation
  - Implements RFC-0010 for reducing feedback friction
- **Enhanced Pre-commit Hook**: Comprehensive quality checks before commits
  - Tests, build, and markdown linting
  - Debug code detection
  - Temporary file cleanup
  - All CI checks run locally before push
- **Quick Mode for Doctor Tool**: New `--quick` flag for fast mechanical checks only
  - Skips semantic documentation analysis for faster results
  - Ideal for quick health checks during development

### Changed

- **Doctor Tool Output**: Concise mode by default for better agent readability
  - Default output now shows only failed checks with grouped issues (max 5 per category)
  - **83% reduction in output** (from ~174 lines to ~29 lines for typical projects)
  - New `verbose` parameter to show all details when needed
  - Optimized for agent token efficiency while maintaining actionable insights
  - Addresses issue #2 - reduces cognitive load and token usage during MCP sessions
- **MCP Tool Naming**: Improved clarity with backward compatibility
  - `init-project` → `bootstrap` (with deprecation warning)
  - `audit` → merged into `doctor` (with deprecation warning)
  - `init-session` resource → `context` resource (with deprecation warning)
  - All old names still work with guidance to update

### Fixed

- **Doctor Tool False Positives**: Resolved incorrect warnings for documented scripts (#4)
  - Now recognizes scripts documented by basename (e.g., "script.sh" vs "scripts/script.sh")
  - Checks common directories (scripts/, bin/, tools/) for bare filenames
  - Eliminates spurious "undocumented file" warnings
- **Publish Workflow**: Added all CI checks to prevent broken releases
  - Tests, build, and linting run before npm publish
  - Ensures release quality matches CI standards
- **Journal Linting**: Prevented journal files from triggering markdown lint on unrelated commits

### Technical

- Consolidated test and lint workflows into unified CI workflow
- Updated all documentation to reflect MCP tool naming changes
- Improved structure reconciliation logic in doctor tool
- Enhanced basename recognition for documented paths

## [0.7.0] - 2025-10-19

### Added

- **Configuration System**
  - Support for `.docentrc`, `.docentrc.yaml`, and `.docentrc.yml` configuration files
  - `root` option to customize documentation directory (default: `docs`)
  - `sessionThresholdMinutes` option to control journal session duration (default: 30 minutes)
  - Simple YAML parser for configuration without external dependencies
  - Dependency injection pattern with `Context` object throughout codebase
  - Computed paths for `docsRoot` and `journalRoot` based on configuration

### Changed

- **Journal Sessions**: Default threshold reduced from 4 hours to 30 minutes for shorter, more manageable journal files
- **Behavioral Instructions**: Completely rewrote init-session prompt with much stronger, more explicit guidance
  - Changed from soft "Required Behaviors" to forceful "CRITICAL BEHAVIORAL REQUIREMENTS"
  - Added concrete examples of correct vs incorrect patterns with visual markers (✅ ❌)
  - Provided detailed JSON example for `capture-work` tool usage
  - Made all requirements explicit and non-negotiable to improve agent compliance
  - Emphasized MCP tool usage throughout with specific URIs and call patterns
  - Added step-by-step session pattern for consistent workflow

### Technical

- Refactored entire codebase to use `Context` pattern for dependency injection
- `SessionManager` now reads threshold from config instead of constructor parameter
- All services (ResourceHandler, SessionManager, PromptBuilder, etc.) accept `Context` objects
- Added 3 new tests for session threshold configuration (30 total tests passing)

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
