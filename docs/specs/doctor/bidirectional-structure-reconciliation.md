---
name: bidirectional-structure-reconciliation
status: implemented
version: 1.0.0
dependencies: []
priority: critical
implemented_in: /Users/tnez/Code/tnez/docent/src/mcp/tools/doctor.ts
---

# Bidirectional Structure Reconciliation for Doctor Tool

## Overview

Enhance the doctor tool's structure reconciliation check to be bidirectional, detecting both:

1. **Forward check**: Files documented but missing from filesystem (current behavior)
2. **Inverse check**: Files existing but not documented (new behavior)

This critical enhancement ensures complete alignment between project structure and documentation, catching undocumented artifacts that could indicate poor project hygiene or incomplete documentation.

## User Stories

- As a developer, I want to know when source files exist but aren't documented so that I can maintain comprehensive documentation
- As a team lead, I want to detect misplaced files that violate our documented structure so that I can maintain project organization
- As a maintainer, I want to identify research/experimental directories so that I can decide whether to document, relocate, or remove them
- As an architect, I want to ensure all important configuration and scripts are documented so that team members understand their purpose

## Functional Requirements

### MUST Have

- Detect files and directories that exist in the filesystem but are never referenced in documentation
- Support configurable ignore patterns for common build/dependency directories
- Respect .gitignore rules to avoid flagging ignored files
- Categorize findings by severity (error/warning/info) based on file importance
- Provide actionable suggestions for each finding (document, move, or remove)
- Integrate seamlessly with existing structure reconciliation check
- Maintain performance even on large projects

### SHOULD Have

- Detect when files exist in locations that contradict documented project structure
- Identify important configuration files lacking documentation
- Group related findings for clearer reporting
- Support custom ignore patterns via configuration
- Provide batch fix suggestions for common patterns

### COULD Have

- Auto-generate documentation stubs for undocumented files
- Suggest appropriate documentation locations based on file type
- Track documentation coverage percentage
- Generate reports showing documentation gaps over time

## Scenarios

### Scenario: Undocumented Research Directory

Given a project with an undocumented `_research/` directory containing exploration code
When the doctor tool runs structure reconciliation check
Then it detects the directory and all its contents as undocumented

**Example:**

```json
// Input - Project structure
{
  "filesExists": [
    "_research/bootstrap/bootstrap-design.md",
    "_research/bootstrap/install.sh",
    "_research/claude-integration/overview.md"
  ],
  "documentedPaths": []
}

// Output
{
  "type": "warning",
  "category": "Structure Mismatch",
  "message": "Undocumented directory found: '_research/' (23 files)",
  "location": "_research/",
  "fix": "Document this directory's purpose or add to .gitignore if temporary",
  "details": {
    "fileCount": 23,
    "totalSize": "145KB",
    "suggestedAction": "document",
    "documentationHint": "Consider adding to docs/development/research.md"
  }
}
```

### Scenario: Misplaced Test File at Root

Given a test file `test-e2e.js` exists at project root
When documentation states test files should be in `test/` directory
Then the tool detects this as a structure violation

**Example:**

```json
// Input
{
  "fileExists": "test-e2e.js",
  "documentedStructure": {
    "test/": "All test files should be placed here"
  }
}

// Output
{
  "type": "warning",
  "category": "Structure Mismatch",
  "message": "Test file found outside documented test directory: 'test-e2e.js'",
  "location": "test-e2e.js",
  "fix": "Move to test/ directory or update documentation to reflect actual structure",
  "details": {
    "expectedLocation": "test/",
    "violationType": "misplaced",
    "pattern": "test*.js"
  }
}
```

### Scenario: Important Undocumented Script

Given a deployment script `scripts/deploy.sh` exists without documentation
When the doctor tool analyzes the project
Then it flags this as high-priority for documentation

**Example:**

```json
// Input
{
  "fileExists": "scripts/deploy.sh",
  "isExecutable": true,
  "documentedScripts": []
}

// Output
{
  "type": "error",
  "category": "Structure Mismatch",
  "message": "Critical script not documented: 'scripts/deploy.sh'",
  "location": "scripts/deploy.sh",
  "fix": "Document this script's purpose, usage, and requirements",
  "details": {
    "fileType": "executable",
    "importance": "high",
    "suggestedDocLocation": "docs/deployment/README.md"
  }
}
```

### Scenario: Build Artifacts Properly Ignored

