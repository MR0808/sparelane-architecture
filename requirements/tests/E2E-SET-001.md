---
id: E2E-SET-001
title: Successful settlement
type: e2e
status: specified
relatedRequirements:
  - FUN-SET-001
  - FUN-SET-002
relatedFlows:
  - merchantSettlement
mvp: true
---

# E2E-SET-001 — Successful settlement

## Purpose

Verify settlement lifecycle path `merchantSettlement` ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md), [ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

## Preconditions

- Collected funds posted to ledger (ADR-026) and `LedgerPostingConfirmed`.
- Merchant LIVE (or sandbox-ready in local) with `APPROVED_FOR_SETTLEMENT`.
- Default verified Fake payout destination for merchant+currency.
- Fake settlement partner scripted.

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

**Full E2E (F2+):** reconcile → SETTLED.

## Expected result

Settlement state machine matches ADRs. F1 does not require SETTLED. Duplicate/concurrent execute remains one Fake transfer.

## Implementation status

`specified`
