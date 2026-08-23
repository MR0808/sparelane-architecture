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
| F2 owns | `ReconcileSettlement`; finality taxonomy; payout journal then SETTLED; unknown/not_found hold ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)) |
| F2 must not | Second transfer; SETTLED on ack; SETTLED without journal; resubmit on not_found; invent fee netting; invent ScheduledJob poll cadence; RETRY_PENDING replacement |
| Later | Business retry after FAILED; optional production batching; bank-cash statement control |

Gates: [phase-f0-settlement-decision-gate](./phase-f0-settlement-decision-gate.md), [phase-f1-settlement-execution-decision-gate](./phase-f1-settlement-execution-decision-gate.md).

## notification-worker (Phase G)

| Concern | Binding |
| --- | --- |
| Owns | Outbound **merchant** webhooks ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md)) and **consumer** notifications ([ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md)) |
| G0/G1 | Merchant catalogue, signing, SSRF, deliveries/attempts, Fake/local HTTP sink |
| G2 | Consumer contact + email projection/delivery; Fake email locally |
| G2 routes | `webhook.*` and `notification.*` — separate handlers |
| G3+ | SMS, preferences, bill reminders — deferred |
| Must not | Mutate payment/settlement/ledger; expose internal events wholesale; auto-select Fake in sandbox/production; infer auth email as destination |
| Isolated from | payment-worker / settlement-worker ([ADR-019](../decisions/ADR-019-financial-workload-isolation.md)) |