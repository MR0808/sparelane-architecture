---
id: OD-024
title: MFA / passkey implementation
category: security
blockingStage: pilot
status: open
related:
  - docs/security/admin-access.md
  - docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md
  - docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md
  - docs/decisions/ADR-041-mvp-production-identity-provider-selection.md
  - docs/decisions/open/OD-023-identity-provider.md
---

# OD-024 — MFA / passkey implementation

## Decision required

MFA / passkey **implementation** (enrolment UX, passkey product mechanics beyond admin privileged path).

## Why it matters

Admin/consumer assurance; production admin deployment; populating `PrivilegedAuthenticationContext.mfaSatisfiedAt`.

## Blocking stage

`pilot` (production admin still blocked until Auth0 adapter MFA path is implemented)

## Status

`open` — **narrowed**:

| Portion | Status |
| --- | --- |
| Policy (when / max age) | **Resolved** by [ADR-033](../ADR-033-privileged-admin-grant-management-and-approval.md) / reused by ADR-034 |
| IdP / MFA vendor for admin | **Resolved** by [ADR-041](../ADR-041-mvp-production-identity-provider-selection.md) — **Auth0** |
| Claim mapping (`amr`/`auth_time` → `mfaSatisfiedAt`) | **Bound** in ADR-041 |
| Adapter + step-up UX implementation | **EXTERNAL_IMPLEMENTATION** (open) |
| Consumer MFA/passkey product rules beyond admin | Still product-open |

## Notes

Do not treat OD-024 as an independent EXTERNAL_VENDOR_DECISION blocker after ADR-041. Remaining work is implementation/evidence, not vendor selection.
