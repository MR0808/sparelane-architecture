---
id: ADM-GRANT-002
title: Last active admin protected
type: security
status: verified
relatedRequirements:
  - FUN-ADM-006
mvp: true
---

# ADM-GRANT-002 — Last active admin protected

## Purpose

Prove revoke cannot leave zero active `PlatformAdminGrant` rows via normal H1 APIs.

## Preconditions

- Exactly one active platform admin (or fixture that would leave zero after revoke)
- Second admin available only when testing dual-control path with ≥2 admins

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Request revoke of sole active admin | Rejected at request validation |
| 2 | Two admins; revoke of one non-last | Allowed through dual control |
| 3 | Race: second revoke after concurrent revoke leaves one | Execute fails with audit `failed`; no zero-admin state |

## Implementation status

**Specified** — not verified. [ADR-033](../../docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md).


## Evidence

**verified** (local platform evidence) against `sparelane-platform` (`npm run test:phase-h1`, `docs/development/phase-h1-test-evidence.md`).

Production IdP MFA satisfaction is **not** claimed (OD-024 still open).
