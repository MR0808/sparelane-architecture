# Scheduling

Time-based work is triggered by a Platform Scheduler (vendor TBD) / DurableScheduler.

## Work types

- bill due actions
- pre-authorisation windows
- payment retries due (`PaymentRetryDue`)
- recovery cutoff evaluation
- settlement sweeps
- reconciliation jobs
- periodic maintenance

## Rule

> Scheduler creates commands / work items. It does **not** own workflow state or execute complex financial logic itself.

Authoritative state remains in Operational DB / Ledger DB and domain services (Payment Orchestrator, Settlement Service, etc.).

**Retry Service / Orchestrator** own business retry policy ([ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md)). The Durable Scheduler owns **when** a job fires, claim/recovery, and dispatch — not whether a PaymentWorkflow becomes `FAILED`.

Scheduler infrastructure failure (cannot publish after max dispatch attempts) is an **operational** failure of the job — it must **not** alone mark PaymentWorkflow `FAILED`.

Bill Scheduler in the logical model is an example of this pattern for bill-driven actions.

## Payment retry jobs

- Logical identity: `(workflow, paymentMethod, scheduledOrdinal)` (stable; not timestamp-only)
- Event: `PaymentRetryDue`
- Payload: public/opaque IDs + correlation; handler reloads DB
- On merchant timezone change: existing `scheduledFor` UTC values stay fixed (ADR-025)
