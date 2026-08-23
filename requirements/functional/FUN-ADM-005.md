---
id: FUN-ADM-005
title: PrivilegedActionRequest for grant actions
type: functional
area: admin
status: accepted
implementationStatus: designed
priority: must
mvp: true
architecture:
  - privilegedAccess
  - adminPrivilegedAction
adrs:
  - ADR-012
  - ADR-032
  - ADR-033
contracts:
  - docs/security/admin-access.md
  - docs/security/audit.md
modules:
  - Identity
  - Admin Control Plane
  - Audit
tests:
  - ADM-PRIV-001
  - ADM-PRIV-002
  - ADM-DUAL-001
---
# FUN-ADM-005 — PrivilegedActionRequest for grant actions

## Requirement

Platform admin grant create and revoke must go through a persisted `PrivilegedActionRequest` workflow (request → dual-control approval → execute). Single-actor grant mutation APIs are forbidden.

## Rationale

ADR-033; prevents unilateral privilege change and ensures reason, MFA, dual control, and audit attach to a durable request.

## Acceptance Criteria

- Closed actions only: `admin.grant.create`, `admin.grant.revoke`.
- Request requires capability `admin.grant.manage`, recent MFA (≤15 minutes), mandatory reason (16–500 chars), and target User `usr_…`.
- States and transitions match ADR-033 (`pending` → `approved` → `executed`, plus `denied` / `expired` / `failed`).
- Payload fingerprint is immutable after create; approve/execute must match.
- Pending requests expire after 24 hours.
- Approved request executes at most once (idempotent).
- Durable audit on request, approve, deny, execute, and fail.
- Admin BFF uses session-authenticated `POST /admin/v1/…` only — not Merchant `/v1`.

## Notes

H0 read-only routes unchanged (ADR-032). Break-glass and impersonation are NOT SUPPORTED. Non-grant privileged mutations deferred.

## Implementation notes

implementationStatus: designed — awaiting platform H1 Option A implementation. Production admin MFA still blocked by OD-024 provider readiness.
