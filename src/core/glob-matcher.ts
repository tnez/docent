/**
 * Glob pattern matcher with negation support
 *
 * Supports patterns like:
 * - `git/*` - Match all skills in git/ directory
 * - `!git/commit` - Exclude specific skill
 * - `docent/**` - Match nested directories
 */

export interface GlobPattern {
  pattern: string
  isNegation: boolean
}

/**
 * Parse a glob pattern string into a structured pattern
 */
export function parsePattern(pattern: string): GlobPattern {
  const trimmed = pattern.trim()
  if (trimmed.startsWith('!')) {
    return {
      pattern: trimmed.slice(1),
      isNegation: true,
    }
  }
  return {
    pattern: trimmed,
    isNegation: false,
  }
}

/**
 * Convert glob pattern to regex
 * Supports: *, **, and literal paths
 */
function globToRegex(pattern: string): RegExp {
  // Escape special regex characters except * and /
  let regex = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // ** matches any depth of directories (including zero)
    .replace(/\*\*/g, '§DOUBLESTAR§')
    // * matches single path segment (no slashes)
    .replace(/\*/g, '[^/]+')
    // Restore ** as (.*/)? to match zero or more path segments with trailing slash
    // But need to handle cases like docent/**/adr where we want to match docent/adr
    .replace(/§DOUBLESTAR§\\\//g, '(?:.*/)?') // **/ becomes zero or more segments
    .replace(/§DOUBLESTAR§/g, '.*') // ** at end becomes anything

  // Anchor to start and end
  return new RegExp(`^${regex}$`)
}

/**
 * Test if a path matches a glob pattern
 */
export function matchesPattern(path: string, pattern: string): boolean {
  const regex = globToRegex(pattern)
  return regex.test(path)
}

/**
 * Filter paths based on glob patterns with negation support
 *
 * Patterns are applied in order:
 * 1. Start with empty set
 * 2. Positive patterns add matches
 * 3. Negative patterns remove matches
 *
 * @param paths - Array of paths to filter
 * @param patterns - Array of glob pattern strings
 * @returns Filtered array of paths
 */
export function filterPaths(paths: string[], patterns: string[]): string[] {
  if (patterns.length === 0) {
    return paths
  }

  const parsedPatterns = patterns.map(parsePattern)
  const matched = new Set<string>()

  for (const pattern of parsedPatterns) {
    for (const path of paths) {
      const isMatch = matchesPattern(path, pattern.pattern)

      if (pattern.isNegation && isMatch) {
        // Negation removes from set
        matched.delete(path)
      } else if (!pattern.isNegation && isMatch) {
        // Positive pattern adds to set
        matched.add(path)
      }
    }
  }

  return Array.from(matched)
}
