---
id: OD-026
title: Dual-control / break-glass workflows
category: security
blockingStage: non-blocking
status: open
related:
  - docs/security/admin-access.md
  - docs/decisions/ADR-033-privileged-admin-grant-management-and-approval.md
---

# OD-026 — Dual-control / break-glass workflows

## Decision required

Dual-control matrices for privileged classes beyond grants; break-glass emergency access.

## Why it matters

Privileged financial and operational actions; incident response elevation.

## Blocking stage

`non-blocking` for H1 Option A (grants dual-control bound by ADR-033)

## Status

`open` — **dual-control for platform admin grants resolved by ADR-033; break-glass remains NOT SUPPORTED / deferred H2+.**

## Notes

**Resolved for grants by [ADR-033](../ADR-033-privileged-admin-grant-management-and-approval.md) (Option B — grants only):**

- Requester ≠ approver; both active `platform_admin` with `admin.grant.manage`
- Exactly one approval; 24h expiry; fingerprint immutability
- Applies to `admin.grant.create` and `admin.grant.revoke` only

**Still open / deferred:**

- Dual-control matrices for other privileged actions (suspend, replay, financial corrections, etc.) — H2+
- **Break-glass:** **NOT SUPPORTED** in H0/H1; deferred H2+ (explicitly not invented)

This OD remains **open** for break-glass and non-grant dual-control. Historical OD retained; do not delete.
