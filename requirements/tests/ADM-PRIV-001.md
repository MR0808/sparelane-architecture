---
id: ADM-PRIV-001
title: PrivilegedActionRequest reason required
type: security
status: verified
relatedRequirements:
  - FUN-ADM-005
  - NFR-SEC-010
mvp: true
---

# ADM-PRIV-001 — PrivilegedActionRequest reason required

## Purpose

Prove grant privileged requests require a compliant reason string.

## Preconditions

- Two active platform admins with `admin.grant.manage`
- Recent MFA satisfiable for requester
- Valid target User `usr_…` (not self for create)

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Request with reason 16–500 chars | `pending` PrivilegedActionRequest created; audit request create |
| 2 | Missing reason | Rejected (400/422); no pending request |
| 3 | Reason shorter than 16 chars | Rejected |
| 4 | Reason longer than 500 chars | Rejected |
| 5 | Reason containing obvious secret/token dump pattern (fixture) | Rejected or redacted per policy — must not store secrets in reason |

## Implementation status

**Specified** — not verified. Links [ADR-033](../../docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md).


## Evidence

**verified** (local platform evidence) against `sparelane-platform` (`npm run test:phase-h1`, `docs/development/phase-h1-test-evidence.md`).

Production IdP MFA satisfaction is **not** claimed (OD-024 still open).
