import {expect} from 'chai'
import {existsSync, mkdirSync, writeFileSync, rmSync, chmodSync} from 'fs'
import {join} from 'path'
import {handleDoctorTool} from '../../../../lib/mcp/tools/doctor.js'

describe('Doctor Tool', () => {
  const testDir = join(__dirname, '.test-doctor')
  const docsDir = join(testDir, 'docs')
  const scriptsDir = join(testDir, 'scripts')

  beforeEach(() => {
    // Create test directory structure
    if (!existsSync(testDir)) {
      mkdirSync(testDir, {recursive: true})
    }
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, {recursive: true})
    }
    if (!existsSync(scriptsDir)) {
      mkdirSync(scriptsDir, {recursive: true})
    }
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true})
    }
  })

  describe('structure reconciliation', () => {
    it('should recognize scripts documented by basename in context', async () => {
      // Create actual script files
      const script1 = join(scriptsDir, 'install-git-hooks.sh')
      const script2 = join(scriptsDir, 'lint-markdown.sh')
      writeFileSync(script1, '#!/bin/bash\necho "Installing hooks"')
      writeFileSync(script2, '#!/bin/bash\necho "Linting markdown"')
      chmodSync(script1, 0o755)
      chmodSync(script2, 0o755)

      // Create docs that reference scripts by basename (common pattern)
      const guidePath = join(docsDir, 'guides')
      mkdirSync(guidePath, {recursive: true})
      const contributingPath = join(guidePath, 'contributing.md')
      writeFileSync(
        contributingPath,
        `# Contributing Guide

## Scripts Directory

The \`scripts/\` directory contains utility scripts:

- **\`install-git-hooks.sh\`** - Installs pre-commit hooks
- **\`lint-markdown.sh\`** - Lints markdown files

See the runbooks for more details.
`
      )

      // Run doctor structure check
      const result = await handleDoctorTool({
        path: testDir,
        docsDir: 'docs',
        checks: ['structure'],
        verbose: true,
      })

      const reportText = result.content[0].text

      // Should NOT report scripts as undocumented
      expect(reportText).to.not.include('install-git-hooks.sh')
      expect(reportText).to.not.include('lint-markdown.sh')
      expect(reportText).to.not.include('Undocumented executable script')
    })

    it('should still report truly undocumented scripts', async () => {
      // Create script that is NOT documented anywhere
      const undocScript = join(scriptsDir, 'undocumented-script.sh')
      writeFileSync(undocScript, '#!/bin/bash\necho "Not documented"')
      chmodSync(undocScript, 0o755)

      // Create docs without mentioning the undocumented script
      const guidePath = join(docsDir, 'guides')
      mkdirSync(guidePath, {recursive: true})
      const contributingPath = join(guidePath, 'contributing.md')
      writeFileSync(
        contributingPath,
        `# Contributing Guide

## Scripts Directory

The \`scripts/\` directory contains utility scripts.
`
      )

      // Run doctor structure check
      const result = await handleDoctorTool({
        path: testDir,
        docsDir: 'docs',
        checks: ['structure'],
        verbose: true,
      })

      const reportText = result.content[0].text

      // Should report the undocumented script
      expect(reportText).to.include('undocumented-script.sh')
      expect(reportText).to.include('executable script')
    })

    it('should recognize scripts with full path documentation', async () => {
      // Create script
      const script = join(scriptsDir, 'build.sh')
      writeFileSync(script, '#!/bin/bash\necho "Building"')
      chmodSync(script, 0o755)

      // Document with full path
      const guidePath = join(docsDir, 'guides')
      mkdirSync(guidePath, {recursive: true})
      const buildPath = join(guidePath, 'build.md')
      writeFileSync(
        buildPath,
        `# Build Guide

Run \`scripts/build.sh\` to build the project.
`
      )

      // Run doctor structure check
      const result = await handleDoctorTool({
        path: testDir,
        docsDir: 'docs',
        checks: ['structure'],
        verbose: true,
      })

      const reportText = result.content[0].text

      // Should NOT report script as undocumented
      expect(reportText).to.not.include('build.sh')
      expect(reportText).to.not.include('Undocumented executable script')
    })
  })
})
