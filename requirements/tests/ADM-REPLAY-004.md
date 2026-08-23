---
id: ADM-REPLAY-004
title: Fresh MFA required for webhook replay
type: security
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-008
  - NFR-SEC-011
---

# ADM-REPLAY-004 — Fresh MFA required for webhook replay

## Purpose

Prove replay requires recent MFA (≤15 minutes) via PrivilegedAuthenticationContext.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | MFA within 15 minutes | Request accepted (other gates permitting) |
| 2 | Missing or stale MFA | Rejected; no `rpl_` execution |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
