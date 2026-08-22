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
- Unique `settlement_id` on instruction + `business_reference` / provider idempotency key = `settlement-instruction:{settlementPublicId}` ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md))
- Provider reference uniqueness where present
- Unknown-outcome → SUBMITTED + OUTCOME_UNKNOWN hold; lookup/reconcile before any resubmit (same key); F2 never resubmits from `not_found` ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md))
- Concurrent execute may hit provider twice only with same key → one logical transfer
- Concurrent `ReconcileSettlement` → one payout journal (`settlement-payout:{settlementPublicId}`) and one SETTLED
- Queue claim alone is insufficient

## Why not queue-ordering alone

Brokers redeliver, consumers restart, and providers duplicate callbacks. Correctness requires DB state + idempotency even if partitions exist ([ADR-017](../decisions/ADR-017-at-least-once-async-processing.md)).
