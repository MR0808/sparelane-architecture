---
id: FUN-SET-006
title: Balanced journal entries
type: functional
area: ledger
status: accepted
priority: must
mvp: true
architecture:
  - fundsLedger
flows:
  - collectionToLedger
adrs:
  - ADR-004
  - ADR-021
contracts:
  - docs/contracts/money.md
modules:
  - Ledger
tests:
  - FIN-INV-03
---
# FUN-SET-006 — Balanced journal entries

## Requirement

Every journal transaction must balance (sum of debits equals sum of credits) in minor units.

## Rationale

Double-entry ledger (ADR-004).

## Acceptance Criteria

- Unbalanced journals are rejected.
- Money representation follows ADR-021.

## Notes

Money movement MVP.
