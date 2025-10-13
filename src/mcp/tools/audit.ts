import {analyzeProject} from '../../lib/detector.js'
import {auditDocumentation} from '../../lib/auditor.js'

export const auditToolDefinition = {
  name: 'audit',
  description: 'Perform heuristic-based documentation audit (fast, for CI/CD). For deeper quality analysis, use audit-quality instead.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to project directory',
      },
      docsDir: {
        type: 'string',
        description: 'Documentation directory name (default: "docs")',
        default: 'docs',
      },
    },
    required: ['path'],
  },
} as const

export async function handleAuditTool(args: {path: string; docsDir?: string}) {
  const docsDir = args.docsDir || 'docs'

  const analysis = await analyzeProject(args.path)
  const result = await auditDocumentation(args.path, docsDir, analysis)

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  }
}
