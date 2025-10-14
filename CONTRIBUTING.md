# Contributing to docent

Thank you for considering contributing! This project thrives on community contributions.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
1. Check existing issues - your bug may already be reported
2. Try the latest version - bug might already be fixed
3. Reproduce consistently - ensure bug is reproducible

When creating a bug report, include:
- Clear title describing the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, shell version, project type)
- Screenshots if applicable

### Suggesting Features

Before suggesting a feature:
1. Check the roadmap - feature might be planned
2. Search issues - idea might be discussed already
3. Consider scope - does it fit the project vision?

When suggesting a feature:
- Explain the problem it solves
- Describe how it should work
- Show examples of how users would use it
- Consider alternatives

### Improving Documentation

Documentation improvements are always welcome:
- Fix typos and grammar
- Clarify confusing sections
- Add examples
- Update outdated information

Small documentation fixes can be submitted directly as PRs.

### Contributing Code

For code contributions:
1. Discuss first - for significant changes, open an issue first
2. Follow conventions - match existing code style
3. Test thoroughly - ensure changes work on multiple platforms
4. Document changes - update relevant documentation
5. Write clear commits - follow commit message conventions

## Pull Request Process

### 1. Fork and Branch

```bash
git clone git@github.com:your-username/docent.git
cd docent
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code style and conventions
- Add tests if applicable
- Update documentation

### 3. Test Your Changes

```bash
# Test installer on dry-run
./scripts/install.sh --dry-run /tmp/test-project

# Test on different platforms if possible
```

### 4. Commit Your Changes

Follow our commit message conventions:

```bash
git add .
git commit -m "feat: add troubleshooting guide template"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a pull request on GitHub with:
- Clear, descriptive title
- Explanation of what changed and why
- Link to related issues

### 6. Code Review

- Address reviewer feedback
- Push updates to the same branch
- Be patient - reviews may take a few days

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>: <subject>

<body>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Formatting (no code change)
- **refactor:** Code change that neither fixes bug nor adds feature
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

### Examples

```
feat: add troubleshooting guide template

- Add template file with diagnosis and solution sections
- Include example for database connection issues
- Update template selection guide
```

```
fix: installer fails on paths with spaces

- Add quotes around all path variables
- Test on paths with spaces
- Add regression test
```

## Code Style

### Shell Scripts

- Use `#!/usr/bin/env bash` shebang
- Enable strict mode: `set -euo pipefail`
- Quote all variables: `"$variable"`
- Use `[[` for conditionals
- Add comments for complex logic

### Markdown

- Use ATX-style headers (`#` not `====`)
- Use fenced code blocks with language
- Use consistent list markers (`-`)
- End files with newline
- Maximum line length: 100 characters (soft limit)

### Documentation Templates

- Use clear, actionable section headers
- Include inline guidance comments
- Provide examples where helpful
- Keep tone professional but approachable

## Testing

Before submitting, test:
- [ ] Installation on fresh directory
- [ ] Installation on directory with existing docs
- [ ] Dry-run mode
- [ ] Rollback functionality

Test on multiple platforms if possible:
- macOS
- Ubuntu Linux
- Windows WSL

## Questions?

- **General questions:** Open an issue
- **Security issues:** See SECURITY.md (if available)

Thank you for contributing!
