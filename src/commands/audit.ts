import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {analyzeProject} from '../lib/detector.js'
import {auditDocumentation, AuditResult} from '../lib/auditor.js'
import {loadContext} from '../lib/installer.js'

export default class Audit extends Command {
  static description = 'Audit documentation completeness and identify gaps'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --output json',
    '<%= config.bin %> <%= command.id %> --docs-dir documentation',
  ]

  static flags = {
    'docs-dir': Flags.string({
      char: 'd',
      description: 'Documentation directory name',
      default: 'docs',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output format (human or json)',
      options: ['human', 'json'],
      default: 'human',
    }),
    path: Flags.string({
      char: 'p',
      description: 'Path to project directory',
      default: '.',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Audit)

    const cwd = flags.path
    const docsDir = flags['docs-dir']
    const outputJson = flags.output === 'json'

    if (!outputJson) {
      this.log(chalk.cyan('📋 Auditing documentation...\n'))
    }

    // Load context if available
    const context = loadContext(cwd)

    // Analyze project
    const analysis = await analyzeProject(cwd)

    // Audit documentation
    const audit = await auditDocumentation(cwd, docsDir, analysis)

    if (outputJson) {
      this.log(JSON.stringify(audit, null, 2))
    } else {
      this.displayHumanReadable(audit, context !== null)
    }
  }

  private displayHumanReadable(audit: AuditResult, hasContext: boolean): void {
    // Score display
    const scoreColor = audit.score >= 80 ? 'green' : audit.score >= 50 ? 'yellow' : 'red'
    const scoreBar = this.getScoreBar(audit.score)

    this.log(chalk.bold('📊 Documentation Score'))
    this.log(`  ${chalk[scoreColor](audit.score)}/100 ${scoreBar}`)
    this.log('')

    // Coverage overview
    this.log(chalk.bold('📖 Coverage'))
    this.log(`  ${this.getCheckmark(audit.coverage.hasArchitecture)} Architecture documentation`)
    this.log(`  ${this.getCheckmark(audit.coverage.hasADRs)} Architecture Decision Records (ADRs)`)
    this.log(`  ${this.getCheckmark(audit.coverage.hasStandards)} Coding standards`)
    this.log(`  ${this.getCheckmark(audit.coverage.hasTesting)} Testing documentation`)
    this.log(`  ${this.getCheckmark(audit.coverage.hasAPI)} API documentation`)
    this.log(`  ${this.getCheckmark(audit.coverage.hasTroubleshooting)} Troubleshooting guides`)
    this.log(`  ${this.getCheckmark(audit.coverage.hasOnboarding)} Onboarding documentation`)
    this.log('')

    // Gaps
    if (audit.gaps.length > 0) {
      this.log(chalk.bold('⚠️  Documentation Gaps'))

      const gapsBySeverity = {
        high: audit.gaps.filter(g => g.severity === 'high'),
        medium: audit.gaps.filter(g => g.severity === 'medium'),
        low: audit.gaps.filter(g => g.severity === 'low'),
      }

      for (const severity of ['high', 'medium', 'low'] as const) {
        const gaps = gapsBySeverity[severity]
        if (gaps.length === 0) continue

        const severityColor = severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'dim'
        const severityIcon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '⚪'

        this.log(chalk[severityColor](`\n  ${severityIcon} ${severity.toUpperCase()} Priority:`))

        for (const gap of gaps) {
          this.log(`    • ${chalk.bold(gap.category)}: ${gap.description}`)
          this.log(chalk.dim(`      → ${gap.suggestion}`))
          if (gap.files && gap.files.length > 0) {
            this.log(chalk.dim(`      Files: ${gap.files.slice(0, 3).join(', ')}${gap.files.length > 3 ? '...' : ''}`))
          }
        }
      }

      this.log('')
    } else {
      this.log(chalk.green('✓ No critical documentation gaps found!\n'))
    }

    // Recommendations
    if (audit.recommendations.length > 0) {
      this.log(chalk.bold('💡 Recommendations'))
      for (const rec of audit.recommendations) {
        this.log(`  • ${rec}`)
      }

      this.log('')
    }

    // Next steps
    if (!hasContext) {
      this.log(chalk.yellow('💡 Tip: Run') + chalk.cyan(' docket init ') + chalk.yellow('to set up structured documentation'))
    } else if (audit.score < 100) {
      this.log(chalk.dim('Run') + chalk.cyan(' docket review ') + chalk.dim('to check for stale documentation'))
    }

    this.log('')
    this.log(chalk.dim(`Audit completed at ${new Date(audit.timestamp).toLocaleString()}`))
  }

  private getCheckmark(value: boolean): string {
    return value ? chalk.green('✓') : chalk.red('✗')
  }

  private getScoreBar(score: number): string {
    const filled = Math.floor(score / 5)
    const empty = 20 - filled
    const color = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red'
    return chalk[color]('█'.repeat(filled)) + chalk.dim('░'.repeat(empty))
  }
}
