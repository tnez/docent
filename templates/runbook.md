---
name: runbook
description: Operational procedure or troubleshooting guide
type: single-file
author: docent
version: 1.0.0
tags: [runbook, operations, procedure, troubleshooting]

variables:
  - name: procedure_name
    description: Name of the procedure
    type: string
    required: true
  - name: date
    description: Creation/update date
    type: string
    default: "{{today}}"
---
# Runbook: {{procedure_name}}

**Purpose:** [One-line description of what this accomplishes]
**Owner:** [Name or "solo"]
**Last Updated:** {{date}}
**Frequency:** On-demand | Daily | Weekly | Monthly

---

## Overview

> Brief description of this operational procedure

What this runbook covers:

- What is being done
- When it should be performed
- Why it's necessary
- Expected duration

---

## Prerequisites

### Required Access

- [ ] Access level 1 (e.g., database, admin console)
- [ ] Access level 2 (e.g., cloud provider access)
- [ ] VPN or network access

### Required Tools

- Tool 1 (version X.X or higher)
- Tool 2 (version Y.Y or higher)

### Required Knowledge

- Knowledge area 1
- Knowledge area 2
- [Relevant documentation](link)

### Pre-Flight Checklist

Before starting, ensure:

- [ ] You have reviewed the procedure completely
- [ ] Required access has been verified
- [ ] Tools are installed and working
- [ ] Backup or rollback plan is understood
- [ ] Team has been notified (if applicable)
- [ ] Maintenance window scheduled (if applicable)

---

## Procedure

### Step 1: [Step Name]

**Purpose:** Brief explanation of what this step does

**Commands:**

```bash
# Example command with explanation
command --option value

# Expected output:
# Success message or expected result
```

**Validation:**

- How to verify this step succeeded
- What to check

**If step fails:**

- What to do
- Where to look for help

---

### Step 2: [Step Name]

**Purpose:** Brief explanation of what this step does

**Commands:**

```bash
# Example command
command --option value
```

**Validation:**

- How to verify this step succeeded

**If step fails:**

- What to do

---

### Step 3: [Step Name]

Continue for each step...

---

## Validation & Verification

### Success Criteria

How do you know the procedure succeeded?

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Health Checks

Post-procedure checks:

```bash
# Check system health
health-check-command

# Expected: All systems green
```

---

## Rollback Procedure

If something goes wrong, how to revert:

### Step 1: [Rollback Step]

**Commands:**

```bash
# Rollback command
rollback-command
```

**Validation:**

- How to verify rollback succeeded

---

## Troubleshooting

### Common Issues

**Issue:** [Problem description]

**Symptoms:**

- Symptom 1
- Symptom 2

**Solution:**

- Step-by-step fix

---

**Issue:** [Another problem]

**Symptoms:**

- Symptom 1

**Solution:**

- Fix steps

---

## Notes & Warnings

> Important information to keep in mind

⚠️ **Warning:** [Critical warning about dangerous operations]

💡 **Tip:** [Helpful tip for running this procedure]

📝 **Note:** [Additional context or information]

---

## References

> Related documentation, runbooks, and resources

- [Related runbook](link)
- [Documentation](link)
- [Monitoring dashboard](link)
- [Team contact](link)

---

## Change Log

**{{date}}:** Initial version
