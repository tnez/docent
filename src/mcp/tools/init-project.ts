import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs/promises'
import * as path from 'path'
import {analyzeProject} from '../../lib/detector.js'

export const initProjectToolDefinition: Tool = {
  name: 'init-project',
  description:
    'Bootstrap docent in a project by creating docs/ structure and generating initial documentation based on project analysis',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Project path (defaults to current directory)',
      },
      force: {
        type: 'boolean',
        description: 'Force initialization even if docs/ already exists',
      },
    },
  },
}

interface InitProjectArgs {
  path?: string
  force?: boolean
}

export async function handleInitProjectTool(args: InitProjectArgs): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()
  const docsPath = path.join(projectPath, 'docs')

  try {
    // Check if docs/ already exists
    const docsExists = await fs
      .access(docsPath)
      .then(() => true)
      .catch(() => false)

    if (docsExists && !args.force) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `docs/ directory already exists at ${docsPath}\n\nUse force: true to reinitialize, or explore existing documentation with:\n- list-templates to see available templates\n- Read guides at docent://guide/getting-started\n- Check runbooks at docent://runbook/*`,
          },
        ],
      }
    }

    // Analyze project for context
    const analysis = await analyzeProject(projectPath)

    // Create directory structure
    await createDirectoryStructure(docsPath)

    // Generate README.md
    const readme = generateReadme(analysis)
    await fs.writeFile(path.join(docsPath, 'README.md'), readme, 'utf-8')

    // Generate getting-started guide
    const gettingStarted = generateGettingStartedGuide(analysis)
    await fs.mkdir(path.join(docsPath, 'guides'), {recursive: true})
    await fs.writeFile(path.join(docsPath, 'guides', 'getting-started.md'), gettingStarted, 'utf-8')

    const summary = `✓ Initialized docent in ${projectPath}

Created structure:
  docs/
    ├── README.md              Documentation index
    ├── guides/                How-to documentation
    │   └── getting-started.md Initial guide
    ├── runbooks/              Operational procedures
    ├── adr/                   Architecture decisions
    ├── rfcs/                  Proposals and RFCs
    └── specs/                 Feature specifications

Project analysis:
  Languages: ${analysis.languages.join(', ') || 'Unknown'}
  Frameworks: ${analysis.frameworks.join(', ') || 'Unknown'}
  Build Tools: ${analysis.buildTools.join(', ') || 'Unknown'}

Next steps:
1. Review docs/README.md for documentation guidelines
2. Edit docs/guides/getting-started.md with project specifics
3. Use templates to create ADRs, RFCs, or runbooks as needed
4. Run 'docent audit' to assess documentation quality

Available templates:
- ADR: Architecture Decision Records
- RFC: Request for Comments
- Runbook: Operational procedures
- Spec: Feature specifications
- And 9 more...

Use 'list-templates' to see all available templates.`

    return {
      content: [
        {
          type: 'text' as const,
          text: summary,
        },
      ],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error initializing project: ${errorMessage}`,
        },
      ],
    }
  }
}

async function createDirectoryStructure(docsPath: string): Promise<void> {
  // Create main docs directory
  await fs.mkdir(docsPath, {recursive: true})

  // Create subdirectories
  const directories = ['guides', 'runbooks', 'adr', 'rfcs', 'specs', 'architecture']

  for (const dir of directories) {
    await fs.mkdir(path.join(docsPath, dir), {recursive: true})
  }

  // Create .journal directory (gitignored)
  await fs.mkdir(path.join(docsPath, '.journal'), {recursive: true})

  // Create .gitignore for .journal
  const gitignorePath = path.join(docsPath, '.gitignore')
  const gitignoreContent = `# Docent journal files (ephemeral agent state)
.journal/
`
  await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8')
}

function generateReadme(analysis: {languages: string[]; frameworks: string[]; buildTools: string[]}): string {
  return `# Project Documentation

This directory contains project documentation managed by [docent](https://github.com/tnez/docent).

## Project Info

- **Languages:** ${analysis.languages.join(', ') || 'Not detected'}
- **Frameworks:** ${analysis.frameworks.join(', ') || 'Not detected'}
- **Build Tools:** ${analysis.buildTools.join(', ') || 'Not detected'}

## Documentation Structure

\`\`\`
docs/
├── guides/        How-to documentation and tutorials
├── runbooks/      Step-by-step operational procedures
├── adr/          Architecture Decision Records
├── rfcs/         Requests for Comments (proposals)
├── specs/        Feature specifications
└── architecture/ System design and architecture docs
\`\`\`

## Quick Links

- [Getting Started](./guides/getting-started.md) - Set up and start contributing
- [Architecture Overview](./architecture/overview.md) - System design (create as needed)

## Using Docent

### Available via MCP

Access documentation through AI agents using the docent MCP server:

\`\`\`typescript
// List all available documentation
mcp.listResources()

// Read a specific guide
mcp.readResource('docent://guide/getting-started')

// Get a template
mcp.readResource('docent://template/adr')
\`\`\`

### Common Workflows

**Creating an ADR:**
1. Get template: \`readResource('docent://template/adr')\`
2. Fill in decision details
3. Save to \`docs/adr/adr-NNNN-title.md\`

**Creating a Runbook:**
1. Get template: \`readResource('docent://template/runbook')\`
2. Document operational procedure
3. Save to \`docs/runbooks/procedure-name.md\`

## Documentation Guidelines

- **ADRs** - Document significant architectural decisions
- **RFCs** - Propose changes for discussion before implementation
- **Runbooks** - Document operational procedures and troubleshooting
- **Guides** - Provide how-to documentation for contributors
- **Specs** - Define feature requirements and acceptance criteria

## Contributing

When adding documentation:

1. Choose the appropriate template
2. Follow the template structure
3. Keep docs up-to-date with code changes
4. Link related documents

Use \`docent audit\` to assess documentation quality and find gaps.
`
}

function generateGettingStartedGuide(analysis: {
  languages: string[]
  frameworks: string[]
  buildTools: string[]
}): string {
  const hasBuildTool = analysis.buildTools.length > 0
  const buildCommand = analysis.buildTools.includes('npm')
    ? 'npm install && npm run build'
    : analysis.buildTools.includes('cargo')
      ? 'cargo build'
      : 'See project README for build instructions'

  return `# Getting Started

## Prerequisites

- ${analysis.languages.length > 0 ? analysis.languages.join(', ') : 'Check project README for requirements'}
${hasBuildTool ? `- ${analysis.buildTools[0]} installed` : ''}

## Setup

1. **Clone the repository**

   \`\`\`bash
   git clone <repository-url>
   cd <project-name>
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   ${buildCommand}
   \`\`\`

3. **Run the project**

   \`\`\`bash
   # TODO: Add specific run commands for this project
   \`\`\`

## Project Structure

\`\`\`
# TODO: Document key directories and their purposes
\`\`\`

## Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit pull request

## Common Commands

\`\`\`bash
# TODO: Add project-specific commands
# Examples:
# npm test           # Run tests
# npm run dev        # Start development server
# npm run lint       # Check code quality
\`\`\`

## Testing

\`\`\`bash
# TODO: Add testing instructions
\`\`\`

## Troubleshooting

### Common Issues

**Issue:** Description of problem

**Solution:** Steps to resolve

## Next Steps

- Review [Architecture Overview](../architecture/overview.md)
- Check [Contributing Guidelines](./contributing.md)
- Explore [Runbooks](../runbooks/) for operational procedures

## Getting Help

- Check existing [Runbooks](../runbooks/)
- Review [Architecture Decisions](../adr/)
- Open an issue in the repository

---

**Note:** This guide was auto-generated by docent. Update it with project-specific details.
`
}
