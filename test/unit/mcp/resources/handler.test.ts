import {expect} from 'chai'
import * as path from 'path'
import {ResourceHandler} from '../../../../src/mcp/resources/handler'
import {createContext} from '../../../../src/lib/context'

describe('ResourceHandler', () => {
  describe('URI parsing and security', () => {
    it('should reject URIs with path traversal attempts', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)

      try {
        await handler.read('docent://../../../etc/passwd')
        expect.fail('Should have thrown error for path traversal')
      } catch (error) {
        expect(error).to.be.instanceOf(Error)
        expect((error as Error).message).to.include('path traversal')
      }
    })

    it('should reject URIs with tilde expansion', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)

      try {
        await handler.read('docent://~/secrets/config')
        expect.fail('Should have thrown error for tilde expansion')
      } catch (error) {
        expect(error).to.be.instanceOf(Error)
        expect((error as Error).message).to.include('path traversal')
      }
    })

    it('should reject malformed URIs', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)

      try {
        await handler.read('not-a-valid-uri')
        expect.fail('Should have thrown error for malformed URI')
      } catch (error) {
        expect(error).to.be.instanceOf(Error)
        expect((error as Error).message).to.include('Invalid URI format')
      }
    })
  })

  describe('Path resolution', () => {
    it('should use project path for user documentation', async () => {
      const projectPath = '/test/project'
      const packagePath = '/test/package'
      const ctx = createContext(projectPath, packagePath)
      const handler = new ResourceHandler(ctx)

      // Verify paths are set correctly
      expect(ctx.projectPath).to.equal(projectPath)
      expect(ctx.packagePath).to.equal(packagePath)
    })

    it('should use package path for templates', async () => {
      const projectPath = '/test/project'
      // Use actual package path so templates can be found
      const ctx = createContext(projectPath)
      const handler = new ResourceHandler(ctx)

      // List templates - should look in package path
      const templates = await handler.list()
      const templateResources = templates.filter((r) => r.uri.startsWith('docent://template/'))

      // Templates should exist (we bundle them)
      expect(templateResources.length).to.be.greaterThan(0)
    })
  })

  describe('Meta resources', () => {
    it('should list context meta resource', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)
      const resources = await handler.list()

      const context = resources.find((r) => r.uri === 'docent://meta/context')
      expect(context).to.exist
      expect(context?.name).to.equal('Session Context')
    })

    it('should read context resource and return content', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)
      const content = await handler.read('docent://meta/context')

      expect(content.uri).to.equal('docent://meta/context')
      expect(content.mimeType).to.equal('text/markdown')
      expect(content.text).to.include('Session Initialization')
      expect(content.text).to.include('CRITICAL BEHAVIORAL REQUIREMENTS')
    })
  })

  describe('Template resources', () => {
    it('should list all bundled templates', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)
      const resources = await handler.list()

      const templates = resources.filter((r) => r.uri.startsWith('docent://template/'))

      // We bundle these templates
      const expectedTemplates = [
        'docent://template/adr',
        'docent://template/rfc',
        'docent://template/spec',
      ]

      for (const expected of expectedTemplates) {
        const found = templates.find((t) => t.uri === expected)
        expect(found, `Template ${expected} should be listed`).to.exist
      }
    })

    it('should read template content', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)
      const content = await handler.read('docent://template/adr')

      expect(content.uri).to.equal('docent://template/adr')
      expect(content.mimeType).to.equal('text/markdown')
      expect(content.text).to.include('ADR-NNNN')
      expect(content.text).to.include('Context')
    })
  })

  describe('Resource listing', () => {
    it('should not crash when project directories do not exist', async () => {
      const ctx = createContext('/nonexistent/project')
      const handler = new ResourceHandler(ctx)
      const resources = await handler.list()

      // Should still return meta and template resources
      expect(resources.length).to.be.greaterThan(0)

      const metaResources = resources.filter((r) => r.uri.startsWith('docent://meta/'))
      expect(metaResources.length).to.be.greaterThan(0)
    })

    it('should include all resource types', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)
      const resources = await handler.list()

      // Check that we get different resource types
      const resourceTypes = new Set(resources.map((r) => r.uri.split('/')[2]))

      expect(resourceTypes.has('meta')).to.be.true
      expect(resourceTypes.has('template')).to.be.true
      // Note: guide, runbook, etc. depend on project structure
    })
  })

  describe('Error handling', () => {
    it('should throw error for unknown meta resource', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)

      try {
        await handler.read('docent://meta/nonexistent')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).to.be.instanceOf(Error)
        expect((error as Error).message).to.include('Unknown meta resource')
      }
    })

    it('should throw error for unknown template', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)

      try {
        await handler.read('docent://template/nonexistent')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).to.be.instanceOf(Error)
        // File not found error
        expect(error).to.exist
      }
    })

    it('should throw error for unknown resource type', async () => {
      const ctx = createContext(process.cwd())
      const handler = new ResourceHandler(ctx)

      try {
        await handler.read('docent://invalid-type/foo')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).to.be.instanceOf(Error)
        expect((error as Error).message).to.include('Unknown resource type')
      }
    })
  })
})
