import * as fs from 'fs'
import * as path from 'path'

export const getTemplateToolDefinition = {
  name: 'get-template',
  description: 'Get a documentation template by type',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        description: 'Template type',
        enum: [
          'adr',
          'rfc',
          'prd',
          'runbook',
          'agent-session',
          'domain',
          'journal-entry',
          'meeting-notes',
          'todo-list',
        ],
      },
    },
    required: ['type'],
  },
} as const

const TEMPLATE_FILES: Record<string, string> = {
  adr: 'adr.md',
  rfc: 'rfc.md',
  prd: 'prd.md',
  runbook: 'runbook.md',
  'agent-session': 'agent-session.md',
  domain: 'domain.md',
  'journal-entry': 'journal-entry.md',
  'meeting-notes': 'meeting-notes.md',
  'todo-list': 'todo-list.md',
}

export async function handleGetTemplateTool(args: {type: string}) {
  const templateFile = TEMPLATE_FILES[args.type]

  if (!templateFile) {
    throw new Error(`Unknown template type: ${args.type}`)
  }

  const templatesDir = path.join(__dirname, '..', '..', '..', 'templates')
  const templatePath = path.join(templatesDir, templateFile)

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templateFile}`)
  }

  const content = fs.readFileSync(templatePath, 'utf8')

  return {
    content: [
      {
        type: 'text' as const,
        text: content,
      },
    ],
  }
}
