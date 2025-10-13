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
          'architecture',
          'api',
          'onboarding',
          'testing',
          'runbook',
          'standards',
          'spec',
        ],
      },
    },
    required: ['type'],
  },
} as const

const TEMPLATE_FILES: Record<string, string> = {
  adr: 'adr-template.md',
  rfc: 'rfc-template.md',
  prd: 'prd-template.md',
  architecture: 'architecture-overview-template.md',
  api: 'api-documentation-template.md',
  onboarding: 'onboarding-template.md',
  testing: 'testing-template.md',
  runbook: 'runbook-template.md',
  standards: 'standards-template.md',
  spec: 'spec-template.md',
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
