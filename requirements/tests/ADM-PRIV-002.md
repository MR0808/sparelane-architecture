---
id: ADM-PRIV-002
title: Recent MFA required for grant privileged steps
type: security
status: specified
relatedRequirements:
  - FUN-ADM-005
  - NFR-SEC-009
mvp: true
---

# ADM-PRIV-002 — Recent MFA required for grant privileged steps

## Purpose

Prove request, approve, and execute each require recent MFA (≤15 minutes) via server-derived `PrivilegedAuthenticationContext`.

## Preconditions

- Active platform admins with `admin.grant.manage`
- Test harness can set `mfaSatisfiedAt` age

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | `mfaSatisfiedAt` within 15 minutes on request | Request accepted |
| 2 | Missing `mfaSatisfiedAt` on request | Rejected; deny/fail audit |
| 3 | `mfaSatisfiedAt` older than 15 minutes on approve | Approve rejected |
| 4 | Fresh MFA on execute after stale MFA on prior step | Execute accepted only if execute-step MFA is fresh |
| 5 | Client sends `mfa=true` without server context | Ignored; rejected unless server context valid |

## Implementation status

**Specified** — not verified. [ADR-033](../../docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md); OD-024 provider still open.
