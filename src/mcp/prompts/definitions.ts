import type {Prompt} from './types.js'

/**
 * Available prompts that agents can invoke
 */
export const PROMPTS: Record<string, Prompt> = {
  'resume-work': {
    name: 'resume-work',
    description: 'Session recovery: analyze recent work and provide context to continue',
    arguments: [],
  },

  'review-rfc': {
    name: 'review-rfc',
    description: 'Conduct multi-perspective RFC review with context gathering',
    arguments: [
      {
        name: 'rfc_path',
        description: 'Path to RFC file (e.g., .docent/rfcs/rfc-0005-enhanced-mcp-architecture.md)',
        required: true,
      },
      {
        name: 'perspective',
        description: 'Review perspective: architecture, security, implementation, or all',
        required: false,
      },
    ],
  },

  'create-adr': {
    name: 'create-adr',
    description: 'Create new Architecture Decision Record with guided process',
    arguments: [
      {
        name: 'title',
        description: 'ADR title',
        required: true,
      },
    ],
  },

  'plan-feature': {
    name: 'plan-feature',
    description: 'Research and plan new feature: research → design → spec',
    arguments: [
      {
        name: 'description',
        description: 'Feature description',
        required: true,
      },
    ],
  },

  'research-topic': {
    name: 'research-topic',
    description: 'Conduct structured research on a topic and create documentation',
    arguments: [
      {
        name: 'topic',
        description: 'Research topic or question (e.g., "MCP resources and prompts implementation")',
        required: true,
      },
      {
        name: 'context',
        description: 'Additional context or specific questions to explore',
        required: false,
      },
    ],
  },

  'init-session': {
    name: 'init-session',
    description: 'Bootstrap work session with project context and docent guidelines',
    arguments: [
      {
        name: 'focus',
        description: 'Optional focus area: development, operations, documentation',
        required: false,
      },
    ],
  },
}
