---
id: ADM-DUAL-001
title: Requester cannot approve own privileged grant action
type: security
status: specified
relatedRequirements:
  - FUN-ADM-005
  - NFR-SEC-010
mvp: true
---

# ADM-DUAL-001 — Requester cannot approve own privileged grant action

## Purpose

Prove dual-control separation for `admin.grant.create` / `admin.grant.revoke`.

## Preconditions

- Two distinct active platform admins A and B with `admin.grant.manage`
- Recent MFA available for both

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | A requests; B approves | Request → `approved` |
| 2 | A requests; A attempts approve | Rejected; remains `pending` |
| 3 | A requests; B denies | → `denied`; no grant change |
| 4 | Pending request older than 24h | → `expired`; approve rejected |
| 5 | Execute without prior approval | Rejected |

## Implementation status

**Specified** — not verified. [ADR-033](../../docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md).
