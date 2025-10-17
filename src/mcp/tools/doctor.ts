import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs/promises'
import * as path from 'path'
import {glob} from 'glob'
import {execSync} from 'child_process'
import {analyzeProject} from '../../lib/detector.js'

export const doctorToolDefinition: Tool = {
  name: 'doctor',
  description:
    'Run comprehensive project health checks including broken links, debug code, test markers, and documentation quality. Use anytime to get actionable insights about project health. Especially useful before releases.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Project path (defaults to current directory)',
      },
      docsDir: {
        type: 'string',
        description: 'Documentation directory name (default: "docs")',
        default: 'docs',
      },
      checks: {
        type: 'array',
        description:
          'Specific checks to run. If omitted, runs all checks. Options: links, debug-code, test-markers, docs-quality, uncommitted, temp-files',
        items: {
          type: 'string',
          enum: ['links', 'debug-code', 'test-markers', 'docs-quality', 'uncommitted', 'temp-files'],
        },
      },
    },
  },
}

interface DoctorArgs {
  path?: string
  docsDir?: string
  checks?: string[]
}

interface DoctorIssue {
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  location?: string
  fix?: string
}

interface DoctorResult {
  healthy: boolean
  issues: DoctorIssue[]
  summary: string
}

export async function handleDoctorTool(args: DoctorArgs): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()
  const docsDir = args.docsDir || 'docs'
  const enabledChecks = args.checks || [
    'links',
    'debug-code',
    'test-markers',
    'docs-quality',
    'uncommitted',
    'temp-files',
  ]

  const issues: DoctorIssue[] = []

  // Check 1: Broken links in markdown
  if (enabledChecks.includes('links')) {
    issues.push(...(await checkBrokenLinks(projectPath, docsDir)))
  }

  // Check 2: Debug code in source
  if (enabledChecks.includes('debug-code')) {
    issues.push(...(await checkDebugCode(projectPath)))
  }

  // Check 3: Test markers (.only, .skip)
  if (enabledChecks.includes('test-markers')) {
    issues.push(...(await checkTestMarkers(projectPath)))
  }

  // Check 4: Documentation quality
  if (enabledChecks.includes('docs-quality')) {
    issues.push(...(await checkDocsQuality(projectPath, docsDir)))
  }

  // Check 5: Uncommitted changes
  if (enabledChecks.includes('uncommitted')) {
    issues.push(...(await checkUncommittedChanges(projectPath)))
  }

  // Check 6: Temporary files
  if (enabledChecks.includes('temp-files')) {
    issues.push(...(await checkTempFiles(projectPath)))
  }

  // Build result
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  const healthy = errors.length === 0

  const summary = buildSummary({healthy, issues, summary: ''})

  return {
    content: [
      {
        type: 'text' as const,
        text: formatDoctorReport({healthy, issues, summary}),
      },
    ],
  }
}

/**
 * Check for broken links in markdown files
 */
