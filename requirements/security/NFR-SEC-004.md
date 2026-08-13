---
id: NFR-SEC-004
title: Admin MFA for privileged access
type: non-functional
area: security
status: accepted
priority: must
mvp: true
architecture:
  - privilegedAccess
flows:
  - adminPrivilegedAction
adrs:
  - ADR-012
contracts:
  - docs/security/admin-access.md
modules:
  - Admin surfaces
tests: []
---
# NFR-SEC-004 — Admin MFA for privileged access

## Requirement

Sparelane administrators must use MFA for privileged administrative access.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
