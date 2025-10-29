import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import {loadConfig} from '../../lib/config.js'
import {createRegistry} from '../../lib/resource-registry.js'
import {join} from 'path'

export const actToolDefinition: Tool = {
  name: 'act',
  description:
    'Execute a runbook by returning its content and execution guidance. Takes the exact runbook name (e.g., "bootstrap", "health-check"). The agent is responsible for mapping user intent to runbook names using the list from /docent:start.',
  inputSchema: {
    type: 'object',
    properties: {
      directive: {
        type: 'string',
        description:
          'Exact runbook name to execute (e.g., "bootstrap", "health-check", "file-issue"). See /docent:start for available runbooks.',
      },
      path: {
        type: 'string',
        description: 'Project path (defaults to current directory)',
      },
    },
    required: ['directive'],
  },
}

interface ActArgs {
  directive: string
  path?: string
}

export async function handleActTool(args: ActArgs): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()

  try {
    // Load configuration
    const config = loadConfig(projectPath)

    // Create and load resource registry
    const userTemplatesPath = join(config.docsRoot, 'templates')
    const userRunbooksPath = join(config.docsRoot, 'runbooks')
    const registry = createRegistry(userTemplatesPath, userRunbooksPath)
    await registry.load()

    // Exact name lookup - agent is responsible for mapping user intent to runbook name
    const runbookName = args.directive.toLowerCase().trim()
    const runbook = registry.getRunbook(runbookName)

    if (!runbook) {
      return {
        content: [
          {
            type: 'text' as const,
            text: buildNoRunbookFoundResponse(runbookName, registry),
          },
        ],
      }
    }

    // Return runbook content with execution guidance (declarative)
    const output = buildRunbookResponse(runbook)

    return {
      content: [
        {
          type: 'text' as const,
          text: output,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Failed to load runbook: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

/**
 * Build response when runbook not found by exact name
 */
function buildNoRunbookFoundResponse(runbookName: string, registry: any): string {
  const runbooks = registry.getRunbooks()

  let output = `# Runbook Not Found\n\n`
  output += `No runbook found with name: **"${runbookName}"**\n\n`

  if (runbooks.length > 0) {
    output += `## Available Runbooks\n\n`
    output += `The following runbooks are available. Use the exact name:\n\n`
    for (const runbook of runbooks) {
      const source = runbook.source === 'user' ? ' (custom)' : ''
      output += `- **${runbook.metadata.name}**${source}: ${runbook.metadata.description}\n`
    }
    output += `\n`
    output += `**Usage:** \`/docent:act [exact-runbook-name]\`\n`
    output += `**Example:** \`/docent:act bootstrap\`\n\n`
  } else {
    output += `No runbooks are currently available.\n\n`
    output += `To add runbooks, create markdown files with YAML frontmatter in \`.docent/runbooks/\`.\n`
  }

  return output
}

/**
 * Build declarative response with runbook content and execution guidance for the agent
 */
function buildRunbookResponse(runbook: any): string {
  const source = runbook.source === 'user' ? 'custom' : 'bundled'

  let output = `# Runbook: ${runbook.metadata.name}\n\n`
  output += `**Source:** ${source}\n`
  output += `**Description:** ${runbook.metadata.description}\n\n`

  output += `---\n\n`

  // Add execution guidance for the AGENT (not the user)
  output += `## Instructions for Agent\n\n`
  output += `You are being provided with a runbook to execute. Your responsibilities:\n\n`
  output += `1. **Read through all steps** to understand the complete procedure\n`
  output += `2. **Check prerequisites** listed in the runbook before starting\n`
  output += `3. **Execute each step** using your available tools:\n`
  output += `   - Use **Bash** for shell commands\n`
  output += `   - Use **Write** to create new files\n`
  output += `   - Use **Edit** to modify existing files\n`
  output += `   - Use **Read** to examine files when needed\n`
  output += `4. **Handle decision points** as they arise (the runbook may have conditional steps)\n`
  output += `5. **Verify success** after each significant step\n`
  output += `6. **Report progress and results** to the user\n\n`

  output += `**Important:** Docent does NOT execute runbooks. You execute them. Docent only provides the instructions.\n\n`

  output += `---\n\n`

  // Include full runbook content
  output += `## Runbook Content\n\n`
  output += runbook.content
  output += `\n\n`

  output += `---\n\n`
  output += `_Proceed with executing the runbook steps above._\n`

  return output
}
