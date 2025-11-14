#!/usr/bin/env node
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Import tool definitions and handlers - Docent 2.0 only
import {startToolDefinition, handleStartTool} from './tools/start.js'
import {actToolDefinition, handleActTool} from './tools/act.js'
import {askToolDefinition, handleAskTool} from './tools/ask.js'
import {tellToolDefinition, handleTellTool} from './tools/tell.js'

import {createContext} from '../core/context.js'

// Get version from package.json
import * as fs from 'fs'
import * as path from 'path'
const pkgPath = path.join(__dirname, '..', '..', 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// Create MCP server
const server = new Server(
  {
    name: 'docent',
    version: pkg.version,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
)

// Create application context
const packagePath = path.join(__dirname, '..', '..')
const ctx = createContext(process.cwd(), packagePath)

// Register all available tools - Docent 2.0 only
const tools = [
  startToolDefinition, // Session initialization
  actToolDefinition, // Execute runbooks (replaces: bootstrap, doctor, file-issue)
  askToolDefinition, // Search documentation
  tellToolDefinition, // Write documentation (replaces: capture-work)
  // Legacy tools removed - all functionality moved to ask/act/tell paradigm
]

// Handle tools/list request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  }
})

// Handle tools/call request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args} = request.params

  try {
    switch (name) {
      case 'start':
        return await handleStartTool(args as {path?: string})
      case 'act':
        return await handleActTool(args as {directive: string; path?: string})
      case 'ask':
        return await handleAskTool(args as {query: string; path?: string; limit?: number})
      case 'tell':
        return await handleTellTool(args as {statement: string; path?: string}, server)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
})

// Handle resources/list request
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources: Array<{uri: string; name: string; description?: string; mimeType?: string}> = []

  const discoverSkills = (dir: string, basePath: string = ''): void => {
    if (!fs.existsSync(dir)) return

    const entries = fs.readdirSync(dir, {withFileTypes: true})
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = basePath ? `${basePath}/${entry.name}` : entry.name
        const skillFile = path.join(dir, entry.name, 'SKILL.md')

        if (fs.existsSync(skillFile)) {
          // This directory contains a skill
          const content = fs.readFileSync(skillFile, 'utf-8')
          const nameMatch = content.match(/^name:\s*(.+)$/m)
          const descMatch = content.match(/^description:\s*(.+)$/m)

          resources.push({
            uri: `docent://skills/${skillPath}`,
            name: nameMatch ? nameMatch[1].trim() : skillPath,
            description: descMatch ? descMatch[1].trim() : undefined,
            mimeType: 'text/markdown',
          })
        }

        // Recurse into subdirectories
        discoverSkills(path.join(dir, entry.name), skillPath)
      }
    }
  }

  try {
    // Discover bundled skills
    const bundledSkillsPath = path.join(__dirname, '..', 'skills')
    discoverSkills(bundledSkillsPath)

    // Discover local (custom) skills
    const config = ctx.config
    const localSkillsPath = path.join(config.docsRoot, 'skills')
    discoverSkills(localSkillsPath)
  } catch (error) {
    console.error('Error discovering skills:', error)
  }

  return {resources}
})

// Handle resources/read request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri

  if (!uri.startsWith('docent://skills/')) {
    throw new Error(`Unsupported resource URI: ${uri}`)
  }

  const skillPath = uri.replace('docent://skills/', '')

  // Try local (custom) skills first, then bundled skills
  const config = ctx.config
  const localSkillFile = path.join(config.docsRoot, 'skills', skillPath, 'SKILL.md')
  const bundledSkillFile = path.join(__dirname, '..', 'skills', skillPath, 'SKILL.md')

  let skillFile: string
  if (fs.existsSync(localSkillFile)) {
    skillFile = localSkillFile
  } else if (fs.existsSync(bundledSkillFile)) {
    skillFile = bundledSkillFile
  } else {
    throw new Error(`Skill not found: ${skillPath}`)
  }

  const content = fs.readFileSync(skillFile, 'utf-8')

  return {
    contents: [
      {
        uri,
        mimeType: 'text/markdown',
        text: content,
      },
    ],
  }
})

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Log to stderr (stdout is used for MCP protocol)
  console.error('Docent MCP server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
