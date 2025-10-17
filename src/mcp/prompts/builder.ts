import * as path from 'path'
import * as fs from 'fs/promises'
import {analyzeProject} from '../../lib/detector.js'
import {ResourceHandler} from '../resources/handler.js'
import {WorkflowContextGatherer} from '../workflows/context-gatherer.js'
import type {PromptMessage} from './types.js'
import {PROMPTS} from './definitions.js'

export class PromptBuilder {
  private resourceHandler: ResourceHandler
  private contextGatherer: WorkflowContextGatherer

  constructor(basePath: string = process.cwd()) {
    this.resourceHandler = new ResourceHandler(basePath)
    this.contextGatherer = new WorkflowContextGatherer(basePath)
  }

  /**
   * Build a prompt with context gathering
   */
  async build(name: string, args: Record<string, string> = {}): Promise<{description?: string; messages: PromptMessage[]}> {
    const prompt = PROMPTS[name]
    if (!prompt) {
      throw new Error(`Unknown prompt: ${name}`)
    }

    // Validate required arguments
    for (const arg of prompt.arguments || []) {
      if (arg.required && !args[arg.name]) {
        throw new Error(`Missing required argument: ${arg.name}`)
      }
    }

    // Route to specific prompt builder
    switch (name) {
      case 'resume-work':
        return this.buildResumeWork()
      case 'review-rfc':
        return this.buildReviewRfc(args)
      case 'create-adr':
        return this.buildCreateAdr(args)
      case 'plan-feature':
        return this.buildPlanFeature(args)
      case 'research-topic':
        return this.buildResearchTopic(args)
      case 'init-session':
        return this.buildInitSession(args)
      default:
        throw new Error(`Prompt builder not implemented: ${name}`)
    }
  }

  /**
   * Build "Resume Work" prompt
   */
  private async buildResumeWork(): Promise<{description?: string; messages: PromptMessage[]}> {
    // Use shared context gatherer (single source of truth)
    const context = await this.contextGatherer.gatherResumeWorkContext()

    const prompt = `# Resume Work - Session Continuation

You are helping me continue work after a context window reset. I need you to synthesize the work context below into an effective continuation prompt that minimizes context loss and allows seamless resumption.

## Context Gathered

### Work Journal (.docent/journal.md)
<journal>
${context.journal}
</journal>

### Recent Commits (last 10)
\`\`\`
${context.commits}
\`\`\`

### Git Status
\`\`\`
${context.gitStatus}
\`\`\`

### TODOs Found
\`\`\`
${context.todos}
\`\`\`

## Suggested Health Checks

Before continuing work, consider verifying project health. This project may have runbooks or documentation that specify how to check:

1. **CI/Build Status**
   - Check if continuous integration is passing
   - Look for runbooks in \`docs/runbooks/*\` that document health checks
   - Review recent build/test failures if any

2. **Code Quality**
   - Verify linting passes
   - Check for test failures
   - Review any static analysis warnings

3. **Project Cleanup**
   - Review untracked files in git status (potential cruft to clean up)
   - Check for leftover temporary files
   - Verify no sensitive files are uncommitted

4. **Documentation Sync**
   - Ensure recent changes are documented
   - Check if architecture docs need updating
   - Verify runbooks reflect current procedures

**How to check:** If this project has runbooks (accessible via \`docent://runbook/*\` resources), review them for project-specific verification procedures. Projects often document their health check commands in runbooks.

## Your Task

Analyze the context above and generate a comprehensive continuation prompt. Focus on extracting insights and rationale, not just summarizing facts.

**Critical considerations:**

1. **Mission & Objective**: What is the main goal of this project/feature? What progress has been made toward it?

2. **Key Discoveries**: What important decisions, patterns, or constraints were discovered that must be preserved? (Don't just list what was done - explain what was learned)

3. **Files Modified**: What files were changed and **WHY**? What was the rationale behind each significant change?

4. **Partially Explored Ideas**: Are there any ongoing threads of thought or partially explored approaches that shouldn't be lost? What questions remain unanswered?

5. **Immediate Next Steps**: What should be done next? (Prioritized, with rationale)

6. **Pending Work**: Are there pending commits, reviews, validations, or other work in progress?

7. **Context That Can't Be Lost**: What critical context or constraints must the next session understand to avoid backtracking?

## Output Format

Structure your response in whatever format will be most effective for continuation. The goal is that another Claude instance reading your output should be able to continue as if no context window reset occurred.

Be specific, cite file paths with line numbers where relevant, and focus on **why** things were done, not just **what** was done.
`

    return {
      description: 'Session recovery with work context',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    }
  }

