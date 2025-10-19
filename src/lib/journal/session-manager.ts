import * as fs from 'fs/promises'
import * as path from 'path'
import type {Context} from '../context.js'

export interface SessionInfo {
  file: string
  date: string
  sessionNumber: number
  fullPath: string
}

export class SessionManager {
  private ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
  }

  /**
   * Get the current session file path, creating a new session if needed
   */
  async getCurrentSessionFile(forceNew: boolean = false): Promise<string> {
    await this.ensureJournalDir()

    const sessions = await this.listSessions()

    if (sessions.length === 0 || forceNew) {
      return this.createNewSession()
    }

    const currentSession = sessions[sessions.length - 1]

    if (forceNew || (await this.shouldStartNewSession(currentSession))) {
      return this.createNewSession()
    }

    return currentSession.fullPath
  }

  /**
   * List all session files in chronological order
   */
  async listSessions(): Promise<SessionInfo[]> {
    try {
      const files = await fs.readdir(this.ctx.config.journalRoot)

      const sessions = files
        .filter((file) => this.isSessionFile(file))
        .map((file) => this.parseSessionFile(file))
        .filter((info): info is SessionInfo => info !== null)
        .sort((a, b) => a.file.localeCompare(b.file))

      return sessions
    } catch (error) {
      // Directory doesn't exist yet
      return []
    }
  }

  /**
   * Get the last N sessions
   */
  async getRecentSessions(count: number = 3): Promise<SessionInfo[]> {
    const sessions = await this.listSessions()
    return sessions.slice(-count)
  }

  /**
   * Read a session file
   */
  async readSession(sessionInfo: SessionInfo): Promise<string> {
    return fs.readFile(sessionInfo.fullPath, 'utf-8')
  }

  /**
   * Check if we should start a new session based on time threshold
   */
  private async shouldStartNewSession(currentSession: SessionInfo): Promise<boolean> {
    try {
      const content = await this.readSession(currentSession)
      const lastEntryTime = this.getLastEntryTimestamp(content)

      if (!lastEntryTime) {
        return false // No entries yet, continue current session
      }

      const minutesSinceLastEntry = (Date.now() - lastEntryTime.getTime()) / (1000 * 60)

      return minutesSinceLastEntry > this.ctx.config.sessionThresholdMinutes
    } catch (error) {
      // If we can't read the session, start a new one
      return true
    }
  }

  /**
   * Extract the timestamp of the last entry in a session
   */
  private getLastEntryTimestamp(content: string): Date | null {
    // Match ISO timestamp headers: ## 2025-10-16T14:30:00.000Z
    const matches = content.match(/^## (\d{4}-\d{2}-\d{2}T[\d:.]+Z)/gm)

    if (!matches || matches.length === 0) {
      return null
    }

    // Get the last timestamp
    const lastMatch = matches[matches.length - 1]
    const timestamp = lastMatch.replace('## ', '')

    try {
      return new Date(timestamp)
    } catch {
      return null
    }
  }

  /**
   * Create a new session file
   */
  private async createNewSession(): Promise<string> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const sessions = await this.listSessions()

    // Find existing sessions for today
    const todaySessions = sessions.filter((s) => s.date === today)

    // Next session number
    const nextNum = todaySessions.length + 1
    const paddedNum = String(nextNum).padStart(3, '0')

    const filename = `${today}-session-${paddedNum}.md`
    const fullPath = path.join(this.ctx.config.journalRoot, filename)

    // Create with header
    const header = `# Session ${today}-${paddedNum}

**Started:** ${new Date().toISOString()}

---

`

    await fs.writeFile(fullPath, header, 'utf-8')

    return fullPath
  }

  /**
   * Ensure the journal directory exists
   */
  private async ensureJournalDir(): Promise<void> {
    await fs.mkdir(this.ctx.config.journalRoot, {recursive: true})
  }

  /**
   * Check if a filename matches session file pattern
   */
  private isSessionFile(filename: string): boolean {
    return /^\d{4}-\d{2}-\d{2}-session-\d{3}\.md$/.test(filename)
  }

  /**
   * Parse session file name into SessionInfo
   */
  private parseSessionFile(filename: string): SessionInfo | null {
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})-session-(\d{3})\.md$/)

    if (!match) {
      return null
    }

    return {
      file: filename,
      date: match[1],
      sessionNumber: parseInt(match[2], 10),
      fullPath: path.join(this.ctx.config.journalRoot, filename),
    }
  }

  /**
   * Get sessions for a specific date
   */
  async getSessionsForDate(date: string): Promise<SessionInfo[]> {
    const sessions = await this.listSessions()
    return sessions.filter((s) => s.date === date)
  }

  /**
   * Get a specific session by ID (e.g., "2025-10-16-session-001")
   */
  async getSessionById(sessionId: string): Promise<SessionInfo | null> {
    const sessions = await this.listSessions()
    const filename = `${sessionId}.md`
    return sessions.find((s) => s.file === filename) || null
  }
}
