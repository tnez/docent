# Contributing to Docent

This guide helps you set up your development environment and understand the contribution workflow.

## Prerequisites

### System Dependencies

The following system tools are required for development:

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **shellcheck** - Shell script linter used in CI/CD

  ```bash
  # macOS
  brew install shellcheck

  # Ubuntu/Debian
  apt-get install shellcheck

  # Other platforms
  # See https://github.com/koalaman/shellcheck#installing
  ```

### Project Dependencies

After cloning the repository:

```bash
# Install Node.js dependencies
npm install

# Build TypeScript
npm run build
```

This installs all required development tools including:

- `markdownlint-cli2` - Markdown linter
- `eslint` - JavaScript/TypeScript linter
- `typescript` - TypeScript compiler
- `mocha` & `chai` - Testing framework

## Development Workflow

### 1. Make Your Changes

Edit code, documentation, or scripts as needed.

### 2. Run Local Checks

Before committing, run the same checks that CI/CD will run:

#### TypeScript Build

```bash
npm run build
```

#### Linting

```bash
# TypeScript/JavaScript linting
npm run lint

# Shell script linting
shellcheck ./scripts/*.sh ./test/*.sh

# Markdown linting
npx markdownlint-cli2 "**/*.md" "!node_modules"
```

#### Tests

```bash
# Run test suite
./test/test-install.sh

# Test installation in clean directory
cd /tmp && mkdir test-install && cd test-install
/path/to/docent/scripts/install.sh --templates=all --non-interactive
```

### 3. Fix Any Issues

If linting or tests fail, fix the issues before committing:

#### ShellCheck Issues

- Quote variables: `"$var"` instead of `$var`
- Check for undefined variables
- Fix array handling
- Address exit code handling

#### Markdown Lint Issues

Most markdown issues can be auto-fixed:

```bash
# Auto-fix all markdown files
npx markdownlint-cli2 --fix

# Auto-fix specific file
npx markdownlint-cli2 --fix path/to/file.md
```

**Auto-fixable rules** (enabled):

- MD022 - Blank lines around headings
- MD031 - Blank lines around fences
- MD032 - Blank lines around lists

**Style rules** (disabled - no need to fix):

- MD013 (line length), MD024 (duplicate headings), MD026 (trailing punctuation)
- MD034 (bare URLs), MD036 (emphasis as heading), MD040 (code language)

**Editor Integration:**

For auto-format on save in neovim, see [Neovim Markdown Setup](neovim-markdown-setup.md)

#### TypeScript Issues

- Run `npm run build` to see type errors
- Fix any type errors before committing

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue with..."
git commit -m "docs: update contributing guide"
```

Commit types:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

## CI/CD Checks

Our GitHub Actions workflows run automatically on push and pull requests:

### Test Workflow (`test.yml`)

- Runs on Ubuntu and macOS
- Executes `./test/test-install.sh`
- Tests installation in clean directory
- Tests uninstallation

### Lint Workflow (`lint.yml`)

- Runs ShellCheck on `./scripts` and `./test` directories
- Runs Markdown linting on all `*.md` files

### Viewing CI/CD Status

See [CI/CD Health Check Runbook](/Users/tnez/Code/tnez/docent/docs/runbooks/ci-cd-health-check.md) for:

- How to check workflow status with `gh` CLI
- Troubleshooting common failures
- Re-running failed workflows

## Project Structure

```
docent/
├── bin/              # Executable scripts (mcp-server.js)
├── lib/              # Compiled TypeScript (generated)
├── src/              # TypeScript source code
├── templates/        # Documentation templates
├── scripts/          # Installation/maintenance scripts
├── test/             # Test scripts
├── docs/             # Project documentation
│   ├── guides/       # How-to guides (like this one)
│   ├── runbooks/     # Operational procedures
│   ├── adr/          # Architecture Decision Records
│   └── rfcs/         # Request for Comments
└── package.json      # Node.js dependencies and scripts
```

## MCP Development

If working on the MCP server:

1. Build after changes:

   ```bash
   npm run build
   ```

2. Test manually:

   ```bash
   node ./test-mcp.js
   ```

3. Update Claude Desktop config to use your local build:

   ```json
   {
     "mcpServers": {
       "docent": {
         "command": "node",
         "args": ["/absolute/path/to/docent/lib/mcp/server.js"]
       }
     }
   }
   ```

See [MCP Setup Guide](mcp-setup.md) for more details.

## Getting Help

- Check existing [documentation](../README.md)
- Review [runbooks](../runbooks/) for operational procedures
- Check [issues](https://github.com/tnez/docent/issues) for known problems
- Open a new issue if you find a bug or have a question

## Code Style

- Follow existing code conventions
- Use TypeScript for new source code
- Write tests for new features
- Document public APIs
- Keep shell scripts POSIX-compatible when possible
- Prefer bash 3.2+ features (macOS default)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