  /**
   * Build "Review RFC" prompt
   */
  private async buildReviewRfc(args: Record<string, string>): Promise<{description?: string; messages: PromptMessage[]}> {
    const {rfc_path, perspective = 'architecture'} = args

    if (!rfc_path) {
      throw new Error('Missing required argument: rfc_path')
    }

    // Use shared context gatherer (single source of truth)
    const context = await this.contextGatherer.gatherReviewRfcContext(rfc_path, perspective)

    const prompt = `# RFC Review: ${context.perspective} Perspective

## Your Task

Conduct a thorough ${context.perspective} review of the RFC: ${context.title}

## RFC Content

<rfc path="${context.rfcPath}">
${context.rfcContent}
</rfc>

## Project Context

- **Languages**: ${context.projectLanguages.join(', ')}
- **Frameworks**: ${context.projectFrameworks.join(', ')}
- **Build Tools**: ${context.projectBuildTools.join(', ')}

## Review Criteria

${this.getReviewCriteria(context.perspective)}

## Process

1. Read the RFC carefully
2. Review related documentation for context
3. Apply ${context.perspective} review criteria
4. Identify blockers, concerns, and recommendations
5. Provide structured assessment

## Output Format

Provide your assessment using this structure:

- **Overall Assessment**: APPROVE | APPROVE_WITH_CHANGES | REQUEST_CHANGES | REJECT
- **Blockers**: Critical issues that must be addressed before proceeding
- **Major Concerns**: Significant issues to consider
- **Minor Issues**: Small improvements that would enhance the RFC
- **Recommendations**: Suggestions for making the proposal stronger
- **Strengths**: What's done well in this RFC

Be specific and cite sections of the RFC when providing feedback.
`

    return {
      description: `RFC review from ${context.perspective} perspective`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    }
  }

  /**
   * Build "Create ADR" prompt
   */
  private async buildCreateAdr(args: Record<string, string>): Promise<{description?: string; messages: PromptMessage[]}> {
    const {title} = args

    if (!title) {
      throw new Error('Missing required argument: title')
    }

    // Get ADR template
    const template = await this.resourceHandler.read('docent://template/adr')

    const prompt = `# Create Architecture Decision Record

## Your Task

Help me create an Architecture Decision Record (ADR) for: **${title}**

## ADR Template

I'll guide you through creating an ADR using our standard template. Here's the template structure:

<template>
${template.text}
</template>

## Process

Let's work through this step by step:

1. **Title**: We have "${title}" - is this clear and specific enough?
2. **Status**: This will be "Proposed" initially
3. **Context**: What's the situation or problem we're addressing?
4. **Decision**: What are we deciding to do?
5. **Consequences**: What are the implications (both positive and negative)?
6. **Alternatives Considered**: What other options did we evaluate?

Please ask me questions to gather the information needed for each section, then draft the ADR.
`

    return {
      description: 'Guided ADR creation process',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    }
  }

  /**
   * Build "Plan Feature" prompt
   */
  private async buildPlanFeature(args: Record<string, string>): Promise<{description?: string; messages: PromptMessage[]}> {
    const {description} = args

    if (!description) {
      throw new Error('Missing required argument: description')
    }

    // Get project analysis for context
    const analysis = await analyzeProject(process.cwd())

    const prompt = `# Feature Planning

## Feature Description

${description}

## Your Task

Help me plan this feature from research through implementation. Follow this process:

### 1. Research Phase
- Understand requirements and constraints
- Research existing patterns in our codebase
- Identify similar features in the project
- Research best practices and libraries

### 2. Design Phase
- Propose high-level architecture
- Identify components that need to be created/modified
- Consider data models and API contracts
- Think about testing strategy

### 3. Specification Phase
- Create a detailed specification
- Define acceptance criteria
- Outline implementation steps
- Identify potential risks

## Project Context

- **Languages**: ${analysis.languages.join(', ')}
- **Frameworks**: ${analysis.frameworks.join(', ')}
- **Build Tools**: ${analysis.buildTools.join(', ')}

## Process

Let's start with the research phase. Please:
1. Ask me clarifying questions about the feature
2. Search the codebase for related patterns
3. Propose an initial design approach
4. Create a detailed specification

What questions do you have to get started?
`

    return {
      description: 'Feature planning from research to spec',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    }
  }

