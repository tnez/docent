import * as fs from 'fs/promises'
import * as path from 'path'

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
    },
    required: ['summary'],
  },
} as const

export async function handleCaptureWorkTool(args: {
  summary: string
  discoveries?: string[]
  next_steps?: string[]
  questions?: string[]
}) {
  const {summary, discoveries, next_steps, questions} = args

  // Get journal path
  const basePath = process.cwd()
  const docketDir = path.join(basePath, '.docent')
  const journalPath = path.join(docketDir, 'journal.md')

  // Ensure .docent directory exists
  await fs.mkdir(docketDir, {recursive: true})

  // Format entry
  const timestamp = new Date().toISOString()
  const entry = formatJournalEntry({
    timestamp,
    summary,
    discoveries,
    next_steps,
    questions,
  })

  // Check if journal exists
  let journalExists = false
  try {
    await fs.access(journalPath)
    journalExists = true
  } catch {
    // Journal doesn't exist yet
  }

  // If journal doesn't exist, create with header
  if (!journalExists) {
    const header = `# Work Journal

This journal captures session context, key discoveries, and next steps to enable effective work continuation.

---

`
    await fs.writeFile(journalPath, header, 'utf-8')
  }

  // Append entry
  await fs.appendFile(journalPath, entry, 'utf-8')

  return {
    content: [
      {
        type: 'text' as const,
        text: `✓ Journal entry added to .docent/journal.md\n\n${entry}`,
      },
    ],
  }
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
