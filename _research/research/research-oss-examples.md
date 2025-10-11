# Open Source Documentation Structure Research

## Overview

This research examines documentation organization patterns in five major open source projects to identify effective structures, conventions, and practices.

---

## 1. Rust Programming Language

**Repository**: https://github.com/rust-lang/rust

**Documentation Location**: `/src/doc/` in main repository

### Structure Analysis

Rust maintains a highly modular documentation architecture with multiple books and guides targeting different audiences and skill levels.

#### Documentation Components

**Books (Comprehensive Guides)**:
- **The Book** - Primary learning resource for Rust
- **Rust by Example** - Learn by doing with runnable examples
- **The Nomicon** - Dark arts of unsafe Rust
- **The Embedded Book** - Embedded systems programming
- **Edition Guide** - Understanding Rust editions
- **The Reference** - Formal specification of Rust
- **Unstable Book** - Nightly-only features documentation

**Topical Guides**:
- Error handling patterns
- Ownership and borrowing
- Macro system
- Testing strategies
- Unsafe code guidelines
- FFI (Foreign Function Interface)

**Reference Materials**:
- FAQs (Design, Language, Project)
- Grammar documentation
- Style guide
- Man pages for tools
- Rustdoc documentation
- Rustc (compiler) documentation

### Organizational Principles

**1. Audience Segmentation**

Documentation is explicitly structured by reader experience level:
- Beginners: "The Book" provides gentle introduction
- Intermediate: Topical guides deepen specific knowledge
- Advanced: Nomicon covers unsafe Rust and edge cases
- Experts: Reference and compiler internals

**2. Multiple Learning Paths**

Provides different approaches to learning:
- Sequential reading (The Book)
- Example-driven (Rust by Example)
- Reference lookup (The Reference)
- Problem-specific (topical guides)

**3. Format Diversity**

Multiple documentation formats serve different use cases:
- Long-form books for comprehensive learning
- Short guides for specific topics
- Man pages for command-line reference
- API docs generated from code

**4. Modular Architecture**

Each book/guide is a separate submodule, allowing:
- Independent versioning
- Separate contribution workflows
- Specialized toolchains (mdBook)
- Focused maintenance

### What They Do Well

**Comprehensive Coverage**:
- Every aspect of language has documentation
- Beginner to expert progression is clear
- Edge cases and advanced topics not neglected

**Example-Driven Learning**:
- Rust by Example provides runnable code
- Examples progress from simple to complex
- Code can be tested and modified inline

**Safety-Focused Documentation**:
- Explicit coverage of unsafe code
- Clear explanations of ownership and borrowing
- Memory safety emphasized throughout

**Tool Documentation**:
- Compiler, package manager, doc generator all documented
- Man pages for command-line interfaces
- Integration with cargo doc for API documentation

**Community Contributions**:
- Clear separation makes contributions easier
- Books can be read and improved independently
- Issue tracking per documentation component

### Patterns to Adopt

1. **Separate books for different skill levels**: Don't try to serve all audiences in one document
2. **Example-driven documentation**: Runnable examples are more valuable than prose alone
3. **Modular structure**: Independent documentation components enable parallel development
4. **Format matching purpose**: Long-form books vs short guides vs reference pages
5. **Tool documentation parity**: Document dev tools as thoroughly as the language/framework

### Structure Template

```
docs/
├── getting-started/          # Quick start guide
├── guides/                   # Topic-specific guides
│   ├── authentication.md
│   ├── deployment.md
│   └── testing.md
├── reference/                # API and technical reference
│   ├── api/
│   ├── cli/
│   └── configuration/
├── advanced/                 # Advanced topics and edge cases
├── examples/                 # Working example projects
└── contributing/             # Contributor documentation
```

---

## 2. Next.js (Vercel)

**Repository**: https://github.com/vercel/next.js

**Documentation Location**: `/docs/` in main repository

### Structure Analysis

Next.js uses a numbered, hierarchical documentation structure that reflects both product architecture and user journey.

#### Documentation Organization

**Top-Level Categories** (numbered for ordering):
- `01-app/` - App Router documentation
- `02-pages/` - Pages Router documentation
- `03-architecture/` - Framework architecture
- `04-community/` - Community resources

