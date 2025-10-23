---
name: bootstrap-templates
status: draft
version: 1.0.0
dependencies: []
priority: high
---

# Bootstrap Templates

## Overview

Enable users to bootstrap docent with pre-configured templates from Git repositories, allowing organizations and communities to share standardized documentation structures and content. Templates can include custom directory structures, starter documentation, organization-specific runbooks, and configuration settings.

## User Stories

- As an **engineering team lead**, I want to bootstrap all our projects with company-standard runbooks and ADR format so that documentation is consistent across teams
- As an **open source maintainer**, I want to provide documentation templates for projects using our framework so that users follow best practices
- As a **platform team**, I want to enforce documentation standards across microservices so that operational procedures are uniform
- As a **new developer**, I want to start with proven documentation patterns so that I don't have to design the structure myself

## Functional Requirements

### MUST Have

- Accept template URL via `--template` flag in bootstrap command
- Clone template repository and copy docs/ content to target project
- Support GitHub and GitLab public repository URLs
- Merge template content with generated project-specific documentation
- Clean up temporary files after bootstrap completes
- Validate template structure before applying
- Provide clear error messages for invalid templates or network failures

### SHOULD Have

- Support branch/tag specification in template URLs (e.g., `#v1.0.0`)
- Allow configuration via `.docentrc.yaml` in template repository
- Support git SSH URLs in addition to HTTPS
- Cache templates locally to speed up repeated usage
- Support private repositories with authentication
- Provide progress indicators during template download

### COULD Have

- Support local file paths as templates
- Maintain a registry of community templates
- Allow selective template application (only certain directories)
- Support template composition (multiple templates)
- Provide template versioning and update notifications

## Scenarios

### Scenario: Bootstrap with public GitHub template

Given a user wants to bootstrap with a company template
When they run the bootstrap command with a template URL
Then the template is applied and merged with generated content

**Example:**

```bash
# Command
docent bootstrap --template https://github.com/acme-corp/docs-template

# Process
1. Clone template to temp directory
2. Validate template structure (docs/ exists)
3. Analyze target project
4. Copy template docs/ to project
5. Generate project-specific content (README.md, getting-started.md)
6. Merge generated content with template (template wins conflicts)
7. Setup agent configuration
8. Clean up temp directory

# Result
✓ Initialized docent with template: acme-corp/docs-template

Created structure:
  docs/
    ├── README.md              (from template, customized)
    ├── guides/
    │   ├── getting-started.md (generated for this project)
    │   ├── contributing.md    (from template)
    │   └── security.md        (from template)
    ├── runbooks/
    │   ├── deployment.md      (from template)
    │   └── incident.md        (from template)
    ├── adr/
    │   └── template.md        (from template)
    └── standards/             (custom dir from template)
        └── api-design.md      (from template)

Template: acme-corp/docs-template (main branch)
Project analysis:
  Languages: TypeScript, JavaScript
  Frameworks: Express, React
  Build Tools: npm
```

### Scenario: Bootstrap with template configuration

Given a template includes a `.docentrc.yaml` configuration file
When the user bootstraps with this template
Then the configuration is applied during bootstrap

**Example:**

```yaml
# Template .docentrc.yaml
version: 1
structure:
  # Define custom directories
  directories:
    - guides
    - runbooks
    - adr
    - rfcs
    - standards # Custom directory
    - playbooks # Custom directory

  # Exclude certain standard directories
  exclude:
    - specs # Don't create specs directory

# Control file generation
files:
  "README.md":
    source: template # Use template version
    merge: true # Merge with generated content
  "guides/getting-started.md":
    source: generated # Always generate fresh
  "guides/contributing.md":
    source: template # Always use template version
  "runbooks/*.md":
    source: template # All runbooks from template

# Add custom metadata to generated files
metadata:
  organization: "ACME Corp"
  template_version: "2.1.0"

# Custom project analysis additions
project_overrides:
  frameworks:
    - "ACME Internal Framework v3"
  conventions:
    - "Follow ACME-STYLE-001 guidelines"
```

**Result:**

```
✓ Applied template configuration from .docentrc.yaml
  - Custom directories: standards, playbooks
  - Excluded: specs
  - File strategy: README.md (merged), guides/contributing.md (template)
  - Added framework: ACME Internal Framework v3
```

