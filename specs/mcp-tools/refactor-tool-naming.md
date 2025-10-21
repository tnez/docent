---
name: refactor-tool-naming
status: draft
version: 1.0.0
dependencies: []
priority: high
---

# Refactor MCP Tool Naming and Consolidation

## Overview

Refactor docent MCP tools to improve naming clarity and consolidate related functionality. Users are confused by current naming conventions where "init-project" and "init-session" both use "init" but serve different purposes, and "doctor" vs "audit" have unclear distinctions. This refactoring improves discoverability and reduces cognitive load.

## User Stories

- As a developer, I want tool names that clearly indicate their purpose so that I can choose the right tool without confusion
- As a developer, I want a single comprehensive health check command so that I don't need to decide between doctor and audit
- As a developer, I want bootstrap/setup terminology for project initialization so that it's distinct from session initialization

## Functional Requirements

### MUST Have

- Rename `init-project` tool to `bootstrap`
- Rename `docent://meta/init-session` resource to `docent://meta/context`
- Merge `audit` tool functionality into `doctor` tool
- Preserve all existing functionality during renaming
- Update all documentation references to use new names
- Maintain backward compatibility aliases for at least one minor version

### SHOULD Have

- Make doctor run semantic analysis by default (comprehensive check)
- Add `--quick` flag to doctor for mechanical checks only
- Provide clear migration messages when old names are used
- Update error messages to reference new names

### COULD Have

- Add deprecation warnings for old names
- Create migration guide for users
- Add telemetry to track usage of old vs new names

## Scenarios

### Scenario: Bootstrap a new project

Given a new project without docent
When user runs `bootstrap` tool
Then docent creates docs/ structure and initial documentation

**Example:**

```typescript
// MCP tool call
{
  name: 'bootstrap',
  arguments: {
    path: '/path/to/project',
    force: false
  }
}

// Response
{
  content: [{
    type: 'text',
    text: `✓ Initialized docent in /path/to/project

Created structure:
  docs/
    ├── README.md              Documentation index
    ├── guides/                How-to documentation
    │   └── getting-started.md Initial guide
    ├── runbooks/              Operational procedures
    ├── adr/                   Architecture decisions
    ├── rfcs/                  Proposals and RFCs
    └── specs/                 Feature specifications

Next steps:
1. Review docs/README.md
2. Run 'docent doctor' to check health`
  }]
}
```

### Scenario: Load session context

Given an active Claude Code session
When user reads `docent://meta/context` resource
Then system returns session initialization prompt with available resources

**Example:**

```typescript
// MCP resource read
{
  uri: 'docent://meta/context'
}

// Response
{
  uri: 'docent://meta/context',
  mimeType: 'text/markdown',
  text: `# Docent Session Context

## Available Resources
- Guides: getting-started, mcp-setup, testing
- Runbooks: release-package, code-review
- Templates: adr, rfc, runbook, spec
- Journal: capture-work, resume-work tools

## Project Info
...`
}
```

### Scenario: Full health check (default doctor behavior)

Given a project with documentation
When user runs `doctor` without flags
Then tool runs mechanical checks AND semantic analysis

**Example:**

```typescript
// MCP tool call
{
  name: 'doctor',
  arguments: {
    path: '/path/to/project'
  }
}

// Response includes both mechanical and semantic checks
{
  content: [{
    type: 'text',
    text: `# Project Health Check

**Status:** ✗ Issues Found
**Health Score:** 75/100 (Good)
**Found:** 2 errors, 5 warnings, 3 suggestions

## Mechanical Checks
### Broken Links (1 error)
❌ Link to non-existent file '../missing.md' (docs/guide.md:42)

### Debug Code (1 warning)
⚠️ Found console.log in production code (src/index.ts:15)

## Semantic Analysis
### Documentation Quality
⚠️ API endpoints lack documentation
⚠️ No security documentation despite auth code
ℹ️ Consider adding onboarding guide (5 contributors)

## Next Steps
1. Fix broken links
2. Remove debug code
3. Document API endpoints
4. Add security documentation

For quick mechanical checks only, use: doctor --quick`
  }]
}
```

### Scenario: Quick pre-commit check

Given a developer about to commit code
When user runs `doctor` with `--quick` flag
Then tool runs only mechanical checks (fast)

**Example:**

```typescript
// MCP tool call
{
  name: 'doctor',
  arguments: {
    path: '/path/to/project',
    quick: true
  }
}

// Response (mechanical checks only, fast)
{
  content: [{
    type: 'text',
    text: `# Project Health Check (Quick)

**Status:** ✓ Healthy
**Checks:** Mechanical only
**Time:** 0.3s

✓ No broken links
✓ No debug code
✓ No test markers (.only, .skip)
✓ No uncommitted changes
✓ No temporary files

Quick check passed! For comprehensive analysis including documentation quality, run without --quick flag.`
  }]
}
```

### Scenario: Backward compatibility with deprecation warning

Given existing automation using old tool names
When user calls `init-project` tool
Then system executes `bootstrap` with deprecation warning

**Example:**

```typescript
// MCP tool call (old name)
{
  name: 'init-project',
  arguments: { path: '.' }
}

// Response
{
  content: [{
    type: 'text',
    text: `⚠️ DEPRECATION: 'init-project' has been renamed to 'bootstrap'. Please update your scripts.

✓ Initialized docent in /current/directory
...`
  }]
}
```

### Scenario: Integration of audit into doctor

