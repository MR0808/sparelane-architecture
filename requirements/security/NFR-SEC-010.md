---
id: NFR-SEC-010
title: Dual control for platform admin grant changes
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
  - Audit
tests:
  - ADM-DUAL-001
  - ADM-GRANT-001
  - ADM-GRANT-003
openDecisions:
  - OD-026
---
# NFR-SEC-010 — Dual control for platform admin grant changes

## Requirement

`admin.grant.create` and `admin.grant.revoke` require dual control: requester ≠ approver, both active `platform_admin` with `admin.grant.manage`, exactly one approval, 24-hour request expiry, and immutable request fingerprint. Break-glass is NOT SUPPORTED.

## Rationale

ADR-033 resolves OD-026 for grant actions only (Option B). Prevents unilateral privilege escalation or removal.

## Acceptance Criteria

- Requester cannot approve their own PrivilegedActionRequest.
- Approver must hold an active grant and `admin.grant.manage`.
- Pending requests expire after 24 hours without approval.
- Approve/execute fail if fingerprint does not match the original request.
- No break-glass path bypasses dual control.
- Self-grant remains prohibited even with dual control.

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.

Dual-control matrices for non-grant mutations remain deferred (OD-026 residual) except MVP ledger corrections ([ADR-036](../../docs/decisions/ADR-036-financial-compensating-correction-policy.md) / [NFR-SEC-012](./NFR-SEC-012.md)).

## Implementation notes

implementationStatus: implemented — platform H1 PASS (local evidence in sparelane-platform `npm run test:phase-h1`). Production IdP MFA still blocked by OD-024 provider readiness.
