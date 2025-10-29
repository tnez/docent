import * as fs from 'fs/promises'
import * as path from 'path'
import {glob} from 'glob'

export interface AnalysisResult {
  languages: string[]
  frameworks: string[]
  buildTools: string[]
  structure: {
    hasTests: boolean
    hasDocs: boolean
    sourceDir?: string
  }
}

/**
 * Analyze project structure, languages, frameworks, and build tools
 */
export async function analyzeProject(cwd: string): Promise<AnalysisResult> {
  const languages: string[] = []
  const frameworks: string[] = []
  const buildTools: string[] = []
  const structure = {
    hasTests: false,
    hasDocs: false,
    sourceDir: undefined as string | undefined,
  }

  try {
    // Check for common config files to detect languages and frameworks
    const files = await fs.readdir(cwd)

    // Detect build tools
    if (files.includes('package.json')) {
      buildTools.push('npm')
      languages.push('TypeScript', 'JavaScript')

      try {
        const pkgJson = JSON.parse(await fs.readFile(path.join(cwd, 'package.json'), 'utf-8'))
        const deps = {...pkgJson.dependencies, ...pkgJson.devDependencies}

        // Detect frameworks
        if (deps.express) frameworks.push('Express')
        if (deps.fastify) frameworks.push('Fastify')
        if (deps.react) frameworks.push('React')
        if (deps.vue) frameworks.push('Vue')
        if (deps.next) frameworks.push('Next.js')
        if (deps['@modelcontextprotocol/sdk']) frameworks.push('MCP')
      } catch {
        // Ignore parse errors
      }
    }

    if (files.includes('Cargo.toml')) {
      buildTools.push('cargo')
      languages.push('Rust')
    }

    if (files.includes('go.mod')) {
      buildTools.push('go')
      languages.push('Go')
    }

    if (files.includes('pyproject.toml') || files.includes('requirements.txt')) {
      buildTools.push('pip')
      languages.push('Python')
    }

    // Check for structure
    structure.hasTests = files.some(f => f === 'test' || f === 'tests' || f === '__tests__')
    structure.hasDocs = files.some(f => f === 'docs' || f === 'documentation')

    // Find source directory
    if (files.includes('src')) structure.sourceDir = 'src'
    else if (files.includes('lib')) structure.sourceDir = 'lib'
  } catch (error) {
    // If we can't read the directory, return empty analysis
  }

  return {
    languages: [...new Set(languages)],
    frameworks: [...new Set(frameworks)],
    buildTools: [...new Set(buildTools)],
    structure,
  }
}
