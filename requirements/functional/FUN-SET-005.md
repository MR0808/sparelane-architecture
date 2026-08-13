---
id: FUN-SET-005
title: Exactly one ledger posting per successful collection
type: functional
area: ledger
status: accepted
priority: must
mvp: true
architecture:
  - fundsLedger
flows:
  - collectionToLedger
  - ledgerPostingRecovery
adrs:
  - ADR-004
  - ADR-016
contracts: []
modules:
  - Ledger
tests:
  - FIN-INV-02
designs:
  - SEQ-MONEY-001
  - SEQ-OPS-002
---
# FUN-SET-005 — Exactly one ledger posting per successful collection

## Requirement

Each successful collection must produce exactly one financial ledger posting (journal) for that collection.

## Rationale

FIN-INV-02; outbox/consistency patterns (ADR-016).

## Acceptance Criteria

- Replay does not create a second financial posting for the same collection.
- Posting recovery is idempotent.

## Notes

Money movement MVP.
