#!/usr/bin/env node
/**
 * End-to-end test of Docket MCP resources and prompts
 * Tests the actual implementations without going through MCP protocol
 */

const {ResourceHandler} = require('./lib/mcp/resources/handler.js')
const {PromptBuilder} = require('./lib/mcp/prompts/builder.js')

async function main() {
  console.log('🧪 Docket End-to-End Test\n')
  console.log('=' .repeat(60))

  // ===== Test 1: Resource Listing =====
  console.log('\n📋 Test 1: List all resources')
  console.log('-'.repeat(60))

  const resourceHandler = new ResourceHandler()
  const resources = await resourceHandler.list()

  console.log(`Found ${resources.length} resources:\n`)
  resources.forEach(r => {
    console.log(`  ${r.uri}`)
    console.log(`    Name: ${r.name}`)
    console.log(`    Description: ${r.description.substring(0, 100)}...`)
    console.log()
  })

  // ===== Test 2: Read Journal Resource =====
  console.log('\n📖 Test 2: Read journal resource')
  console.log('-'.repeat(60))

  try {
    const journal = await resourceHandler.read('docent://journal/current')
    console.log(`✓ Successfully read journal`)
    console.log(`  URI: ${journal.uri}`)
    console.log(`  Type: ${journal.mimeType}`)
    console.log(`  Size: ${journal.text.length} characters`)
    console.log(`  Preview (first 200 chars):`)
    console.log(`  ${journal.text.substring(0, 200).replace(/\n/g, '\n  ')}...`)
  } catch (error) {
    console.log(`✗ Failed to read journal: ${error.message}`)
  }

  // ===== Test 3: Read Template Resource =====
  console.log('\n\n📄 Test 3: Read template resource')
  console.log('-'.repeat(60))

  try {
    const template = await resourceHandler.read('docent://template/adr')
    console.log(`✓ Successfully read ADR template`)
    console.log(`  URI: ${template.uri}`)
    console.log(`  Size: ${template.text.length} characters`)
    console.log(`  Preview (first 200 chars):`)
    console.log(`  ${template.text.substring(0, 200).replace(/\n/g, '\n  ')}...`)
  } catch (error) {
    console.log(`✗ Failed to read template: ${error.message}`)
  }

  // ===== Test 4: URI Security =====
  console.log('\n\n🔒 Test 4: URI security (path traversal)')
  console.log('-'.repeat(60))

  const maliciousUris = [
    'docent://journal/../../../etc/passwd',
    'docent://template/../../secret',
    'docent://runbook/~/passwords',
  ]

  for (const uri of maliciousUris) {
    try {
      await resourceHandler.read(uri)
      console.log(`✗ SECURITY ISSUE: ${uri} was allowed`)
    } catch (error) {
      console.log(`✓ Blocked: ${uri}`)
      console.log(`  Reason: ${error.message}`)
    }
  }

  // ===== Test 5: Resume Work Prompt =====
  console.log('\n\n🔄 Test 5: Generate resume-work prompt')
  console.log('-'.repeat(60))

  const promptBuilder = new PromptBuilder()

  try {
    const result = await promptBuilder.build('resume-work', {})
    console.log(`✓ Successfully generated resume-work prompt`)
    console.log(`  Description: ${result.description}`)
    console.log(`  Messages: ${result.messages.length}`)
    console.log(`  Role: ${result.messages[0].role}`)
    console.log(`  Content length: ${result.messages[0].content.text.length} characters`)
    console.log(`\n  Prompt preview (first 500 chars):`)
    console.log(`  ${result.messages[0].content.text.substring(0, 500).replace(/\n/g, '\n  ')}...`)
  } catch (error) {
    console.log(`✗ Failed to generate prompt: ${error.message}`)
  }

  // ===== Test 6: Create ADR Prompt =====
  console.log('\n\n📝 Test 6: Generate create-adr prompt')
  console.log('-'.repeat(60))

  try {
    const result = await promptBuilder.build('create-adr', {
      title: 'Use PostgreSQL for primary database'
    })
    console.log(`✓ Successfully generated create-adr prompt`)
    console.log(`  Description: ${result.description}`)
    console.log(`  Arguments used: title="Use PostgreSQL for primary database"`)
    console.log(`  Content length: ${result.messages[0].content.text.length} characters`)
    console.log(`\n  Prompt preview (first 400 chars):`)
    console.log(`  ${result.messages[0].content.text.substring(0, 400).replace(/\n/g, '\n  ')}...`)
  } catch (error) {
    console.log(`✗ Failed to generate prompt: ${error.message}`)
  }

  // ===== Test 7: Plan Feature Prompt =====
  console.log('\n\n🎯 Test 7: Generate plan-feature prompt')
  console.log('-'.repeat(60))

  try {
    const result = await promptBuilder.build('plan-feature', {
      description: 'Add user authentication with OAuth2'
    })
    console.log(`✓ Successfully generated plan-feature prompt`)
    console.log(`  Description: ${result.description}`)
    console.log(`  Arguments used: description="Add user authentication with OAuth2"`)
    console.log(`  Content includes project analysis: ${result.messages[0].content.text.includes('Languages:') ? 'Yes' : 'No'}`)
    console.log(`\n  Prompt preview (first 400 chars):`)
    console.log(`  ${result.messages[0].content.text.substring(0, 400).replace(/\n/g, '\n  ')}...`)
  } catch (error) {
    console.log(`✗ Failed to generate prompt: ${error.message}`)
  }

  // ===== Summary =====
  console.log('\n\n' + '='.repeat(60))
  console.log('✅ End-to-End Test Complete')
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('\n💥 Test failed with error:', error)
  process.exit(1)
})
