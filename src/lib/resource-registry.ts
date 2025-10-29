import {readFileSync, readdirSync, existsSync} from 'fs'
import {join, dirname} from 'path'

/**
 * Metadata extracted from resource frontmatter
 */
export interface ResourceMetadata {
  name: string
  description: string
  type: string
  author?: string
  version?: string
  tags?: string[]
  variables?: Array<{
    name: string
    description: string
    default?: string
    required?: boolean
  }>
}

/**
 * A loaded resource (template or runbook) with metadata and content
 */
export interface Resource {
  metadata: ResourceMetadata
  content: string // Body without frontmatter
  filePath: string
  source: 'bundled' | 'user'
}

/**
 * Resource registry that loads templates and runbooks from bundled and user paths
 * User resources override bundled resources by name
 */
export class ResourceRegistry {
  private templates: Map<string, Resource> = new Map()
  private runbooks: Map<string, Resource> = new Map()

  constructor(
    private bundledTemplatesPath: string,
    private bundledRunbooksPath: string,
    private userTemplatesPath?: string,
    private userRunbooksPath?: string,
  ) {}

  /**
   * Load all resources from bundled and user paths
   * User resources override bundled by name
   */
  async load(): Promise<void> {
    // Load bundled resources first
    await this.loadTemplatesFrom(this.bundledTemplatesPath, 'bundled')
    await this.loadRunbooksFrom(this.bundledRunbooksPath, 'bundled')

    // Load user resources (will override bundled if same name)
    if (this.userTemplatesPath && existsSync(this.userTemplatesPath)) {
      await this.loadTemplatesFrom(this.userTemplatesPath, 'user')
    }
    if (this.userRunbooksPath && existsSync(this.userRunbooksPath)) {
      await this.loadRunbooksFrom(this.userRunbooksPath, 'user')
    }
  }

  /**
   * Get all templates
   */
  getTemplates(): Resource[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get all runbooks
   */
  getRunbooks(): Resource[] {
    return Array.from(this.runbooks.values())
  }

  /**
   * Get template by name
   */
  getTemplate(name: string): Resource | undefined {
    return this.templates.get(name)
  }

  /**
   * Get runbook by name
   */
  getRunbook(name: string): Resource | undefined {
    return this.runbooks.get(name)
  }

  /**
   * Load templates from a directory
   */
  private async loadTemplatesFrom(dirPath: string, source: 'bundled' | 'user'): Promise<void> {
    if (!existsSync(dirPath)) {
      return
    }

    const files = readdirSync(dirPath).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const filePath = join(dirPath, file)
      try {
        const resource = this.parseResource(filePath, source)
        if (resource) {
          this.templates.set(resource.metadata.name, resource)
        }
      } catch (error) {
        console.warn(`Failed to load template ${file}:`, error)
      }
    }
  }

