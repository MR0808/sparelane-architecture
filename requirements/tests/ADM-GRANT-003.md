---
id: ADM-GRANT-003
title: Grant revoke requires dual control and takes effect next request
type: security
status: specified
relatedRequirements:
  - FUN-ADM-006
  - NFR-SEC-010
mvp: true
---

# ADM-GRANT-003 — Grant revoke requires dual control and takes effect next request

## Purpose

Prove revoke is dual-controlled and removes admin authority on the next authenticated admin request without process restart.

## Preconditions

- Two active platform admins A and B; target C with active grant (or B self-revoke with A approval when not last)
- Recent MFA for actors

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Single-actor revoke API / missing approval | Rejected |
| 2 | A requests revoke of C; B approves; execute | Grant `revoked`; C’s next admin call 403 |
| 3 | Repeat execute of completed request | Idempotent; grant not toggled again |
| 4 | Self-revoke of B with A approval when ≥2 active | Allowed; B loses admin on next request |

## Implementation status

**Specified** — not verified. [ADR-033](../../docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md).
