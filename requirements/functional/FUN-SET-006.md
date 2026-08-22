---
id: FUN-SET-006
title: Balanced journal entries
type: functional
area: ledger
status: accepted
priority: must
mvp: true
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-f-requirements.md
architecture:
  - fundsLedger
flows:
  - collectionToLedger
adrs:
  - ADR-004
  - ADR-021
  - ADR-026
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

The MVP collection template ([ADR-026](../../docs/decisions/ADR-026-collection-ledger-posting-minimal-coa.md)) is two equal legs and must satisfy this invariant with no exemption.

## Rationale

Double-entry ledger (ADR-004); collection CoA (ADR-026).

## Acceptance Criteria

- Unbalanced journals are rejected.
- Money representation follows ADR-021.
- Collection journals (Dr clearing / Cr payable) balance at Bill `amount_minor`.

## Notes

Money movement MVP.

`implementationStatus: implemented` for **local collection + payout journals** (E1/F2 Fake evidence). Architecture `status` remains **accepted**. Not bank-cash balance proof.