  /**
   * Load runbooks from a directory
   */
  private async loadRunbooksFrom(dirPath: string, source: 'bundled' | 'user'): Promise<void> {
    if (!existsSync(dirPath)) {
      return
    }

    const files = readdirSync(dirPath).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const filePath = join(dirPath, file)
      try {
        const resource = this.parseResource(filePath, source)
        if (resource) {
          this.runbooks.set(resource.metadata.name, resource)
        }
      } catch (error) {
        console.warn(`Failed to load runbook ${file}:`, error)
      }
    }
  }

  /**
   * Parse a markdown resource file with YAML frontmatter
   */
  private parseResource(filePath: string, source: 'bundled' | 'user'): Resource | null {
    const content = readFileSync(filePath, 'utf-8')

    // Extract frontmatter and body
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/)

    if (!frontmatterMatch) {
      console.warn(`Resource ${filePath} missing frontmatter`)
      return null
    }

    const [, frontmatterStr, body] = frontmatterMatch

    // Parse frontmatter (simple YAML parsing)
    const metadata = this.parseFrontmatter(frontmatterStr)

    if (!metadata.name || !metadata.description || !metadata.type) {
      console.warn(`Resource ${filePath} missing required frontmatter fields (name, description, type)`)
      return null
    }

    return {
      metadata,
      content: body.trim(),
      filePath,
      source,
    }
  }

  /**
   * Simple YAML frontmatter parser
   * Handles basic key: value pairs, arrays, and nested objects for variables
   */
  private parseFrontmatter(yaml: string): ResourceMetadata {
    const metadata: any = {}
    const lines = yaml.split('\n')
    let currentKey: string | null = null
    let inArray = false
    let inVariables = false
    let currentVariable: any = null

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      // Handle arrays (tags)
      if (trimmed.startsWith('- ')) {
        if (inVariables && currentVariable) {
          // This is a variable property
          const match = trimmed.match(/^- (\w+):\s*(.+)$/)
          if (match) {
            const [, key, value] = match
            currentVariable[key] = value.replace(/^["']|["']$/g, '')
          }
        } else if (currentKey === 'tags') {
          if (!metadata.tags) metadata.tags = []
          metadata.tags.push(trimmed.substring(2).trim().replace(/^["']|["']$/g, ''))
        }
        continue
      }

      // Handle variables array
      if (trimmed === 'variables:') {
        metadata.variables = []
        inVariables = true
        currentKey = 'variables'
        continue
      }

      // Variable item start
      if (inVariables && trimmed.startsWith('name:')) {
        if (currentVariable) {
          metadata.variables.push(currentVariable)
        }
        currentVariable = {
          name: trimmed.substring(5).trim().replace(/^["']|["']$/g, ''),
        }
        continue
      }

      // Variable properties
      if (inVariables && currentVariable) {
        const varPropMatch = trimmed.match(/^(\w+):\s*(.+)$/)
        if (varPropMatch) {
          const [, key, value] = varPropMatch
          if (key === 'required') {
            currentVariable[key] = value.toLowerCase() === 'true'
          } else {
            currentVariable[key] = value.replace(/^["']|["']$/g, '')
          }
          continue
        }
      }

      // Regular key: value
      const match = trimmed.match(/^(\w+):\s*(.*)$/)
      if (match) {
        const [, key, value] = match

        // End variables section when we hit a non-variable key
        if (inVariables && key !== 'name' && key !== 'description' && key !== 'default' && key !== 'required') {
          if (currentVariable) {
            metadata.variables.push(currentVariable)
            currentVariable = null
          }
          inVariables = false
        }

        currentKey = key

        // Handle array start
        if (value === '' || value === '[') {
          inArray = true
          if (value === '[') {
            // Inline array like tags: [foo, bar]
            const arrayMatch = line.match(/\[(.*)\]/)
            if (arrayMatch) {
              metadata[key] = arrayMatch[1].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
              inArray = false
            }
          }
        } else {
          // Simple value
          metadata[key] = value.replace(/^["']|["']$/g, '')
          inArray = false
        }
      }
    }

    // Push last variable if exists
    if (inVariables && currentVariable) {
      metadata.variables.push(currentVariable)
    }

    return metadata
  }
}

/**
 * Create a resource registry for the current installation
 * Resolves bundled paths relative to package installation
 */
export function createRegistry(userTemplatesPath?: string, userRunbooksPath?: string): ResourceRegistry {
  // Get bundled paths - these are shipped with the npm package
  // Use __dirname which is available in compiled JS
  const __dirname = dirname(__filename)

  // From lib/resource-registry.js → package root (compiled code is in lib/)
  const packageRoot = join(__dirname, '..')

  const bundledTemplatesPath = join(packageRoot, 'templates')
  const bundledRunbooksPath = join(packageRoot, 'runbooks')

  return new ResourceRegistry(bundledTemplatesPath, bundledRunbooksPath, userTemplatesPath, userRunbooksPath)
}
