import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import {loadConfig} from '../../core/config.js'
import {createRegistry, type LoadFailure} from '../../core/resource-registry.js'
import {createSkillRegistry} from '../../core/skill-registry'
import type {Skill} from '../../core/skill'
import {join, basename} from 'path'
import {readFileSync} from 'fs'

// Read version from package.json
function getVersion(): string {
  try {
    // In compiled code, this will be lib/mcp/tools/start.js
    // So package.json is at ../../../package.json
    const packageJsonPath = join(__dirname, '../../../package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    return packageJson.version
  } catch {
    return 'unknown'
  }
}

export const startToolDefinition: Tool = {
  name: 'start',
  description:
    'Initialize docent session - lists available templates, runbooks, and commands. Run this at the start of every session.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Project path (defaults to current directory)',
      },
    },
  },
}

interface StartArgs {
  path?: string
}

export async function handleStartTool(args: StartArgs): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()

  try {
    // Load configuration
    const config = loadConfig(projectPath)

    // Create and load resource registry
    const userTemplatesPath = join(config.docsRoot, 'templates')
    const userRunbooksPath = join(config.docsRoot, 'runbooks')
    const registry = createRegistry(userTemplatesPath, userRunbooksPath)
    await registry.load()

    // Get resources
    const templates = registry.getTemplates()
    const runbooks = registry.getRunbooks()
    const failures = registry.getLoadFailures()

    // Load skills if patterns configured
    let skillRegistry: ReturnType<typeof createSkillRegistry> | null = null
    if (config.skills.length > 0) {
      const bundledSkillsPath = join(__dirname, '../../../src/skills')
      const localSkillsPath = join(config.docsRoot, 'skills')
      skillRegistry = createSkillRegistry(bundledSkillsPath, localSkillsPath)
      skillRegistry.load(config.skills)
    }

    // Build output
    const output = buildStartOutput(templates, runbooks, config, failures, skillRegistry)

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
          text: `Failed to initialize docent session: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

function buildStartOutput(
  templates: any[],
  runbooks: any[],
  config: any,
  failures: LoadFailure[],
  skillRegistry: ReturnType<typeof createSkillRegistry> | null,
): string {
  const version = getVersion()
  let output = `# Docent Session Initialized\n\n`
  output += `**Version:** ${version}\n\n`

  // Overview
  output += '## Available Commands\n\n'
  output += '- `/docent:start` - Initialize session (you just ran this)\n'
  output += '- `/docent:ask [query]` - Search all documentation to answer questions\n'
  output += '- `/docent:act [directive]` - Execute runbooks (bootstrap, health checks, etc.)\n'
  output += '- `/docent:tell [statement]` - Write/update documentation\n\n'

  // Templates
  output += '## Available Templates\n\n'
  if (templates.length === 0) {
    output += '_No templates available._\n\n'
  } else {
    output += 'Use `/docent:act create [template-name]` to create files from these templates:\n\n'
    for (const template of templates) {
      const source = template.source === 'user' ? ' (custom)' : ''
      output += `- **${template.metadata.name}**${source}: ${template.metadata.description}\n`
    }
    output += '\n'
  }

  // Runbooks
  output += '## Available Runbooks\n\n'
  if (runbooks.length === 0) {
    output += '_No runbooks available._\n\n'
  } else {
    output += 'Use `/docent:act [runbook-name]` to execute these procedures:\n\n'
    for (const runbook of runbooks) {
      const source = runbook.source === 'user' ? ' (custom)' : ''
      output += `- **${runbook.metadata.name}**${source}: ${runbook.metadata.description}\n`
    }
    output += '\n'
  }

  // Skills (if enabled)
  if (skillRegistry) {
    const groups = skillRegistry.getGroups()
    output += '## Available Skills\n\n'

    if (groups.length === 0) {
      output += '_No skills loaded. Check your skills patterns in config.yaml_\n\n'
    } else {
      output += 'Use `/docent:ask [query]` to discover skills by description:\n\n'

      for (const group of groups) {
        const skills = skillRegistry.getByGroup(group)
        output += `### ${group}\n\n`
        for (const skill of skills) {
          const source = skill.source === 'local' ? ' (custom)' : ''
          output += `- **${skill.metadata.name}**${source}: ${skill.metadata.description}\n`
        }
        output += '\n'
      }
    }
  }

  // Configuration
  output += '## Configuration\n\n'
  output += `- **Root:** ${config.root}\n`
  output += `- **Search paths:** ${config.searchPaths.map((p: string) => p.replace(process.cwd(), '.')).join(', ')}\n`
  if (Object.keys(config.projects).length > 0) {
    output += `- **Projects:** ${Object.keys(config.projects).join(', ')}\n`
  }
  output += '\n'

  // Getting Started
  output += '## Getting Started\n\n'
  output += '1. **Ask a question:** `/docent:ask how do I configure the build process?`\n'
  output += '2. **Run a health check:** `/docent:act health check`\n'
  output += '3. **Create documentation:** `/docent:tell I learned that X does Y`\n'
  output += '4. **Bootstrap project:** `/docent:act bootstrap` (if not already initialized)\n\n'

  // Proactive Capture (for agents)
  output += '## Proactive Capture: Keep Documentation Current\n\n'
  output += '**IMPORTANT for AI agents:** Use `/docent:tell` frequently throughout your work to maintain an up-to-date knowledge base.\n\n'
  output += '**When to capture:**\n\n'
  output += '- ✅ **After completing work** - Document what you accomplished\n'
  output += '- ✅ **When making decisions** - Record architectural or implementation choices\n'
  output += '- ✅ **Upon discovering insights** - Capture important learnings or findings\n'
  output += '- ✅ **When encountering blockers** - Note problems, questions, or uncertainties\n'
  output += '- ✅ **At natural breakpoints** - Summarize progress when switching context\n\n'
  output += '**Examples:**\n'
  output += '- `/docent:tell I completed the authentication module with JWT tokens`\n'
  output += '- `/docent:tell I decided to use Postgres over MongoDB because we need transactions`\n'
  output += '- `/docent:tell I learned that Redis requires AOF persistence for durability`\n'
  output += '- `/docent:tell I\'m blocked on the API integration - need OAuth credentials`\n'
  output += '- `/docent:tell Session summary: Fixed 3 bugs, refactored user service, all tests passing`\n\n'
  output += '**Why this matters:** Frequent capture ensures the next agent (or session) has accurate context about recent work, decisions, and discoveries.\n\n'
  output += 'For detailed guidance, run: `/docent:act capture-work-guidance`\n\n'

  // Tips
  output += '## Tips\n\n'
  output += '- Use natural language with `/docent:act` and `/docent:tell` - the system understands intent\n'
  output += '- `/docent:ask` searches ALL documentation in configured search paths\n'
  output += '- Custom templates and runbooks in `.docent/` override bundled ones\n'
  output += '- Edit `.docent/config.yaml` to customize search paths and projects\n\n'

  // Warnings for load failures (only show user resources)
  const userFailures = failures.filter(f => f.source === 'user')
  if (userFailures.length > 0) {
    output += '---\n\n'
    output += '## ⚠️ Action Required: Fix Custom Resources\n\n'
    output += `**${userFailures.length} custom ${userFailures.length === 1 ? 'resource' : 'resources'} failed to load** due to missing or incomplete frontmatter.\n\n`

    // Group by reason
    const missingFrontmatter = userFailures.filter(f => f.reason === 'missing-frontmatter')
    const missingFields = userFailures.filter(f => f.reason === 'missing-fields')

    if (missingFrontmatter.length > 0) {
      output += '### Missing Frontmatter\n\n'
      output += 'These files need YAML frontmatter added:\n\n'
      for (const failure of missingFrontmatter) {
        const fileName = basename(failure.filePath)
        output += `- \`${fileName}\` - Add frontmatter with \`name\` and \`description\` fields\n`
      }
      output += '\n'
    }

    if (missingFields.length > 0) {
      output += '### Missing Required Fields\n\n'
      output += 'These files have frontmatter but are missing \`name\` or \`description\`:\n\n'
      for (const failure of missingFields) {
        const fileName = basename(failure.filePath)
        output += `- \`${fileName}\` - Ensure frontmatter includes both \`name\` and \`description\`\n`
      }
      output += '\n'
    }

    output += '**How to fix:**\n\n'
    output += '1. Add YAML frontmatter to each file:\n'
    output += '   ```yaml\n'
    output += '   ---\n'
    output += '   name: your-resource-name\n'
    output += '   description: Brief description of what this does\n'
    output += '   type: runbook  # or "template"\n'
    output += '   ---\n'
    output += '   ```\n\n'
    output += '2. See `.docent/guides/contributing.md` for complete documentation and examples\n\n'
    output += '3. Re-run `/docent:start` after fixing to verify\n\n'
  }

  output += '---\n\n'
  output += `_Docent ${version} - Documentation Intelligence for AI Agents_\n`

  return output
}
