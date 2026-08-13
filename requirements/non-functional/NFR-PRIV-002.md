---
id: NFR-PRIV-002
title: Restrict sensitive data in logs
type: non-functional
area: privacy
status: accepted
priority: must
mvp: true
architecture:
  - securityArchitecture
flows: []
adrs:
  - ADR-010
contracts:
  - docs/security/data-classification.md
modules:
  - Platform Operations
tests: []
---
# NFR-PRIV-002 — Restrict sensitive data in logs

## Requirement

Logs must not contain raw cardholder data or unnecessary secrets/PII.

## Rationale

Privacy and financial auditability must coexist.

## Acceptance Criteria

- Privacy handling is documented relative to ledger immutability.
- Logs/classification docs forbid CHD in logs.

## Notes

Regulatory specifics remain open where TBD.
