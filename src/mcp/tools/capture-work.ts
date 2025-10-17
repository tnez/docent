import * as fs from 'fs/promises'
import {SessionManager} from '../../lib/journal/session-manager.js'

export const captureWorkToolDefinition = {
  name: 'capture-work',
  description:
    'Append a work session entry to the journal. Use this to capture key discoveries, rationale, and partially explored ideas as you work. Rich journal entries enable effective session recovery.',
  inputSchema: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description: 'Brief summary of work completed (1-2 sentences)',
      },
      discoveries: {
        type: 'array',
        description: 'Key discoveries, learnings, or insights (not just what was done, but what was learned)',
        items: {
          type: 'string',
        },
      },
      next_steps: {
        type: 'array',
        description: 'What should be done next (prioritized)',
        items: {
          type: 'string',
        },
      },
      questions: {
        type: 'array',
        description: 'Open questions or partially explored ideas that need follow-up',
        items: {
          type: 'string',
        },
      },
      new_session: {
        type: 'boolean',
        description: 'Force start a new session (default: auto-detect based on time gap)',
      },
    },
    required: ['summary'],
  },
} as const

export async function handleCaptureWorkTool(args: {
  summary: string
  discoveries?: string[]
  next_steps?: string[]
  questions?: string[]
  new_session?: boolean
}) {
  const {summary, discoveries, next_steps, questions, new_session = false} = args

  // Initialize session manager
  const sessionManager = new SessionManager()

  // Run migration if needed (checks for old .docent/journal.md)
  await migrateOldJournal(sessionManager)

  // Get current session file (may create new session)
  const sessionFile = await sessionManager.getCurrentSessionFile(new_session)

  // Format entry
  const timestamp = new Date().toISOString()
  const entry = formatJournalEntry({
    timestamp,
    summary,
    discoveries,
    next_steps,
    questions,
  })

  // Append entry to session file
  await fs.appendFile(sessionFile, entry, 'utf-8')

  // Extract session info for response
  const sessions = await sessionManager.listSessions()
  const currentSession = sessions[sessions.length - 1]

  return {
    content: [
      {
        type: 'text' as const,
        text: `✓ Journal entry added to ${currentSession.file}\n\n${entry}`,
      },
    ],
  }
}

/**
 * Migrate old .docent/journal.md to new session-based structure
 */
async function migrateOldJournal(sessionManager: SessionManager): Promise<void> {
  const basePath = process.cwd()
  const oldJournalPath = `${basePath}/.docent/journal.md`

  try {
    await fs.access(oldJournalPath)
  } catch {
    // Old journal doesn't exist, nothing to migrate
    return
  }

  // Read old journal
  const content = await fs.readFile(oldJournalPath, 'utf-8')

  // Get current session file (creates new session if needed)
  const sessionFile = await sessionManager.getCurrentSessionFile()

  // Append old content to new session (with migration note)
  const migrationNote = `## Migration from .docent/journal.md

The following content was migrated from the old journal structure:

---

`

  await fs.appendFile(sessionFile, migrationNote + content, 'utf-8')

  // Rename old journal for safety (don't delete)
  await fs.rename(oldJournalPath, `${oldJournalPath}.migrated`)

  // Migration complete - old journal safely preserved as .migrated
}

function formatJournalEntry(data: {
  timestamp: string
  summary: string
  discoveries?: string[]
  next_steps?: string[]
  questions?: string[]
}): string {
  const {timestamp, summary, discoveries, next_steps, questions} = data

  let entry = `## ${timestamp}\n\n**Summary:** ${summary}\n`

  if (discoveries && discoveries.length > 0) {
    entry += '\n**Key Discoveries:**\n'
    discoveries.forEach((d) => {
      entry += `- ${d}\n`
    })
  }

  if (next_steps && next_steps.length > 0) {
    entry += '\n**Next Steps:**\n'
    next_steps.forEach((s) => {
      entry += `- ${s}\n`
    })
  }

  if (questions && questions.length > 0) {
    entry += '\n**Open Questions:**\n'
    questions.forEach((q) => {
      entry += `- ${q}\n`
    })
  }

  entry += '\n---\n\n'

  return entry
}
