# Repository Structure Design

## Overview

This document defines the complete directory structure for the project documentation template repository. The template is designed to be installed into any project's `docs/` directory, providing a comprehensive documentation framework based on the Diataxis principles and battle-tested patterns from leading open source projects.

---

## Complete Directory Structure

```
project-docs-template/
├── README.md                           # Template overview and installation
├── LICENSE                             # MIT or similar open license
├── install.sh                          # Universal installer script
├── package.json                        # npm create package metadata
│
├── docs/                               # Documentation about the template
│   ├── README.md                      # Documentation index
│   ├── quickstart.md                  # 5-minute getting started
│   ├── usage-guide.md                 # How to use the template
│   ├── customization.md               # Customizing for your project
│   ├── best-practices.md              # Documentation best practices
│   └── architecture.md                # Template design decisions
│
├── templates/                          # Documentation templates by project type
│   ├── base/                          # Base template (minimal, universal)
│   │   ├── README.md                  # Project documentation index
│   │   ├── quickstart.md              # Getting started guide
│   │   ├── writing-software.md        # How we write software
│   │   ├── patterns.md                # High-level patterns
│   │   ├── standards.md               # Code standards
│   │   ├── code-review.md             # Code review practices
│   │   ├── testing.md                 # Testing philosophy and practices
│   │   ├── onboarding.md              # Developer onboarding
│   │   ├── doc-health.md              # Documentation maintenance
│   │   │
│   │   ├── tutorials/                 # Learning-oriented
│   │   │   ├── README.md
│   │   │   └── .gitkeep
│   │   │
│   │   ├── guides/                    # Problem-oriented how-tos
│   │   │   ├── README.md
│   │   │   └── .gitkeep
│   │   │
│   │   ├── reference/                 # Information-oriented
│   │   │   ├── README.md
│   │   │   ├── api/
│   │   │   │   └── README.md
│   │   │   ├── cli/
│   │   │   │   └── README.md
│   │   │   ├── configuration/
│   │   │   │   └── README.md
│   │   │   └── glossary.md
│   │   │
│   │   ├── concepts/                  # Understanding-oriented
│   │   │   ├── README.md
│   │   │   └── architecture.md
│   │   │
│   │   ├── examples/                  # Working examples
│   │   │   ├── README.md
│   │   │   └── .gitkeep
│   │   │
│   │   └── contributing/              # Contributor documentation
│   │       ├── README.md
│   │       ├── development.md
│   │       └── documentation.md
│   │
│   ├── library/                       # Library/package template
│   │   └── [extends base with library-specific content]
│   │
│   ├── application/                   # Application template
│   │   └── [extends base with application-specific content]
│   │
│   ├── framework/                     # Framework template
│   │   └── [extends base with framework-specific content]
│   │
│   └── cli/                           # CLI tool template
│       └── [extends base with CLI-specific content]
│
├── .claude/                           # Claude Code integration
│   ├── commands/                      # Custom slash commands
│   │   ├── review-docs.md            # Review documentation quality
│   │   ├── update-docs.md            # Update documentation
│   │   └── check-drift.md            # Check for documentation drift
│   │
│   ├── agents/                        # Specialized agents
│   │   ├── doc-writer.md             # Documentation writing agent
│   │   ├── doc-reviewer.md           # Documentation review agent
│   │   └── drift-detector.md         # Drift detection agent
│   │
│   └── output-styles/                 # Output formatting
│       └── documentation.md           # Documentation-focused output style
│
├── scripts/                           # Automation scripts
│   ├── validate-docs.sh              # Validate documentation structure
│   ├── check-links.sh                # Check for broken links
│   ├── test-examples.sh              # Test code examples
│   ├── generate-toc.sh               # Generate table of contents
│   └── detect-drift.sh               # Detect outdated documentation
│
├── examples/                          # Real-world examples
│   ├── rust-library/                 # Example: Rust library docs
│   │   └── docs/
│   │
│   ├── javascript-app/               # Example: JavaScript app docs
│   │   └── docs/
│   │
│   ├── python-api/                   # Example: Python API docs
│   │   └── docs/
│   │
│   └── go-cli/                       # Example: Go CLI tool docs
│       └── docs/
│
├── .github/                           # GitHub-specific files
│   ├── workflows/                    # CI/CD workflows
│   │   ├── docs-test.yml            # Test documentation
│   │   ├── docs-deploy.yml          # Deploy documentation
│   │   └── docs-preview.yml         # Preview documentation on PRs
│   │
│   ├── ISSUE_TEMPLATE/               # Issue templates
│   │   ├── doc-improvement.md       # Documentation improvement
│   │   └── doc-request.md           # Documentation request
│   │
│   └── PULL_REQUEST_TEMPLATE.md     # PR template with docs checklist
│
├── config/                            # Configuration files
│   ├── vale/                         # Prose linting configuration
│   │   ├── .vale.ini
│   │   └── styles/
│   │
│   ├── markdownlint.json             # Markdown linting rules
│   ├── .editorconfig                 # Editor configuration
│   └── .gitignore                    # Documentation build artifacts
│
└── tests/                             # Template tests
    ├── test-install.sh               # Test installation process
    ├── test-structure.sh             # Test directory structure
    └── test-templates.sh             # Test template validity
```

