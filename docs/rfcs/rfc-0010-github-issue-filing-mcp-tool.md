# RFC-0010: GitHub Issue Filing MCP Tool

**Status:** Draft
**Author:** @tnez
**Created:** 2025-10-20
**Updated:** 2025-10-20

## Summary

Add a `file-issue` MCP tool to docent that enables users to file GitHub issues directly from their AI agent session. The tool should provide an interactive, guided experience with clarifying questions, use issue templates, automatically populate metadata (docent version, OS, project context), and apply appropriate labels. This creates a seamless feedback loop where users can report issues, request features, or ask questions without context switching.

## Motivation

### Problem Statement

While dogfooding docent, users encounter issues, have feature ideas, or need clarification. Currently they must:

- Context switch from their agent session to GitHub
- Manually open a browser and navigate to the issues page
- Remember or copy relevant context (version, OS, error messages, file paths)
- Format the issue manually
- Guess at appropriate labels
- File without guidance on what information is helpful

**Pain points:**

- **Friction kills feedback** - Context switching reduces issue filing
- **Missing context** - Users forget to include version, OS, reproduction steps
- **Poor formatting** - Issues lack structure, making triage harder
- **Unclear categorization** - Users don't know which labels to apply
- **Lost momentum** - Breaking flow to file issue disrupts work

**Who is affected:**

- Docent users who encounter issues during sessions
- Maintainers who receive low-quality bug reports
- Feature requesters who don't know how to structure requests

**Consequences of not solving:**

- Valuable feedback is lost due to friction
- Issues are filed with incomplete information
- Triage takes longer due to missing context
- Users feel disconnected from the development process

### Goals

- **Reduce friction** - File issues without leaving agent session
- **Improve issue quality** - Auto-populate context, guide structure
- **Simplify categorization** - Ask clarifying questions, apply labels automatically
- **Create feedback loop** - Make it easy to report problems and request features
- **Gather rich context** - Include version, OS, project type, error logs

### Non-Goals

- Replace GitHub issues interface for complex workflows
- Support all GitHub features (milestones, projects, assignees, etc.)
- Enable issue management (close, edit, comment) - filing only
- Support other issue trackers (GitLab, Jira, etc.) - GitHub only

## Detailed Design

### Overview

Implement a `file-issue` MCP tool that:

1. **Asks clarifying questions** to determine issue type (bug, feature, question, docs)
2. **Gathers context automatically** (docent version, OS, Node version, project type)
3. **Uses issue templates** to structure the content appropriately
4. **Applies labels** based on responses (bug, enhancement, question, documentation)
5. **Files the issue** via GitHub API and returns the issue URL

The tool uses an interactive conversation pattern where the agent asks questions before filing, ensuring high-quality issues.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User in Agent Session                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         "file a bug about doctor being verbose"
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              file-issue MCP Tool Handler                    │
│                                                              │
│  1. Detect issue type (bug/feature/question/docs)           │
│  2. Gather context:                                          │
│     - docent version (from package.json)                    │
│     - OS and version (uname)                                │
│     - Node version (process.version)                        │
│     - Project type (if in project dir)                      │
│  3. Ask clarifying questions based on type:                 │
│     Bug: Steps to reproduce? Expected vs actual?            │
│     Feature: Use case? Proposed solution?                   │
│     Question: What are you trying to do?                    │
│  4. Load appropriate template                               │
│  5. Populate template with responses + metadata             │
│  6. Apply labels based on type                              │
│  7. File issue via GitHub API                               │
│  8. Return issue URL                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
              GitHub API (REST)
                      │
                      ▼
        https://github.com/tnez/docent/issues/42
                      │
                      ▼
                 User clicks link
