# Decisions Log
## Key Decisions for Project Documentation Template Repository

**Purpose:** Document important decisions made during project development
**Format:** Based on lightweight ADR format
**Status:** Living document - update as decisions are made

---

## How to Use This Log

1. **Add new decisions** as they are made (not after the fact)
2. **Number sequentially** starting from 001
3. **Keep it brief** - Focus on context, decision, and rationale
4. **Update status** as decisions evolve (proposed → accepted → deprecated)
5. **Reference in commits** - Link to decisions in relevant commits

---

## Decision Template

```markdown
## Decision XXX: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by [Decision YYY]
**Decision Maker:** Name or "Team consensus"

### Context
What situation necessitates this decision? What problem are we solving?

### Options Considered
1. Option A - Brief description
2. Option B - Brief description
3. Option C - Brief description

### Decision
What was decided? Be specific and actionable.

### Rationale
Why was this option chosen over alternatives?
- Key reason 1
- Key reason 2
- Key reason 3

### Consequences
What are the implications of this decision?

**Positive:**
- Benefit 1
- Benefit 2

**Negative:**
- Trade-off 1
- Trade-off 2

**Risks:**
- Risk 1 (and mitigation)
- Risk 2 (and mitigation)

### Implementation Notes
Any specific details about how to implement this decision.

### Related Decisions
Links to related decisions or ADRs.
```

---

## Decisions

### Decision 001: Repository Name

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to choose a GitHub repository name that:
- Clearly communicates the purpose
- Is memorable and easy to type
- Is available on GitHub
- Ranks well in search results

#### Options Considered
1. **project-docs-template** - Clear and descriptive, good balance
2. **docs-starter** - Short but less descriptive
3. **documentation-template** - SEO-friendly but generic
4. **doc-framework** - Implies more structure than provided
5. **project-documentation-kit** - Descriptive but too long

#### Decision
Use `project-docs-template` as the repository name.

#### Rationale
- **Clarity:** Immediately obvious this is a template for project documentation
- **Length:** Reasonably short for command-line use
- **SEO:** Keywords "project", "docs", and "template" aid discovery
- **Availability:** Name is available on GitHub
- **Consistency:** Matches common naming patterns (e.g., `create-react-app`)

#### Consequences

**Positive:**
- Easy for users to understand what the project is
- Good search engine visibility
- Professional appearance

**Negative:**
- Not as short as some alternatives
- "Docs" abbreviation might be less formal than "documentation"

**Risks:**
- Similar names exist (differentiate through quality)

#### Implementation Notes
- Repository URL: `https://github.com/<username>/project-docs-template`
- Update all references in documentation
- Register related domains if planning website (optional)

#### Related Decisions
- Decision 004: Documentation Hosting (may inform domain name choice)

---

### Decision 002: License

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to choose an open-source license that:
- Encourages maximum adoption
- Protects contributors
- Is well-understood and widely used
- Aligns with project goals (public benefit)

#### Options Considered
1. **MIT License** - Most permissive, widely used
2. **Apache 2.0** - Permissive with patent protection
3. **GPL v3** - Copyleft, requires derivatives to be open-source
4. **Creative Commons** - For documentation, unusual for software repos

#### Decision
Use **MIT License** for the project.

#### Rationale
- **Maximum adoption:** Most permissive license removes barriers to use
- **Industry standard:** Most widely understood and accepted license
- **Simplicity:** Short, easy to understand terms
- **Freedom:** Users can use in commercial projects without restrictions
- **Trust:** Well-established license with known legal implications

#### Consequences

**Positive:**
- Companies can use without legal concerns
- Encourages fork-and-customize approach
- No ongoing obligations for users
- Broad compatibility with other projects

**Negative:**
- No copyleft protection (derivatives could be closed-source)
- No explicit patent grant (unlike Apache 2.0)
- Users could commercialize without contributing back

**Risks:**
- Forks could diverge and compete (acceptable risk for template)

#### Implementation Notes
- LICENSE file already added during repository creation
- Copyright year: 2025
- Copyright holder: Project owner
- Include license in all file headers (optional for templates)

#### Related Decisions
- None

---

### Decision 003: Version Scheme

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need a versioning strategy for releases that:
- Clearly communicates breaking changes
- Follows industry standards
- Works with package managers (if published)
- Is easy to understand

#### Options Considered
1. **Semantic Versioning (SemVer)** - MAJOR.MINOR.PATCH (e.g., 1.2.3)
2. **Calendar Versioning (CalVer)** - YYYY.MM or YYYY.MM.MICRO (e.g., 2025.10)
3. **Simple Integer** - v1, v2, v3
4. **Date + Patch** - YYYY.MM.PATCH (e.g., 2025.10.1)