---

## File and Directory Purposes

### Root Level

#### `README.md`
**Purpose**: Main entry point for the template repository.

**Contents**:
- What this template provides
- Why use this template
- Quick installation instructions
- Links to detailed documentation
- Example projects using this template
- Contribution guidelines

**Customization**: Teams generally don't customize this (it's about the template itself).

#### `LICENSE`
**Purpose**: Legal terms for using and modifying the template.

**Contents**: MIT License (recommended for maximum adoption).

**Customization**: Teams might change license to match their organization's policy.

#### `install.sh`
**Purpose**: Universal installer that works on any Unix-like system.

**Contents**:
- Project type detection (language, framework)
- Interactive prompts for customization
- Directory structure creation
- Template file copying
- Placeholder replacement (project name, etc.)
- Git initialization (if needed)
- Next steps display

**Customization**: Teams don't modify this (it installs the template).

#### `package.json`
**Purpose**: Metadata for `npm create project-docs` command.

**Contents**:
- Package name and version
- Entry point (index.js)
- Dependencies
- Keywords and description

**Customization**: Teams don't modify this (it's for template distribution).

---

### `/docs/` - Template Documentation

This directory contains documentation about the template itself (meta-documentation).

#### `docs/README.md`
**Purpose**: Index for template documentation.

**Contents**:
- Overview of template
- Links to all template docs
- Quick navigation

**When to Customize**: Never (describes the template).

#### `docs/quickstart.md`
**Purpose**: Get the template installed and customized in 5 minutes.

**Contents**:
- Prerequisites
- Installation command
- Basic customization
- Verification steps
- Next actions

**When to Customize**: Never (guides template users).

#### `docs/usage-guide.md`
**Purpose**: Comprehensive guide to using the template.

**Contents**:
- Understanding the structure
- Where to put different doc types
- How to use Diataxis framework
- Writing your first documentation
- Progressive enhancement

**When to Customize**: Never (explains template usage).

#### `docs/customization.md`
**Purpose**: How to adapt template for specific needs.

**Contents**:
- Placeholder replacement
- Adding project-specific sections
- Customizing for tech stack
- Specialized documentation types
- Removing unused sections

**When to Customize**: Never (guides customization process).

#### `docs/best-practices.md`
**Purpose**: Documentation best practices and principles.

**Contents**:
- Diataxis principles explained
- Writing style guidelines
- Code example practices
- Link and reference practices
- Version management
- Testing documentation

**When to Customize**: Never (general best practices).

#### `docs/architecture.md`
**Purpose**: Design decisions and rationale for template structure.

**Contents**:
- Why Diataxis framework
- Directory structure decisions
- Tool choices
- Research citations
- Alternative approaches considered

**When to Customize**: Never (explains template design).

**Dependencies**: None (all template docs are self-contained).

---

### `/templates/` - Project Documentation Templates

Templates organized by project type. All extend the base template.

#### `/templates/base/`
**Purpose**: Minimal, universal template that works for any project type.

**Structure**: Complete Diataxis-based documentation structure with generic content.

**When Teams Customize**: Always - this is installed into their `docs/` directory.

##### Core Documentation Files

