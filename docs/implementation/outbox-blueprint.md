# Outbox Implementation Blueprint

[ADR-016](../decisions/ADR-016-operational-ledger-consistency.md), [ADR-017](../decisions/ADR-017-at-least-once-async-processing.md).

```text
Business transaction (Operational DB)
  → outbox row (same commit)
  → publisher (polling or CDC — TBD)
  → event broker (vendor TBD)
  → idempotent consumer
```

## Rules

- Atomic write of business state + outbox row
- Publisher marks `published_at` after broker accept (at-least-once publish → duplicates possible)
- Consumers dedupe on event id and/or business keys
- Correlation / causation IDs preserved
- Publication retry with bounded backoff; poison → DLQ
- Cleanup/retention of published rows TBD
- Payload is versioned typed event — not an arbitrary dump

## Collection path invariant

`COLLECTED` may precede journal completion; settlement eligibility only after ledger posting confirmation.
