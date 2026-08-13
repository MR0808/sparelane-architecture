# Ledger Implementation Blueprint

[ADR-004](../decisions/ADR-004-double-entry-ledger.md), [ADR-013](../decisions/ADR-013-ledger-operational-separation.md), [ADR-016](../decisions/ADR-016-operational-ledger-consistency.md).

## Rules

- **Only** the Ledger module writes financial journal tables
- Append-only journals; corrections via compensating entries
- Idempotent Sparelane `business_reference` per financial effect
- Validate balanced debits/credits before commit
- No direct admin editing of journal rows
- No mutable authoritative balance column as SoT

## Derived balances

Balance Service may materialise caches for performance; caches are rebuildable from journal entries and must not be the financial source of truth.

## Collection posting

Triggered by outbox after `COLLECTED`; confirm posting back to operational workflow before settlement eligibility.
