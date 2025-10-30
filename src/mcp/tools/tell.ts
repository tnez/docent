import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import type {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {loadConfig} from '../../core/config.js'
import {loadAllTemplates, type TemplateMetadata} from '../../core/template-classifier.js'
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

export async function handleTellTool(
  args: TellArgs,
  server: Server,
): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()

  try {
    // Load configuration
    const config = loadConfig(projectPath)

    // Load all available templates (bundled + user-defined)
    const packagePath = join(__dirname, '..', '..', '..')
    const bundledTemplatesPath = join(packagePath, 'templates')
    const userTemplatesPath = join(config.docsRoot, 'templates')
    const templates = await loadAllTemplates(bundledTemplatesPath, userTemplatesPath)

    // Build response that asks agent to classify and document
    const output = buildAgentClassificationResponse(args.statement, templates, config, projectPath)

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
 * Find the most appropriate location to document this information based on template
 */
async function findDocumentationLocation(
  template: TemplateMetadata,
  config: any,
  projectPath: string,
): Promise<DocumentationLocation> {
  // Map template names to directory locations
  const templateLocationMap: Record<string, {dir: string; prefix: string}> = {
    'agent-session': {dir: 'journals', prefix: 'session'},
    'journal-entry': {dir: 'journals', prefix: 'journal'},
    adr: {dir: 'decisions', prefix: 'adr'},
    rfc: {dir: 'rfcs', prefix: 'rfc'},
    prd: {dir: 'prds', prefix: 'prd'},
    runbook: {dir: 'runbooks', prefix: 'runbook'},
    'meeting-notes': {dir: 'meetings', prefix: 'meeting'},
    'todo-list': {dir: 'todos', prefix: 'todo'},
    domain: {dir: 'domains', prefix: 'domain'},
  }

  const locationInfo = templateLocationMap[template.name] || {dir: 'notes', prefix: 'note'}
  const timestamp = getTimestamp()
  const filename = `${timestamp}-${locationInfo.prefix}-001.md`
  const filePath = join(config.docsRoot, locationInfo.dir, filename)

  return {
    file: filePath,
    reason: `Using ${template.name} template - ${template.description}`,
    createNew: true,
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
 * Build response that asks agent to classify statement and create documentation
 */
function buildAgentClassificationResponse(
  statement: string,
  templates: TemplateMetadata[],
  config: any,
  projectPath: string,
): string {
  // Filter templates that have use_when guidance
  const classifiableTemplates = templates.filter((t) => t.use_when && t.examples)

  let output = `# Documentation Classification and Creation\n\n`
  output += `**Statement to document:** "${statement}"\n\n`
  output += `---\n\n`

  output += `## Step 1: Classify the Statement\n\n`
  output += `Analyze the statement and determine which template best fits.\n\n`

  output += `### Available Templates:\n\n`

  for (const template of classifiableTemplates) {
    const directory = template.directory || 'notes'
    const prefix = template.filename_prefix || template.name
    const examples = Array.isArray(template.examples) ? template.examples : []

    output += `#### **${template.name}**\n\n`
    output += `- **Description:** ${template.description}\n`
    output += `- **Location:** \`.docent/${directory}/\`\n`
    output += `- **When to use:**\n`
    if (template.use_when) {
      const lines = template.use_when.trim().split('\n')
      for (const line of lines) {
        output += `  ${line}\n`
      }
    }
    if (examples.length > 0) {
      output += `- **Examples:**\n`
      for (const example of examples.slice(0, 3)) {
        output += `  - ${example}\n`
      }
    }
    output += `\n`
  }

  output += `---\n\n`

  output += `## Step 2: Create the Documentation\n\n`
  output += `Once you've determined the best template:\n\n`

  output += `1. **Access the template:**\n`
  output += `   - Use MCP resource: \`docent://template/<template-name>\`\n`
  output += `   - Example: \`docent://template/agent-session\`\n\n`

  output += `2. **Determine the file path:**\n`
  output += `   - Use the directory mapping above\n`
  output += `   - Create filename: \`YYYY-MM-DD-<prefix>-001.md\`\n`
  output += `   - Example: \`.docent/sessions/2025-10-29-session-001.md\`\n\n`

  output += `3. **Create the file:**\n`
  output += `   - Fill in the template with information from the statement\n`
  output += `   - Adapt content to match the specific context\n`
  output += `   - Include all relevant details from the statement\n\n`

  output += `4. **Verify:**\n`
  output += `   - Ensure file was created successfully\n`
  output += `   - Confirm content accurately captures the statement\n\n`

  output += `---\n\n`

  output += `## Your Task\n\n`
  output += `1. Read the statement carefully\n`
  output += `2. Review all available templates and their criteria\n`
  output += `3. Choose the best matching template based on:\n`
  output += `   - Language used (action verbs, decision words, learning words)\n`
  output += `   - Structure and intent\n`
  output += `   - Time-bound vs timeless information\n`
  output += `4. Retrieve the template via MCP resource\n`
  output += `5. Create the documentation file at the appropriate location\n`
  output += `6. Report completion with the chosen template and file path\n\n`

  output += `**Available Tools:**\n`
  output += `- MCP Resource access for templates\n`
  output += `- Write tool to create files\n`
  output += `- Read tool if needed\n\n`

  output += `---\n\n`
  output += `_Proceed with classification and documentation creation._\n`

  return output
}

