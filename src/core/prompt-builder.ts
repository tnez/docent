import type {AgentAuditContext} from './agent-audit.js'

/**
 * Build audit assessment prompt for agent
 */
export function buildAuditPrompt(context: AgentAuditContext): string {
  const {project, docs} = context

  return `# Documentation Quality Assessment

## Project Context

**Languages:** ${project.languages.join(', ') || 'Unknown'}
**Frameworks:** ${project.frameworks.join(', ') || 'None detected'}
**Build Tools:** ${project.buildTools.join(', ') || 'None detected'}

**Project Structure:**
- Has Tests: ${project.structure.hasTests ? 'Yes' : 'No'}
- Has Docs: ${project.structure.hasDocs ? 'Yes' : 'No'}
- Source Directory: ${project.structure.sourceDir || 'Unknown'}

## Documentation Inventory

**Total Files:** ${docs.totalFiles}

${
  docs.files.length > 0
    ? docs.files
        .map(f => `- ${f.path} (${f.size} bytes)`)
        .slice(0, 50)
        .join('\n')
    : 'No documentation files found'
}

## Assessment Task

Please evaluate this project's documentation quality on a scale of 0-100, considering:

### Completeness (30 points)
- Are all critical documentation types present for this project type?
- Architecture docs needed if: multiple languages OR complex frameworks
- API docs needed if: backend framework detected
- Testing docs needed if: tests directory exists
- ADRs recommended if: frameworks in use

### Accuracy (25 points)
- Do documented frameworks match actual dependencies?
- Is architecture documentation consistent with project structure?
- Are examples and code snippets accurate?

### Coherence (20 points)
- Are docs internally consistent?
- Do documents link to each other appropriately?
- Is naming consistent across documents?

### Depth (15 points)
- Are explanations detailed enough?
- Do docs explain "why" not just "what"?
- Are edge cases and limitations documented?

### Context-Appropriateness (10 points)
- Is documentation appropriate for project complexity?
- Are docs tailored to project type?

## Output Format

Provide your assessment in this format:

**Score:** [0-100]

**Strengths:**
- [What's done well]

**Critical Gaps:**
- [High priority missing documentation]

**Recommendations:**
- [Specific suggestions for improvement]

**Summary:**
[2-3 sentence overall assessment]
`
}
