# RFC-0006: Session-Based Journal Architecture

**Status:** Implemented
**Author:** @tnez
**Created:** 2025-10-16
**Updated:** 2025-10-16
**Related:** RFC-0004 (Work Artifact Capture), RFC-0005 (Enhanced MCP Architecture)

## Summary

Refactor docent's work journal from a single concatenated file (`.docent/journal.md`) to session-based files stored in `docs/.journal/` with timestamp-based naming. Each session gets its own journal file, providing natural isolation for git worktrees, better scalability, and cleaner git diffs. Journals remain gitignored as ephemeral agent state.

## Motivation

### Problem Statement

**Current Implementation: Single Concatenated Journal**

RFC-0004 introduced work journaling with capture-work and resume-work tools. The current implementation uses a single file:

```
.docent/journal.md    # All sessions concatenated
```

**Problems with this approach:**

1. **Worktree Conflicts**
   - Git worktrees share the same `.git/` directory
   - Single journal file causes cross-contamination between parallel work streams
   - Working on feature-a in one worktree pollutes context when switching to feature-b in another worktree
   - No clean way to maintain separate context per worktree

2. **Unbounded Growth**
   - Journal file grows indefinitely as sessions append
   - After 10+ sessions, file becomes large and unwieldy
   - Resume-work must parse entire history to find relevant context
   - No natural archival/cleanup mechanism

3. **Poor Git Diffs**
   - Every journal entry appends to same file
   - Git diffs show massive append-only changes
   - Hard to see what changed in a specific session
   - Pollutes commit history if accidentally committed

4. **Wrong Directory Location**
   - `.docent/` directory sits outside `docs/` tree
   - Docent philosophy: operate within `docs/` as primary namespace
   - Separate directory adds cognitive overhead
   - Hidden directory (`.docent/`) but meant to be gitignored anyway

**Real-world scenario that triggered this RFC:**

```
User: "I often use git worktrees and bounce between projects.
       These journals should be worktree-specific state.
       I want docs/.journal/*.md so each worktree is isolated."
```

**Why this matters:**

The journal is **ephemeral agent state** - working memory for the current worktree, not permanent project documentation. Each worktree should maintain its own independent context.

### User Experience Problems

**Without session-based journals:**

```bash
# Main worktree
cd ~/project
# Work on feature-a, journal records progress
# .docent/journal.md: "Working on feature-a authentication..."

# Create worktree for feature-b
git worktree add ../project-feature-b feature-b
cd ../project-feature-b

# Resume work here
agent: resume-work
# Sees mixed context from feature-a AND feature-b (wrong!)
# Agent confused by irrelevant feature-a context
```

**With session-based journals:**

```bash
# Main worktree
cd ~/project
# docs/.journal/2025-10-16-session-001.md (feature-a work)

# Create worktree for feature-b
git worktree add ../project-feature-b feature-b
cd ../project-feature-b

# Fresh .journal/ directory in this worktree
# docs/.journal/2025-10-16-session-001.md (feature-b work, isolated)

# Resume work
agent: resume-work
# Sees only feature-b context ✅
```

### Goals

1. **Worktree Isolation**: Each worktree maintains independent journal state
2. **Scalability**: Bounded session files prevent unbounded growth
3. **Discoverability**: Timestamp-based filenames enable chronological browsing
4. **Git Cleanliness**: Gitignore journals as ephemeral state
5. **Single Namespace**: Operate within `docs/` directory tree
6. **Natural Archival**: Old sessions can be cleaned up or summarized

### Non-Goals

1. **Journal Commits**: Journals remain gitignored, never committed
2. **Cross-Worktree Sync**: Sessions are intentionally isolated per worktree
3. **Infinite History**: Old sessions may be archived/deleted
4. **Search/Query**: No indexing or search (can add later if needed)

## Detailed Design

### Architecture Overview

```
docs/
  .journal/                           # Hidden directory, gitignored
    2025-10-16-session-001.md         # First session today (current)
    2025-10-16-session-002.md         # Second session (after break)
    2025-10-15-session-001.md         # Yesterday's session
    2025-10-14-session-001.md         # Older session
    2025-10-14-session-002.md         # Another old session
```

**File Naming Convention:**

```
YYYY-MM-DD-session-NNN.md

Where:
- YYYY-MM-DD: ISO date (sortable, human-readable)
- session-NNN: Auto-incrementing counter for multiple sessions on same day
- NNN: Padded 3-digit number (001, 002, ...)
```

