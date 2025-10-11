# Output Styles for Documentation Work

## Overview

Output styles provide consistent, scannable formatting for documentation-focused Claude Code operations. They ensure results are:
- **Actionable**: Clear next steps
- **Scannable**: Quick to understand
- **Professional**: Suitable for team sharing
- **Machine-readable**: Can be parsed by scripts (when needed)

## Style 1: doc-drift-report

### Purpose
Format drift detection results showing what documentation is outdated and why.

### When to Use
- /check-doc-drift command output
- Automated drift detection reports
- PR comments about documentation status

### Format Specification

```markdown
# Documentation Drift Report
Generated: [ISO 8601 timestamp]
Scope: [all | specific area]
Time range: [since date/commit]

## Executive Summary

**Overall Status:** [🔴 Critical | 🟠 High Priority | 🟡 Medium | 🟢 Low/None]
**Affected Files:** [count]
**Total Issues:** [count] ([critical], [high], [medium], [low])
**Estimated Fix Time:** [hours]

## Critical Drift (Immediate Action Required)

### [File path]
**Issue:** [Brief description]
**Location:** Line [number(s)]
**Why:** [What changed in code]
**Impact:** [User-facing consequence]
**Fix:** [Specific action to take]
**Effort:** [time estimate]

## High Priority Drift

[Same format as Critical]

## Medium Priority Drift

[Same format]

## Low Priority Drift

[Same format]

## Suggested Actions

1. **[Priority 1 action]** (Effort: [time])
   ```bash
   /update-doc [file]
   ```

2. **[Priority 2 action]** (Effort: [time])
   [Commands to run]

## Trend Analysis

[If historical data available]
- Last check: [date]
- Previous issues: [count]
- Trend: [↑ Increasing | → Stable | ↓ Improving]

## Next Steps

- [ ] Review critical issues
- [ ] Assign fixes to team members
- [ ] Schedule next drift check
- [ ] Update drift detection rules (if needed)
```

### Example

```markdown
# Documentation Drift Report
Generated: 2025-10-11T14:30:00Z
Scope: all
Time range: last 30 days

## Executive Summary

**Overall Status:** 🟠 High Priority
**Affected Files:** 7
**Total Issues:** 12 (2 critical, 5 high, 3 medium, 2 low)
**Estimated Fix Time:** 6.5 hours

## Critical Drift (Immediate Action Required)

### docs/quickstart.md
**Issue:** Installation command no longer exists
**Location:** Line 23
**Why:** CLI renamed from `create-app` to `init-app` in v2.0
**Impact:** Users cannot follow quickstart, get command not found error
**Fix:** Update command to `npx init-app`
**Effort:** 5 minutes

### docs/guides/authentication.md
**Issue:** Code example throws TypeError
**Location:** Lines 45-52
**Why:** API changed from returning null to throwing NotFoundError
**Impact:** Users copy example code that breaks their application
**Fix:** Add try/catch block and update explanation
**Effort:** 30 minutes

## High Priority Drift

### docs/reference/api/users.md
**Issue:** Function signature outdated
**Location:** Line 78
**Why:** Added optional `options` parameter 3 weeks ago
**Impact:** Developers don't know about new functionality
**Fix:** Document new parameter with examples
**Effort:** 1 hour

[... more issues ...]

## Suggested Actions

1. **Fix critical installation command** (Effort: 5 min)
   ```bash
   /update-doc docs/quickstart.md
   ```

2. **Fix critical authentication example** (Effort: 30 min)
   ```bash
   /update-doc docs/guides/authentication.md
   /validate-examples docs/guides/authentication.md
   ```

3. **Update API references for new parameters** (Effort: 2 hours)
   ```bash
   /update-doc docs/reference/api/users.md
   /update-doc docs/reference/api/posts.md
   ```

## Next Steps

- [ ] Fix 2 critical issues (target: today)
- [ ] Address 5 high priority items (target: this week)
- [ ] Schedule fixes for medium/low priority (next sprint)
- [ ] Run /check-doc-drift weekly
```

---

## Style 2: doc-review-feedback

### Purpose
Format documentation review results with quality assessment and improvement suggestions.

### When to Use
- /review-docs command output
- PR reviews for documentation
- Documentation quality audits

### Format Specification

