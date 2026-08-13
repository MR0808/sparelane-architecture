---
id: NFR-SEC-007
title: Durable privileged audit
type: non-functional
area: security
status: accepted
priority: must
mvp: true
architecture:
  - privilegedAccess
  - securityArchitecture
flows:
  - adminPrivilegedAction
adrs:
  - ADR-012
contracts:
  - docs/security/audit.md
modules:
  - Audit
tests: []
---
# NFR-SEC-007 — Durable privileged audit

## Requirement

Privileged administrative actions must be durably audited.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