Given `node_modules/`, `dist/`, and `.git/` directories exist
When the doctor tool runs structure reconciliation
Then these are automatically ignored and not reported

**Example:**

```json
// Input
{
  "filesExist": [
    "node_modules/express/index.js",
    "dist/bundle.js",
    ".git/HEAD"
  ]
}

// Output
{
  "ignoredPaths": [
    "node_modules/**",
    "dist/**",
    ".git/**"
  ],
  "issues": []
}
```

### Scenario: Configuration File Without Documentation

Given `docker-compose.yml` exists but isn't mentioned in documentation
When the doctor tool analyzes the project
Then it suggests documenting the containerization setup

**Example:**

```json
// Output
{
  "type": "warning",
  "category": "Structure Mismatch",
  "message": "Configuration file not documented: 'docker-compose.yml'",
  "location": "docker-compose.yml",
  "fix": "Document Docker setup and usage in docs/deployment/ or docs/development/",
  "details": {
    "configType": "docker",
    "suggestedTopics": ["local development", "deployment", "dependencies"]
  }
}
```

### Scenario: Comprehensive Bidirectional Check

Given a project with both documented-but-missing and existing-but-undocumented files
When the doctor tool runs
Then it reports both categories clearly

**Example:**

```json
// Output
{
  "structureIssues": {
    "documented_but_missing": [
      {
        "path": "src/utils/helper.js",
        "referencedIn": ["docs/api/utilities.md"]
      }
    ],
    "existing_but_undocumented": [
      {
        "path": "_research/",
        "type": "directory",
        "fileCount": 23
      },
      {
        "path": "test-e2e.js",
        "type": "file",
        "violation": "misplaced"
      }
    ],
    "summary": "2 documented paths don't exist, 2 existing paths aren't documented"
  }
}
```

## Technical Constraints

- **Performance**: Must complete within 5 seconds for projects with < 10,000 files
- **Memory**: Should not load entire file contents, only paths and metadata
- **Security**: Must not traverse outside project root (path traversal protection)
- **Architecture**: Should reuse existing file scanning infrastructure from doctor tool
- **Data**: Results should be deterministic and reproducible

## Acceptance Criteria

- [ ] Detects all files/directories not mentioned in any documentation
- [ ] Correctly applies default ignore patterns (node_modules, dist, .git, etc.)
- [ ] Respects .gitignore rules when configured to do so
- [ ] Categorizes findings by severity based on file type and location
- [ ] Provides specific, actionable fix suggestions
- [ ] Groups related findings (e.g., all files in undocumented directory)
- [ ] Maintains backward compatibility with existing structure check
- [ ] Performance remains acceptable on large projects
- [ ] Clear distinction between "missing" and "undocumented" issues
- [ ] Handles symbolic links and special files gracefully

## Out of Scope

- Automatic documentation generation
- Fixing or moving files automatically
- Semantic analysis of documentation content
- Historical tracking of structure changes
- Cross-repository documentation references
- Integration with external documentation systems

## Implementation Notes

### Default Ignore Patterns

```javascript
const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  '.github/**',
  'dist/**',
  'lib/**',
  'build/**',
  'coverage/**',
  '.vscode/**',
  '.idea/**',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.env*',
  '*.tmp',
  '*.temp',
  '*.cache'
]
```

### Severity Classification

```javascript
const SEVERITY_RULES = {
  error: [
    /^scripts\/.*\.(sh|bash|ps1)$/,  // Executable scripts
    /^\.github\/workflows\//,         // CI/CD workflows
    /Dockerfile$/,                     // Container definitions
  ],
  warning: [
    /^_.*\//,                         // Directories starting with underscore
    /^test.*\.js$/,                  // Test files at root
    /^src\/.*\/$/,                   // Source directories
    /\.(yml|yaml|toml|json)$/,       // Configuration files
  ],
  info: [
    /\.(md|txt)$/,                    // Documentation files
    /^examples?\//,                  // Example directories
  ]
}
```

### File Traversal Algorithm

1. Build set of documented paths from all markdown files
2. Traverse filesystem using glob patterns
3. Filter using ignore patterns and .gitignore
4. For each unmatched file:
   - Determine severity based on rules
   - Check if violates documented structure
   - Generate appropriate fix suggestion
5. Group related findings by directory
6. Sort by severity and path

### Integration Points

- Extends existing `checkStructureReconciliation()` function
- Reuses markdown file scanning logic
- Shares ignore pattern infrastructure with temp file check
- Outputs consistent with other doctor checks
