# Resilience Patterns

Conceptual patterns. Apply deliberately — not blindly.

## Patterns

| Pattern | Use |
| --- | --- |
| Timeout | All external calls |
| Bounded retry | Transient technical failures |
| Backoff | Reduce stampede on recovering dependencies |
| Circuit breaker | Protect workers from known-bad dependency |
| Queue buffering | Smooth load; absorb provider lag |
| Backpressure | Slow producers when queues/DBs saturate |
| Concurrency limits | Per-worker and per-aggregate controls |
| Load shedding | Drop/defer **non-critical** work first |

## Fail-safe vs shed-first

- **Payment / ledger / settlement** paths fail safe (no silent duplicate financial effects; no action without authoritative state)
- **Analytics / bulk reporting / non-critical notifications** may be shed first under pressure

See [ADR-019](../decisions/ADR-019-financial-workload-isolation.md).
