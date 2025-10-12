# Troubleshooting: [Problem Name]

**Problem Category:** [e.g., Performance, Connectivity, Authentication, Data]
**Severity:** [Low | Medium | High | Critical]
**Last Updated:** YYYY-MM-DD
**Owner:** [Team or person responsible]

## Problem Summary

<!-- One-paragraph description of the issue -->

Brief description of the problem and its symptoms.

## Symptoms

<!-- What does the user/operator see when this problem occurs? -->

When this problem occurs, you may observe:
- Symptom 1 (e.g., Error message: "Connection timeout")
- Symptom 2 (e.g., Page load time > 30 seconds)
- Symptom 3 (e.g., Users unable to login)
- Symptom 4 (e.g., High CPU usage on server)

## Quick Checks

<!-- Fast checks to confirm/rule out this issue -->

Before diving deep, perform these quick checks:

1. **Check 1:** [Description]
   ```bash
   # Command to check
   check-command
   ```
   - ✅ If output shows X: Problem confirmed, proceed to Diagnosis
   - ❌ If output shows Y: Not this issue, see [Related Issues](#related-issues)

2. **Check 2:** [Description]
   ```bash
   # Command to check
   check-command
   ```
   - ✅ If output shows X: Problem confirmed
   - ❌ If output shows Y: Not this issue

## Diagnosis

<!-- Step-by-step process to identify the root cause -->

### Step 1: Check [Component/Area]

**What to check:**
```bash
# Diagnostic command
diagnostic-command

# Example output:
# [Expected output when problem exists]
```

**Interpretation:**
- If you see X: This indicates [root cause 1], proceed to [Solution 1](#solution-1)
- If you see Y: This indicates [root cause 2], proceed to [Solution 2](#solution-2)
- If you see Z: This indicates [root cause 3], proceed to [Solution 3](#solution-3)

---

### Step 2: Check [Component/Area]

**What to check:**
```bash
# Diagnostic command
diagnostic-command
```

**Interpretation:**
- If you see X: [Interpretation]
- If you see Y: [Interpretation]

---

### Step 3: Check [Component/Area]

**What to check:**
```bash
# Diagnostic command
diagnostic-command
```

**Interpretation:**
- If you see X: [Interpretation]
- If you see Y: [Interpretation]

## Solutions

### Solution 1: [Root Cause Name]

**Root Cause:** Brief explanation of what's causing the issue

**Fix:**
```bash
# Step 1
command-to-fix-1

# Step 2
command-to-fix-2

# Step 3
command-to-fix-3
```

**Verification:**
```bash
# Command to verify fix
verify-command

# Expected output after fix:
# [What you should see]
```

**Permanent Fix:**
If this is a recurring issue, implement this permanent solution:
- Permanent action 1
- Permanent action 2
- Configuration change needed

---

### Solution 2: [Root Cause Name]

**Root Cause:** Brief explanation of what's causing the issue

**Fix:**
```bash
# Step 1
command-to-fix-1

# Step 2
command-to-fix-2
```

**Verification:**
```bash
# Command to verify fix
verify-command
```

**Permanent Fix:**
- Permanent action 1
- Permanent action 2

---

### Solution 3: [Root Cause Name]

**Root Cause:** Brief explanation of what's causing the issue

**Fix:**
```bash
# Commands to fix
command-to-fix
```

**Verification:**
```bash
# Command to verify fix
verify-command
```

**Permanent Fix:**
- Permanent action 1
- Permanent action 2

## Prevention

<!-- How to prevent this problem from happening again -->

To prevent this issue in the future:

1. **Preventive Measure 1**
   - What to do
   - How to configure
   - Monitoring to add

2. **Preventive Measure 2**
   - What to do
   - How to configure
   - Monitoring to add

3. **Preventive Measure 3**
   - What to do
   - How to configure
   - Monitoring to add

## Monitoring and Alerts

<!-- What to monitor to detect this issue early -->

**Key Metrics:**
- Metric 1: [Name] - Alert when [condition]
- Metric 2: [Name] - Alert when [condition]
- Metric 3: [Name] - Alert when [condition]

**Dashboard:**
- Link to relevant dashboard: [Dashboard URL]

**Alert Configuration:**
```yaml
# Example alert configuration
alert: [Problem Name]
condition: [When to alert]
severity: [Alert severity]
```

## When to Escalate

<!-- When should this be escalated to another team or person -->

Escalate to [team/person] if:
- Condition 1 (e.g., Problem persists after all solutions tried)
- Condition 2 (e.g., Multiple systems affected)
- Condition 3 (e.g., Data loss risk)
- Any situation involving [critical condition]

**Escalation Contacts:**
- Primary: [Contact info]
- Secondary: [Contact info]
- On-call: [How to page on-call]

**Information to gather before escalating:**
- Output of diagnostic commands
- Timeline of when issue started
- Recent changes to the system
- Number of users affected
- Business impact

## Related Issues

<!-- Links to similar problems or related troubleshooting guides -->

This problem may be confused with:
- [Related Issue 1](troubleshooting-1.md) - Similar symptoms but different cause
- [Related Issue 2](troubleshooting-2.md) - Related but distinct problem

## Additional Resources

<!-- Links to relevant documentation, logs, dashboards -->

- [System architecture diagram](../architecture/system-overview.md)
- [Log locations](../runbooks/log-locations.md)
- [Monitoring dashboard](https://monitoring.example.com)
- [Incident history](https://tickets.example.com/query)

## Known Limitations

<!-- Are there scenarios where this issue can't be resolved? -->

- Limitation 1
- Limitation 2
- Workaround for limitation

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| YYYY-MM-DD | Name | Initial creation |
| YYYY-MM-DD | Name | Added Solution 3 based on incident #123 |

---

## Template Usage Notes

### When to Create a Troubleshooting Guide

Create a guide when:
- An issue occurs multiple times
- Resolution is non-obvious
- Diagnosis requires specific steps
- Multiple potential causes exist
- Issue impacts multiple users/systems

### Troubleshooting Guide Best Practices

- **Start with symptoms:** Help people quickly identify if they have this issue
- **Make it actionable:** Every diagnostic step should lead to a decision
- **Include real output:** Show actual command output, not just descriptions
- **Cover multiple causes:** One symptom may have several root causes
- **Add prevention:** Help teams avoid the issue entirely
- **Keep it updated:** Add new solutions as they're discovered
- **Link liberally:** Connect to related guides, runbooks, and docs

### Naming Convention

Use descriptive, problem-focused names:
- `database-connection-failures.md`
- `high-memory-usage.md`
- `authentication-timeouts.md`
- `slow-api-responses.md`

### Structure Tips

- **Symptoms first:** Help people confirm they have the right guide
- **Quick checks:** Let people rule out common issues fast
- **Decision tree:** Each diagnostic step should narrow down the cause
- **Multiple solutions:** Cover all known root causes
- **Verification:** Always include how to confirm the fix worked