#### Decision
Use **Semantic Versioning (SemVer)** with format MAJOR.MINOR.PATCH.

#### Rationale
- **Industry standard:** Most widely used in software development
- **Clear semantics:** Breaking changes bump MAJOR, features bump MINOR, fixes bump PATCH
- **Tooling support:** Works with all package managers and dependency tools
- **User expectations:** Developers understand SemVer intuitively
- **Future-proof:** Scales to long-term maintenance

**Version meanings for this project:**
- **MAJOR:** Breaking changes to installer, templates, or directory structure
- **MINOR:** New templates, new features, non-breaking installer changes
- **PATCH:** Bug fixes, documentation updates, example improvements

#### Consequences

**Positive:**
- Users know when upgrades might break their workflow
- Compatible with npm, cargo, pip if published as package
- Clear communication of change significance
- Professional and standard approach

**Negative:**
- Requires discipline to properly bump versions
- MAJOR version 0.x.x implies instability (intentional during development)
- Must carefully consider what constitutes "breaking"

**Risks:**
- Accidentally releasing breaking change as MINOR (mitigate with testing)

#### Implementation Notes
- Current version: v0.1.0 (Phase 0 complete)
- v1.0.0 will be first production-ready release (post-launch)
- Pre-releases: v0.x.x or v1.0.0-alpha, v1.0.0-beta, v1.0.0-rc1
- Tag all releases in Git: `git tag -a v1.0.0 -m "Release v1.0.0"`
- Include version in installer: `--version` flag

#### Related Decisions
- None

---

### Decision 004: Documentation Hosting

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to decide where to host comprehensive documentation beyond README:
- Multiple documentation pages needed
- Good reading experience important
- Easy to maintain and update
- Version-controlled
- Free or low-cost

#### Options Considered
1. **docs/ directory in repository** - Simple markdown files
2. **GitHub Wiki** - Built-in, easy, but separate from repo
3. **GitHub Pages** - Static site, full control, requires setup
4. **Docusaurus or similar** - Feature-rich, but overkill for template repo
5. **README only** - Keep everything in single file

#### Decision
Use **docs/ directory in repository** for comprehensive documentation.

#### Rationale
- **Simplicity:** Just markdown files, no build step
- **Version control:** Docs versioned alongside code
- **GitHub rendering:** GitHub renders markdown beautifully
- **Search:** GitHub's search works on docs/
- **Navigation:** Can link between documents easily
- **No external dependencies:** No hosting or build tools required
- **Dogfooding:** Uses the same structure we're recommending

#### Consequences

**Positive:**
- Easy to maintain (edit markdown, commit, done)
- Docs always in sync with code (same repo)
- No build process or deployment
- Works offline (clone repo, read docs)
- Contributors can easily improve docs

**Negative:**
- No search beyond GitHub's search
- No fancy navigation or theming
- Less discoverability than dedicated site
- Can't track analytics easily

**Risks:**
- Docs might become disorganized (mitigate with good structure)
- Future: May want dedicated site if project grows (can migrate later)

#### Implementation Notes
- Documentation structure:
  ```
  docs/
  ├── README.md (index/overview)
  ├── installation.md
  ├── choosing-a-template.md
  ├── customization.md
  ├── claude-integration.md
  ├── troubleshooting.md
  ├── api/ (if needed)
  └── examples/
  ```
- Link from main README to docs/
- Use relative links between docs
- Include table of contents in docs/README.md

**Future consideration:** If project grows significantly, migrate to GitHub Pages using Jekyll or similar.

#### Related Decisions
- Decision 001: Repository Name (domain name not needed currently)

---

### Decision 005: CI/CD Platform

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need automated testing and validation for:
- Pull request validation
- Release automation
- Cross-platform testing
- Link checking, linting, etc.

#### Options Considered
1. **GitHub Actions** - Native integration, free for public repos
2. **Travis CI** - Legacy option, less popular now
3. **CircleCI** - Good features, requires separate account
4. **GitLab CI** - Would require mirroring to GitLab
5. **No CI/CD** - Manual testing only

#### Decision
Use **GitHub Actions** for CI/CD.

#### Rationale
- **Native integration:** Built into GitHub, no external accounts
- **Free:** Unlimited minutes for public repositories
- **Marketplace:** Large marketplace of actions
- **Matrix builds:** Easy cross-platform testing
- **Simple YAML:** Straightforward configuration
- **Industry standard:** Most projects using GitHub use Actions

#### Consequences

**Positive:**
- Automated testing on every PR
- Can test on macOS, Linux, Windows
- Free for open-source project
- Familiar to most contributors
- Can automate releases