### Scenario: Template with branch specification

Given a user wants to use a specific version of a template
When they specify a branch or tag in the URL
Then that specific version is used

**Example:**

```bash
# Using a specific branch
docent bootstrap --template https://github.com/acme-corp/docs-template#v2.0

# Using a tag
docent bootstrap --template https://github.com/acme-corp/docs-template#release-2024-01

# Using a commit hash
docent bootstrap --template https://github.com/acme-corp/docs-template#abc123def

# Result includes version info
✓ Initialized docent with template: acme-corp/docs-template (v2.0)
```

### Scenario: Invalid template structure

Given a template repository lacks required docs/ directory
When user attempts to bootstrap with it
Then a clear error message is shown

**Example:**

```bash
# Command
docent bootstrap --template https://github.com/user/invalid-template

# Error
✗ Template validation failed: https://github.com/user/invalid-template

  Missing required directory: docs/

  Valid templates must have:
  - docs/ directory at repository root
  - At least one subdirectory or file in docs/

  Optional:
  - .docentrc.yaml for configuration

Please check the template repository structure.
```

### Scenario: Network failure during clone

Given network issues prevent template download
When user attempts to bootstrap
Then helpful error with retry suggestions is shown

**Example:**

```bash
# Error
✗ Failed to clone template: https://github.com/acme-corp/docs-template

  Error: Failed to connect to github.com port 443: Connection timed out

  Possible solutions:
  1. Check your internet connection
  2. Verify the repository URL is correct
  3. For private repos, ensure you're authenticated:
     - HTTPS: Use personal access token
     - SSH: Add SSH key to agent
  4. Try using git protocol instead:
     git@github.com:acme-corp/docs-template.git

  Retry command:
  docent bootstrap --template https://github.com/acme-corp/docs-template
```

### Scenario: Merge conflicts with existing docs

Given docs/ directory already exists with content
When user bootstraps with --force flag and template
Then template is merged with clear conflict resolution

**Example:**

```bash
# Command
docent bootstrap --template https://github.com/acme-corp/docs-template --force

# Process
1. Backup existing docs/ to docs.backup.<timestamp>/
2. Apply template (template files override existing)
3. Preserve files unique to existing docs/
4. Report merge actions

# Result
✓ Merged template with existing documentation

Actions taken:
  Backed up: docs/ → docs.backup.20241023-143022/
  Replaced: README.md (template version)
  Added: guides/contributing.md (from template)
  Preserved: guides/custom-guide.md (existing file)
  Added: runbooks/deployment.md (from template)

Review backup at: docs.backup.20241023-143022/
```

### Scenario: Private repository with authentication

Given user wants to use a private template repository
When they provide appropriate authentication
Then the template is successfully cloned and applied

**Example:**

```bash
# Using HTTPS with token in URL (not recommended for security)
docent bootstrap --template https://token@github.com/acme-corp/private-template

# Using SSH (recommended)
docent bootstrap --template git@github.com:acme-corp/private-template.git

# Using environment variable
GITHUB_TOKEN=ghp_xxx docent bootstrap --template https://github.com/acme-corp/private-template

# Result
✓ Authenticated and cloned private template
✓ Initialized docent with template: acme-corp/private-template
```

### Scenario: Local template directory

Given user has a local template directory
When they specify a file path
Then the local template is applied

**Example:**

```bash
# Using local path
docent bootstrap --template ../team-templates/docent-standard

# Or absolute path
docent bootstrap --template /usr/local/share/docent-templates/enterprise

# Result
✓ Applied local template: /usr/local/share/docent-templates/enterprise
```

## Technical Constraints

### Performance

- Template clone should complete within 30 seconds for typical repositories
- Large templates (>100MB) should show progress indicators
- Cache templates for 24 hours to avoid repeated downloads

### Security

- Never store authentication tokens in tool configuration
- Validate template contents before execution (no executable files)
- Sanitize file paths to prevent directory traversal
- Use temporary directories with restricted permissions

### Architecture

- Use Node.js built-in `child_process` for git operations
- Alternative: Use `simple-git` or `isomorphic-git` library
- Store temp files in OS temp directory (`os.tmpdir()`)
- Clean up temp files even on error (use try/finally)

### Data

- Template repository must contain `docs/` directory
- Optional `.docentrc.yaml` follows defined schema
- Support UTF-8 encoded text files only
- Preserve file permissions from template (documentation files: 644)

