import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {analyzeProject} from '../lib/detector.js'
import {reviewDocumentation, ReviewResult} from '../lib/reviewer.js'

export default class Review extends Command {
  static description = 'Review documentation for staleness and drift from code'

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
    const {flags} = await this.parse(Review)

    const cwd = flags.path
    const docsDir = flags['docs-dir']
    const outputJson = flags.output === 'json'

    if (!outputJson) {
      this.log(chalk.cyan('🔍 Reviewing documentation...\n'))
    }

    // Analyze project
    const analysis = await analyzeProject(cwd)

    // Review documentation
    const review = await reviewDocumentation(cwd, docsDir, analysis)

    if (outputJson) {
      this.log(JSON.stringify(review, null, 2))
    } else {
      this.displayHumanReadable(review)
    }
  }

  private displayHumanReadable(review: ReviewResult): void {
    // Health score
    const scoreColor = review.healthScore >= 80 ? 'green' : review.healthScore >= 50 ? 'yellow' : 'red'
    const scoreBar = this.getScoreBar(review.healthScore)

    this.log(chalk.bold('💚 Documentation Health'))
    this.log(`  ${chalk[scoreColor](review.healthScore)}/100 ${scoreBar}`)
    this.log('')

    // Stale documents
    if (review.staleDocuments.length > 0) {
      this.log(chalk.bold('📅 Stale Documentation'))

      const stalenessByLevel = {
        high: review.staleDocuments.filter(d => d.severity === 'high'),
        medium: review.staleDocuments.filter(d => d.severity === 'medium'),
        low: review.staleDocuments.filter(d => d.severity === 'low'),
      }

      for (const severity of ['high', 'medium', 'low'] as const) {
        const docs = stalenessByLevel[severity]
        if (docs.length === 0) continue

        const severityColor = severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'dim'
        const severityIcon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '⚪'
        const timeframe = severity === 'high' ? '6+ months' : severity === 'medium' ? '3-6 months' : '1-3 months'

        this.log(chalk[severityColor](`\n  ${severityIcon} Not updated in ${timeframe}:`))

        for (const doc of docs.slice(0, 5)) {
          const daysSince = doc.daysSinceUpdate
          const timeAgo = this.formatTimeAgo(daysSince)
          this.log(`    • ${chalk.cyan(doc.file)} ${chalk.dim(`(${timeAgo})`)}`)
        }

        if (docs.length > 5) {
          this.log(chalk.dim(`    ... and ${docs.length - 5} more`))
        }
      }

      this.log('')
    } else {
      this.log(chalk.green('✓ All documentation is relatively fresh\n'))
    }

    // Drift issues
    if (review.driftIssues.length > 0) {
      this.log(chalk.bold('⚠️  Drift Issues'))

      const driftBySeverity = {
        high: review.driftIssues.filter(i => i.severity === 'high'),
        medium: review.driftIssues.filter(i => i.severity === 'medium'),
        low: review.driftIssues.filter(i => i.severity === 'low'),
      }

      for (const severity of ['high', 'medium', 'low'] as const) {
        const issues = driftBySeverity[severity]
        if (issues.length === 0) continue

        const severityColor = severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'dim'
        const severityIcon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '⚪'

        this.log(chalk[severityColor](`\n  ${severityIcon} ${severity.toUpperCase()} Priority:`))

        for (const issue of issues) {
          this.log(`    • ${chalk.bold(issue.category)}: ${issue.description}`)
          this.log(chalk.dim(`      → ${issue.suggestion}`))
          if (issue.files.length > 0) {
            this.log(chalk.dim(`      Files: ${issue.files.slice(0, 3).join(', ')}${issue.files.length > 3 ? '...' : ''}`))
          }
        }
      }

      this.log('')
    } else {
      this.log(chalk.green('✓ No drift detected between code and documentation\n'))
    }

    // Recommendations
    if (review.recommendations.length > 0) {
      this.log(chalk.bold('💡 Recommendations'))
      for (const rec of review.recommendations) {
        this.log(`  • ${rec}`)
      }

      this.log('')
    }

    // Summary
    const totalIssues = review.staleDocuments.length + review.driftIssues.length
    if (totalIssues === 0) {
      this.log(chalk.green('🎉 Documentation is healthy and up to date!'))
    } else {
      this.log(chalk.yellow(`Found ${totalIssues} issue(s) - review recommendations above`))
    }

    this.log('')
    this.log(chalk.dim(`Review completed at ${new Date(review.timestamp).toLocaleString()}`))
  }

  private formatTimeAgo(days: number): string {
    if (days < 30) return `${days} days ago`
    if (days < 60) return `1 month ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    const years = Math.floor(days / 365)
    return years === 1 ? '1 year ago' : `${years} years ago`
  }

  private getScoreBar(score: number): string {
    const filled = Math.floor(score / 5)
    const empty = 20 - filled
    const color = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red'
    return chalk[color]('█'.repeat(filled)) + chalk.dim('░'.repeat(empty))
  }
}
