# Runbook: [Procedure Name]

**Purpose:** [One-line description of what this runbook accomplishes]
**Owner:** [Team or person responsible]
**Last Updated:** YYYY-MM-DD
**Frequency:** [How often this is performed: On-demand, Daily, Weekly, etc.]

## Overview

<!-- Brief description of this operational procedure -->

What this runbook covers:
- What is being done
- When it should be performed
- Why it's necessary
- Expected duration

## Prerequisites

### Required Access

- [ ] Access level 1 (e.g., Production database read/write)
- [ ] Access level 2 (e.g., AWS console access)
- [ ] Access level 3 (e.g., VPN connection)

### Required Tools

- Tool 1 (version X.X or higher)
- Tool 2 (version Y.Y or higher)
- Tool 3

### Required Knowledge

- Knowledge area 1
- Knowledge area 2
- Relevant documentation links

### Pre-Flight Checklist

Before starting, ensure:
- [ ] You have reviewed the procedure completely
- [ ] Required access has been verified
- [ ] Tools are installed and working
- [ ] Backup or rollback plan is understood
- [ ] Team has been notified (if applicable)
- [ ] Maintenance window scheduled (if applicable)

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
- What to check

**If step fails:**
- What to do
- Where to look for help

---

### Step 3: [Step Name]

**Purpose:** Brief explanation of what this step does

**Commands:**
```bash
# Example command
command --option value
```

**Validation:**
- How to verify this step succeeded
- What to check

**If step fails:**
- What to do
- Where to look for help

---

<!-- Add more steps as needed -->

## Validation

<!-- How to verify the entire procedure succeeded -->

After completing all steps, verify:

1. **Check 1:** [Description]
   ```bash
   # Command to verify
   verification-command
   ```
   Expected result: [What you should see]

2. **Check 2:** [Description]
   ```bash
   # Command to verify
   verification-command
   ```
   Expected result: [What you should see]

3. **Check 3:** [Description]
   - Manual verification steps
   - What to look for

## Rollback

<!-- How to undo changes if something goes wrong -->

If you need to rollback:

### Step 1: [Rollback Action]
```bash
# Rollback command
rollback-command
```

### Step 2: [Rollback Action]
```bash
# Rollback command
rollback-command
```

### Step 3: Verification
- Verify system is back to original state
- Check that no data was lost
- Confirm services are healthy

## Troubleshooting

### Common Issues

#### Issue 1: [Problem Description]

**Symptoms:**
- Symptom 1
- Symptom 2

**Resolution:**
```bash
# Commands to fix
fix-command
```

---

#### Issue 2: [Problem Description]

**Symptoms:**
- Symptom 1
- Symptom 2

**Resolution:**
```bash
# Commands to fix
fix-command
```

---

### When to Escalate

Escalate to [team/person] if:
- Condition 1
- Condition 2
- Any unexpected behavior
- Procedure has failed multiple times

**Escalation Contact:**
- Primary: [Contact info]
- Secondary: [Contact info]
- On-call: [How to find current on-call]

## Post-Procedure

<!-- Actions to take after completing the procedure -->

After completion:
- [ ] Update monitoring dashboards
- [ ] Notify stakeholders of completion
- [ ] Document any issues encountered
- [ ] Update this runbook if procedure changed
- [ ] Close associated ticket (if applicable)

## Notes

<!-- Additional context, warnings, gotchas -->

**Important Notes:**
- Important note 1
- Important note 2
- Important note 3

**Gotchas:**
- Gotcha 1
- Gotcha 2

**Related Procedures:**
- [Link to related runbook 1](runbook-1.md)
- [Link to related runbook 2](runbook-2.md)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| YYYY-MM-DD | Name | Initial creation |
| YYYY-MM-DD | Name | Updated step 3 based on prod incident |

---

## Template Usage Notes

### When to Create a Runbook

Create a runbook for:
- Deployment procedures
- Backup and restore operations
- Incident response procedures
- System maintenance tasks
- Database migrations
- Configuration changes
- Disaster recovery procedures
- Any multi-step operational task

### Runbook Best Practices

- **Test regularly:** Run through runbook to ensure it's current
- **Keep updated:** Update immediately when procedure changes
- **Be explicit:** Don't assume knowledge, spell out every step
- **Include examples:** Show actual commands with real values
- **Add validation:** Every step should have a way to verify success
- **Plan for failure:** Include troubleshooting and rollback
- **Use checkboxes:** Help operators track progress
- **Link related docs:** Reference other runbooks and documentation

### Naming Convention

Use descriptive names:
- `production-deployment.md`
- `database-backup.md`
- `incident-response.md`
- `security-patch-rollout.md`