Given the current audit tool returns a prompt for LLM analysis
When doctor runs in default mode
Then it executes the semantic analysis internally and includes results

**Example:**

```typescript
// Internal flow within doctor tool
async function handleDoctorTool(args) {
  const issues = []

  // Mechanical checks
  if (!args.quick) {
    issues.push(...await checkBrokenLinks())
    issues.push(...await checkDebugCode())
    // etc.
  }

  // Semantic analysis (if not quick mode)
  if (!args.quick) {
    const auditPrompt = await buildAuditPrompt(context)
    // Execute the audit analysis (implementation TBD)
    const semanticIssues = await runSemanticAnalysis(auditPrompt)
    issues.push(...semanticIssues)
  }

  return formatReport(issues, args.verbose)
}
```

## Technical Constraints

- **Performance**: Quick mode must complete in < 1 second for typical projects
- **Security**: No breaking changes to existing integrations
- **Architecture**: Maintain clean separation between mechanical and semantic checks
- **Data**: Preserve all existing tool parameters and responses

## Acceptance Criteria

- [ ] `bootstrap` tool works identically to old `init-project`
- [ ] `docent://meta/context` resource works identically to old `init-session`
- [ ] `doctor` tool includes all functionality from both doctor and audit
- [ ] `doctor --quick` flag skips semantic analysis
- [ ] All documentation updated to reference new names
- [ ] Backward compatibility aliases work with deprecation warnings
- [ ] Tests updated to use new names
- [ ] No breaking changes for existing users
- [ ] Migration guide created
- [ ] CHANGELOG updated with breaking changes section

## Out of Scope

- Changing the underlying implementation of doctor checks
- Adding new health checks beyond consolidation
- Modifying the structure of tool responses
- Changing other tool names not mentioned here
- Removing backward compatibility in this version

## Implementation Notes

### File Changes Required

1. **Tool Definitions** (`/src/mcp/tools/`)
   - Rename `init-project.ts` → `bootstrap.ts`
   - Update tool name in definition
   - Merge `audit.ts` functionality into `doctor.ts`
   - Add `quick` parameter to doctor tool definition

2. **Resource Handler** (`/src/mcp/resources/handler.ts`)
   - Update resource URI from `init-session` to `context`
   - Update resource description

3. **Server Registration** (`/src/mcp/server.ts`)
   - Register new tool names
   - Add backward compatibility aliases

4. **Documentation Updates**
   - All guides mentioning tool names
   - README.md
   - Getting started guide
   - MCP API reference
   - Any runbooks using these tools

5. **Tests** (`/test/`)
   - Update all test files to use new names
   - Add tests for backward compatibility
   - Add tests for --quick flag

### Backward Compatibility Strategy

Create a compatibility layer in `/src/mcp/tools/compatibility.ts`:

```typescript
export function createCompatibilityAliases() {
  return {
    'init-project': {
      handler: bootstrapHandler,
      deprecationMessage: "'init-project' renamed to 'bootstrap'"
    },
    'audit': {
      handler: (args) => doctorHandler({...args, semanticOnly: true}),
      deprecationMessage: "'audit' merged into 'doctor'"
    }
  }
}
```

### Semantic Analysis Integration

The current `audit` tool returns a prompt string for LLM analysis. Options:

1. **Execute locally**: Use a lightweight LLM to run the analysis within doctor
2. **Return prompt**: Include the audit prompt in doctor output for user to run
3. **Hybrid**: Run basic semantic checks locally, provide prompt for deeper analysis

Recommendation: Start with option 2 (include prompt) for backward compatibility, evolve to option 1 in future version.

## Test Hints

### Unit Tests

1. **Test tool renaming:**
   - `bootstrap` tool creates docs structure
   - `bootstrap` handles force flag correctly
   - Old `init-project` name still works with warning

2. **Test resource renaming:**
   - `context` resource returns session initialization
   - Old `init-session` URI still works with warning

3. **Test doctor consolidation:**
   - Doctor without flags runs all checks
   - Doctor with `--quick` skips semantic analysis
   - Doctor verbose mode works with both modes
   - Audit functionality accessible through doctor

### Integration Tests

1. **Test full workflow:**
   - Bootstrap project → Run doctor → Get comprehensive report
   - Bootstrap project → Run doctor --quick → Get mechanical report only

2. **Test backward compatibility:**
   - Old tool names in MCP calls work correctly
   - Deprecation warnings appear in output

### End-to-End Test

**Manual test in MCP session:**

```
1. Call bootstrap tool on new project
2. Verify docs/ structure created
3. Read docent://meta/context resource
4. Verify session context loaded
5. Run doctor tool (default)
6. Verify both mechanical and semantic analysis
7. Run doctor --quick
8. Verify only mechanical checks
9. Try old tool names
10. Verify deprecation warnings appear
```

## Migration Guide

### For Users

**What's changing:**

- `init-project` → `bootstrap` (clearer purpose)
- `docent://meta/init-session` → `docent://meta/context` (avoid confusion)
- `audit` merged into `doctor` (single health check command)

**What to update:**

- Scripts using `init-project`: Change to `bootstrap`
- References to `init-session`: Change to `context`
- Workflows using both doctor and audit: Just use `doctor`

**New features:**

- `doctor --quick` for fast mechanical checks only
- `doctor` (default) now includes semantic analysis

**Backward compatibility:**

- Old names still work with deprecation warnings
- Will be removed in next major version

### For Contributors

- Update any automation using old tool names
- Run test suite with new names
- Update any documentation you maintain
