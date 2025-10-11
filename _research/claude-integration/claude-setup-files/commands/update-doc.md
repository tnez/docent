# Slash Command: /update-doc

## Description

Updates specific documentation file based on recent code changes, fixing drift and ensuring accuracy. Preserves the documentation's voice and structure while incorporating necessary changes.

## When to Use

- **After code changes**: Update affected documentation
- **Following drift detection**: Fix identified outdated content
- **When examples break**: Update broken code examples
- **After API changes**: Update API documentation
- **Post-refactoring**: Reflect new code structure

## What It Does

1. **Analyzes the documentation file**
   - Reads current content
   - Identifies purpose and structure
   - Extracts code examples
   - Notes tone and style

2. **Identifies what needs updating**
   - Compares to current code
   - Finds outdated references
   - Locates broken examples
   - Identifies missing new features

3. **Generates proposed updates**
   - Updates code examples to work with current API
   - Revises explanations to match current behavior
   - Adds new sections for new features
   - Removes documentation for deleted features

4. **Preserves documentation quality**
   - Maintains original structure
   - Keeps same writing style
   - Preserves pedagogical approach
   - Retains helpful context

5. **Validates changes**
   - Tests updated code examples
   - Checks updated links
   - Verifies technical accuracy
   - Ensures standards compliance

## Command Prompt

```markdown
---
description: Update documentation file based on code changes
argument-hint: <file-path>
---

You are updating documentation to reflect current code state while preserving quality and voice.

## Context

File to update: $ARGUMENTS (required: path to documentation file)
Working directory: (auto-detected)
Preserve style: true (maintain original writing style)
Validate changes: true (test examples after updating)

## Task

1. **Understand current documentation:**
   - Read the file: $ARGUMENTS
   - Identify document type (tutorial, guide, reference, concept)
   - Note structure and organization
   - Extract current code examples
   - Understand target audience and depth level

2. **Identify what's outdated:**
   - If drift report exists (from /check-doc-drift), review it
   - Compare code examples to current codebase:
     - Use Grep to find referenced functions/APIs
     - Check if imports/requires are current
     - Verify configuration options still exist
   - Check links to other docs (internal references)
   - Look for version-specific references that may be outdated

3. **Determine necessary updates:**

   **For Code Examples:**
   - Extract each code block
   - Test if it runs (use Bash tool if safe)
   - If broken:
     - Find current correct version in codebase
     - Update example to use current API
     - Maintain pedagogical value
     - Keep example simple and focused

   **For API References:**
   - Use Grep to find current function signatures
   - Compare documented params to actual params
   - Update parameter lists
   - Update return type documentation
   - Add new parameters (mark as optional if they are)

   **For Configuration:**
   - Find config schema (config/*.ts, *.yaml, etc.)
   - Compare documented options to schema
   - Update changed options
   - Add new options
   - Mark deprecated options

   **For Behavioral Descriptions:**
   - Check if described behavior matches current code
   - Update explanations of how things work
   - Revise error message references
   - Update performance characteristics if changed

4. **Generate proposed changes:**
   - Create list of specific edits:
     - Line ranges to update
     - Old content → New content
     - Rationale for each change
   - Preserve:
     - Document structure (headings, organization)
     - Writing style and tone
     - Level of detail
     - Pedagogical approach
   - Add:
     - New sections for new features
     - Migration notes if breaking changes
     - "Updated: [date]" in frontmatter

5. **Preview changes for approval:**
   Show before/after for each major change:
   ```
   ─────── Current (lines 45-52) ───────
   ```javascript
   const client = new ApiClient({
     apiKey: process.env.API_KEY
   })
   ```

   ─────── Proposed Update ───────
   ```javascript
   const client = new ApiClient({
     apiKey: process.env.API_KEY,
     timeout: 5000  // New required option
   })
   ```

   Reason: timeout parameter now required (added in v2.0)
   ```

   Ask user: "Apply these changes? (Y/n)"

6. **Apply approved changes:**
   - Use Edit tool to update file
   - Make one logical change at a time
   - Preserve formatting and whitespace
   - Update frontmatter (last_updated, version, etc.)

7. **Validate updated documentation:**
   - Extract updated code examples
   - Test each example (if runnable)
   - Check internal links still resolve
   - Verify standards compliance
   - Run /validate-examples on updated file

8. **Report results:**
   - List changes made
   - Validation results
   - Any remaining issues
   - Suggested follow-up actions

## Update Patterns

**Pattern: API Signature Change**
```
Old: function createUser(name: string)
New: function createUser(name: string, options?: CreateOptions)

Action:
- Update function signature in docs
- Add description of options parameter
- Update examples to show both forms
- Add migration note if breaking change
```

**Pattern: Configuration Schema Change**
```
Old: { port: 3000 }
New: { server: { port: 3000, host: 'localhost' } }

Action:
- Update config examples
- Explain new nested structure
- Provide migration guide
- Mark old format as deprecated
```

**Pattern: Behavioral Change**
```
Old: "Function returns null if not found"
New: "Function throws NotFoundError if not found"

Action:
- Update error handling in explanation
- Update code examples with try/catch
- Add note about error handling change
- Update migration guide
```

**Pattern: New Feature Added**
```
Feature: Added batch operations API

Action:
- Add new section for batch operations
- Provide examples
- Explain when to use vs single operations
- Link from related sections
- Update table of contents
```

**Pattern: Feature Removed**
```
Removed: Legacy authentication method

Action:
- Remove or archive old documentation
- Add deprecation notice if phased removal
- Link to migration guide
- Update all references to removed feature
```

## Special Handling

**Breaking Changes:**
- Add prominent "Breaking Change" notice
- Provide migration path
- Show before/after examples
- Link to changelog

**Deprecated Features:**
- Mark section with "Deprecated" badge
- Explain what to use instead
- Provide migration timeline
- Keep documentation until removal

**Beta/Experimental Features:**
- Mark as "Beta" or "Experimental"
- Note stability caveats
- Link to stable alternatives
- Update status when feature stabilizes

**Version-Specific Content:**
```markdown
## Installation

For version 2.x:
```bash
npm install package@^2.0.0
```

For version 1.x (legacy):
```bash
npm install package@^1.0.0
```

Update both sections when applicable.
```

## Quality Checks

Before marking update complete, verify:

- [ ] All code examples run successfully
- [ ] API signatures match current code
- [ ] Configuration examples are valid
- [ ] Links resolve correctly
- [ ] Terminology is consistent
- [ ] Writing style matches original
- [ ] Document structure preserved
- [ ] Frontmatter updated
- [ ] No TODO markers left (unless intentional)
- [ ] Standards compliance maintained

## Output Format

Use doc-update-report style.

Structure:
1. File updated: [path]
2. Changes summary: [count] updates made
3. Changes by type:
   - Code examples: X updated, Y added
   - API references: Z updated
   - Configuration: N updated
   - Content: M sections revised
4. Validation results:
   - Examples tested: ✓ All passing
   - Links checked: ✓ All valid
   - Standards: ✓ Compliant
5. Remaining issues: [if any]
6. Next steps: [if any follow-up needed]

## Success Criteria

- Documentation accurately reflects current code
- All code examples work
- Writing quality maintained or improved
- Document structure preserved
- Changes are minimal but sufficient
- Validation passes
- User approves changes (if interactive)
