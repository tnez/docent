import { expect } from 'chai'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { loadConfig, CURRENT_VERSION } from '../src/core/config'

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
      expect(config.root).to.equal('.docent')
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
      expect(config.root).to.equal('.docent')
    })

    it('should load custom sessionThresholdMinutes from JSON', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(
        configPath,
        JSON.stringify({
          root: 'docs',
          sessionThresholdMinutes: 60,
        })
      )

      const config = loadConfig(testDir)
      expect(config.sessionThresholdMinutes).to.equal(60)
    })

    it('should load custom sessionThresholdMinutes from YAML', () => {
      const configPath = join(testDir, '.docentrc.yaml')
      writeFileSync(configPath, 'root: docs\nsessionThresholdMinutes: 120')

      const config = loadConfig(testDir)
      expect(config.sessionThresholdMinutes).to.equal(120)
    })

    it('should use default sessionThresholdMinutes if not specified', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(configPath, JSON.stringify({ root: 'docs' }))

      const config = loadConfig(testDir)
      expect(config.sessionThresholdMinutes).to.equal(30)
    })

    it('should load version from YAML config', () => {
      const configPath = join(testDir, '.docent/config.yaml')
      mkdirSync(join(testDir, '.docent'), { recursive: true })
      writeFileSync(configPath, 'version: "1.0.0"\nroot: .docent')

      const config = loadConfig(testDir)
      expect(config.version).to.equal('1.0.0')
    })

    it('should use default version if not specified', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(configPath, JSON.stringify({ root: 'docs' }))

      const config = loadConfig(testDir)
      expect(config.version).to.equal(CURRENT_VERSION)
    })

    it('should load version from JSON config', () => {
      const configPath = join(testDir, '.docentrc')
      writeFileSync(configPath, JSON.stringify({ version: '0.9.0', root: 'docs' }))

      const config = loadConfig(testDir)
      expect(config.version).to.equal('0.9.0')
    })
  })

  describe('computed paths', () => {
    it('should compute absolute path to docs root', () => {
      const config = loadConfig(testDir)
      expect(config.docsRoot).to.equal(join(testDir, '.docent'))
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
      expect(config.journalRoot).to.equal(join(testDir, '.docent', 'journals'))
    })

    it('should respect custom root for journal path', () => {
      writeFileSync(
        join(testDir, '.docentrc'),
        JSON.stringify({ root: 'documentation' })
      )

      const config = loadConfig(testDir)
      expect(config.journalRoot).to.equal(join(testDir, 'documentation', 'journals'))
    })
  })
})
