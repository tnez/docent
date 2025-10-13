# Spec: Analyze Command

## Metadata
- **Status:** draft
- **Created:** 2025-10-13
- **Updated:** 2025-10-13
- **Related:**
  - Implementation: `/Users/tnez/Code/tnez/docket/src/commands/analyze.ts`
  - Core logic: `/Users/tnez/Code/tnez/docket/src/lib/detector.ts`

## Context

The `analyze` command detects and reports on a project's technical stack by examining its file structure, configuration files, and dependencies. It identifies programming languages, frameworks, build tools, package managers, and project organization patterns through filesystem analysis without executing any code.

This command is designed to help both humans and AI agents quickly understand a project's technology stack and structure. The JSON output mode enables agents to programmatically access project metadata for decision-making.

## Behaviors

### Scenario: Basic Project Analysis (Human Output)
**Given:** A TypeScript project with standard structure (src/, tests/, docs/ directories)
**When:** User runs `docket analyze`
**Then:**
- Command scans the current directory
- Displays color-coded human-readable output with sections:
  - Languages Detected (with file counts, extensions, confidence badges)
  - Frameworks & Libraries (grouped by type: web, backend, testing, etc.)
  - Project Structure (source, test, docs directories with checkmarks)
  - Build Tools (if present)
  - Package Managers (if lockfiles found)
  - Summary (primary language, primary framework, totals, timestamp)
- Confidence levels shown as colored dots: green (high), yellow (medium), red (low)
- Exit code 0

#### Example:
```bash
docket analyze
```

```
🔍 Analyzing project...

📝 Languages Detected:
  ● TypeScript - 145 files (.ts, .tsx)
  ● JavaScript - 12 files (.js)

🔧 Frameworks & Libraries:
  web:
    ● React [package.json]
  backend:
    ● Express [package.json]
  testing:
    ● Jest [package.json]

📁 Project Structure:
  ✓ Source directories: src
  ✓ Test directories: tests
  ✓ Documentation directories: docs

🛠️  Build Tools:
  TypeScript, Webpack

📦 Package Managers:
  npm

📊 Summary:
  Primary Language: TypeScript
  Primary Framework: React
  Total Languages: 2
  Total Frameworks: 3

Analysis completed at 10/13/2025, 3:45:00 PM
```

### Scenario: JSON Output for Agent Integration
**Given:** Any project
**When:** User runs `docket analyze --output json`
**Then:**
- Command outputs valid JSON to stdout (no color codes, no progress messages)
- JSON structure matches `AnalysisResult` interface:
  - `languages[]`: Array with name, fileCount, primaryExtensions, confidence
  - `frameworks[]`: Array with name, type, confidence, detectedFrom
  - `structure`: Object with boolean flags and directory arrays
  - `buildTools[]`: Array of strings
  - `packageManagers[]`: Array of strings
  - `timestamp`: ISO 8601 date string
- Exit code 0

#### Example:
```bash
docket analyze --output json
```

```json
{
  "languages": [
    {
      "name": "TypeScript",
      "fileCount": 145,
      "primaryExtensions": [".ts", ".tsx"],
      "confidence": "high"
    },
    {
      "name": "JavaScript",
      "fileCount": 12,
      "primaryExtensions": [".js"],
      "confidence": "low"
    }
  ],
  "frameworks": [
    {
      "name": "React",
      "type": "web",
      "confidence": "high",
      "detectedFrom": "package.json"
    },
    {
      "name": "Express",
      "type": "backend",
      "confidence": "high",
      "detectedFrom": "package.json"
    },
    {
      "name": "Jest",
      "type": "testing",
      "confidence": "high",
      "detectedFrom": "package.json"
    }
  ],
  "structure": {
    "hasSource": true,
    "hasTests": true,
    "hasDocs": true,
    "sourceDirectories": ["src"],
    "testDirectories": ["tests"],
    "docsDirectories": ["docs"],
    "rootFiles": ["package.json", "tsconfig.json", "README.md"]
  },
  "buildTools": ["TypeScript", "Webpack"],
  "packageManagers": ["npm"],
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Analyze Non-Current Directory
**Given:** User wants to analyze a different project
**When:** User runs `docket analyze --path /path/to/other/project`
**Then:**
- Command analyzes the specified directory instead of current directory
- All other behavior remains the same (respects --output flag)
- If path doesn't exist, reports error

#### Example:
```bash
docket analyze --path ~/projects/my-app --output json
```

### Scenario: Empty or Minimal Project
**Given:** A directory with no recognized languages or frameworks
**When:** User runs `docket analyze`
**Then:**
- Command completes successfully (exit code 0)
- Displays "No languages detected" in dimmed text
- Displays "No frameworks detected" in dimmed text
- Structure section shows ✗ for missing directories
- Build tools and package managers sections omitted if none found
- Summary shows "Unknown" for primary language

#### Example:
```bash
docket analyze
```

```
🔍 Analyzing project...

📝 Languages Detected:
  No languages detected

🔧 Frameworks & Libraries:
  No frameworks detected

📁 Project Structure:
  ✗ Source directories: none
  ✗ Test directories: none
  ✗ Documentation directories: none

📊 Summary:
  Primary Language: Unknown
  Total Languages: 0
  Total Frameworks: 0

