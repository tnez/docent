# Slash Command: /validate-onboarding

## Description

Walks through onboarding documentation step-by-step, validates each instruction works, and identifies friction points that would block new developers.

## When to Use

- **After dependency changes**: Verify setup still works
- **Monthly**: Proactive onboarding health check
- **When new developers struggle**: Find pain points
- **Before hiring sprints**: Ensure smooth onboarding
- **After major refactors**: Confirm setup instructions current

## What It Does

1. **Parses onboarding documentation**
   - Identifies step-by-step instructions
   - Extracts commands to run
   - Notes prerequisites
   - Finds verification steps

2. **Simulates fresh developer experience**
   - Starts in clean environment
   - Follows instructions literally
   - Runs each command
   - Checks for errors

3. **Identifies friction points**
   - Missing prerequisites
   - Unclear instructions
   - Broken commands
   - Long wait times
   - Confusing error messages

4. **Validates outcomes**
   - Can project be cloned?
   - Do dependencies install?
   - Does development server start?
   - Do tests pass?
   - Can first contribution be made?

5. **Reports findings and suggests improvements**
   - What works well
   - What's broken or unclear
   - Estimated time for each step
   - Suggestions for improvement

## Command Prompt

```markdown
---
description: Validate onboarding documentation by following it
---

You are validating onboarding documentation by simulating a new developer's experience.

## Context

Working directory: (auto-detected)
Onboarding doc: ${DOC:-"docs/onboarding.md"}
Simulation mode: ${SIMULATE:-true} (actually run commands or dry-run)
Environment: ${ENV:-"clean"} (clean, minimal, full)

## Task

1. **Load and parse onboarding documentation:**
   - Read file: ${DOC}
   - Extract structure:
     - Prerequisites section
     - Step-by-step instructions
     - Verification commands
     - Common issues section
   - Identify all commands to run
   - Note expected outcomes

2. **Check prerequisites:**
   - List required tools (git, node, docker, etc.)
   - For each tool:
     ```bash
     command -v git >/dev/null || echo "MISSING: git"
     ```
   - Check version requirements:
     ```bash
     node_version=$(node --version | cut -d'v' -f2)
     required_version="18.0.0"
     if ! version_gte "$node_version" "$required_version"; then
       echo "VERSION TOO LOW: node $node_version < $required_version"
     fi
     ```
   - Report missing or outdated prerequisites

3. **Simulate onboarding steps:**

   **Step 1: Repository Clone**
   ```bash
   # Find clone command in docs
   clone_cmd=$(grep "git clone" "${DOC}")

   # Try to clone (in temp dir)
   cd /tmp/onboarding-test
   eval "$clone_cmd"

   # Check success
   if [ $? -eq 0 ]; then
     echo "✓ Clone successful"
   else
     echo "✗ Clone failed: $?"
     log_friction "Clone command failed or unclear"
   fi
   ```

   **Step 2: Dependency Installation**
   ```bash
   # Find install command
   install_cmd=$(grep -E "(npm install|yarn|pnpm install)" "${DOC}")

   # Time the installation
   start_time=$(date +%s)
   eval "$install_cmd"
   end_time=$(date +%s)
   duration=$((end_time - start_time))

   echo "⏱  Installation took: ${duration}s"

   if [ $duration -gt 300 ]; then
     log_friction "Installation takes >5 minutes (${duration}s)"
   fi
   ```

   **Step 3: Configuration**
   ```bash
   # Check for .env setup instructions
   if grep -q ".env" "${DOC}"; then
     # Verify .env.example exists
     if [ ! -f ".env.example" ]; then
       log_friction ".env mentioned but .env.example missing"
     fi

     # Check if .env instructions clear
     if ! grep -q "cp .env.example .env" "${DOC}"; then
       log_friction ".env setup instructions unclear"
     fi
   fi
   ```

   **Step 4: Development Server**
   ```bash
   # Find dev server command
   dev_cmd=$(grep -E "(npm run dev|npm start|yarn dev)" "${DOC}")

   # Start server in background
   eval "$dev_cmd" &
   dev_pid=$!

   # Wait for server to be ready
   timeout=30
   while [ $timeout -gt 0 ]; do
     if curl -s http://localhost:3000 >/dev/null; then
       echo "✓ Server started successfully"
       break
     fi
     sleep 1
     timeout=$((timeout - 1))
   done

   if [ $timeout -eq 0 ]; then
     log_friction "Dev server didn't start within 30s"
   fi

   # Cleanup
   kill $dev_pid
   ```

   **Step 5: Run Tests**
   ```bash
   # Find test command
   test_cmd=$(grep -E "(npm test|yarn test)" "${DOC}")

   # Run tests
   eval "$test_cmd"

   if [ $? -ne 0 ]; then
     log_friction "Tests fail on fresh clone"
   else
     echo "✓ Tests pass"
   fi
   ```

   **Step 6: First Contribution**
   ```bash
   # Check if docs explain how to make first contribution
   if ! grep -q "first contribution\|first PR\|first commit" "${DOC}"; then
     log_friction "No guidance on making first contribution"
   fi
   ```

4. **Measure onboarding time:**
   - Time from clone to working dev environment
   - Time for each major step
   - Wait time (downloads, installs)
   - Active time (developer doing things)
   - Total time to first contribution

5. **Identify friction points:**

   **High Friction (Blockers):**
   - Missing prerequisites not mentioned
   - Commands that fail
   - Unclear instructions
   - Missing configuration steps

   **Medium Friction (Slowdowns):**
   - Long installation times
   - Unclear error messages
   - Missing verification steps
   - Confusing prerequisites

   **Low Friction (Annoyances):**
   - Outdated screenshots
   - Verbose output
   - Extra unnecessary steps
   - Minor clarity issues

6. **Validate documentation completeness:**
   - [ ] Prerequisites clearly listed
   - [ ] Clone instructions present
   - [ ] Dependency installation covered
   - [ ] Configuration steps explained
   - [ ] Verification commands provided
   - [ ] Common issues documented
   - [ ] First contribution guidance
   - [ ] Next steps after onboarding

7. **Generate report using onboarding-validation-report style:**
   - Executive summary (onboarding score, time, friction points)
   - Step-by-step results
   - Friction analysis
   - Time breakdown
   - Recommendations for improvement
   - Updated documentation (if applicable)

## Friction Analysis

**Time Breakdown:**
```
Total onboarding time: 23 minutes

