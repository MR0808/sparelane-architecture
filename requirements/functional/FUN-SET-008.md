---
id: FUN-SET-008
title: Compensating corrections only
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
# FUN-SET-008 — Compensating corrections only

## Requirement

Ledger corrections must be applied only via compensating journals that preserve auditability.

## Rationale

Supports immutability while allowing error remediation.

## Acceptance Criteria

- Correction workflows create compensating entries linked to the original context.
- No silent rewrite of posted amounts.

## Notes

Money movement MVP.
