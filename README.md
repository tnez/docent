# docket

> Standardized documentation templates for software projects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

## The Problem

Most software projects struggle with documentation:
- Non-existent or outdated
- Scattered across wikis, comments, Slack, and tribal knowledge
- No clear structure or templates
- Hard to maintain as projects evolve

## The Solution

**docket** provides production-ready documentation templates that work with any project:

- **Architecture Decision Records (ADRs)** - Document significant architectural choices
- **Request for Comments (RFCs)** - Propose and discuss features before implementation
- **Runbooks** - Step-by-step operational procedures
- **Troubleshooting Guides** - Diagnose and resolve common issues
- **API Documentation** - Comprehensive API reference with examples
- **Architecture Overviews** - High-level system design documentation

## Quick Start

### Install via Script

```bash
# Install templates in your project
curl -fsSL https://raw.githubusercontent.com/tnez/docket/main/scripts/install.sh | bash

# Or review first
curl -fsSL https://raw.githubusercontent.com/tnez/docket/main/scripts/install.sh -o install.sh
chmod +x install.sh
./install.sh
```

### Use as GitHub Template

1. Click "Use this template" button
2. Create your repository
3. Clone and start documenting

### Manual Installation

```bash
git clone https://github.com/tnez/docket.git
cd docket
./scripts/install.sh /path/to/your/project
```

## Features

### Production-Ready Templates
- 6+ documentation templates covering common needs
- Real-world examples demonstrating best practices
- Clear guidance on when to use each template
- Consistent formatting across all documentation

### Smart Installation
- Conflict detection - won't overwrite existing docs without asking
- Rollback support - undo installation if needed
- Dry-run mode - preview changes before applying
- Works with any project type (JavaScript, Python, Rust, Go, etc.)

### AI-Ready
- Templates optimized for AI agent context
- Agent-agnostic approach (works with Claude, Cursor, Aider, etc.)
- Clear structure makes it easy for AI to understand project state
- Instructions for integrating with popular AI coding tools

### Built on Best Practices
- Research from 15+ leading open-source projects
- Based on Divio Documentation System principles
- Follows ADR and RFC best practices
- Battle-tested patterns from enterprise projects

## Why Use docket?

### For Solo Developers
- Quick setup - get started in minutes
- Flexible - use only what you need
- Professional - document your project like the pros
- Portfolio boost - well-documented projects stand out

### For Teams
- Consistent - everyone follows the same structure
- Onboarding - new team members understand the project quickly
- Decision tracking - ADRs capture why decisions were made
- Operational excellence - runbooks ensure smooth operations

### For Open Source Projects
- Contributor friendly - clear documentation attracts contributors
- Professional appearance - shows project maturity
- Community building - RFCs enable community-driven design
- Maintenance - troubleshooting guides reduce support burden

## Roadmap

- [x] Research and design
- [x] Phase 0: Foundation (Week 1) - **IN PROGRESS**
- [ ] Phase 1: Core Templates (Weeks 2-3)
- [ ] Phase 2: Bootstrap System (Weeks 4-5)
- [ ] Phase 3: Testing & Validation (Weeks 6-7)
- [ ] Phase 4: Launch (Week 8)

**Current Status:** 🚧 In Development - Phase 0
**Current Version:** v0.1.0-alpha

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

---

**Status:** Pre-Alpha (Phase 0) | **Next Milestone:** Phase 1 - Core Templates

*Star this repo ⭐ to follow development progress*