**API Reference**:
- Component API reference
- Function API reference
- Configuration API reference

**Format**:
- Uses MDX (Markdown + JSX components)
- Enables interactive documentation
- Supports custom components

### Organizational Principles

**1. Version-Aware Structure**

Next.js maintains documentation for multiple routing systems (App Router vs Pages Router):
- Reflects real-world migration scenarios
- Users can find docs for their version
- Reduces confusion about applicability

**2. Number Prefixing for Order**

Uses numeric prefixes to control navigation order:
- Ensures logical progression
- Independent of alphabetical sorting
- Explicit ordering decisions

**3. Hierarchical Nesting**

Deep nesting for complex topics:
- Mirrors product structure
- Enables focused navigation
- Maintains context through breadcrumbs

**4. MDX for Rich Documentation**

Using MDX enables:
- Interactive code examples
- Custom documentation components
- Consistent styling and layout
- React component demos within docs

### What They Do Well

**Clear Version Separation**:
- App Router and Pages Router clearly distinguished
- Users know which docs apply to their setup
- Migration paths documented

**Architecture Documentation**:
- Dedicated section for understanding framework internals
- Helps advanced users make informed decisions
- Bridges gap between tutorial and reference

**Community Integration**:
- Community resources given top-level status
- Contributing, examples, and showcase included
- Reflects importance of community

**API Reference Organization**:
- Separated by component, function, configuration
- Mirrors how developers think about the API
- Easy to find specific reference material

**Interactive Examples**:
- MDX enables live code demonstrations
- Users can modify and test code
- Reduces gap between reading and doing

### Patterns to Adopt

1. **Version-aware documentation**: When supporting multiple versions, organize docs by version/feature set
2. **Explicit ordering**: Use numbering or explicit ordering mechanisms
3. **Architecture section**: Include dedicated section explaining framework/system design
4. **Rich format**: Use documentation format that supports interactivity (MDX, Docusaurus, etc.)
5. **Community visibility**: Elevate community resources to top-level status

### Structure Template

```
docs/
├── 01-getting-started/       # Onboarding
├── 02-guides/                # How-to guides
├── 03-api-reference/         # Technical reference
│   ├── components/
│   ├── functions/
│   └── configuration/
├── 04-architecture/          # System design and internals
├── 05-advanced/              # Advanced topics
└── 06-community/             # Community resources
    ├── contributing.md
    ├── examples/
    └── showcase.md
```

---

## 3. Django

**Repository**: https://github.com/django/django

**Documentation Location**: `/docs/` in main repository

### Structure Analysis

Django uses reStructuredText (ReST) and Sphinx, providing comprehensive, multi-format documentation with clear content type separation.

#### Documentation Organization

**Content Directories**:
- `faq/` - Frequently Asked Questions
- `howto/` - How-to guides
- `internals/` - Internal framework details
- `intro/` - Introduction and tutorial
- `man/` - Manual pages for command-line tools
- `misc/` - Miscellaneous documentation
- `ref/` - Reference documentation
- `releases/` - Release notes and changelogs
- `topics/` - Topical documentation

**Build Infrastructure**:
- `_ext/` - Sphinx extensions
- `_theme/` - Custom documentation theme
- `conf.py` - Sphinx configuration
- `Makefile` / `make.bat` - Build scripts
- `requirements.txt` - Documentation dependencies

### Organizational Principles

**1. Content Type Separation**

Clear distinction between documentation types:
- FAQ: Quick answers to common questions
- How-to: Task-oriented guides
- Intro: Tutorial-style learning
- Reference: Complete technical specification
- Topics: In-depth conceptual explanations

Maps closely to Diataxis framework.

**2. Sphinx Toolchain**

Uses Sphinx documentation generator:
- Multiple output formats (HTML, PDF, ePub)
- Powerful cross-referencing
- API documentation from docstrings
- Versioned documentation builds

**3. Internals Documentation**

Dedicated documentation for framework internals:
- Contributing guidelines
- Core architecture explanations
- Release process documentation
- Design decisions and rationale

**4. Comprehensive Release Notes**

