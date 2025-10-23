# Bootstrap Templates

Learn how to use and create documentation templates for docent bootstrap.

## Overview

Bootstrap templates allow you to initialize projects with pre-configured documentation structures and content. This is useful for:

- **Organizations** - Enforce documentation standards across teams
- **Open source projects** - Provide documentation starters for your framework
- **Teams** - Share documentation patterns across microservices
- **Individuals** - Reuse proven documentation structures

## Using Templates

### Basic Usage

Bootstrap a project with a template from GitHub:

```bash
# Using docent MCP tool
docent bootstrap --template https://github.com/your-org/docs-template

# With a specific branch or tag
docent bootstrap --template https://github.com/your-org/docs-template#v2.0

# From GitLab
docent bootstrap --template https://gitlab.com/your-org/docs-template

# Using SSH URL (for private repos)
docent bootstrap --template git@github.com:your-org/docs-template.git

# From a local directory
docent bootstrap --template ../shared-templates/standard
```

### With Force Flag

To apply a template to an existing docs/ directory:

```bash
docent bootstrap --template <url> --force

# This will:
# 1. Create a backup at docs.backup.<timestamp>/
# 2. Apply the template
# 3. Preserve unique files from existing docs
```

## Creating Templates

### Minimal Template

The simplest template is just a Git repository with a `docs/` directory:

```
my-template/
└── docs/
    ├── guides/
    │   ├── contributing.md
    │   └── security.md
    ├── runbooks/
    │   ├── deployment.md
    │   └── incident-response.md
    └── README.md
```

Requirements:

- Must have `docs/` directory at repository root
- At least one file or subdirectory in `docs/`

### Template with Configuration

Add a `.docentrc.yaml` file for advanced control:

```yaml
# .docentrc.yaml
version: 1

# Custom directory structure
structure:
  directories:
    - guides
    - runbooks
    - adr
    - rfcs
    - standards      # Custom directory
    - playbooks      # Custom directory
  exclude:
    - specs          # Don't create this directory

# Control which files come from template vs generated
files:
  "README.md":
    source: template
    merge: true      # Merge with project analysis
  "guides/getting-started.md":
    source: generated  # Always generate fresh
  "guides/contributing.md":
    source: template   # Always use template version

# Add metadata
metadata:
  organization: "ACME Corp"
  template_version: "2.1.0"

# Customize project analysis
project_overrides:
  frameworks:
    - "ACME Internal Framework v3"
  conventions:
    - "Follow ACME-STYLE-001 guidelines"
```

### Configuration Options

#### Structure

Define custom directories and exclude standard ones:

```yaml
structure:
  directories:
    - guides
    - runbooks
    - custom-dir    # Add your own
  exclude:
    - specs         # Remove standard directory
```

#### Files

Control file generation strategy:

```yaml
files:
  "README.md":
    source: template     # Use template version
    merge: true          # Merge with project analysis
  "guides/*.md":
    source: template     # All guides from template
  "guides/getting-started.md":
    source: generated    # Except this one - generate it
```

Sources:

- `template` - Use file from template
- `generated` - Generate based on project analysis

Merge:

- `true` - Combine template with project-specific info
- `false` (default) - Template overrides completely

#### Metadata

Add template metadata (informational only):

```yaml
metadata:
  organization: "Your Company"
  template_version: "1.0.0"
  maintained_by: "Platform Team"
  last_updated: "2024-01-15"
```

#### Project Overrides

Add to or override project analysis:

```yaml
project_overrides:
  frameworks:
    - "Internal Framework v3"
  conventions:
    - "Follow STYLE-001"
    - "See API-DESIGN-001"
```

## Template Examples

### Enterprise Template

For large organizations with strict standards:

```
enterprise-template/
├── .docentrc.yaml
└── docs/
    ├── README.md
    ├── guides/
    │   ├── contributing.md
    │   ├── security.md
    │   └── code-review.md
    ├── runbooks/
    │   ├── deployment.md
    │   ├── incident.md
    │   └── rollback.md
    ├── standards/
    │   ├── api-design.md
    │   ├── error-handling.md
    │   └── logging.md
    └── adr/
        └── template.md
```

