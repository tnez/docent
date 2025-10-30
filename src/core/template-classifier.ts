import {readFile, readdir} from 'fs/promises'
import {join} from 'path'
import {existsSync} from 'fs'

// NOTE: Server import and classifyStatement function are commented out below
// but preserved to document the preferred MCP sampling approach if/when supported

export interface TemplateMetadata {
  name: string
  description: string
  directory?: string
  filename_prefix?: string
  use_when?: string
  examples?: string[]
  [key: string]: any
}

/**
 * Parse YAML frontmatter from template file
 *
 * TODO(@tnez): Consider migrating to a standard YAML parser library (e.g., js-yaml)
 * for better edge case handling and maintenance. Current implementation handles
 * our limited YAML structure but may be fragile with complex user templates.
 */
function parseFrontmatter(content: string): TemplateMetadata | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return null
  }

  const yaml = match[1]
  const metadata: TemplateMetadata = {
    name: '',
    description: '',
  }

  // Simple YAML parser for our needs
  let currentKey: string | null = null
  let currentListKey: string | null = null
  let inMultiline = false
  let multilineContent: string[] = []

  const lines = yaml.split('\n')

  for (const line of lines) {
    // Handle multiline values (|)
    if (line.match(/^(\w+):\s*\|/)) {
      const key = line.match(/^(\w+):/)![1]
      currentKey = key
      inMultiline = true
      multilineContent = []
      continue
    }

    if (inMultiline) {
      // Check if we're still in multiline (indented)
      if (line.match(/^\s+/) && !line.match(/^(\w+):/)) {
        multilineContent.push(line.replace(/^\s{2}/, '')) // Remove 2-space indent
        continue
      } else {
        // End of multiline
        if (currentKey) {
          metadata[currentKey] = multilineContent.join('\n').trim()
        }
        inMultiline = false
        multilineContent = []
        currentKey = null
      }
    }

    // Handle list items
    if (line.match(/^\s+-\s+/)) {
      if (currentListKey) {
        const value = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '')
        if (!Array.isArray(metadata[currentListKey])) {
          metadata[currentListKey] = []
        }
        ;(metadata[currentListKey] as string[]).push(value)
      }
      continue
    }

    // Handle key: value pairs
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      const [, key, value] = kvMatch
      currentListKey = null

      if (key === 'examples') {
        currentListKey = 'examples'
        metadata.examples = []
        // Check for inline value
        if (value) {
          metadata.examples.push(value.replace(/^["']|["']$/g, ''))
        }
      } else if (value) {
        metadata[key] = value.replace(/^["']|["']$/g, '')
      }
    }
  }

  // Handle final multiline if exists
  if (inMultiline && currentKey) {
    metadata[currentKey] = multilineContent.join('\n').trim()
  }

  return metadata
}

/**
 * Load all templates from a directory
 */
export async function loadTemplatesFromDirectory(dirPath: string): Promise<TemplateMetadata[]> {
  if (!existsSync(dirPath)) {
    return []
  }

  const templates: TemplateMetadata[] = []

  try {
    const files = await readdir(dirPath)
    const mdFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of mdFiles) {
      const filePath = join(dirPath, file)
      const content = await readFile(filePath, 'utf-8')
      const metadata = parseFrontmatter(content)

      if (metadata && metadata.name) {
        templates.push(metadata)
      }
    }
  } catch (error) {
    console.error(`Failed to load templates from ${dirPath}:`, error)
  }

  return templates
}

/**
 * Load all available templates (bundled + user-defined)
 */
export async function loadAllTemplates(
  bundledPath: string,
  userPath?: string,
): Promise<TemplateMetadata[]> {
  const bundled = await loadTemplatesFromDirectory(bundledPath)
  const user = userPath ? await loadTemplatesFromDirectory(userPath) : []

  // User templates override bundled ones with same name
  const templateMap = new Map<string, TemplateMetadata>()

  for (const template of bundled) {
    templateMap.set(template.name, template)
  }

  for (const template of user) {
    templateMap.set(template.name, template)
  }

  return Array.from(templateMap.values())
}

/* COMMENTED OUT: Preferred MCP Sampling Approach
 *
 * This function represents the PREFERRED implementation for template classification
 * using MCP's sampling/createMessage capability. However, as of 2025-10-29, MCP sampling
 * is not widely supported in agentic CLIs like Claude Code.
 *
 * Current approach: We delegate classification to the agent by presenting structured
 * instructions via the /tell tool response (see tell.ts buildAgentClassificationResponse).
 *
 * IF/WHEN MCP sampling becomes available, uncomment and use this function instead.
 * Benefits of sampling approach:
 * - Server-side classification (faster, no user-visible classification step)
 * - Consistent classification logic
 * - Can be tested independently
 *
 * To re-enable:
 * 1. Uncomment this function
 * 2. Uncomment Server import at top of file
 * 3. Update tell.ts to call classifyStatement() and use result
 * 4. Remove buildAgentClassificationResponse() from tell.ts
 *
 * @tnez 2025-10-29

export async function classifyStatement(
  statement: string,
  templates: TemplateMetadata[],
  server: Server,
): Promise<{templateName: string; confidence: string; reason: string}> {
  // Filter templates that have use_when guidance
  const classifiableTemplates = templates.filter((t) => t.use_when && t.examples)

  if (classifiableTemplates.length === 0) {
    throw new Error('No templates with use_when guidance available')
  }

  // Build classification prompt
  const templateDescriptions = classifiableTemplates
    .map((t) => {
      const examples = Array.isArray(t.examples) ? t.examples.join('\n  - ') : ''
      return `**${t.name}**: ${t.description}
${t.use_when}

Examples:
  - ${examples}`
    })
    .join('\n\n---\n\n')

  const prompt = `You are classifying a documentation statement to determine which template best fits.

Available templates:

${templateDescriptions}

---

Statement to classify: "${statement}"

Analyze the statement and determine which template is the best match. Consider:
- The language used (action verbs, decision words, learning words, etc.)
- The structure and intent of the statement
- Whether it describes completed work, future plans, decisions, or learnings
- Time-bound vs timeless information

Respond in this exact format:
template_name|confidence|reason

Where:
- template_name: The exact name of the best matching template
- confidence: one of [high, medium, low]
- reason: A brief explanation (1 sentence) of why this template fits

Example response format:
agent-session|high|Statement describes completed debugging work with specific commit references`

  try {
    console.error('[Classifier] Attempting MCP sampling request...')
    const response = (await server.request(
      {
        method: 'sampling/createMessage',
        params: {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
          maxTokens: 150,
          modelPreferences: {
            hints: [{type: 'model', name: 'claude-3-haiku'}, {type: 'model', name: 'gpt-4o-mini'}],
            speedPriority: 0.7,
            intelligencePriority: 0.5,
            costPriority: 0.7,
          },
        },
      },
      {schema: {}} as any,
    )) as any

    console.error('[Classifier] MCP sampling succeeded!')
    console.error('[Classifier] Response:', JSON.stringify(response, null, 2))

    // Parse response
    const text = (response.content?.text?.trim() || '') as string
    console.error('[Classifier] Parsed text:', text)
    const parts = text.split('|').map((p: string) => p.trim())

    if (parts.length >= 3) {
      return {
        templateName: parts[0],
        confidence: parts[1],
        reason: parts[2],
      }
    }

    // Fallback parsing if format is not perfect
    const templateMatch = text.match(/^(\w+[-\w]*)/i)
    if (templateMatch) {
      return {
        templateName: templateMatch[1],
        confidence: 'medium',
        reason: text,
      }
    }

    throw new Error(`Unable to parse classification response: ${text}`)
  } catch (error) {
    // If sampling fails, fall back to a simple heuristic
    console.error('=== MCP SAMPLING FAILED ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('=== FALLING BACK TO HEURISTICS ===')

    // Simple fallback: look for keywords
    const lower = statement.toLowerCase()
    if (/\b(fixed|implemented|debugged|resolved|investigated)\b/.test(lower)) {
      return {templateName: 'agent-session', confidence: 'low', reason: 'Fallback heuristic'}
    }
    if (/\b(decided|chose|selected|going with)\b/.test(lower)) {
      return {templateName: 'adr', confidence: 'low', reason: 'Fallback heuristic'}
    }
    if (/\b(proposing|suggesting|rfc|proposal)\b/.test(lower)) {
      return {templateName: 'rfc', confidence: 'low', reason: 'Fallback heuristic'}
    }

    return {
      templateName: 'journal-entry',
      confidence: 'low',
      reason: 'Fallback to default template',
    }
  }
}
*/
