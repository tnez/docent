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
          'Specific checks to run. If omitted, runs all checks. Options: links, debug-code, test-markers, docs-quality, uncommitted, temp-files, structure',
        items: {
          type: 'string',
          enum: ['links', 'debug-code', 'test-markers', 'docs-quality', 'uncommitted', 'temp-files', 'structure'],
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
  score: number // 0-100 health score
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
    'structure',
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

  // Check 7: Structure reconciliation
  if (enabledChecks.includes('structure')) {
    issues.push(...(await checkStructureReconciliation(projectPath, docsDir)))
  }

  // Build result
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  const healthy = errors.length === 0

  // Calculate health score (0-100)
  const score = calculateHealthScore(issues)

  const summary = buildSummary({healthy, score, issues, summary: ''})

  return {
    content: [
      {
        type: 'text' as const,
        text: formatDoctorReport({healthy, score, issues, summary}),
      },
    ],
  }
}

/**
 * Calculate overall health score (0-100) based on issues
 *
 * Scoring system:
 * - Start at 100 (perfect health)
 * - Errors: -10 points each (critical issues)
 * - Warnings: -3 points each (important issues)
 * - Info: -1 point each (suggestions)
 * - Minimum score: 0
 *
 * Score interpretation:
 * - 90-100: Excellent health
 * - 70-89: Good health (minor issues)
 * - 50-69: Fair health (needs attention)
 * - 30-49: Poor health (significant issues)
 * - 0-29: Critical (major problems)
 */
