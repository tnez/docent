# Pre-Release Requirements - 2025-10-29

## Documentation Needed Before Next Release

### User-Extensible Template Pattern

**Priority:** High
**Status:** Not started
**Target:** Before v1.0 or next minor release

#### What Needs Documentation

Users need comprehensive documentation on how to create custom templates for the `/docent:tell` tool. This will allow them to extend docent's classification capabilities without modifying source code.

#### Key Topics to Cover

1. **Creating Custom Templates**
   - Add markdown files to `.docent/templates/` directory
   - Template files override bundled templates with same name

2. **Required YAML Frontmatter Fields**

   ```yaml
   ---
   name: template-name
   description: Brief description of what this template is for
   directory: target-directory-name
   filename_prefix: file-prefix
   use_when: |
     Criteria for when to use this template
     - Bullet points explaining classification logic
     - Language patterns to look for
   examples:
     - "Example statement that would trigger this template"
     - "Another example statement"
   ---
   ```

3. **Field Descriptions**
   - `name`: Template identifier (must be unique)
   - `description`: One-line description shown to users
   - `directory`: Subdirectory under `.docent/` where files are created
   - `filename_prefix`: Prefix for generated filenames
   - `use_when`: Semantic guidance for when this template applies
   - `examples`: Sample statements that should match this template

4. **How Classification Works**
   - Agent receives all templates with their `use_when` guidance
   - Agent analyzes statement semantically
   - Agent selects best matching template
   - File is created using template structure

#### Example Use Cases to Document

- Creating domain-specific templates (e.g., "incident-report", "release-notes")
- Project-specific documentation types
- Team workflow templates
- Custom metadata requirements

#### Where to Document

Suggested locations:

- New guide: `docs/guides/custom-templates.md`
- Update: `docs/guides/mcp-api-reference.md` (add section to `/tell` tool)
- Reference: Link from main README

#### Related Files

- Implementation: `/Users/tnez/Code/tnez/docent/src/core/template-classifier.ts`
- Tool handler: `/Users/tnez/Code/tnez/docent/src/mcp/tools/tell.ts`
- Example templates: `/Users/tnez/Code/tnez/docent/templates/*.md`

## Context

This requirement emerged from the 2025-10-29 session where we implemented the template classification system. The system is fully functional and self-describing via frontmatter, but users don't yet know they can extend it.

## Testing Strategy

**Decision:** Skip traditional unit/integration tests for template-classifier module.

**Rationale:**

- Template loading is exercised every time `/tell` runs (dogfooding validates it)
- Unit tests for `parseFrontmatter()` would be low value (duplicates implementation)
- File I/O integration tests are brittle and add little confidence
- Real-world usage catches issues better than mocked tests

**Validation Approach:**

- **Dogfooding:** Use `/tell` regularly during development
- **Manual checklist before release:**
  - [ ] `/tell` shows all bundled templates with use_when guidance
  - [ ] Bundled templates load correctly from `/templates` directory
  - [ ] User templates in `.docent/templates/` override bundled ones correctly
  - [ ] Agent receives proper classification instructions
  - [ ] Created files land in correct directories with proper naming
  - [ ] Custom template examples work as documented

**Future:** Consider agent-driven acceptance tests when test infrastructure exists.

## Next Steps

1. Draft custom template guide
2. Add examples of user-created templates
3. Update API reference
4. Consider adding to docent bootstrap checklist
5. Complete manual validation checklist before release
