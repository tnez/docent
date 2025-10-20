import * as fs from 'fs/promises'
import * as path from 'path'
import {gatherIssueContext} from '../../lib/issue-context.js'
import {createIssue} from '../../lib/github-cli.js'

export const fileIssueToolDefinition = {
  name: 'file-issue',
  description:
    'File an issue in the docent GitHub repository. Requires gh CLI to be installed and authenticated (gh auth login).',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Issue title (required)',
      },
      type: {
        type: 'string',
        enum: ['bug', 'feature', 'question', 'documentation'],
        description: 'Type of issue',
      },
      description: {
        type: 'string',
        description: 'Description or question',
      },
      reproductionSteps: {
        type: 'string',
        description: 'Steps to reproduce (for bugs)',
      },
      expectedBehavior: {
        type: 'string',
        description: 'Expected behavior (for bugs)',
      },
      actualBehavior: {
        type: 'string',
        description: 'Actual behavior (for bugs)',
      },
      useCase: {
        type: 'string',
        description: 'Use case or motivation (for features)',
      },
      suggestion: {
        type: 'string',
        description: 'Suggested improvement (for documentation)',
      },
    },
    required: ['title', 'type', 'description'],
  },
} as const

const LABEL_MAP: Record<string, string[]> = {
  bug: ['bug'],
  feature: ['enhancement'],
  question: ['question'],
  documentation: ['documentation'],
}

export async function handleFileIssueTool(args: {
  title: string
  type: 'bug' | 'feature' | 'question' | 'documentation'
  description: string
  reproductionSteps?: string
  expectedBehavior?: string
  actualBehavior?: string
  useCase?: string
  suggestion?: string
}) {
  const {title, type, description, reproductionSteps, expectedBehavior, actualBehavior, useCase, suggestion} = args

  try {
    // Gather system context
    const context = await gatherIssueContext()

    // Load appropriate template
    const templatePath = getTemplatePath(type)
    let body = await fs.readFile(templatePath, 'utf-8')

    // Replace placeholders based on issue type
    body = body.replace('[DOCENT_VERSION]', context.docentVersion)
    body = body.replace('[NODE_VERSION]', context.nodeVersion)
    body = body.replace('[OS]', context.os)
    body = body.replace('[ARCH]', context.arch)
    body = body.replace('[DESCRIPTION]', description)

    if (type === 'bug') {
      body = body.replace('[REPRODUCTION_STEPS]', reproductionSteps || 'N/A')
      body = body.replace('[EXPECTED_BEHAVIOR]', expectedBehavior || 'N/A')
      body = body.replace('[ACTUAL_BEHAVIOR]', actualBehavior || 'N/A')
    } else if (type === 'feature') {
      body = body.replace('[USE_CASE]', useCase || 'N/A')
    } else if (type === 'documentation') {
      body = body.replace('[SUGGESTION]', suggestion || 'N/A')
    }

    // Add docent config if available
    if (context.docentConfig) {
      body += `\n### Docent Configuration\n\n`
      body += `- **root:** ${context.docentConfig.root}\n`
      body += `- **sessionThresholdMinutes:** ${context.docentConfig.sessionThresholdMinutes}\n`
    }

    // Add project context if available
    if (context.projectType && context.projectLanguages) {
      body += `\n### Project Context\n\n`
      body += `- **Type:** ${context.projectType}\n`
      body += `- **Languages:** ${context.projectLanguages.join(', ')}\n`
    }

    // Get labels for this issue type
    const labels = LABEL_MAP[type] || []

    // Create the issue using gh CLI
    const issueUrl = await createIssue(title, body, labels)

    return {
      content: [
        {
          type: 'text' as const,
          text:
            `✓ Issue filed successfully!\n\n` +
            `${issueUrl}\n\n` +
            `---\n\n` +
            `**Context included:**\n` +
            `- docent v${context.docentVersion}\n` +
            `- Node ${context.nodeVersion}\n` +
            `- ${context.os} (${context.arch})` +
            (context.docentConfig ? `\n- docent config: root="${context.docentConfig.root}"` : '') +
            (context.projectType ? `\n- Project: ${context.projectType} (${context.projectLanguages?.join(', ')})` : ''),
        },
      ],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text' as const,
          text: `Failed to file issue: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
}

function getTemplatePath(type: string): string {
  // Templates are bundled in package's templates/github-issues/ directory
  const templateFile = `${type === 'bug' ? 'bug-report' : type === 'feature' ? 'feature-request' : type}.md`
  return path.join(__dirname, '..', '..', '..', 'templates', 'github-issues', templateFile)
}
