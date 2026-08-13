---
id: NFR-SEC-001
title: Merchant tenant isolation
type: non-functional
area: security
status: accepted
priority: must
mvp: true
architecture:
  - trustBoundaries
  - dataArchitecture
flows: []
adrs:
  - ADR-014
contracts:
  - docs/data/tenant-isolation.md
modules:
  - All merchant-scoped modules
tests:
  - FIN-INV-08
  - SEC-TEN-001
---
# NFR-SEC-001 — Merchant tenant isolation

## Requirement

Sparelane must enforce merchant tenant isolation so one merchant cannot read or mutate another merchant's data.

## Rationale

ADR-014; FIN-INV-08.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
