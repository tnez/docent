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
import {startToolDefinition, handleStartTool} from './tools/start.js'
import {analyzeToolDefinition, handleAnalyzeTool} from './tools/analyze.js'
import {auditToolDefinition, handleAuditTool} from './tools/audit.js'
import {doctorToolDefinition, handleDoctorTool} from './tools/doctor.js'
import {listTemplatesToolDefinition, handleListTemplatesTool} from './tools/list-templates.js'
import {getTemplateToolDefinition, handleGetTemplateTool} from './tools/get-template.js'
import {captureWorkToolDefinition, handleCaptureWorkTool} from './tools/capture-work.js'
import {resumeWorkToolDefinition, handleResumeWorkTool} from './tools/resume-work.js'
import {reviewRfcToolDefinition, handleReviewRfcTool} from './tools/review-rfc.js'
import {bootstrapToolDefinition, handleBootstrapTool} from './tools/bootstrap.js'
import {fileIssueToolDefinition, handleFileIssueTool} from './tools/file-issue.js'

// Import resource and prompt handlers
import {ResourceHandler} from './resources/handler.js'
import {PromptBuilder} from './prompts/builder.js'
import {PROMPTS} from './prompts/definitions.js'
import {createContext} from '../lib/context.js'

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

// Create application context
const packagePath = path.join(__dirname, '..', '..')
const ctx = createContext(process.cwd(), packagePath)

// Initialize resource and prompt handlers
const resourceHandler = new ResourceHandler(ctx)
const promptBuilder = new PromptBuilder()

// Register all available tools
const tools = [
  startToolDefinition, // NEW: docent 2.0 session initialization
  bootstrapToolDefinition,
  analyzeToolDefinition,
  auditToolDefinition,
  doctorToolDefinition,
  listTemplatesToolDefinition,
  getTemplateToolDefinition,
  captureWorkToolDefinition,
  resumeWorkToolDefinition,
  reviewRfcToolDefinition,
  fileIssueToolDefinition,
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
      case 'bootstrap':
        return await handleBootstrapTool(args as {path?: string; force?: boolean})
      case 'init-project': {
        // Backward compatibility - deprecated
        const result = await handleBootstrapTool(args as {path?: string; force?: boolean})
        // Prepend deprecation warning to result
        result.content[0].text = `⚠️  DEPRECATION: 'init-project' has been renamed to 'bootstrap'. Please update your scripts.\n\n${result.content[0].text}`
        return result
      }
      case 'analyze':
        return await handleAnalyzeTool(args as {path: string})
      case 'doctor':
        return await handleDoctorTool(args as {path?: string; docsDir?: string; checks?: string[]; quick?: boolean})
      case 'audit': {
        // Backward compatibility - deprecated, now merged into doctor
        const result = await handleDoctorTool({
          ...args as {path: string; docsDir?: string},
          quick: false, // Always include semantic analysis for audit
        })
        // Prepend deprecation warning
        result.content[0].text = `⚠️ DEPRECATION: 'audit' has been merged into 'doctor'. Use 'doctor' for full analysis or 'doctor --quick' for fast checks.\n\n${result.content[0].text}`
        return result
      }
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
      case 'file-issue':
        return await handleFileIssueTool(
          args as {
            title: string
            type: 'bug' | 'feature' | 'question' | 'documentation'
            description: string
            reproductionSteps?: string
            expectedBehavior?: string
            actualBehavior?: string
            useCase?: string
            suggestion?: string
          }
        )
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
