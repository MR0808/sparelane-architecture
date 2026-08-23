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
  - ADR-032
  - ADR-012
contracts:
  - docs/security/admin-access.md
modules:
  - Admin surfaces
tests: []
openDecisions:
  - OD-024
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

H0 read-only admin control plane may proceed locally with gated dev/test identity per [ADR-032](../../docs/decisions/ADR-032-platform-admin-authority-read-only-control-plane.md). **Production admin deployment** remains blocked until [OD-024](../../docs/decisions/open/OD-024-mfa-passkey.md) is satisfied.
