# Incident Response Runbook - Rouge Cardinal Company

## Severity Levels

| Level  | Description                  | Response Time | Examples                                            |
| ------ | ---------------------------- | ------------- | --------------------------------------------------- |
| **P0** | Service down, data loss risk | 15 min        | Database unavailable, auth broken, production crash |
| **P1** | Major feature broken         | 1 hour        | Reservation system down, admin panel inaccessible   |
| **P2** | Minor feature degraded       | 4 hours       | Newsletter signup failing, image upload issues      |
| **P3** | Cosmetic/low impact          | Next sprint   | UI glitches, typos, non-critical bugs               |

## Alert Thresholds (Sentry)

| Alert Type             | Threshold       | Severity | Action                |
| ---------------------- | --------------- | -------- | --------------------- |
| Error rate spike       | >10 errors/min  | P0       | Immediate Slack alert |
| High error rate        | >50 errors/hour | P1       | Urgent Slack + email  |
| DB connection failures | Any             | P0       | Immediate alert       |
| Auth failures spike    | >5/min          | P0       | Security alert        |

## Incident Response Process

### 1. Detection (0-5 min)

- [ ] Receive alert via Slack/email
- [ ] Acknowledge incident in Sentry
- [ ] Initial assessment of impact

### 2. Triage (5-15 min)

- [ ] Identify affected systems/users
- [ ] Determine severity level (P0-P3)
- [ ] Notify stakeholders if P0/P1

### 3. Mitigation (15-60 min)

- [ ] Implement temporary fix if possible
- [ ] Rollback if deployment-related
- [ ] Enable maintenance mode if needed

### 4. Resolution (1-4 hours)

- [ ] Root cause analysis
- [ ] Implement permanent fix
- [ ] Deploy and verify fix
- [ ] Close incident in Sentry

### 5. Postmortem (24-48 hours)

- [ ] Document timeline of events
- [ ] Identify root cause
- [ ] Define preventive measures
- [ ] Update runbook if needed

## Escalation Contacts

| Role              | Contact | Availability   |
| ----------------- | ------- | -------------- |
| On-call Developer | TBD     | 24/7 for P0    |
| Tech Lead         | TBD     | Business hours |
| Project Manager   | TBD     | Business hours |

## Quick Commands

```bash
# Check Vercel deployment status
vercel ls

# Rollback to previous deployment
vercel rollback

# Check Supabase status
# Visit: https://status.supabase.com

# Check application health
curl -I https://your-domain.com/api/health

# View recent Vercel logs
vercel logs --output raw

# Force revalidate cache
curl -X POST https://your-domain.com/api/revalidate?secret=YOUR_SECRET
```

## Useful Links

- **Sentry Dashboard**: https://sentry.io/organizations/\[org]/projects/\[project]
- **Vercel Dashboard**: https://vercel.com/\[team]/rouge-cardinal
- **Supabase Dashboard**: https://supabase.com/dashboard/project/\[project-id]
- **Supabase Status**: https://status.supabase.com
- **Vercel Status**: https://www.vercel-status.com

## Common Issues & Solutions

### Auth Token Expired

**Symptoms**: Users randomly logged out, 401 errors in console

**Solution**:

1. Check Supabase auth logs
2. Verify JWT expiry settings
3. Clear browser storage and retry

### Database Connection Pool Exhausted

**Symptoms**: Slow queries, timeout errors, 500 responses

**Solution**:

1. Check active connections in Supabase dashboard
2. Identify long-running queries
3. Restart edge functions if needed

### High Memory Usage (Edge Functions)

**Symptoms**: Cold starts, timeout errors

**Solution**:

1. Check function memory in Vercel dashboard
2. Identify memory leaks in recent deployments
3. Consider splitting large functions

### Rate Limiting Triggered

**Symptoms**: 429 errors, degraded performance

**Solution**:

1. Identify source of excessive requests
2. Check for infinite loops in client code
3. Implement request batching

## Monitoring Dashboard Setup

### Sentry Alert Rules (Recommended)

1. **Critical Error Rate** (P0)
   - Condition: Error count > 10 in 1 minute
   - Action: Slack + Email + PagerDuty

2. **High Error Rate** (P1)
   - Condition: Error count > 50 in 1 hour
   - Action: Slack + Email

3. **New Issue Alert**
   - Condition: First occurrence of new error
   - Action: Slack notification

4. **Performance Degradation**
   - Condition: P95 latency > 3s for 5 minutes
   - Action: Slack notification

### Slack Channels

- `#alerts-critical` — P0 incidents only
- `#alerts-general` — P1/P2 alerts
- `#dev-notifications` — New issues, deployments

## Postmortem Template

```markdown
# Incident Postmortem: [Brief Description]

**Date**: YYYY-MM-DD
**Duration**: X hours Y minutes
**Severity**: P0/P1/P2/P3
**Author**: [Name]

## Summary

[1-2 sentence summary of what happened]

## Impact

- Users affected: X
- Revenue impact: €X (if applicable)
- Duration: X hours

## Timeline

- HH:MM - First alert received
- HH:MM - Incident acknowledged
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause

[Detailed explanation of what caused the incident]

## Resolution

[What was done to fix the issue]

## Lessons Learned

### What went well

- [Point 1]
- [Point 2]

### What went wrong

- [Point 1]
- [Point 2]

## Action Items

| Action     | Owner  | Due Date   | Status |
| ---------- | ------ | ---------- | ------ |
| [Action 1] | [Name] | YYYY-MM-DD | Open   |
| [Action 2] | [Name] | YYYY-MM-DD | Open   |
```
