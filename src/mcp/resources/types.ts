/**
 * Resource types and interfaces for MCP resources
 */

export type ResourceType = 'runbook' | 'template' | 'standard' | 'guide' | 'adr' | 'rfc' | 'doc' | 'journal'

export interface Resource {
  uri: string
  name: string
  description?: string
  mimeType: string
  metadata?: {
    tags?: string[]
    lastModified?: string
    related?: string[]
  }
}

export interface ResourceContent {
  uri: string
  mimeType: string
  text?: string
  blob?: string
}

export interface ParsedUri {
  type: ResourceType
  identifier: string
}
