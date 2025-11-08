# ADR-0006: Optional Frontmatter Type Field with Directory-Based Inference

**Status:** Accepted
**Date:** 2025-10-29
**Deciders:** solo

---

## Context

Custom templates and runbooks require YAML frontmatter with metadata fields. Initially, users were required to specify a `type` field explicitly:

```yaml
---
name: my-runbook
description: Does something useful
type: runbook  # Required but redundant
---
```

The `type` field felt redundant because the directory location already indicates the type:

- Files in `runbooks/` are obviously runbooks
- Files in `templates/` are obviously templates

This created unnecessary friction for users creating custom resources. Developer experience principle: reduce unnecessary verbosity and leverage conventions.

---

## Decision

Make the `type` field optional in frontmatter and infer it automatically from directory location.

Implementation:

- Files in `runbooks/` → inferred as `type: runbook`
- Files in `templates/` → inferred as `type: template`
- Users can still explicitly set `type` if desired (manual setting takes precedence)
- Validation now only requires `name` and `description` fields

---

## Consequences

### Positive

- **Reduced verbosity** - Users write less boilerplate
- **Less friction** - Easier to create custom resources
- **Convention over configuration** - Directory structure determines type
- **Still explicit when needed** - Can override if necessary
- **Better DX** - Smaller barrier to extensibility

### Negative

- **Hidden magic** - Type inference may not be obvious to new users
- **Directory constraint** - Files must be in correct directory for inference
- **Documentation needed** - Need to document the inference behavior

### Neutral

- **Precedence rules** - Explicit type takes precedence over inferred type
- **Validation changes** - Fewer required fields in frontmatter

---

## Alternatives Considered

### Alternative 1: Keep Type Required

**Description:** Maintain status quo requiring explicit `type` field.

**Pros:**

- Explicit and clear
- No inference magic
- Type always known

**Cons:**

- Redundant with directory location
- Unnecessary verbosity
- Friction for users

**Why not chosen:** Developer experience suffers for no real benefit. Directory location is sufficient signal.

### Alternative 2: Remove Type Entirely

**Description:** Eliminate type field completely, rely solely on directory inference.

**Pros:**

- Simplest approach
- No ambiguity

**Cons:**

- Loses flexibility for edge cases
- Can't override inference if needed
- Less future-proof

**Why not chosen:** Keeping optional type allows flexibility while reducing verbosity for common cases.

### Alternative 3: Required in User Files, Optional in Bundled

**Description:** Bundled resources skip type, but user resources require it.

**Pros:**

- Enforces discipline for users
- Reduces bundled boilerplate

**Cons:**

- Inconsistent experience
- Doesn't solve user friction
- Confusing double standard

**Why not chosen:** Inconsistency creates poor developer experience.

---

## Implementation Notes

Updated `src/core/resource-registry.ts`:

```typescript
function parseResource(
  content: string,
  filePath: string,
  inferredType?: 'template' | 'runbook'
): Resource {
  // Parse frontmatter
  const metadata = parseFrontmatter(content);

  // Use explicit type if provided, otherwise use inferred
  const type = metadata.type || inferredType;

  // Validation now only requires name and description
  validateMinimalFrontmatter(metadata);

  return { ...metadata, type };
}

// Called from loaders with inferred type
loadTemplatesFrom(dir) {
  parseResource(content, path, 'template');
}

loadRunbooksFrom(dir) {
  parseResource(content, path, 'runbook');
}
```

Migration: No migration needed. Existing files with explicit `type` continue working. Users can remove `type` from custom resources at their convenience.

---

## References

- Implementation: `src/core/resource-registry.ts`
- Related: Template frontmatter requirements
- Pattern: Convention over configuration

---

## Notes

This decision exemplifies "convention over configuration" - a principle where sensible defaults based on conventions reduce the need for explicit configuration.

The pattern could be extended to other frontmatter fields in the future if directory or file naming conventions provide sufficient signal.
