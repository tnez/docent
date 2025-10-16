import * as fs from 'fs/promises'
import {execSync} from 'child_process'
import {analyzeProject} from '../../lib/detector.js'
import {ResourceHandler} from '../resources/handler.js'
import {SessionManager} from '../../lib/journal/session-manager.js'

/**
 * Context gatherer for workflow tools and prompts
 * Single source of truth for context gathering logic
 */
export class WorkflowContextGatherer {
  private resourceHandler: ResourceHandler
  private sessionManager: SessionManager

  constructor(basePath: string = process.cwd()) {
    this.resourceHandler = new ResourceHandler(basePath)
    this.sessionManager = new SessionManager(basePath)
  }

  /**
   * Gather context for resume-work workflow
   */
  async gatherResumeWorkContext(): Promise<ResumeWorkContext> {
    // Read recent journal sessions (last 3)
    let journal = ''
    try {
      const recentSessions = await this.sessionManager.getRecentSessions(3)

      if (recentSessions.length === 0) {
        journal = 'No journal sessions found'
      } else {
        const sessionContents = await Promise.all(
          recentSessions.map(async (session) => {
            const content = await this.sessionManager.readSession(session)
            return `## Session: ${session.file}\n\n${content}\n`
          }),
        )
        journal = sessionContents.join('\n---\n\n')
      }
    } catch (error) {
      journal = `Error reading journal: ${error}`
    }

    // Get recent commits
    let commits = ''
    try {
      commits = execSync('git log --oneline -10', {encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore']})
    } catch {
      commits = 'No git history available'
    }

    // Get git status
    let gitStatus = ''
    try {
      gitStatus = execSync('git status', {encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore']})
    } catch {
      gitStatus = 'Not a git repository'
    }

    // Find TODOs
    let todos = ''
    try {
      todos = execSync('git grep -n "TODO\\|FIXME" || true', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
      if (!todos.trim()) {
        todos = 'No TODOs found'
      }
    } catch {
      todos = 'Unable to search for TODOs'
    }

    return {
      journal,
      commits,
      gitStatus,
      todos,
    }
  }

  /**
   * Gather context for review-rfc workflow
   */
  async gatherReviewRfcContext(rfcPath: string, perspective: string = 'architecture'): Promise<ReviewRfcContext> {
    // Read RFC content
    const rfcContent = await fs.readFile(rfcPath, 'utf-8')

    // Get project analysis
    const analysis = await analyzeProject(process.cwd())

    // Extract RFC title
    const titleMatch = rfcContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : rfcPath

    return {
      rfcPath,
      rfcContent,
      title,
      perspective,
      projectLanguages: analysis.languages,
      projectFrameworks: analysis.frameworks,
      projectBuildTools: analysis.buildTools,
    }
  }

  /**
   * Gather context for research-topic workflow
   */
  async gatherResearchTopicContext(topic: string, additionalContext?: string): Promise<ResearchTopicContext> {
    // Get project analysis
    const analysis = await analyzeProject(process.cwd())

    // Generate filename from topic
    const filename = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return {
      topic,
      additionalContext: additionalContext || '',
      filename,
      projectLanguages: analysis.languages,
      projectFrameworks: analysis.frameworks,
      projectBuildTools: analysis.buildTools,
    }
  }
}

/**
 * Context types
 */
export interface ResumeWorkContext {
  journal: string
  commits: string
  gitStatus: string
  todos: string
}

export interface ReviewRfcContext {
  rfcPath: string
  rfcContent: string
  title: string
  perspective: string
  projectLanguages: string[]
  projectFrameworks: string[]
  projectBuildTools: string[]
}

export interface ResearchTopicContext {
  topic: string
  additionalContext: string
  filename: string
  projectLanguages: string[]
  projectFrameworks: string[]
  projectBuildTools: string[]
}
