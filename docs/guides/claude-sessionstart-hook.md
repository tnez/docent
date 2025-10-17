# Claude SessionStart Hook for Docent

This guide documents a recommended pattern for Claude Code users to automatically initialize docent context at the start of every session, including after compaction.

## The Problem

When Claude Code's context window resets (via `/compact` or automatic compaction), important project context is lost. This includes:

- Available documentation resources
- Project conventions and standards
- Work journal continuity
- Template and tool awareness

Manually running `docent init` after every compaction is tedious and easy to forget.

## The Solution: SessionStart Hook

Claude Code provides a `SessionStart` hook that runs at the beginning of every session, including after compaction and when resuming with `claude --continue`.

By creating a SessionStart hook that automatically reads `docent://meta/init-session`, you ensure docent context is always fresh.

## Implementation

### Step 1: Create Hook File

Create `.claude/hooks/SessionStart.md` in your project root:

```markdown
# SessionStart Hook

**CRITICAL:** This hook runs at the start of every session, including:

- New sessions
- After `/compact` operations
- When resuming with `claude --continue`

## Required Action

You MUST automatically read the `docent://meta/init-session` resource from the docent MCP server to bootstrap the session with project context.

**Do this BEFORE responding to any user message.**

## Implementation

\`\`\`
1. Read resource: docent://meta/init-session
2. Process the initialization content
3. Continue with user's request
\`\`\`

## What This Provides

- Available resources (guides, runbooks, standards, templates)
- Journal workflow instructions (capture → resume pattern)
- Project-specific conventions and standards
- Quick reference for common documentation tasks

## Example

\`\`\`
[SessionStart hook triggered]
Assistant: [reads docent://meta/init-session via MCP]
Assistant: [processes initialization]
Assistant: [proceeds with user's request]
\`\`\`

The user doesn't see the initialization explicitly - it happens transparently to ensure you always have current project context.
```

### Step 2: Gitignore the Hook (Optional)

The `.claude/` directory is typically gitignored globally, but you can add it to your project's `.gitignore` if needed:

```gitignore
# Claude Code personal configuration
.claude/
```

This keeps the hook as a local development tool rather than checked into the repository.

### Step 3: Restart Claude Code

After creating the hook:

1. Exit Claude Code (`/exit`)
2. Restart Claude Code
3. The hook will now trigger automatically at session start

## Testing

To verify the hook is working:

1. Start a new Claude Code session
2. Check if docent resources are automatically available (the agent should have immediate awareness of your project docs)
3. Try `/compact` and verify context is restored

You shouldn't need to manually run `docent init` anymore.

## How It Works

When Claude Code starts a session:

1. SessionStart hook triggers
2. Hook reads `docent://meta/init-session` resource
3. Resource dynamically gathers current project state:
   - Available documentation (guides, runbooks, ADRs, RFCs)
   - Recent journal entries
   - Project conventions
   - Template catalog
4. Agent receives this context before any user interaction
5. Session begins with full project awareness

After compaction:

1. SessionStart hook triggers again
2. Fresh context is loaded
3. Agent maintains continuity despite context window reset

## Benefits

- **Zero friction**: No manual `docent init` needed
- **Post-compact recovery**: Context automatically restored
- **Always current**: Pulls latest docs/journal state
- **Transparent**: User doesn't see the initialization

## Alternative: Manual Initialization

If you prefer not to use hooks, you can still manually initialize:

```
User: "docent init"
Assistant: [reads docent://meta/init-session]
```

This works but requires remembering to do it after each compaction.

## Agent-Agnostic Note

This pattern is specific to Claude Code. Other agents may have different mechanisms:

- **Cursor**: Uses `.cursorrules` (static file, read at session start)
- **Aider**: Uses `.aiderules` (static file)
- **Generic**: Uses `AGENTS.md` (static file, agent-dependent behavior)

The SessionStart hook is Claude Code's dynamic solution for post-compaction context recovery.

## Troubleshooting

### Hook Not Running

**Symptoms**: Agent doesn't seem to have docent context at session start

**Solutions**:

- Verify hook file exists at `.claude/hooks/SessionStart.md`
- Check hook file has correct markdown syntax
- Restart Claude Code completely (not just new chat)
- Enable verbose logging to see hook execution

### Hook Runs But Context Not Applied

**Symptoms**: Hook runs but agent still doesn't know about docs

**Solutions**:

- Verify docent MCP server is configured in `~/.claude.json`
- Check MCP server is running: Look for "docent" in `/mcp status`
- Test manual init: Try `docent init` to see if resource is accessible
- Check for errors in Claude Code logs

### Hook Slows Down Session Start

**Symptoms**: Noticeable delay when starting sessions

**Solutions**:

- This is expected - initialization reads resources
- Delay should be < 1 second for most projects
- If > 2 seconds, check if docs/ directory is very large
- Consider reducing number of documentation files if needed

## Related

- [Getting Started](./getting-started.md) - Development setup
- [MCP API Reference](./mcp-api-reference.md) - Full docent MCP capabilities
- [Session Continuity](./session-continuity.md) - Work journal and resume patterns

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-17 | @tnez | Initial creation |
