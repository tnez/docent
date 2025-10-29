import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)

/**
 * Parsed template URL information
 */
export interface ParsedTemplateUrl {
  url: string // Full original URL
  gitUrl: string // URL suitable for git clone
  ref?: string // Branch, tag, or commit
  isLocal: boolean // Whether this is a local path
  name: string // Human-readable name (e.g., "user/repo")
}

/**
 * Configuration file schema (.docentrc.yaml)
 */
export interface DocentConfig {
  version: number
  structure?: {
    directories?: string[]
    exclude?: string[]
  }
  files?: {
    [pattern: string]: {
      source: 'template' | 'generated'
      merge?: boolean
    }
  }
  metadata?: Record<string, unknown>
  project_overrides?: {
    frameworks?: string[]
    conventions?: string[]
  }
}

/**
 * Template validation result
 */
export interface TemplateValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
  hasConfig: boolean
  config?: DocentConfig
}

/**
 * Parse a template URL into components
 * Supports:
 * - GitHub HTTPS: https://github.com/user/repo
 * - GitLab HTTPS: https://gitlab.com/user/repo
 * - GitHub SSH: git@github.com:user/repo.git
 * - GitLab SSH: git@gitlab.com:user/repo.git
 * - With branch/tag: https://github.com/user/repo#branch-name
 * - Local paths: /absolute/path or ../relative/path
 */
export function parseTemplateUrl(input: string): ParsedTemplateUrl {
  // Check if it's a local path
  if (!input.includes('://') && !input.startsWith('git@')) {
    const absolutePath = path.isAbsolute(input) ? input : path.resolve(input)
    const name = path.basename(absolutePath)
    return {
      url: input,
      gitUrl: absolutePath,
      isLocal: true,
      name,
    }
  }

  // Extract ref if present (after #)
  let ref: string | undefined
  let urlWithoutRef = input

  const hashIndex = input.indexOf('#')
  if (hashIndex !== -1) {
    ref = input.substring(hashIndex + 1)
    urlWithoutRef = input.substring(0, hashIndex)
  }

  // Parse SSH URLs: git@github.com:user/repo.git
  if (urlWithoutRef.startsWith('git@')) {
    const match = urlWithoutRef.match(/git@([^:]+):([^/]+)\/([^/]+)/)
    if (match) {
      const [, host, user, repo] = match
      return {
        url: input,
        gitUrl: urlWithoutRef.endsWith('.git') ? urlWithoutRef : `${urlWithoutRef}.git`,
        ref,
        isLocal: false,
        name: `${user}/${repo.replace(/\.git$/, '')}`,
      }
    }
  }

  // Parse HTTPS URLs: https://github.com/user/repo
  const httpsMatch = urlWithoutRef.match(/https?:\/\/([^/]+)\/([^/]+)\/([^/]+)/)
  if (httpsMatch) {
    const [, host, user, repo] = httpsMatch
    return {
      url: input,
      gitUrl: urlWithoutRef.endsWith('.git') ? urlWithoutRef : `${urlWithoutRef}.git`,
      ref,
      isLocal: false,
      name: `${user}/${repo.replace(/\.git$/, '')}`,
    }
  }

  // Fallback: treat as is
  return {
    url: input,
    gitUrl: urlWithoutRef,
    ref,
    isLocal: false,
    name: path.basename(urlWithoutRef),
  }
}

/**
 * Clone a git repository to a temporary directory
 */
