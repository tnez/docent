import * as fs from 'fs'
import * as path from 'path'

export const listTemplatesToolDefinition = {
  name: 'list-templates',
  description: 'List all available documentation templates',
  inputSchema: {
    type: 'object',
    properties: {},
  },
} as const

interface TemplateInfo {
  name: string
  type: string
  description: string
}

export async function handleListTemplatesTool() {
  const templatesDir = path.join(__dirname, '..', '..', '..', 'templates')

  const templates: TemplateInfo[] = [
    {
      name: 'ADR (Architecture Decision Record)',
      type: 'adr',
      description: 'Document architectural decisions with context, decision, and consequences',
    },
    {
      name: 'RFC (Request for Comments)',
      type: 'rfc',
      description: 'Propose features with motivation, design, and trade-offs',
    },
    {
      name: 'PRD (Product Requirements Document)',
      type: 'prd',
      description: 'Define product vision, user personas, and requirements',
    },
    {
      name: 'Architecture Overview',
      type: 'architecture',
      description: 'High-level system design and component relationships',
    },
    {
      name: 'API Documentation',
      type: 'api',
      description: 'Document API endpoints, authentication, and usage',
    },
    {
      name: 'Onboarding Guide',
      type: 'onboarding',
      description: 'Help new team members get started',
    },
    {
      name: 'Testing Guide',
      type: 'testing',
      description: 'Document testing philosophy, structure, and commands',
    },
    {
      name: 'Runbook',
      type: 'runbook',
      description: 'Operational procedures and troubleshooting',
    },
    {
      name: 'Standards',
      type: 'standards',
      description: 'Coding conventions, style guides, and best practices',
    },
    {
      name: 'Behavioral Specification',
      type: 'spec',
      description: 'Feature behavior with scenarios and examples',
    },
  ]

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(templates, null, 2),
      },
    ],
  }
}
