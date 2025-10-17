#!/usr/bin/env node
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Import tool definitions and handlers
import {analyzeToolDefinition, handleAnalyzeTool} from './tools/analyze.js'
import {auditToolDefinition, handleAuditTool} from './tools/audit.js'
import {doctorToolDefinition, handleDoctorTool} from './tools/doctor.js'
import {listTemplatesToolDefinition, handleListTemplatesTool} from './tools/list-templates.js'
import {getTemplateToolDefinition, handleGetTemplateTool} from './tools/get-template.js'
import {captureWorkToolDefinition, handleCaptureWorkTool} from './tools/capture-work.js'
import {resumeWorkToolDefinition, handleResumeWorkTool} from './tools/resume-work.js'
import {reviewRfcToolDefinition, handleReviewRfcTool} from './tools/review-rfc.js'
import {initProjectToolDefinition, handleInitProjectTool} from './tools/init-project.js'

// Import resource and prompt handlers
import {ResourceHandler} from './resources/handler.js'
import {PromptBuilder} from './prompts/builder.js'
import {PROMPTS} from './prompts/definitions.js'

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
      prompts: {},
    },
  }
)

// Initialize resource and prompt handlers
const resourceHandler = new ResourceHandler()
const promptBuilder = new PromptBuilder()

// Register all available tools
const tools = [
  initProjectToolDefinition,
  analyzeToolDefinition,
  auditToolDefinition,
  doctorToolDefinition,
  listTemplatesToolDefinition,
  getTemplateToolDefinition,
  captureWorkToolDefinition,
  resumeWorkToolDefinition,
  reviewRfcToolDefinition,
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
      case 'init-project':
        return await handleInitProjectTool(args as {path?: string; force?: boolean})
      case 'analyze':
        return await handleAnalyzeTool(args as {path: string})
      case 'audit':
        return await handleAuditTool(args as {path: string; docsDir?: string})
      case 'doctor':
        return await handleDoctorTool(args as {path?: string; docsDir?: string; checks?: string[]})
      case 'list-templates':
        return await handleListTemplatesTool()
      case 'get-template':
        return await handleGetTemplateTool(args as {type: string})
      case 'capture-work':
        return await handleCaptureWorkTool(
          args as {summary: string; discoveries?: string[]; next_steps?: string[]; questions?: string[]}
        )
      case 'resume-work':
        return await handleResumeWorkTool()
      case 'review-rfc':
        return await handleReviewRfcTool(args as {rfc_path: string; perspective?: string})
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

// ===== RESOURCES =====

// Handle resources/list request
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const resources = await resourceHandler.list()
    return {resources}
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error listing resources:', errorMessage)
    return {resources: []}
  }
})

// Handle resources/read request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const {uri} = request.params

  try {
    const content = await resourceHandler.read(uri)
    return {
      contents: [content],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read resource ${uri}: ${errorMessage}`)
  }
})

// ===== PROMPTS =====

// Handle prompts/list request
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS),
  }
})

// Handle prompts/get request
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const {name, arguments: args = {}} = request.params

  try {
    const result = await promptBuilder.build(name, args)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to build prompt ${name}: ${errorMessage}`)
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