### Microservices Template

Optimized for microservice architectures:

```
microservices-template/
└── docs/
    ├── README.md
    ├── guides/
    │   ├── local-development.md
    │   └── api-clients.md
    ├── runbooks/
    │   ├── deployment.md
    │   ├── monitoring.md
    │   ├── troubleshooting.md
    │   └── scaling.md
    ├── architecture/
    │   ├── service-boundaries.md
    │   └── data-flow.md
    └── api/
        └── openapi.yaml
```

### Minimal Template

Bare minimum for small projects:

```
minimal-template/
└── docs/
    ├── README.md
    ├── guides/
    │   └── contributing.md
    └── runbooks/
        └── deployment.md
```

## Best Practices

### Template Design

1. **Keep it focused** - Templates should serve a specific use case
2. **Document the why** - Explain why certain structures or files exist
3. **Version your templates** - Use git tags for stable versions
4. **Test your template** - Bootstrap a test project to verify it works
5. **Provide examples** - Show filled-in examples, not just empty shells

### File Content

1. **Use placeholders** - `<project-name>`, `<organization>`, etc.
2. **Include TODO comments** - Mark sections that need customization
3. **Provide context** - Explain when to use each document
4. **Link related docs** - Cross-reference related documentation

### Maintenance

1. **Keep README updated** - Document template purpose and usage
2. **Maintain a CHANGELOG** - Track template changes
3. **Use semantic versioning** - Major.Minor.Patch for template versions
4. **Test with real projects** - Ensure template stays relevant

## Troubleshooting

### Template Not Found

```
✗ Repository not found: https://github.com/org/template

Solutions:
1. Verify the URL is correct
2. Check you have access (for private repos)
3. Use SSH URL for private repos
```

### Invalid Template Structure

```
✗ Template validation failed
  Missing required directory: docs/

Solutions:
1. Ensure docs/ exists at repository root
2. Add at least one file to docs/
```

### Authentication Failures

```
✗ Authentication failed

Solutions:
# For HTTPS URLs
1. Use personal access token
2. Configure git credentials

# For SSH URLs
1. Add SSH key: ssh-add ~/.ssh/id_rsa
2. Verify: ssh -T git@github.com
```

### Clone Timeout

```
✗ Connection timeout

Solutions:
1. Check internet connection
2. Try again in a few moments
3. Verify firewall settings
4. Use SSH instead of HTTPS
```

## Publishing Templates

### Public Templates

1. Create a public Git repository
2. Add docs/ directory with your structure
3. (Optional) Add .docentrc.yaml for configuration
4. Tag stable versions: `git tag v1.0.0`
5. Share the URL

### Private Templates

1. Create a private Git repository
2. Structure as public template
3. Share access with team members
4. Use SSH URLs for bootstrap

### Template Repository README

Include in your template repository:

```markdown
# [Your Template Name]

## Purpose
Brief description of what this template is for

## Structure
Overview of included directories and files

## Usage
docent bootstrap --template https://github.com/org/template#v1.0

## Customization
What users should update after bootstrapping

## Versioning
- v1.0.0 - Initial release
- v1.1.0 - Added XYZ
```

## Advanced Usage

### Multiple Templates

You can apply templates to different directories:

```bash
# Base template for all projects
docent bootstrap --template github.com/org/base-template

# Then add specialized content
# (This requires manual copying for now)
```

### Template Composition

While not directly supported, you can compose templates:

1. Start with base template
2. Manually copy additional content from other templates
3. Commit the combination as your own template

### Local Template Development

Develop templates locally before publishing:

```bash
# Create template locally
mkdir my-template
cd my-template
mkdir -p docs/guides docs/runbooks
# ... add content ...

# Test it
cd ~/projects/test-project
docent bootstrap --template ~/path/to/my-template

# When ready, push to Git
cd ~/path/to/my-template
git init
git remote add origin <url>
git push -u origin main
```

## See Also

- [Getting Started](./getting-started.md) - Basic docent setup
- [Contributing](./contributing.md) - How to contribute to docent
- [MCP Setup](./mcp-setup.md) - MCP server configuration
