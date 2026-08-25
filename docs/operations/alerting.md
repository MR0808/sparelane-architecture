# Alerting

Actionable operational alerts. Avoid alerting on every individual soft decline.

## Categories

- payment queue backlog
- settlement failure spike
- settlement stuck in PROCESSING / unknown outcome aged
- DLQ growth
- webhook delivery failure rate / backlog
- ledger posting failure / lag after COLLECTED
- reconciliation mismatch
- provider outage signals
- database availability

## Principles

- alert on system/operational issues, not every business decline
- include runbook links
- escalate by tier (financial correctness first)
- reduce noise; prefer rate/threshold/age over single events where possible

Exact thresholds TBD.

## Phase I (ADR-035)

Alert **categories above are binding** for local pilot readiness catalogue mapping. Platform Phase I0 must map each category to existing metric signals. **Do not invent production numeric thresholds** in I0–I3. Hosted SIEM routing remains [OD-021](../decisions/open/OD-021-observability-siem.md). See [ADR-035](../decisions/ADR-035-pilot-readiness-local-evidence-policy.md).
