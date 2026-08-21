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
  - ADR-026
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

The MVP collection journal is defined by [ADR-026](../../docs/decisions/ADR-026-collection-ledger-posting-minimal-coa.md):

- Trigger: `PaymentCollected`
- `business_reference` = `payment-collection:{paymentWorkflowPublicId}`
- Legs: Dr processor clearing / Cr merchant payable (gross Bill amount)
- Confirmation: `ledger_posting_status` PENDING → CONFIRMED only after that journal exists

## Rationale

FIN-INV-02; outbox/consistency patterns (ADR-016); collection CoA (ADR-026).

## Acceptance Criteria

- Replay does not create a second financial posting for the same collection.
- Concurrent/duplicate `PaymentCollected` yields one journal.
- Crash after journal before CONFIRMED recovers without a second journal.
- Posting recovery is idempotent.
- Primary, backup, scheduled-retry, and Retry Now collection paths each produce one journal per collected workflow (not one per attempt).

## Notes

Money movement MVP. Fee/settlement journals are separate later templates.