  /**
   * Build "Research Topic" prompt
   */
  private async buildResearchTopic(args: Record<string, string>): Promise<{description?: string; messages: PromptMessage[]}> {
    const {topic, context = ''} = args

    if (!topic) {
      throw new Error('Missing required argument: topic')
    }

    // Get project analysis for context
    const analysis = await analyzeProject(process.cwd())

    // Generate filename from topic
    const filename = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const prompt = `# Research Topic

## Your Task

Conduct comprehensive research on: **${topic}**

${context ? `\n## Additional Context\n\n${context}\n` : ''}

## Research Process

Follow this structured approach to gather and synthesize information:

### Phase 1: Discovery (WebSearch + WebFetch)

1. **Search for official documentation**
   - Use WebSearch to find authoritative sources
   - Look for: official docs, specifications, API references
   - Prioritize: recent dates (2024-2025), official sites, established tutorials

2. **Gather primary sources**
   - Use WebFetch to read full content from top sources
   - Extract: key concepts, API structures, best practices
   - Note: code examples, patterns, gotchas

3. **Find real-world examples**
   - Search GitHub for production implementations
   - Look for: popular repositories, maintained projects
   - Analyze: how they solve similar problems

### Phase 2: Synthesis

1. **Identify patterns**
   - What approaches are commonly used?
   - What do experts recommend?
   - What are the trade-offs?

2. **Extract actionable insights**
   - How does this apply to our project?
   - What are the implementation steps?
   - What should we avoid?

3. **Document findings**
   - Create structured research document
   - Include: executive summary, detailed findings, recommendations
   - Cite: all sources with links

### Phase 3: Documentation

Create a research document at: **docs/research/${filename}.md**

**Required Structure:**

\`\`\`markdown
# [Topic Title]

**Created:** YYYY-MM-DD
**Purpose:** Brief purpose statement
**Status:** Complete | In Progress

## Executive Summary

[2-3 paragraphs summarizing key findings]

**Key Findings:**
- [Most important discovery]
- [Second most important]
- [Third most important]

**Relevance to ${analysis.languages[0] ? `our ${analysis.languages[0]} project` : 'this project'}:**
- [How this applies to us]

---

## [Main Section 1]

[Detailed content with subsections]

### [Subsection]

[Content with code examples, explanations]

---

## [Main Section 2]

[Continue with logical sections]

---

## Best Practices

1. **[Practice 1]**
   - [Details]
   - [Why this matters]

2. **[Practice 2]**
   - [Details]

---

## Real-World Examples

### [Example 1: Source/Project Name]

[Description of implementation]
[Link to source]
[Key takeaways]

---

## Recommendations for This Project

### Immediate Actions

1. [First recommendation with rationale]
2. [Second recommendation]

### Implementation Approach

[Suggested approach based on findings]

---

## References

### Official Documentation

- [Title](URL) - Description
- [Title](URL) - Description

### Tutorials and Articles

- [Title](URL) - Author, Date
- [Title](URL) - Author, Date

### Code Examples

- [Repository](URL) - Description
- [Repository](URL) - Description

---

**End of Research Document**
\`\`\`

## Project Context

Use this context to make research relevant:

- **Languages**: ${analysis.languages.join(', ') || 'Unknown'}
- **Frameworks**: ${analysis.frameworks.join(', ') || 'Unknown'}
- **Build Tools**: ${analysis.buildTools.join(', ') || 'Unknown'}

## Quality Criteria

Your research document should be:

✓ **Comprehensive** - Cover the topic thoroughly
✓ **Actionable** - Provide clear next steps
✓ **Well-cited** - Link to all sources
✓ **Structured** - Follow the template above
✓ **Relevant** - Apply findings to our project
✓ **Current** - Use recent sources (prefer 2024-2025)

## Important Notes

- Use WebSearch to find authoritative sources (official docs, spec sites, well-known tutorials)
- Use WebFetch to read full content from those sources
- Synthesize findings - don't just copy/paste
- Include code examples where relevant
- Cite all sources properly
- Focus on practical application to our project
- Create the document at docs/research/${filename}.md

Begin research now!
`

    return {
      description: 'Structured research with documentation output',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    }
  }

