# docket

> Documentation platform with smart CLI, templates, and agent-agnostic protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

## The Problem

Most software projects struggle with documentation:
- Non-existent or outdated
- Scattered across wikis, comments, Slack, and tribal knowledge
- No clear structure or templates
- Hard to maintain as projects evolve

## The Solution

**docket** is a complete documentation platform with three powerful components:

### 1. Smart CLI
- **`docket analyze`** - Detect languages, frameworks, and project structure
- **`docket init`** - Smart initialization with customized templates
- **`docket audit`** - Find documentation gaps and missing content
- **`docket review`** - Detect stale docs and code/documentation drift

### 2. Production-Ready Templates
11 comprehensive templates that work with any project:
- **Architecture Decision Records (ADRs)** - Document significant architectural choices
- **Request for Comments (RFCs)** - Propose and discuss features before implementation
- **Runbooks** - Step-by-step operational procedures
- **Troubleshooting Guides** - Diagnose and resolve common issues
- **API Documentation** - Comprehensive API reference with examples
- **Architecture Overviews** - High-level system design documentation
- **Developer Onboarding** - Get new team members productive quickly
- **Architectural Patterns** - Establish consistent code patterns across the project
- **Code Standards** - Define coding conventions and style guidelines
- **Testing Philosophy** - Document testing approach and practices
- **Development Philosophy** - Define how your team builds software

### 3. Agent-Agnostic Protocol
- Works with **any** AI coding agent (Claude Code, Cursor, Aider, etc.)
- Structured JSON output for agent consumption
- Complete protocol documentation in `.docket-protocol/`
- No vendor lock-in

## Quick Start

### CLI Installation (Recommended)

```bash
# Install globally via npm
npm install -g @tnezdev/docket

# Or use with npx (no installation needed)
npx @tnezdev/docket analyze
```

**Basic Usage:**

```bash
# Analyze your project
docket analyze

# Initialize documentation
docket init

# Check for gaps
docket audit

# Review for staleness
docket review
```

**For AI Agents:**

All commands support `--output json` for structured data:

```bash
docket analyze --output json
docket init --non-interactive --output json
docket audit --output json
docket review --output json
```

See [`.docket-protocol/agent-guide.md`](.docket-protocol/agent-guide.md) for complete agent integration guide.

### Install via Script (Alternative)

```bash
# Interactive installation (prompts for template selection)
curl -fsSL https://raw.githubusercontent.com/tnez/docket/main/scripts/install.sh | bash

# Install specific templates
curl -fsSL https://raw.githubusercontent.com/tnez/docket/main/scripts/install.sh | bash -s -- --templates=adr,rfc

# Or download and review first (recommended)
curl -fsSL https://raw.githubusercontent.com/tnez/docket/main/scripts/install.sh -o install.sh
chmod +x install.sh
./install.sh --help
```

### Installation Options

```bash
# Install all templates
./install.sh --templates=all --non-interactive

# Install to custom directory
./install.sh --target-dir=documentation

# Dry-run to preview changes
./install.sh --dry-run

# Overwrite existing files
./install.sh --templates=adr --force

# Backup existing files before installing
./install.sh --templates=all --backup
```

### Use as GitHub Template

1. Click "Use this template" button
2. Create your repository
3. Clone and start documenting

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/tnez/docket.git
cd docket

# Run installer from your project directory
cd /path/to/your/project
/path/to/docket/scripts/install.sh --templates=adr,rfc
```

### Uninstall

```bash
# Remove installed templates
./scripts/uninstall.sh

