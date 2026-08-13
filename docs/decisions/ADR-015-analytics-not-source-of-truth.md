# ADR-015 — Derived Analytics Is Not Transactional Source of Truth

## Status

Accepted

## Context

Merchant reporting and future reliability intelligence benefit from analytical stores fed by operational/domain events. Treating analytics as authoritative for payment, settlement, ledger or security decisions would create correctness and availability hazards.

## Decision

Analytics/reporting stores are **derived systems** and cannot become authoritative for payment, settlement, ledger or security decisions.

```text
analytics outage must not stop payment correctness
```

## Consequences

### Positive

- operational independence of payment/settlement paths
- rebuildability of analytics from source events/records
- clearer lag expectations for reporting

### Negative / tradeoffs

- reporting may lag operational state
- engineers must not short-circuit decisions through warehouse queries
- future intelligence features must remain advisory/`#future` with safe boundaries

## Alternatives Considered

1. **Analytics-backed payment decisions** — rejected for MVP and as a default.
2. **Synchronous analytics dependency** — rejected due to availability coupling.