  /**
   * Build "Initialize Session" prompt
   */
  private async buildInitSession(args: Record<string, string>): Promise<{description?: string; messages: PromptMessage[]}> {
    const {focus} = args

    // Discover all available resources
    const allResources = await this.resourceHandler.list()

    // Categorize resources by type
    const guides = allResources.filter((r) => r.uri.startsWith('docent://guide/'))
    const runbooks = allResources.filter((r) => r.uri.startsWith('docent://runbook/'))
    const standards = allResources.filter((r) => r.uri.startsWith('docent://standard/'))
    const templates = allResources.filter((r) => r.uri.startsWith('docent://template/'))

    // Get project analysis
    const analysis = await analyzeProject(process.cwd())

    // Check for project-specific conventions
    let projectConventions = ''
    try {
      const conventionsPath = path.join(process.cwd(), 'docs', '.config', 'CONVENTIONS.md')
      projectConventions = await fs.readFile(conventionsPath, 'utf-8')
    } catch {
      // No conventions file - that's okay
    }

    // Build resource list strings
    const guidesSection = this.buildResourceSection('Guides', 'How-to documentation', guides)
    const runbooksSection = this.buildResourceSection('Runbooks', 'Step-by-step operational procedures', runbooks)
    const standardsSection = this.buildResourceSection('Standards', 'Project conventions and patterns', standards)

    const currentDateTime = new Date().toISOString()
    const currentDate = currentDateTime.split('T')[0]

    const prompt = `# Session Initialization

**Date:** ${currentDate}
**Project:** ${analysis.languages.join(', ')} | ${analysis.frameworks.join(', ')}

## 🚨 Required Behaviors

Throughout this session, you WILL:

1. **Capture work after completing ANY task** - Call \`capture-work\` tool before responding
2. **Check guides before modifying code** - Read \`docent://guide/contributing\` first
3. **Search for runbooks when starting tasks** - Use relevant operational procedures
4. **Use templates for documentation** - ADRs, RFCs, specs require templates

These are non-negotiable patterns that persist throughout the session.

---

## 📝 Work Capture (Mandatory)

**Trigger:** After completing ANY task involving code, decisions, or documentation.

**Action:** Call \`capture-work\` with:
- \`summary\`: What was accomplished (1-2 sentences)
- \`discoveries\`: Key learnings (optional but valuable)
- \`next_steps\`: What's next (optional)

**Pattern:** Complete task → Capture work → Respond to user

---

## 🔧 Workflow Checkpoints

**Before modifying code:**
→ Read \`docent://guide/contributing\`${guides.length > 0 ? `\n→ Available guides: ${guides.length}` : ''}

**When user mentions specific tasks:**
→ Search for relevant runbooks${runbooks.length > 0 ? ` (${runbooks.length} available)` : ''}
→ Example: CI/CD issues → \`docent://runbook/ci-cd-health-check\`

**When creating ADR/RFC/spec:**
→ Read appropriate template first (\`readResource('docent://template/adr')\`)
→ ${templates.length} templates available

---

## 📚 Resources Available

${guides.length > 0 ? `**Guides:** ${guides.map((g) => `\`${g.uri}\``).join(', ')}\n` : ''}${runbooks.length > 0 ? `**Runbooks:** ${runbooks.map((r) => `\`${r.uri}\``).join(', ')}\n` : ''}${standards.length > 0 ? `**Standards:** ${standards.map((s) => `\`${s.uri}\``).join(', ')}\n` : ''}
**Access:** \`readResource('docent://...')\`

${projectConventions ? `---\n\n## 🎯 Project Conventions\n\n${projectConventions}\n\n` : ''}---

**Session pattern:** Check resources → Work → Capture → Repeat`

    return {
      description: 'Session initialization with project context',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    }
  }

  /**
   * Build a resource section with list of resources
   */
  private buildResourceSection(title: string, description: string, resources: Array<{uri: string; name: string; description?: string}>): string {
    if (resources.length === 0) {
      return `**${title}** - ${description}\n- None available yet`
    }

    let section = `**${title}** - ${description}\n`
    for (const resource of resources) {
      section += `- \`${resource.uri}\``
      if (resource.description) {
        section += ` - ${resource.description}`
      }
      section += '\n'
    }

    return section
  }

  /**
   * Get review criteria for a specific perspective
   */
  private getReviewCriteria(perspective: string): string {
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
        return this.getReviewCriteria('architecture') + '\n\n' + this.getReviewCriteria('security') + '\n\n' + this.getReviewCriteria('implementation')

      default:
        return `- Review the proposal for clarity, completeness, and feasibility
- Consider implications and potential issues
- Suggest improvements and alternatives`
    }
  }
}