**`README.md`**: Documentation index with navigation to all sections.

**`quickstart.md`**: 5-minute getting started guide for the project.
- Installation
- Basic usage
- First meaningful action
- Next steps

**`writing-software.md`**: Philosophy and principles for how the team writes software.
- Based on `/Users/tnez/Desktop/thoughts-on-application-architecture.md`
- Domain-driven structure
- Testing philosophy
- Generic principles with TODO markers for specialization

**`patterns.md`**: High-level architectural patterns used in the project.
- Pattern catalog
- When to use each pattern
- Implementation examples
- Links to code

**`standards.md`**: Code standards and conventions.
- Language-agnostic standards
- Language-specific sections (TODO markers)
- Automated tooling references
- Review checklist

**`code-review.md`**: Code review philosophy and practices.
- Review process
- Giving feedback
- Receiving feedback
- Checklists
- Common issues

**`testing.md`**: Testing philosophy and practices.
- What to test (business requirements)
- Testing implementation (CI/CD, agent-driven)
- Test organization
- Coverage expectations
- Testing workflows

**`onboarding.md`**: New developer onboarding guide.
- Day 1 checklist
- Week 1-4 progression
- Tools and access
- First contribution
- Learning resources

**`doc-health.md`**: Meta-documentation about maintaining documentation.
- Signs docs need updating
- Review schedule
- Drift detection
- Ownership
- Coverage metrics

##### Diataxis Directories

**`tutorials/`**: Learning-oriented, hand-holding documentation.
- Step-by-step guides
- Learning objectives stated upfront
- Safe, repeatable examples
- Progressive complexity
- README.md with index

**`guides/`**: Problem-oriented how-to guides.
- Task-focused
- Prerequisites stated
- Verification steps
- Troubleshooting
- README.md with index

**`reference/`**: Information-oriented technical reference.
- Comprehensive coverage
- Consistent format
- Often auto-generated
- Subdivided by type (api, cli, configuration)
- Glossary of terms

**`concepts/`**: Understanding-oriented explanations.
- Architectural concepts
- Design decisions
- Trade-offs
- Alternatives
- Why, not just what

**`examples/`**: Working example code.
- Runnable examples
- Basic to advanced progression
- Real-world scenarios
- README with descriptions

**`contributing/`**: Contributor documentation.
- Development setup
- Contribution workflow
- Documentation standards
- Release process

**When to Customize**:
- Immediately: Fill TODO markers with project specifics
- Week 1: Add first tutorial and guides
- Month 1: Expand all sections based on project needs

**Dependencies**:
- Templates reference each other (quickstart → tutorial → guides)
- Reference documentation may depend on code generation tools
- Code review checklist references standards.md

#### `/templates/library/`
**Purpose**: Template specialized for libraries and packages.

**Extends Base With**:
- API design guide
- Versioning and releases
- Package publication process
- Breaking change policy
- Migration guides
- Integration examples

**When to Use**: Creating a library, SDK, or reusable package.

#### `/templates/application/`
**Purpose**: Template specialized for applications (web, mobile, desktop).

**Extends Base With**:
- Deployment guide
- Configuration management
- Feature documentation
- User flows
- Troubleshooting common issues
- Environment setup (dev, staging, prod)

**When to Use**: Building an end-user application.

#### `/templates/framework/`
**Purpose**: Template specialized for frameworks and platforms.

**Extends Base With**:
- Plugin/extension system
- Framework architecture
- Lifecycle hooks
- Advanced customization
- Performance optimization
- Migration from other frameworks

**When to Use**: Building a framework or platform for other developers.

#### `/templates/cli/`
**Purpose**: Template specialized for command-line tools.

**Extends Base With**:
- Command reference (generated)
- Usage examples for each command
- Configuration file reference
- Scripting and automation
- Shell completion
- Exit codes and error messages

**When to Use**: Building a CLI tool.

---

### `/.claude/` - Claude Code Integration

Provides specialized agents and commands for documentation work.

#### `/commands/`
**Purpose**: Custom slash commands for documentation tasks.

**`review-docs.md`**: Reviews documentation for quality, completeness, accuracy.
- Checks against standards
- Identifies gaps
- Suggests improvements

