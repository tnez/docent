import { existsSync, readFileSync } from 'fs'
import { resolve, join } from 'path'

/**
 * Raw configuration from .docentrc file (legacy) or .docent/config.yaml (new)
 */
export interface RawConfig {
  root: string
  sessionThresholdMinutes: number
  search_paths?: string[]
  projects?: Record<string, ProjectConfig>
}

/**
 * Project configuration for issue filing
 */
export interface ProjectConfig {
  repo: string
  default_labels?: string[]
}

/**
 * Resolved configuration with computed absolute paths
 */
export interface DocentConfig {
  /** Raw root directory from config (e.g., "docs", "documentation", ".docent") */
  root: string
  /** Absolute path to docs root directory */
  docsRoot: string
  /** Absolute path to journal directory */
  journalRoot: string
  /** Minutes of inactivity before starting a new journal session */
  sessionThresholdMinutes: number
  /** Paths to search when using /docent:ask (absolute paths) */
  searchPaths: string[]
  /** Project configurations for issue filing */
  projects: Record<string, ProjectConfig>
}

const DEFAULT_RAW_CONFIG: RawConfig = {
  root: '.docent',
  sessionThresholdMinutes: 30,
  search_paths: ['.docent', 'docs'],
  projects: {},
}

/**
 * Load docent configuration from .docent/config.yaml (new) or .docentrc (legacy)
 *
 * Checks for config files in order:
 * 1. .docent/config.yaml (new format)
 * 2. .docentrc.yaml (legacy format)
 * 3. .docentrc.yml (legacy format, alternative extension)
 * 4. .docentrc (legacy JSON format)
 *
 * Returns config with computed absolute paths.
 *
 * @param projectPath - Root directory of the project
 * @returns DocentConfig with resolved paths
 */
export function loadConfig(projectPath: string): DocentConfig {
  const configFiles = ['.docent/config.yaml', '.docentrc.yaml', '.docentrc.yml', '.docentrc']

  let rawConfig: RawConfig = DEFAULT_RAW_CONFIG

  for (const configFile of configFiles) {
    const configPath = join(projectPath, configFile)

    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8')

        // Parse based on file extension
        let parsed: Partial<RawConfig>
        if (configFile.endsWith('.yaml') || configFile.endsWith('.yml')) {
          parsed = parseYaml(content)
        } else {
          parsed = JSON.parse(content)
        }

        // Merge with defaults
        rawConfig = {
          root: parsed.root || DEFAULT_RAW_CONFIG.root,
          sessionThresholdMinutes: parsed.sessionThresholdMinutes || DEFAULT_RAW_CONFIG.sessionThresholdMinutes,
          search_paths: parsed.search_paths || DEFAULT_RAW_CONFIG.search_paths,
          projects: parsed.projects || DEFAULT_RAW_CONFIG.projects,
        }
        break
      } catch (error) {
        // If config file exists but can't be parsed, throw error
        throw new Error(
          `Failed to parse config file ${configFile}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
  }

  // Compute absolute paths
  const docsRoot = resolve(projectPath, rawConfig.root)
  const journalRoot = join(docsRoot, 'journals')

  // Resolve search paths to absolute
  const searchPaths = (rawConfig.search_paths || DEFAULT_RAW_CONFIG.search_paths!).map(p =>
    resolve(projectPath, p),
  )

  return {
    root: rawConfig.root,
    docsRoot,
    journalRoot,
    sessionThresholdMinutes: rawConfig.sessionThresholdMinutes,
    searchPaths,
    projects: rawConfig.projects || {},
  }
}

/**
 * Simple YAML parser for docent configs
 * Supports: key: value, arrays (- item), nested objects (projects)
 *
 * For more complex YAML, we'd need a proper parser library.
 * This is intentionally minimal to avoid dependencies.
 */
function parseYaml(content: string): Partial<RawConfig> {
  const config: Partial<RawConfig> = {}
  const lines = content.split('\n')
  let currentKey: string | null = null
  let currentProject: string | null = null
  let inSearchPaths = false
  let inProjects = false

  for (const line of lines) {
    const trimmed = line.trim()
    const indent = line.match(/^\s*/)?.[0].length || 0

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    // Handle array items (search_paths)
    if (trimmed.startsWith('- ')) {
      if (inSearchPaths) {
        if (!config.search_paths) config.search_paths = []
        config.search_paths.push(trimmed.substring(2).trim().replace(/^["']|["']$/g, ''))
      }
      continue
    }

    // Parse key: value
    const match = trimmed.match(/^([\w_]+):\s*(.*)$/)
    if (match) {
      const [, key, value] = match

      // Top-level keys
      if (indent === 0) {
        currentKey = key
        inSearchPaths = false
        inProjects = false
        currentProject = null

        if (key === 'root') {
          config.root = value.replace(/^["']|["']$/g, '')
        } else if (key === 'sessionThresholdMinutes') {
          config.sessionThresholdMinutes = parseInt(value, 10)
        } else if (key === 'search_paths') {
          inSearchPaths = true
          config.search_paths = []
        } else if (key === 'projects') {
          inProjects = true
          config.projects = {}
        }
      }
      // Project-level keys (indented under projects:)
      else if (inProjects && indent === 2) {
        currentProject = key
        if (!config.projects) config.projects = {}
        config.projects[currentProject] = {repo: ''}
      }
      // Project property keys (indented under project name)
      else if (inProjects && currentProject && indent === 4) {
        if (key === 'repo') {
          config.projects![currentProject].repo = value.replace(/^["']|["']$/g, '')
        } else if (key === 'default_labels') {
          // Parse inline array or start array
          if (value.startsWith('[')) {
            const arrayMatch = value.match(/\[(.*)\]/)
            if (arrayMatch) {
              config.projects![currentProject].default_labels = arrayMatch[1]
                .split(',')
                .map(v => v.trim().replace(/^["']|["']$/g, ''))
            }
          }
        }
      }
    }
  }

  return config
}
