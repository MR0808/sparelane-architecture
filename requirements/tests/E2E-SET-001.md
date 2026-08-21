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

Verify settlement lifecycle path `merchantSettlement` ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

## Preconditions

- Collected funds posted to ledger (ADR-026) and `LedgerPostingConfirmed`.
- Merchant LIVE (or sandbox-ready in local) with `APPROVED_FOR_SETTLEMENT`.
- Fake settlement partner scripted for post-F0 legs.

## Scenario

**F0 slice:**

1. `LedgerPostingConfirmed` → Settlement PENDING created (1:1 workflow)
2. Eligibility → ELIGIBLE
3. Assert amount = journal payable CREDIT; no instruction; no ledger mutation

**Full E2E (later):** batch/instruction/reconcile → SETTLED.

## Expected result

Settlement state machine and reconciliation behaviour match ADRs. F0 does not require SETTLED.

## Implementation status

`specified`