# Dry-run to preview what would be removed
./scripts/uninstall.sh --dry-run
```

## Features

### Smart Project Analysis
- **Language Detection** - Automatically identifies all programming languages in your project
- **Framework Discovery** - Detects web, backend, testing, and other frameworks
- **Structure Analysis** - Finds source, test, and docs directories
- **Build Tool Recognition** - Identifies build systems and package managers
- **JSON Output** - Structured data perfect for agent consumption

### Intelligent Documentation Initialization
- **Context-Aware** - Customizes templates based on your project's tech stack
- **Interactive & Non-Interactive** - Works great for humans and agents
- **Smart Defaults** - Reasonable defaults when run non-interactively
- **Preserves Context** - Saves project profile for future use

### Gap Detection & Audit
- **Completeness Scoring** - 0-100 score for documentation completeness
- **Prioritized Gaps** - High/medium/low severity for each gap
- **Coverage Tracking** - Checks for architecture, ADRs, standards, testing, API, etc.
- **Actionable Suggestions** - Specific recommendations for each gap

### Drift Detection & Review
- **Staleness Detection** - Finds docs not updated in 1+ months
- **Code-Docs Alignment** - Detects when code changes without doc updates
- **Framework Drift** - Identifies mismatches between code and documentation
- **Health Scoring** - Overall documentation health score (0-100)

### Production-Ready Templates
- 11 comprehensive documentation templates covering common needs
- Real-world examples demonstrating best practices
- Clear guidance on when to use each template
- Consistent formatting across all documentation

### Agent-Agnostic Architecture
- **No Vendor Lock-In** - Works with any AI coding agent
- **Structured Output** - All commands support `--output json`
- **Protocol Documentation** - Complete guide for agent developers
- **JSON Schemas** - Typed, validated output for reliable parsing
- **Battle-Tested** - Designed for Claude Code, works with Cursor, Aider, etc.

### Built on Best Practices
- Research from 15+ leading open-source projects
- Based on Divio Documentation System principles
- Follows ADR and RFC best practices
- Battle-tested patterns from enterprise projects

## Why Use docket?

### For Solo Developers
- **Smart Setup** - `docket init` sets up documentation in seconds
- **Gap Detection** - Never wonder what's missing
- **Maintenance Help** - `docket review` finds stale docs automatically
- **Professional** - Document your project like the pros
- **Portfolio boost** - Well-documented projects stand out

### For Teams
- **Consistency** - Everyone follows the same structure
- **Automated Checks** - Run `docket audit` in CI/CD
- **Onboarding** - New team members understand the project quickly
- **Decision tracking** - ADRs capture why decisions were made
- **Operational excellence** - Runbooks ensure smooth operations
- **Health Monitoring** - Track documentation health over time

### For AI-Assisted Development
- **Agent-Agnostic** - Works with any AI coding agent
- **Context-Rich** - AI agents understand your project instantly
- **Structured Output** - JSON mode for programmatic access
- **Smart Suggestions** - Agents can suggest what to document
- **Maintenance Automation** - Agents help keep docs current

### For Open Source Projects
- **Contributor friendly** - Clear documentation attracts contributors
- **Professional appearance** - Shows project maturity
- **Community building** - RFCs enable community-driven design
- **Maintenance** - Troubleshooting guides reduce support burden
- **CI Integration** - Automated documentation checks

## Roadmap

- [x] Research and design
- [x] Phase 0: Foundation (Week 1) - **COMPLETE**
- [x] Phase 1: Core Templates (Weeks 2-3) - **COMPLETE**
- [x] Phase 2: Bootstrap System (Weeks 4-5) - **COMPLETE**
- [x] Phase 3: Testing & Validation (Weeks 6-7) - **COMPLETE**
- [ ] Phase 4: Launch (Week 8)

**Current Status:** 🚀 Phase 3 Complete - Ready for Launch
**Current Version:** v0.3.0-alpha

## Testing

docket includes a comprehensive test suite to ensure reliability across platforms.

### Running Tests

```bash
# Run full test suite
./test/test-install.sh

# Tests run automatically on CI for:
# - Push to main branch
# - Pull requests
```

### Test Coverage

- ✅ Installation scenarios (clean, conflict, custom directory)
- ✅ Uninstallation
- ✅ Dry-run mode
- ✅ Conflict handling
- ✅ Backup creation
- ✅ Cross-platform compatibility (macOS, Linux)

See [test/README.md](test/README.md) for detailed testing guide and [test/TESTING-CHECKLIST.md](test/TESTING-CHECKLIST.md) for the pre-release checklist.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to report bugs
- How to suggest features
- How to submit pull requests
- Development setup

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use this template for any project (personal or commercial)
- ✅ Modify and customize to your needs
- ✅ Distribute and share
- ✅ Include in proprietary software

## Acknowledgments

Built on the shoulders of giants:

- [Divio Documentation System](https://documentation.divio.com/) - Documentation structure principles
- [Architectural Decision Records](https://adr.github.io/) - ADR format and best practices
- [IETF RFC Process](https://www.ietf.org/standards/rfcs/) - RFC inspiration
- Leading open-source projects - Documentation patterns and examples

## Contact

- **Issues:** [GitHub Issues](https://github.com/tnez/docket/issues) - Report bugs or request features
- **GitHub:** [@tnez](https://github.com/tnez)
- **Author:** [tnezdev](https://github.com/tnez)

## Available Templates

| Template | Purpose | Use When |
|----------|---------|----------|
| **adr-template.md** | Architecture Decision Records | Making significant architectural decisions |
| **rfc-template.md** | Request for Comments | Proposing new features or major changes |
| **runbook-template.md** | Operational Procedures | Documenting recurring operational tasks |
| **troubleshooting-template.md** | Problem Diagnosis | Creating guides for common issues |
| **api-documentation-template.md** | API Reference | Documenting REST/GraphQL APIs |
| **architecture-overview-template.md** | System Design | Describing high-level system architecture |
| **onboarding-template.md** | Developer Onboarding | Setting up new team members for success |
| **patterns-template.md** | Architectural Patterns | Establishing consistent code patterns |
| **standards-template.md** | Code Standards | Defining coding conventions and style |
| **testing-template.md** | Testing Philosophy | Documenting testing approach and practices |
| **writing-software-template.md** | Development Philosophy | Defining how your team builds software |

---

**Status:** Alpha (Phase 3 Complete) | **Next Milestone:** Phase 4 - Launch

*Star this repo ⭐ to follow development progress*
