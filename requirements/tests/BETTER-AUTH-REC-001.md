---
id: BETTER-AUTH-REC-001
title: Better Auth account recovery contract
type: security
status: specified
relatedRequirements:
  - NFR-SEC-009
mvp: true
---

# BETTER-AUTH-REC-001 — Account recovery contract

## Purpose

Prove MFA recovery cannot silently retain privileged authority (ADR-043).

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Lost authenticator with valid backup code | Recovery login possible; **no** privileged `mfaSatisfiedAt` |
| 2 | Backup codes exhausted | Cannot complete MFA login until dual-control MFA reset |
| 3 | Admin MFA reset (dual control) | Audited; all sessions revoked; assurance cleared; MFA enrollment cleared |
| 4 | MFA reset | Does **not** create or extend `PlatformAdminGrant` |
| 5 | Self-approve MFA reset | Denied |
| 6 | Revoke-all sessions | All AuthenticationAssurance for user unusable |
| 7 | Compromised account path | Password reset + MFA reset + revoke-all emits security event |

## Implementation status

`specified` — AUTH-B3+ recovery path. Not `product_verified`.
