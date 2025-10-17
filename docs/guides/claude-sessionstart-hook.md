# Claude SessionStart Hook for Docent

This guide documents a recommended pattern for Claude Code users to automatically initialize docent context at the start of every session, including after compaction.

## The Problem

When Claude Code's context window resets (via `/compact` or automatic compaction), important project context is lost. This includes:

- Available documentation resources
- Project conventions and standards
- Work journal continuity
- Template and tool awareness

Manually running `docent init` after every compaction is tedious and easy to forget.

## The Solution: CLAUDE.md Instructions

The recommended approach is to add initialization instructions to `.claude/CLAUDE.md` (or `CLAUDE.md` at project root) that instruct Claude to run `docent init` as its first action in every session.

**Why not SessionStart hooks?** MCP servers initialize asynchronously and may not be ready when SessionStart hooks execute. Instructions in CLAUDE.md are processed after MCP servers are available.

## Implementation

### Step 1: Add Instructions to CLAUDE.md

Add the following to `.claude/CLAUDE.md` (or create it at project root as `CLAUDE.md`):

```markdown
## Session Initialization

**CRITICAL:** At the start of NEW sessions and after COMPACTION, you MUST initialize docent context as your FIRST ACTION before any other work.

### Initialization Command

Immediately run:

\`\`\`
docent init
\`\`\`

Or explicitly: "read the docent://meta/init-session resource"

### When to Initialize

- At the beginning of a new session (context window is empty)
- After a `/compact` operation (context was reset)
- When the user explicitly requests it

### When NOT to Initialize

- When resuming with `claude --continue` (init content is already in context)
- When init content is visible earlier in the conversation

### What This Provides

- Available resources (guides, runbooks, standards, templates)
- Journal workflow instructions (capture → resume pattern)
- Project info and conventions
- Quick reference for common tasks

### Important Notes

- **Do NOT attempt to call MCP resources from SessionStart hooks** - MCP servers may not be initialized yet
- This initialization happens in your first response after MCP servers are ready
- If you don't have MCP access, inform the user to check MCP server status
```

### Step 2: Optional SessionStart Hook Reminder

Optionally create `.claude/hooks/SessionStart.md` as a reminder (but NOT to execute the MCP call):

```markdown
# SessionStart Hook

⚠️ **MCP servers may not be initialized when this hook executes.**

## Required Action

After this hook and your first message:

1. Check if docent init content is already in context (look earlier in conversation)
2. If NOT present AND MCP is available: Run `docent init`
3. If MCP not available: Inform user to check MCP server status

**Note:** When resuming with `--continue`, init content is already present - no need to reinitialize.

See `.claude/CLAUDE.md` for full instructions.
```

### Step 3: Restart Claude Code (if using hook)

If you created the SessionStart hook:

1. Exit Claude Code (`/exit`)
2. Restart Claude Code
3. The hook reminder will trigger, but actual initialization happens after MCP is ready

## Testing

To verify the hook is working:

1. Start a new Claude Code session
2. Check if docent resources are automatically available (the agent should have immediate awareness of your project docs)
3. Try `/compact` and verify context is restored

You shouldn't need to manually run `docent init` anymore.

## How It Works

When Claude Code starts a session:

1. CLAUDE.md is loaded into context (or SessionStart hook provides reminder)
2. MCP servers initialize asynchronously
3. User sends first message (or warmup occurs)
4. Claude checks for MCP availability
5. Claude runs `docent init` to read `docent://meta/init-session`
6. Resource dynamically gathers current project state:
   - Available documentation (guides, runbooks, ADRs, RFCs)
   - Recent journal entries
   - Project conventions
   - Template catalog
7. Session begins with full project awareness

After compaction:

1. CLAUDE.md instructions are still in context
2. MCP servers are already initialized
3. Claude runs `docent init` at start of resumed session
4. Fresh context is loaded
5. Agent maintains continuity despite context window reset

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

### Agent Says MCP Not Available

**Symptoms**: Agent reports it doesn't have access to MCP tools at session start

**Cause**: MCP servers haven't finished initializing yet

**Solutions**:

- Wait a moment and manually run `docent init`
- Check MCP server status: `/mcp status`
- Verify docent is configured in `~/.claude.json` or project settings
- Restart Claude Code if MCP servers fail to initialize

### Context Not Applied After Init

**Symptoms**: Agent runs `docent init` but doesn't seem to have documentation awareness

**Solutions**:

- Verify docent MCP server is configured correctly
- Check MCP server is running: `/mcp status`
- Look for "docent" with status "connected"
- Test resource manually: try reading `docent://guide/getting-started`
- Check Claude Code logs for MCP errors

### Initialization Slows Down Session Start

**Symptoms**: Noticeable delay when running `docent init`

**Solutions**:

- This is expected - initialization reads documentation
- Delay should be < 1 second for most projects
- If > 2 seconds, check if docs/ directory is very large
- Consider reducing number of documentation files if needed

### MCP Timing Issues

**Symptoms**: Inconsistent behavior where sometimes MCP works, sometimes doesn't

**Cause**: Race condition between SessionStart hooks and MCP server initialization

**Solution**:

- Use CLAUDE.md instructions instead of SessionStart hooks for MCP calls
- SessionStart hooks execute before MCP servers are ready
- CLAUDE.md is processed after MCP initialization completes

## Related

- [Getting Started](./getting-started.md) - Development setup
- [MCP API Reference](./mcp-api-reference.md) - Full docent MCP capabilities
- [Session Continuity](./session-continuity.md) - Work journal and resume patterns

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-17 | @tnez | Initial creation |
