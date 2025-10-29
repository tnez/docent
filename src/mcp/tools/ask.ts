import type {Tool, TextContent} from '@modelcontextprotocol/sdk/types.js'
import {loadConfig} from '../../lib/config.js'
import {execSync} from 'child_process'
import {existsSync} from 'fs'
import {join, relative} from 'path'

export const askToolDefinition: Tool = {
  name: 'ask',
  description:
    'Search all documentation to answer questions. Returns relevant documentation chunks for the agent to synthesize into an answer. Searches all configured search paths (typically .docent/ and docs/).',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The question or search query (e.g., "how do I configure the build process?")',
      },
      path: {
        type: 'string',
        description: 'Project path (defaults to current directory)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
        default: 10,
      },
    },
    required: ['query'],
  },
}

interface AskArgs {
  query: string
  path?: string
  limit?: number
}

interface SearchResult {
  file: string
  line: number
  content: string
  context: string[]
}

export async function handleAskTool(args: AskArgs): Promise<{content: TextContent[]}> {
  const projectPath = args.path || process.cwd()
  const limit = args.limit || 10

  try {
    // Load configuration
    const config = loadConfig(projectPath)

    // Extract search terms from query
    const searchTerms = extractSearchTerms(args.query)

    // Search all configured paths
    const results = await searchDocumentation(searchTerms, config.searchPaths, projectPath)

    // Take top N results (simple limit, let agent synthesize)
    const topResults = results.slice(0, limit)

    if (topResults.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: buildNoResultsResponse(args.query, config.searchPaths, projectPath),
          },
        ],
      }
    }

    // Build response with documentation chunks
    const output = buildSearchResponse(args.query, topResults, config.searchPaths, projectPath)

    return {
      content: [
        {
          type: 'text' as const,
          text: output,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Failed to search documentation: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

/**
 * Extract meaningful search terms from natural language query
 * Removes common question words and extracts key terms
 */
function extractSearchTerms(query: string): string[] {
  // Remove common question words
  const stopWords = new Set([
    'how',
    'what',
    'where',
    'when',
    'why',
    'who',
    'which',
    'do',
    'does',
    'is',
    'are',
    'can',
    'could',
    'should',
    'would',
    'the',
    'a',
    'an',
    'to',
    'in',
    'of',
    'for',
    'on',
    'with',
    'from',
    'i',
    'we',
    'you',
  ])

  const words = query
    .toLowerCase()
    .replace(/[?.,!;:]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  return words
}

/**
 * Search documentation in all configured paths using ripgrep
 */
async function searchDocumentation(
  searchTerms: string[],
  searchPaths: string[],
  projectPath: string,
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  // Filter to paths that exist
  const existingPaths = searchPaths.filter(p => {
    const fullPath = join(projectPath, p)
    return existsSync(fullPath)
  })

  if (existingPaths.length === 0) {
    return []
  }

  // Build ripgrep query - search for any of the terms
  const pattern = searchTerms.length > 0 ? searchTerms.join('|') : '.*'

  // Use ripgrep to search markdown files
  // -i: case insensitive
  // -n: show line numbers
  // --type md: only markdown files
  // -C 2: show 2 lines of context before and after
  const paths = existingPaths.map(p => join(projectPath, p)).join(' ')

  try {
    const output = execSync(`rg -i -n --type md -C 2 '${pattern}' ${paths} 2>/dev/null || true`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      cwd: projectPath,
    })

    if (!output) {
      return []
    }

    // Parse ripgrep output
    const lines = output.split('\n')
    let currentFile = ''
    let currentLine = 0
    let contextLines: string[] = []

    for (const line of lines) {
      if (!line) continue

      // Match format: path:line:content or path-line-content (context lines use -)
      const matchLine = line.match(/^([^:]+):(\d+):(.+)$/)
      const contextLine = line.match(/^([^-]+)-(\d+)-(.+)$/)

      if (matchLine) {
        // This is a matching line
        const [, file, lineNum, content] = matchLine
        currentFile = relative(projectPath, file)
        currentLine = parseInt(lineNum, 10)

        results.push({
          file: currentFile,
          line: currentLine,
          content: content.trim(),
          context: [...contextLines],
        })

        contextLines = []
      } else if (contextLine) {
        // This is a context line
        const [, , , content] = contextLine
        contextLines.push(content.trim())
      } else if (line === '--') {
        // Separator between matches
        contextLines = []
      }
    }
  } catch (error) {
    // If ripgrep fails, return empty results rather than throwing
    console.error('Search error:', error)
  }

  return results
}


/**
 * Build response when no results found
 */
function buildNoResultsResponse(query: string, searchPaths: string[], projectPath: string): string {
  let output = `# No Documentation Found\n\n`
  output += `No documentation matched the query: "${query}"\n\n`

  // Show what paths were searched
  output += `## Searched Paths\n\n`
  for (const searchPath of searchPaths) {
    const fullPath = join(projectPath, searchPath)
    const exists = existsSync(fullPath)
    output += `- ${searchPath} ${exists ? '✓' : '(not found)'}\n`
  }
  output += `\n`

  output += `## Suggestions\n\n`
  output += `- Try different search terms or rephrase your question\n`
  output += `- Check if relevant documentation exists in the searched paths\n`
  output += `- Use \`/docent:start\` to see available templates and runbooks\n`
  output += `- Use \`/docent:tell\` to create documentation for this topic\n`

  return output
}

/**
 * Build declarative response with search results for agent to synthesize
 */
function buildSearchResponse(
  query: string,
  results: SearchResult[],
  searchPaths: string[],
  projectPath: string,
): string {
  let output = `# Documentation Search Results\n\n`
  output += `**Query:** "${query}"\n`
  output += `**Results:** ${results.length} matches found\n\n`

  output += `---\n\n`

  // Add synthesis guidance for the AGENT
  output += `## Instructions for Agent\n\n`
  output += `You are being provided with documentation search results. Your responsibilities:\n\n`
  output += `1. **Read through all excerpts** to understand the available information\n`
  output += `2. **Synthesize a coherent answer** to the user's question based on the documentation\n`
  output += `3. **Cite source files** when providing information (e.g., "According to docs/guide.md...")\n`
  output += `4. **Note gaps** if the documentation doesn't fully answer the question\n`
  output += `5. **Organize the information** in a clear, helpful way for the user\n\n`

  output += `**Important:** Docent does NOT synthesize answers. You synthesize them. Docent only provides the raw search results.\n\n`

  output += `---\n\n`

  // Include search results (raw, no ranking)
  output += `## Documentation Excerpts\n\n`

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    output += `### ${i + 1}. ${result.file}:${result.line}\n\n`

    // Show context before
    if (result.context.length > 0) {
      for (const ctx of result.context) {
        output += `> ${ctx}\n`
      }
    }

    // Show matching line (highlighted)
    output += `> **${result.content}**\n`

    output += `\n`
  }

  output += `---\n\n`
  output += `_Synthesize an answer to the user's question from the excerpts above._\n`

  return output
}
