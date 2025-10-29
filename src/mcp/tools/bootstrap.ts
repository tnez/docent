import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs/promises'
import * as path from 'path'
import {analyzeProject} from '../../core/detector.js'
import {
  parseTemplateUrl,
  cloneTemplate,
  copyLocalTemplate,
  validateTemplate,
  createTempDir,
  cleanupTempDir,
  copyTemplateDocs,
  backupExistingDocs,
} from '../../core/template.js'

export const bootstrapToolDefinition: Tool = {
  name: 'bootstrap',
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
      template: {
        type: 'string',
        description:
          'Git repository URL or local path to a template. Supports GitHub/GitLab URLs with branch/tag (e.g., https://github.com/user/repo#v1.0)',
      },
    },
  },
}

interface BootstrapArgs {
  path?: string
  force?: boolean
  template?: string
}

export async function handleBootstrapTool(args: BootstrapArgs): Promise<{content: TextContent[]}> {
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

    // Handle template if provided
    let templateInfo: string | undefined
    let backupInfo: string | undefined
    let tempDir: string | undefined

    if (args.template) {
      try {
        const parsed = parseTemplateUrl(args.template)
        tempDir = await createTempDir()

        // Clone or copy template
        if (parsed.isLocal) {
          await copyLocalTemplate(parsed.gitUrl, tempDir)
          templateInfo = `Applied local template: ${parsed.gitUrl}`
        } else {
          await cloneTemplate(parsed, tempDir)
          templateInfo = `Applied template: ${parsed.name}${parsed.ref ? ` (${parsed.ref})` : ' (main branch)'}`
        }

        // Validate template
        const validation = await validateTemplate(tempDir)
        if (!validation.valid) {
          throw new Error(
            `Template validation failed:\n  ${validation.errors.join('\n  ')}\n\n` +
              `Valid templates must have:\n` +
              `  - docs/ directory at repository root\n` +
              `  - At least one file or subdirectory in docs/`,
          )
        }

        // Backup existing docs if force flag is used
        if (docsExists && args.force) {
          backupInfo = await backupExistingDocs(docsPath)
          await fs.rm(docsPath, {recursive: true, force: true})
        }

        // Copy template docs/ to project
        await copyTemplateDocs(tempDir, docsPath)
      } finally {
        // Always clean up temp directory
        if (tempDir) {
          await cleanupTempDir(tempDir)
        }
      }
    } else {
      // Create directory structure (standard bootstrap without template)
      await createDirectoryStructure(docsPath)
    }

    // Analyze project for context
    const analysis = await analyzeProject(projectPath)

    // Generate or update files based on whether template was used
    if (!args.template) {
      // Standard bootstrap: generate all files
      const readme = generateReadme(analysis)
      await fs.writeFile(path.join(docsPath, 'README.md'), readme, 'utf-8')

      const gettingStarted = generateGettingStartedGuide(analysis)
      await fs.mkdir(path.join(docsPath, 'guides'), {recursive: true})
      await fs.writeFile(path.join(docsPath, 'guides', 'getting-started.md'), gettingStarted, 'utf-8')
    } else {
      // With template: only generate getting-started if it doesn't exist
      const gettingStartedPath = path.join(docsPath, 'guides', 'getting-started.md')
      const gettingStartedExists = await fs
        .access(gettingStartedPath)
        .then(() => true)
        .catch(() => false)

      if (!gettingStartedExists) {
        const gettingStarted = generateGettingStartedGuide(analysis)
        await fs.mkdir(path.join(docsPath, 'guides'), {recursive: true})
        await fs.writeFile(gettingStartedPath, gettingStarted, 'utf-8')
      }
    }

    // Setup agent configuration
    const agentConfigResult = await setupAgentConfig(projectPath)

    const summary = `✓ Initialized docent in ${projectPath}
${templateInfo ? `\n${templateInfo}` : ''}
${backupInfo ? `\nBackup created: ${backupInfo}` : ''}

Created structure:
  docs/
    ├── README.md              Documentation index
    ├── guides/                How-to documentation
    │   └── getting-started.md Initial guide
    ├── runbooks/              Operational procedures
    ├── adr/                   Architecture decisions
    ├── rfcs/                  Proposals and RFCs
    └── specs/                 Feature specifications

Agent configuration:
  ${agentConfigResult}

Project analysis:
  Languages: ${analysis.languages.join(', ') || 'Unknown'}
  Frameworks: ${analysis.frameworks.join(', ') || 'Unknown'}
  Build Tools: ${analysis.buildTools.join(', ') || 'Unknown'}

Next steps:
1. Review docs/README.md for documentation guidelines
2. Edit docs/guides/getting-started.md with project specifics
3. Use templates to create ADRs, RFCs, or runbooks as needed
4. Run 'docent doctor' to check project health and documentation quality

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

Use \`docent doctor\` to check project health and documentation quality.
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

/**
 * Detect existing agent configuration files in priority order
 */
async function detectAgentConfigFile(projectPath: string): Promise<string | null> {
  const configFiles = [
    'AGENTS.md',           // Agent-agnostic standard (preferred)
    'CLAUDE.md',           // Claude-specific
    '.claude/CLAUDE.md',   // Claude-specific (alternate location)
    '.cursorrules',        // Cursor-specific
    '.aiderules',          // Aider-specific
  ]

  for (const file of configFiles) {
    const filePath = path.join(projectPath, file)
    const exists = await fs.access(filePath).then(() => true).catch(() => false)
    if (exists) {
      return file
    }
  }

  return null
}

/**
 * Generate docent initialization instructions for agent config files
 */
function generateDocentInstructions(): string {
  return `
## Docent Integration

This project uses [docent](https://github.com/tnez/docent) for documentation intelligence via MCP.

### Session Initialization

**CRITICAL:** At the start of NEW sessions and after COMPACTION, you MUST initialize docent context as your FIRST ACTION before any other work.

**Initialization Command:**

Run \`docent context\` or explicitly: "read the docent://meta/context resource"

**When to Initialize:**
- At the beginning of a new session (context window is empty)
- After a \`/compact\` operation (context was reset)
- When the user explicitly requests it

**When NOT to Initialize:**
- When resuming with \`claude --continue\` (init content is already in context)
- When init content is visible earlier in the conversation

**What This Provides:**
- Available documentation resources (guides, runbooks, ADRs, RFCs, templates)
- Journal workflow for session continuity
- Project-specific conventions and standards
- Quick reference for common documentation tasks

**Important Notes:**
- Do NOT attempt to call MCP resources from SessionStart hooks - MCP servers may not be initialized yet
- This initialization happens in your first response after MCP servers are ready
- If you don't have MCP access, inform the user to check MCP server status

### Working with Docent

- **List resources**: \`mcp.listResources()\` to see all available documentation
- **Read guides**: \`mcp.readResource('docent://guide/getting-started')\`
- **Use templates**: \`mcp.readResource('docent://template/adr')\`
- **Capture work**: Use \`capture-work\` tool to maintain session journal
- **Resume work**: Use \`resume-work\` tool to recover context after interruptions

For more information, see \`docs/README.md\`.
`
}

/**
 * Setup agent configuration by detecting existing files or creating AGENTS.md
 */
async function setupAgentConfig(projectPath: string): Promise<string> {
  const existingConfig = await detectAgentConfigFile(projectPath)
  const docentInstructions = generateDocentInstructions()

  if (existingConfig) {
    // Merge into existing file
    const configPath = path.join(projectPath, existingConfig)
    let content = await fs.readFile(configPath, 'utf-8')

    // Check if docent instructions already exist
    if (content.includes('## Docent Integration') || content.includes('docent://meta/context')) {
      return `Found existing agent config: ${existingConfig} (already includes docent instructions)`
    }

    // Append docent instructions
    content += '\n' + docentInstructions
    await fs.writeFile(configPath, content, 'utf-8')

    return `Updated ${existingConfig} with docent integration instructions`
  } else {
    // Create new AGENTS.md (agent-agnostic)
    const agentsPath = path.join(projectPath, 'AGENTS.md')
    const content = `# Agent Instructions

This file contains instructions for AI agents working on this project.

${docentInstructions}

## General Guidelines

- Follow existing code conventions and patterns
- Keep documentation up-to-date with code changes
- Use docent tools for creating ADRs, RFCs, and other documentation
- Capture important decisions and context in the work journal
`

    await fs.writeFile(agentsPath, content, 'utf-8')
    return 'Created AGENTS.md with docent integration instructions'
  }
}
