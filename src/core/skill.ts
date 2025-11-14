import { readFileSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'

/**
 * Skill metadata from SKILL.md frontmatter
 */
export interface SkillMetadata {
  name: string
  description: string
}

/**
 * A loaded skill with metadata and content
 */
export interface Skill {
  /** Relative path from skills root (e.g., "git/commit") */
  path: string
  /** Skill metadata from frontmatter */
  metadata: SkillMetadata
  /** Full markdown content including frontmatter */
  content: string
  /** Source: bundled or local */
  source: 'bundled' | 'local'
  /** Absolute path to SKILL.md file */
  filePath: string
}

/**
 * Parse YAML frontmatter from markdown content
 * Returns { metadata, content } or null if invalid
 */
export function parseFrontmatter(content: string): { metadata: SkillMetadata; content: string } | null {
  const lines = content.split('\n')

  // Must start with ---
  if (lines[0]?.trim() !== '---') {
    return null
  }

  // Find closing ---
  let endIndex = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      endIndex = i
      break
    }
  }

  if (endIndex === -1) {
    return null
  }

  // Parse frontmatter YAML
  const frontmatterLines = lines.slice(1, endIndex)
  const metadata: Partial<SkillMetadata> = {}

  for (const line of frontmatterLines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = trimmed.match(/^(\w+):\s*(.*)$/)
    if (match) {
      const [, key, value] = match
      if (key === 'name' || key === 'description') {
        // Remove quotes if present
        metadata[key] = value.replace(/^["']|["']$/g, '')
      }
    }
  }

  // Validate required fields
  if (!metadata.name || !metadata.description) {
    return null
  }

  return {
    metadata: metadata as SkillMetadata,
    content,
  }
}

/**
 * Load a skill from a SKILL.md file
 *
 * @param skillPath - Relative path from skills root (e.g., "git/commit")
 * @param skillsRoot - Absolute path to skills directory
 * @param source - Whether this is bundled or local
 * @returns Loaded skill or null if invalid
 */
export function loadSkill(
  skillPath: string,
  skillsRoot: string,
  source: 'bundled' | 'local',
): Skill | null {
  const filePath = join(skillsRoot, skillPath, 'SKILL.md')

  if (!existsSync(filePath)) {
    return null
  }

  try {
    const content = readFileSync(filePath, 'utf-8')
    const parsed = parseFrontmatter(content)

    if (!parsed) {
      return null
    }

    return {
      path: skillPath,
      metadata: parsed.metadata,
      content: parsed.content,
      source,
      filePath,
    }
  } catch (error) {
    return null
  }
}

/**
 * Get the group name from a skill path
 * e.g., "git/commit" → "git"
 */
export function getSkillGroup(skillPath: string): string {
  const parts = skillPath.split('/')
  return parts[0] || ''
}