function calculateHealthScore(issues: DoctorIssue[]): number {
  const errors = issues.filter(i => i.type === 'error').length
  const warnings = issues.filter(i => i.type === 'warning').length
  const infos = issues.filter(i => i.type === 'info').length

  // Calculate deductions
  const errorDeduction = errors * 10
  const warningDeduction = warnings * 3
  const infoDeduction = infos * 1

  // Start at 100, subtract deductions, floor at 0
  const score = Math.max(0, 100 - errorDeduction - warningDeduction - infoDeduction)

  return score
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

        // Track code blocks to skip link checking inside them
        const lines = content.split('\n')
        let inCodeBlock = false
        const codeBlockLines = new Set<number>()

        lines.forEach((line, idx) => {
          if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock
            codeBlockLines.add(idx + 1) // Mark fence line itself
          }
          if (inCodeBlock) {
            codeBlockLines.add(idx + 1) // Line numbers are 1-indexed
          }
        })

        // Find markdown links [text](path)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
        let match

        while ((match = linkRegex.exec(content)) !== null) {
          const linkText = match[1]
          const linkPath = match[2]
          const lineNumber = content.substring(0, match.index).split('\n').length

          // Skip links inside code blocks
          if (codeBlockLines.has(lineNumber)) {
            continue
          }

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
            // - This file (doctor.ts/doctor.js) - contains the search patterns themselves
            // - Test files (test-*.js, *-test.*, *.test.*, *.spec.*, test/, **/*test*.js)
            const isExcluded =
              location.endsWith('doctor.ts') ||
              location.endsWith('doctor.js') ||
              location.includes('/doctor.ts') ||
              location.includes('/doctor.js') ||
              location.match(/^test-/) ||
              location.match(/\/test-/) ||
              location.match(/-test\./) ||
              location.match(/\.test\./) ||
              location.match(/\.spec\./) ||
              location.match(/\/test\//) ||
              location.match(/test.*\.js$/)

            if (isExcluded) {
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
 * Check for mismatches between documented file structure and reality (bidirectional)
 */
async function checkStructureReconciliation(projectPath: string, docsDir: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []
  const docsPath = path.join(projectPath, docsDir)

  try {
    // Find all markdown files in docs
    const pattern = path.join(docsPath, '**', '*.md')
    const mdFiles = await glob(pattern, {
      ignore: ['**/node_modules/**'],
    })

    const documentedPaths = new Set<string>()

    for (const file of mdFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')

        // Extract file/directory paths from inline code
        // Matches: /path/to/file.ext, path/to/file.ext, ./relative/path
        const pathRegex = /`([./][\w\-./]+\.(ts|js|tsx|jsx|json|md|toml|yaml|yml|lock|sh|bash))`/g
        let match

        while ((match = pathRegex.exec(content)) !== null) {
          const docPath = match[1]
          // Normalize path (remove leading ./)
          const normalizedPath = docPath.replace(/^\.\//, '')
          documentedPaths.add(normalizedPath)
        }
      } catch {
        // Skip files we can't read
      }
    }

    // Forward check: documented paths that don't exist
    for (const docPath of documentedPaths) {
      // Skip if it looks like an example or placeholder
      if (docPath.includes('example') || docPath.includes('placeholder') || docPath.includes('/your-') || docPath.includes('/my-')) {
        continue
      }

      // Treat paths starting with / as project-relative (not filesystem root)
      const cleanPath = docPath.startsWith('/') ? docPath.substring(1) : docPath
      const fullPath = path.join(projectPath, cleanPath)

      try {
        await fs.access(fullPath)
        // File exists - all good
      } catch {
        // File doesn't exist - report mismatch
        issues.push({
          type: 'warning',
          category: 'Structure Mismatch',
          message: `Documented file does not exist: '${docPath}'`,
          location: 'Documentation',
          fix: `Either create the file or update documentation to reflect current structure`,
        })
      }
    }

    // Inverse check: files that exist but aren't documented
    const inverseIssues = await checkUndocumentedFiles(projectPath, docsDir, documentedPaths)
    issues.push(...inverseIssues)

    // Report summary if we found documented paths
    if (documentedPaths.size > 0 && issues.length === 0) {
      issues.push({
        type: 'info',
        category: 'Structure Reconciliation',
        message: `Checked ${documentedPaths.size} documented file path(s) - all exist and no undocumented files found`,
        location: docsDir,
      })
    }
  } catch {
    // Docs directory doesn't exist, handled elsewhere
  }

  return issues
}

/**
 * Default ignore patterns for undocumented file check
 */
const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.github/**',
  '**/dist/**',
  '**/lib/**',
  '**/build/**',
  '**/coverage/**',
  '**/.vscode/**',
  '**/.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/Thumbs.db',
  '**/.env*',
  '**/*.tmp',
  '**/*.temp',
  '**/*.cache',
  '**/docs/.journal/**',
  '**/.mcp.json',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/*.tsbuildinfo',
]

/**
 * Severity rules for undocumented files
 */
interface SeverityRule {
  pattern: RegExp
  severity: 'error' | 'warning' | 'info'
  reason: string
}

const SEVERITY_RULES: SeverityRule[] = [
  // Errors: critical files that should be documented
  {pattern: /^scripts\/.*\.(sh|bash|ps1)$/, severity: 'error', reason: 'executable script'},
  {pattern: /^\.github\/workflows\//, severity: 'error', reason: 'CI/CD workflow'},
  {pattern: /Dockerfile$/, severity: 'error', reason: 'container definition'},

  // Warnings: important files
  {pattern: /^_[^/]+\//, severity: 'warning', reason: 'underscore-prefixed directory'},
  {pattern: /^test-[^/]+\.(js|ts|jsx|tsx)$/, severity: 'warning', reason: 'test file at root'},
  {pattern: /\.(yml|yaml|toml)$/, severity: 'warning', reason: 'configuration file'},
  {pattern: /docker-compose/, severity: 'warning', reason: 'Docker configuration'},

  // Info: less critical
  {pattern: /^examples?\//, severity: 'info', reason: 'example directory'},
  {pattern: /^demos?\//, severity: 'info', reason: 'demo directory'},
]

/**
 * Check for files that exist but aren't documented
 */
async function checkUndocumentedFiles(
  projectPath: string,
  docsDir: string,
  documentedPaths: Set<string>
): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = []

  try {
    // Get all files in project (respecting ignore patterns)
    const allFiles = await glob('**/*', {
      cwd: projectPath,
      ignore: DEFAULT_IGNORE_PATTERNS,
      nodir: true, // Exclude directories for now, only check files
      dot: false, // Exclude hidden files by default
    })

    // Check for specific high-priority patterns first
    const highPriorityChecks = [
      {pattern: '_research', check: (f: string) => f.startsWith('_research/')},
      {pattern: 'test-e2e.js', check: (f: string) => f === 'test-e2e.js'},
    ]

    for (const {pattern, check} of highPriorityChecks) {
      const matchingFiles = allFiles.filter(check)
      if (matchingFiles.length > 0) {
        // Check severity rules
        const firstMatch = matchingFiles[0]
        const rule = SEVERITY_RULES.find(r => r.pattern.test(firstMatch))
        if (rule) {
          for (const file of matchingFiles.slice(0, 5)) {
            // Limit to first 5 to avoid spam
            issues.push({
              type: rule.severity,
              category: 'Structure Mismatch',
              message: `Undocumented ${rule.reason}: '${file}'`,
              location: file,
              fix: `Document this ${rule.reason} in ${docsDir}/ or move to appropriate location`,
            })
          }
          if (matchingFiles.length > 5) {
            issues.push({
              type: 'info',
              category: 'Structure Mismatch',
              message: `... and ${matchingFiles.length - 5} more files in '${pattern}'`,
              location: pattern,
            })
          }
        }
      }
    }

    // Group remaining undocumented files by top-level directory
    const undocumentedByDir = new Map<string, string[]>()

    for (const file of allFiles) {
      // Skip if this exact path is documented
      if (documentedPaths.has(file) || documentedPaths.has(`/${file}`) || documentedPaths.has(`./${file}`)) {
        continue
      }

      // Skip docs directory itself
      if (file.startsWith(docsDir + '/') || file === docsDir) {
        continue
      }

      // Skip files we already reported in high-priority checks
      if (file.startsWith('_research/') || file === 'test-e2e.js') {
        continue
      }

      // Determine severity
      const rule = SEVERITY_RULES.find(r => r.pattern.test(file))
      if (rule) {
        issues.push({
          type: rule.severity,
          category: 'Structure Mismatch',
          message: `Undocumented ${rule.reason}: '${file}'`,
          location: file,
          fix: `Document this ${rule.reason} in ${docsDir}/ or move to appropriate location`,
        })
      } else {
        // Group by top-level directory for summary reporting
        const topDir = file.split('/')[0]
        const existing = undocumentedByDir.get(topDir) || []
        existing.push(file)
        undocumentedByDir.set(topDir, existing)
      }
    }

    // Report grouped undocumented directories
    for (const [dir, files] of undocumentedByDir) {
      // Only report if there are multiple files
      if (files.length >= 3) {
        issues.push({
          type: 'info',
          category: 'Structure Mismatch',
          message: `Undocumented directory: '${dir}/' (${files.length} files)`,
          location: dir + '/',
          fix: `Document this directory's purpose in ${docsDir}/ or add to .gitignore if temporary`,
        })
      }
    }
  } catch (error) {
    // Report error for debugging
    issues.push({
      type: 'warning',
      category: 'Structure Mismatch',
      message: `Error checking undocumented files: ${error}`,
      location: projectPath,
    })
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
  const {healthy, score, issues} = result

  let report = '# Project Health Check\n\n'

  // Summary with score
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  const infos = issues.filter(i => i.type === 'info')

  // Score interpretation
  let scoreLabel = ''
  let scoreEmoji = ''
  if (score >= 90) {
    scoreLabel = 'Excellent'
    scoreEmoji = '🌟'
  } else if (score >= 70) {
    scoreLabel = 'Good'
    scoreEmoji = '✅'
  } else if (score >= 50) {
    scoreLabel = 'Fair'
    scoreEmoji = '⚠️'
  } else if (score >= 30) {
    scoreLabel = 'Poor'
    scoreEmoji = '❌'
  } else {
    scoreLabel = 'Critical'
    scoreEmoji = '🚨'
  }

  report += `**Status:** ${healthy ? '✓ Healthy' : '✗ Issues Found'}\n`
  report += `**Health Score:** ${scoreEmoji} ${score}/100 (${scoreLabel})\n\n`
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