export async function cloneTemplate(parsed: ParsedTemplateUrl, targetDir: string): Promise<void> {
  if (parsed.isLocal) {
    throw new Error('Local templates should be copied, not cloned')
  }

  try {
    // Build git clone command
    const cloneArgs = ['--progress', '--depth', '1']
    if (parsed.ref) {
      cloneArgs.push('--branch', parsed.ref)
    }

    const command = `git clone ${cloneArgs.join(' ')} "${parsed.gitUrl}" "${targetDir}"`

    // Execute git clone with timeout
    await execAsync(command, {
      env: {...process.env, GIT_TERMINAL_PROMPT: '0'},
      timeout: 60000, // 60 second timeout
    })
  } catch (error) {
    // Enhance error with helpful context
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        throw new Error(
          `Authentication failed for ${parsed.url}\n\n` +
            `For private repositories, ensure you're authenticated:\n` +
            `  - HTTPS: Use personal access token\n` +
            `  - SSH: Add SSH key to agent (ssh-add ~/.ssh/id_rsa)\n\n` +
            `Try using SSH URL instead: git@github.com:${parsed.name}.git`,
        )
      }

      if (error.message.includes('Repository not found') || error.message.includes('not found')) {
        throw new Error(
          `Repository not found: ${parsed.url}\n\n` +
            `Please verify:\n` +
            `  - The repository URL is correct\n` +
            `  - You have access to the repository\n` +
            `  - The repository exists`,
        )
      }

      if (error.message.includes('timed out') || error.message.includes('timeout')) {
        throw new Error(
          `Connection timeout while cloning ${parsed.url}\n\n` +
            `Possible solutions:\n` +
            `  1. Check your internet connection\n` +
            `  2. Try again in a few moments\n` +
            `  3. Verify the repository is accessible`,
        )
      }

      throw new Error(`Failed to clone template ${parsed.url}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Copy a local template directory to target
 */
export async function copyLocalTemplate(sourcePath: string, targetDir: string): Promise<void> {
  try {
    await fs.access(sourcePath)
  } catch {
    throw new Error(`Local template not found: ${sourcePath}`)
  }

  // Use cp -r for efficiency
  await execAsync(`cp -r "${sourcePath}" "${targetDir}"`)
}

/**
 * Validate template structure
 * Requirements:
 * - Must have docs/ directory
 * - If .docentrc.yaml exists, it must be valid
 */
export async function validateTemplate(templateDir: string): Promise<TemplateValidation> {
  const errors: string[] = []
  const warnings: string[] = []
  let hasConfig = false
  let config: DocentConfig | undefined

  // Check for docs/ directory
  const docsPath = path.join(templateDir, 'docs')
  try {
    const stat = await fs.stat(docsPath)
    if (!stat.isDirectory()) {
      errors.push('docs/ must be a directory, not a file')
    }
  } catch {
    errors.push('Missing required directory: docs/')
  }

  // Check if docs/ has any content
  if (errors.length === 0) {
    try {
      const entries = await fs.readdir(docsPath)
      if (entries.length === 0) {
        warnings.push('docs/ directory is empty')
      }
    } catch {
      warnings.push('Could not read docs/ directory contents')
    }
  }

  // Check for and validate config file
  const configPath = path.join(templateDir, '.docentrc.yaml')
  try {
    await fs.access(configPath)
    hasConfig = true

    // TODO: Parse YAML config
    // For now, we'll implement a basic parser
    // In production, consider adding a YAML library like js-yaml
    warnings.push('Configuration file found but parsing not yet implemented')
  } catch {
    // Config is optional
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    hasConfig,
    config,
  }
}

/**
 * Create a temporary directory for template operations
 */
export async function createTempDir(prefix = 'docent-template-'): Promise<string> {
  const tempBase = os.tmpdir()
  const tempDir = path.join(tempBase, `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
  await fs.mkdir(tempDir, {recursive: true})
  return tempDir
}

/**
 * Clean up a temporary directory
 */
export async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, {recursive: true, force: true})
  } catch (error) {
    // Log but don't throw - cleanup failure shouldn't break the operation
    console.warn(`Warning: Failed to clean up temp directory ${tempDir}:`, error)
  }
}

/**
 * Copy template docs/ to target project
 */
export async function copyTemplateDocs(templateDir: string, targetDocsPath: string): Promise<void> {
  const sourceDocsPath = path.join(templateDir, 'docs')

  // Ensure target directory exists
  await fs.mkdir(targetDocsPath, {recursive: true})

  // Recursively copy all files from template docs/
  await copyDirectoryRecursive(sourceDocsPath, targetDocsPath)
}

/**
 * Recursively copy directory contents
 */
async function copyDirectoryRecursive(source: string, target: string): Promise<void> {
  const entries = await fs.readdir(source, {withFileTypes: true})

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, {recursive: true})
      await copyDirectoryRecursive(sourcePath, targetPath)
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

/**
 * Create a backup of existing docs/ directory
 */
export async function backupExistingDocs(docsPath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
  const timeComponent = new Date().toISOString().split('T')[1].replace(/[:.]/g, '-').slice(0, 8)
  const backupPath = `${docsPath}.backup.${timestamp}-${timeComponent}`

  await execAsync(`cp -r "${docsPath}" "${backupPath}"`)
  return backupPath
}
