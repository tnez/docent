#!/usr/bin/env node
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
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
        return await handleTellTool(args as {statement: string; path?: string})
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