```markdown
# Documentation Review: [filename]
Reviewed: [timestamp]
Reviewer: [agent name]
Review type: [quick | standard | comprehensive]

## Overall Assessment

**Quality Score:** ⭐⭐⭐⭐☆ ([score]/5)
**Status:** [Excellent | Good | Needs Improvement | Poor]
**Recommendation:** [Approve | Approve with Changes | Needs Rework]

## Dimension Scores

- **Clarity:** [score]/5 - [brief comment]
- **Completeness:** [score]/5 - [brief comment]
- **Accuracy:** [score]/5 - [brief comment]
- **Standards:** [score]/5 - [brief comment]
- **Maintainability:** [score]/5 - [brief comment]

## What Works Well

- [Positive aspect 1]
- [Positive aspect 2]
- [Positive aspect 3]

## Issues Found

### 🔴 Critical ([count])

#### Line [number]: [Issue title]

**Current:**
```[lang]
[current content]
```

**Problem:** [What's wrong and why it matters]

**Suggested Fix:**
```[lang]
[proposed content]
```

**Why:** [Rationale for the fix]
**Effort:** [time estimate]

### 🟠 High Priority ([count])

[Same format as Critical]

### 🟡 Medium Priority ([count])

[Same format]

### ⚪ Low Priority ([count])

[Same format - suggestions only]

## Validation Results

- ✅ Code examples: [X/Y passing]
- ✅ Links: [X/Y valid]
- ✅ Standards: [X/Y compliant]

## Estimated Effort

- **Critical + High Priority:** [hours]
- **All Issues:** [hours]
- **Low Priority (optional):** [hours]

## Next Steps

1. [Most important action]
2. [Second most important action]
3. [Third most important action]

## Commands to Address Issues

```bash
[Commands to fix issues]
```
```

### Example

```markdown
# Documentation Review: docs/guides/deployment.md
Reviewed: 2025-10-11T15:00:00Z
Reviewer: doc-reviewer agent
Review type: standard

## Overall Assessment

**Quality Score:** ⭐⭐⭐⭐☆ (4/5)
**Status:** Good
**Recommendation:** Approve with Changes

## Dimension Scores

- **Clarity:** 5/5 - Exceptionally clear explanations
- **Completeness:** 4/5 - Missing troubleshooting section
- **Accuracy:** 5/5 - All examples tested and working
- **Standards:** 3/5 - Several formatting inconsistencies
- **Maintainability:** 4/5 - Will age well with minor updates

## What Works Well

- Excellent step-by-step structure
- Real-world deployment examples
- Clear prerequisites section
- Good use of diagrams

## Issues Found

### 🔴 Critical (0)

None found.

### 🟠 High Priority (2)

#### Line 89: Missing error handling in deployment script

**Current:**
```bash
npm run build
npm run deploy
```

**Problem:** If build fails, deploy still runs and deploys broken code

**Suggested Fix:**
```bash
npm run build || { echo "Build failed"; exit 1; }
npm run deploy
```

**Why:** Prevents deploying broken builds
**Effort:** 2 minutes

#### Lines 120-145: Troubleshooting section missing

**Problem:** No guidance when deployment fails

**Suggested Fix:** Add section covering:
- Common error messages
- How to rollback
- Where to find logs
- Who to contact for help

**Why:** Reduces support burden and unblocks users
**Effort:** 45 minutes

### 🟡 Medium Priority (3)

#### Line 34: Inconsistent code block formatting

**Problem:** Some blocks specify language, others don't
**Fix:** Add language to all code blocks
**Effort:** 5 minutes

[2 more medium issues...]

### ⚪ Low Priority (1)

#### Consider adding video walkthrough

**Suggestion:** A 5-minute deployment video would complement written docs
**Effort:** 2-3 hours (if resources available)

## Validation Results

- ✅ Code examples: 8/8 passing
- ✅ Links: 12/12 valid
- ⚠️  Standards: 15/18 compliant (3 formatting issues)

## Estimated Effort

- **Critical + High Priority:** 1 hour
- **All Issues:** 2 hours
- **Low Priority (optional):** 3 hours

## Next Steps

1. Add error handling to deployment script (2 min)
2. Create troubleshooting section (45 min)
3. Fix code block formatting (5 min)
4. Consider video walkthrough (future enhancement)

## Commands to Address Issues

```bash
# Edit the deployment guide
/update-doc docs/guides/deployment.md

# Revalidate after changes
/review-docs docs/guides/deployment.md
/validate-examples docs/guides/deployment.md
```
```

---

## Style 3: doc-validation-report

### Purpose
Format code example validation results showing which examples work and which are broken.

### When to Use
- /validate-examples command output
- CI/CD test results
- Pre-release validation

### Format Specification

