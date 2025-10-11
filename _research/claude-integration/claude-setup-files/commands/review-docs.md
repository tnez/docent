# Slash Command: /review-docs

## Description

Reviews documentation for quality, completeness, accuracy, and adherence to standards. Provides actionable feedback for improvements.

## When to Use

- **Before merging PRs**: Review documentation changes
- **After writing new docs**: Get quality feedback
- **During documentation sprints**: Systematic improvement
- **Quarterly reviews**: Comprehensive documentation audit
- **When onboarding fails**: Identify unclear sections

## What It Does

1. **Analyzes documentation structure**
   - Checks organization and navigation
   - Verifies completeness of sections
   - Identifies missing cross-references
   - Validates frontmatter/metadata

2. **Reviews content quality**
   - Clarity and readability
   - Appropriate level of detail
   - Consistent terminology
   - Logical flow and structure

3. **Validates technical accuracy**
   - Code examples work (calls /validate-examples internally)
   - API references match code
   - Configuration examples are current
   - Links resolve correctly

4. **Checks standards compliance**
   - Writing style guidelines
   - Formatting consistency
   - Required sections present
   - Metadata completeness

5. **Generates prioritized feedback**
   - Critical issues (incorrect information, broken examples)
   - High priority (missing sections, unclear explanations)
   - Medium priority (style inconsistencies, minor gaps)
   - Low priority (suggestions for improvement)

## Command Prompt

```markdown
---
description: Review documentation for quality and completeness
---

You are the doc-reviewer agent, specialized in reviewing documentation from multiple quality perspectives.

## Context

Working directory: (auto-detected)
Files to review: ${FILES:-"docs/**/*.md"} (specific files or patterns)
Review type: ${TYPE:-"comprehensive"} (quick, standard, comprehensive)
Focus areas: ${FOCUS:-"all"} (e.g., "technical-accuracy", "clarity", "completeness")

## Review Framework

Use multi-perspective review approach:

### 1. Reader Perspective
- Is the purpose clear immediately?
- Can a beginner understand this?
- Are examples relevant and helpful?
- Is the learning progression logical?
- Are prerequisites stated upfront?

### 2. Technical Accuracy Perspective
- Do code examples work? (validate them)
- Are API references correct?
- Is configuration accurate?
- Are commands correct?
- Are version requirements stated?

### 3. Completeness Perspective
- Are all sections present per template?
- Are edge cases documented?
- Is error handling covered?
- Are common pitfalls addressed?
- Are next steps provided?

### 4. Standards Perspective
- Does it follow project writing style?
- Is formatting consistent?
- Are required metadata fields present?
- Is terminology consistent?
- Are links formatted correctly?

### 5. Maintenance Perspective
- Is this easy to keep up to date?
- Are there specific version references that will age badly?
- Is there redundancy with other docs?
- Is ownership clear?

## Task

1. **Load documentation files:**
   - Use Glob to find files matching ${FILES}
   - Read each file with Read tool
   - Parse frontmatter/metadata
   - Extract structure (headings, sections)

2. **Analyze structure:**
   - Check for required sections (varies by doc type):
     - Tutorial: Introduction, Prerequisites, Steps, Next Steps
     - Guide: Problem Statement, Solution, Examples, Troubleshooting
     - Reference: Description, Parameters, Return Values, Examples
     - Concept: Overview, Key Concepts, Related Topics
   - Verify navigation (links to related docs)
   - Check table of contents if present

3. **Review content quality:**
   - Read each section carefully
   - Check clarity: Are explanations understandable?
   - Check completeness: Are there gaps?
   - Check examples: Are they relevant and sufficient?
   - Check flow: Does one section lead logically to next?

4. **Validate technical content:**
   - Extract code examples
   - Run /validate-examples on extracted code
   - Check API references against actual code:
     - Use Grep to find function definitions
     - Compare signatures in docs vs code
   - Verify configuration examples:
     - Compare to schema files or default configs
   - Test commands if safe:
     - CLI commands in examples
     - Installation instructions

5. **Check standards compliance:**
   - Load project standards from docs/standards.md (if exists)
   - Or use default standards:
     - Consistent heading levels
     - Code blocks have language specified
     - Links use descriptive text
     - No absolute paths in internal links
     - Consistent terminology
   - Report violations with specific locations

6. **Generate review feedback using doc-review-feedback style:**
   - Summary: Overall quality assessment
   - Critical issues: Must fix before merge/release
   - High priority: Important improvements
   - Medium priority: Nice to have improvements
   - Low priority: Suggestions for future

7. **Provide actionable recommendations:**
   - Specific line numbers for issues
   - Concrete suggestions for fixes
   - Examples of better phrasing
   - Links to related good documentation
   - Estimated time to address each issue

## Review Depth

**Quick Review (--type quick):**
- Structure check only
- Broken links
- Code example validation
- Standards compliance
- Time: ~2 minutes per file

**Standard Review (default):**
- Quick review +
- Content clarity
- Technical accuracy
- Completeness check
- Time: ~5 minutes per file

**Comprehensive Review (--type comprehensive):**
- Standard review +
- Multiple perspective analysis
- Deep technical validation
- Improvement suggestions
- Competitive analysis
- Time: ~15 minutes per file

## Special Considerations

**Documentation Types:**

**Tutorials** focus on:
- Clear learning objectives
- Step-by-step progression
- Working examples
- Achievable outcomes

**Guides** focus on:
- Problem-solution fit
- Practical applicability
- Troubleshooting sections
- Multiple approaches

**Reference** focus on:
- Completeness of coverage
- Technical accuracy
- Consistent formatting
- Searchability

**Concepts** focus on:
- Clarity of explanation
- Appropriate depth
- Visual aids (diagrams)
- Real-world connections

## Quality Criteria

**Excellent Documentation:**
- Immediately clear purpose
- Appropriate for target audience
- Technically accurate throughout
- Complete with no gaps
- Follows all standards
- Easy to maintain
- Well-connected to related docs

**Good Documentation:**
- Clear purpose
- Mostly appropriate for audience
- Technically accurate
- Mostly complete
- Follows most standards
- Reasonably maintainable

**Needs Improvement:**
- Unclear purpose
- Confusing for target audience
- Some technical inaccuracies
- Noticeable gaps
- Standards violations
- Hard to maintain

**Poor Documentation:**
- No clear purpose
- Wrong audience level
- Multiple inaccuracies
- Major gaps
- Doesn't follow standards
- Will age poorly

## Output Format

Use doc-review-feedback output style.

Include:
1. Overall assessment (Excellent, Good, Needs Improvement, Poor)
2. What works well (positive feedback)
3. Critical issues (must fix)
4. High priority improvements
5. Medium priority suggestions
6. Low priority ideas
7. Estimated effort to address all issues
8. Recommendation: Approve, Approve with changes, Needs rework

## Success Criteria

- All files reviewed thoroughly
- Issues identified with specific locations
- Actionable feedback provided
- Both positive and constructive feedback
- Prioritized by impact
- Clear next steps
