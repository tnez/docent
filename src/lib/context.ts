import {loadConfig, type DocentConfig} from './config'

/**
 * Application context containing configuration and shared state
 */
export interface Context {
  /** Root directory of the project */
  projectPath: string
  /** Loaded configuration with computed paths */
  config: DocentConfig
  /** Package directory (where templates are bundled) */
  packagePath?: string
}

/**
 * Create application context
 *
 * @param projectPath - Root directory of the project
 * @param packagePath - Optional package directory for bundled resources
 * @returns Context object with configuration and paths
 */
export function createContext(
  projectPath: string = process.cwd(),
  packagePath?: string
): Context {
  const config = loadConfig(projectPath)

  return {
    projectPath,
    config,
    packagePath,
  }
}
