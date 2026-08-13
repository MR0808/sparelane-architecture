---
id: NFR-PRIV-003
title: Deletion and anonymisation handling
type: non-functional
area: privacy
status: accepted
priority: must
mvp: true
architecture:
  - dataArchitecture
flows:
  - consumerDeletion
adrs: []
contracts:
  - docs/security/data-classification.md
modules:
  - Data Layer
tests: []
---
# NFR-PRIV-003 — Deletion and anonymisation handling

## Requirement

Consumer deletion/anonymisation requests must be handleable without destroying required financial audit integrity.

## Rationale

Privacy and financial auditability must coexist.

## Acceptance Criteria

- Privacy handling is documented relative to ledger immutability.
- Logs/classification docs forbid CHD in logs.

## Notes

Regulatory specifics remain open where TBD.
