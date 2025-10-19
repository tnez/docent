import { existsSync, readFileSync } from 'fs'
import { resolve, join } from 'path'

/**
 * Raw configuration from .docentrc file
 */
export interface RawConfig {
  root: string
}

/**
 * Resolved configuration with computed absolute paths
 */
export interface DocentConfig {
  /** Raw root directory from config (e.g., "docs", "documentation") */
  root: string
  /** Absolute path to docs root directory */
  docsRoot: string
  /** Absolute path to journal directory */
  journalRoot: string
}

const DEFAULT_RAW_CONFIG: RawConfig = {
  root: 'docs',
}

/**
 * Load docent configuration from .docentrc or .docentrc.yaml
 *
 * Checks for config files in order:
 * 1. .docentrc.yaml (YAML format)
 * 2. .docentrc.yml (YAML format, alternative extension)
 * 3. .docentrc (JSON format)
 *
 * Returns config with computed absolute paths.
 *
 * @param projectPath - Root directory of the project
 * @returns DocentConfig with resolved paths
 */
export function loadConfig(projectPath: string): DocentConfig {
  const configFiles = ['.docentrc.yaml', '.docentrc.yml', '.docentrc']

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
  const journalRoot = join(docsRoot, '.journal')

  return {
    root: rawConfig.root,
    docsRoot,
    journalRoot,
  }
}

/**
 * Simple YAML parser for basic key-value configs
 * Supports simple "key: value" format
 *
 * For more complex YAML, we'd need a proper parser library.
 * This is intentionally minimal to avoid dependencies.
 */
function parseYaml(content: string): Partial<RawConfig> {
  const config: Partial<RawConfig> = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    // Parse "key: value" format
    const match = trimmed.match(/^(\w+):\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      if (key === 'root') {
        // Remove quotes if present
        config.root = value.replace(/^["']|["']$/g, '')
      }
    }
  }

  return config
}
