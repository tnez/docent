import { join } from 'path'
import type { Skill } from './skill'
import { getSkillGroup } from './skill'
import { loadSkills, mergeSkills } from './skill-loader'

/**
 * Registry for managing and querying skills
 */
export class SkillRegistry {
  private skills: Map<string, Skill> = new Map()
  private skillsByGroup: Map<string, Skill[]> = new Map()

  constructor(
    private bundledSkillsPath: string,
    private localSkillsPath: string,
  ) {}

  /**
   * Load skills from bundled and local directories based on patterns
   */
  load(patterns: string[]): void {
    // Load bundled skills
    const bundledSkills = loadSkills(this.bundledSkillsPath, patterns, 'bundled')

    // Load local skills
    const localSkills = loadSkills(this.localSkillsPath, patterns, 'local')

    // Merge with local taking precedence
    const merged = mergeSkills(bundledSkills, localSkills)

    // Store in registry
    this.skills.clear()
    this.skillsByGroup.clear()

    for (const skill of merged) {
      this.skills.set(skill.path, skill)

      // Group by directory
      const group = getSkillGroup(skill.path)
      if (!this.skillsByGroup.has(group)) {
        this.skillsByGroup.set(group, [])
      }
      this.skillsByGroup.get(group)!.push(skill)
    }
  }

  /**
   * Get all loaded skills
   */
  getAll(): Skill[] {
    return Array.from(this.skills.values())
  }

  /**
   * Get skill by path
   */
  getByPath(path: string): Skill | undefined {
    return this.skills.get(path)
  }

  /**
   * Get all skill groups
   */
  getGroups(): string[] {
    return Array.from(this.skillsByGroup.keys()).sort()
  }

  /**
   * Get skills by group
   */
  getByGroup(group: string): Skill[] {
    return this.skillsByGroup.get(group) || []
  }

  /**
   * Discover skills matching a query
   * Simple keyword-based matching for v1.0
   *
   * @param query - Search query
   * @returns Array of matching skills with relevance score
   */
  discover(query: string): Array<{ skill: Skill; score: number }> {
    const queryLower = query.toLowerCase()
    const keywords = queryLower.split(/\s+/)

    const results: Array<{ skill: Skill; score: number }> = []

    for (const skill of this.skills.values()) {
      const nameMatch = skill.metadata.name.toLowerCase().includes(queryLower)
      const descLower = skill.metadata.description.toLowerCase()

      // Count keyword matches in description
      let keywordMatches = 0
      for (const keyword of keywords) {
        if (descLower.includes(keyword)) {
          keywordMatches++
        }
      }

      // Calculate score
      let score = 0
      if (nameMatch) score += 10 // Name match is highly relevant
      score += keywordMatches * 2 // Each keyword match adds points

      if (score > 0) {
        results.push({ skill, score })
      }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score)
  }
}

/**
 * Create a skill registry
 */
export function createSkillRegistry(bundledPath: string, localPath: string): SkillRegistry {
  return new SkillRegistry(bundledPath, localPath)
}
