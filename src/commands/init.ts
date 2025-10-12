import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import inquirer from 'inquirer'
import * as path from 'path'
import {analyzeProject} from '../lib/detector.js'
import {
  getDocumentationGoals,
  installTemplates,
  loadContext,
  ProjectContext,
  saveContext,
  TemplateCustomization,
} from '../lib/installer.js'

export default class Init extends Command {
  static description = 'Initialize docket documentation in your project with smart customization'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --non-interactive',
    '<%= config.bin %> <%= command.id %> --docs-dir documentation',
    '<%= config.bin %> <%= command.id %> --output json',
  ]

  static flags = {
    'docs-dir': Flags.string({
      char: 'd',
      description: 'Documentation directory name',
      default: 'docs',
    }),
    'non-interactive': Flags.boolean({
      char: 'n',
      description: 'Run with smart defaults, no prompts',
      default: false,
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
    const {flags} = await this.parse(Init)

    const cwd = flags.path
    const docsDir = flags['docs-dir']
    const isInteractive = !flags['non-interactive']
    const outputJson = flags.output === 'json'

    // Check if already initialized
    const existingContext = loadContext(cwd)
    if (existingContext && !outputJson) {
      this.log(chalk.yellow('⚠️  Docket is already initialized in this project.'))
      this.log(chalk.dim(`   Context file found at: .docket/context.json`))
      this.log(chalk.dim(`   Initialized at: ${new Date(existingContext.timestamp).toLocaleString()}`))
      this.log('')

      if (isInteractive) {
        const {proceed} = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to reinitialize?',
            default: false,
          },
        ])

        if (!proceed) {
          this.log(chalk.dim('Initialization cancelled.'))
          return
        }
      } else {
        // In non-interactive mode, skip reinitialization
        if (outputJson) {
          this.log(JSON.stringify({error: 'already_initialized', context: existingContext}, null, 2))
        }

        return
      }
    }

    if (!outputJson) {
      this.log(chalk.cyan('🚀 Initializing docket...\n'))
    }

    // Analyze project
    if (!outputJson) {
      this.log(chalk.dim('Analyzing project structure...'))
    }

    const analysis = await analyzeProject(cwd)

    if (!outputJson) {
      this.log(chalk.green('✓ Analysis complete\n'))
    }

    // Gather context
    const context = await this.gatherContext(cwd, analysis, isInteractive, outputJson)

    // Create customization
    const customization: TemplateCustomization = {
      projectName: context.projectName,
      primaryLanguage: analysis.languages[0]?.name || 'Unknown',
      primaryFramework: analysis.frameworks.find(f => f.type === 'web' || f.type === 'backend')?.name || null,
      teamSize: context.teamSize,
      hasTests: analysis.structure.hasTests,
      hasDocs: analysis.structure.hasDocs,
    }

    // Install templates
    if (!outputJson) {
      this.log(chalk.dim(`Installing templates to ${docsDir}/...`))
    }

    const installedFiles = await installTemplates(cwd, docsDir, customization)

    // Save context
    saveContext(cwd, context)

    if (outputJson) {
      this.log(
        JSON.stringify(
          {
            success: true,
            context,
            installedFiles,
            docsDirectory: docsDir,
          },
          null,
          2,
        ),
      )
    } else {
      this.log(chalk.green(`✓ Installed ${installedFiles.length} templates\n`))

      this.log(chalk.bold('📚 Next Steps:'))
      this.log(`  1. Review the templates in ${chalk.cyan(docsDir + '/')}`)
      this.log('  2. Customize them for your project')
      this.log(`  3. Run ${chalk.cyan('docket audit')} to find documentation gaps`)
      this.log(`  4. Run ${chalk.cyan('docket review')} to check for staleness\n`)

      this.log(chalk.dim('Documentation initialized successfully!'))
      this.log(chalk.dim(`Context saved to: .docket/context.json`))
    }
  }

  private async gatherContext(
    cwd: string,
    analysis: any,
    isInteractive: boolean,
    outputJson: boolean,
  ): Promise<ProjectContext> {
    let projectName: string
    let teamSize: 'solo' | 'small' | 'medium' | 'large'
    let documentationGoals: string[] = []

    if (isInteractive) {
      // Get project name from package.json or directory name
      const defaultName = this.getDefaultProjectName(cwd)

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: defaultName,
        },
        {
          type: 'list',
          name: 'teamSize',
          message: 'Team size:',
          choices: [
            {name: 'Solo developer', value: 'solo'},
            {name: 'Small team (2-5 people)', value: 'small'},
            {name: 'Medium team (6-20 people)', value: 'medium'},
            {name: 'Large team (20+ people)', value: 'large'},
          ],
          default: 'solo',
        },
        {
          type: 'checkbox',
          name: 'documentationGoals',
          message: 'What do you want to document? (select all that apply)',
          choices: getDocumentationGoals().map(goal => ({
            name: `${goal.name} - ${chalk.dim(goal.description)}`,
            value: goal.value,
            checked: true,
          })),
        },
      ])

      projectName = answers.projectName
      teamSize = answers.teamSize
      documentationGoals = answers.documentationGoals
    } else {
      // Non-interactive: use smart defaults
      projectName = this.getDefaultProjectName(cwd)
      teamSize = 'solo' // Default to solo
      documentationGoals = getDocumentationGoals().map(g => g.value) // All goals
    }

    return {
      projectName,
      teamSize,
      documentationGoals,
      analysis,
      customizations: {},
      timestamp: new Date().toISOString(),
    }
  }

  private getDefaultProjectName(cwd: string): string {
    // Try to get from package.json
    try {
      const pkgPath = path.join(cwd, 'package.json')
      const pkg = require(pkgPath)
      if (pkg.name) return pkg.name
    } catch {
      // No package.json or no name field
    }

    // Fall back to directory name
    return path.basename(cwd)
  }
}
