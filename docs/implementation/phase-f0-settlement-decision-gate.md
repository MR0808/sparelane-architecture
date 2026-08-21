# Phase F0 — Settlement obligation & eligibility decision gate (architecture)

**Status:** PASS — binding policy in [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)

Platform previously stopped F0 because settlement **substance** (amount, cardinality, merchant/KYB eligibility, creation vs ELIGIBLE) was TBD while mechanics were frozen. ADR-027 unblocks implementation.

## Platform F0 must implement

1. `LedgerPostingConfirmed` consumer on **settlement-worker**
2. Reload workflow + verify `COLLECTED` + `ledger_posting_status = CONFIRMED` + ADR-026 journal
3. `CreateSettlement` → `PENDING` with amount = merchant payable CREDIT; `business_reference = settlement:{paymentWorkflowPublicId}`; unique `payment_workflow_id`
4. Evaluate merchant status + `APPROVED_FOR_SETTLEMENT` (fake KYB locally)
5. Transition PENDING→ELIGIBLE + `SettlementEligible` when gates pass; else remain PENDING
6. Tests: one settlement per workflow; idempotent/concurrent confirmation; blocked merchant remains PENDING; no instruction; no ledger mutation

## Must not invent

SettlementBatch, SettlementInstruction, bank/provider calls, fee netting, settlement CoA journals, CANCELLED product flows.

## Still TBD (not F0 blockers)

OD-009 partner, OD-011 batch cadence, fee/reserve netting (production net-payout blocker), settlement execution CoA, payout-destination model details.
