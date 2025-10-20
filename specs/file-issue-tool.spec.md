# Spec: File Issue Tool

## Metadata

- **Status:** implemented
- **Created:** 2025-10-20
- **Updated:** 2025-10-20
- **Related:**
  - RFC: docs/rfcs/rfc-0010-github-issue-filing-mcp-tool.md
  - Implementation: src/mcp/tools/file-issue.ts
  - GitHub CLI: src/lib/github-cli.ts
  - Context: src/lib/issue-context.ts

## Context

The file-issue tool enables users to report bugs, request features, ask questions, or suggest documentation improvements directly from their AI agent session without context switching to GitHub. The tool uses the GitHub CLI (`gh`) for authentication and issue creation, auto-gathers environment context, and provides graceful fallback when `gh` is not available.

## Behaviors

### Scenario: File a bug report with full context

**Given:** User is in a project directory with docent installed
**When:** User calls file-issue tool with bug type, title, and details
**Then:** Tool creates GitHub issue with auto-gathered context (version, OS, project type)

#### Example:

```typescript
// MCP tool call
{
  name: 'file-issue',
  arguments: {
    title: 'Doctor output is too verbose',
    type: 'bug',
    description: 'The doctor command outputs hundreds of lines making it hard to scan',
    reproductionSteps: 'Run `docent: doctor` in any project',
    expectedBehavior: 'Concise summary showing only failures',
    actualBehavior: '174 lines of output including all passing checks'
  }
}
```

```markdown
# Created issue body:
## Bug Report

### Description

The doctor command outputs hundreds of lines making it hard to scan

### Steps to Reproduce

Run `docent: doctor` in any project

### Expected Behavior

Concise summary showing only failures

### Actual Behavior

174 lines of output including all passing checks

### Environment

- **docent version:** 0.7.0
- **Node version:** v20.11.0
- **OS:** darwin 24.5.0
- **Architecture:** arm64

### Docent Configuration

- **root:** docs
- **sessionThresholdMinutes:** 30

### Project Context

- **Type:** npm
- **Languages:** TypeScript, JavaScript

---

_Issue filed via docent file-issue tool_
```

**Response:**

```
✓ Issue filed successfully!

https://github.com/tnez/docent/issues/42

---

**Context included:**
- docent v0.7.0
- Node v20.11.0
- darwin 24.5.0 (arm64)
- docent config: root="docs"
- Project: npm (TypeScript, JavaScript)
```

### Scenario: File a feature request

**Given:** User wants to request a new feature
**When:** User calls file-issue with feature type and details
**Then:** Tool creates issue with enhancement label and use case

#### Example:

```typescript
{
  name: 'file-issue',
  arguments: {
    title: 'Add support for custom issue templates',
    type: 'feature',
    description: 'Allow projects to define their own issue templates',
    useCase: 'Different projects need different information in bug reports'
  }
}
```

**Result:** Issue created with `enhancement` label

### Scenario: gh CLI not installed

**Given:** User does not have GitHub CLI installed
**When:** User tries to file an issue
**Then:** Tool returns helpful error with installation instructions

#### Example:

```
Failed to file issue: GitHub CLI (gh) is not installed or not in PATH.

To file issues from docent, please install gh:
  macOS:   brew install gh
  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md
  Windows: https://github.com/cli/cli/releases

After installation, authenticate with: gh auth login

Alternatively, you can file this issue manually at:
https://github.com/tnez/docent/issues/new
```

### Scenario: gh CLI not authenticated

**Given:** User has `gh` installed but not authenticated
**When:** User tries to file an issue
**Then:** Tool returns authentication error with instructions

#### Example:

```
Failed to file issue: Not authenticated with GitHub.

Please run: gh auth login

This will authenticate gh CLI with your GitHub account.
```

### Scenario: File a question

**Given:** User has a question about docent usage
**When:** User calls file-issue with question type
**Then:** Tool creates issue with question label and minimal template

#### Example:

```typescript
{
  name: 'file-issue',
  arguments: {
    title: 'How do I customize the session threshold?',
    type: 'question',
    description: 'I want journal sessions to last 60 minutes instead of 30'
  }
}
```

**Result:** Issue created with `question` label

### Scenario: File documentation improvement

**Given:** User finds unclear documentation
**When:** User calls file-issue with documentation type
**Then:** Tool creates issue with documentation label

#### Example:

```typescript
{
  name: 'file-issue',
  arguments: {
    title: 'MCP setup guide missing Claude Desktop config',
    type: 'documentation',
    description: 'The MCP setup guide should show the full Claude Desktop config',
    suggestion: 'Add a complete JSON example with all required fields'
  }
}
```

**Result:** Issue created with `documentation` label

## Acceptance Criteria

- [x] Tool gathers docent version automatically
- [x] Tool gathers Node version, OS, and architecture
- [x] Tool includes docent config when in a project
- [x] Tool includes project type and languages when available
- [x] Tool checks for `gh` CLI availability before attempting to create issue
- [x] Tool provides clear installation instructions when `gh` not found
- [x] Tool provides authentication instructions when not logged in
- [x] Tool supports bug, feature, question, and documentation types
- [x] Tool applies appropriate labels based on issue type
- [x] Tool returns issue URL on success
- [x] Tool uses templates from `/templates/github-issues/`
- [x] Tool is tested with real `gh` CLI (end-to-end test)
- [ ] Tool handles network errors gracefully
- [ ] Tool validates required parameters before gathering context

## Technical Notes

### Implementation Details

- Uses `child_process.execFile()` to call `gh issue create`
- Template placeholders use `[PLACEHOLDER]` format for simple string replacement
- Context gathering is async and catches errors for optional data
- Tool definition specifies required fields: `title`, `type`, `description`

### Dependencies

- Requires `gh` CLI on user's system (not in package.json)
- Uses existing `child_process` module (Node.js built-in)
- No external npm dependencies added

### Template Location

Templates are bundled with the package in `/templates/github-issues/`:

- `bug-report.md`
- `feature-request.md`
- `question.md`
- `documentation.md`

## Test Hints

### Unit Tests

1. **Test context gathering:**
   - Mock `fs.readFileSync` for package.json
   - Mock `process.version`, `os.platform()`, `os.release()`, `os.arch()`
   - Mock `analyzeProject()` for project context

2. **Test GitHub CLI wrapper:**
   - Mock `execFile` to test success path
   - Mock `execFile` error for `gh` not found
   - Mock `execFile` error for auth failure
   - Verify command arguments passed to `gh`

3. **Test template rendering:**
   - Load template and verify placeholders are replaced
   - Test with missing optional fields
   - Verify context sections added when available

### Integration Tests

1. **Test full tool flow (mocked `gh`):**
   - Call tool handler with complete args
   - Verify context gathered
   - Verify template rendered
   - Verify `gh` called with correct args
   - Verify success response format

2. **Test error scenarios:**
   - `gh` not installed
   - `gh` not authenticated
   - Network error during issue creation
   - Missing required parameters

### End-to-End Test

**Manual test in MCP session:**

```
1. Ensure gh CLI is installed and authenticated
2. Call file-issue tool with bug report
3. Verify issue created on GitHub
4. Check issue body contains all expected context
5. Verify correct label applied
6. Confirm issue URL returned in response
```

**Negative test:**

```
1. Unset gh CLI from PATH temporarily
2. Call file-issue tool
3. Verify graceful error with installation instructions
4. Restore gh CLI to PATH
```