Extensive release documentation:
- Feature additions by version
- Deprecation notices
- Backwards compatibility information
- Upgrade paths

### What They Do Well

**Content Type Clarity**:
- Each directory has clear, single purpose
- No confusion about where to find information
- Users can navigate by need, not structure

**Tutorial Excellence**:
- "Writing your first Django app" is legendary
- Hands-on, builds working application
- Introduces concepts gradually
- Provides foundation for further learning

**Reference Completeness**:
- Every API, setting, and feature documented
- Consistent reference format
- Extensive cross-linking
- Code examples for all features

**Versioned Documentation**:
- Docs match Django version
- Old versions remain accessible
- Upgrade guides between versions
- Clear deprecation timeline

**Build Tooling**:
- Simple "make html" to build docs
- Requirements clearly specified
- Custom theme maintains branding
- Extensions enhance functionality

### Patterns to Adopt

1. **Diataxis-aligned structure**: Use clear directory names matching doc types
2. **Separate intro/tutorial**: Don't mix getting started with reference material
3. **Internals documentation**: Document architecture and contribution process
4. **Release notes discipline**: Maintain comprehensive, organized release documentation
5. **Build simplicity**: Make it easy for contributors to build and preview docs

### Structure Template

```
docs/
├── intro/                    # Getting started tutorial
├── howto/                    # Task-oriented guides
├── topics/                   # In-depth explanations
├── ref/                      # Complete reference
│   ├── api/
│   ├── cli/
│   └── configuration/
├── faq/                      # Frequently asked questions
├── releases/                 # Release notes and changelogs
├── internals/                # Contributing and architecture
│   ├── contributing.md
│   ├── architecture.md
│   └── release-process.md
├── _theme/                   # Documentation theme
└── conf.py                   # Build configuration
```

---

## 4. Ruby on Rails

**Repository**: https://github.com/rails/rails

**Documentation Location**: `/guides/` in main repository

### Structure Analysis

Rails maintains separate guides directory with comprehensive tutorial-style documentation complementing API reference documentation.

#### Documentation Organization

**Guides Structure**:
- `source/` - Guide content (likely markdown/textile)
- `assets/` - Images, CSS, JavaScript for guides
- `bug_report_templates/` - Templates for issue reporting
- `rails_guides/` - Guide generation tooling

**Generation**:
- Uses `rake guides:generate` to build
- Custom tooling for Rails guides
- SCSS for styling with include_media for responsive design
- normalize.css for cross-browser consistency

**Separate API Docs**:
- RDoc-generated API documentation
- Built from inline code comments
- Hosted separately from guides

### Organizational Principles

**1. Guides vs API Documentation**

Clear separation between:
- **Guides**: Tutorial and conceptual learning (guides/)
- **API Reference**: Generated from code comments (rdoc)

**2. Custom Tooling**

Rails built custom documentation generator:
- Optimized for Rails guide format
- Consistent styling and navigation
- Integration with Rails release process

**3. Responsive Design**

Documentation designed for multiple devices:
- Mobile-friendly layout
- Responsive images and code blocks
- Accessible navigation

**4. Bug Report Integration**

Includes templates for reporting issues:
- Lowers barrier to quality bug reports
- Provides runnable reproduction templates
- Helps maintainers triage issues

### What They Do Well

**Comprehensive Guides**:
- Cover full framework feature set
- Tutorial-style with examples
- Progressive complexity
- Real-world scenarios

**API Reference Quality**:
- Generated from code docstrings
- Always in sync with implementation
- Includes examples in docstrings
- Links between related classes/methods

**Getting Started Excellence**:
- Rails getting started guide is classic
- Builds working blog application
- Introduces MVC architecture
- Provides foundation for framework understanding

**Design Patterns Documentation**:
- Documents Rails conventions and patterns
- Explains "Rails way" for common tasks
- Guides on service objects, presenters, etc.
- Community-contributed patterns

**Versioned Guides**:
- Guides match Rails version
- Historical versions accessible
- Edge guides for unreleased features
- Clear version indication

### Patterns to Adopt

