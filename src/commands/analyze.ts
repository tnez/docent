import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {analyzeProject, AnalysisResult} from '../lib/detector.js'

export default class Analyze extends Command {
  static description = 'Analyze project structure, languages, and frameworks'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --output json',
    '<%= config.bin %> <%= command.id %> --path /path/to/project',
  ]

  static flags = {
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
    const {flags} = await this.parse(Analyze)

    const cwd = flags.path

    if (flags.output === 'human') {
      this.log(chalk.cyan('🔍 Analyzing project...\n'))
    }

    const analysis = await analyzeProject(cwd)

    if (flags.output === 'json') {
      this.log(JSON.stringify(analysis, null, 2))
    } else {
      this.displayHumanReadable(analysis)
    }
  }

  private displayHumanReadable(analysis: AnalysisResult): void {
    // Languages
    this.log(chalk.bold('📝 Languages Detected:'))
    if (analysis.languages.length === 0) {
      this.log(chalk.dim('  No languages detected'))
    } else {
      for (const lang of analysis.languages) {
        const confidence = this.getConfidenceBadge(lang.confidence)
        const extensions = chalk.dim(`(${lang.primaryExtensions.join(', ')})`)
        this.log(`  ${confidence} ${chalk.cyan(lang.name)} - ${lang.fileCount} files ${extensions}`)
      }
    }

    this.log('')

    // Frameworks
    this.log(chalk.bold('🔧 Frameworks & Libraries:'))
    if (analysis.frameworks.length === 0) {
      this.log(chalk.dim('  No frameworks detected'))
    } else {
      const byType: Record<string, typeof analysis.frameworks> = {}
      for (const fw of analysis.frameworks) {
        if (!byType[fw.type]) byType[fw.type] = []
        byType[fw.type].push(fw)
      }

      for (const [type, frameworks] of Object.entries(byType)) {
        this.log(chalk.dim(`  ${type}:`))
        for (const fw of frameworks) {
          const confidence = this.getConfidenceBadge(fw.confidence)
          this.log(`    ${confidence} ${chalk.green(fw.name)} ${chalk.dim(`[${fw.detectedFrom}]`)}`)
        }
      }
    }

    this.log('')

    // Project Structure
    this.log(chalk.bold('📁 Project Structure:'))
    this.log(`  ${this.getCheckmark(analysis.structure.hasSource)} Source directories: ${analysis.structure.sourceDirectories.length > 0 ? chalk.cyan(analysis.structure.sourceDirectories.join(', ')) : chalk.dim('none')}`)
    this.log(`  ${this.getCheckmark(analysis.structure.hasTests)} Test directories: ${analysis.structure.testDirectories.length > 0 ? chalk.cyan(analysis.structure.testDirectories.join(', ')) : chalk.dim('none')}`)
    this.log(`  ${this.getCheckmark(analysis.structure.hasDocs)} Documentation directories: ${analysis.structure.docsDirectories.length > 0 ? chalk.cyan(analysis.structure.docsDirectories.join(', ')) : chalk.dim('none')}`)

    this.log('')

    // Build Tools
    if (analysis.buildTools.length > 0) {
      this.log(chalk.bold('🛠️  Build Tools:'))
      this.log(`  ${chalk.yellow(analysis.buildTools.join(', '))}`)
      this.log('')
    }

    // Package Managers
    if (analysis.packageManagers.length > 0) {
      this.log(chalk.bold('📦 Package Managers:'))
      this.log(`  ${chalk.magenta(analysis.packageManagers.join(', '))}`)
      this.log('')
    }

    // Summary
    const primaryLanguage = analysis.languages[0]?.name || 'Unknown'
    const primaryFramework = analysis.frameworks.find(f => f.type === 'web' || f.type === 'backend')?.name
    this.log(chalk.bold('📊 Summary:'))
    this.log(`  Primary Language: ${chalk.cyan(primaryLanguage)}`)
    if (primaryFramework) {
      this.log(`  Primary Framework: ${chalk.green(primaryFramework)}`)
    }

    this.log(`  Total Languages: ${analysis.languages.length}`)
    this.log(`  Total Frameworks: ${analysis.frameworks.length}`)
    this.log('')
    this.log(chalk.dim(`Analysis completed at ${new Date(analysis.timestamp).toLocaleString()}`))
  }

  private getConfidenceBadge(confidence: 'high' | 'medium' | 'low'): string {
    switch (confidence) {
    case 'high':
      return chalk.green('●')
    case 'medium':
      return chalk.yellow('●')
    case 'low':
      return chalk.red('●')
    }
  }

  private getCheckmark(value: boolean): string {
    return value ? chalk.green('✓') : chalk.dim('✗')
  }
}
