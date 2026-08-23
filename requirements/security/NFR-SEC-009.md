---
id: NFR-SEC-009
title: Recent MFA for privileged admin actions
type: non-functional
area: security
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - privilegedAccess
  - trustBoundaries
  - adminPrivilegedAction
adrs:
  - ADR-012
  - ADR-033
contracts:
  - docs/security/admin-access.md
modules:
  - Identity
  - Admin Control Plane
tests:
  - ADM-PRIV-002
openDecisions:
  - OD-023
  - OD-024
---
# NFR-SEC-009 — Recent MFA for privileged admin actions

## Requirement

Request, approve, and execute steps for H1 grant privileged actions must require recent MFA via provider-neutral `PrivilegedAuthenticationContext` (`authenticatedAt`, `mfaSatisfiedAt`, `methods[]`). Maximum MFA age is 15 minutes.

## Rationale

ADR-033 binds step-up assurance for HIGH-risk grant changes without locking the IdP product (OD-023/OD-024 still open).

## Acceptance Criteria

- Missing or stale `mfaSatisfiedAt` (`now - mfaSatisfiedAt > 15 minutes`) rejects request, approve, and execute.
- Rejected steps emit deny/fail audit (and security-event semantics where applicable).
- Context does not store secrets; `methods[]` are labels only.
- Production admin deployment remains blocked until OD-024 can populate this context.

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.

H0 read-only inspection does not require per-GET recent MFA beyond existing session policy (ADR-032 / NFR-SEC-004).

## Implementation notes

implementationStatus: implemented — platform H1 PASS (local evidence in sparelane-platform `npm run test:phase-h1`). Production IdP MFA still blocked by OD-024 provider readiness.
