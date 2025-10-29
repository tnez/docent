import {analyzeProject} from '../../core/detector.js'

export const analyzeToolDefinition = {
  name: 'analyze',
  description: 'Analyze project structure, languages, frameworks, and build tools',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to project directory',
      },
    },
    required: ['path'],
  },
} as const

export async function handleAnalyzeTool(args: {path: string}) {
  const result = await analyzeProject(args.path)

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  }
}
