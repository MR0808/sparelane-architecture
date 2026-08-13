---
id: NFR-SEC-003
title: Centralised secrets management
type: non-functional
area: security
status: accepted
priority: must
mvp: true
architecture:
  - securityArchitecture
flows: []
adrs:
  - ADR-011
contracts:
  - docs/security/secrets-management.md
modules:
  - config/secrets
tests: []
openDecisions:
  - OD-025
---
# NFR-SEC-003 — Centralised secrets management

## Requirement

Platform secrets must be managed via centralised secrets management; secrets must not be hardcoded in source.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
