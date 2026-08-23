---
id: OD-024
title: MFA / passkey implementation
category: security
blockingStage: pilot
status: open
related:
  - docs/security/admin-access.md
  - docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md
  - docs/decisions/open/OD-023-identity-provider.md
---

# OD-024 — MFA / passkey implementation

## Decision required

MFA / passkey **implementation** (IdP/vendor, enrolment, passkey product mechanics).

## Why it matters

Admin/consumer assurance; production admin deployment; populating `PrivilegedAuthenticationContext.mfaSatisfiedAt`.

## Blocking stage

`pilot` (production admin still blocked until provider MFA can satisfy ADR-033 context)

## Status

`open` — **policy portion narrowed/resolved by ADR-033; implementation remains open.**

## Notes

**Policy resolved in [ADR-033](../ADR-033-privileged-admin-grant-management-and-approval.md):**

- Recent MFA required for privileged grant **request / approve / execute**
- Max MFA age **15 minutes** via provider-neutral `PrivilegedAuthenticationContext`
- Production admin MFA required before production admin deployment ([NFR-SEC-004](../../../requirements/security/NFR-SEC-004.md))

**Still open (do not treat as closed):**

- IdP / MFA / passkey **vendor and product** ([OD-023](./OD-023-identity-provider.md))
- How the provider surfaces `mfaSatisfiedAt` / step-up into Sparelane
- Consumer MFA/passkey product rules beyond admin privileged steps

This OD remains **open** (same pattern as OD-011 narrowed-but-open). Historical OD retained; do not delete.
