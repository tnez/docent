# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-01-16

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
