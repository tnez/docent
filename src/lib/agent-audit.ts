import * as fs from 'fs/promises'
import * as path from 'path'
import {glob} from 'glob'
import type {AnalysisResult} from './detector.js'

export interface AgentAuditContext {
  project: AnalysisResult
  docs: {
    files: Array<{
      path: string
      size: number
    }>
    totalFiles: number
  }
}

/**
 * Prepare context for agent-driven audit
 */
export async function prepareAgentAuditContext(
  cwd: string,
  docsDir: string,
  analysis: AnalysisResult,
): Promise<AgentAuditContext> {
  const docsPath = path.join(cwd, docsDir)
  const files: Array<{path: string; size: number}> = []

  try {
    // Find all markdown files in docs directory
    const pattern = path.join(docsPath, '**', '*.md')
    const mdFiles = await glob(pattern, {
      ignore: ['**/node_modules/**'],
    })

    for (const file of mdFiles) {
      try {
        const stats = await fs.stat(file)
        files.push({
          path: path.relative(cwd, file),
          size: stats.size,
        })
      } catch {
        // Skip files we can't stat
      }
    }
  } catch {
    // If docs directory doesn't exist, return empty files array
  }

  return {
    project: analysis,
    docs: {
      files,
      totalFiles: files.length,
    },
  }
}
