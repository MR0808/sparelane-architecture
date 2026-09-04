---
id: OD-023
title: Identity provider
category: security
blockingStage: sandbox
status: resolved
related:
  - docs/decisions/ADR-032-platform-admin-authority-read-only-control-plane.md
  - docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md
  - docs/decisions/ADR-041-mvp-production-identity-provider-selection.md
  - docs/decisions/ADR-042-human-authentication-population-split.md
  - docs/decisions/ADR-043-unified-better-auth-human-authentication.md
  - docs/decisions/ADR-040-mvp-managed-secrets-and-key-management-policy.md
  - OD-024
---

# OD-023 — Identity provider

## Decision required

Human authentication architecture.

## Status

`resolved` by [ADR-043](../ADR-043-unified-better-auth-human-authentication.md) (2026-09-03).

Prior: ADR-041 Auth0-all → ADR-042 Hybrid → **ADR-043 Better Auth-all**.

## Accepted selection (summary)

| Binding | Value |
| --- | --- |
| Architecture | **Better Auth for all human authentication** (ADR-043) |
| Populations | Consumer, merchant user, platform admin |
| Authorisation SoT | Sparelane |
| Privileged MFA | Sparelane `AuthenticationAssurance.mfaSatisfiedAt` after TOTP; ≤15 min (ADR-033) |
| Auth0 | **Not** a production/MVP dependency (remove via AUTH-B6) |
| Machine API | Sparelane credentials only |
| Local/test | FakeAuthenticationProvider remains (prod-guarded) |

## Notes

Vendor/architecture decision closed. Remaining: AUTH-B* EXTERNAL_IMPLEMENTATION + BETTER_AUTH_* evidence. OD-024 open for MFA implementation/evidence — **not** production-verified by this OD close.
