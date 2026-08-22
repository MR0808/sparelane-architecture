# Phase F1 — Settlement execution & payout instruction decision gate (architecture)

**Status:** PASS — binding policy in [ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)

Platform previously stopped F1 because payout destination, batching, instruction cardinality/amount/idempotency, provider taxonomy, unknown handling, and SETTLED/accounting boundaries were TBD. ADR-028 unblocks implementation.

## Platform F1 must implement

1. `MerchantPayoutDestination` (Merchants module) — token/ref, status, verified, default per merchant+currency
2. On `SettlementEligible` (or ELIGIBLE poll): resolve default destination; pre-submit rechecks (merchant, KYB, destination)
3. `CreateSettlementInstruction` — 1:1 Settlement; amount/currency from Settlement; `business_reference = settlement-instruction:{settlementPublicId}`
4. Provider-neutral `SettlementProvider.submitSettlementInstruction` + `lookupSettlementInstruction`
5. **FakeSettlementProvider** only for local/CI; production fail-closed without approved provider
6. TX A → provider call outside TX → TX B result persistence
7. `accepted` → Settlement **SUBMITTED** + `SettlementSubmitted`; stop (no SETTLED)
8. `rejected` → FAILED; `technical_error` bounded same-key retry; `unknown_outcome` → SUBMITTED + instruction OUTCOME_UNKNOWN + reconcile hold (no resubmit)
9. Tests: FIN-INV-05 local Fake exactly-once; unknown no blind resubmit; cross-merchant blocked; ack ≠ SETTLED

## Must not invent

SettlementBatch path, real banking partner, SETTLED, settlement CoA journal, fee netting, second instruction on technical retry, Fake fallback in production live money.

## Still TBD (not F1 local blockers; block production money)

OD-009 partner, OD-011 future batch cadence, fee/reserve netting. Settlement finality / payout CoA / SETTLED: [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md) / [phase-f2-settlement-finality-decision-gate](./phase-f2-settlement-finality-decision-gate.md).
