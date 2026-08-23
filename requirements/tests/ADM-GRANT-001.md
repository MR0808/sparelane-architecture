---
id: ADM-GRANT-001
title: Self-grant prohibited
type: security
status: verified
relatedRequirements:
  - FUN-ADM-006
  - NFR-SEC-010
mvp: true
---

# ADM-GRANT-001 — Self-grant prohibited

## Purpose

Prove an admin cannot request `admin.grant.create` targeting their own `usr_…`.

## Preconditions

- Active platform admin A with `admin.grant.manage`
- Recent MFA

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | A requests create for A’s `usr_…` | Rejected; no PrivilegedActionRequest |
| 2 | A requests create for distinct user B `usr_…` | Accepted (pending dual control) |

## Implementation status

**Specified** — not verified. [ADR-033](../../docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md).


## Evidence

**verified** (local platform evidence) against `sparelane-platform` (`npm run test:phase-h1`, `docs/development/phase-h1-test-evidence.md`).

Production IdP MFA satisfaction is **not** claimed (OD-024 still open).
