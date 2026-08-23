---
id: OD-026
title: Dual-control / break-glass workflows
category: security
blockingStage: non-blocking
status: open
related:
  - docs/security/admin-access.md
  - docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md
  - docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md
---

# OD-026 — Dual-control / break-glass workflows

## Decision required

Dual-control matrices for privileged classes beyond grants and H2 webhook replay; break-glass emergency access.

## Why it matters

Privileged financial and operational actions; incident response elevation.

## Blocking stage

`non-blocking` for H1 Option A and H2 Option A (grants dual-control bound by ADR-033; webhook replay dual-control **not required** by ADR-034)

## Status

`open` — grants dual-control resolved (ADR-033); **webhook replay dual-control resolved as not required (ADR-034)**; break-glass remains NOT SUPPORTED / deferred; other privileged mutations still open.

## Notes

**Resolved for grants by [ADR-033](../ADR-033-privileged-admin-grant-management-and-approval.md) (Option B — grants only):**

- Requester ≠ approver; both active `platform_admin` with `admin.grant.manage`
- Exactly one approval; 24h expiry; fingerprint immutability
- Applies to `admin.grant.create` and `admin.grant.revoke` only

**Resolved for H2 webhook replay by [ADR-034](../ADR-034-durable-dead-letter-and-operator-replay-policy.md):**

- Dual control **not required** for `admin.webhook.replay`
- Single active platform admin + recent MFA (≤15m) + mandatory reason is sufficient
- Merchant endpoint must continue to dedupe stable `evt_`
- Notification replay dual-control remains **deferred** with notification replay itself
- Financial replay remains **prohibited** (not a dual-control question)

**Still open / deferred:**

- Dual-control matrices for other privileged actions (suspend, disable, financial corrections, future notification replay, etc.)
- Break-glass emergency access — **NOT SUPPORTED** until explicit OD acceptance
