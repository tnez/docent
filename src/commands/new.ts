import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import {glob} from 'glob'

type DocType = 'adr' | 'rfc' | 'guide' | 'runbook' | 'architecture'

interface TemplateInfo {
  templateFile: string
  subdirectory: string
  needsNumber: boolean
  prefix: string
}

const TEMPLATE_MAP: Record<DocType, TemplateInfo> = {
  adr: {
    templateFile: 'adr-template.md',
    subdirectory: 'adr',
    needsNumber: true,
    prefix: 'adr',
  },
  rfc: {
    templateFile: 'rfc-template.md',
    subdirectory: 'rfcs',
    needsNumber: true,
    prefix: 'rfc',
  },
  guide: {
    templateFile: 'onboarding-template.md',
    subdirectory: 'guides',
    needsNumber: false,
    prefix: '',
  },
  runbook: {
    templateFile: 'runbook-template.md',
    subdirectory: 'runbooks',
    needsNumber: false,
    prefix: '',
  },
  architecture: {
    templateFile: 'architecture-overview-template.md',
    subdirectory: 'architecture',
    needsNumber: false,
    prefix: '',
  },
}

export default class New extends Command {
  static args = {
    type: Args.string({
      description: 'Type of document to create (adr, rfc, guide, runbook, architecture)',
      required: true,
      options: ['adr', 'rfc', 'guide', 'runbook', 'architecture'],
    }),
    title: Args.string({
      description: 'Title for the new document',
      required: true,
    }),
  }

  static description = 'Create a new document from a template'

  static examples = [
    '<%= config.bin %> <%= command.id %> adr "Use PostgreSQL for primary database"',
    '<%= config.bin %> <%= command.id %> rfc "Real-time collaboration feature"',
    '<%= config.bin %> <%= command.id %> guide "Deployment process"',
    '<%= config.bin %> <%= command.id %> runbook "Database backup procedure"',
    '<%= config.bin %> <%= command.id %> architecture "System overview"',
  ]

  static flags = {
    'docs-dir': Flags.string({
      char: 'd',
      description: 'Documentation directory name',
      default: 'docs',
    }),
    path: Flags.string({
      char: 'p',
      description: 'Path to project directory',
      default: '.',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(New)

    const type = args.type as DocType
    const title = args.title
    const cwd = flags.path
    const docsDir = flags['docs-dir']

    const templateInfo = TEMPLATE_MAP[type]
    const docsPath = path.join(cwd, docsDir)
    const targetDir = path.join(docsPath, templateInfo.subdirectory)

    // Check if docs directory exists
    if (!fs.existsSync(docsPath)) {
      this.error(
        chalk.red(`Documentation directory not found: ${docsDir}\n`) +
          chalk.dim(`Run ${chalk.cyan('docket init')} first to set up documentation.`),
      )
    }

    // Ensure target subdirectory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, {recursive: true})
    }

    // Get next number if needed
    let filename: string
    if (templateInfo.needsNumber) {
      const nextNumber = await this.getNextNumber(targetDir, templateInfo.prefix)
      const slug = this.slugify(title)
      filename = `${templateInfo.prefix}-${nextNumber.toString().padStart(4, '0')}-${slug}.md`
    } else {
      const slug = this.slugify(title)
      filename = `${slug}.md`
    }

    const targetPath = path.join(targetDir, filename)

    // Check if file already exists
    if (fs.existsSync(targetPath)) {
      this.error(chalk.red(`File already exists: ${path.relative(cwd, targetPath)}`))
    }

    // Load template
    const templatesDir = path.join(__dirname, '..', '..', 'templates')
    const templatePath = path.join(templatesDir, templateInfo.templateFile)

    if (!fs.existsSync(templatePath)) {
      this.error(chalk.red(`Template not found: ${templateInfo.templateFile}`))
    }

    let templateContent = fs.readFileSync(templatePath, 'utf8')

    // Customize template
    templateContent = this.customizeTemplate(templateContent, title, type)

    // Write file
    fs.writeFileSync(targetPath, templateContent, 'utf8')

    // Success message
    const relativePath = path.relative(cwd, targetPath)
    this.log(chalk.green(`✓ Created ${type.toUpperCase()}: ${chalk.cyan(relativePath)}`))
    this.log('')
    this.log(chalk.dim('Next steps:'))
    this.log(chalk.dim(`  1. Edit ${relativePath}`))
    this.log(chalk.dim(`  2. Fill in the template with your content`))
    this.log(chalk.dim(`  3. Commit your changes`))
  }

  private async getNextNumber(directory: string, prefix: string): Promise<number> {
    const pattern = `${prefix}-[0-9][0-9][0-9][0-9]-*.md`
    const files = await glob(pattern, {cwd: directory})

    if (files.length === 0) {
      return 1
    }

    // Extract numbers from filenames
    const numbers = files
      .map(f => {
        const match = f.match(new RegExp(`${prefix}-(\\d{4})`))
        return match ? Number.parseInt(match[1], 10) : 0
      })
      .filter(n => n > 0)

    return Math.max(...numbers) + 1
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  private customizeTemplate(content: string, title: string, type: DocType): string {
    const today = new Date().toISOString().split('T')[0]

    // ADR-specific customization
    if (type === 'adr') {
      content = content.replace(/# ADR-NNNN: \[Short descriptive title\]/, `# ${title}`)
      content = content.replace(/\*\*Status:\*\* \[Proposed \| Accepted.*?\]/, '**Status:** Proposed')
      content = content.replace(/\*\*Date:\*\* YYYY-MM-DD/, `**Date:** ${today}`)
    }

    // RFC-specific customization
    if (type === 'rfc') {
      content = content.replace(/# RFC-NNNN: \[Title\]/, `# ${title}`)
      content = content.replace(/\*\*Status:\*\* \[Draft.*?\]/, '**Status:** Draft')
      content = content.replace(/\*\*Created:\*\* YYYY-MM-DD/, `**Created:** ${today}`)
    }

    // General title replacement
    content = content.replace(/\[System Name\]/g, title)
    content = content.replace(/\[Title\]/g, title)
    content = content.replace(/YYYY-MM-DD/g, today)

    return content
  }
}
