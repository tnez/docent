#!/usr/bin/env node

const oclif = require('@oclif/core')

const path = require('path')
const project = path.join(__dirname, '..', 'tsconfig.json')

// In dev mode, use ts-node for TypeScript support
// In production, use compiled JavaScript
require('ts-node').register({project})

// This is required for ts-node to work with ESM
require('@oclif/core')
  .run(process.argv.slice(2), __dirname)
  .then(require('@oclif/core/flush'))
  .catch(require('@oclif/core/handle'))
