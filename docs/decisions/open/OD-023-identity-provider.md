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
  - docs/decisions/ADR-040-mvp-managed-secrets-and-key-management-policy.md
  - OD-024
---

# OD-023 — Identity provider

## Decision required

Identity provider.

## Status

`resolved` by [ADR-041](../ADR-041-mvp-production-identity-provider-selection.md) (2026-08-25).

## Accepted selection (summary)

| Binding | Value |
| --- | --- |
| Provider | **Auth0** |
| Role | Human authentication (merchant user / consumer / admin) |
| Authorisation SoT | Sparelane (`PlatformAdminGrant`, memberships) |
| Privileged MFA | Auth0 step-up + `amr` contains `mfa` → `mfaSatisfiedAt` (≤15 min) |
| Machine API | Sparelane credentials only (not Auth0) |
| Local/test | FakeAuthenticationProvider remains |

## Notes

**Vendor decision closed.** Auth0 AuthenticationProvider adapter + admin step-up UX remain **EXTERNAL_IMPLEMENTATION**. Does **not** mean MVP acceptance. OD-024 narrowed (Auth0 MFA path) but implementation remains open.
