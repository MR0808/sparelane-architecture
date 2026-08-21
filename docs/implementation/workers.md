# Worker Design

## Contract

Each worker:

1. Receives one logical work item
2. Loads **current authoritative state** from Operational/Ledger DB
3. Validates state still permits the action
4. Executes side effect (provider call, ledger post, delivery) — only when in scope for that phase
5. Records durable result
6. Emits next event / outbox as designed
7. Acknowledges the message **only after** durable completion

## Rules

- Financial workers must **not** trust stale event payloads as the sole state source
- Unknown external outcomes → reconcile, do not blind retry side effects
- Idempotent handling of redelivery
- Concurrency limits per worker pool; Tier-1 isolated from notifications ([ADR-019](../decisions/ADR-019-financial-workload-isolation.md))
- Failures after bounds → DLQ with safe replay rules

## settlement-worker (Phase F)

| Concern | Binding |
| --- | --- |
| Consumes | `LedgerPostingConfirmed` (F0) |
| Creates | Settlement PENDING (1:1 workflow) per [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md) |
| Evaluates | Merchant status + `APPROVED_FOR_SETTLEMENT`; may emit `SettlementEligible` |
| F0 must not | Create batch, create/send SettlementInstruction, call bank/provider, mutate ledger |
| Later | Batching, instruction submit, reconciliation handlers |

Gate: [phase-f0-settlement-decision-gate](./phase-f0-settlement-decision-gate.md).