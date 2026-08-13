---
id: SEC-TEN-001
title: Cross-merchant access denial
type: security
status: specified
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

`specified`
