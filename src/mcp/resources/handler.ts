import * as fs from 'fs/promises'
import * as path from 'path'
import type {ParsedUri, Resource, ResourceContent, ResourceType} from './types.js'

export class ResourceHandler {
  constructor(private basePath: string = process.cwd()) {}

  /**
   * List all available resources
   */
  async list(): Promise<Resource[]> {
    const resources: Resource[] = []

    // Add journal resources
    resources.push(...(await this.listJournalResources()))

    // Add template resources
    resources.push(...(await this.listTemplateResources()))

    // Add runbook resources (if directory exists)
    try {
      resources.push(...(await this.listRunbookResources()))
    } catch {
      // Runbooks directory doesn't exist yet - skip
    }

    return resources
  }

  /**
   * Read a specific resource by URI
   */
  async read(uri: string): Promise<ResourceContent> {
    const parsed = this.parseUri(uri)

    switch (parsed.type) {
      case 'runbook':
        return this.readRunbook(parsed.identifier)
      case 'template':
        return this.readTemplate(parsed.identifier)
      case 'standard':
        return this.readStandard(parsed.identifier)
      case 'doc':
        return this.readDoc(parsed.identifier)
      case 'journal':
        return this.readJournal(parsed.identifier)
      default:
        throw new Error(`Unknown resource type: ${parsed.type}`)
    }
  }

  /**
   * Parse a docket:// URI into type and identifier
   */
  private parseUri(uri: string): ParsedUri {
    // Validate URI doesn't contain path traversal
    if (uri.includes('..') || uri.includes('~')) {
      throw new Error('Invalid URI: path traversal detected')
    }

    // Parse: docket://runbook/preview-branch
    const match = uri.match(/^docket:\/\/([^/]+)\/(.+)$/)
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
   * List journal resources
   */
  private async listJournalResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const journalPath = path.join(this.basePath, '.docket', 'journal.md')

    try {
      await fs.access(journalPath)
      resources.push({
        uri: 'docket://journal/current',
        name: 'Current Work Journal',
        description:
          'Active work journal capturing session context. IMPORTANT: Update this frequently as you work to capture key discoveries, rationale behind decisions, and partially explored ideas. Rich journal entries enable effective session recovery via the resume-work prompt. Use the capture-work tool to append entries easily.',
        mimeType: 'text/markdown',
      })
    } catch {
      // Journal doesn't exist yet
    }

    return resources
  }

  /**
   * List template resources
   */
  private async listTemplateResources(): Promise<Resource[]> {
    const resources: Resource[] = []
    const templatesDir = path.join(this.basePath, 'templates')

    try {
      const files = await fs.readdir(templatesDir)
      const templateFiles = files.filter((f) => f.endsWith('-template.md'))

      for (const file of templateFiles) {
        const type = file.replace('-template.md', '')
        resources.push({
          uri: `docket://template/${type}`,
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
    const runbooksDir = path.join(this.basePath, 'docs', 'runbooks')

    const files = await fs.readdir(runbooksDir)
    const runbookFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of runbookFiles) {
      const name = file.replace('.md', '')
      const content = await fs.readFile(path.join(runbooksDir, file), 'utf-8')

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : this.formatName(name)

      // Extract description from content (first paragraph after title)
      const descMatch = content.match(/^#\s+.+\n\n(.+)$/m)
      const description = descMatch ? descMatch[1] : `Operational runbook: ${title}`

      resources.push({
        uri: `docket://runbook/${name}`,
        name: title,
        description,
        mimeType: 'text/markdown',
      })
    }

    return resources
  }

  /**
   * Read runbook resource
   */
  private async readRunbook(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.basePath, 'docs', 'runbooks', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docket://runbook/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read template resource
   */
  private async readTemplate(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.basePath, 'templates', `${identifier}-template.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docket://template/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read standard resource
   */
  private async readStandard(identifier: string): Promise<ResourceContent> {
    const filePath = path.join(this.basePath, 'docs', 'standards', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docket://standard/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read doc resource
   */
  private async readDoc(identifier: string): Promise<ResourceContent> {
    // identifier is a path like "architecture/overview"
    const filePath = path.join(this.basePath, 'docs', `${identifier}.md`)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docket://doc/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
  }

  /**
   * Read journal resource
   */
  private async readJournal(identifier: string): Promise<ResourceContent> {
    const filePath =
      identifier === 'current'
        ? path.join(this.basePath, '.docket', 'journal.md')
        : path.join(this.basePath, '.docket', `journal-${identifier}.md`)

    const content = await fs.readFile(filePath, 'utf-8')

    return {
      uri: `docket://journal/${identifier}`,
      mimeType: 'text/markdown',
      text: content,
    }
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
}
