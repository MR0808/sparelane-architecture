---
id: FUN-SET-001
title: Ledger confirmation before settlement eligibility
type: functional
area: settlement
status: accepted
priority: must
mvp: true
architecture:
  - settlementCore
  - fundsLedger
flows:
  - collectionToLedger
  - merchantSettlement
adrs:
  - ADR-005
  - ADR-004
contracts: []
modules:
  - Settlement
  - Ledger
tests:
  - FIN-INV-04
---
# FUN-SET-001 — Ledger confirmation before settlement eligibility

## Requirement

A collection becomes settlement-eligible only after successful ledger posting confirmation.

## Rationale

Collection before settlement (ADR-005).

## Acceptance Criteria

- No settlement eligibility without ledger confirmation.
- Failed collection cannot become settlement eligible.

## Notes

Money movement MVP.
