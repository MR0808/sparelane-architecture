# Concurrency Blueprint

## Payment Workflow (MVP)

Prefer:

- **Optimistic concurrency** (`version` column) on workflow updates
- Transactional state transitions in domain logic
- Unique constraints preventing duplicate workflows per bill

Queue partition-by-workflow is an optional later optimisation — **not** the sole correctness mechanism.

## Settlement

- Lifecycle state guards
- Unique settlement instruction idempotency keys
- Provider reference uniqueness where present
- Unknown-outcome query before resubmit

## Why not queue-ordering alone

Brokers redeliver, consumers restart, and providers duplicate callbacks. Correctness requires DB state + idempotency even if partitions exist ([ADR-017](../decisions/ADR-017-at-least-once-async-processing.md)).
