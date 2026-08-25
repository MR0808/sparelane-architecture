---
id: FUN-SET-007
title: Immutable ledger entries
type: functional
area: ledger
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - fundsLedger
flows:
  - ledgerPostingRecovery
adrs:
  - ADR-004
  - ADR-036
contracts:
  - docs/money/ledger-model.md
modules:
  - Ledger
tests:
  - FIN-INV-07
designs:
  - SEQ-MONEY-007
---
# FUN-SET-007 — Immutable ledger entries

## Requirement

Posted ledger entries must be immutable; corrections use compensating entries only.

## Rationale

FIN-INV-07; [ADR-036](../../docs/decisions/ADR-036-financial-compensating-correction-policy.md).

## Acceptance Criteria

- Historical `journal_transactions` / `journal_entries` cannot be mutated or deleted in place.
- Corrections append compensating journals only (never UPDATE/DELETE financial history).
- Direct admin SQL-like journal editing is prohibited.

## Notes

Immutability of collection/payout journals is locally evidenced on platform. Compensating **workflow** is implemented and FIN-INV-07 is **`VERIFIED_LOCAL_FAKE`** (Track 1C + Track 1E). `implementationStatus: implemented`. Not a refund/reversal product. Not `product_verified`.