**`update-docs.md`**: Updates documentation after code changes.
- Identifies affected docs
- Updates references
- Tests examples

**`check-drift.md`**: Detects documentation drift from code.
- Compares docs to code
- Identifies outdated sections
- Suggests updates

**When Teams Customize**: Add project-specific documentation workflows.

#### `/agents/`
**Purpose**: Specialized agents for documentation tasks.

**`doc-writer.md`**: Writes documentation from code and context.
- Follows project style
- Uses templates
- Includes examples

**`doc-reviewer.md`**: Reviews documentation quality.
- Checks completeness
- Validates examples
- Tests links

**`drift-detector.md`**: Monitors documentation health.
- Detects outdated content
- Identifies missing docs
- Tracks coverage

**When Teams Customize**: Adapt to project-specific patterns and standards.

#### `/output-styles/`
**Purpose**: Formatting styles for documentation output.

**`documentation.md`**: Style for documentation-focused output.
- Clear structure
- Scannable format
- Code examples
- Cross-references

**When Teams Customize**: Match organization's documentation voice.

**Dependencies**: Commands use agents; agents use output styles.

---

### `/scripts/` - Automation Scripts

Shell scripts for common documentation tasks.

#### `validate-docs.sh`
**Purpose**: Validate documentation structure and completeness.

**Contents**:
- Check required files exist
- Validate frontmatter
- Check for TODO markers
- Verify links between docs

**When to Run**: Pre-commit, CI/CD.

#### `check-links.sh`
**Purpose**: Find broken links (internal and external).

**Contents**:
- Parse markdown for links
- Verify internal links exist
- Check external links (optional, can be slow)
- Report broken links

**When to Run**: CI/CD, manual.

#### `test-examples.sh`
**Purpose**: Test code examples in documentation.

**Contents**:
- Extract code blocks from markdown
- Execute examples
- Verify expected output
- Report failures

**When to Run**: CI/CD, before releases.

#### `generate-toc.sh`
**Purpose**: Generate table of contents for documentation.

**Contents**:
- Parse markdown headings
- Generate navigation structure
- Update index files
- Create breadcrumbs

**When to Run**: Pre-commit, manually.

#### `detect-drift.sh`
**Purpose**: Detect documentation drift from code.

**Contents**:
- Compare API references to code
- Check for outdated examples
- Identify missing documentation
- Generate drift report

**When to Run**: CI/CD, weekly.

**When Teams Customize**: Add project-specific validation rules.

**Dependencies**: Scripts may depend on tools like `markdown-link-check`, language-specific linters.

---

### `/examples/` - Real-World Examples

Complete example projects showing template in action.

#### `rust-library/`
**Purpose**: Example of template used for Rust library documentation.

**Contents**: Full `docs/` directory for a fictional Rust library.

**Shows**:
- Cargo doc integration
- Testing examples
- API reference generation
- Rust-specific patterns

#### `javascript-app/`
**Purpose**: Example of template used for JavaScript application.

**Contents**: Full `docs/` directory for a fictional JavaScript app.

**Shows**:
- npm scripts integration
- Deployment documentation
- Configuration management
- JSDoc integration

#### `python-api/`
**Purpose**: Example of template used for Python API.

**Contents**: Full `docs/` directory for a fictional Python API.

**Shows**:
- Sphinx integration
- API endpoint documentation
- OpenAPI integration
- Python-specific patterns

#### `go-cli/`
**Purpose**: Example of template used for Go CLI tool.

**Contents**: Full `docs/` directory for a fictional Go CLI.

**Shows**:
- cobra/viper documentation
- Command reference generation
- Man page generation
- Go-specific patterns

**When Teams Customize**: Use as reference, don't modify.

**Dependencies**: Examples are independent, self-contained.

---

### `/.github/` - GitHub Integration

CI/CD workflows and templates for GitHub projects.

#### `/workflows/`

**`docs-test.yml`**: Test documentation on every push/PR.
- Run validation scripts
- Check links
- Test examples
- Lint prose (vale)
- Report failures

**`docs-deploy.yml`**: Deploy documentation on merge to main.
- Build documentation
- Deploy to hosting (GitHub Pages, Netlify, etc.)
- Update search index
- Notify team

