---
id: SEC-TEN-001
title: Cross-merchant access denial
type: security
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-SEC-001
mvp: true
---

# SEC-TEN-001 — Cross-merchant access denial

## Purpose

Merchant A cannot read/mutate Merchant B resources.

## Preconditions

- Two merchant tenants; valid and invalid credentials.

## Scenario

Attempt cross-tenant or invalid-auth access.

## Expected result

Denied with no data leakage.

## Implementation status

`specified` — full MVP tenant-isolation verification is not complete.

Phase A demonstrated a **foundation prerequisite** (Merchant A cannot read Merchant B synthetic fixture data).

Phase B (B6) adds **local product isolation evidence** for merchant/connection/payment-method IDOR paths (`sparelane-platform/tests/e2e/phase-b/boundaries.test.ts`). This is not `product_verified` and does not mark this spec verified. See [phase-b-status](../../docs/implementation/phase-b-status.md).