Analysis completed at 10/13/2025, 3:45:00 PM
```

### Scenario: Multi-Language Polyglot Project
**Given:** A project with multiple languages (e.g., TypeScript frontend, Python backend)
**When:** User runs `docket analyze`
**Then:**
- All detected languages listed in descending order by file count
- Confidence calculated independently for each language based on percentage of total files
- Primary language is the one with most files
- Frameworks from all languages detected (React + FastAPI)

#### Example:
```bash
docket analyze
```

```
📝 Languages Detected:
  ● TypeScript - 145 files (.ts, .tsx)
  ● Python - 87 files (.py)
  ● JavaScript - 12 files (.js)

🔧 Frameworks & Libraries:
  web:
    ● React [package.json]
  backend:
    ● FastAPI [requirements.txt]
  testing:
    ● Jest [package.json]
    ● pytest [requirements.txt]
```

### Scenario: Language Confidence Levels
**Given:** A project with varying amounts of different languages
**When:** Command analyzes file counts
**Then:**
- Confidence "high" (green ●) when language represents >30% of total files
- Confidence "medium" (yellow ●) when language represents 10-30% of total files
- Confidence "low" (red ●) when language represents <10% of total files

### Scenario: Framework Detection via Package Manifests
**Given:** A Node.js project with package.json containing dependencies
**When:** Command reads package.json
**Then:**
- Detects frameworks from both `dependencies` and `devDependencies`
- Categorizes by type: web, backend, testing, mobile, desktop, other
- Shows detection source in brackets: `[package.json]`
- Deduplicates if same framework detected from multiple files
- Gracefully handles JSON parse errors (ignores malformed files)

#### Supported ecosystems:
- **JavaScript/TypeScript:** package.json, deno.json, bun.lockb
- **Python:** requirements.txt, pyproject.toml, setup.py, Pipfile, poetry.lock
- **Rust:** Cargo.toml
- **Go:** go.mod
- **Ruby:** Gemfile
- **PHP:** composer.json
- **Java/Kotlin:** pom.xml, build.gradle, build.gradle.kts
- **.NET:** *.csproj, *.fsproj

### Scenario: Excluded Directories
**Given:** A project with node_modules/, dist/, build/, .git/, coverage/ directories
**When:** Command scans for language files
**Then:**
- These directories are automatically excluded from analysis
- File counts only reflect actual source/test/doc files
- Analysis completes faster due to exclusions

### Scenario: Project Structure Detection
**Given:** A project with various directory names
**When:** Command analyzes structure
**Then:**
- Source directories: Matches `src/`, `lib/`, `app/`, `source/`, `pkg/`
- Test directories: Matches `test/`, `tests/`, `__tests__/`, `spec/`, `specs/`
- Docs directories: Matches `docs/`, `doc/`, `documentation/`
- Lists ALL matching directories (not just first match)
- Strips trailing slashes in output

## Acceptance Criteria
- [ ] Command runs without errors on typical projects
- [ ] Both human and JSON output modes work correctly
- [ ] Language detection covers 40+ languages via extension mapping
- [ ] Framework detection works for all supported ecosystems (JS, Python, Rust, Go, Ruby, PHP, Java, .NET)
- [ ] Confidence levels calculated correctly (>30% high, 10-30% medium, <10% low)
- [ ] Project structure correctly identifies source/test/docs directories
- [ ] Build tools detected via file existence (Makefile, Justfile, webpack.config.js, etc.)
- [ ] Package managers detected via lockfiles (npm, yarn, pnpm, cargo, etc.)
- [ ] Excluded directories (node_modules, dist, build, .git, coverage) are ignored
- [ ] JSON output is valid JSON parseable by agents
- [ ] Human output uses color and formatting appropriately
- [ ] --path flag allows analyzing non-current directories
- [ ] Gracefully handles empty projects (no crashes, shows "none" messages)
- [ ] Gracefully handles malformed config files (ignores parse errors)
- [ ] Exit code 0 on success
- [ ] Timestamp included in results (ISO 8601 format)

## Technical Notes

**Language Detection Algorithm:**
- Uses `glob` library to find all files recursively
- Maps file extensions to languages via `LANGUAGE_EXTENSIONS` dictionary
- Excludes: `node_modules/`, `vendor/`, `dist/`, `build/`, `.git/`, `coverage/`
- Confidence based on percentage of total recognized files
- Sorted by file count descending

**Framework Detection Strategy:**
- Pattern-based: Searches for indicator files (package.json, Cargo.toml, etc.)
- Each indicator has custom detector function
- Detectors parse file contents and look for known dependency names
- Deduplication ensures each framework listed once
- All file I/O wrapped in try-catch (ignore errors)

**Performance Considerations:**
- All detection routines run in parallel via Promise.all
- Glob operations can be slow on large projects (mitigated by ignore patterns)
- No network calls, no code execution (pure filesystem analysis)

**Agent-Friendly Design:**
- JSON output contains structured data suitable for programmatic use
- No user interaction required (non-interactive command)
- Deterministic output for same inputs
- Machine-readable error messages (when stderr is used)

## Test Hints

**Unit Tests:**
- Test language detection with fixture directories containing known file sets
- Test framework detection by creating mock package.json files
- Test confidence calculation with various file count distributions
- Test structure detection with different directory naming patterns
- Test exclusion patterns (ensure node_modules ignored)

**Integration Tests:**
- Test against real-world projects (docket itself, example repos)
- Verify JSON output is valid and matches schema
- Test --path flag with absolute and relative paths
- Test error handling (non-existent paths, permission errors)

**Edge Cases:**
- Empty directories
- Projects with no recognized languages
- Symlinks in project structure
- Very large projects (>10k files)
- Malformed package.json or other config files
- Mixed line endings
- Unicode filenames
