import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import { loadSkill, type Skill } from './skill'
import { filterPaths } from './glob-matcher'

/**
 * Recursively discover all skill paths in a directory
 * Looks for directories containing SKILL.md files
 *
 * @param skillsRoot - Absolute path to skills directory
 * @param currentPath - Current relative path being scanned (for recursion)
 * @returns Array of relative skill paths
 */
export function discoverSkillPaths(skillsRoot: string, currentPath: string = ''): string[] {
  const fullPath = currentPath ? join(skillsRoot, currentPath) : skillsRoot

  if (!existsSync(fullPath)) {
    return []
  }

  const paths: string[] = []

  try {
    const entries = readdirSync(fullPath)

    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.startsWith('.')) {
        continue
      }

      const entryPath = join(fullPath, entry)
      const relativePath = currentPath ? `${currentPath}/${entry}` : entry

      if (statSync(entryPath).isDirectory()) {
        // Check if this directory contains SKILL.md
        const skillFile = join(entryPath, 'SKILL.md')
        if (existsSync(skillFile)) {
          paths.push(relativePath)
        }

        // Recursively scan subdirectories
        paths.push(...discoverSkillPaths(skillsRoot, relativePath))
      }
    }
  } catch (error) {
    // Ignore permission errors or other scan failures
    return []
  }

  return paths
}

/**
 * Load skills from a directory based on glob patterns
 *
 * @param skillsRoot - Absolute path to skills directory
 * @param patterns - Glob patterns to filter skills
 * @param source - Whether these are bundled or local skills
 * @returns Array of loaded skills
 */
export function loadSkills(
  skillsRoot: string,
  patterns: string[],
  source: 'bundled' | 'local',
): Skill[] {
  // Discover all available skill paths
  const allPaths = discoverSkillPaths(skillsRoot)

  // Filter based on patterns
  const filteredPaths = patterns.length > 0 ? filterPaths(allPaths, patterns) : allPaths

  // Load each skill
  const skills: Skill[] = []
  for (const path of filteredPaths) {
    const skill = loadSkill(path, skillsRoot, source)
    if (skill) {
      skills.push(skill)
    }
  }

  return skills
}

/**
 * Merge bundled and local skills
 * Local skills override bundled skills with the same path
 *
 * @param bundledSkills - Skills from bundled directory
 * @param localSkills - Skills from local directory
 * @returns Merged array with local taking precedence
 */
export function mergeSkills(bundledSkills: Skill[], localSkills: Skill[]): Skill[] {
  const merged = new Map<string, Skill>()

  // Add bundled skills first
  for (const skill of bundledSkills) {
    merged.set(skill.path, skill)
  }

  // Local skills override bundled
  for (const skill of localSkills) {
    merged.set(skill.path, skill)
  }

  return Array.from(merged.values())
}
