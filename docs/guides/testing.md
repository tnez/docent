# Testing Guide

## Overview

This guide covers testing practices for the docent project, including current test infrastructure and guidelines for adding new tests as the project evolves.

## Current Test Infrastructure

### What We Test

**Installation Scripts (Legacy):**

- Shell script tests in `/test/test-install.sh`
- Tests installation, uninstallation, and edge cases
- Runs on Ubuntu and macOS in CI

**Build Process:**

- TypeScript compilation (`npm run build`)
- Linting (`npm run lint`)

### What's Not Yet Tested

- MCP server functionality (tools, resources, prompts)
- Library functions (detector, agent-audit, prompt-builder)
- Template validation
- Resource URI handling

This is expected for an early-stage project transitioning from CLI to MCP architecture.

## Running Tests

### Run All Tests

```bash
# Installation script tests (legacy)
./test/test-install.sh
```

### Build and Lint

```bash
# Build TypeScript
npm run build

# Run linter
npm run lint
```

### Manual MCP Server Testing

Since automated MCP tests don't exist yet, test manually:

```bash
# Start MCP server
npm run build
./bin/mcp-server.js
```

Then test via Claude Code or Claude Desktop with docent configured.

## Testing Philosophy

### What Should Be Tested

**Critical Business Logic** ✅

- Project analysis (detector) - detects languages, frameworks correctly
- Documentation scanning (agent-audit) - finds all doc files
- URI parsing - handles security cases (path traversal)

**MCP Integration** ✅

- Tool invocations return correct data
- Resources resolve to proper content
- Prompts generate expected output

**Not Testing** ❌

- Template content (validated by usage)
- Prompt wording (subjective, changes frequently)
- File system operations (trust Node.js APIs)

### Testing Principles

1. **Test behavior, not implementation**
   - ✅ Good: "analyze detects Express when package.json has express dependency"
   - ❌ Bad: "analyze calls fs.readFile with package.json path"

2. **Focus on what can break**
   - Project analysis logic (parsing package.json, detecting patterns)
   - URI security (path traversal prevention)
   - MCP protocol compliance

3. **Use dependency injection for external dependencies**
   - Mock file system for detector tests
   - Mock MCP transport for server tests

4. **Test names express business requirements**
   - ✅ "detects TypeScript projects with tsconfig.json"
   - ❌ "readPackageJson returns object"

## Test Structure (Future)

When adding unit tests, use this structure:

```
test/
  unit/
    lib/
      detector.test.ts       # Project analysis tests
      agent-audit.test.ts    # Context gathering tests
      prompt-builder.test.ts # Prompt generation tests
    mcp/
      tools/
        analyze.test.ts      # Analyze tool tests
        audit.test.ts        # Audit tool tests
      resources/
        handler.test.ts      # Resource resolution tests
  integration/
    mcp-server.test.ts       # Full MCP server tests
  fixtures/
    sample-projects/         # Test project fixtures
```

## Adding Tests

### 1. Install Testing Dependencies

```bash
npm install --save-dev mocha chai @types/mocha @types/chai
```

### 2. Add Test Script

Add to `package.json`:

```json
{
  "scripts": {
    "test": "mocha --require ts-node/register 'test/**/*.test.ts'",
    "test:watch": "mocha --require ts-node/register --watch 'test/**/*.test.ts'"
  }
}
```

### 3. Write Your First Test

Example: `/test/unit/lib/detector.test.ts`

```typescript
import {expect} from 'chai'
import {analyzeProject} from '../../../src/lib/detector.js'

describe('analyzeProject', () => {
  it('detects TypeScript projects with package.json', async () => {
    const result = await analyzeProject('/path/to/ts/project')

    expect(result.languages).to.include('TypeScript')
    expect(result.buildTools).to.include('npm')
  })

  it('detects MCP framework when @modelcontextprotocol/sdk is present', async () => {
    const result = await analyzeProject('/path/to/mcp/project')

    expect(result.frameworks).to.include('MCP')
  })

  it('identifies test directory when tests/ exists', async () => {
    const result = await analyzeProject('/path/to/project/with/tests')

    expect(result.structure.hasTests).to.be.true
  })
})
```

### 4. Run Tests

```bash
npm test
```

## CI/CD Integration

Tests run automatically on:

- **Push to main** - Full test suite
- **Pull requests** - Full test suite + build verification

See `.github/workflows/test.yml` for current CI configuration.

### Adding New CI Checks

When unit tests are added, update `.github/workflows/test.yml`:

```yaml
- name: Run unit tests
  run: npm test

- name: Run installation tests
  run: ./test/test-install.sh
```

## Manual Testing Checklist

Before releasing:

1. **Build & Install**
   - [ ] `npm install` completes without errors
   - [ ] `npm run build` produces `lib/` directory
   - [ ] `./bin/mcp-server.js` starts without errors

2. **MCP Tools**
   - [ ] `analyze` returns project structure
   - [ ] `audit` generates quality assessment prompt
   - [ ] `list-templates` shows all 10 templates
   - [ ] `get-template` retrieves template content

3. **MCP Resources**
   - [ ] Journal resource lists correctly
   - [ ] Template resources resolve
   - [ ] Path traversal blocked (try `../../../etc/passwd`)

4. **MCP Prompts**
   - [ ] `resume-work` includes journal, commits, git status
   - [ ] `research-topic` provides research workflow
   - [ ] Prompts generate expected structure

See `/test/TESTING-CHECKLIST.md` for comprehensive pre-release testing.

## Debugging

### TypeScript Compilation Errors

```bash
# Clean build
rm -rf lib/
npm run build
```

### MCP Server Not Loading

```bash
# Check server starts
./bin/mcp-server.js

# Should output: "Docent MCP server running on stdio"
```

### Test Failures

```bash
# Run specific test file
npm test -- test/unit/lib/detector.test.ts

# Run with verbose output
npm test -- --reporter spec
```

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- Test examples in `test/` directory

## Contributing

When adding new functionality:

1. Consider if it needs tests (business logic = yes, glue code = optional)
2. Write tests before or alongside implementation
3. Update this guide if adding new test patterns
4. Ensure CI passes before merging

Questions about testing? Check existing patterns or ask in issues.