```

**Components:**

- **Issue type detector** - Parse user request to determine type
- **Context gatherer** - Collect system and project metadata
- **Question builder** - Generate clarifying questions per type
- **Template renderer** - Populate issue templates
- **Label mapper** - Map types to GitHub labels
- **GitHub client** - API wrapper for issue creation

### Implementation Details

**MCP Tool Schema:**

```typescript
{
  name: 'file-issue',
  description: 'File an issue in the docent GitHub repository with guided assistance',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short issue title (required)',
      },
      type: {
        type: 'string',
        enum: ['bug', 'feature', 'question', 'documentation', 'other'],
        description: 'Type of issue (optional - will ask if not provided)',
      },
      description: {
        type: 'string',
        description: 'Initial description (optional - will prompt for details)',
      },
      reproductionSteps: {
        type: 'string',
        description: 'Steps to reproduce (for bugs)',
      },
      expectedBehavior: {
        type: 'string',
        description: 'Expected behavior (for bugs)',
      },
      actualBehavior: {
        type: 'string',
        description: 'Actual behavior (for bugs)',
      },
      useCase: {
        type: 'string',
        description: 'Use case or motivation (for features)',
      },
    },
    required: ['title'],
  },
}
```

**Auto-gathered Context:**

```typescript
interface IssueContext {
  docentVersion: string // From package.json or npm ls
  nodeVersion: string // From process.version
  npmVersion: string // From npm --version
  os: string // From os.platform() + os.release()
  arch: string // From os.arch()
  projectType?: string // From docent analyze (if in project)
  projectLanguages?: string[] // From docent analyze
  errorLogs?: string // If provided by user
  commandRun?: string // If provided by user
}
```

**Issue Templates:**

Templates stored in `/templates/github-issues/`:

1. **bug-report.md** - For bugs with reproduction steps
2. **feature-request.md** - For new feature proposals
3. **question.md** - For questions and clarifications
4. **documentation.md** - For doc improvements

**Label Mapping:**

```typescript
const LABEL_MAP = {
  bug: ['bug'],
  feature: ['enhancement'],
  question: ['question'],
  documentation: ['documentation'],
  other: ['triage-needed'],
}
```

**GitHub API Integration:**

```typescript
// Use Octokit for GitHub API
import {Octokit} from '@octokit/rest'

async function fileIssue(
  title: string,
  body: string,
  labels: string[]
): Promise<string> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // User's token from env
  })

  const {data: issue} = await octokit.issues.create({
    owner: 'tnez',
    repo: 'docent',
    title,
    body,
    labels,
  })

  return issue.html_url
}
```

### Code Examples

**Tool Handler Implementation:**

```typescript
// src/mcp/tools/file-issue.ts
import {gatherIssueContext, detectIssueType} from '../../lib/issue-helper.js'
import {renderTemplate} from '../../lib/template-renderer.js'
import {fileGitHubIssue} from '../../lib/github-client.js'

export async function handleFileIssue(args: {
  title: string
  type?: string
  description?: string
  reproductionSteps?: string
  expectedBehavior?: string
  actualBehavior?: string
  useCase?: string
}) {
  // 1. Detect or confirm issue type
  const issueType = args.type || (await detectIssueType(args.title, args.description))

  // 2. Gather system context automatically
  const context = await gatherIssueContext()

  // 3. Build clarifying questions if needed
  const questions = buildQuestions(issueType, args)

  if (questions.length > 0) {
    return {
      content: [
        {
          type: 'text',
          text: `I need a few more details to file this ${issueType} issue:\n\n${questions.join('\n')}`,
        },
      ],
    }
  }

  // 4. Render issue template
  const body = await renderTemplate(`github-issues/${issueType}-report.md`, {
    ...args,
    ...context,
  })

  // 5. Map to labels
  const labels = LABEL_MAP[issueType] || ['triage-needed']

  // 6. File the issue
  const issueUrl = await fileGitHubIssue(args.title, body, labels)

  // 7. Return success
  return {
    content: [
      {
        type: 'text',
        text: `✓ Issue filed successfully!\n\n${issueUrl}\n\n---\n\n**Context included:**\n- docent v${context.docentVersion}\n- Node ${context.nodeVersion}\n- ${context.os} (${context.arch})`,
      },
    ],
  }
}

function buildQuestions(type: string, providedArgs: any): string[] {
  const questions: string[] = []

  if (type === 'bug') {
    if (!providedArgs.reproductionSteps) {
      questions.push('1. What steps reproduce this issue?')
    }
    if (!providedArgs.expectedBehavior) {
      questions.push('2. What did you expect to happen?')
    }
    if (!providedArgs.actualBehavior) {
      questions.push('3. What actually happened?')
    }
  }

  if (type === 'feature') {
    if (!providedArgs.useCase) {
      questions.push('1. What use case would this feature support?')
    }
    if (!providedArgs.description) {
      questions.push('2. Describe the proposed feature')
    }
  }

  return questions
}
```

**Bug Report Template:**

```markdown
<!-- templates/github-issues/bug-report.md -->

## Bug Report

### Description

{{description}}

### Steps to Reproduce

{{reproductionSteps}}

### Expected Behavior