**Examples:**

```
2025-10-16-session-001.md    # First session on Oct 16
2025-10-16-session-002.md    # Second session on Oct 16 (after break)
2025-10-16-session-003.md    # Third session on Oct 16
```

### Session Detection Logic

**When does a new session start?**

Option A: **Time-based with explicit override** (RECOMMENDED)

```typescript
function shouldStartNewSession(): boolean {
  const sessions = listJournalSessions()

  if (sessions.length === 0) {
    return true  // First session
  }

  const currentSession = sessions[sessions.length - 1]
  const lastEntryTime = getLastEntryTimestamp(currentSession)
  const hoursSinceLastEntry = (Date.now() - lastEntryTime) / (1000 * 60 * 60)

  if (hoursSinceLastEntry > 4) {
    return true  // Gap > 4 hours = new session
  }

  return false  // Continue current session
}
```

**Explicit new session:**

```typescript
// User/agent can force new session
capture-work(newSession: true, ...)
```

**Rationale for 4-hour threshold:**

- Coffee break or lunch: <4 hours → same session
- Long break or different day: >4 hours → new session
- Within worktree context, time gaps naturally indicate session boundaries
- Can be tuned based on usage patterns

### File Structure Per Session

Each session file maintains the same journal structure from RFC-0004:

```markdown
# Session 2025-10-16-001

## [Timestamp] Entry Title

**Summary:** Brief description

**Key Discoveries:**
- Discovery 1
- Discovery 2

**Next Steps:**
- Step 1
- Step 2

**Open Questions:**
- Question 1

---

## [Timestamp] Another Entry

**Summary:** ...

---
```

**Session Metadata (optional):**

```markdown
# Session 2025-10-16-001

**Started:** 2025-10-16T09:30:00Z
**Last Updated:** 2025-10-16T14:45:00Z
**Worktree:** main
**Branch:** feature-authentication

---

## Entries

[entries here...]
```

### Tool Updates

#### capture-work Tool

**Updated behavior:**

```typescript
interface CaptureWorkArgs {
  summary: string
  discoveries?: string[]
  next_steps?: string[]
  questions?: string[]
  newSession?: boolean  // NEW: Force new session
}

async function captureWork(args: CaptureWorkArgs): Promise<void> {
  const journalDir = 'docs/.journal'

  // Ensure directory exists
  await ensureDir(journalDir)

  // Determine session file
  let sessionFile: string

  if (args.newSession || shouldStartNewSession()) {
    sessionFile = getNextSessionFile(journalDir)
  } else {
    sessionFile = getCurrentSessionFile(journalDir)
  }

  // Append entry to session file
  const entry = formatJournalEntry(args)
  await appendToFile(sessionFile, entry)
}

function getCurrentSessionFile(dir: string): string {
  const sessions = listJournalSessions(dir)
  if (sessions.length === 0) {
    return getNextSessionFile(dir)
  }
  return sessions[sessions.length - 1]
}

function getNextSessionFile(dir: string): string {
  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  const sessions = listJournalSessions(dir)

  // Find existing sessions for today
  const todaySessions = sessions.filter(s => s.startsWith(today))

  // Next session number
  const nextNum = todaySessions.length + 1
  const paddedNum = String(nextNum).padStart(3, '0')

  return `${dir}/${today}-session-${paddedNum}.md`
}
```

#### resume-work Tool

**Updated behavior:**

```typescript
async function resumeWork(): Promise<string> {
  const journalDir = 'docs/.journal'

  // Read recent sessions (last 3)
  const sessions = listJournalSessions(journalDir)
  const recentSessions = sessions.slice(-3)

  // Build context
  let journalContext = ''

  for (const sessionFile of recentSessions) {
    const content = await readFile(sessionFile)
    journalContext += `\n## ${sessionFile}\n\n${content}\n`
  }

  // Gather other context (git status, commits, TODOs)
  const gitStatus = await getGitStatus()
  const commits = await getRecentCommits(10)
  const todos = await findTodos()

  // Build resume-work prompt
  return buildResumePrompt({
    journal: journalContext,
    gitStatus,
    commits,
    todos
  })
}
```

**Why last 3 sessions?**

- Captures recent context without overwhelming prompt
- Most relevant: current session + 1-2 previous sessions
- Older sessions can be read if needed, but not automatically included
- Keeps prompt size reasonable

#### list-sessions Tool (NEW)

**New tool for session management:**

```typescript
interface ListSessionsResult {
  sessions: Array<{
    file: string
    date: string
    sessionNumber: number
    entryCount: number
    lastModified: Date
    size: number
  }>
}

