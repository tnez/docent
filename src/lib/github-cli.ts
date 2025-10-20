import {execFile} from 'child_process'
import {promisify} from 'util'

const execFileAsync = promisify(execFile)

/**
 * Check if gh CLI is available on the system
 */
export async function isGhCliAvailable(): Promise<boolean> {
  try {
    await execFileAsync('gh', ['--version'])
    return true
  } catch {
    return false
  }
}

/**
 * Create a GitHub issue using gh CLI
 *
 * @param title Issue title
 * @param body Issue body (markdown)
 * @param labels Array of label names
 * @param repo Repository in OWNER/REPO format (defaults to tnez/docent)
 * @returns Issue URL
 */
export async function createIssue(
  title: string,
  body: string,
  labels: string[],
  repo: string = 'tnez/docent'
): Promise<string> {
  // Check if gh CLI is available
  const available = await isGhCliAvailable()
  if (!available) {
    throw new Error(
      'GitHub CLI (gh) is not installed or not in PATH.\n\n' +
        'To file issues from docent, please install gh:\n' +
        '  macOS:   brew install gh\n' +
        '  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md\n' +
        '  Windows: https://github.com/cli/cli/releases\n\n' +
        'After installation, authenticate with: gh auth login\n\n' +
        'Alternatively, you can file this issue manually at:\n' +
        `https://github.com/${repo}/issues/new`
    )
  }

  // Build gh issue create command
  const args = [
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    title,
    '--body',
    body,
  ]

  // Add labels if provided
  if (labels.length > 0) {
    for (const label of labels) {
      args.push('--label', label)
    }
  }

  try {
    const {stdout} = await execFileAsync('gh', args)
    // gh outputs the issue URL on success
    return stdout.trim()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check for common gh CLI errors
    if (errorMessage.includes('not logged in')) {
      throw new Error(
        'Not authenticated with GitHub.\n\n' +
          'Please run: gh auth login\n\n' +
          'This will authenticate gh CLI with your GitHub account.'
      )
    }

    if (errorMessage.includes('HTTP 404')) {
      throw new Error(
        `Repository not found: ${repo}\n\n` + 'Please check the repository name and your access permissions.'
      )
    }

    // Generic error
    throw new Error(`Failed to create issue: ${errorMessage}`)
  }
}
