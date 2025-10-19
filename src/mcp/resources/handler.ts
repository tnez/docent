import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'
import type {ParsedUri, Resource, ResourceContent, ResourceType} from './types.js'
import type {Context} from '../../lib/context.js'

export class ResourceHandler {
  private ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
    // Ensure packagePath is set
    if (!ctx.packagePath) {
      // From /path/to/docent/lib/mcp/resources/handler.js -> /path/to/docent
      ctx.packagePath = path.resolve(__dirname, '..', '..', '..')
    }
  }

  /**
   * List all available resources
   */
  async list(): Promise<Resource[]> {
    const resources: Resource[] = []

    // Add meta resources (init-session, etc.)
    resources.push(...this.listMetaResources())

    // Add journal resources
    resources.push(...(await this.listJournalResources()))

    // Add template resources
    resources.push(...(await this.listTemplateResources()))

    // Add documentation resources (if directories exist)
    try {
      resources.push(...(await this.listRunbookResources()))
    } catch {
      // Runbooks directory doesn't exist yet - skip
    }

    try {
      resources.push(...(await this.listGuideResources()))
    } catch {
      // Guides directory doesn't exist yet - skip
    }

    try {
      resources.push(...(await this.listStandardResources()))
    } catch {
      // Standards directory doesn't exist yet - skip
    }

    try {
      resources.push(...(await this.listAdrResources()))
    } catch {
      // ADR directory doesn't exist yet - skip
    }

    try {
      resources.push(...(await this.listRfcResources()))
    } catch {
      // RFC directory doesn't exist yet - skip
    }

    return resources
  }

  /**
   * Read a specific resource by URI
   */
  async read(uri: string): Promise<ResourceContent> {
    const parsed = this.parseUri(uri)

    switch (parsed.type) {
      case 'meta':
        return this.readMeta(parsed.identifier)
      case 'runbook':
        return this.readRunbook(parsed.identifier)
      case 'template':
        return this.readTemplate(parsed.identifier)
      case 'standard':
        return this.readStandard(parsed.identifier)
      case 'guide':
        return this.readGuide(parsed.identifier)
      case 'adr':
        return this.readAdr(parsed.identifier)
      case 'rfc':
        return this.readRfc(parsed.identifier)
      case 'doc':
        return this.readDoc(parsed.identifier)
      case 'journal':
        return this.readJournal(parsed.identifier)
      default:
        throw new Error(`Unknown resource type: ${parsed.type}`)
    }
  }

  /**
   * Parse a docent:// URI into type and identifier
   */
  private parseUri(uri: string): ParsedUri {
    // Validate URI doesn't contain path traversal
    if (uri.includes('..') || uri.includes('~')) {
      throw new Error('Invalid URI: path traversal detected')
    }

    // Parse: docent://runbook/preview-branch
    const match = uri.match(/^docent:\/\/([^/]+)\/(.+)$/)
    if (!match) {
      throw new Error(`Invalid URI format: ${uri}`)
    }

    const [, type, identifier] = match
    return {
      type: type as ResourceType,
      identifier,
    }
  }

  /**
   * List meta resources (prompts exposed as resources for Claude Code compatibility)
   */
  private listMetaResources(): Resource[] {
    const resources: Resource[] = [
      {
        uri: 'docent://meta/init-session',
        name: 'Session Initialization',
        description: 'Bootstrap work session with project context, available resources, journal workflow, and docent usage guidelines. Invoke this at the start of a session to get oriented.',
        mimeType: 'text/markdown',
      },
    ]

    // Check if docs/ directory exists - if not, add setup-needed resource
    const docsPath = this.ctx.config.docsRoot
    try {
      fsSync.accessSync(docsPath)
      // docs/ exists - no setup needed
    } catch {
      // docs/ doesn't exist - add setup-needed resource
      resources.push({
        uri: 'docent://meta/setup-needed',
        name: '⚠️ Docent Setup Required',
        description: 'This project needs docent initialization. Run the init-project tool to create docs/ structure and generate initial documentation based on project analysis.',
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * List journal resources
   */
  private async listJournalResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const journalDir = this.ctx.config.journalRoot

    try {
      const files = await fs.readdir(journalDir)
      const sessionFiles = files.filter((f) => /^\d{4}-\d{2}-\d{2}-session-\d{3}\.md$/.test(f))

      if (sessionFiles.length > 0) {
        // Add "current" resource pointing to latest session
        const latestSession = sessionFiles.sort().pop()!
        resources.push({
          uri: 'docent://journal/current',
          name: 'Current Work Journal Session',
          description: `Active work journal session (${latestSession}). IMPORTANT: Update this frequently as you work to capture key discoveries, rationale behind decisions, and partially explored ideas. Rich journal entries enable effective session recovery via the resume-work prompt. Use the capture-work tool to append entries easily.`,
          mimeType: 'text/markdown',
        })

        // Add "recent" resource for resume-work
        resources.push({
          uri: 'docent://journal/recent',
          name: 'Recent Work Journal Sessions',
          description: 'Last 3 work journal sessions for session recovery and context gathering',
          mimeType: 'text/markdown',
        })
      }
    } catch {
      // Journal directory doesn't exist yet
    }

    return resources
  }

  /**
   * List template resources
   */
  private async listTemplateResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const templatesDir = path.join(this.ctx.packagePath!, 'templates')

    try {
      const files = await fs.readdir(templatesDir)
      const templateFiles = files.filter((f) => f.endsWith('-template.md'))

      for (const file of templateFiles) {
        const type = file.replace('-template.md', '')
        resources.push({
          uri: `docent://template/${type}`,
          name: `${this.capitalize(type)} Template`,
          description: `Template for creating ${type} documents`,
          mimeType: 'text/markdown',
        })
      }
    } catch {
      // Templates directory doesn't exist
    }

    return resources
  }

  /**
   * List runbook resources
   */
  private async listRunbookResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const runbooksDir = path.join(this.ctx.config.docsRoot, 'runbooks')

    const files = await fs.readdir(runbooksDir)
    const runbookFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of runbookFiles) {
      const name = file.replace('.md', '')
      const content = await fs.readFile(path.join(runbooksDir, file), 'utf-8')

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : this.formatName(name)

      // Try to extract "when to use" guidance, otherwise use first paragraph
      const whenToUse = this.extractWhenToUse(content)
      let description: string
      if (whenToUse) {
        description = `${whenToUse}`
      } else {
        const descMatch = content.match(/^#\s+.+\n\n(.+)$/m)
        description = descMatch ? descMatch[1] : `Operational runbook: ${title}`
      }

      resources.push({
        uri: `docent://runbook/${name}`,
        name: title,
        description,
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * List guide resources
   */
  private async listGuideResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const guidesDir = path.join(this.ctx.config.docsRoot, 'guides')

    const files = await fs.readdir(guidesDir)
    const guideFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of guideFiles) {
      const name = file.replace('.md', '')
      const content = await fs.readFile(path.join(guidesDir, file), 'utf-8')

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : this.formatName(name)

      // Try to extract "when to use" guidance, otherwise use first paragraph
      const whenToUse = this.extractWhenToUse(content)
      let description: string
      if (whenToUse) {
        description = `${whenToUse}`
      } else {
        const descMatch = content.match(/^#\s+.+\n\n(.+)$/m)
        description = descMatch ? descMatch[1] : `Guide: ${title}`
      }

      resources.push({
        uri: `docent://guide/${name}`,
        name: title,
        description,
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * List standard resources
   */
  private async listStandardResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const standardsDir = path.join(this.ctx.config.docsRoot, 'standards')

    const files = await fs.readdir(standardsDir)
    const standardFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of standardFiles) {
      const name = file.replace('.md', '')
      const content = await fs.readFile(path.join(standardsDir, file), 'utf-8')

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : this.formatName(name)

      // Extract description from content (first paragraph after title)
      const descMatch = content.match(/^#\s+.+\n\n(.+)$/m)
      const description = descMatch ? descMatch[1] : `Standard: ${title}`

      resources.push({
        uri: `docent://standard/${name}`,
        name: title,
        description,
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * List ADR resources
   */
  private async listAdrResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const adrDir = path.join(this.ctx.config.docsRoot, 'adr')

    const files = await fs.readdir(adrDir)
    const adrFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of adrFiles) {
      const name = file.replace('.md', '')
      const content = await fs.readFile(path.join(adrDir, file), 'utf-8')

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : this.formatName(name)

      // Extract status if present
      const statusMatch = content.match(/\*\*Status:\*\*\s+(.+)$/m)
      const status = statusMatch ? statusMatch[1] : 'Unknown'

      const description = `ADR (${status}): ${title}`

      resources.push({
        uri: `docent://adr/${name}`,
        name: title,
        description,
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * List RFC resources
   */
  private async listRfcResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const rfcDir = path.join(this.ctx.config.docsRoot, 'rfcs')

    const files = await fs.readdir(rfcDir)
    const rfcFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of rfcFiles) {
      const name = file.replace('.md', '')
      const content = await fs.readFile(path.join(rfcDir, file), 'utf-8')

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : this.formatName(name)

      // Extract status if present
      const statusMatch = content.match(/\*\*Status:\*\*\s+(.+)$/m)
      const status = statusMatch ? statusMatch[1] : 'Unknown'

      const description = `RFC (${status}): ${title}`

      resources.push({
        uri: `docent://rfc/${name}`,
        name: title,
        description,
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * Read meta resource (prompts exposed as resources)
   */
  private async readMeta(identifier: string): Promise<ResourceContent> {
    if (identifier === 'init-session') {
      // Import PromptBuilder to generate init-session content
      const {PromptBuilder} = await import('../prompts/builder')
      const promptBuilder = new PromptBuilder(this.ctx.projectPath)
      const result = await promptBuilder.build('init-session', {})

      // Extract text from messages
      const text = result.messages.map((m) => {
        if (m.content.type === 'text') {
          return m.content.text
        }
        return ''
      }).join('\n\n')

      return {
        uri: 'docent://meta/init-session',
        mimeType: 'text/markdown',
        text,
      }
    }

    if (identifier === 'setup-needed') {
      const text = `# ⚠️ Docent Setup Required

This project has not been initialized with docent yet.

## What You Need to Do

Run the \`init-project\` tool to bootstrap docent:

\`\`\`typescript
// Via MCP tool call
mcp.callTool('init-project', {})

// Or with custom path
mcp.callTool('init-project', {path: '/path/to/project'})

// Force reinitialize (if docs/ already exists)
mcp.callTool('init-project', {force: true})
\`\`\`

## What This Will Create

The \`init-project\` tool will:

1. **Analyze your project** - Detect languages, frameworks, and build tools
2. **Create docs/ structure** - Set up guides/, runbooks/, adr/, rfcs/, specs/, architecture/
3. **Generate README.md** - Documentation index with project info
4. **Create getting-started.md** - Initial guide customized for your project
5. **Set up .journal/** - Work session tracking (gitignored)

## After Initialization

Once initialized, you can:

- Read resources via \`readResource('docent://...')\`
- Use templates via \`readResource('docent://template/adr')\`
- Capture work via \`capture-work\` tool
- Resume sessions via \`resume-work\` tool
- Run documentation audits via \`audit\` tool

Run \`init-project\` now to get started!
`

      return {
        uri: 'docent://meta/setup-needed',
        mimeType: 'text/markdown',
        text,
      }
    }

    throw new Error(`Unknown meta resource: ${identifier}`)
  }

  /**
   * Read runbook resource
   */
  private async readRunbook(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.ctx.config.docsRoot, 'runbooks', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://runbook/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read template resource
   */
  private async readTemplate(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.ctx.packagePath!, 'templates', `${identifier}-template.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://template/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read standard resource
   */
  private async readStandard(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.ctx.config.docsRoot, 'standards', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://standard/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read guide resource
   */
  private async readGuide(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.ctx.config.docsRoot, 'guides', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://guide/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read ADR resource
   */
  private async readAdr(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.ctx.config.docsRoot, 'adr', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://adr/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read RFC resource
   */
  private async readRfc(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.ctx.config.docsRoot, 'rfcs', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://rfc/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read doc resource
   */
  private async readDoc(identifier: string): Promise<ResourceContent> {
    // identifier is a path like "architecture/overview"
    const filePath = path.join(this.ctx.config.docsRoot, `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docent://doc/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read journal resource
   */
  private async readJournal(identifier: string): Promise<ResourceContent> {
    const journalDir = this.ctx.config.journalRoot

    if (identifier === 'current') {
      // Return latest session
      const files = await fs.readdir(journalDir)
      const sessionFiles = files.filter((f) => /^\d{4}-\d{2}-\d{2}-session-\d{3}\.md$/.test(f)).sort()

      if (sessionFiles.length === 0) {
        throw new Error('No journal sessions found')
      }

      const latestSession = sessionFiles[sessionFiles.length - 1]
      const filePath = path.join(journalDir, latestSession)
      const content = await fs.readFile(filePath, 'utf-8')

      return {
        uri: 'docent://journal/current',
        mimeType: 'text/markdown',
        text: content,
      }
    }

    if (identifier === 'recent') {
      // Return last 3 sessions
      const files = await fs.readdir(journalDir)
      const sessionFiles = files.filter((f) => /^\d{4}-\d{2}-\d{2}-session-\d{3}\.md$/.test(f)).sort()

      const recentFiles = sessionFiles.slice(-3)
      const sessions = await Promise.all(
        recentFiles.map(async (file) => {
          const filePath = path.join(journalDir, file)
          const content = await fs.readFile(filePath, 'utf-8')
          return `## Session: ${file}\n\n${content}\n`
        }),
      )

      return {
        uri: 'docent://journal/recent',
        mimeType: 'text/markdown',
        text: sessions.join('\n---\n\n'),
      }
    }

    // Check if identifier is a date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(identifier)) {
      const files = await fs.readdir(journalDir)
      const dateSessions = files.filter((f) => f.startsWith(identifier)).sort()

      if (dateSessions.length === 0) {
        throw new Error(`No journal sessions found for date: ${identifier}`)
      }

      const sessions = await Promise.all(
        dateSessions.map(async (file) => {
          const filePath = path.join(journalDir, file)
          const content = await fs.readFile(filePath, 'utf-8')
          return `## Session: ${file}\n\n${content}\n`
        }),
      )

      return {
        uri: `docent://journal/${identifier}`,
        mimeType: 'text/markdown',
        text: sessions.join('\n---\n\n'),
      }
    }

    // Check if identifier is a specific session ID (YYYY-MM-DD-session-NNN)
    if (/^\d{4}-\d{2}-\d{2}-session-\d{3}$/.test(identifier)) {
      const filePath = path.join(journalDir, `${identifier}.md`)
      const content = await fs.readFile(filePath, 'utf-8')

      return {
        uri: `docent://journal/${identifier}`,
        mimeType: 'text/markdown',
        text: content,
      }
    }

    throw new Error(`Invalid journal identifier: ${identifier}`)
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Format kebab-case to Title Case
   */
  private formatName(name: string): string {
    return name
      .split('-')
      .map((word) => this.capitalize(word))
      .join(' ')
  }

  /**
   * Extract "when to use" guidance from markdown content
   * Looks for sections like "When to Use", "Use Cases", "Purpose"
   */
  private extractWhenToUse(content: string): string | null {
    // Look for common section headers
    const patterns = [
      /##\s+When to Use\s*\n\n(.+?)(?=\n##|\n\n##|$)/is,
      /##\s+Use Cases?\s*\n\n(.+?)(?=\n##|\n\n##|$)/is,
      /##\s+Purpose\s*\n\n(.+?)(?=\n##|\n\n##|$)/is,
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        // Clean up the extracted text
        return match[1].trim().replace(/\n\n.*$/s, '') // First paragraph only
      }
    }

    return null
  }
}
