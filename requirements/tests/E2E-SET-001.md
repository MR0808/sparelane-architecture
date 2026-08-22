---
id: E2E-SET-001
title: Successful settlement
type: e2e
status: specified
implementationEvidence: |
  Local Fake settlement evidence in sparelane-platform (F0–F2 + exit gate).
  Not real-provider / real-bank product_verified.
relatedRequirements:
  - FUN-SET-001
  - FUN-SET-002
  - FUN-SET-004
relatedFlows:
  - merchantSettlement
  - settlementConfirmation
mvp: true
---

# E2E-SET-001 — Successful settlement

## Purpose

Verify settlement lifecycle path `merchantSettlement` → `settlementConfirmation` ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md), [ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md), [ADR-029](../../docs/decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)).

## Preconditions

- Collected funds posted to ledger (ADR-026) and `LedgerPostingConfirmed`.
- Merchant LIVE (or sandbox-ready in local) with `APPROVED_FOR_SETTLEMENT`.
- Default verified Fake payout destination for merchant+currency.
- Fake settlement partner scripted for finality `settled`.

## Scenario

**F0 slice:**

1. `LedgerPostingConfirmed` → Settlement PENDING created (1:1 workflow)
2. Eligibility → ELIGIBLE
3. Assert amount = journal payable CREDIT; no instruction; no ledger mutation

**F1 slice:**

1. Resolve default destination; pre-submit rechecks pass
2. Create one SettlementInstruction (amount = Settlement gross)
3. Fake submit `accepted` → Settlement SUBMITTED + `SettlementSubmitted`
4. Assert: one instruction; one Fake transfer; not SETTLED; no SettlementBatch; no settlement CoA journal

**F2 slice:**

1. `ReconcileSettlement` (from SettlementSubmitted and/or Fake finality) → outcome `settled`
2. Append payout journal `settlement-payout:{settlementPublicId}` (Dr payable / Cr settlement-clearing)
3. Settlement → SETTLED + `SettlementSettled`
4. Assert: one collection journal; one payout journal; one transfer; one SETTLED; duplicate reconcile remains one journal

## Expected result

Settlement state machine matches ADRs. F1 alone does not require SETTLED. F2 requires finality + journal before SETTLED.

## Implementation status

`specified` — **local Fake settlement evidence** recorded in platform `npm run test:phase-f` / `phase-f-test-evidence.md`. Not `product_verified` against a real settlement partner.