{{expectedBehavior}}

### Actual Behavior

{{actualBehavior}}

{{#if errorLogs}}

### Error Output

\`\`\`
{{errorLogs}}
\`\`\`

{{/if}}

### Environment

- **docent version:** {{docentVersion}}
- **Node version:** {{nodeVersion}}
- **npm version:** {{npmVersion}}
- **OS:** {{os}}
- **Architecture:** {{arch}}
  {{#if projectType}}
- **Project type:** {{projectType}}
- **Languages:** {{projectLanguages}}
  {{/if}}

{{#if commandRun}}

### Command Run

\`\`\`bash
{{commandRun}}
\`\`\`

{{/if}}

---

_Issue filed via docent file-issue tool_
```

**Feature Request Template:**

```markdown
<!-- templates/github-issues/feature-request.md -->

## Feature Request

### Use Case

{{useCase}}

### Proposed Solution

{{description}}

{{#if alternativeSolutions}}

### Alternative Solutions Considered

{{alternativeSolutions}}

{{/if}}

### Environment

- **docent version:** {{docentVersion}}
  {{#if projectType}}
- **Project type:** {{projectType}}
- **Languages:** {{projectLanguages}}
  {{/if}}

---

_Issue filed via docent file-issue tool_
```

### User Experience

**Workflow 1: Bug Report (Interactive)**

```
User: "file a bug - doctor output is too verbose"

Agent: I'll help you file this bug report. I need a few more details:

1. What steps reproduce this issue?
2. What did you expect to happen?
3. What actually happened?

User: "Run 'docent: doctor' and it prints a huge amount of text"
      "Expected: concise summary"
      "Actual: 500+ lines of output"

Agent: ✓ Issue filed successfully!

https://github.com/tnez/docent/issues/42

Context included:
- docent v0.7.0
- Node v20.11.0
- Darwin 24.5.0 (arm64)
```

**Workflow 2: Feature Request (One-shot)**

```
User: "file a feature request for adding issue templates with the title 'Add GitHub issue templates', use case is 'Users can file structured issues', and describe it as 'Create issue templates for bug reports, features, and questions'"

Agent: ✓ Issue filed successfully!

https://github.com/tnez/docent/issues/43

Context included:
- docent v0.7.0
- TypeScript project
```

**Workflow 3: Question**

```
User: "file a question - how do I customize the init-session prompt?"

Agent: ✓ Issue filed successfully!

https://github.com/tnez/docent/issues/44
```

### Configuration

**GitHub Token:**

User must provide GitHub token via environment variable:

```bash
# In shell profile or .env
export GITHUB_TOKEN="ghp_..."

# Or in Claude Desktop MCP config
{
  "mcpServers": {
    "docent": {
      "command": "npx",
      "args": ["@tnezdev/docent"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

**Token Permissions:**

Required scopes: `public_repo` (for public repos)

**Fallback:**

If no token, generate issue body and prompt user to file manually:

```
Could not file issue automatically (no GITHUB_TOKEN found).

Please file manually at: https://github.com/tnez/docent/issues/new

---
[Generated issue body here]
---
```

## Trade-offs and Alternatives

### Trade-offs

**Advantages:**

- Reduces friction for filing issues
- Improves issue quality with templates and context
- Creates tight feedback loop
- Guides users to provide helpful information
- Auto-categorizes with labels

**Disadvantages:**

- Requires GitHub token setup
- Limited to GitHub (no GitLab, Bitbucket, etc.)
- Adds GitHub API as dependency
- May encourage low-effort issues (though templates mitigate)
- Not useful for complex issues requiring attachments

### Alternative 1: Generate Issue URL with Pre-filled Form

**Description:** Use GitHub's URL query params to pre-fill issue form

```
https://github.com/tnez/docent/issues/new?title=...&body=...&labels=bug
```

**Pros:**

- No GitHub token required
- No API calls
- User can review before submitting

**Cons:**

- URL length limits (2048 chars)
- User must still leave session
- Can't gather context as rich
- Still requires manual click

**Why not chosen:** Still requires context switching, limits context gathering

### Alternative 2: Email-based Issue Filing

**Description:** Email issues to GitHub's issue email address

**Pros:**

- No token required
- Simple implementation

**Cons:**

- Not all repos support email
- Poor formatting control
- No label support
- Less reliable

**Why not chosen:** Less reliable, poor UX

### Alternative 3: Issue Template Suggestions Only

**Description:** Generate issue body but don't file, copy to clipboard

**Pros:**

- No GitHub API dependency
- No token required
- User maintains control

**Cons:**

- Still requires context switching
- No automated filing
- Missing core goal (reduce friction)

**Why not chosen:** Doesn't solve the core problem

## Security Considerations

**GitHub Token Storage:**

- Token stored in environment variable, not in code
- Never logged or included in output
- User controls token, can revoke anytime
- Minimal scope required (public_repo)

**Input Validation:**

- Sanitize all user inputs before API calls
- Validate issue titles (length, no special chars)
- Validate body content (max length)
- Prevent injection attacks

**API Rate Limiting:**

- GitHub API: 5000 requests/hour authenticated
- Unlikely to hit limits with issue filing
- Graceful degradation if limited

**Mitigations:**

- Clear docs on token security
- Validate inputs before API calls
- Handle API errors gracefully
- Never expose token in output

## Performance Considerations

**API Latency:**

- GitHub API: ~200-500ms per request
- Acceptable for interactive use
- No retry logic needed initially

**Context Gathering:**

- Local operations: <50ms
- No network calls except GitHub API

**Overall:**

- Total time: ~500-800ms to file issue
- Acceptable for user-facing tool
- Could add caching for metadata if needed

## Testing Strategy

**Unit Tests:**

- Test context gathering
- Test template rendering
- Test label mapping
- Mock GitHub API calls

**Integration Tests:**

- Test full flow with mock GitHub API
- Test error handling (no token, API errors)
- Test interactive questions flow

**Manual Testing:**

- File real issues to test repo
- Test with various issue types
- Verify labels applied correctly
- Check markdown rendering on GitHub

**Edge Cases:**

- Missing GitHub token
- Network errors
- API rate limiting
- Invalid inputs
- Very long issue bodies

## Migration and Rollout

### Migration Path

No migration needed - new feature.

### Rollout Plan

**Phase 1: Core Implementation (1 week)**

- Implement MCP tool handler
- Add context gathering
- Create issue templates
- Integrate GitHub API

**Phase 2: Templates & Polish (3 days)**

- Design issue templates
- Add interactive questions
- Implement label mapping
- Error handling

**Phase 3: Documentation (2 days)**

- Write setup guide (GitHub token)
- Document usage examples
- Add to README
- Create screencast demo

**Phase 4: Dogfooding (1 week)**

- Use tool to file issues during development
- Gather feedback
- Iterate on questions and templates

**Phase 5: Release**

- Include in next docent release
- Announce in changelog
- Share with community

### Backward Compatibility

N/A - new feature, no breaking changes.

## Documentation Plan

**User-Facing Documentation:**

- Setup guide for GitHub token (in README)
- Usage examples (guides/filing-issues.md)
- Troubleshooting common errors

**Examples:**

```bash
# File a bug interactively
file-issue --title "Doctor output too verbose"

# File a feature request with details
file-issue --title "Add custom templates" --type feature --use-case "..."

# File a question
file-issue --title "How to customize prompts?" --type question
```

**Runbook Integration:**

Create companion runbook for maintainers: `runbooks/triage-github-issues.md` (see RFC scope)

## Open Questions

- **Should we support issue editing?** - DEFER: Filing only for v1
- **Should we support other repos?** - DEFER: docent repo only initially
- **How to handle screenshots/attachments?** - DEFER: Text-only for v1
- **Should we auto-detect duplicates?** - Maybe (see companion runbook)
- **Rate limiting concerns?** - Monitor after launch
- **Should we allow custom templates per project?** - Future enhancement

## Future Possibilities

- **Support other repos** - Allow filing to any GitHub repo
- **GitLab/Bitbucket support** - Extend to other platforms
- **Attachment support** - Upload screenshots/logs
- **Duplicate detection** - Search for similar issues before filing
- **Issue management** - Close, comment, edit from agent
- **PR creation** - File issues with linked PR drafts
- **Issue search** - Find existing issues before filing
- **Metrics** - Track issue filing patterns, popular requests

## References

- [GitHub REST API - Issues](https://docs.github.com/en/rest/issues/issues)
- [Octokit.js](https://github.com/octokit/octokit.js)
- [GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [MCP Tool Patterns](https://spec.modelcontextprotocol.io/specification/server/tools/)

---

**This RFC proposes a `file-issue` MCP tool to reduce friction for providing feedback, improving issue quality, and creating a tight feedback loop between docent users and maintainers.**
