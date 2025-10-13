#!/usr/bin/env node
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Import tool definitions and handlers
import {analyzeToolDefinition, handleAnalyzeTool} from './tools/analyze.js'
import {auditQualityToolDefinition, handleAuditQualityTool} from './tools/audit-quality.js'
import {auditToolDefinition, handleAuditTool} from './tools/audit.js'
import {listTemplatesToolDefinition, handleListTemplatesTool} from './tools/list-templates.js'
import {getTemplateToolDefinition, handleGetTemplateTool} from './tools/get-template.js'

// Get version from package.json
import * as fs from 'fs'
import * as path from 'path'
const pkgPath = path.join(__dirname, '..', '..', 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// Create MCP server
const server = new Server(
  {
    name: 'docket',
    version: pkg.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Register all available tools
const tools = [
  analyzeToolDefinition,
  auditQualityToolDefinition,
  auditToolDefinition,
  listTemplatesToolDefinition,
  getTemplateToolDefinition,
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
      case 'analyze':
        return await handleAnalyzeTool(args as {path: string})
      case 'audit-quality':
        return await handleAuditQualityTool(args as {path: string; docsDir?: string})
      case 'audit':
        return await handleAuditTool(args as {path: string; docsDir?: string})
      case 'list-templates':
        return await handleListTemplatesTool()
      case 'get-template':
        return await handleGetTemplateTool(args as {type: string})
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
  console.error('Docket MCP server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
