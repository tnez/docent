import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import {loadConfig} from '../../core/config.js'
import {createRegistry} from '../../core/resource-registry.js'
import {execSync} from 'child_process'
import {existsSync} from 'fs'
import {join, relative} from 'path'

export const tellToolDefinition: Tool = {
  name: 'tell',
  description:
    'Write or update documentation. Returns edit instructions for the agent to execute. Use natural language to describe what should be documented (e.g., "I learned that X does Y", "document the API endpoint for users", "note that the build requires Node 18+").',
  inputSchema: {
    type: 'object',
    properties: {
      statement: {
        type: 'string',
        description:
          'Natural language statement about what to document (e.g., "I learned that the cache invalidates after 5 minutes", "the API rate limit is 100 requests per hour")',
      },
      path: {
        type: 'string',
        description: 'Project path (defaults to current directory)',
      },
    },
    required: ['statement'],
  },
}

interface TellArgs {
  statement: string
  path?: string
}

interface DocumentationLocation {
  file: string
  section?: string
  reason: string
  createNew: boolean
}

export async function handleTellTool(args: TellArgs): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()

  try {
    // Load configuration
    const config = loadConfig(projectPath)

    // Create and load resource registry (for template awareness)
    const userTemplatesPath = join(config.docsRoot, 'templates')
    const userRunbooksPath = join(config.docsRoot, 'runbooks')
    const registry = createRegistry(userTemplatesPath, userRunbooksPath)
    await registry.load()

    // Analyze the statement to understand intent
    const intent = analyzeIntent(args.statement)

    // Find appropriate documentation location
    const location = await findDocumentationLocation(intent, config, projectPath, registry)

    // Build response with edit instructions
    const output = buildTellResponse(args.statement, intent, location, config, projectPath)

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
          text: `Failed to process documentation directive: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

interface Intent {
  type: 'journal' | 'note' | 'decision' | 'session' | 'project' | 'general'
  keywords: string[]
  isLearning: boolean
  isDecision: boolean
  isTemporary: boolean
  suggestedTemplate?: string
}

/**
 * Analyze the statement to understand what type of documentation is needed
 * This is a simple heuristic-based approach for MVP
 */
function analyzeIntent(statement: string): Intent {
  const lower = statement.toLowerCase()

  // Extract meaningful keywords
  const keywords = lower
    .replace(/[?.,!;:]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3)

  // Pattern matching for intent classification
  const isLearning = /\b(learned|discovered|found|realized|noticed)\b/.test(lower)
  const isDecision = /\b(decided|chose|selected|going with|using)\b/.test(lower)
  const isTemporary = /\b(note|reminder|todo|temp|temporary)\b/.test(lower)
  const isSession = /\b(session|working on|completed|progress)\b/.test(lower)
  const isProject = /\b(project|milestone|goal|roadmap)\b/.test(lower)

  // Classify type based on patterns
  let type: Intent['type'] = 'general'
  let suggestedTemplate: string | undefined

  if (isSession) {
    type = 'session'
    suggestedTemplate = 'agent-session'
  } else if (isDecision) {
    type = 'decision'
    suggestedTemplate = 'adr'
  } else if (isProject) {
    type = 'project'
  } else if (isLearning || isTemporary) {
    type = 'note'
  } else {
    type = 'general'
  }

  return {
    type,
    keywords,
    isLearning,
    isDecision,
    isTemporary,
    suggestedTemplate,
  }
}

/**
 * Find the most appropriate location to document this information
 */
async function findDocumentationLocation(
  intent: Intent,
  config: any,
  projectPath: string,
  registry: any,
): Promise<DocumentationLocation> {
  const docsRoot = join(projectPath, config.docsRoot)

  // Based on intent type, suggest location
  switch (intent.type) {
    case 'session':
      return {
        file: join(config.docsRoot, 'sessions', `session-${getTimestamp()}.md`),
        reason: 'Session notes belong in .docent/sessions/',
        createNew: true,
      }

    case 'decision':
      return {
        file: join(config.docsRoot, 'decisions', `adr-${getTimestamp()}.md`),
        reason: 'Architecture decisions should be documented as ADRs in .docent/decisions/',
        createNew: true,
      }

    case 'project':
      // Look for existing project tracking docs
      const projectFiles = await findMatchingFiles('project', config.docsRoot, projectPath)
      if (projectFiles.length > 0) {
        return {
          file: projectFiles[0],
          reason: 'Found existing project documentation',
          createNew: false,
        }
      }
      return {
        file: join(config.docsRoot, 'projects', 'current.md'),
        reason: 'Project tracking notes belong in .docent/projects/',
        createNew: true,
      }

    case 'note':
      // Temporary notes go in notes/
      return {
        file: join(config.docsRoot, 'notes', `note-${getTimestamp()}.md`),
        reason: 'Quick notes and learnings belong in .docent/notes/',
        createNew: true,
      }

    case 'general':
    default:
      // Search for related existing documentation
      const matches = await searchRelatedDocumentation(intent.keywords, config.searchPaths, projectPath)

      if (matches.length > 0) {
        return {
          file: matches[0].file,
          section: matches[0].section,
          reason: `Found related documentation discussing: ${matches[0].matchedTerms.join(', ')}`,
          createNew: false,
        }
      }

      // No match found, suggest creating in notes
      return {
        file: join(config.docsRoot, 'notes', `general-${getTimestamp()}.md`),
        reason: 'No existing documentation found. Creating new note in .docent/notes/',
        createNew: true,
      }
  }
}

/**
 * Find files matching a pattern in the docs root
 */
async function findMatchingFiles(pattern: string, docsRoot: string, projectPath: string): Promise<string[]> {
  const fullPath = join(projectPath, docsRoot)
  if (!existsSync(fullPath)) {
    return []
  }

  try {
    const output = execSync(`find ${fullPath} -type f -name "*${pattern}*.md" 2>/dev/null || true`, {
      encoding: 'utf-8',
    })

    return output
      .split('\n')
      .filter(Boolean)
      .map(f => relative(projectPath, f))
  } catch {
    return []
  }
}

interface RelatedDoc {
  file: string
  section?: string
  matchedTerms: string[]
}

/**
 * Search for existing documentation related to the keywords
 */
async function searchRelatedDocumentation(
  keywords: string[],
  searchPaths: string[],
  projectPath: string,
): Promise<RelatedDoc[]> {
  if (keywords.length === 0) {
    return []
  }

  const results: RelatedDoc[] = []
  const pattern = keywords.slice(0, 5).join('|') // Limit to top 5 keywords

  // Search existing docs
  const existingPaths = searchPaths.filter(p => existsSync(join(projectPath, p)))

  if (existingPaths.length === 0) {
    return []
  }

  const paths = existingPaths.map(p => join(projectPath, p)).join(' ')

  try {
    const output = execSync(`rg -i -l --type md '${pattern}' ${paths} 2>/dev/null || true`, {
      encoding: 'utf-8',
      cwd: projectPath,
    })

    const files = output.split('\n').filter(Boolean)

    for (const file of files.slice(0, 3)) {
      // Top 3 matches
      const relativePath = relative(projectPath, file)

      // Find which terms matched
      const matched: string[] = []
      for (const keyword of keywords) {
        try {
          const content = execSync(`rg -i '${keyword}' ${file} 2>/dev/null || true`, {
            encoding: 'utf-8',
          })
          if (content) {
            matched.push(keyword)
          }
        } catch {
          // Skip
        }
      }

      if (matched.length > 0) {
        results.push({
          file: relativePath,
          matchedTerms: matched,
        })
      }
    }
  } catch {
    // If search fails, return empty
  }

  return results
}

/**
 * Get timestamp for unique filenames
 */
function getTimestamp(): string {
  const now = new Date()
  return now.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * Build declarative response with edit instructions for agent
 */
function buildTellResponse(
  statement: string,
  intent: Intent,
  location: DocumentationLocation,
  config: any,
  projectPath: string,
): string {
  let output = `# Documentation Write Instructions\n\n`
  output += `**Statement:** "${statement}"\n`
  output += `**Intent:** ${intent.type} documentation\n`
  output += `**Action:** ${location.createNew ? 'Create new file' : 'Update existing file'}\n\n`

  output += `---\n\n`

  // Add execution guidance
  output += `## Edit Instructions\n\n`

  if (location.createNew) {
    output += `### Create New File\n\n`
    output += `**File Path:** \`${location.file}\`\n`
    output += `**Reason:** ${location.reason}\n\n`

    output += `**Steps to execute:**\n\n`
    output += `1. **Create the file** at the specified path\n`
    output += `2. **Add appropriate content** based on the statement\n`

    if (intent.suggestedTemplate) {
      output += `3. **Consider using template:** ${intent.suggestedTemplate}\n`
      output += `   - You can access template content via resource registry if needed\n`
    } else {
      output += `3. **Structure the content** appropriately (use markdown headers, sections)\n`
    }

    output += `4. **Include the information** from the statement\n`
    output += `5. **Add metadata** if appropriate (date, author, tags)\n\n`

    if (intent.suggestedTemplate) {
      output += `**Suggested Format:** Use the **${intent.suggestedTemplate}** template structure\n\n`
    } else {
      output += `**Suggested Format:**\n\n`
      output += '```markdown\n'
      output += `# ${intent.type.charAt(0).toUpperCase() + intent.type.slice(1)}\n\n`
      output += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`
      output += `${statement}\n\n`
      output += `## Details\n\n`
      output += `[Add relevant details here]\n`
      output += '```\n\n'
    }
  } else {
    output += `### Update Existing File\n\n`
    output += `**File Path:** \`${location.file}\`\n`
    output += `**Reason:** ${location.reason}\n\n`

    if (location.section) {
      output += `**Suggested Section:** ${location.section}\n\n`
    }

    output += `**Steps to execute:**\n\n`
    output += `1. **Read the existing file** to understand its structure\n`
    output += `2. **Find the appropriate section** to add this information\n`

    if (location.section) {
      output += `   - Look for section: "${location.section}"\n`
    } else {
      output += `   - Or create a new section if needed\n`
    }

    output += `3. **Add the information** in a way that fits the existing format\n`
    output += `4. **Maintain consistency** with the file's style and structure\n`
    output += `5. **Update any dates** or metadata if present\n\n`

    output += `**Integration Approach:**\n`
    output += `- Read the file first to understand context\n`
    output += `- Add information where it fits best\n`
    output += `- Use existing section structure\n`
    output += `- Preserve existing formatting style\n\n`
  }

  output += `---\n\n`

  output += `## Execution Responsibility\n\n`
  output += `You are responsible for:\n\n`
  output += `- **Creating or editing the file** using your available tools (Write, Edit)\n`
  output += `- **Structuring the content** appropriately\n`
  output += `- **Including all relevant information** from the statement\n`
  output += `- **Verifying the file was created/updated** successfully\n`
  output += `- **Reporting completion** to the user\n\n`

  output += `**Available Tools:**\n`
  output += `- Use **Write** tool to create new files\n`
  output += `- Use **Edit** tool to update existing files\n`
  output += `- Use **Read** tool to examine existing content first\n\n`

  output += `---\n\n`
  output += `_You now have the edit instructions. Please proceed with creating/updating the documentation._\n`

  return output
}