```markdown
# Code Example Validation Report
Generated: [timestamp]
Scope: [files checked]

## Summary

✅ **Passing:** [count] ([percentage]%)
❌ **Failing:** [count] ([percentage]%)
⏭️  **Skipped:** [count] (not runnable)
⏱️  **Duration:** [total time]

## Results by File

### [filename]

#### Example 1 (Line [number]) ✅ PASS
**Language:** [lang]
**Duration:** [seconds]s

#### Example 2 (Line [number]) ❌ FAIL
**Language:** [lang]
**Error:** [error message]
**Duration:** [seconds]s

**Code:**
```[lang]
[the failing code]
```

**Error Output:**
```
[actual error output]
```

**Suggested Fix:**
[Specific guidance on how to fix]

## Failed Examples Detail

### [file]:[line] - [brief description]

**Failure Reason:** [category: import error | syntax error | runtime error | timeout | assertion failed]

**Current Code:**
```[lang]
[code]
```

**Error:**
```
[full error]
```

**Fix Suggestion:**
```[lang]
[corrected code]
```

**Why it failed:** [Explanation]
**How to fix:** [Step-by-step]

## Skipped Examples

- [file]:[line] - [reason for skipping]

## Commands to Fix

```bash
# Fix broken examples automatically
/validate-examples --fix [files]

# Or update manually
/update-doc [file]
```

## Next Steps

- [ ] Review all failing examples
- [ ] Apply suggested fixes
- [ ] Re-run validation
- [ ] Commit fixes
```

---

## Style 4: doc-health-report

### Purpose
Format overall documentation health metrics and trends.

### When to Use
- /check-doc-health command output
- Weekly/monthly health summaries
- Executive reporting

### Format Specification

```markdown
# Documentation Health Report
Generated: [timestamp]
Report type: [quick | standard | comprehensive]

## Overall Health

**Score:** [0-100]/100 (Grade: [A-F])
**Status:** [Excellent | Good | Acceptable | Poor | Critical] [emoji]
**Trend:** [↑ | → | ↓] [change] vs [previous period]

## Scores by Dimension

Coverage:       [████████████████░░░░] [score]/25 ([percentage]%)
Quality:        [█████████████████████] [score]/25 ([percentage]%)
Freshness:      [████████████████░░░░░] [score]/25 ([percentage]%)
Structure:      [███████████████░░░░░░] [score]/25 ([percentage]%)

## Top Issues

### 🔴 Critical ([count])

1. [Issue description]
   - **Impact:** [User/developer impact]
   - **Effort:** [time to fix]
   - **Action:** [What to do]

### 🟠 High Priority ([count])

[Same format]

### 🟡 Medium Priority ([count])

[Summarized list]

## Health Metrics

**Coverage:**
- APIs documented: [X]/[Y] ([percentage]%)
- Features documented: [X]/[Y] ([percentage]%)
- CLI commands documented: [X]/[Y] ([percentage]%)
- Config options documented: [X]/[Y] ([percentage]%)

**Quality:**
- Examples passing: [X]/[Y] ([percentage]%)
- Links valid: [X]/[Y] ([percentage]%)
- Standards compliance: [X]/[Y] ([percentage]%)
- TODO markers: [count]

**Freshness:**
- Updated <30 days: [count] files
- Updated 30-90 days: [count] files
- Updated >90 days: [count] files
- Drift issues: [count]

**Structure:**
- Required files: [X]/[Y] present
- Navigation: [Complete | Partial | Poor]
- Cross-references: [percentage]% complete

## Recommended Actions

**Priority 1:** [Action] (Effort: [time])
- Why: [Rationale]
- Impact: [Expected improvement]

**Priority 2:** [Action] (Effort: [time])
[Same format]

**Total Effort:** ~[hours] hours
**Expected Improvement:** +[points] points → Grade [new grade]

## Historical Trend

[If data available]

Date       | Score | Grade | Change
-----------|-------|-------|--------
2025-10-11 | 85    | B     | +5
2025-10-04 | 80    | B     | +3
2025-09-27 | 77    | C     | -2

## Next Steps

- [ ] Address critical issues ([count])
- [ ] Fix high priority items ([count])
- [ ] Schedule next health check
- [ ] Update documentation roadmap

## Commands

```bash
# Address top issues
[commands to run]

# Re-check health
/check-doc-health
```
```

---

## Using Output Styles in Agents

Agents reference these styles in their prompts:

```markdown
Generate report using doc-drift-report style (defined in output-styles.md).
```

This ensures:
- Consistent formatting across all documentation operations
- Scannable results
- Actionable next steps
- Professional appearance

## Customization

Teams can customize styles by:
1. Copy output-styles.md to project .claude/
2. Modify format specifications
3. Agents automatically use project-specific styles
4. Fall back to defaults if not customized

## Integration with CI/CD

Some styles support machine-readable formats:

```bash
# Get JSON output for parsing
/check-doc-health --format json > health.json

# Use in scripts
health_score=$(jq '.overall.score' health.json)
if [ "$health_score" -lt 80 ]; then
  echo "Documentation health below threshold"
  exit 1
fi
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-11
