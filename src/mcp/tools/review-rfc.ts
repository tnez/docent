import {WorkflowContextGatherer} from '../workflows/context-gatherer.js'

export const reviewRfcToolDefinition = {
  name: 'review-rfc',
  description:
    'Gather context for RFC review: RFC content, project analysis, and relevant metadata. Use this to prepare for reviewing an RFC from a specific perspective (architecture, security, or implementation).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      rfc_path: {
        type: 'string' as const,
        description: 'Path to RFC file (e.g., docs/rfcs/rfc-0005-enhanced-mcp-architecture.md)',
      },
      perspective: {
        type: 'string' as const,
        description: 'Review perspective: architecture, security, implementation, or all',
        enum: ['architecture', 'security', 'implementation', 'all'],
      },
    },
    required: ['rfc_path'],
  },
}

export async function handleReviewRfcTool(args: {
  rfc_path: string
  perspective?: string
}): Promise<{content: Array<{type: 'text'; text: string}>}> {
  const {rfc_path, perspective = 'architecture'} = args

  const gatherer = new WorkflowContextGatherer()
  const context = await gatherer.gatherReviewRfcContext(rfc_path, perspective)

  const output = `# RFC Review Context: ${context.title}

## RFC Content

<rfc path="${context.rfcPath}">
${context.rfcContent}
</rfc>

---

## Project Context

- **Languages**: ${context.projectLanguages.join(', ')}
- **Frameworks**: ${context.projectFrameworks.join(', ')}
- **Build Tools**: ${context.projectBuildTools.join(', ')}

---

## Review Perspective

${perspective}

---

## Suggested Review Criteria

${getReviewCriteria(perspective)}

---

## Next Steps

Conduct a ${perspective} review of this RFC using the criteria above. Provide:
- Overall assessment (APPROVE | APPROVE_WITH_CHANGES | REQUEST_CHANGES | REJECT)
- Blockers (critical issues)
- Major concerns
- Minor issues
- Recommendations
- Strengths
`

  return {
    content: [
      {
        type: 'text',
        text: output,
      },
    ],
  }
}

function getReviewCriteria(perspective: string): string {
  switch (perspective) {
    case 'architecture':
      return `- **System Design**: Is the design clear, complete, and well-integrated?
- **Scalability**: Can this handle growth in users, data, or complexity?
- **Maintainability**: Will this be easy to understand and modify?
- **Technical Debt**: Does this introduce or reduce technical debt?
- **Alternatives**: Have other approaches been considered?
- **Integration**: How does this fit with existing systems?`

    case 'security':
      return `- **Threat Model**: What are the security implications?
- **Data Protection**: How is sensitive data handled?
- **Authentication/Authorization**: Are access controls appropriate?
- **Input Validation**: How is untrusted input sanitized?
- **Secrets Management**: Are credentials and keys handled securely?
- **Attack Surface**: Does this introduce new vulnerabilities?`

    case 'implementation':
      return `- **Feasibility**: Can this be implemented as described?
- **Complexity**: Is the implementation complexity justified?
- **Testing**: Is there a clear testing strategy?
- **Migration**: Is there a safe rollout plan?
- **Performance**: What are the performance implications?
- **Developer Experience**: Will this be easy to work with?`

    case 'all':
      return getReviewCriteria('architecture') + '\n\n' + getReviewCriteria('security') + '\n\n' + getReviewCriteria('implementation')

    default:
      return `- Review the proposal for clarity, completeness, and feasibility
- Consider implications and potential issues
- Suggest improvements and alternatives`
  }
}
