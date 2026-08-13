# Operational DB ↔ Ledger Consistency

## Required invariant

> A successful collection must eventually have exactly one corresponding financial posting, and financial posting must be safely recoverable after partial failure.

## Selected logical pattern

**Transactional outbox + idempotent ledger posting** — see [ADR-016](../decisions/ADR-016-operational-ledger-consistency.md).

```text
COLLECTED + outbox (atomic in Operational DB)
    → Outbox Processor
    → Event Bus
    → Idempotent ledger consumer
    → Journal posted + posting confirmed
    → Settlement eligible
```

### Consistency window

Payment Workflow may briefly be `COLLECTED` before ledger posting completes. Settlement **must not** proceed until ledger posting is confirmed.

## Candidates considered

| Pattern | Status |
| --- | --- |
| Single transactional boundary | Optional if stores share a transaction; not default assumption |
| Transactional outbox + idempotent ledger posting | **Selected default (Proposed ADR-016)** |
| Saga / workflow coordination | Not default; may apply to other flows later |

## Implementation TBD

- outbox publish mechanism (polling vs CDC)
- broker technology
- whether Operational DB and Ledger DB share a cluster
- exact posting-confirmation persistence shape

Never treat Operational DB balance fields as financial truth.
