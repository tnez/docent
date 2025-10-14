# ADR-0002: Use Oclif for CLI Framework

**Status:** Superseded by [ADR-0004](./adr-0004-mcp-only-architecture.md)
**Date:** 2025-10-11
**Deciders:** @tnez
**Technical Story:** CLI Implementation (ADR-0001)

## Context

After deciding to build a CLI platform (ADR-0001), we needed to choose a CLI framework. The requirements were:

**Must Have:**

- Rich, first-class CLI user experience (colors, formatting, progress indicators)
- TypeScript support with good type safety
- Support for both human-readable and JSON output modes
- Mature, actively maintained project
- Good documentation and examples
- Help generation and command discovery

**Nice to Have:**

- Plugin system for extensibility
- Built-in testing utilities
- Command auto-completion
- Hook system for customization
- Multi-command support (analyze, init, audit, review)

**Constraints:**

- Must work on macOS, Linux, and Windows
- Should be installable via npm/npx
- Cannot have large dependency footprint (affects install time)
- Must support both interactive and non-interactive modes

## Decision

Use **oclif** (https://oclif.io/) as the CLI framework.

Oclif is built by Salesforce/Heroku specifically for building production CLIs. It's the framework behind the Heroku CLI, Salesforce CLI, and many other enterprise CLIs.

**Key features we're using:**

- Rich output formatting with chalk integration
- Command class structure for each command (analyze, init, audit, review)
- Flag parsing with type validation
- Automatic help generation
- JSON output mode support
- TypeScript-first design

## Consequences

### Positive

- **Professional UX** - Built-in support for colors, tables, spinners, progress bars
- **Type Safety** - Excellent TypeScript support with strong typing
- **Proven at Scale** - Battle-tested by Heroku and Salesforce CLIs
- **Plugin System** - Can add plugins in the future if needed
- **Auto-completion** - Built-in support for shell completion
- **Testing Support** - `@oclif/test` provides testing utilities
- **Command Organization** - Clear structure in `/src/commands/`
- **Help Generation** - Automatic `--help` for all commands
- **Mature Ecosystem** - Active community and good documentation

### Negative

- **Dependency Size** - Oclif brings ~717 npm packages (though most are transitive)
- **Learning Curve** - Oclif has its own patterns and conventions
- **Abstraction Layer** - Adds complexity compared to raw commander or yargs
- **Framework Lock-in** - Harder to switch frameworks later
- **Build Step Required** - Must compile TypeScript before running (dev friction)

### Neutral

- **File Structure** - Requires specific directory layout (`src/commands/`, `lib/`)
- **Configuration** - Uses `package.json` oclif section for config
- **Manifest System** - Can generate manifest for faster startup
- **Version Compatibility** - Currently on oclif v4 (major versions can have breaking changes)

## Alternatives Considered

### Alternative 1: Commander.js

**Description:** The most popular Node.js CLI framework, used by npm, yarn, etc.

**Pros:**

- Very lightweight (~50 dependencies)
- Extremely popular (28k+ GitHub stars)
- Simple API, easy to learn
- Fast installation
- Good TypeScript support

**Cons:**

- No built-in theming or rich output
- Must manually implement JSON output mode
- No plugin system
- Less opinionated structure
- Help formatting is basic
- No testing utilities

**Why not chosen:** Too bare-bones. Would need to build rich output, help formatting, and JSON mode ourselves.

### Alternative 2: Yargs

**Description:** Another popular CLI parser with good community support.

**Pros:**

- Very flexible and powerful
- Good TypeScript support
- Smaller than oclif (~300 dependencies)
- Advanced parsing features
- Good documentation

**Cons:**

- API can be verbose
- Less opinionated than oclif
- No built-in rich output
- Help formatting is dated
- No plugin system
- Testing requires more setup

**Why not chosen:** Middle ground between commander and oclif, but doesn't match oclif's rich UX or structure.

### Alternative 3: Ink (React for CLIs)

**Description:** Build CLIs using React components, created by Sindre Sorhus.

**Pros:**

- React component model
- Very rich UI capabilities
- Excellent for interactive CLIs
- Modern development experience
- Great for complex UIs

**Cons:**

- Overkill for our use case
- Higher complexity
- Larger bundle size
- Not traditional CLI paradigm
- More dependencies
- Steeper learning curve

**Why not chosen:** Too complex for our needs. We need traditional CLI with rich output, not React components.

### Alternative 4: Minimist + Manual Implementation

**Description:** Use minimal parser (minimist) and build everything ourselves.

**Pros:**

- Complete control
- Minimal dependencies
- No framework abstractions
- Exactly what we want
- Easy to understand

**Cons:**

- Must build everything (help, output, validation)
- Time-consuming to implement properly
- Reinventing the wheel
- Harder to maintain
- No community patterns
- Testing from scratch

**Why not chosen:** Would take weeks to build what oclif provides. Not a good use of time.

## Implementation Notes

### Package Structure

```json
{
  "dependencies": {
    "@oclif/core": "^4",
    "@oclif/plugin-help": "^6",
    "chalk": "^4.1.2",
    "inquirer": "^8.2.6",
    "glob": "^10.3.10"
  }
}
```

### Command Structure

Each command is a class extending `Command`:

```typescript
export default class Analyze extends Command {
  static description = 'Analyze project structure'
  static flags = {
    output: Flags.string({...}),
    path: Flags.string({...})
  }

  async run(): Promise<void> {
    // Command implementation
  }
}
```

### Output Modes

All commands support dual output:

- **Human mode** (default): Rich formatting with chalk
- **JSON mode** (`--output json`): Structured JSON for agents

```typescript
if (flags.output === 'json') {
  this.log(JSON.stringify(result, null, 2))
} else {
  this.displayHumanReadable(result)
}
```

### Development Workflow

```bash
# Dev mode (with ts-node)
./bin/run analyze

# Build for production
npm run build

# Test
npm test
```

### Future Enhancements

Oclif supports features we may use later:

- Plugins for extensibility
- Topics for command grouping
- Hooks for lifecycle events
- Shell auto-completion
- Update notifications

## References

- [Oclif Documentation](https://oclif.io/)
- [Oclif GitHub](https://github.com/oclif/oclif)
- [ADR-0001: CLI Platform Decision](./adr-0001-cli-platform-over-templates-only.md)
- [Commander.js](https://github.com/tj/commander.js)
- [Yargs](https://github.com/yargs/yargs)
- [Ink](https://github.com/vadimdemedes/ink)

---

**This ADR documents the technical choice for our CLI framework. Oclif gives us the rich UX we need while maintaining clean TypeScript code.**