async function listSessions(): Promise<ListSessionsResult> {
  const journalDir = 'docs/.journal'
  const sessions = await listJournalSessions(journalDir)

  const results = []
  for (const session of sessions) {
    const stats = await stat(session)
    const content = await readFile(session)
    const entryCount = countEntries(content)

    results.push({
      file: session,
      date: extractDate(session),
      sessionNumber: extractSessionNumber(session),
      entryCount,
      lastModified: stats.mtime,
      size: stats.size
    })
  }

  return { sessions: results }
}
```

### Resource URI Updates (RFC-0005 Integration)

**Current:** `docent://journal/current`

**Updated:**

```
docent://journal/current           → Latest session file
docent://journal/latest            → Alias for current
docent://journal/2025-10-16-001    → Specific session by ID
docent://journal/2025-10-16        → All sessions on date
docent://journal/recent            → Last 3 sessions (for resume-work)
```

**Resource Handler Updates:**

```typescript
private async readJournal(identifier: string): Promise<ResourceContent> {
  const journalDir = 'docs/.journal'

  switch (identifier) {
    case 'current':
    case 'latest':
      const current = getCurrentSessionFile(journalDir)
      return readSessionFile(current)

    case 'recent':
      const sessions = listJournalSessions(journalDir).slice(-3)
      const content = await Promise.all(sessions.map(readSessionFile))
      return { text: content.join('\n\n---\n\n'), ... }

    default:
      // Check if date or session ID
      if (identifier.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date: return all sessions for that date
        return readSessionsByDate(journalDir, identifier)
      } else if (identifier.match(/^\d{4}-\d{2}-\d{2}-session-\d{3}$/)) {
        // Specific session
        return readSessionFile(`${journalDir}/${identifier}.md`)
      } else {
        throw new Error(`Invalid journal identifier: ${identifier}`)
      }
  }
}
```

### Migration Strategy

**Migrating from single file to sessions:**

```typescript
async function migrateJournal(): Promise<void> {
  const oldJournal = '.docent/journal.md'
  const newJournalDir = 'docs/.journal'

  if (!await exists(oldJournal)) {
    return  // Nothing to migrate
  }

  // Read existing journal
  const content = await readFile(oldJournal)

  // Parse into entries (timestamped sections)
  const entries = parseJournalEntries(content)

  // Group entries by date
  const sessionsByDate = groupEntriesByDate(entries)

  // Write to new session files
  await ensureDir(newJournalDir)

  for (const [date, dateEntries] of Object.entries(sessionsByDate)) {
    const sessionFile = `${newJournalDir}/${date}-session-001.md`
    await writeFile(sessionFile, formatSession(dateEntries))
  }

  // Rename old journal for safety (don't delete)
  await rename(oldJournal, `${oldJournal}.migrated`)

  console.log(`Migrated ${entries.length} entries to ${newJournalDir}`)
}
```

**Migration is automatic:**

