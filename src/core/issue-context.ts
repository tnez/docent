import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import {createContext} from './context.js'
import {analyzeProject, type AnalysisResult} from './detector.js'

/**
 * Context information gathered for filing GitHub issues
 */
export interface IssueContext {
  docentVersion: string
  nodeVersion: string
  os: string
  arch: string
  docentConfig?: {
    root: string
    sessionThresholdMinutes: number
  }
  projectType?: string
  projectLanguages?: string[]
}

/**
 * Gather system and project context for issue filing
 *
 * @returns IssueContext with version, OS, and project information
 */
export async function gatherIssueContext(): Promise<IssueContext> {
  // Get docent version from package.json
  const packagePath = path.join(__dirname, '..', '..', 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const docentVersion = pkg.version

  // Get Node version
  const nodeVersion = process.version

  // Get OS and architecture
  const platform = os.platform()
  const release = os.release()
  const osString = `${platform} ${release}`
  const arch = os.arch()

  // Try to gather docent config if in a project directory
  let docentConfig: IssueContext['docentConfig']
  try {
    const ctx = createContext()
    docentConfig = {
      root: ctx.config.root,
      sessionThresholdMinutes: ctx.config.sessionThresholdMinutes,
    }
  } catch {
    // Not in a docent project or config error - skip
  }

  // Try to analyze project if we're in a project directory
  let projectType: string | undefined
  let projectLanguages: string[] | undefined
  try {
    const analysisResult: AnalysisResult = await analyzeProject(process.cwd())
    if (analysisResult.languages.length > 0) {
      projectType = analysisResult.buildTools.length > 0 ? analysisResult.buildTools[0] : 'unknown'
      projectLanguages = analysisResult.languages
    }
  } catch {
    // Not in a project directory or analysis failed - skip
  }

  return {
    docentVersion,
    nodeVersion,
    os: osString,
    arch,
    docentConfig,
    projectType,
    projectLanguages,
  }
}
