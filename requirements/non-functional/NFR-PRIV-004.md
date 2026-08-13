---
id: NFR-PRIV-004
title: Retain financial integrity under privacy actions
type: non-functional
area: privacy
status: accepted
priority: must
mvp: true
architecture:
  - fundsLedger
  - dataArchitecture
flows:
  - consumerDeletion
adrs:
  - ADR-004
contracts: []
modules:
  - Ledger
  - Audit
tests: []
---
# NFR-PRIV-004 — Retain financial integrity under privacy actions

## Requirement

Privacy deletion/anonymisation must not mutate or delete immutable financial ledger entries required for audit; apply approved redaction patterns to personal data only.

## Rationale

Privacy and financial auditability must coexist.

## Acceptance Criteria

- Privacy handling is documented relative to ledger immutability.
- Logs/classification docs forbid CHD in logs.

## Notes

Regulatory specifics remain open where TBD.