1. **Separate guides from API reference**: Different purposes, different tools
2. **Custom documentation tooling**: When generic tools don't fit, build custom
3. **Responsive documentation**: Mobile-friendly is essential
4. **Bug report templates**: Lower barrier to quality issue reporting
5. **Version-specific guides**: Match documentation to code version

### Structure Template

```
docs/
├── guides/                   # Tutorial-style guides
│   ├── source/              # Guide content
│   ├── assets/              # Styling and images
│   └── templates/           # Bug report templates
├── api/                      # Generated API reference (link)
└── Rakefile                  # Documentation tasks
```

---

## 5. Kubernetes

**Repository**: https://github.com/kubernetes/website

**Documentation Location**: `/content/en/docs/` in website repository

### Structure Analysis

Kubernetes maintains documentation in dedicated website repository with comprehensive internationalization and clear content segmentation.

#### Documentation Organization

**Content Structure** (`/content/en/docs/`):
- `concepts/` - Conceptual documentation
- `contribute/` - Contributor documentation
- `home/` - Documentation home page
- `reference/` - API and CLI reference
- `setup/` - Installation and setup
- `tasks/` - Task-oriented how-to guides
- `tutorials/` - Tutorial-style learning

**Multilingual Support**:
- Multiple language directories (`/content/[lang]/`)
- English (`/en/`) as primary
- Translations for major languages
- Language-specific contribution guidelines

### Organizational Principles

**1. Dedicated Documentation Repository**

Documentation in separate repo from code:
- Different contribution workflow
- Separate release cadence
- Focused tooling and automation
- Easier for non-developers to contribute

**2. Diataxis Alignment**

Clear mapping to Diataxis categories:
- Tutorials: Step-by-step learning
- Tasks: How-to guides for specific goals
- Concepts: Explanation and understanding
- Reference: Technical specifications

**3. Comprehensive Internationalization**

Built for global audience from start:
- Multiple complete translations
- Language-specific contribution teams
- Translation tooling and processes
- Cultural adaptation, not just translation

**4. Glossary and Terminology**

Standardized terminology:
- Comprehensive glossary
- Consistent term usage across docs
- Aids both readers and translators
- Reduces confusion

### What They Do Well

**Content Organization**:
- Clear separation by documentation type
- Easy to find information by need
- Consistent structure across sections
- Logical progression of complexity

**Internationalization**:
- Major languages fully supported
- Community-driven translation
- Translation quality maintained
- Localization, not just translation

**Contributor Infrastructure**:
- Clear contributing guidelines
- Documentation tooling well-documented
- Issue templates for doc improvements
- Low barrier to contribution

**Conceptual Documentation**:
- Deep explanations of Kubernetes concepts
- Architecture documentation
- Design rationale and trade-offs
- Understanding-oriented, not just instructions

**Reference Completeness**:
- Every API resource documented
- CLI reference complete
- Configuration options comprehensive
- Generated from code when possible

**Setup Documentation**:
- Multiple installation methods
- Different platforms covered
- Production and development setups
- Clear prerequisites and requirements

### Patterns to Adopt

1. **Dedicated documentation repository**: Separate docs from code when scale warrants
2. **Internationalization from start**: Design for translation early
3. **Diataxis structure**: Use concepts, tasks, tutorials, reference organization
4. **Comprehensive glossary**: Define terms consistently
5. **Setup documentation**: Cover installation thoroughly for all scenarios

### Structure Template

```
docs/
├── concepts/                 # Conceptual explanations
├── tasks/                    # How-to guides
├── tutorials/                # Step-by-step learning
├── reference/                # Technical reference
│   ├── api/
│   ├── cli/
│   ├── configuration/
│   └── glossary.md
├── setup/                    # Installation and configuration
├── contribute/               # Contributor guide
└── [lang]/                   # Translations (if needed)
```

---

## Cross-Project Pattern Analysis

### Common Successful Patterns

#### 1. Content Type Separation

All projects separate documentation into clear categories:
- **Tutorials/Getting Started**: Learning-oriented, hand-holding
- **How-to/Tasks**: Problem-oriented, goal-focused
- **Reference**: Information-oriented, comprehensive
- **Concepts/Topics**: Understanding-oriented, explanatory

This maps directly to Diataxis framework.

#### 2. Multiple Entry Points

