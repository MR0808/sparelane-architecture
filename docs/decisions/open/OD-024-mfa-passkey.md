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
  - docs/decisions/ADR-043-unified-better-auth-human-authentication.md
  - docs/decisions/open/OD-023-identity-provider.md
  - requirements/tests/BETTER-AUTH-PRIV-001.md
---

# OD-024 — MFA / passkey implementation

## Decision required

MFA / passkey **implementation and evidence** (enrollment UX, step-up UX, passkey product beyond MVP TOTP).

## Why it matters

Admin privileged mutations require recent MFA (`PrivilegedAuthenticationContext.mfaSatisfiedAt`).

## Blocking stage

`pilot` — production admin blocked until Better Auth TOTP + AuthenticationAssurance + LIVE/LOCAL evidence (BETTER-AUTH-PRIV-001).

## Status

`open` — **narrowed**:

| Portion | Status |
| --- | --- |
| Policy (when / max age) | **Resolved** by ADR-033 |
| Human IdP | **Resolved** — Better Auth-all ([ADR-043](../ADR-043-unified-better-auth-human-authentication.md)) |
| `mfaSatisfiedAt` source | **Bound** — Sparelane AuthenticationAssurance after verified TOTP |
| Backup codes / passkeys | Bound in ADR-043 (backup ≠ privileged; passkeys post-MVP) |
| Adapter + enrollment + step-up UX | **EXTERNAL_IMPLEMENTATION** (open) |
| Product verification | **Not** claimed — evidence pending |

## Notes

Not an EXTERNAL_VENDOR_DECISION blocker. Do **not** mark MFA `product_verified` until AUTH-B4/B7 evidence exists.