## Acceptance Criteria

- [ ] Bootstrap accepts `--template` parameter with Git URL
- [ ] GitHub HTTPS URLs are properly parsed and cloned
- [ ] GitLab HTTPS URLs are properly parsed and cloned
- [ ] Branch/tag specification with `#` notation works
- [ ] Git SSH URLs are supported
- [ ] Template docs/ directory is validated before application
- [ ] Template content is copied to target project docs/
- [ ] Project analysis still runs and generates appropriate files
- [ ] .docentrc.yaml is parsed and configuration applied
- [ ] Generated content merges correctly with template content
- [ ] --force flag allows overwriting existing docs/ with backup
- [ ] Temporary clone directory is always cleaned up
- [ ] Clear error messages for all failure scenarios
- [ ] Network errors are handled gracefully with retry guidance
- [ ] Invalid template structure errors are descriptive
- [ ] Private repository authentication works (SSH and token)
- [ ] Local file paths work as templates
- [ ] Progress is shown for long operations
- [ ] Documentation explains how to create templates
- [ ] Template examples are provided in documentation

## Out of Scope

- Template registry or discovery service (future enhancement)
- Template composition (applying multiple templates)
- Interactive template selection UI
- Template update notifications
- Automatic template version management
- Template validation beyond basic structure
- Custom merge strategies beyond simple override
- Non-Git template sources (ZIP, tar, etc.)

## Implementation Notes

### Git Operations

Consider two approaches:

1. **Using child_process with git CLI:**

```typescript
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

// Clone with progress
await execAsync(`git clone --progress "${url}" "${tempDir}"`, {
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
});
```

1. **Using simple-git library:**

```typescript
import simpleGit from "simple-git";
const git = simpleGit();

// Clone with progress callback
await git.clone(url, tempDir, {
  "--progress": null,
  "--depth": 1, // Shallow clone for speed
});
```

### Template Cache Strategy

```typescript
// Cache location: ~/.docent/template-cache/
const cacheKey = crypto.createHash("sha256").update(templateUrl).digest("hex");

const cachePath = path.join(
  os.homedir(),
  ".docent",
  "template-cache",
  cacheKey,
);

// Check cache age (24 hours)
if (await isCacheValid(cachePath, 24 * 60 * 60 * 1000)) {
  return cachePath;
}
```

### Configuration Schema

```typescript
interface DocentConfig {
  version: number;
  structure?: {
    directories?: string[];
    exclude?: string[];
  };
  files?: {
    [pattern: string]: {
      source: "template" | "generated";
      merge?: boolean;
    };
  };
  metadata?: Record<string, any>;
  project_overrides?: {
    frameworks?: string[];
    conventions?: string[];
  };
}
```

### Error Recovery

```typescript
async function bootstrapWithTemplate(url: string) {
  const tempDir = await createTempDir();

  try {
    await cloneTemplate(url, tempDir);
    await validateTemplate(tempDir);
    await applyTemplate(tempDir, projectPath);
  } catch (error) {
    // Provide specific error guidance
    if (isNetworkError(error)) {
      throw new NetworkError(url, error);
    }
    if (isAuthError(error)) {
      throw new AuthError(url);
    }
    if (isValidationError(error)) {
      throw new TemplateValidationError(error);
    }
    throw error;
  } finally {
    // Always clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
```

## Testing Strategy

### Unit Tests

- URL parsing (GitHub, GitLab, SSH, branch notation)
- Configuration file parsing and validation
- Template structure validation
- File merging logic
- Error message formatting

### Integration Tests

- Mock git operations for various scenarios
- Test with sample template structures
- Verify file copying and merging
- Test configuration application
- Verify cleanup on success and failure

### End-to-End Tests

- Create test template repository
- Run bootstrap with real git operations
- Verify complete flow from clone to cleanup
- Test with various git providers (GitHub, GitLab)
- Test authentication scenarios

## Documentation Requirements

### User Documentation

- How to use templates guide
- Creating templates guide
- Template configuration reference
- Common template patterns
- Troubleshooting guide

### Template Examples

- Minimal template (just docs/ structure)
- Enterprise template (with config and standards)
- Framework template (React, Vue, etc.)
- Microservices template (with runbooks)