async function checkBrokenLinks(projectPath: string, docsDir: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []
  const docsPath = path.join(projectPath, docsDir)

  try {
    // Find all markdown files
    const pattern = path.join(docsPath, '**', '*.md')
    const mdFiles = await glob(pattern, {
      ignore: ['**/node_modules/**'],
    })

    for (const file of mdFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        const relPath = path.relative(projectPath, file)

        // Find markdown links [text](path)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
        let match

        while ((match = linkRegex.exec(content)) !== null) {
          const linkText = match[1]
          const linkPath = match[2]

          // Skip external URLs
          if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
            continue
          }

          // Skip anchors only
          if (linkPath.startsWith('#')) {
            continue
          }

          // Remove anchor from path
          const [pathOnly] = linkPath.split('#')

          // Resolve relative path
          const fileDir = path.dirname(file)
          const targetPath = path.resolve(fileDir, pathOnly)

          // Check if file exists
          try {
            await fs.access(targetPath)
          } catch {
            const lineNumber = content.substring(0, match.index).split('\n').length
            issues.push({
              type: 'error',
              category: 'Broken Link',
              message: `Link to non-existent file '${linkPath}'`,
              location: `${relPath}:${lineNumber}`,
              fix: `Create the file or update the link`,
            })
          }
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  } catch {
    // If docs directory doesn't exist, that's a separate issue
  }

  return issues
}

/**
 * Check for debug code that shouldn't be in production
 */
async function checkDebugCode(projectPath: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []

  try {
    // Use git grep to find debug patterns
    // Note: patterns are constructed to avoid matching this file's own pattern list
    const patterns = [
      'console\\.log',
      'console\\.debug',
      'debugger',
      'TODO.*remove',
      'FIXME.*before.*release',
      'XXX',
    ]

    for (const pattern of patterns) {
      try {
        // Search for pattern in source files
        const result = execSync(`git grep -n "${pattern}" -- 'src/' '*.ts' '*.js' '*.tsx' '*.jsx' || true`, {
          cwd: projectPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        if (result.trim()) {
          const lines = result.trim().split('\n')
          for (const line of lines) {
            const [location, ...rest] = line.split(':')
            const code = rest.join(':').trim()

            // Exclude false positives:
            // - This file (doctor.ts) - contains the search patterns themselves
            // - Test files (test-*.js, *-test.*, *.test.*, *.spec.*, test/, **/*test*.js)
            const isTestFile =
              location.includes('doctor.ts') ||
              location.match(/^test-/) ||
              location.match(/\/test-/) ||
              location.match(/-test\./) ||
              location.match(/\.test\./) ||
              location.match(/\.spec\./) ||
              location.match(/\/test\//) ||
              location.match(/test.*\.js$/)

            if (isTestFile) {
              continue
            }

            issues.push({
              type: pattern.includes('console') ? 'warning' : 'error',
              category: 'Debug Code',
              message: `Found debug code: ${code.substring(0, 80)}${code.length > 80 ? '...' : ''}`,
              location,
              fix: 'Remove debug code before release',
            })
          }
        }
      } catch {
        // Pattern not found or git grep failed
      }
    }
  } catch {
    // Git not available or not a git repo
  }

  return issues
}

/**
 * Check for test-only markers that shouldn't be in committed code
 */
async function checkTestMarkers(projectPath: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []

  try {
    // Use git grep to find .only and .skip
    const patterns = ['\\.only\\(', '\\.skip\\(']

    for (const pattern of patterns) {
      try {
        const result = execSync(`git grep -n "${pattern}" -- 'test/' '*.test.ts' '*.spec.ts' || true`, {
          cwd: projectPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        if (result.trim()) {
          const lines = result.trim().split('\n')
          for (const line of lines) {
            const [location] = line.split(':')
            issues.push({
              type: 'error',
              category: 'Test Marker',
              message: `Found ${pattern.includes('only') ? '.only()' : '.skip()'} in test file`,
              location,
              fix: `Remove ${pattern.includes('only') ? '.only()' : '.skip()'} before committing`,
            })
          }
        }
      } catch {
        // Pattern not found or git grep failed
      }
    }
  } catch {
    // Git not available
  }

  return issues
}

/**
 * Check documentation quality and completeness
 */
async function checkDocsQuality(projectPath: string, docsDir: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []
  const docsPath = path.join(projectPath, docsDir)

  try {
    // Check if docs directory exists
    await fs.access(docsPath)

    // Analyze project to understand what docs are expected
    const analysis = await analyzeProject(projectPath)

    // Check for README in docs
    try {
      await fs.access(path.join(docsPath, 'README.md'))
    } catch {
      issues.push({
        type: 'warning',
        category: 'Documentation',
        message: 'No README.md in docs directory',
        location: docsDir,
        fix: 'Create docs/README.md to provide documentation overview',
      })
    }

    // If project has tests, check for testing docs
    if (analysis.structure.hasTests) {
      try {
        const testDocs = await glob(path.join(docsPath, '**/test*.md'), {
          ignore: ['**/node_modules/**'],
        })
        if (testDocs.length === 0) {
          issues.push({
            type: 'info',
            category: 'Documentation',
            message: 'Project has tests but no testing documentation',
            location: docsDir,
            fix: 'Consider adding testing guide or documentation',
          })
        }
      } catch {
        // Ignore glob errors
      }
    }

    // If complex project (multiple languages or frameworks), suggest architecture docs
    if (analysis.languages.length > 1 || analysis.frameworks.length > 0) {
      try {
        const archDocs = await glob(path.join(docsPath, '**/architect*.md'), {
          ignore: ['**/node_modules/**'],
        })
        if (archDocs.length === 0) {
          issues.push({
            type: 'info',
            category: 'Documentation',
            message: 'Complex project without architecture documentation',
            location: docsDir,
            fix: 'Consider documenting system architecture',
          })
        }
      } catch {
        // Ignore glob errors
      }
    }
  } catch {
    // Docs directory doesn't exist
    issues.push({
      type: 'error',
      category: 'Documentation',
      message: `Documentation directory '${docsDir}' does not exist`,
      location: projectPath,
      fix: `Run 'docent init' to create documentation structure`,
    })
  }

  return issues
}

/**
 * Check for uncommitted changes
 */
async function checkUncommittedChanges(projectPath: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []

  try {
    const status = execSync('git status --short', {
      cwd: projectPath,
      encoding: 'utf-8',
    })

    if (status.trim()) {
      const lines = status.trim().split('\n')
      issues.push({
        type: 'warning',
        category: 'Git Status',
        message: `${lines.length} uncommitted change(s)`,
        location: projectPath,
        fix: 'Commit or stash changes before release',
      })
    }
  } catch {
    // Not a git repo or git not available
  }

  return issues
}

/**
 * Check for temporary files that shouldn't be committed
 */
async function checkTempFiles(projectPath: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []

  try {
    // Common temporary file patterns that agents create
    const tempPatterns = [
      '*.tmp',
      '*.temp',
      '*-temp.*',
      'temp-*',
      'test-output.*',
      'scratch.*',
      'debug-*',
      'output-*',
      '*.log',
      'server-output.*',
      'release-notes.md', // Created during release process
      'lint-errors.txt',
      'continuation-prompt.txt',
      '*.tgz', // npm pack output
    ]

    for (const pattern of tempPatterns) {
      try {
        // Use git to check if any temp files are tracked or untracked
        const tracked = execSync(`git ls-files "${pattern}" || true`, {
          cwd: projectPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        const untracked = execSync(`git ls-files --others --exclude-standard "${pattern}" || true`, {
          cwd: projectPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        const allFiles = [...tracked.trim().split('\n'), ...untracked.trim().split('\n')].filter(f => f)

        for (const file of allFiles) {
          if (file) {
            issues.push({
              type: tracked.includes(file) ? 'error' : 'warning',
              category: 'Temporary Files',
              message: `Temporary file found: ${file}`,
              location: file,
              fix: tracked.includes(file)
                ? 'Remove from git: git rm --cached ' + file
                : 'Delete file: rm ' + file,
            })
          }
        }
      } catch {
        // Pattern not found or command failed
      }
    }
  } catch {
    // Git not available
  }

  return issues
}

/**
 * Build summary message
 */
function buildSummary(result: DoctorResult): string {
  const errors = result.issues.filter(i => i.type === 'error').length
  const warnings = result.issues.filter(i => i.type === 'warning').length
  const infos = result.issues.filter(i => i.type === 'info').length

  if (result.healthy) {
    return `✓ Project is healthy! Found ${warnings} warning(s) and ${infos} suggestion(s).`
  } else {
    return `✗ Project has ${errors} error(s), ${warnings} warning(s), and ${infos} suggestion(s). Address errors before release.`
  }
}

/**
 * Format doctor report as markdown
 */
function formatDoctorReport(result: DoctorResult): string {
  const {healthy, issues} = result

  let report = '# Project Health Check\n\n'

  // Summary
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  const infos = issues.filter(i => i.type === 'info')

  report += `**Status:** ${healthy ? '✓ Healthy' : '✗ Issues Found'}\n\n`
  report += `- **Errors:** ${errors.length} (must fix)\n`
  report += `- **Warnings:** ${warnings.length} (should fix)\n`
  report += `- **Info:** ${infos.length} (suggestions)\n\n`

  if (issues.length === 0) {
    report += '🎉 No issues found! Project is ready for release.\n'
    return report
  }

  // Group by category
  const byCategory = new Map<string, DoctorIssue[]>()
  for (const issue of issues) {
    const existing = byCategory.get(issue.category) || []
    existing.push(issue)
    byCategory.set(issue.category, existing)
  }

  // Report each category
  for (const [category, categoryIssues] of byCategory) {
    report += `## ${category}\n\n`

    for (const issue of categoryIssues) {
      const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'
      report += `${icon} **${issue.type.toUpperCase()}**\n`
      report += `   ${issue.message}\n`
      if (issue.location) {
        report += `   📍 Location: \`${issue.location}\`\n`
      }
      if (issue.fix) {
        report += `   💡 Fix: ${issue.fix}\n`
      }
      report += '\n'
    }
  }

  // Recommendations
  if (errors.length > 0) {
    report += '## Next Steps\n\n'
    report += '1. Fix all **errors** before proceeding with release\n'
    report += '2. Address **warnings** if possible\n'
    report += '3. Consider **info** suggestions for future improvements\n'
    report += '4. Run `docent doctor` again to verify fixes\n'
  }

  return report
}