Successful projects provide different paths in:
- Quick start for impatient users
- Tutorial for learners
- Reference for experienced users
- Examples for learn-by-doing users

#### 3. Example Richness

All projects include extensive examples:
- Runnable code samples
- Complete example projects
- Real-world scenarios
- Progression from simple to complex

#### 4. Version Awareness

Mature projects handle versioning explicitly:
- Documentation matches code version
- Old versions remain accessible
- Clear upgrade paths
- Deprecation timelines

#### 5. Contributor Documentation

All projects document contribution process:
- How to contribute to docs
- How to contribute to code
- Architecture and design decisions
- Release processes

#### 6. Build Automation

Documentation build is automated:
- Simple command to build locally
- CI/CD for documentation
- Preview for pull requests
- Automated deployment

### Project Comparison Matrix

| Project | Doc Type | Structure | Strengths | Tool |
|---------|----------|-----------|-----------|------|
| **Rust** | Modular books | `/src/doc/[books]` | Multiple learning paths, runnable examples | mdBook |
| **Next.js** | Hierarchical | Numbered categories | Version separation, MDX interactivity | MDX |
| **Django** | Sphinx-based | Type-based directories | Reference completeness, multi-format output | Sphinx |
| **Rails** | Guides + API | Separate guides/rdoc | Custom tooling, version-specific guides | Custom + RDoc |
| **Kubernetes** | Dedicated repo | Diataxis-aligned | Internationalization, contributor focus | Hugo |

### Anti-Patterns Observed

#### 1. Single Documentation File

None of the successful projects use single README or doc file. All use directory structure.

#### 2. Code-Only Documentation

Projects that only generate docs from code comments struggle with learning materials and conceptual explanations.

#### 3. Feature-Organized Docs

Projects that organize by features rather than user needs create navigation difficulties.

#### 4. Versioning Neglect

Projects that don't version documentation alongside code create confusion about applicability.

#### 5. Contribution Barriers

Projects without clear contribution guidelines and simple build process discourage doc contributions.

---

## Recommendations for Project Documentation Template

### Essential Components

Based on analysis of successful projects, a documentation template should include:

1. **Clear Structure**
   ```
   docs/
   ├── getting-started/      # Tutorial-style introduction
   ├── guides/               # How-to guides
   ├── reference/            # API and technical reference
   ├── concepts/             # Explanatory documentation
   ├── examples/             # Working example projects
   └── contributing/         # Contributor documentation
   ```

2. **Build Tooling**
   - Simple local build process
   - Clear dependencies
   - Preview capability
   - CI/CD integration

3. **Multiple Learning Paths**
   - Quick start (5 minutes)
   - Tutorial (30 minutes)
   - Reference (lookup)
   - Examples (learn by doing)

4. **Version Awareness**
   - Version indication in docs
   - Changelog/release notes
   - Upgrade guides
   - Deprecation notices

5. **Contributor Support**
   - Contribution guidelines
   - Documentation standards
   - Build/preview instructions
   - Issue templates

### Implementation Priorities

**Phase 1: Foundation**
- Basic directory structure
- Getting started guide
- README with build instructions
- Contribution guidelines

**Phase 2: Content Types**
- How-to guides section
- Reference documentation section
- Concepts/explanation section
- Examples directory

**Phase 3: Automation**
- Build automation
- CI/CD integration
- Preview deployments
- Link checking

**Phase 4: Enhancement**
- Search functionality
- Versioning system
- Analytics integration
- Internationalization support

---

## Citations and Further Reading

- **Rust Documentation**: https://github.com/rust-lang/rust/tree/master/src/doc
- **Next.js Documentation**: https://github.com/vercel/next.js/tree/canary/docs
- **Django Documentation**: https://github.com/django/django/tree/main/docs
- **Rails Guides**: https://github.com/rails/rails/tree/main/guides
- **Kubernetes Documentation**: https://github.com/kubernetes/website/tree/main/content/en/docs
- **mdBook**: https://rust-lang.github.io/mdBook/
- **Sphinx**: https://www.sphinx-doc.org/
- **Docusaurus**: https://docusaurus.io/

---

*Research conducted: 2025-10-11*
