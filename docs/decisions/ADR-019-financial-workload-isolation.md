# ADR-019 — Financial Workloads Isolated from Non-Critical Workloads

## Status

Accepted

## Context

Analytics ingestion, bulk reporting and similar Tier-3 work can consume shared worker/DB/queue capacity and threaten payment/ledger/settlement correctness under load.

## Decision

Payment, ledger and settlement workloads must be **isolated operationally** from non-critical workloads such as analytics and bulk reporting.

Isolation may use (physical implementation TBD):

- separate worker pools
- queue priorities / separate queues
- concurrency limits
- resource boundaries

## Consequences

### Positive

- analytics outage or backlog cannot stop payment correctness
- clearer capacity planning by availability tier
- safer load shedding (shed Tier-3 first)

### Negative / tradeoffs

- more moving parts than a single shared worker pool
- requires disciplined queue/topic design

## Alternatives Considered

1. **Single shared worker pool for all async work** — rejected as default for production.
