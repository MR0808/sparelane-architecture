---
id: FUN-SET-008
title: Compensating corrections only
type: functional
area: ledger
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - fundsLedger
  - adminPrivilegedAction
flows:
  - adminPrivilegedAction
adrs:
  - ADR-004
  - ADR-036
contracts:
  - docs/money/ledger-model.md
  - docs/security/admin-access.md
modules:
  - Ledger
  - Admin Control Plane
tests:
  - FIN-INV-07
designs:
  - SEQ-MONEY-007
---
# FUN-SET-008 — Compensating corrections only

## Requirement

Ledger corrections must be applied only via compensating journals that preserve auditability, per [ADR-036](../../docs/decisions/ADR-036-financial-compensating-correction-policy.md).

## Rationale

Supports immutability while allowing error remediation without silent rewrite or inventing refunds.

## Acceptance Criteria

- Correction workflows create compensating entries linked to the original journal (`corrects_journal_transaction_id`).
- No silent rewrite of posted amounts.
- Compensating journal is independently balanced; currency matches source; amount ≤ remaining capacity.
- Accounting-evidence only — does not rewrite PaymentWorkflow / Settlement operational state.
- No PSP refund / payout reverse in this workflow.
- Initiated only via privileged `admin.ledger.correct` (FUN-ADM-009); not Merchant API.

## Notes

`implementationStatus: implemented` — platform Track 1C implements privileged compensating journals (partial/multiple/over-correction prevention; accounting-evidence only). Related: FUN-ADM-009, NFR-SEC-012, FIN-INV-07 **`VERIFIED_LOCAL_FAKE`** (Track 1E). No PSP refund / payout reverse claim.
