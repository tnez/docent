# Spec: Analyze Tool (MCP)

## Metadata
- **Status:** draft
- **Created:** 2025-10-13
- **Updated:** 2025-10-13
- **Related:**
  - Implementation: `/Users/tnez/Code/tnez/docent/src/mcp/tools/analyze.ts`
  - Core logic: `/Users/tnez/Code/tnez/docent/src/lib/detector.ts`

## Context

The `analyze` MCP tool detects and reports on a project's technical stack by examining its file structure, configuration files, and dependencies. It identifies programming languages, frameworks, build tools, package managers, and project organization patterns through filesystem analysis without executing any code.

This tool is designed for AI agents to quickly understand a project's technology stack and structure. The structured JSON response enables agents to programmatically access project metadata for decision-making and documentation generation.

## Behaviors

### Scenario: Basic Project Analysis
**Given:** A TypeScript project with standard structure (src/, tests/, docs/ directories)
**When:** Agent calls `analyze` tool with project path
**Then:**
- Tool scans the specified directory
- Returns structured JSON with:
  - Languages detected (with file counts, extensions, confidence levels)
  - Frameworks & libraries (grouped by type: web, backend, testing, etc.)
  - Project structure (source, test, docs directories with boolean flags)
  - Build tools (if present)
  - Package managers (if lockfiles found)
  - Summary (primary language, primary framework, totals, timestamp)
- Confidence levels: "high" (>30% of files), "medium" (10-30%), "low" (<10%)

#### Example:
```typescript
// Agent calls tool
const result = await tools.analyze({
  path: "/path/to/project"
});
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

### Scenario: Analyze Specific Directory
**Given:** Agent wants to analyze a specific project directory
**When:** Agent calls `analyze` with `path` parameter
**Then:**
- Tool analyzes the specified directory instead of current directory
- All detection logic remains the same
- Returns structured analysis result
- If path doesn't exist, returns error

#### Example:
```typescript
const result = await tools.analyze({
  path: "/Users/dev/projects/my-app"
});
```

### Scenario: Empty or Minimal Project
**Given:** A directory with no recognized languages or frameworks
**When:** Agent calls `analyze` tool
**Then:**
- Tool completes successfully
- Returns empty arrays for languages and frameworks
- Structure section shows false for missing directories
- Build tools and package managers arrays are empty
- Primary language shows "Unknown"

#### Example:
```json
{
  "languages": [],
  "frameworks": [],
  "structure": {
    "hasSource": false,
    "hasTests": false,
    "hasDocs": false,
    "sourceDirectories": [],
    "testDirectories": [],
    "docsDirectories": [],
    "rootFiles": []
  },
  "buildTools": [],
  "packageManagers": [],
  "timestamp": "2025-10-13T19:45:00.000Z"
}
```

### Scenario: Multi-Language Polyglot Project
**Given:** A project with multiple languages (e.g., TypeScript frontend, Python backend)
**When:** Agent calls `analyze` tool
**Then:**
- All detected languages listed in descending order by file count
- Confidence calculated independently for each language based on percentage of total files
- Primary language is the one with most files
- Frameworks from all languages detected (React + FastAPI)

#### Example:
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
      "name": "Python",
      "fileCount": 87,
      "primaryExtensions": [".py"],
      "confidence": "medium"
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
      "name": "FastAPI",
      "type": "backend",
      "confidence": "high",
      "detectedFrom": "requirements.txt"
    },
    {
      "name": "Jest",
      "type": "testing",
      "confidence": "high",
      "detectedFrom": "package.json"
    },
    {
      "name": "pytest",
      "type": "testing",
      "confidence": "high",
      "detectedFrom": "requirements.txt"
    }
  ]
}
```

### Scenario: Language Confidence Levels
**Given:** A project with varying amounts of different languages
**When:** Tool analyzes file counts
**Then:**
- Confidence "high" when language represents >30% of total files
- Confidence "medium" when language represents 10-30% of total files
- Confidence "low" when language represents <10% of total files

### Scenario: Framework Detection via Package Manifests
**Given:** A Node.js project with package.json containing dependencies
**When:** Tool reads package.json
**Then:**
- Detects frameworks from both `dependencies` and `devDependencies`
- Categorizes by type: web, backend, testing, mobile, desktop, other
- Shows detection source: `package.json`, `requirements.txt`, etc.
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
**When:** Tool scans for language files
**Then:**
- These directories are automatically excluded from analysis
- File counts only reflect actual source/test/doc files
- Analysis completes faster due to exclusions

### Scenario: Project Structure Detection
**Given:** A project with various directory names
**When:** Tool analyzes structure
**Then:**
- Source directories: Matches `src/`, `lib/`, `app/`, `source/`, `pkg/`
- Test directories: Matches `test/`, `tests/`, `__tests__/`, `spec/`, `specs/`
- Docs directories: Matches `docs/`, `doc/`, `documentation/`
- Lists ALL matching directories (not just first match)
- Strips trailing slashes in output

## Acceptance Criteria
- [ ] Tool executes without errors on typical projects
- [ ] Returns structured JSON matching AnalysisResult interface
- [ ] Language detection covers 40+ languages via extension mapping
- [ ] Framework detection works for all supported ecosystems (JS, Python, Rust, Go, Ruby, PHP, Java, .NET)
- [ ] Confidence levels calculated correctly (>30% high, 10-30% medium, <10% low)
- [ ] Project structure correctly identifies source/test/docs directories
- [ ] Build tools detected via file existence (Makefile, Justfile, webpack.config.js, etc.)
- [ ] Package managers detected via lockfiles (npm, yarn, pnpm, cargo, etc.)
- [ ] Excluded directories (node_modules, dist, build, .git, coverage) are ignored
- [ ] JSON output is valid and parseable by agents
- [ ] Path parameter allows analyzing specified directories
- [ ] Gracefully handles empty projects (no errors, returns empty arrays)
- [ ] Gracefully handles malformed config files (ignores parse errors)
- [ ] Timestamp included in results (ISO 8601 format)
- [ ] Returns error for non-existent paths

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
- Non-interactive tool (no user interaction required)
- Deterministic output for same inputs
- Machine-readable error messages

## Test Hints

**Unit Tests:**
- Test language detection with fixture directories containing known file sets
- Test framework detection by creating mock package.json files
- Test confidence calculation with various file count distributions
- Test structure detection with different directory naming patterns
- Test exclusion patterns (ensure node_modules ignored)

**Integration Tests:**
- Test against real-world projects (docent itself, example repos)
- Verify JSON output is valid and matches schema
- Test path parameter with absolute and relative paths
- Test error handling (non-existent paths, permission errors)

**Edge Cases:**
- Empty directories
- Projects with no recognized languages
- Symlinks in project structure
- Very large projects (>10k files)
- Malformed package.json or other config files
- Mixed line endings
- Unicode filenames
