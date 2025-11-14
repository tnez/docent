import { expect } from 'chai'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { parseFrontmatter, loadSkill, getSkillGroup } from '../src/core/skill'
import { discoverSkillPaths, loadSkills, mergeSkills } from '../src/core/skill-loader'
import { createSkillRegistry } from '../src/core/skill-registry'

describe('Skill Infrastructure', () => {
  const testDir = join(__dirname, '.test-skills')
  const bundledDir = join(testDir, 'bundled')
  const localDir = join(testDir, 'local')

  beforeEach(() => {
    // Create test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(bundledDir, { recursive: true })
    mkdirSync(localDir, { recursive: true })
  })

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('parseFrontmatter', () => {
    it('should parse valid frontmatter', () => {
      const content = `---
name: test-skill
description: A test skill
---

# Test Skill

Content here.`

      const result = parseFrontmatter(content)
      expect(result).to.not.be.null
      expect(result!.metadata.name).to.equal('test-skill')
      expect(result!.metadata.description).to.equal('A test skill')
    })

    it('should handle quoted values', () => {
      const content = `---
name: "test-skill"
description: 'A test skill'
---

Content`

      const result = parseFrontmatter(content)
      expect(result).to.not.be.null
      expect(result!.metadata.name).to.equal('test-skill')
      expect(result!.metadata.description).to.equal('A test skill')
    })

    it('should return null if missing frontmatter', () => {
      const content = '# Test\n\nNo frontmatter'
      const result = parseFrontmatter(content)
      expect(result).to.be.null
    })

    it('should return null if missing name', () => {
      const content = `---
description: A test skill
---`
      const result = parseFrontmatter(content)
      expect(result).to.be.null
    })

    it('should return null if missing description', () => {
      const content = `---
name: test-skill
---`
      const result = parseFrontmatter(content)
      expect(result).to.be.null
    })
  })

  describe('loadSkill', () => {
    it('should load valid skill', () => {
      const skillPath = 'git/commit'
      const skillDir = join(bundledDir, skillPath)
      mkdirSync(skillDir, { recursive: true })
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: git-commit
description: Create git commits
---

# Git Commit Skill`
      )

      const skill = loadSkill(skillPath, bundledDir, 'bundled')
      expect(skill).to.not.be.null
      expect(skill!.path).to.equal('git/commit')
      expect(skill!.metadata.name).to.equal('git-commit')
      expect(skill!.source).to.equal('bundled')
    })

    it('should return null if SKILL.md missing', () => {
      const skillPath = 'git/commit'
      mkdirSync(join(bundledDir, skillPath), { recursive: true })

      const skill = loadSkill(skillPath, bundledDir, 'bundled')
      expect(skill).to.be.null
    })
  })

  describe('discoverSkillPaths', () => {
    it('should discover skills in flat structure', () => {
      // Create git/commit/SKILL.md
      mkdirSync(join(bundledDir, 'git/commit'), { recursive: true })
      writeFileSync(join(bundledDir, 'git/commit/SKILL.md'), '---\nname: test\ndescription: test\n---')

      // Create git/push/SKILL.md
      mkdirSync(join(bundledDir, 'git/push'), { recursive: true })
      writeFileSync(join(bundledDir, 'git/push/SKILL.md'), '---\nname: test\ndescription: test\n---')

      const paths = discoverSkillPaths(bundledDir)
      expect(paths).to.have.members(['git/commit', 'git/push'])
    })

    it('should discover nested skills', () => {
      mkdirSync(join(bundledDir, 'git/hooks/pre-commit'), { recursive: true })
      writeFileSync(join(bundledDir, 'git/hooks/pre-commit/SKILL.md'), '---\nname: test\ndescription: test\n---')

      const paths = discoverSkillPaths(bundledDir)
      expect(paths).to.include('git/hooks/pre-commit')
    })

    it('should skip directories without SKILL.md', () => {
      mkdirSync(join(bundledDir, 'git/commit'), { recursive: true })
      // No SKILL.md created

      const paths = discoverSkillPaths(bundledDir)
      expect(paths).to.not.include('git/commit')
    })

    it('should return empty array for non-existent directory', () => {
      const paths = discoverSkillPaths(join(bundledDir, 'nonexistent'))
      expect(paths).to.deep.equal([])
    })
  })

  describe('loadSkills', () => {
    beforeEach(() => {
      // Create test skills
      const skills = [
        'git/commit',
        'git/push',
        'github/issue',
        'docent/bootstrap',
      ]

      for (const skillPath of skills) {
        const dir = join(bundledDir, skillPath)
        mkdirSync(dir, { recursive: true })
        writeFileSync(
          join(dir, 'SKILL.md'),
          `---
name: ${skillPath.replace('/', '-')}
description: Test skill for ${skillPath}
---

# Skill`
        )
      }
    })

    it('should load all skills with empty patterns', () => {
      const skills = loadSkills(bundledDir, [], 'bundled')
      expect(skills).to.have.length(4)
    })

    it('should filter by single pattern', () => {
      const skills = loadSkills(bundledDir, ['git/*'], 'bundled')
      expect(skills).to.have.length(2)
      expect(skills.map(s => s.path)).to.have.members(['git/commit', 'git/push'])
    })

    it('should filter by multiple patterns', () => {
      const skills = loadSkills(bundledDir, ['git/*', 'github/*'], 'bundled')
      expect(skills).to.have.length(3)
    })

    it('should apply negation patterns', () => {
      const skills = loadSkills(bundledDir, ['git/*', '!git/push'], 'bundled')
      expect(skills).to.have.length(1)
      expect(skills[0].path).to.equal('git/commit')
    })
  })

  describe('mergeSkills', () => {
    it('should combine bundled and local skills', () => {
      const bundled = [
        { path: 'git/commit', metadata: { name: 'gc', description: 'bundled' }, content: '', source: 'bundled' as const, filePath: '' },
        { path: 'git/push', metadata: { name: 'gp', description: 'bundled' }, content: '', source: 'bundled' as const, filePath: '' },
      ]

      const local = [
        { path: 'custom/deploy', metadata: { name: 'deploy', description: 'local' }, content: '', source: 'local' as const, filePath: '' },
      ]

      const merged = mergeSkills(bundled, local)
      expect(merged).to.have.length(3)
    })

    it('should override bundled with local', () => {
      const bundled = [
        { path: 'git/commit', metadata: { name: 'gc', description: 'bundled' }, content: '', source: 'bundled' as const, filePath: '' },
      ]

      const local = [
        { path: 'git/commit', metadata: { name: 'gc-custom', description: 'local override' }, content: '', source: 'local' as const, filePath: '' },
      ]

      const merged = mergeSkills(bundled, local)
      expect(merged).to.have.length(1)
      expect(merged[0].source).to.equal('local')
      expect(merged[0].metadata.description).to.equal('local override')
    })
  })

  describe('getSkillGroup', () => {
    it('should extract group from path', () => {
      expect(getSkillGroup('git/commit')).to.equal('git')
      expect(getSkillGroup('github/issue')).to.equal('github')
      expect(getSkillGroup('docent/bootstrap')).to.equal('docent')
    })

    it('should handle nested paths', () => {
      expect(getSkillGroup('git/hooks/pre-commit')).to.equal('git')
    })
  })

  describe('SkillRegistry', () => {
    beforeEach(() => {
      // Create bundled skills
      const bundledSkills = ['git/commit', 'git/push', 'github/issue']
      for (const skillPath of bundledSkills) {
        const dir = join(bundledDir, skillPath)
        mkdirSync(dir, { recursive: true })
        writeFileSync(
          join(dir, 'SKILL.md'),
          `---
name: ${skillPath.replace('/', '-')}
description: Bundled skill for ${skillPath}
---`
        )
      }

      // Create local override
      const localSkillPath = 'git/commit'
      const localSkillDir = join(localDir, localSkillPath)
      mkdirSync(localSkillDir, { recursive: true })
      writeFileSync(
        join(localSkillDir, 'SKILL.md'),
        `---
name: custom-commit
description: Custom commit skill
---`
      )
    })

    it('should load and merge skills', () => {
      const registry = createSkillRegistry(bundledDir, localDir)
      registry.load(['git/*', 'github/*'])

      const all = registry.getAll()
      expect(all).to.have.length(3)
    })

    it('should override bundled with local', () => {
      const registry = createSkillRegistry(bundledDir, localDir)
      registry.load(['git/*'])

      const commit = registry.getByPath('git/commit')
      expect(commit).to.not.be.undefined
      expect(commit!.source).to.equal('local')
      expect(commit!.metadata.name).to.equal('custom-commit')
    })

    it('should group skills', () => {
      const registry = createSkillRegistry(bundledDir, localDir)
      registry.load(['git/*', 'github/*'])

      const groups = registry.getGroups()
      expect(groups).to.include.members(['git', 'github'])

      const gitSkills = registry.getByGroup('git')
      expect(gitSkills).to.have.length(2)
    })

    it('should discover skills by query', () => {
      const registry = createSkillRegistry(bundledDir, localDir)
      registry.load(['git/*', 'github/*'])

      const results = registry.discover('commit')
      expect(results.length).to.be.greaterThan(0)
      expect(results[0].skill.path).to.include('commit')
    })
  })
})
