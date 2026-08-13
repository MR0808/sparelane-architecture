---
id: FUN-SET-007
title: Immutable ledger entries
type: functional
area: ledger
status: accepted
priority: must
mvp: true
architecture:
  - fundsLedger
flows:
  - ledgerPostingRecovery
adrs:
  - ADR-004
contracts: []
modules:
  - Ledger
tests:
  - FIN-INV-07
---
# FUN-SET-007 — Immutable ledger entries

## Requirement

Posted ledger entries must be immutable; corrections use compensating entries only.

## Rationale

FIN-INV-07.

## Acceptance Criteria

- Historical entries cannot be mutated in place.
- Corrections append compensating journals.

## Notes

Money movement MVP.
