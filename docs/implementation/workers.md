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
| Consumes | `LedgerPostingConfirmed` (F0); `SettlementEligible` / instruction commands (F1) |
| Creates | Settlement PENDING (1:1 workflow) per [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md) |
| Evaluates | Merchant status + `APPROVED_FOR_SETTLEMENT`; may emit `SettlementEligible` |
| F1 owns | Destination resolve/recheck; CreateSettlementInstruction; ExecuteSettlementInstruction; persist provider result; lookup on unknown ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)) |
| F0 must not | Create batch, create/send SettlementInstruction, call bank/provider, mutate ledger |
| F1 must not | SettlementBatch path; SETTLED; settlement CoA journal; real provider without OD-009; Fake fallback in production live money |
| Later (F2+) | Reconciliation → SETTLED; settlement accounting; business retry |

Gates: [phase-f0-settlement-decision-gate](./phase-f0-settlement-decision-gate.md), [phase-f1-settlement-execution-decision-gate](./phase-f1-settlement-execution-decision-gate.md).