---
id: BETTER-AUTH-PRIV-001
title: Better Auth privileged MFA assurance contract
type: security
status: specified
relatedRequirements:
  - NFR-SEC-009
  - NFR-SEC-010
  - FUN-ADM-005
mvp: true
---

# BETTER-AUTH-PRIV-001 — Privileged MFA assurance contract

## Purpose

Prove Sparelane `AuthenticationAssurance` + Better Auth TOTP satisfy ADR-033 ≤15m privileged MFA without Auth0 claims (ADR-043).

## Preconditions

- Better Auth human auth wired; TOTP enrollable
- Active platform admin with grant capability
- Controllable clock for age boundary

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | No MFA / no `mfaSatisfiedAt` | Privileged denied (fail closed) |
| 2 | MFA TOTP success | Server records `mfaSatisfiedAt` for **this** sessionId |
| 3 | Age exactly 15:00.000 | Accepted |
| 4 | Age 15:00.001 | Denied |
| 5 | Session refresh / cookie renew | `mfaSatisfiedAt` unchanged |
| 6 | Re-login password-only without MFA challenge | No privileged satisfaction |
| 7 | Step-up TOTP success | Updates `mfaSatisfiedAt` |
| 8 | Client-supplied timestamp / header / body | Ignored; cannot forge |
| 9 | Second device/session | Does **not** inherit other session’s assurance |
| 10 | Revoked session | Prior assurance unusable |
| 11 | Password reset | Clears assurance; sessions revoked |
| 12 | MFA reset / disable | Clears assurance; privileged denied until new TOTP |
| 13 | Backup-code success | Does **not** set privileged `mfaSatisfiedAt` |

## Implementation status

`specified` — platform AUTH-B3/B4 + evidence required. Not `product_verified`.
