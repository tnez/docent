import {expect} from 'chai'
import {parseTemplateUrl} from '../../../src/lib/template'

describe('Template Module', () => {
  describe('parseTemplateUrl', () => {
    it('should parse GitHub HTTPS URL', () => {
      const result = parseTemplateUrl('https://github.com/acme-corp/docs-template')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('acme-corp/docs-template')
      expect(result.gitUrl).to.equal('https://github.com/acme-corp/docs-template.git')
      expect(result.ref).to.be.undefined
    })

    it('should parse GitHub HTTPS URL with .git suffix', () => {
      const result = parseTemplateUrl('https://github.com/acme-corp/docs-template.git')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('acme-corp/docs-template')
      expect(result.gitUrl).to.equal('https://github.com/acme-corp/docs-template.git')
    })

    it('should parse GitHub URL with branch', () => {
      const result = parseTemplateUrl('https://github.com/acme-corp/docs-template#v2.0')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('acme-corp/docs-template')
      expect(result.gitUrl).to.equal('https://github.com/acme-corp/docs-template.git')
      expect(result.ref).to.equal('v2.0')
    })

    it('should parse GitHub URL with tag', () => {
      const result = parseTemplateUrl('https://github.com/acme-corp/docs-template#release-2024-01')
      expect(result.ref).to.equal('release-2024-01')
    })

    it('should parse GitHub URL with commit hash', () => {
      const result = parseTemplateUrl('https://github.com/acme-corp/docs-template#abc123def')
      expect(result.ref).to.equal('abc123def')
    })

    it('should parse GitLab HTTPS URL', () => {
      const result = parseTemplateUrl('https://gitlab.com/team/docs-template')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('team/docs-template')
      expect(result.gitUrl).to.equal('https://gitlab.com/team/docs-template.git')
    })

    it('should parse GitHub SSH URL', () => {
      const result = parseTemplateUrl('git@github.com:acme-corp/docs-template.git')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('acme-corp/docs-template')
      expect(result.gitUrl).to.equal('git@github.com:acme-corp/docs-template.git')
    })

    it('should parse GitHub SSH URL without .git suffix', () => {
      const result = parseTemplateUrl('git@github.com:acme-corp/docs-template')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('acme-corp/docs-template')
      expect(result.gitUrl).to.equal('git@github.com:acme-corp/docs-template.git')
    })

    it('should parse GitLab SSH URL', () => {
      const result = parseTemplateUrl('git@gitlab.com:team/docs-template.git')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('team/docs-template')
      expect(result.gitUrl).to.equal('git@gitlab.com:team/docs-template.git')
    })

    it('should parse absolute local path', () => {
      const result = parseTemplateUrl('/usr/local/share/docent-templates/enterprise')
      expect(result.isLocal).to.be.true
      expect(result.name).to.equal('enterprise')
      expect(result.gitUrl).to.equal('/usr/local/share/docent-templates/enterprise')
    })

    it('should parse relative local path', () => {
      const result = parseTemplateUrl('../team-templates/docent-standard')
      expect(result.isLocal).to.be.true
      // Name should be the basename
      expect(result.name).to.equal('docent-standard')
      // gitUrl should be resolved to absolute path
      expect(result.gitUrl).to.include('docent-standard')
    })

    it('should handle SSH URL with branch', () => {
      const result = parseTemplateUrl('git@github.com:acme-corp/docs-template.git#v1.0')
      expect(result.isLocal).to.be.false
      expect(result.name).to.equal('acme-corp/docs-template')
      expect(result.ref).to.equal('v1.0')
      expect(result.gitUrl).to.equal('git@github.com:acme-corp/docs-template.git')
    })

    it('should preserve original URL', () => {
      const original = 'https://github.com/acme-corp/docs-template#v2.0'
      const result = parseTemplateUrl(original)
      expect(result.url).to.equal(original)
    })

    it('should handle URLs with nested paths', () => {
      const result = parseTemplateUrl('https://github.com/org/repo/extra/path')
      expect(result.isLocal).to.be.false
      // Captures user/repo (first two path segments)
      expect(result.name).to.equal('org/repo')
    })
  })
})
