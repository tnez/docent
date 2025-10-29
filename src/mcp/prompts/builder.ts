import * as path from 'path'
import * as fs from 'fs/promises'
import {analyzeProject} from '../../core/detector'
import {ResourceHandler} from '../resources/handler'
import {WorkflowContextGatherer} from '../workflows/context-gatherer'
import {createContext, type Context} from '../../core/context'
import type {PromptMessage} from './types'
import {PROMPTS} from './definitions'

export class PromptBuilder {
  private ctx: Context
  private resourceHandler: ResourceHandler
  private contextGatherer: WorkflowContextGatherer

  constructor(basePath: string = process.cwd()) {
    this.ctx = createContext(basePath)
    this.resourceHandler = new ResourceHandler(this.ctx)
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

---

# ⚠️ CRITICAL BEHAVIORAL REQUIREMENTS ⚠️

The following behaviors are **MANDATORY** and **NON-NEGOTIABLE** for this ENTIRE session. You MUST follow these patterns without exception.

## 1. 🔴 MANDATORY: Capture Work After EVERY Task

**YOU MUST call the \`capture-work\` MCP tool immediately after completing ANY substantive work.**

**When to capture (NOT optional):**
- ✅ After writing, modifying, or refactoring code
- ✅ After creating or updating documentation
- ✅ After making architectural decisions
- ✅ After debugging or fixing issues
- ✅ After running tests or builds
- ✅ After committing changes

**CORRECT pattern:**
\`\`\`
1. Complete the task
2. Call capture-work tool with summary and discoveries
3. THEN respond to user
\`\`\`

**WRONG pattern (DO NOT DO THIS):**
\`\`\`
❌ Complete task → Respond to user → Never capture
❌ Say "I'll capture this" but don't actually call the tool
❌ Skip capture because the task was "small"
\`\`\`

**How to call the tool:**
Use the MCP \`capture-work\` tool with:
- \`summary\`: Brief description of what was accomplished (1-2 sentences)
- \`discoveries\`: Key insights or learnings (HIGHLY valuable for session recovery)
- \`next_steps\`: What should be done next (helps with continuity)

**Example tool call:**
\`\`\`json
{
  "summary": "Refactored authentication module to use dependency injection pattern",
  "discoveries": [
    "Config was being loaded in multiple places - centralized via Context",
    "SessionManager needed Context instead of individual paths"
  ],
  "next_steps": [
    "Update tests to use new Context pattern",
    "Document dependency injection approach"
  ]
}
\`\`\`

**WHY THIS MATTERS:** Journal entries enable session recovery after context resets. Without rich capture, critical context is lost forever.

---

## 2. 🔴 MANDATORY: Check Documentation Before Code Changes

**Before modifying ANY code, you MUST:**

${guides.length > 0 ? `1. Read \`docent://guide/contributing\` using the MCP \`readResource\` tool
2. Review any other relevant guides (${guides.length} available)
3. Follow the documented patterns and conventions` : `1. Search for project guides and conventions
2. Follow established patterns in the codebase`}

**CORRECT approach:**
\`\`\`
User: "Add a new configuration option"
You: *First reads contributing guide*
You: *Then implements following documented patterns*
\`\`\`

**WRONG approach (DO NOT DO THIS):**
\`\`\`
❌ Immediately start coding without checking guides
❌ Assume you know the patterns
❌ Implement first, check documentation later
\`\`\`

---

## 3. 🔴 MANDATORY: Search for Runbooks Before Tasks

**When user requests operational tasks (deployment, CI/CD, debugging, releases), you MUST:**

${runbooks.length > 0 ? `1. Search for relevant runbooks (${runbooks.length} available)
2. Read the appropriate runbook using \`readResource\`
3. Follow the documented procedures exactly` : `1. Ask user if operational runbooks exist
2. Follow documented procedures if available`}

**Task types that REQUIRE runbook checks:**
- Deployment or release procedures
- CI/CD troubleshooting
- Database migrations
- Infrastructure changes
- Incident response
- Build or test failures

**CORRECT approach:**
\`\`\`
User: "The CI build is failing"
You: "Let me check for a CI/CD troubleshooting runbook first"
You: *Reads docent://runbook/ci-cd-health-check*
You: *Follows documented steps*
\`\`\`

**WRONG approach (DO NOT DO THIS):**
\`\`\`
❌ Start debugging without checking procedures
❌ Make up steps that might not align with team practices
❌ Skip documented workflows
\`\`\`

---

## 4. 🔴 MANDATORY: Use Templates for Documentation

**When creating ADRs, RFCs, or specs, you MUST:**

1. Read the appropriate template first: \`docent://template/[adr|rfc|spec]\`
2. Use the template structure exactly
3. Fill in all required sections

**Available templates:** ${templates.length > 0 ? templates.map((t) => t.name).join(', ') : 'Check available templates'}

**CORRECT approach:**
\`\`\`
User: "Create an ADR for the new caching strategy"
You: *Reads docent://template/adr*
You: *Creates ADR following template structure*
\`\`\`

**WRONG approach (DO NOT DO THIS):**
\`\`\`
❌ Create documentation with custom structure
❌ Guess at what sections should be included
❌ Skip the template because you "know" the format
\`\`\`

---

# 📚 Available Resources

**How to access:** Use the MCP \`readResource\` tool with URIs like \`docent://guide/...\`

${guides.length > 0 ? `\n**Guides (${guides.length}):**\n${guides.map((g) => `- \`${g.uri}\` - ${g.name}`).join('\n')}\n` : ''}${runbooks.length > 0 ? `\n**Runbooks (${runbooks.length}):**\n${runbooks.map((r) => `- \`${r.uri}\` - ${r.name}`).join('\n')}\n` : ''}${standards.length > 0 ? `\n**Standards (${standards.length}):**\n${standards.map((s) => `- \`${s.uri}\` - ${s.name}`).join('\n')}\n` : ''}
${projectConventions ? `---\n\n## 🎯 Project Conventions\n\n${projectConventions}\n\n` : ''}---

# 🔄 Session Pattern (Repeat Every Task)

\`\`\`
1. User requests task
2. Check relevant guides/runbooks FIRST
3. Perform the work following documented patterns
4. Call capture-work tool with summary and discoveries
5. Respond to user
6. REPEAT
\`\`\`

**Remember:** These behaviors are not suggestions. They are mandatory patterns for effective collaboration and knowledge preservation. Following them ensures continuity across context resets and team alignment.`

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
