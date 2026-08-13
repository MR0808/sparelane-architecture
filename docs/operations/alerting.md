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