**`docs-preview.yml`**: Preview documentation on PRs.
- Build documentation
- Deploy to preview URL
- Comment on PR with preview link
- Clean up on PR close

**When Teams Customize**: Adapt to deployment targets and tools.

#### `/ISSUE_TEMPLATE/`

**`doc-improvement.md`**: Template for documentation improvement issues.
- What needs improvement
- Current state
- Desired state
- Affected files

**`doc-request.md`**: Template for documentation requests.
- What needs documentation
- Audience
- Priority
- Related code/features

**When Teams Customize**: Add project-specific questions.

#### `PULL_REQUEST_TEMPLATE.md`
**Purpose**: PR template with documentation checklist.

**Contents**:
- Changes description
- Documentation updated checkbox
- Examples tested checkbox
- Links checked checkbox
- Standards followed checkbox

**When Teams Customize**: Add project-specific checklist items.

**Dependencies**: Workflows depend on scripts; templates standalone.

---

### `/config/` - Configuration Files

Configuration for documentation tooling.

#### `/vale/`
**Purpose**: Prose linting configuration.

**`.vale.ini`**: Vale configuration file.
- Style rules to use
- File patterns to check
- Severity levels

**`styles/`**: Vale style rules.
- Project-specific terminology
- Tone and voice rules
- Grammar rules

**When Teams Customize**: Add organization-specific terminology and style.

#### `markdownlint.json`
**Purpose**: Markdown linting rules.

**Contents**: Rules for markdown formatting consistency.

**When Teams Customize**: Adjust rules to match team preferences.

#### `.editorconfig`
**Purpose**: Editor configuration for consistent formatting.

**Contents**:
- Indent style (spaces)
- Line length
- Trailing whitespace
- End of file newline

**When Teams Customize**: Match team's editor preferences.

#### `.gitignore`
**Purpose**: Ignore documentation build artifacts.

**Contents**:
- Built documentation output
- Temporary files
- Tool caches

**When Teams Customize**: Add project-specific build artifacts.

**Dependencies**: Vale styles depend on `.vale.ini`; others standalone.

---

### `/tests/` - Template Tests

Tests to verify template integrity.

#### `test-install.sh`
**Purpose**: Test installation process works correctly.

**Contents**:
- Create temporary directory
- Run installer
- Verify structure created
- Verify placeholders replaced
- Clean up

**When to Run**: Before releasing template updates.

#### `test-structure.sh`
**Purpose**: Test directory structure is valid.

**Contents**:
- Verify required files exist
- Check file permissions
- Validate README files
- Check for broken symlinks

**When to Run**: CI/CD for template repository.

#### `test-templates.sh`
**Purpose**: Test template files are valid.

**Contents**:
- Validate markdown syntax
- Check frontmatter
- Verify TODO markers have instructions
- Test placeholder format

**When to Run**: CI/CD for template repository.

**When Teams Customize**: Teams don't run these (template maintainer tests).

**Dependencies**: Tests are standalone.

---

## Installation and Customization Flow

### Installation Process

1. **User runs installer**: `curl -fsSL https://raw.githubusercontent.com/user/project-docs-template/main/install.sh | bash`

2. **Installer detects project type**: Checks for `package.json`, `Cargo.toml`, `go.mod`, etc.

3. **Interactive prompts**:
   - Project name (auto-detected from directory)
   - Project type (library, application, framework, CLI)
   - Primary language
   - Include examples? (Y/n)
   - Setup CI/CD? (Y/n)

4. **Template installation**:
   - Create `docs/` directory
   - Copy base template files
   - Copy project-type-specific additions
   - Replace placeholders (`{{PROJECT_NAME}}`, etc.)
   - Create `.gitkeep` files for empty directories

5. **Next steps display**:
   ```
   ✓ Documentation structure created in docs/

   Next steps:
     1. Review docs/README.md for documentation overview
     2. Edit docs/writing-software.md with your team's philosophy
     3. Fill TODO markers in docs/standards.md
     4. Add your first tutorial in docs/tutorials/
     5. Commit: git add docs/ && git commit -m "docs: Add documentation structure"

   Documentation guide: https://github.com/user/project-docs-template#usage
   ```

### Customization Timeline