**Negative:**
- Tied to GitHub (but that's where repo is)
- Learning curve for YAML syntax
- Free tier has some limitations (not relevant for this project)

**Risks:**
- GitHub Actions outage affects CI (rare, acceptable risk)

#### Implementation Notes

**Phase 1 Workflows:**
1. **Lint and Validate** (runs on every PR)
   - Markdown linting
   - Shell script linting (shellcheck)
   - Link checking
   - YAML validation

2. **Test Installation** (runs on every PR)
   - Test installer on macOS
   - Test installer on Ubuntu
   - Test installer on Windows WSL
   - Matrix testing across OS versions

3. **Release** (runs on tag push)
   - Create GitHub Release
   - Generate release notes
   - Package installer (if needed)

**Configuration file:** `.github/workflows/test.yml`, `release.yml`, etc.

**Future workflows:**
- Automated dependency updates (Dependabot)
- Nightly builds
- Performance testing

#### Related Decisions
- Decision 006: Installation Approach (affects what to test)

---

### Decision 006: Installation Approach

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to decide primary method for users to install the documentation template:
- Must be easy and quick
- Should handle conflicts gracefully
- Needs to work across platforms
- Allow customization

#### Options Considered
1. **Shell script installer** - Flexible, full control, cross-platform
2. **NPM package** - Easy for JS projects, limits non-JS adoption
3. **GitHub Template** - One-click, but can't update easily
4. **Manual copy-paste** - Simple but error-prone
5. **Cookiecutter** - Python-based, requires Python dependency

#### Decision
Use **shell script installer** as primary method, with **GitHub Template** as secondary option.

#### Rationale

**Primary: Shell Script Installer**
- **Flexibility:** Can handle complex scenarios (conflicts, backups, etc.)
- **Cross-platform:** Works on macOS, Linux, WSL
- **Customization:** Can accept flags for different install modes
- **No dependencies:** Just bash, which is everywhere
- **Professional:** Shows attention to detail

**Secondary: GitHub Template**
- **Ease:** One-click to create new repo with template
- **Discovery:** Users browsing GitHub can quickly try
- **Familiarity:** Standard GitHub feature

#### Consequences

**Positive:**
- Installer handles edge cases automatically
- Users have choice (script vs template)
- Can add features to installer over time
- Dry-run mode gives confidence

**Negative:**
- Shell script maintenance burden
- Platform differences require testing
- More complex than simple copy-paste

**Risks:**
- Shell script bugs affect users (mitigate with thorough testing)
- Windows non-WSL users can't use script (document alternative methods)

#### Implementation Notes

**Installer features:**
- Conflict detection and resolution
- Backup creation before changes
- Rollback on error
- Dry-run mode (`--dry-run`)
- Non-interactive mode (`--non-interactive`)
- Selective installation (`--templates=adr,rfc`)
- Custom target directory

**GitHub Template setup:**
- Enable "Template repository" in repository settings
- Add helpful .github/TEMPLATE_REPOSITORY.md
- Document template approach in README

**Alternative methods documented:**
- Manual installation (copy files)
- Git submodule (advanced users)
- Direct download via curl/wget

#### Related Decisions
- Decision 005: CI/CD Platform (test installer in CI)

---

### Decision 007: Configuration Format

**Date:** 2025-10-11
**Status:** Proposed
**Decision Maker:** TBD

#### Context
Need to decide how users configure which templates to install and project-specific settings:
- Some users want minimal templates
- Some want all templates
- May need project-specific customization
- Should be optional (defaults work for most)

#### Options Considered
1. **JSON configuration file** (`.docstemplate.json`)
   - Standard, widely supported
   - Easy to parse in shell scripts
2. **YAML configuration file** (`.docstemplate.yml`)
   - More readable than JSON
   - Requires YAML parser (less standard)
3. **Command-line flags only** (`--templates=adr,rfc`)
   - No file needed
   - Not persistent
4. **Interactive prompts** (`install.sh` asks questions)
   - User-friendly
   - Not automatable
5. **INI file** (`.docstemplate.ini`)
   - Simple format
   - Less common

#### Decision
**NOT YET DECIDED** - Lean toward **command-line flags** with optional **JSON config**.

#### Rationale (Preliminary)
- **Command-line flags:** Cover most use cases, no file needed
- **JSON config (optional):** For complex scenarios, well-supported
- **Both:** Maximum flexibility

Need to validate during Phase 2 implementation.

#### Consequences
TBD after decision is made.

#### Implementation Notes
**If using JSON config:**
```json
{
  "templates": ["adr", "rfc", "runbooks"],
  "customization": {
    "adr_numbering": "YYYY-NNN",
    "create_examples": true
  }
}
```

**If using command-line flags:**
```bash
./install.sh --templates=adr,rfc --no-examples
```

#### Related Decisions
- Decision 006: Installation Approach

---

### Decision 008: Claude Code Distribution

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to decide how to distribute Claude Code commands and agents:
- Not all users have Claude Code
- Claude features are optional enhancement
- Should be easy to install for Claude users
- Must not block non-Claude users

#### Options Considered
1. **Include in main installer** - Installed automatically with templates
2. **Separate installation step** - `./install.sh --with-claude`
3. **Manual copy** - User manually copies .claude/ directory
4. **Claude Code package** - If such a system exists (doesn't currently)
5. **Optional during installation** - Installer asks if user wants Claude integration

#### Decision
**Include Claude Code files in repository, install automatically, with opt-out flag.**

Implementation:
- `.claude/` directory included in repository
- Default behavior: Install Claude commands and agents
- Opt-out flag: `./install.sh --no-claude` skips Claude integration
- Non-Claude users can ignore `.claude/` directory

#### Rationale
- **Default value:** Claude integration is a differentiator, should be prominent
- **Easy adoption:** Users who have Claude Code get full experience automatically
- **No harm:** Users without Claude Code simply have unused `.claude/` directory
- **Opt-out principle:** Users who don't want it can opt out
- **Discoverability:** More users will discover and try Claude Code

#### Consequences

**Positive:**
- Claude users get enhanced experience automatically
- Showcases AI-assisted documentation workflows
- No extra steps for Claude users
- `.claude/` directory is small, doesn't hurt non-users

**Negative:**
- Non-Claude users have unused directory (minor concern)
- Might confuse users who don't know what Claude Code is

**Risks:**
- Claude Code API changes (mitigate with versioning)
- Users without Claude might feel excluded (mitigate with good docs)

#### Implementation Notes
- Document Claude Code integration prominently in README
- Include "What is Claude Code?" section
- Link to Claude Code download
- Show examples of AI-assisted workflows
- Make clear that templates work perfectly without Claude Code

**Directory structure:**
```
.claude/
├── commands/
│   ├── doc-new.md
│   ├── doc-review.md
│   └── doc-update.md
└── agents/
    ├── doc-writer.md
    ├── doc-reviewer.md
    ├── doc-updater.md
    └── doc-validator.md
```

#### Related Decisions
- Decision 006: Installation Approach

---

### Decision 009: Community Infrastructure

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to decide where community discussion and support happen:
- Users will have questions
- Want to encourage community help
- Need structured place for discussions
- Must be low-maintenance

#### Options Considered
1. **GitHub Issues only** - Simple, everything in one place
2. **GitHub Issues + Discussions** - Issues for bugs, Discussions for Q&A
3. **Discord server** - Real-time chat, requires moderation
4. **Slack workspace** - Similar to Discord, less popular for OSS
5. **Discourse forum** - Full-featured, requires separate hosting
6. **Stack Overflow tag** - For Q&A, less control

#### Decision
Use **GitHub Issues for bugs/features** and **GitHub Discussions for Q&A and general discussion**.

#### Rationale
- **Integrated:** Everything in one place (GitHub)
- **Searchable:** Both Issues and Discussions are searchable
- **No external accounts:** Users already on GitHub
- **Structured:** Issues for actionable items, Discussions for conversation
- **Free:** No hosting or subscription costs
- **Moderation tools:** GitHub provides moderation features
- **Familiar:** Most developers comfortable with GitHub

**Issue categories:**
- Bug reports (template provided)
- Feature requests (template provided)
- Documentation improvements

**Discussion categories:**
- Q&A (for questions)
- Ideas (for feature brainstorming)
- Show and tell (users sharing their usage)
- General (uncategorized)

#### Consequences

**Positive:**
- Low-maintenance (no separate platform to moderate)
- Searchable and indexed by Google
- Clear separation between bugs and discussions
- Community can help answer questions
- Everything version-controlled

**Negative:**
- No real-time chat (acceptable trade-off)
- GitHub Discussions less familiar than forums
- No notifications as immediate as Discord

**Risks:**
- Low engagement initially (mitigate with active participation)

#### Implementation Notes
1. Enable GitHub Discussions in repository settings
2. Create discussion categories
3. Pin welcome discussion
4. Set up discussion templates (if desired)
5. Link to Discussions from README
6. Respond promptly to build engagement

**Response time goals:**
- Issues: Within 48 hours
- Discussions: Within 72 hours
- PRs: Review within 1 week

#### Related Decisions
- None

---

### Decision 010: Analytics and Metrics

**Date:** 2025-10-11
**Status:** Accepted
**Decision Maker:** Project owner

#### Context
Need to decide how (and if) to measure adoption and usage:
- Want to understand project impact
- Privacy is important
- Don't want to track users invasively
- GitHub provides some metrics
- Installation telemetry could be helpful but controversial

#### Options Considered
1. **No analytics** - Privacy-first, no tracking at all
2. **GitHub metrics only** - Stars, forks, clones, traffic
3. **Optional telemetry** - Opt-in usage reporting in installer
4. **Google Analytics** - On documentation site (if we had one)
5. **Plausible or similar** - Privacy-respecting analytics

#### Decision
Use **GitHub metrics only** - no custom tracking or analytics.

#### Rationale
- **Privacy-first:** No tracking of individual users
- **Sufficient:** GitHub metrics show stars, forks, clones, traffic
- **No dependencies:** No analytics service required
- **No maintenance:** GitHub handles data collection
- **Trust:** Users trust us to not track them
- **Simplicity:** Less complexity in installer

**Metrics available via GitHub:**
- Stars (interest level)
- Forks (adoption level)
- Clones (usage level)
- Traffic (visitors, views)
- Issues/PRs (engagement level)
- Contributors (community health)

#### Consequences

**Positive:**
- Zero privacy concerns
- No analytics code to maintain
- Fast installation (no phone-home)
- User trust
- Works completely offline

**Negative:**
- Can't measure actual installation success rate
- Don't know which templates are most popular
- Can't track feature usage
- Limited understanding of user behavior

**Acceptable trade-offs:**
- User feedback via issues/discussions will inform priorities
- Community engagement indicates health
- Stars/forks are sufficient for gauging interest

**Risks:**
- Can't optimize based on usage data (acceptable, use feedback instead)

#### Implementation Notes
- Monitor GitHub Insights regularly (weekly)
- Track metrics in spreadsheet or dashboard (optional)
- Share milestones publicly (100 stars, etc.)
- Rely on community feedback for feature prioritization

**No telemetry in installer:**
- No phone-home
- No usage reporting
- No error reporting (users report via issues)

**Future consideration:** If we add a documentation website (GitHub Pages), could add privacy-respecting analytics like Plausible, but only for website visits, not installer usage.

#### Related Decisions
- Decision 004: Documentation Hosting (no website = no website analytics)

---

## Summary of Current Decisions

| # | Decision | Status | Impact |
|---|----------|--------|--------|
| 001 | Repository Name: `project-docs-template` | ✅ Accepted | Repository created |
| 002 | License: MIT | ✅ Accepted | Maximum adoption |
| 003 | Versioning: Semantic Versioning (SemVer) | ✅ Accepted | Clear version semantics |
| 004 | Hosting: docs/ directory | ✅ Accepted | Simple markdown docs |
| 005 | CI/CD: GitHub Actions | ✅ Accepted | Automated testing |
| 006 | Installation: Shell script + Template | ✅ Accepted | Flexible installation |
| 007 | Configuration: Command-line flags | 🟡 Proposed | TBD in Phase 2 |
| 008 | Claude Code: Included by default | ✅ Accepted | AI integration built-in |
| 009 | Community: Issues + Discussions | ✅ Accepted | GitHub-native community |
| 010 | Analytics: GitHub metrics only | ✅ Accepted | Privacy-first approach |

---

## Using This Log

### When to Add a Decision
- Before implementing significant features
- When choosing between multiple approaches
- When decisions affect future work
- When decisions impact users

### When to Update a Decision
- Status changes (proposed → accepted)
- New information becomes available
- Decision is superseded by another
- Decision is deprecated

### Referencing Decisions
In commits, PRs, and docs, reference decisions:
- "Implements Decision 006 (shell script installer)"
- "Per Decision 010, no analytics added"
- "See Decision 007 for configuration approach"

---

## Template for Future Decisions

Copy this template when adding new decisions:

```markdown
### Decision XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated
**Decision Maker:** Name

#### Context
[What necessitates this decision?]

#### Options Considered
1. **Option A** - Description
2. **Option B** - Description
3. **Option C** - Description

#### Decision
[What was decided?]

#### Rationale
[Why this option?]
- Reason 1
- Reason 2
- Reason 3

#### Consequences
**Positive:**
- Benefit 1

**Negative:**
- Trade-off 1

**Risks:**
- Risk 1 (mitigation)

#### Implementation Notes
[How to implement this decision]

#### Related Decisions
- Decision XXX
```

---

**Keep this log updated throughout the project lifecycle!**
