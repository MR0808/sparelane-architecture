# Concurrency Blueprint

## Payment Workflow (MVP)

Prefer:

- **Optimistic concurrency** (`version` column) on workflow updates
- Transactional state transitions in domain logic
- Unique constraints preventing duplicate workflows per bill

Queue partition-by-workflow is an optional later optimisation — **not** the sole correctness mechanism.

## Settlement

- Unique `payment_workflow_id` and `business_reference = settlement:{paymentWorkflowPublicId}` ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md))
- Lifecycle state guards / OCC on status transitions
- Unique settlement instruction idempotency keys (post-F0)
- Provider reference uniqueness where present
- Unknown-outcome query before resubmit

## Why not queue-ordering alone

Brokers redeliver, consumers restart, and providers duplicate callbacks. Correctness requires DB state + idempotency even if partitions exist ([ADR-017](../decisions/ADR-017-at-least-once-async-processing.md)).
