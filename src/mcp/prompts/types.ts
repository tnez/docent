/**
 * Prompt types and interfaces for MCP prompts
 */

export interface Prompt {
  name: string
  description: string
  arguments?: PromptArgument[]
}

export interface PromptArgument {
  name: string
  description: string
  required: boolean
}

export interface PromptMessage {
  role: 'user' | 'assistant'
  content: PromptContent
}

export type PromptContent = TextContent | ResourceContent | ImageContent

export interface TextContent {
  type: 'text'
  text: string
}

export interface ResourceContent {
  type: 'resource'
  resource: {
    uri: string
    text: string
    mimeType?: string
  }
}

export interface ImageContent {
  type: 'image'
  data: string
  mimeType: string
}

export interface PromptResult {
  description?: string
  messages: PromptMessage[]
}
