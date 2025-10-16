import {WorkflowContextGatherer} from '../workflows/context-gatherer.js'

export const resumeWorkToolDefinition = {
  name: 'resume-work',
  description:
    'Gather context to resume work after interruption: journal entries, git status, recent commits, and TODOs. Returns structured context for session recovery.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
}

export async function handleResumeWorkTool(): Promise<{content: Array<{type: 'text'; text: string}>}> {
  const gatherer = new WorkflowContextGatherer()
  const context = await gatherer.gatherResumeWorkContext()

  const output = `# Resume Work Context

## Work Journal

${context.journal}

---

## Recent Commits (last 10)

\`\`\`
${context.commits}
\`\`\`

---

## Git Status

\`\`\`
${context.gitStatus}
\`\`\`

---

## TODOs Found

\`\`\`
${context.todos}
\`\`\`

---

## Next Steps

Review the context above and:
1. Identify what was being worked on
2. Check for uncommitted changes or pending work
3. Review recent discoveries and decisions in the journal
4. Prioritize next actions based on the context
`

  return {
    content: [
      {
        type: 'text',
        text: output,
      },
    ],
  }
}