**Day 1** (Essential):
- Replace `{{PROJECT_NAME}}` placeholders (installer does this)
- Fill project description in `docs/README.md`
- Write `docs/quickstart.md` with actual installation steps

**Week 1** (Important):
- Fill TODO markers in `docs/writing-software.md`
- Document high-level patterns in `docs/patterns.md`
- Write language-specific standards in `docs/standards.md`
- Create first tutorial in `docs/tutorials/`

**Month 1** (Recommended):
- Expand `docs/guides/` with common how-tos
- Generate API reference in `docs/reference/api/`
- Document architecture in `docs/concepts/architecture.md`
- Add working examples in `docs/examples/`

**Ongoing** (Maintenance):
- Keep documentation in sync with code
- Respond to documentation issues
- Review and update quarterly
- Monitor and fix drift

---

## File Relationships and Dependencies

### Navigation Flow

```
README.md (project)
  ↓
docs/README.md (documentation index)
  ↓
  ├─→ docs/quickstart.md (5 min)
  │     ↓
  │     └─→ docs/tutorials/ (30 min)
  │           ↓
  │           └─→ docs/guides/ (task-focused)
  │
  ├─→ docs/reference/ (lookup)
  │
  └─→ docs/examples/ (learn by doing)
```

### Cross-References

**Core Documentation**:
- `quickstart.md` → links to first tutorial
- `writing-software.md` → referenced by `patterns.md` and `standards.md`
- `patterns.md` → links to code examples
- `standards.md` → referenced by `code-review.md`
- `code-review.md` → links to standards checklist
- `testing.md` → links to examples
- `onboarding.md` → links to all core docs

**Diataxis Sections**:
- `tutorials/` → link to related guides
- `guides/` → link to related reference and concepts
- `reference/` → link to related tutorials and guides
- `concepts/` → link to related guides

### Build Dependencies

**Documentation Build**:
- `docs/reference/api/` may depend on code generation (TypeDoc, rustdoc, etc.)
- `docs/reference/cli/` may depend on CLI help text extraction
- Table of contents generation depends on markdown files

**Testing**:
- Example tests depend on language-specific test runners
- Link checking depends on `markdown-link-check` or similar
- Prose linting depends on Vale

**Deployment**:
- Static site generation depends on chosen tool (MkDocs, Docusaurus, etc.)
- Preview deployments depend on hosting platform
- Search indexing depends on search tool (Algolia, etc.)

---

## Customization Points

### Always Customize

These must be customized for every project:

1. **Project name and description** - Replace placeholders
2. **Quickstart guide** - Actual installation and usage
3. **Writing software philosophy** - Team's specific approach
4. **Code standards** - Language-specific conventions
5. **Architecture documentation** - Project's actual architecture

### Often Customize

These are commonly customized:

1. **Patterns documentation** - Project-specific patterns
2. **Testing practices** - Team's testing approach
3. **Code review checklist** - Team-specific concerns
4. **Onboarding steps** - Team-specific tools and access
5. **CI/CD workflows** - Deployment targets

### Rarely Customize

These work well as-is for most teams:

1. **Directory structure** - Diataxis framework is universal
2. **README templates** - Generic templates are effective
3. **Documentation health metrics** - Universal measures
4. **Vale style rules** - General best practices apply
5. **Validation scripts** - Work for any project

### Never Customize

These are part of the template itself:

1. **Template repository docs** - Describe the template
2. **Example projects** - Reference implementations
3. **Template tests** - Verify template integrity
4. **Installer script** - Template distribution mechanism

---

## Progressive Disclosure Strategy

The template supports starting minimal and growing over time:

### Minimal Viable Documentation (Day 1)

```
docs/
├── README.md                  # Documentation index
├── quickstart.md              # Getting started
└── writing-software.md        # Core philosophy
```

**What It Provides**: Enough to get started and understand the project.

### Enhanced Documentation (Week 1)

```
docs/
├── [above]
├── patterns.md                # Architectural patterns
├── standards.md               # Code standards
├── tutorials/
│   └── 01-basics.md          # First tutorial
└── guides/
    ├── setup.md              # Development setup
    └── deployment.md          # Deployment guide
```

**What It Adds**: Practical guides and standards for contributors.