- Run on first capture-work or resume-work call
- Detects `.docent/journal.md` existence
- Migrates to new structure
- Renames old file (doesn't delete, for safety)

### Gitignore Updates

**Add to `.gitignore`:**

```gitignore
# Docent journals - ephemeral agent state per worktree
docs/.journal/
```

**Why gitignore?**

1. **Ephemeral State**: Journals are working memory, not permanent docs
2. **Worktree-Specific**: Each worktree has its own context
3. **Avoid Conflicts**: Never merge journal state across branches
4. **Clean Commits**: Journals don't pollute commit history
5. **Privacy**: May contain exploratory notes not ready to share

**When journals ARE committed (rare):**

- User explicitly adds them for specific reason
- Example: Preserving detailed session history for retrospective
- Generally discouraged, but allowed if user wants it

### Session Lifecycle

```
┌─────────────────────────────────────────────────┐
│  User starts work in worktree                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Agent: capture-work(summary: "...")             │
│  - Checks: Any existing sessions?                │
│  - No → Create 2025-10-16-session-001.md        │
│  - Yes → Check time since last entry            │
│     - <4h → Append to current session           │
│     - >4h → Create new session-002.md           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Work continues...                               │
│  - Multiple capture-work calls append entries   │
│  - All go to same session file                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Long break (>4 hours) or next day              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Agent: capture-work(summary: "...")             │
│  - Detects >4h gap → New session-002.md         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  User: resume-work                               │
│  - Reads last 3 sessions                        │
│  - Provides context summary                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Worktree deleted or work complete              │
│  - docs/.journal/ deleted with worktree         │
│  - No cleanup needed (gitignored)               │
└─────────────────────────────────────────────────┘
```

## Trade-offs and Alternatives

### Trade-offs of Session-Based Architecture

**Advantages:**

1. ✅ **Worktree Isolation**: Each worktree maintains independent state
2. ✅ **Bounded Growth**: Session files stay small and manageable
3. ✅ **Better Git Diffs**: New files vs appends to large file
4. ✅ **Natural Archival**: Old sessions easy to clean up
5. ✅ **Discoverability**: Timestamp filenames enable browsing
6. ✅ **Scalability**: 100 sessions = 100 small files, not 1 huge file

**Disadvantages:**

1. ❌ **More Files**: Multiple files vs single file (but gitignored, so low impact)
2. ❌ **Session Detection**: Need heuristic for session boundaries (time-based)
3. ❌ **Resume Complexity**: Must read multiple files vs single file
4. ❌ **Migration Required**: Existing users must migrate from old structure

**Assessment:** Advantages strongly outweigh disadvantages. Worktree isolation and scalability are critical.

### Alternative 1: Single File with Sections (Current)

**Description:** Keep `.docent/journal.md`, use markdown sections for sessions

**Pros:**

- Simple implementation (current state)
- Single file to read
- No migration needed

**Cons:**

- ❌ Worktree conflicts (can't isolate per worktree)
- ❌ Unbounded growth (file gets huge)
- ❌ Poor git diffs (massive appends)
- ❌ Wrong directory (`.docent/` separate from `docs/`)

**Why not chosen:** Fundamental worktree isolation problem cannot be solved with single file.

### Alternative 2: Database Storage (SQLite)

**Description:** Store journals in SQLite database per worktree

**Pros:**

- Structured queries (search, filter)
- Better performance for large history
- Atomic operations

**Cons:**

- ❌ Over-engineered (journals are simple markdown)
- ❌ Not human-readable (can't browse with cat/less)
- ❌ Requires SQLite dependency
- ❌ Binary file (not diffable)
- ❌ Complexity for simple need

**Why not chosen:** Markdown files are sufficient and more aligned with docent's philosophy (documentation is just text).

### Alternative 3: One Session = One Worktree

**Description:** Journal deleted when worktree deleted, no cross-session history

**Pros:**

- Simplest isolation model
- Perfect worktree boundaries

**Cons:**

- ❌ Loses history within worktree (can't see yesterday's work)
- ❌ No resume-work context from previous day
- ❌ Too ephemeral (some persistence is valuable)

**Why not chosen:** Need some history within worktree for effective resume-work.

### Alternative 4: Timestamped but No Session Numbers

**Description:** Use full timestamp as filename: `2025-10-16T09-30-15.md`

**Pros:**

- Unique by default
- No session numbering logic needed

**Cons:**

- ❌ Hard to read (too much precision)
- ❌ Doesn't group sessions by day
- ❌ Less discoverable (many files per day)

**Why not chosen:** Date + session number strikes better balance (human-readable, grouped by day).

### Alternative 5: Keep in `.docent/` Directory

**Description:** Use session-based files but stay in `.docent/journal/`

**Pros:**

- Keeps `.docent/` directory for all docent state
- Separation from `docs/` documentation

**Cons:**

- ❌ Another top-level directory (cognitive overhead)
- ❌ Violates docent philosophy (docs/ as primary namespace)
- ❌ Inconsistent with resource URIs (`docent://` suggests docs/ location)

**Why not chosen:** Consolidating under `docs/` is cleaner and more consistent.

## Security Considerations

**Minimal security implications:**

1. **Path Traversal**
   - Session filenames are programmatically generated (no user input)
   - Pattern: `YYYY-MM-DD-session-NNN.md` (no path components)
   - No risk of `../../` attacks

2. **Sensitive Information**
   - Journals may contain exploratory notes, architecture discussions
   - Gitignored by default (not committed)
   - User responsibility: Don't put secrets in journals

3. **File Permissions**
   - Journals created with default user permissions
   - No special elevation needed
   - Standard file system access

**Best Practices:**

- Keep journals gitignored
- Don't store secrets or credentials in journals
- Journals are development notes, not production docs

## Performance Considerations

**Minimal performance impact:**

1. **Session Detection**
   - List files in `docs/.journal/` directory
   - Typical: 5-20 session files per worktree
   - Estimated: <10ms

2. **Resume-work Reading**
   - Read last 3 session files
   - Typical: 3 files × 5-20KB each = 15-60KB total
   - Estimated: <50ms

3. **Capture-work Appending**
   - Append entry to current session file
   - Typical: 1-2KB per entry
   - Estimated: <10ms

4. **Comparison to Single File**
   - Single file: Read entire history (grows unbounded)
   - Session files: Read recent history only (bounded)
   - **Net benefit:** Better performance as history grows

**Scalability:**

- 100 sessions = 100 small files (manageable)
- Single file with 100 sessions = 500KB+ (slower to parse)
- Session-based scales better with history

## Testing Strategy

### Unit Tests

1. **Session Detection**
   - No sessions → creates session-001
   - Existing session <4h old → appends
   - Existing session >4h old → creates new session
   - Multiple sessions on same day → increments counter

2. **File Naming**
   - Generates correct `YYYY-MM-DD-session-NNN.md` format
   - Pads session numbers to 3 digits
   - Handles date boundaries correctly

3. **Migration**
   - Migrates old `.docent/journal.md` to sessions
   - Groups entries by date
   - Renames old file safely
   - Handles empty journal

4. **Resource URIs**
   - `docent://journal/current` returns latest session
   - `docent://journal/recent` returns last 3 sessions
   - `docent://journal/2025-10-16` returns sessions for date
   - `docent://journal/2025-10-16-001` returns specific session

### Integration Tests

1. **End-to-End Capture**
   - First capture creates session-001
   - Subsequent captures append to session
   - After break, creates session-002

2. **End-to-End Resume**
   - Resume reads recent sessions
   - Provides correct context
   - Handles missing journals gracefully

3. **Worktree Isolation**
   - Create two worktrees
   - Capture work in each
   - Verify journals independent

### Manual Testing

1. **Dogfooding**
   - Use new journal structure for docent development
   - Test resume-work after breaks
   - Verify worktree isolation with real worktrees
   - Validate timestamp-based file management

2. **Migration Testing**
   - Migrate existing `.docent/journal.md` from docent project
   - Verify all entries preserved
   - Check new structure works

### Success Criteria

- ✅ Sessions isolated per worktree
- ✅ Automatic session detection works
- ✅ Resume-work provides relevant context
- ✅ Migration preserves existing journals
- ✅ Gitignore prevents accidental commits
- ✅ Performance <100ms for all operations

## Migration and Rollout

### Breaking Changes

**This is a breaking change for existing journal users:**

- Journal location changes: `.docent/journal.md` → `docs/.journal/*.md`
- File structure changes: single file → multiple session files
- Resource URIs change: `docent://journal/current` behavior updated

**Mitigation:**

- Automatic migration on first use
- Old journal renamed (not deleted) for safety
- Clear upgrade documentation

### Migration Path

**For existing docent users:**

```bash
# Before (old structure)
.docent/journal.md          # All entries

# After (new structure)
docs/.journal/
  2025-10-16-session-001.md  # Today's entries
  2025-10-15-session-001.md  # Yesterday's entries
  ...

.docent/journal.md.migrated  # Backup of old journal
```

**Migration happens automatically:**

1. User calls capture-work or resume-work
2. Docent detects `.docent/journal.md` exists
3. Runs migration: parses entries, creates session files
4. Renames old journal to `.migrated` suffix
5. Continues with new structure

**Manual migration (if needed):**

```bash
# Run migration tool
docent migrate-journal

# Or manually:
mkdir -p docs/.journal
mv .docent/journal.md docs/.journal/2025-10-16-session-001.md
```

### Rollout Plan

**Phase 1: Implementation (3-5 days)**

- Implement session detection logic
- Update capture-work and resume-work tools
- Create migration function
- Update resource URIs
- Add list-sessions tool
- Write unit tests

**Phase 2: Testing (2-3 days)**

- Integration tests
- Manual dogfooding with docent project
- Test worktree isolation
- Verify migration works

**Phase 3: Documentation (1-2 days)**

- Update README with new journal structure
- Document session management
- Explain gitignore reasoning
- Migration guide for existing users

**Phase 4: Release (0.5.0)**

- Bump minor version (breaking change)
- Publish with migration notes
- Update MCP server
- Monitor for issues

### Backward Compatibility

**Not backward compatible:**

- Old `.docent/journal.md` no longer used
- Must migrate to new structure
- Resource URIs behavior changes

**Safe migration:**

- Old journal renamed (not deleted)
- Migration idempotent (safe to re-run)
- Graceful handling of missing journals

## Documentation Plan

### User-Facing Documentation

1. **README: Journal Management**
   - Explain session-based structure
   - Show how sessions are created
   - Document gitignore recommendation
   - Explain worktree isolation benefits

2. **Guide: Working with Journals**
   - When sessions are created (time-based)
   - How to force new session
   - How to list sessions
   - How to clean up old sessions
   - Best practices

3. **Migration Guide**
   - How migration works
   - What changes
   - How to verify migration succeeded
   - Troubleshooting

### Internal Documentation

1. **Update RFC-0004**
   - Reference RFC-0006 for session architecture
   - Explain evolution from single file

2. **Update RFC-0005**
   - Update resource URI examples
   - Document `docent://journal/*` patterns
   - Show resume-work integration

3. **Architecture Docs**
   - Document session lifecycle
   - Explain worktree isolation
   - Show file structure

### Developer Documentation

1. **Session Management API**
   - How to create sessions programmatically
   - Session detection algorithms
   - Best practices for tools

2. **Testing Journals**
   - Test fixtures for sessions
   - Mocking session detection
   - Integration test patterns

## Open Questions

1. **Session Time Threshold**
   - Is 4 hours the right threshold for new sessions?
   - Should this be configurable?
   - **Recommendation:** Start with 4h, make configurable if needed

2. **Session Archival**
   - Should we auto-archive sessions older than N days?
   - Should we provide archive command?
   - **Recommendation:** Defer to future (manual cleanup for now)

3. **Session Summaries**
   - Should old sessions be auto-summarized?
   - Would summary + recent sessions be better than N recent sessions?
   - **Recommendation:** Defer to future (consider if context grows too large)

4. **Cross-Session Links**
   - Should sessions link to previous/next sessions?
   - Should entries reference session IDs?
   - **Recommendation:** Not needed for v1

5. **Session Metadata**
   - Should we track worktree path, branch, git HEAD?
   - Is this useful for resume-work?
   - **Recommendation:** Optional enhancement (start without)

## Future Possibilities

Once session-based architecture is established:

1. **Session Search**
   - Full-text search across all sessions
   - Filter by date range, keywords

2. **Session Analytics**
   - Track session duration
   - Identify productive patterns
   - Visualize work rhythm

3. **Session Summaries**
   - Auto-generate session summaries
   - Compress old sessions (summary + key discoveries)

4. **Session Templates**
   - Pre-defined session structures
   - Project-specific journal formats

5. **Cross-Worktree View**
   - See sessions across all worktrees
   - Unified journal view (optional)

6. **Session Export**
   - Export sessions to formal docs
   - Convert session to ADR/RFC
   - Promote discoveries to documentation

## References

### Related Docent Documentation

- [RFC-0004: Work Artifact Capture](./rfc-0004-work-artifact-capture-and-surfacing.md) - Original journal design
- [RFC-0005: Enhanced MCP Architecture](./rfc-0005-enhanced-mcp-architecture.md) - Resource URIs integration
- [ADR-0004: MCP-Only Architecture](../adr/adr-0004-mcp-only-architecture.md) - Overall architecture

### Inspirations

- [Git Worktrees](https://git-scm.com/docs/git-worktree) - Parallel workspace model
- [Lab Notebooks](https://en.wikipedia.org/wiki/Lab_notebook) - Session-based research logs
- [tmux Sessions](https://github.com/tmux/tmux/wiki) - Session isolation model

---

**This RFC proposes session-based journals with timestamp-based filenames in `docs/.journal/`, providing worktree isolation, scalability, and natural session boundaries for docent's work artifact capture system.**