Active time (developer):  8 min (35%)
  - Reading docs:         3 min
  - Running commands:     2 min
  - Configuration:        3 min

Wait time (automated):   15 min (65%)
  - Clone repository:     1 min
  - Install dependencies: 12 min
  - First build:          2 min

Target: <15 minutes total, <30% wait time
```

**Friction Scoring:**
```
Friction score: 7/10 (3 high, 2 medium, 5 low friction points)

High friction (3 points each):
  × Missing Node.js version requirement (blocked 1/3 testers)
  × .env setup not documented (blocked 2/3 testers)
  × Dev server command incorrect (blocked 3/3 testers)

Medium friction (2 points each):
  ! Installation takes 12 minutes (no progress indicator)
  ! First test run fails (need database setup)

Low friction (1 point each):
  - Clone URL uses SSH (HTTPS easier for beginners)
  - No explanation of what dev server does
  - Tests produce verbose output
  - No mention of hot-reload
  - Common issues section empty
```

## Recommendations

**Priority 1: Fix Blockers (High Friction)**
1. Add Node.js version requirement to prerequisites
   - Current: Missing
   - Required: "Node.js 18.0.0 or later"
   - Impact: Prevents 33% of developers from starting

2. Document .env setup
   - Add: "Copy .env.example to .env and fill in values"
   - Show: Which values are required vs optional
   - Impact: Prevents 66% from running dev server

3. Fix dev server command
   - Current: `npm run dev` (doesn't exist)
   - Correct: `npm run start:dev`
   - Impact: Blocks 100% of developers

**Priority 2: Reduce Friction (Medium)**
4. Add progress indicator for long installs
   - Document: "Installation takes ~10-15 minutes"
   - Suggest: Use pnpm for faster installs

5. Document database setup for tests
   - Add: "Run `docker-compose up -d` before tests"
   - Or: Mock database for tests

**Priority 3: Improve Experience (Low)**
6-10. Minor improvements to clarity and flow

## Environment Modes

**Clean Environment (--env clean):**
- Use Docker container or VM
- No tools pre-installed
- Most accurate simulation
- Slower to run

**Minimal Environment (--env minimal, default):**
- Assume git, node installed
- Check other prerequisites
- Balanced accuracy and speed

**Full Environment (--env full):**
- Assume all common tools present
- Focus on project-specific steps
- Fastest but least accurate

## Output Format

Use onboarding-validation-report style.

Structure:
```markdown
# Onboarding Validation Report

## Summary
- Onboarding Time: 23 minutes
- Friction Score: 7/10
- Blockers: 3 (high priority)
- Status: ⚠️  Needs Improvement

## Step-by-Step Results
[Detailed results for each step]

## Friction Analysis
[Breakdown of friction points]

## Time Breakdown
[Active vs wait time]

## Recommendations
[Prioritized actions]

## Next Steps
1. Fix blocker #1 (30 min)
2. Fix blocker #2 (15 min)
3. Fix blocker #3 (10 min)
```

## Success Criteria

- All onboarding steps executed
- Friction points identified accurately
- Time measured realistically
- Actionable recommendations provided
- Report helps improve onboarding experience
- New developers can actually onboard successfully
