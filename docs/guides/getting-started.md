# Getting Started with Docent Development

Welcome! This guide will help you set up your development environment and make your first contribution to docent.

## Overview

Docent is an MCP (Model Context Protocol) server that provides documentation intelligence for AI agents. Think of it as infrastructure that makes AI agents smarter about documentation - agents don't invoke docent directly, they just become better at understanding and improving docs.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **Git**
- An AI agent that supports MCP (Claude Code or Claude Desktop)

Check your versions:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.x or higher
git --version   # Any recent version
```

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/tnez/docent.git
cd docent

# Install dependencies and build
npm install
```

The `npm install` automatically builds the project via the `prepare` script. You should see:

```bash
> @tnezdev/docent@0.3.0 prepare
> npm run build

> @tnezdev/docent@0.3.0 build
> tsc -b
```

### 2. Verify the Build

```bash
# Check that lib/ directory was created
ls -la lib/

# Test the MCP server starts
./bin/mcp-server.js
```

You should see:

```
Docent MCP server running on stdio
```

Press `Ctrl+C` to stop it.

### 3. Configure Your Agent

**For Claude Code:**

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "docent-dev": {
      "type": "stdio",
      "command": "/absolute/path/to/docent/bin/mcp-server.js",
      "args": [],
      "env": {}
    }
  }
}
```

**Important:** Replace `/absolute/path/to/docent` with your actual path (use `pwd` to get it).

**For Claude Desktop:**

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docent-dev": {
      "command": "/absolute/path/to/docent/bin/mcp-server.js",
      "args": []
    }
  }
}
```

### 4. Restart Your Agent

- **Claude Code**: Exit (`/exit`) and restart
- **Claude Desktop**: Quit and reopen the application

### 5. Test the Connection

In your agent, try:

```
Use docent to analyze this project
```

If you see project analysis results (languages, frameworks, etc.), you're all set! 🎉

## Development Workflow

### Making Changes

1. **Edit source files** in `src/`
2. **Rebuild** with `npm run build`
3. **Restart your agent** to load changes
4. **Test** the new functionality

```bash
# Example workflow
vim src/lib/detector.ts
npm run build
# Restart Claude Code/Desktop
# Test changes
```

### Project Structure

```
docent/
├── bin/                    # MCP server entry point
│   └── mcp-server.js      # Starts the MCP server
├── src/                   # TypeScript source
│   ├── lib/              # Core libraries
│   │   ├── detector.ts          # Project analysis
│   │   ├── agent-audit.ts       # Context gathering
│   │   └── prompt-builder.ts    # Prompt generation
│   └── mcp/              # MCP server implementation
│       ├── server.ts            # Main server
│       ├── tools/              # MCP tools (analyze, audit, etc.)
│       ├── resources/          # MCP resources (URIs, templates)
│       └── prompts/            # MCP prompts (workflows)
├── lib/                   # Compiled JavaScript (gitignored)
├── templates/            # Documentation templates
├── docs/                 # Project documentation
│   ├── guides/          # User guides (this file!)
│   ├── rfcs/            # Proposals
│   ├── adr/             # Architecture decisions
│   └── specs/           # Specifications
└── test/                # Tests
```

### Key Files

- **`src/mcp/server.ts`** - MCP server registration and handlers
- **`src/lib/detector.ts`** - Project analysis logic
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration

## Common Tasks

### Add a New MCP Tool

1. Create tool file: `src/mcp/tools/my-tool.ts`

```typescript
export const myToolDefinition = {
  name: 'my-tool',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      arg: {type: 'string', description: 'Argument description'}
    },
    required: ['arg']
  }
} as const

export async function handleMyTool(args: {arg: string}) {
  // Implementation
  return {
    content: [{type: 'text' as const, text: 'Result'}]
  }
}
```

1. Register in `src/mcp/server.ts`:

```typescript
import {myToolDefinition, handleMyTool} from './tools/my-tool.js'

const tools = [
  // ... existing tools
  myToolDefinition,
]

// Add case in CallToolRequestSchema handler
case 'my-tool':
  return await handleMyTool(args as {arg: string})
```

1. Build and test:

```bash
npm run build
# Restart agent and test
```

### Add a New Template

1. Create template file: `templates/my-template.md`

```markdown
# Template Title

Template content here...
```

1. Update template type in `src/mcp/tools/get-template.ts` if needed

2. Rebuild and test

### Run Linting

```bash
npm run lint
```

Fix issues:

```bash
npm run lint -- --fix
```

### Run Tests

```bash
# Currently only installer tests exist
./test/test-install.sh

# In the future (when unit tests are added)
npm test
```

## Making Your First Contribution

### 1. Find an Issue

- Check [GitHub Issues](https://github.com/tnez/docent/issues)
- Look for issues labeled `good first issue`
- Or propose your own improvement

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Edit code in `src/`
- Add tests if applicable (see [Testing Guide](./testing.md))
- Update docs if needed
- Follow existing code style

### 4. Test Your Changes

```bash
# Build
npm run build

# Lint
npm run lint

# Test manually with your agent
```

### 5. Commit

```bash
git add .
git commit -m "feat: add your feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf lib/ node_modules/
npm install
npm run build
```

### Agent Can't Find Docent

1. Check config path is absolute (not relative)
2. Verify `./bin/mcp-server.js` runs without errors
3. Restart agent completely
4. Check agent logs for MCP connection errors

### TypeScript Errors

```bash
# Check TypeScript version
npx tsc --version

# Rebuild from scratch
rm -rf lib/
npm run build
```

### Changes Not Appearing

1. Did you rebuild? (`npm run build`)
2. Did you restart your agent?
3. Check you're editing `src/` not `lib/`

## Development Tips

### Use Watch Mode for Faster Development

```bash
# Terminal 1: Watch and rebuild on changes
npx tsc -b --watch

# Terminal 2: Run your agent
# Changes rebuild automatically
```

### Test Without Restarting Agent

For rapid iteration, you can:

1. Keep agent running
2. Make changes
3. Rebuild (`npm run build`)
4. Restart just the MCP connection (implementation varies by agent)

### Use the Journal

Docent dogfoods its own journal feature:

```bash
# View current work journal
cat .docent/journal.md
```

Use `capture-work` tool to document your changes as you work.

### Debug MCP Communication

Enable MCP debugging in your agent to see:

- Tool calls
- Resource requests
- Prompt invocations
- Errors and responses

## Next Steps

- Read the [MCP API Reference](./mcp-api-reference.md) to understand all capabilities
- Check out [RFCs](../rfcs/) to see planned features
- Review [ADRs](../adr/) to understand architectural decisions
- Join discussions in GitHub Issues

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/tnez/docent/issues)
- **Discussions**: GitHub Discussions (coming soon)
- **Docs**: Browse `/docs/guides/` for more guides

## Philosophy

Remember: Docent is infrastructure for AI agents, not a direct tool for humans.

- Agents use docent → Agents become smarter
- Humans use agents → Humans get better help
- Documentation becomes → Configuration for intelligence

Your contributions make all agents better at understanding and improving documentation. That's pretty cool! 🚀
