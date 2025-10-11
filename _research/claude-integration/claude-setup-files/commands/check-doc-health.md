# Slash Command: /check-doc-health

## Description

Comprehensive health check of documentation system, measuring coverage, quality, freshness, and identifying areas needing attention.

## When to Use

- **Weekly**: Regular health monitoring
- **Before releases**: Ensure docs are release-ready
- **Quarterly reviews**: Strategic documentation assessment
- **After major changes**: Verify documentation impact
- **New team members**: Identify onboarding friction

## What It Does

1. **Measures documentation coverage**
   - What percentage of code is documented
   - Which features lack documentation
   - API documentation completeness
   - Missing guides or tutorials

2. **Assesses documentation quality**
   - Completeness of existing docs
   - Technical accuracy
   - Code example validity
   - Standards compliance

3. **Checks documentation freshness**
   - When docs were last updated
   - Drift from current code
   - TODO markers unresolved
   - Outdated version references

4. **Validates documentation structure**
   - Required files present
   - Navigation works
   - Cross-references valid
   - Organization logical

5. **Generates health score and report**
   - Overall health score (0-100)
   - Scores by category
   - Trend over time
   - Prioritized action items

## Command Prompt

```markdown
---
description: Comprehensive documentation health check
---

You are assessing the overall health of project documentation across multiple dimensions.

## Context

Working directory: (auto-detected)
Documentation: docs/
Report type: ${TYPE:-"standard"} (quick, standard, comprehensive)
Save history: ${HISTORY:-true} (track health over time)

## Health Dimensions

### 1. Coverage (25 points)
Measures what percentage of codebase has documentation.

**Checks:**
- Public APIs documented (use Grep to find exported functions)
- Features documented (compare features to docs/features/ or docs/guides/)
- Configuration options documented
- CLI commands documented
- Common use cases covered

**Scoring:**
- 25 points: >90% coverage
- 20 points: 80-90% coverage
- 15 points: 70-80% coverage
- 10 points: 60-70% coverage
- 5 points: <60% coverage

### 2. Quality (25 points)
Measures the quality of existing documentation.

**Checks:**
- Code examples work (/validate-examples)
- Links valid (/fix-links --check-only)
- Writing standards followed
- Complete sections (no TODOs)
- Appropriate depth for audience

**Scoring:**
- 25 points: Excellent quality, no issues
- 20 points: Good quality, minor issues
- 15 points: Acceptable, some issues
- 10 points: Poor quality, many issues
- 5 points: Very poor quality

### 3. Freshness (25 points)
Measures how current documentation is.

**Checks:**
- Last update dates (from frontmatter)
- Drift detection (/check-doc-drift)
- TODO markers count
- Version-specific references
- Recent changes documented

**Scoring:**
- 25 points: All docs current (<30 days)
- 20 points: Mostly current (<60 days)
- 15 points: Somewhat current (<90 days)
- 10 points: Outdated (>90 days)
- 5 points: Very outdated (>180 days)

### 4. Structure (25 points)
Measures documentation organization and accessibility.

**Checks:**
- Required files present (README, quickstart, etc.)
- Navigation clear
- Diataxis structure followed (tutorials, guides, reference, concepts)
- Cross-references complete
- Search/discoverability

**Scoring:**
- 25 points: Excellent structure
- 20 points: Good structure
- 15 points: Acceptable structure
- 10 points: Poor structure
- 5 points: Very poor structure

## Task

1. **Collect metrics:**

   **Coverage Metrics:**
   ```bash
   # Count public APIs
   api_count=$(grep -r "export (function|class|const)" src/ | wc -l)

   # Count documented APIs
   api_docs=$(find docs/reference/api/ -name "*.md" | wc -l)

   # Calculate coverage
   api_coverage=$((api_docs * 100 / api_count))
   ```

   ```bash
   # Find features (from code or product docs)
   features=$(grep -r "@feature" src/ | cut -d: -f2 | sort -u)

   # Check if each feature is documented
   for feature in $features; do
     if grep -r "$feature" docs/ >/dev/null; then
       documented=$((documented + 1))
     fi
     total=$((total + 1))
   done

   feature_coverage=$((documented * 100 / total))
   ```

   **Quality Metrics:**
   ```bash
   # Run validation
   /validate-examples --silent > /tmp/validation-results.txt
   example_pass_rate=$(grep "passed" /tmp/validation-results.txt | extract_percentage)

   # Check links
   /fix-links --check-only > /tmp/link-results.txt
   link_health=$(grep "valid" /tmp/link-results.txt | extract_percentage)

   # Count TODOs
   todo_count=$(grep -r "TODO:" docs/ | wc -l)

   # Standards compliance
   /check-standards --silent > /tmp/standards-results.txt
   standards_score=$(extract_score /tmp/standards-results.txt)
   ```

   **Freshness Metrics:**
   ```bash
   # Parse last_updated from frontmatter
   find docs/ -name "*.md" -exec \
     grep "^last_updated:" {} \; | \
     calculate_average_age

   # Run drift detection
   /check-doc-drift --silent > /tmp/drift-results.txt
   drift_count=$(grep -c "DRIFT" /tmp/drift-results.txt)

   # Count outdated version references
   current_version=$(get_project_version)
   outdated_refs=$(grep -r "version [0-9]" docs/ | \
     grep -v "$current_version" | wc -l)
   ```

   **Structure Metrics:**
   ```bash
   # Check required files
   required_files=(
     "docs/README.md"
     "docs/quickstart.md"
     "docs/writing-software.md"
     "docs/tutorials/README.md"
     "docs/guides/README.md"
     "docs/reference/README.md"
   )

   present=0
   for file in "${required_files[@]}"; do
     [ -f "$file" ] && present=$((present + 1))
   done

   structure_completeness=$((present * 100 / ${#required_files[@]}))
   ```

2. **Calculate scores:**
   - Score each dimension (0-25 points)
   - Calculate overall score (sum of dimensions, 0-100)
   - Determine grade: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)

3. **Identify issues:**
   - List all problems found
   - Categorize by severity:
     - Critical: Broken examples, major gaps
     - High: Outdated docs, missing sections
     - Medium: Minor quality issues, old TODOs
     - Low: Cosmetic improvements
   - Prioritize by impact

4. **Generate trend data:**
   - Load previous health checks from `.docs-health-history.json`
   - Compare current score to historical
   - Identify improving/declining areas
   - Calculate velocity (score change per week)

5. **Create actionable recommendations:**
   - Top 5 actions to improve health
   - Estimated time for each
   - Expected score improvement
   - Assign priorities

6. **Generate report using doc-health-report style:**
   - Executive summary
   - Overall score and grade
   - Scores by dimension
   - Trend graph (if historical data)
   - Top issues
   - Recommended actions
   - Detailed findings

## Report Types

**Quick Check (--type quick):**
- Essential metrics only
- No deep analysis
- Time: ~1 minute
- Use for: Daily checks

**Standard Check (default):**
- All dimensions
- Basic analysis
- Time: ~5 minutes
- Use for: Weekly checks

**Comprehensive Check (--type comprehensive):**
- All dimensions with deep analysis
- Historical trends
- Competitive benchmarking
- Detailed recommendations
- Time: ~15 minutes
- Use for: Quarterly reviews

## Health Score Interpretation

**90-100 (Grade A): Excellent Health**
- Comprehensive coverage
- High quality throughout
- Current and fresh
- Well organized
- Action: Maintain current practices

**80-89 (Grade B): Good Health**
- Strong coverage
- Generally high quality
- Mostly current
- Good organization
- Action: Address minor issues

**70-79 (Grade C): Acceptable Health**
- Adequate coverage
- Acceptable quality
- Somewhat current
- Basic organization
- Action: Systematic improvement needed

**60-69 (Grade D): Poor Health**
- Gaps in coverage
- Quality issues
- Outdated content
- Organizational problems
- Action: Urgent attention required

**<60 (Grade F): Critical Health**
- Major coverage gaps
- Serious quality problems
- Very outdated
- Poor organization
- Action: Documentation overhaul needed

## Historical Tracking

Save health check results to `.docs-health-history.json`:

```json
{
  "checks": [
    {
      "date": "2025-10-11",
      "score": 85,
      "grade": "B",
      "dimensions": {
        "coverage": 22,
        "quality": 24,
        "freshness": 20,
        "structure": 19
      },
      "issues_count": {
        "critical": 0,
        "high": 3,
        "medium": 8,
        "low": 12
      }
    },
    // Previous checks...
  ],
  "metadata": {
    "project": "my-project",
    "first_check": "2025-01-01",
    "total_checks": 24
  }
}
```

Use for:
- Trend analysis
- Measuring improvement
- Identifying regression
- Demonstrating value

## Output Format

Use doc-health-report style.

Example:
```markdown
# Documentation Health Report
Generated: 2025-10-11 14:30 UTC

## Overall Health

Score: 85/100 (Grade: B)
Status: Good Health 🟢
Trend: ↑ +5 points (vs last week)

## Scores by Dimension

Coverage:    ████████████████░░░░  22/25 (88%)
Quality:     █████████████████████  24/25 (96%)
Freshness:   ████████████████░░░░░  20/25 (80%)
Structure:   ███████████████░░░░░░  19/25 (76%)

## Top Issues

🔴 Critical (0)
None

🟠 High Priority (3)
1. Feature "batch-operations" undocumented
   Impact: Users can't discover this feature
   Effort: 2 hours
   Action: Create docs/guides/batch-operations.md

2. 5 docs outdated (>90 days since update)
   Impact: Users may follow outdated instructions
   Effort: 3 hours
   Action: Run /update-doc on each

3. Missing API reference for 8 new functions
   Impact: Developers lack API documentation
   Effort: 4 hours
   Action: Generate from JSDoc

🟡 Medium Priority (8)
[...]

## Recommended Actions

Priority 1: Document batch-operations feature (2h)
Priority 2: Update outdated guides (3h)
Priority 3: Generate missing API references (4h)
Priority 4: Resolve 12 TODO markers (2h)
Priority 5: Add 3 missing tutorials (6h)

Total effort: ~17 hours
Expected improvement: +10 points → Grade A

## Detailed Findings

[...full details...]
```

## Success Criteria

- Accurate metrics collected
- Fair scoring applied
- Useful recommendations provided
- Historical trends tracked
- Report is actionable
- No false positives/negatives
