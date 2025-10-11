# Slash Command: /validate-examples

## Description

Extracts code examples from documentation and tests them to ensure they work correctly with the current codebase.

## When to Use

- **Before releases**: Ensure all examples work with release candidate
- **After dependency updates**: Check if updated deps broke examples
- **In CI/CD**: Automated validation on every PR
- **After API changes**: Verify examples still work
- **When writing docs**: Test examples as you write them

## What It Does

1. **Extracts code examples from documentation**
   - Finds all code blocks in markdown files
   - Identifies language and execution requirements
   - Handles multi-file examples
   - Preserves context and setup code

2. **Prepares test environment**
   - Creates temporary directory
   - Installs dependencies if needed
   - Sets up any required configuration
   - Handles environment variables

3. **Executes examples**
   - Runs each example in isolation
   - Captures output and errors
   - Checks exit codes
   - Validates expected output (if specified)

4. **Reports results**
   - Which examples passed/failed
   - Error messages for failures
   - Suggestions for fixes
   - Performance metrics (optional)

5. **Optionally fixes examples**
   - With --fix flag, updates broken examples
   - Corrects import statements
   - Updates deprecated API usage
   - Adds missing error handling

## Command Prompt

```markdown
---
description: Validate code examples in documentation
---

You are validating code examples from documentation to ensure they work with the current codebase.

## Context

Working directory: (auto-detected)
Documentation: docs/
Scope: ${SCOPE:-"docs/**/*.md"} (which files to check)
Fix mode: ${FIX:-false} (whether to auto-fix broken examples)

## Task

1. **Find and extract code examples:**
   - Use Glob to find markdown files in scope
   - Read each file with Read tool
   - Extract code blocks (identify by ``` markers)
   - Determine language from code fence: ```javascript, ```python, etc.
   - Look for metadata: expected output, required setup, skip markers

2. **Categorize examples by executability:**
   - **Runnable**: Complete examples with all dependencies
   - **Snippet**: Partial code, not meant to run standalone
   - **Pseudocode**: Conceptual, marked with ```text or ```pseudo
   - **Output**: Example output, not code to run

   Only test "Runnable" examples.

3. **Prepare test environment:**
   - Detect project type (package.json, Cargo.toml, etc.)
   - For each example language:
     - JavaScript/TypeScript: Check for node_modules, run npm install if needed
     - Python: Check for venv, install requirements
     - Rust: Run cargo check
     - Go: Run go mod download
   - Create temporary test files in /tmp/doc-examples/

4. **Execute examples:**
   ```bash
   # For each runnable example:

   # JavaScript
   node /tmp/doc-examples/example-001.js

   # TypeScript (if ts-node available)
   ts-node /tmp/doc-examples/example-001.ts

   # Python
   python /tmp/doc-examples/example-001.py

   # Rust
   rustc /tmp/doc-examples/example-001.rs && ./example-001

   # Bash
   bash /tmp/doc-examples/example-001.sh
   ```

   Capture:
   - Exit code
   - stdout
   - stderr
   - Execution time

5. **Validate results:**
   - Exit code 0 = pass
   - Exit code non-zero = fail
   - If expected output specified in docs, compare actual vs expected
   - Check for common error patterns:
     - Import/require errors
     - Undefined functions
     - Type errors
     - Missing dependencies

6. **Generate report using doc-validation-report style:**
   - Summary: X/Y examples passed
   - Details per file:
     - Example code
     - Expected behavior
     - Actual result
     - Error message (if failed)
   - Suggested fixes for failures

7. **Fix broken examples (if --fix flag set):**
   - Update import statements to match current API
   - Fix deprecated function calls
   - Add missing error handling
   - Update outdated syntax
   - Preserve functionality and pedagogical value
   - Use Edit tool to update documentation files

## Special Handling

**Multi-file examples:**
```markdown
<!-- example-setup.js -->
```javascript
export const config = { /* ... */ }
```

<!-- example-main.js -->
```javascript
import { config } from './example-setup.js'
// Use config...
```

Combine into single test context.

**Expected output:**
```markdown
```javascript
console.log('Hello, World!')
```

Expected output:
```
Hello, World!
```

Validate actual output matches expected.

**Skip markers:**
```markdown
```javascript
// This example requires external service running
// @skip-validation
```

Don't execute examples marked with @skip-validation.

**Setup code:**
```markdown
```javascript
// @setup
const db = await connectDatabase()
```

```javascript
// @example
const users = await db.users.find()
```

Run setup before each example.

## Error Messages

Provide clear, actionable error messages:

**Import Error:**
```
❌ Example failed: docs/guides/api.md:45
   Error: Cannot find module 'old-api-client'

   Suggested fix:
   - Update import to use 'new-api-client'
   - Or add 'old-api-client' to dependencies
```

**Syntax Error:**
```
❌ Example failed: docs/tutorials/basics.md:120
   SyntaxError: Unexpected token '?.'

   Suggested fix:
   - This example uses optional chaining (?.)
   - Requires Node.js 14+ or Babel
   - Update example or document requirement
```

**Logical Error:**
```
❌ Example failed: docs/guides/authentication.md:200
   TypeError: Cannot read property 'token' of undefined

   Suggested fix:
   - Add null check: user?.token
   - Or show error handling example
```

## Output Format

Use doc-validation-report output style.

Summary:
```
✅ Examples validated: 45/50 passed (90%)
⚠️ 3 failed (fixable)
❌ 2 failed (manual intervention needed)
```

Per-file results:
- File path
- Line number of example
- Pass/fail status
- Error details (if failed)
- Suggested fix
- Estimated fix time

## Success Criteria

- All runnable examples extracted
- Each example executed in appropriate environment
- Clear pass/fail status for each
- Actionable fix suggestions for failures
- If --fix mode, broken examples updated
- Documentation files modified carefully (preserve formatting)

## Performance Considerations

- Run examples in parallel when safe (no shared state)
- Cache dependency installations
- Timeout long-running examples (default 30s)
- Use --scope to limit files checked
- Skip non-critical examples with @skip-validation
