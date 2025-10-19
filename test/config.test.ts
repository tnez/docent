import { expect } from 'chai'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { loadConfig } from '../src/lib/config'

describe('Config Loader', () => {
  const testDir = join(__dirname, '.test-config')

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('loadConfig', () => {
    it('should return default config when no config file exists', () => {
      const config = loadConfig(testDir)
      expect(config.root).to.equal('docs')
    })

    it('should load JSON config from .docentrc', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(
        configPath,
        JSON.stringify({
          root: 'documentation',
        })
      )

      const config = loadConfig(testDir)
      expect(config.root).to.equal('documentation')
    })

    it('should load YAML config from .docentrc.yaml', () => {
      const configPath = join(testDir, '.docentrc.yaml')
      writeFileSync(configPath, 'root: my-docs')

      const config = loadConfig(testDir)
      expect(config.root).to.equal('my-docs')
    })

    it('should load YAML config from .docentrc.yml', () => {
      const configPath = join(testDir, '.docentrc.yml')
      writeFileSync(configPath, 'root: my-docs')

      const config = loadConfig(testDir)
      expect(config.root).to.equal('my-docs')
    })

    it('should prefer .docentrc.yaml over .docentrc', () => {
      writeFileSync(join(testDir, '.docentrc.yaml'), 'root: yaml-docs')
      writeFileSync(
        join(testDir, '.docentrc'),
        JSON.stringify({ root: 'json-docs' })
      )

      const config = loadConfig(testDir)
      expect(config.root).to.equal('yaml-docs')
    })

    it('should handle YAML with quotes', () => {
      const configPath = join(testDir, '.docentrc.yaml')
      writeFileSync(configPath, 'root: "my-docs"')

      const config = loadConfig(testDir)
      expect(config.root).to.equal('my-docs')
    })

    it('should handle YAML with comments', () => {
      const configPath = join(testDir, '.docentrc.yaml')
      writeFileSync(
        configPath,
        `# This is a comment
root: documentation
# Another comment`
      )

      const config = loadConfig(testDir)
      expect(config.root).to.equal('documentation')
    })

    it('should throw error for invalid JSON', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(configPath, '{ invalid json }')

      expect(() => loadConfig(testDir)).to.throw(/Failed to parse config file/)
    })

    it('should use default root if not specified in config', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(configPath, JSON.stringify({}))

      const config = loadConfig(testDir)
      expect(config.root).to.equal('docs')
    })
  })

  describe('computed paths', () => {
    it('should compute absolute path to docs root', () => {
      const config = loadConfig(testDir)
      expect(config.docsRoot).to.equal(join(testDir, 'docs'))
    })

    it('should compute custom root from config', () => {
      writeFileSync(
        join(testDir, '.docentrc'),
        JSON.stringify({ root: 'documentation' })
      )

      const config = loadConfig(testDir)
      expect(config.docsRoot).to.equal(join(testDir, 'documentation'))
    })

    it('should compute journal path inside docs root', () => {
      const config = loadConfig(testDir)
      expect(config.journalRoot).to.equal(join(testDir, 'docs', '.journal'))
    })

    it('should respect custom root for journal path', () => {
      writeFileSync(
        join(testDir, '.docentrc'),
        JSON.stringify({ root: 'documentation' })
      )

      const config = loadConfig(testDir)
      expect(config.journalRoot).to.equal(join(testDir, 'documentation', '.journal'))
    })
  })
})
