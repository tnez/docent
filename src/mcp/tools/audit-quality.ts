import {analyzeProject} from '../../lib/detector.js'
import {auditDocumentation} from '../../lib/auditor.js'
import {prepareAgentAuditContext} from '../../lib/agent-audit.js'
import {buildAuditPrompt} from '../../lib/prompt-builder.js'

export const auditQualityToolDefinition = {
  name: 'audit-quality',
  description: 'Generate agent-driven documentation quality assessment prompt with project context. Returns a structured prompt for the agent to analyze documentation quality semantically, going beyond simple heuristics.',
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

export async function handleAuditQualityTool(args: {path: string; docsDir?: string}) {
  const docsDir = args.docsDir || 'docs'

  // Gather all context
  const analysis = await analyzeProject(args.path)
  const audit = await auditDocumentation(args.path, docsDir, analysis)
  const context = await prepareAgentAuditContext(args.path, docsDir, analysis, audit)

  // Generate prompt
  const prompt = buildAuditPrompt(context)

  return {
    content: [
      {
        type: 'text' as const,
        text: prompt,
      },
    ],
  }
}
