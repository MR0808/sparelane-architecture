---
id: NFR-PRIV-001
title: Data minimisation
type: non-functional
area: privacy
status: accepted
priority: must
mvp: true
architecture:
  - dataClassification
  - dataArchitecture
flows: []
adrs: []
contracts:
  - docs/security/data-classification.md
modules:
  - Data Layer
tests: []
---
# NFR-PRIV-001 — Data minimisation

## Requirement

Sparelane must collect and retain only personal data necessary for payment reliability, settlement, and compliance purposes.

## Rationale

Privacy and financial auditability must coexist.

## Acceptance Criteria

- Privacy handling is documented relative to ledger immutability.
- Logs/classification docs forbid CHD in logs.

## Notes

Regulatory specifics remain open where TBD.
