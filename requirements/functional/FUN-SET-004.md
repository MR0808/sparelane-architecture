---
id: FUN-SET-004
title: Reconcile settlements
type: functional
area: settlement
status: accepted
priority: must
mvp: true
architecture:
  - reconciliationCore
  - settlementCore
flows:
  - merchantReconciliationFlow
  - settlementConfirmation
adrs:
  - ADR-006
contracts: []
modules:
  - Reconciliation
  - Settlement
tests: []
designs:
  - SEQ-MONEY-004
  - SEQ-MONEY-006
---
# FUN-SET-004 — Reconcile settlements

## Requirement

Sparelane must support reconciliation of settlement instructions against provider outcomes and ledger postings.

## Rationale

Reconciliation closes the money-movement loop for merchants and operators.

## Acceptance Criteria

- Reconciliation can match settlement instruction to provider confirmation or failure.
- Discrepancies are operable via runbooks.

## Notes

Money movement MVP.
