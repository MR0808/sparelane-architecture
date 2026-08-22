---
id: FUN-SET-004
title: Reconcile settlements
type: functional
area: settlement
status: accepted
priority: must
mvp: true
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-f-requirements.md
architecture:
  - reconciliationCore
  - settlementCore
flows:
  - merchantReconciliationFlow
  - settlementConfirmation
adrs:
  - ADR-006
  - ADR-028
  - ADR-029
contracts: []
modules:
  - Reconciliation
  - Settlement
tests:
  - E2E-SET-001
  - E2E-SET-002
  - FIN-INV-05
  - FIN-INV-06
designs:
  - SEQ-MONEY-003
  - SEQ-MONEY-005
  - SEQ-MONEY-006
---
# FUN-SET-004 — Reconcile settlements

## Requirement

Sparelane must support reconciliation of settlement instructions against provider finality outcomes and ledger postings per [ADR-029](../../docs/decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md).

## Rationale

Reconciliation closes the money-movement loop for merchants and operators without blind resubmit or SETTLED-on-ack.

## Acceptance Criteria

- Reconciliation matches settlement instruction to provider confirmation or failure using strong identity keys.
- Canonical outcomes: pending / settled / failed / not_found / unknown with binding state effects.
- `settled` requires payout journal before SETTLED; discrepancies / mismatches are operable and must not force SETTLED.
- Reconciliation never creates a new external transfer.

## Notes

Money movement MVP. Merchant ERP matching remains SEQ-MONEY-006.

`implementationStatus: implemented` for **local Fake reconcile → payout journal → SETTLED**. Not bank-statement / ERP matching. No automatic poll cadence. Architecture `status` remains **accepted**. See [phase-f-status](../../docs/implementation/phase-f-status.md).