### Complete Documentation (Month 1)

```
docs/
├── [above]
├── code-review.md             # Review practices
├── testing.md                 # Testing approach
├── onboarding.md              # New developer guide
├── reference/
│   └── api/                  # Generated API docs
├── concepts/
│   └── architecture.md        # Architecture deep-dive
└── examples/
    └── basic/                # Working examples
```

**What It Adds**: Comprehensive coverage for all contributors.

### Mature Documentation (Ongoing)

```
docs/
├── [above]
├── doc-health.md              # Documentation maintenance
├── tutorials/                 # Multiple tutorials
├── guides/                    # Comprehensive how-tos
├── reference/                 # Complete reference
├── concepts/                  # Deep explanations
└── examples/                  # Real-world examples
```

**What It Adds**: Maintenance processes and complete coverage.

---

## Tech Stack Agnostic Design

The template is designed to work with any technology stack:

### Universal (Works Everywhere)

- Directory structure (Diataxis framework)
- Markdown format
- Core documentation files
- Shell scripts
- Git integration

### Adaptable (Configure for Stack)

- API reference generation tool
- Code example testing approach
- Linting and formatting tools
- CI/CD platform
- Hosting solution

### Extensible (Add for Stack)

- Language-specific standards
- Framework-specific patterns
- Stack-specific tutorials
- Tool-specific guides

### Example Adaptations

**JavaScript/TypeScript Project**:
- API reference: TypeDoc
- Examples: Jest tests
- Linting: ESLint + Prettier
- Hosting: Netlify

**Rust Project**:
- API reference: rustdoc
- Examples: cargo test
- Linting: rustfmt + clippy
- Hosting: GitHub Pages

**Python Project**:
- API reference: Sphinx + autodoc
- Examples: pytest
- Linting: black + flake8
- Hosting: Read the Docs

**Go Project**:
- API reference: godoc
- Examples: go test
- Linting: gofmt + golint
- Hosting: pkg.go.dev

---

## Success Criteria

A successful installation and adoption looks like:

### Installation Success
- [x] Template installed in under 5 minutes
- [x] All placeholders replaced
- [x] Directory structure created
- [x] Next steps clearly displayed

### Day 1 Success
- [x] Project name and description added
- [x] Quickstart guide written
- [x] First commit with documentation structure

### Week 1 Success
- [x] Core documentation files customized
- [x] First tutorial written
- [x] Basic guides added
- [x] Standards documented

### Month 1 Success
- [x] Complete Diataxis structure populated
- [x] API reference generated
- [x] Examples added and tested
- [x] CI/CD configured

### Ongoing Success
- [x] Documentation reviewed with code
- [x] Drift detected and fixed
- [x] Documentation referenced in issues/PRs
- [x] New team members use onboarding docs
- [x] Documentation metrics improving

---

## Maintenance and Evolution

### Template Maintenance

**Weekly**:
- Review issues and PRs
- Update examples for new patterns
- Test installation on different projects

**Monthly**:
- Review and update best practices
- Add new template types if needed
- Update dependencies

**Quarterly**:
- Major version releases
- Research new documentation tools
- Survey template users

### Project Documentation Maintenance

**Per PR**:
- Update affected documentation
- Test examples
- Check links

**Weekly**:
- Review documentation issues
- Update drift detection report

**Monthly**:
- Review documentation metrics
- Identify gaps
- Plan improvements

**Quarterly**:
- Comprehensive documentation review
- Update architecture docs
- Refresh examples

---

## Summary

This repository structure provides:

1. **Complete template** - Ready to install and use
2. **Multiple project types** - Library, app, framework, CLI
3. **Progressive enhancement** - Start minimal, grow over time
4. **Automation support** - Scripts and CI/CD integration
5. **Real examples** - See template in action
6. **Meta-documentation** - Learn how to use the template
7. **Claude Code integration** - Agent-driven documentation
8. **Testing and validation** - Ensure quality

The structure is designed to be:
- **Universal** - Works for any project
- **Discoverable** - Clear navigation
- **Maintainable** - Low friction updates
- **Extensible** - Add project-specific content
- **Opinionated** - Strong defaults
- **Flexible** - Customize as needed

Next: See individual template files for detailed content and examples.
